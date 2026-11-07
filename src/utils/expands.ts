import { Model } from 'mongoose';
import { ALL_MODELS } from '../models/index.js';
import { formatRecord } from '../views/record.view.js';

// Populate relation expansions across record items
export async function populateExpands(
  items: any[],
  expandFields: string[],
  model: Model<any>,
  auth?: any
): Promise<void> {
  if (!items || items.length === 0 || !expandFields || expandFields.length === 0) return;

  for (const expField of expandFields) {
    const schemaPath = model.schema.path(expField) as any;
    const refTarget = schemaPath?.options?.ref || schemaPath?.caster?.options?.ref;
    if (!refTarget || !ALL_MODELS[refTarget]) continue;

    const targetModel = ALL_MODELS[refTarget];
    const idSet = new Set<string>();

    for (const item of items) {
      const val = item[expField];
      if (Array.isArray(val)) {
        val.forEach((id: string) => id && idSet.add(id));
      } else if (typeof val === 'string' && val) {
        idSet.add(val);
      }
    }

    if (idSet.size === 0) continue;

    const relatedDocs = await targetModel.find({ _id: { $in: Array.from(idSet) } }).lean();
    const relatedMap = new Map<string, any>();
    for (const doc of relatedDocs) {
      relatedMap.set(String(doc._id), formatRecord(doc, refTarget, undefined, auth));
    }

    for (const item of items) {
      const val = item[expField];
      if (!item.expand) item.expand = {};
      if (Array.isArray(val)) {
        item.expand[expField] = val.map((id: string) => relatedMap.get(id)).filter(Boolean);
      } else if (typeof val === 'string' && val) {
        item.expand[expField] = relatedMap.get(val) || null;
      }
    }
  }
}

