import { RecruitmentCandidatesModel } from '../../models/recruitment_candidates.js';
import { RecruitmentInterviewsModel } from '../../models/recruitment_interviews.js';
import { SheetConnectionsModel } from '../../models/sheet_connections.js';
import { UsersModel } from '../../models/users.js';
import { generatePbId } from '../../utils/idGenerator.js';

export function normalizePhone(raw?: string): string {
  if (!raw) return '';
  let p = String(raw).trim().replace(/[\s\-()]/g, '');
  if (/^\+/.test(p)) p = p.slice(1);
  return p.replace(/\D/g, '');
}

export async function manualCandidate(auth: any, body: any) {
  const managerId = auth._id || auth.id;
  const fullName = String(body.fullName || '').trim();
  const phone = normalizePhone(body.phone);
  const positionApplied = String(body.positionApplied || '').trim();

  if (!fullName) throw new Error('Full name is required.');
  if (!phone) throw new Error('Phone is required.');
  if (!positionApplied) throw new Error('Position applied is required.');

  const mgr = await UsersModel.findById(managerId).lean();
  if (!mgr || (mgr.employeeStatus || 'Active') !== 'Active') {
    throw new Error('Your account is not an active employee.');
  }

  const whatsapp = normalizePhone(body.whatsapp);
  const email = body.email ? String(body.email).trim().toLowerCase() : '';

  const filterOr: any[] = [];
  if (phone) filterOr.push({ phone });
  if (whatsapp) filterOr.push({ whatsapp });
  if (email) filterOr.push({ email });

  if (filterOr.length > 0) {
    const existing = await RecruitmentCandidatesModel.findOne({ $or: filterOr }).lean();
    if (existing) {
      return {
        created: false,
        duplicate: true,
        existing: {
          id: existing._id,
          fullName: existing.fullName,
          phone: existing.phone,
          email: existing.email,
          positionApplied: existing.positionApplied,
          status: existing.status,
          assignedManager: existing.assignedManager,
          assignedManagerName: existing.assignedManagerName,
          source: existing.source,
          mine: existing.assignedManager === managerId,
        },
      };
    }
  }

  const cid = generatePbId();
  const candidate = new RecruitmentCandidatesModel({
    _id: cid,
    fullName,
    phone,
    whatsapp,
    email,
    city: String(body.city || '').trim(),
    experience: String(body.experience || '').trim(),
    qualification: String(body.qualification || '').trim(),
    currentCompany: String(body.currentCompany || '').trim(),
    currentSalary: String(body.currentSalary || '').trim(),
    expectedSalary: String(body.expectedSalary || '').trim(),
    noticePeriod: String(body.noticePeriod || '').trim(),
    positionApplied,
    source: String(body.source || 'Manual Entry').trim(),
    remarks: String(body.remarks || '').trim(),
    status: 'New',
    department: String(body.department || mgr.department || '').trim(),
    assignedManager: managerId,
    assignedManagerName: mgr.name || mgr.email || '',
    createdBy: managerId,
    createdByName: mgr.name || mgr.email || '',
  });
  await candidate.save();

  let interviewId: string | undefined;
  if (body.interviewDate && body.interviewTime) {
    interviewId = generatePbId();
    const interview = new RecruitmentInterviewsModel({
      _id: interviewId,
      candidate: cid,
      candidateName: fullName,
      candidatePhone: phone,
      interviewDate: body.interviewDate,
      interviewTime: body.interviewTime,
      interviewer: managerId,
      interviewerName: mgr.name || mgr.email || '',
      interviewType: body.interviewType || 'In-Person',
      status: 'Scheduled',
    });
    await interview.save();
  }

  return { created: true, candidate, interviewId };
}

export async function bulkAllocateCandidates(auth: any, candidateIds: string[], managerId: string) {
  if (auth.role !== 'admin' && !auth.isSuperuser) {
    throw new Error('Only admins can bulk-allocate candidates.');
  }

  const mgr = await UsersModel.findById(managerId).lean();
  if (!mgr || (mgr.employeeStatus || 'Active') !== 'Active') {
    throw new Error('Selected manager is not active.');
  }

  const managerName = mgr.name || mgr.email || '';
  const result = await RecruitmentCandidatesModel.updateMany(
    { _id: { $in: candidateIds } },
    { $set: { assignedManager: managerId, assignedManagerName: managerName, updated: new Date() } }
  );

  return {
    success: true,
    updated: result.modifiedCount,
    managerId,
    managerName,
  };
}

export async function diagnoseConnection(token?: string, connectionId?: string) {
  const query: any = {};
  if (connectionId) query._id = connectionId;
  else if (token) query.token = token;
  else throw new Error('token or connectionId query param is required');

  const connection = await SheetConnectionsModel.findOne(query).lean();
  if (!connection) throw new Error('connection not found');

  const candidatesInDb = await RecruitmentCandidatesModel.countDocuments({ sheetConnection: connection._id });

  let assignedHiringManagerName = '';
  let assignedManagerActive = false;
  if (connection.assignedHiringManager) {
    const u = await UsersModel.findById(connection.assignedHiringManager).lean();
    if (u) {
      assignedHiringManagerName = u.name || u.email || '';
      assignedManagerActive = (u.employeeStatus || 'Active') === 'Active';
    }
  }

  const purposeNorm = String(connection.purpose || '').trim().toLowerCase();
  const isRecruitment = purposeNorm.includes('recruit') || purposeNorm.includes('hiring');

  return {
    connectionId: connection._id,
    name: connection.name,
    token: connection.token,
    purpose: connection.purpose || '',
    active: connection.active !== false,
    routing: isRecruitment ? 'recruitment' : 'sales',
    assignedHiringManager: connection.assignedHiringManager || '',
    assignedHiringManagerName,
    assignedManagerActive,
    candidatesInDb,
  };
}

