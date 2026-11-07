import { VisitorsModel } from '../../models/visitors.js';
import { VisitorFeedbackModel } from '../../models/visitor_feedback.js';
import { ClientDocumentsModel } from '../../models/client_documents.js';
import { UsersModel } from '../../models/users.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function directUpload(auth: any, data: any) {
  const recipientId = String(data.client || data.recipient || '').trim();
  const title = String(data.title || '').trim();
  if (!recipientId) throw new Error('Please select an employee or client.');
  if (!title) throw new Error('Please add a document title.');

  const recipient = await UsersModel.findById(recipientId).lean();
  const clientName = recipient ? recipient.name || recipient.email : '';
  const clientCode = recipient ? recipient.clientCode || recipient.employeeId || '' : '';

  const doc = new ClientDocumentsModel({
    _id: generatePbId(),
    client: recipientId,
    clientName,
    clientCode,
    title,
    category: data.category || '',
    note: data.note || '',
    file: data.file || '',
    uploadedByRole: 'Reception',
    uploadedByName: auth.name || auth.email || 'Reception',
    status: 'Pending',
  });
  await doc.save();
  return { success: true, id: doc._id, clientName, clientCode };
}

export async function getManagerVisitors(auth: any) {
  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  let teamQuery: any = { role: 'employee' };
  if (!isAdmin) teamQuery.manager = auth._id || auth.id;

  const team = await UsersModel.find(teamQuery, { _id: 1, name: 1, department: 1, designation: 1, phone: 1 }).lean();
  const teamIds = team.map((u) => u._id);
  const teamMap = new Map(team.map((u) => [u._id, u]));

  const visitors = await VisitorsModel.find({ referredEmployee: { $in: teamIds } })
    .sort({ created: -1 })
    .limit(2000)
    .lean();

  const out = visitors.map((v) => {
    const emp = teamMap.get(v.referredEmployee || '') as any;
    return {
      id: v._id,
      name: v.name || '',
      phone: v.phone || '',
      purpose: v.purpose || '',
      department: (v as any).department || '',
      referredEmployee: v.referredEmployee || '',
      referredEmployeeName: emp?.name || v.referredEmployeeName || '',
      checkInAt: v.checkInAt || v.created || '',
      checkOutAt: v.checkOutAt || '',
      status: (v as any).status || '',
      rating: (v as any).rating || 0,
    };
  });

  return { visitors: out, team: Array.from(teamMap.values()), hasTeam: teamIds.length > 0 };
}

export async function getVisitorDetails(auth: any, id: string) {
  const visitor = await VisitorsModel.findById(id).lean();
  if (!visitor) throw new Error('Visitor not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin) {
    const team = await UsersModel.find({ role: 'employee', manager: auth._id || auth.id }, { _id: 1 }).lean();
    const teamIds = team.map((u) => u._id);
    if (!teamIds.includes(visitor.referredEmployee || '')) {
      throw new Error('This visitor is not linked to your team.');
    }
  }

  const history = await VisitorsModel.find({ phone: visitor.phone, _id: { $ne: visitor._id } })
    .sort({ created: -1 })
    .limit(20)
    .lean();

  return { visitor, history };
}

export async function getVisitorFeedback(_auth: any, visitorId: string) {
  return VisitorFeedbackModel.find({ visitor: visitorId }).sort({ created: -1 }).lean();
}

export async function addVisitorFeedback(auth: any, visitorId: string, data: any) {
  const visitor = await VisitorsModel.findById(visitorId).lean();
  if (!visitor) throw new Error('Visitor not found.');

  const rating = Math.max(1, Math.min(5, parseInt(data.rating, 10) || 5));
  const managerName = auth.name || auth.email || 'Manager';

  const rec = new VisitorFeedbackModel({
    _id: generatePbId(),
    visitor: visitorId,
    manager: auth._id || auth.id,
    managerName,
    visitorName: visitor.name || '',
    employeeName: visitor.referredEmployeeName || '',
    rating,
    comments: String(data.comments || '').slice(0, 2000),
    notes: String(data.notes || '').slice(0, 2000),
  });
  await rec.save();
  return rec.toObject();
}

export async function updateVisitorFeedback(auth: any, fid: string, data: any) {
  const rec = await VisitorFeedbackModel.findById(fid);
  if (!rec) throw new Error('Feedback not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && rec.manager !== (auth._id || auth.id)) {
    throw new Error('You can only edit your own feedback.');
  }

  if (data.rating != null) rec.rating = Math.max(1, Math.min(5, parseInt(data.rating, 10) || 5));
  if (data.comments !== undefined) rec.comments = String(data.comments || '').slice(0, 2000);
  if (data.notes !== undefined) rec.notes = String(data.notes || '').slice(0, 2000);
  rec.updated = new Date();
  await rec.save();
  return rec.toObject();
}

export async function deleteVisitorFeedback(auth: any, fid: string) {
  const rec = await VisitorFeedbackModel.findById(fid);
  if (!rec) throw new Error('Feedback not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && rec.manager !== (auth._id || auth.id)) {
    throw new Error('You can only delete your own feedback.');
  }

  await VisitorFeedbackModel.deleteOne({ _id: fid });
  return { success: true };
}
