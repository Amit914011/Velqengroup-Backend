import { registerHook, AfterHookContext } from '../hookDispatcher.service.js';
import { LogisticsLoadsModel } from '../../models/logistics_loads.js';
import { LogisticsNotificationsModel } from '../../models/logistics_notifications.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function createLogisticsNotification(
  ownerId: string,
  type: string,
  title: string,
  body?: string,
  relatedId?: string
): Promise<void> {
  if (!ownerId) return;
  try {
    await LogisticsNotificationsModel.create({
      _id: generatePbId(),
      owner: ownerId,
      type,
      title,
      body: body || '',
      relatedId: relatedId || '',
      read: false,
      created: new Date(),
      updated: new Date(),
    });
  } catch (_) {
    // Non-fatal
  }
}

export function registerLogisticsHooks(): void {
  // New load response -> notify load poster
  registerHook('logistics_load_responses', 'afterCreate', async (ctx: AfterHookContext) => {
    try {
      const resp = ctx.record;
      const loadId = resp?.load;
      if (!loadId) return;
      const load = await LogisticsLoadsModel.findById(loadId).lean();
      if (!load?.owner) return;
      const respondent = resp.ownerName || 'A carrier';
      const pickup = load.pickupLocation || 'Pickup';
      const delivery = load.deliveryLocation || 'Delivery';
      await createLogisticsNotification(
        String(load.owner),
        'load_response',
        'New response on your load',
        `${respondent} is interested in ${pickup} → ${delivery}.`,
        loadId
      );
    } catch (_) {}
  });

  // Job application status change -> notify applicant
  registerHook('logistics_job_applications', 'afterUpdate', async (ctx: AfterHookContext) => {
    try {
      const rec = ctx.record;
      const newStatus = ctx.body?.status;
      if (newStatus && rec?.applicant) {
        const title = rec.jobTitle || 'your application';
        await createLogisticsNotification(
          String(rec.applicant),
          'application_update',
          'Application status updated',
          `${title}: ${newStatus}.`,
          String(rec._id || rec.id)
        );
      }
    } catch (_) {}
  });

  // Dispatch request status change -> notify owner
  registerHook('logistics_dispatch_requests', 'afterUpdate', async (ctx: AfterHookContext) => {
    try {
      const rec = ctx.record;
      const newStatus = ctx.body?.status;
      if (newStatus && rec?.owner) {
        await createLogisticsNotification(
          String(rec.owner),
          'dispatch_update',
          'Dispatch request updated',
          `Status: ${newStatus}.`,
          String(rec._id || rec.id)
        );
      }
    } catch (_) {}
  });

  // Drayage request status change -> notify owner
  registerHook('logistics_drayage_requests', 'afterUpdate', async (ctx: AfterHookContext) => {
    try {
      const rec = ctx.record;
      const newStatus = ctx.body?.status;
      if (newStatus && rec?.owner) {
        await createLogisticsNotification(
          String(rec.owner),
          'drayage_update',
          'Drayage request updated',
          `Status: ${newStatus}.`,
          String(rec._id || rec.id)
        );
      }
    } catch (_) {}
  });

  // Freight request status change -> notify owner
  registerHook('logistics_freight_requests', 'afterUpdate', async (ctx: AfterHookContext) => {
    try {
      const rec = ctx.record;
      const newStatus = ctx.body?.status;
      if (newStatus && rec?.owner) {
        await createLogisticsNotification(
          String(rec.owner),
          'freight_update',
          'Freight request updated',
          `Status: ${newStatus}.`,
          String(rec._id || rec.id)
        );
      }
    } catch (_) {}
  });
}

