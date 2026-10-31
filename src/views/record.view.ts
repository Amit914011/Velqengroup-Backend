import { COLLECTION_NAME_TO_ID } from '../config/collections.js';

// Format Date object to PocketBase ISO standard string
function toPbIso(dateVal: any): string {
  if (!dateVal) return new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';
  const d = new Date(dateVal);
  return d.toISOString().replace('T', ' ').substring(0, 19) + 'Z';
}

const SECURITY_FIELDS = [
  'security_passcode_hash',
  'security_passcode_status',
  'security_passcode_set_at',
  'security_passcode_reset_at',
  'security_last_verified_at',
  'security_failed_attempts',
  'security_locked_until',
];

// Format a single Mongoose document into PocketBase record format
export function formatRecord(
  doc: any,
  collectionName: string,
  fields?: string[],
  auth?: { role?: string; collectionName?: string }
): Record<string, any> {
  if (!doc) return {};
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  const id = String(obj._id || obj.id || '');
  const collectionId = COLLECTION_NAME_TO_ID[collectionName] || '';

  const record: Record<string, any> = {
    ...obj,
    id,
    collectionId,
    collectionName,
    created: toPbIso(obj.created),
    updated: toPbIso(obj.updated),
  };

  delete record._id;
  delete record.__v;
  delete record.password;

  // Hide security_* fields on users from non-admin viewers
  if (collectionName === 'users') {
    const isAdmin = auth?.role === 'admin' || auth?.collectionName === '_superusers';
    if (!isAdmin) {
      for (const sf of SECURITY_FIELDS) {
        delete record[sf];
      }
    }
  }

  if (fields && fields.length > 0) {
    const projected: Record<string, any> = {
      id: record.id,
      collectionId: record.collectionId,
      collectionName: record.collectionName,
    };
    for (const f of fields) {
      if (f in record) projected[f] = record[f];
    }
    return projected;
  }

  return record;
}

