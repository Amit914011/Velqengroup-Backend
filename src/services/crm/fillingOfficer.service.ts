import { LeadsModel } from '../../models/leads.js';
import { UsersModel } from '../../models/users.js';
import { ClientDocumentsModel } from '../../models/client_documents.js';
import { ClientDocumentRequestsModel } from '../../models/client_document_requests.js';
import { ClientStatusHistoryModel } from '../../models/client_status_history.js';
import { ApplicationStatusHistoryModel } from '../../models/application_status_history.js';
import { generatePbId } from '../../utils/idGenerator.js';

export function isEnrolledLead(lead: any): boolean {
  if (!lead || lead.deleted) return false;
  if (lead.clientUser || String(lead.clientCode || '').trim()) return true;
  const st = String(lead.leadStatus || '').toLowerCase();
  return st.includes('enroll') || st === 'client' || st === 'active client';
}

export function isAllocatedToFO(lead: any, auth: any): boolean {
  if (!lead || !auth) return false;
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  const id = auth._id || auth.id;
  if (lead.fillingOfficer === id) return true;
  if (lead.owner === id && isEnrolledLead(lead)) return true;
  return false;
}

export async function getFOClients(auth: any) {
  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const id = auth._id || auth.id;

  let query: any = { deleted: { $ne: true } };
  if (!isAdmin) {
    query.$or = [{ fillingOfficer: id }, { owner: id, leadStatus: { $regex: /enroll|client/i } }, { owner: id, clientCode: { $ne: '' } }];
  }

  const leads = await LeadsModel.find(query).sort({ updated: -1 }).limit(2000).lean();
  return leads.filter((l) => isAdmin || isAllocatedToFO(l, auth));
}

export async function updateClientStatus(auth: any, leadId: string, newStatus: string, remarks = '') {
  const lead = await LeadsModel.findById(leadId);
  if (!lead || lead.deleted) throw new Error('Client not found.');
  if (!isAllocatedToFO(lead, auth)) throw new Error('This client is not allocated to you.');

  const prev = lead.clientStatus || 'Inquiry';
  lead.clientStatus = newStatus;
  lead.updatedByName = auth.name || auth.email || 'Filling Officer';
  lead.updated = new Date();
  await lead.save();

  const actorName = auth.name || auth.email || 'Filling Officer';
  const hist = new ClientStatusHistoryModel({
    _id: generatePbId(),
    client: lead._id,
    clientName: lead.name || '',
    clientCode: lead.clientCode || '',
    previousStatus: prev,
    newStatus,
    changedBy: auth._id || auth.id,
    changedByName: actorName,
    changedByRole: auth.role === 'admin' ? 'admin' : 'filling_officer',
    remarks,
  });
  await hist.save();

  return { success: true, previousStatus: prev, newStatus };
}

export async function updateApplicationStatus(auth: any, leadId: string, newStatus: string, remarks = '') {
  const lead = await LeadsModel.findById(leadId);
  if (!lead || lead.deleted) throw new Error('Client not found.');
  if (!isAllocatedToFO(lead, auth)) throw new Error('This client is not allocated to you.');

  const prev = lead.processingStatus || 'Not Started';
  lead.processingStatus = newStatus;
  lead.updatedByName = auth.name || auth.email || 'Filling Officer';
  lead.updated = new Date();
  await lead.save();

  const actorName = auth.name || auth.email || 'Filling Officer';
  const hist = new ApplicationStatusHistoryModel({
    _id: generatePbId(),
    client: lead._id,
    clientName: lead.name || '',
    clientCode: lead.clientCode || '',
    previousStatus: prev,
    newStatus,
    changedBy: auth._id || auth.id,
    changedByName: actorName,
    changedByRole: auth.role === 'admin' ? 'admin' : 'filling_officer',
    remarks,
  });
  await hist.save();

  return { success: true, previousStatus: prev, newStatus };
}

export async function getClientDocs(auth: any, leadId: string) {
  const lead = await LeadsModel.findById(leadId).lean();
  if (!lead || lead.deleted) throw new Error('Client not found.');
  if (!isAllocatedToFO(lead, auth)) throw new Error('This client is not allocated to you.');

  const clientKeys = [lead._id, lead.clientUser].filter(Boolean);
  const docs = await ClientDocumentsModel.find({
    deleted: { $ne: true },
    $or: [{ client: { $in: clientKeys } }, { clientCode: lead.clientCode }],
  })
    .sort({ created: -1 })
    .lean();

  const requests = await ClientDocumentRequestsModel.find({
    $or: [{ client: { $in: clientKeys } }, { lead: lead._id }, { clientCode: lead.clientCode }],
  })
    .sort({ created: -1 })
    .lean();

  return { documents: docs, requests, clientName: lead.name, clientCode: lead.clientCode, leadId: lead._id };
}

export async function createDocumentRequest(auth: any, leadId: string, data: any) {
  const lead = await LeadsModel.findById(leadId).lean();
  if (!lead || lead.deleted) throw new Error('Client not found.');
  if (!isAllocatedToFO(lead, auth)) throw new Error('This client is not allocated to you.');

  const actorName = auth.name || auth.email || 'Filling Officer';
  const reqDoc = new ClientDocumentRequestsModel({
    _id: generatePbId(),
    client: lead.clientUser || lead._id,
    clientName: lead.name || '',
    clientCode: lead.clientCode || '',
    lead: lead._id,
    title: data.title || '',
    category: data.category || '',
    message: data.message || '',
    status: 'Pending',
    requestedBy: auth._id || auth.id,
    requestedByName: actorName,
    requestedByRole: 'filling_officer',
  });
  await reqDoc.save();

  return { success: true, id: reqDoc._id };
}

export async function assignFOToClient(auth: any, leadId: string, foId: string, foName: string) {
  const lead = await LeadsModel.findById(leadId);
  if (!lead || lead.deleted) throw new Error('Lead not found.');

  const actorName = auth.name || auth.email || 'Admin';
  lead.fillingOfficer = foId;
  lead.fillingOfficerName = foName;
  lead.fillingOfficerAllocatedAt = new Date().toISOString();
  lead.fillingOfficerAllocatedByName = actorName;
  lead.updated = new Date();
  await lead.save();

  return { success: true, leadId: lead._id, fillingOfficer: foId, fillingOfficerName: foName };
}

export async function listAllFillingOfficers() {
  return UsersModel.find(
    {
      role: 'employee',
      $or: [{ department: 'Visa Immigration' }, { designation: /filling/i }, { 'permissions.viewAllocatedClients': true }],
    },
    { _id: 1, name: 1, email: 1, department: 1, designation: 1 }
  ).lean();
}

export async function getClientStatusHistory(auth: any, leadId: string) {
  const lead = await LeadsModel.findById(leadId).lean();
  if (!lead || (lead as any).deleted || !isAllocatedToFO(lead, auth)) return [];
  return ClientStatusHistoryModel.find({ client: leadId }).sort({ created: -1 }).lean();
}

export async function getApplicationStatusHistory(auth: any, leadId: string) {
  const lead = await LeadsModel.findById(leadId).lean();
  if (!lead || (lead as any).deleted || !isAllocatedToFO(lead, auth)) return [];
  return ApplicationStatusHistoryModel.find({ client: leadId }).sort({ created: -1 }).lean();
}

export async function assertClientAccess(auth: any, leadId: string) {
  const lead = await LeadsModel.findById(leadId).lean();
  const allowed = Boolean(lead && !(lead as any).deleted && isAllocatedToFO(lead, auth));
  return { allowed, leadId };
}
