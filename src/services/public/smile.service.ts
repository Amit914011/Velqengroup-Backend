import { VelqenSmileInquiriesModel } from '../../models/velqen_smile_inquiries.js';
import { VelqenSmileDonorsModel } from '../../models/velqen_smile_donors.js';
import { VelqenSmileHelpSeekersModel } from '../../models/velqen_smile_help_seekers.js';
import { VolunteerRegistrationsModel } from '../../models/volunteer_registrations.js';
import { UsersModel } from '../../models/users.js';
import { generatePbId } from '../../utils/idGenerator.js';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export async function submitSmileInquiry(body: any) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  if (!name || (!email && !phone)) throw new Error('Name and email or phone are required.');
  if (email && !isValidEmail(email)) throw new Error('Invalid email format.');
  if (phone && !isValidPhone(phone)) throw new Error('Invalid phone number format.');

  const doc = new VelqenSmileInquiriesModel({
    _id: generatePbId(),
    name,
    email,
    phone,
    subject: String(body.subject || '').trim(),
    message: String(body.message || '').trim(),
    status: 'New',
  });
  await doc.save();
  return { success: true, id: doc._id };
}

export async function logSmileDonor(body: any) {
  const donorName = String(body.name || body.donorName || '').trim();
  const amount = Number(body.amount || 0);
  if (!donorName) throw new Error('Donor name is required.');

  const doc = new VelqenSmileDonorsModel({
    _id: generatePbId(),
    name: donorName,
    email: String(body.email || '').trim().toLowerCase(),
    phone: String(body.phone || '').trim(),
    amount: amount > 0 ? amount : 0,
    panNumber: String(body.panNumber || '').trim(),
    address: String(body.address || '').trim(),
    receiptNumber: String(body.receiptNumber || `SMILE-${Date.now()}`),
  });
  await doc.save();
  return { success: true, id: doc._id };
}

export async function submitHelpRequest(body: any) {
  const fullName = String(body.name || body.fullName || '').trim();
  const phone = String(body.phone || '').trim();
  if (!fullName || !phone) throw new Error('Full name and phone are required.');

  const doc = new VelqenSmileHelpSeekersModel({
    _id: generatePbId(),
    name: fullName,
    phone,
    email: String(body.email || '').trim().toLowerCase(),
    category: String(body.category || 'General').trim(),
    description: String(body.description || '').trim(),
    urgency: String(body.urgency || 'Normal').trim(),
    status: 'Pending Review',
  });
  await doc.save();
  return { success: true, id: doc._id };
}

export async function registerVolunteer(body: any) {
  const firstName = String(body.firstName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  if (!firstName || !email || !phone) throw new Error('First name, email, and phone are required.');
  if (!isValidEmail(email)) throw new Error('Invalid email format.');
  if (!isValidPhone(phone)) throw new Error('Invalid phone number format.');

  const existing = await VolunteerRegistrationsModel.findOne({ email }).lean();
  if (existing) throw new Error('A volunteer application with this email already exists.');

  const doc = new VolunteerRegistrationsModel({
    _id: generatePbId(),
    firstName,
    lastName: String(body.lastName || '').trim(),
    email,
    phone,
    idType1: String(body.idType1 || '').trim(),
    idNumber1: String(body.idNumber1 || '').trim(),
    whyVolunteer: String(body.whyVolunteer || '').trim(),
    city: String(body.city || '').trim(),
    status: 'pending',
  });
  await doc.save();
  return { success: true, id: doc._id };
}

export async function reviewVolunteer(auth: any, id: string, status: 'approved' | 'rejected', notes = '') {
  if (auth.role !== 'admin' && !auth.isSuperuser) throw new Error('Admin authorization required.');
  const reg = await VolunteerRegistrationsModel.findById(id);
  if (!reg) throw new Error('Volunteer registration not found.');

  reg.status = status;
  reg.adminNotes = notes;
  reg.updated = new Date();

  if (status === 'approved' && !reg.volunteerUser) {
    const existingUser = await UsersModel.findOne({ email: reg.email }).lean();
    if (existingUser) {
      reg.volunteerUser = existingUser._id;
    } else {
      const u = new UsersModel({
        _id: generatePbId(),
        email: reg.email,
        name: `${reg.firstName} ${reg.lastName || ''}`.trim(),
        role: 'volunteer',
        employeeStatus: 'Active',
      });
      await u.save();
      reg.volunteerUser = u._id;
    }
    reg.approvedDate = new Date().toISOString();
  }

  await reg.save();
  return { success: true, id: reg._id, status: reg.status, volunteerUser: reg.volunteerUser };
}

