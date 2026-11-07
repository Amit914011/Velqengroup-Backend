import { LeadsModel } from '../../models/leads.js';
import { UsersModel } from '../../models/users.js';
import { LeadAllocationRequestsModel } from '../../models/lead_allocation_requests.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function getAllocatableLeads(auth: any) {
  const dept = auth.department || '';
  const team = await UsersModel.find({ role: 'employee', manager: auth._id || auth.id }, { _id: 1, name: 1, email: 1 }).lean();
  const teamIds = team.map((u) => u._id);
  const allowedOwners = [auth._id || auth.id, ...teamIds];

  const leads = await LeadsModel.find({
    deleted: { $ne: true },
    $or: [{ owner: { $in: allowedOwners } }, { owner: null, department: dept }, { owner: '', department: dept }],
  })
    .sort({ created: -1 })
    .limit(4000)
    .lean();

  const userMap = new Map<string, string>();
  userMap.set(auth._id || auth.id, auth.name || auth.email || 'Manager');
  team.forEach((u) => userMap.set(u._id, u.name || u.email || ''));

  return leads.map((l) => ({
    id: l._id,
    name: l.name || '',
    phone: l.phone || '',
    department: l.department || '',
    inquiryType: l.inquiryType || '',
    leadStatus: l.leadStatus || '',
    owner: l.owner || '',
    ownerName: l.owner ? userMap.get(l.owner) || 'Staff' : 'Unassigned',
    created: l.created || '',
  }));
}

export async function allocateSingleLead(auth: any, leadId: string, assignToId: string, remarks = '') {
  const team = await UsersModel.find({ role: 'employee', manager: auth._id || auth.id }, { _id: 1, name: 1, email: 1, employeeStatus: 1 }).lean();
  const teamIds = team.map((u) => u._id);
  const isSelf = assignToId === (auth._id || auth.id);
  if (!isSelf && !teamIds.includes(assignToId)) {
    throw new Error('You can only allocate leads to yourself or your own team members.');
  }

  const assignee = isSelf ? auth : team.find((u) => u._id === assignToId);
  if (!isSelf && ['Left', 'Resigned', 'Terminated'].includes(assignee?.employeeStatus || '')) {
    throw new Error('Cannot allocate leads to a resigned/exited employee.');
  }

  const lead = await LeadsModel.findById(leadId);
  if (!lead || lead.deleted) throw new Error('Lead not found.');

  const managerName = auth.name || auth.email || 'Manager';
  const assigneeName = assignee?.name || assignee?.email || '';
  lead.owner = assignToId;
  lead.updatedByName = `${managerName} (Manager allocate)`;
  lead.updated = new Date();
  await lead.save();

  const rec = new LeadAllocationRequestsModel({
    _id: generatePbId(),
    manager: auth._id || auth.id,
    managerName,
    lead: leadId,
    leadName: lead.name || '',
    leadPhone: lead.phone || '',
    leadDepartment: lead.department || '',
    assignTo: assignToId,
    assignToName: assigneeName,
    remarks,
    status: 'Approved',
    adminRemarks: `Allocated directly by ${managerName}.`,
    reviewedByName: managerName,
    reviewedAt: new Date().toISOString(),
  });
  await rec.save();

  return { success: true, id: rec._id, assigned: true, assignToName: assigneeName };
}

export async function bulkAllocateLeads(auth: any, leadIds: string[], assignToId: string, _remarks = '') {
  const team = await UsersModel.find({ role: 'employee', manager: auth._id || auth.id }, { _id: 1, name: 1, email: 1, employeeStatus: 1 }).lean();
  const isSelf = assignToId === (auth._id || auth.id);
  const assignee = isSelf ? auth : team.find((u) => u._id === assignToId);
  if (!assignee) throw new Error('Assignee is not on your team.');
  if (!isSelf && ['Left', 'Resigned', 'Terminated'].includes(assignee?.employeeStatus || '')) {
    throw new Error('Cannot allocate leads to an exited employee.');
  }

  const managerName = auth.name || auth.email || 'Manager';
  let allocated = 0;
  for (const id of leadIds) {
    const lead = await LeadsModel.findById(id);
    if (!lead || lead.deleted) continue;
    lead.owner = assignToId;
    lead.updatedByName = `${managerName} (Bulk allocate)`;
    lead.updated = new Date();
    await lead.save();
    allocated++;
  }

  return { success: true, allocated, assignToName: assignee.name || assignee.email || '' };
}

export async function getAdminAllocationRequests() {
  return LeadAllocationRequestsModel.find().sort({ created: -1 }).limit(1000).lean();
}

export async function reviewAllocationRequest(auth: any, requestId: string, action: string, adminRemarks = '') {
  const req = await LeadAllocationRequestsModel.findById(requestId);
  if (!req) throw new Error('Allocation request not found.');

  const adminName = auth.name || auth.email || 'Admin';
  const status = action === 'approve' ? 'Approved' : 'Rejected';
  req.status = status;
  req.adminRemarks = adminRemarks;
  req.reviewedByName = adminName;
  req.reviewedAt = new Date().toISOString();
  req.updated = new Date();
  await req.save();

  if (status === 'Approved' && req.lead && req.assignTo) {
    const lead = await LeadsModel.findById(req.lead);
    if (lead && !lead.deleted) {
      lead.owner = req.assignTo;
      lead.updatedByName = `${adminName} (Admin transfer)`;
      lead.updated = new Date();
      await lead.save();
    }
  }

  return { success: true, status };
}
