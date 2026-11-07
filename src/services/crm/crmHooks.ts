import { registerHook, HookContext, AfterHookContext, HookDispatcherError } from '../hookDispatcher.service.js';
import { LeadsModel } from '../../models/leads.js';
import { UsersModel } from '../../models/users.js';
import { LeadNotesModel } from '../../models/lead_notes.js';
import { NotificationsModel } from '../../models/notifications.js';
import { generatePbId } from '../../utils/idGenerator.js';

const EXIT_STATUSES = ['Left', 'Resigned', 'Terminated'];

export function registerCrmHooks(): void {
  registerHook('leads', 'beforeCreate', async (ctx: HookContext) => {
    const body = ctx.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();

    if (email && phone) {
      const dup = await LeadsModel.findOne({
        phone,
        email: { $regex: new RegExp(`^${email}$`, 'i') },
        deleted: { $ne: true },
      }).lean();
      if (dup) {
        throw new HookDispatcherError(400, 'Inquiry with this email and phone number already exists');
      }
    }

    if (body.owner) {
      const ownerUser = await UsersModel.findById(body.owner).lean();
      if (!ownerUser || EXIT_STATUSES.includes(ownerUser.employeeStatus || '')) {
        throw new HookDispatcherError(
          400,
          'Cannot assign lead to a resigned/exited employee. Please choose an active employee instead.'
        );
      }
    }
  });

  registerHook('leads', 'beforeUpdate', async (ctx: HookContext) => {
    const body = ctx.body || {};
    const existing = await LeadsModel.findById(ctx.id).lean();
    if (existing) {
      const auth = ctx.auth;
      const isAdmin = auth?.role === 'admin' || auth?.isSuperuser;
      const isReception = auth?.email === 'reception@velqengroup.com' || auth?.designation === 'receptionist';

      if (body.leadStatus && !isAdmin && existing.leadStatus === 'Enrolled' && body.leadStatus !== 'Enrolled') {
        throw new HookDispatcherError(400, 'This lead is already enrolled. Only an administrator can change its status.');
      }
      if (body.visaStage && !isAdmin && !isReception && body.visaStage !== existing.visaStage) {
        throw new HookDispatcherError(400, "Only an admin or reception can update the client's processing status.");
      }

      if (body.owner && existing.owner !== body.owner) {
        const ownerUser = await UsersModel.findById(body.owner).lean();
        if (!ownerUser || EXIT_STATUSES.includes(ownerUser.employeeStatus || '')) {
          throw new HookDispatcherError(
            400,
            'Cannot assign lead to a resigned/exited employee. Please choose an active employee instead.'
          );
        }
      }
    }
  });

  registerHook('leads', 'afterCreate', async (ctx: AfterHookContext) => {
    const lead = ctx.record;
    if (!lead) return;

    if (lead.notes && String(lead.notes).trim()) {
      const actorName = ctx.auth?.name || ctx.auth?.email || 'System';
      const note = new LeadNotesModel({
        _id: generatePbId(),
        lead: lead._id,
        author: ctx.auth?._id || ctx.auth?.id || null,
        authorName: actorName,
        content: String(lead.notes).trim(),
        kind: 'note',
      });
      await note.save();
    }

    const actorId = ctx.auth?._id || ctx.auth?.id;
    if (lead.owner && lead.owner !== actorId) {
      const u = await UsersModel.findById(lead.owner).lean();
      const notif = new NotificationsModel({
        _id: generatePbId(),
        recipient: lead.owner,
        recipientName: u?.name || '',
        title: `New lead assigned to you: ${lead.name || 'Unnamed'}`,
        message: 'A new lead has been added to your pipeline.',
        category: 'Lead',
        link: `/portal/employee?view=inquiries&leadId=${lead._id}`,
        senderName: ctx.auth?.name || 'System',
        read: false,
        meta: { leadId: lead._id, leadName: lead.name, phone: lead.phone },
      });
      await notif.save();
    }
  });

  registerHook('leads', 'afterUpdate', async (ctx: AfterHookContext) => {
    const lead = ctx.record;
    if (!lead || !lead.owner) return;
    const actorId = ctx.auth?._id || ctx.auth?.id;
    if (lead.owner !== actorId) {
      const u = await UsersModel.findById(lead.owner).lean();
      const notif = new NotificationsModel({
        _id: generatePbId(),
        recipient: lead.owner,
        recipientName: u?.name || '',
        title: `Lead assigned to you: ${lead.name || 'Unnamed'}`,
        message: 'A lead has been reassigned to your pipeline.',
        category: 'Lead',
        link: `/portal/employee?view=inquiries&leadId=${lead._id}`,
        senderName: ctx.auth?.name || 'System',
        read: false,
        meta: { leadId: lead._id, leadName: lead.name },
      });
      await notif.save();
    }
  });

  registerHook('lead_notes', 'afterCreate', async (ctx: AfterHookContext) => {
    const note = ctx.record;
    if (!note || !note.lead) return;
    await LeadsModel.updateOne(
      { _id: note.lead },
      { $set: { latestNote: note.content || '', latestNoteAt: new Date() } }
    );
  });
}

