import { WebsiteUpdatesModel } from '../../models/website_updates.js';
import { AllocationStateModel } from '../../models/allocation_state.js';
import { UsersModel } from '../../models/users.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function trackView(id: string): Promise<boolean> {
  if (!id) return false;
  try {
    await WebsiteUpdatesModel.updateOne({ _id: id }, { $inc: { views: 1 }, $set: { updated: new Date() } });
    return true;
  } catch {
    return false;
  }
}

export async function trackClick(id: string): Promise<boolean> {
  if (!id) return false;
  try {
    await WebsiteUpdatesModel.updateOne({ _id: id }, { $inc: { ctaClicks: 1 }, $set: { updated: new Date() } });
    return true;
  } catch {
    return false;
  }
}

export async function resolveOnlineInquiryOwner(department?: string): Promise<{ ownerId: string; ownerName: string }> {
  const dept = (department || '').trim();
  const stateKey = dept ? `dept:${dept}` : 'global';

  let state = await AllocationStateModel.findOne({ key: stateKey });
  if (!state) {
    state = new AllocationStateModel({
      _id: generatePbId(),
      key: stateKey,
      employee_ids: [],
      current_index: 0,
      history: [],
      last_updated: new Date().toISOString(),
    });
    await state.save();
  }

  let list: string[] = Array.isArray(state.employee_ids) ? state.employee_ids : [];
  if (list.length === 0) {
    const filter: any = {
      role: 'employee',
      deleted: { $ne: true },
      employeeStatus: { $nin: ['Left', 'Resigned', 'Terminated'] },
    };
    if (dept) filter.department = dept;
    const emps = await UsersModel.find(filter, { _id: 1 }).sort({ created: 1 }).limit(500).lean();
    list = emps.map((e) => e._id);
  }

  if (list.length === 0) {
    const fallback = await UsersModel.findOne({ role: { $in: ['admin', 'employee'] }, deleted: { $ne: true } }).lean();
    return { ownerId: fallback?._id || '', ownerName: fallback?.name || '' };
  }

  const curIdx = state.current_index || 0;
  const chosenId = list[curIdx % list.length];
  state.current_index = curIdx + 1;
  state.last_updated = new Date().toISOString();
  await state.save();

  const user = await UsersModel.findById(chosenId).lean();
  return { ownerId: chosenId, ownerName: user?.name || user?.email || '' };
}
