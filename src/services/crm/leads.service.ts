import { LeadsModel } from '../../models/leads.js';
import { UsersModel } from '../../models/users.js';
import { CompanyIncomeModel } from '../../models/company_income.js';
import { TargetsModel } from '../../models/targets.js';
import { generatePbId } from '../../utils/idGenerator.js';
import bcrypt from 'bcrypt';

const CLIENT_PREFIX = 'VQ';
const CLIENT_START = 1661;

export async function getNextClientCode(): Promise<string> {
  let nextNum = CLIENT_START;
  const leads = await LeadsModel.find({ clientCode: { $regex: `^${CLIENT_PREFIX}` } }, { clientCode: 1 }).lean();
  for (const l of leads) {
    const c = l.clientCode || '';
    const n = parseInt(c.slice(CLIENT_PREFIX.length), 10);
    if (!isNaN(n) && n + 1 > nextNum) nextNum = n + 1;
  }
  const users = await UsersModel.find({ clientCode: { $regex: `^${CLIENT_PREFIX}` } }, { clientCode: 1 }).lean();
  for (const u of users) {
    const c = u.clientCode || '';
    const n = parseInt(c.slice(CLIENT_PREFIX.length), 10);
    if (!isNaN(n) && n + 1 > nextNum) nextNum = n + 1;
  }
  return `${CLIENT_PREFIX}${nextNum}`;
}

export async function enrollLead(auth: any, leadId: string, amountNum: number) {
  const lead = await LeadsModel.findById(leadId);
  if (!lead || lead.deleted) throw new Error('Lead not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const isReception = auth.email === 'reception@velqengroup.com';
  const isOwner = lead.owner === (auth._id || auth.id);
  if (!isAdmin && !isReception && !isOwner) throw new Error('You can only enroll a lead assigned to you.');

  const leadEmail = String(lead.email || '').trim();
  if (!leadEmail) throw new Error('This lead has no email address. Add an email before enrolling.');

  const clientCode = lead.clientCode || (await getNextClientCode());
  let clientId = lead.clientUser;
  let created = false;
  const defaultPassword = 'Velqen@6531';

  if (!clientId) {
    let existingUser = await UsersModel.findOne({ email: leadEmail });
    if (existingUser) {
      clientId = existingUser._id;
    } else {
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const newUser = new UsersModel({
        _id: generatePbId(),
        email: leadEmail,
        passwordHash,
        name: lead.name || leadEmail,
        phone: lead.phone || '',
        role: 'client',
        clientCode,
        verified: true,
      });
      await newUser.save();
      clientId = newUser._id;
      created = true;
    }
  }

  lead.clientUser = clientId;
  lead.clientCode = clientCode;
  lead.leadStatus = 'Enrolled';
  if (!lead.processingStatus) lead.processingStatus = 'Not Started';
  if (amountNum > 0) lead.enrollmentAmount = amountNum;
  await lead.save();

  await syncEnrollmentIncome(lead, auth, amountNum, clientCode);
  await syncEnrollmentTarget(lead.owner, amountNum);

  return {
    clientId,
    clientCode,
    created,
    email: leadEmail,
    amount: amountNum,
    password: created ? defaultPassword : undefined,
  };
}

async function syncEnrollmentIncome(lead: any, auth: any, amount: number, clientCode: string) {
  if (amount <= 0) return;
  const now = new Date().toISOString();
  const title = `Enrollment — ${lead.name || 'Client'}`;
  const actor = auth.name || auth.email || 'Staff';

  let income = await CompanyIncomeModel.findOne({ linkedLead: lead._id });
  if (income) {
    income.amount = amount;
    income.updated = new Date();
    await income.save();
  } else {
    income = new CompanyIncomeModel({
      _id: generatePbId(),
      title,
      source: lead.name || lead.email,
      category: 'Enrollment',
      department: lead.department || '',
      incomeDate: now.slice(0, 10),
      amount,
      linkedLead: lead._id,
      submittedBy: auth._id || auth.id,
      submittedByName: actor,
      note: `Auto-recorded from client enrollment (${clientCode})`,
    });
    await income.save();
  }
}

async function syncEnrollmentTarget(ownerId: string | null | undefined, amount: number) {
  if (!ownerId || amount <= 0) return;
  const target = await TargetsModel.findOne({ employee: ownerId }).sort({ updated: -1 });
  if (target) {
    target.achievedValue = (Number(target.achievedValue) || 0) + amount;
    target.updated = new Date();
    await target.save();
  } else {
    const nt = new TargetsModel({
      _id: generatePbId(),
      employee: ownerId,
      title: 'Monthly Revenue',
      targetValue: 0,
      achievedValue: amount,
    });
    await nt.save();
  }
}

export async function editLead(auth: any, leadId: string, data: any) {
  const lead = await LeadsModel.findById(leadId);
  if (!lead || lead.deleted) throw new Error('Lead not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin) {
    const isOwner = lead.owner === (auth._id || auth.id);
    if (!isOwner) {
      const team = await UsersModel.find({ manager: auth._id || auth.id }, { _id: 1 }).lean();
      const isTeam = team.some((u) => u._id === lead.owner);
      if (!isTeam) throw new Error('This lead is not owned by your team.');
    }
  }

  const fields = ['name', 'phone', 'email', 'country', 'city', 'notes', 'leadStatus', 'inquiryType'];
  for (const f of fields) {
    if (data[f] !== undefined && data[f] !== null && data[f] !== '') {
      (lead as any)[f] = data[f];
    }
  }

  const actorName = auth.name || auth.email || 'Manager';
  lead.editedByManager = true;
  lead.editedByManagerName = actorName;
  lead.editedByManagerAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
  lead.updatedByName = actorName;
  lead.updated = new Date();
  await lead.save();

  return { success: true, id: lead._id, editedByManager: true, editedByManagerName: actorName };
}

