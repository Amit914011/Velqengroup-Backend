import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ALL_MODELS } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'AdminPassword123!';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/velqen';
const DEV_DEFAULT_PASSWORD = process.env.DEV_DEFAULT_PASSWORD || 'DevPassword123!';
const PB_STORAGE_DIR = process.env.PB_STORAGE_DIR || '../pocketbase/pb_data/storage';

if (process.env.ALLOW_REMOTE !== 'true') {
  const isLocal = (u: string) => u.includes('127.0.0.1') || u.includes('localhost') || u.includes('::1');
  if (!isLocal(PB_URL) || !isLocal(MONGODB_URI)) {
    throw new Error(`Refusing to run migration with non-local endpoint (PB: ${PB_URL}, Mongo: ${MONGODB_URI}) without ALLOW_REMOTE=true`);
  }
}

const shouldDrop = process.argv.includes('--drop');

// Helper to copy directory recursively
function copyDirSync(src: string, dest: string): number {
  if (!fs.existsSync(src)) return 0;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  let count = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

async function getPocketBaseAdminToken(): Promise<string> {
  const superuserEndpoint = `${PB_URL}/api/collections/_superusers/auth-with-password`;
  try {
    const res = await fetch(superuserEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD }),
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      return data.token;
    }
  } catch (_) {
    // fallback
  }

  // Fallback to legacy admins endpoint
  const adminEndpoint = `${PB_URL}/api/admins/auth-with-password`;
  const res = await fetch(adminEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Failed to authenticate with PocketBase: ${res.statusText}`);
  }
  const data = (await res.json()) as any;
  return data.token;
}

async function migrate() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('   VELQEN POCKETBASE -> MONGODB MIGRATION');
  console.log('====================================================');
  console.log(`Source PocketBase:  ${PB_URL}`);
  console.log(`Target MongoDB:     ${MONGODB_URI}`);
  console.log(`Drop existing DB:   ${shouldDrop ? 'YES (--drop active)' : 'NO (upsert mode)'}`);
  console.log('----------------------------------------------------');

  // 1. Connect MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully.\n');

  // 2. Auth with PocketBase
  console.log(`Authenticating as PocketBase superuser: ${PB_ADMIN_EMAIL}...`);
  const pbToken = await getPocketBaseAdminToken();
  console.log('PocketBase superuser authenticated successfully.\n');

  // 3. Pre-hash DEV_DEFAULT_PASSWORD for user accounts
  console.log(`Hashing default development password with bcrypt...`);
  const hashedDevPassword = await bcrypt.hash(DEV_DEFAULT_PASSWORD, 10);
  console.log('Bcrypt password generated.\n');

  // 4. Fetch collection list and schemas from PocketBase
  const colsRes = await fetch(`${PB_URL}/api/collections?perPage=500`, {
    headers: { Authorization: pbToken },
  });
  const colsData = (await colsRes.json()) as any;
  const collections = colsData.items || [];
  console.log(`Found ${collections.length} collections in PocketBase.\n`);

  let totalMigratedRecords = 0;
  const stats: Record<string, { total: number; migrated: number }> = {};

  // 5. Migrate collection by collection
  for (let idx = 0; idx < collections.length; idx++) {
    const col = collections[idx];
    const colName = col.name;
    const model = ALL_MODELS[colName];

    if (!model) {
      console.warn(`[${idx + 1}/${collections.length}] Warning: No Mongoose model for collection "${colName}". Skipping.`);
      continue;
    }

    if (shouldDrop) {
      try {
        await model.collection.drop();
      } catch (_) {
        // ignore collection does not exist error
      }
    }

    const fieldMap = new Map<string, any>();
    for (const f of col.fields || []) {
      fieldMap.set(f.name, f);
    }

    // Paged fetch
    let page = 1;
    const perPage = 500;
    let colTotal = 0;
    let colMigrated = 0;

    while (true) {
      const recsRes = await fetch(
        `${PB_URL}/api/collections/${colName}/records?page=${page}&perPage=${perPage}&skipTotal=0`,
        { headers: { Authorization: pbToken } }
      );

      if (!recsRes.ok) {
        console.error(`Error fetching page ${page} of ${colName}: ${recsRes.statusText}`);
        break;
      }

      const recsData = (await recsRes.json()) as any;
      colTotal = recsData.totalItems || 0;
      const items = recsData.items || [];

      if (items.length === 0) break;

      // Transform records
      const transformedList = items.map((rec: any) => {
        const doc: Record<string, any> = {
          _id: rec.id,
          created: rec.created ? new Date(rec.created) : new Date(),
          updated: rec.updated ? new Date(rec.updated) : new Date(),
        };

        // Transfer fields
        for (const [key, val] of Object.entries(rec)) {
          if (key === 'id' || key === 'created' || key === 'updated' || key === 'collectionId' || key === 'collectionName') {
            continue;
          }

          const fieldDef = fieldMap.get(key);
          const type = fieldDef?.type;

          if (colName === 'users' && key === 'password') {
            doc.password = hashedDevPassword;
            continue;
          }

          if (col.type === 'auth' && key === 'password') {
            // Keep or hash default password for any other auth collections
            doc.password = hashedDevPassword;
            continue;
          }

          if (type === 'date' || type === 'autodate') {
            doc[key] = val ? new Date(val as string) : null;
          } else if (type === 'number') {
            doc[key] = typeof val === 'number' ? val : (Number(val) || 0);
          } else if (type === 'bool') {
            doc[key] = Boolean(val);
          } else if (type === 'relation') {
            if (fieldDef?.maxSelect && fieldDef.maxSelect > 1) {
              doc[key] = Array.isArray(val) ? val : (val ? [val] : []);
            } else {
              doc[key] = val || null;
            }
          } else if (type === 'file' || type === 'select') {
            if (fieldDef?.maxSelect && fieldDef.maxSelect > 1) {
              doc[key] = Array.isArray(val) ? val : (val ? [val] : []);
            } else {
              doc[key] = val || '';
            }
          } else {
            doc[key] = val;
          }
        }

        // Ensure users always has bcrypt hashed password
        if (colName === 'users' && !doc.password) {
          doc.password = hashedDevPassword;
        }

        return doc;
      });

      // Write to Mongo
      if (shouldDrop) {
        await model.insertMany(transformedList, { ordered: false });
      } else {
        const ops = transformedList.map((doc: any) => ({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: doc },
            upsert: true,
          },
        }));
        await model.bulkWrite(ops, { ordered: false });
      }

      colMigrated += items.length;
      totalMigratedRecords += items.length;

      if (items.length < perPage || colMigrated >= colTotal) {
        break;
      }
      page++;
    }

    stats[colName] = { total: colTotal, migrated: colMigrated };
    if (colTotal > 0 || (idx + 1) % 25 === 0 || idx === collections.length - 1) {
      console.log(`[${idx + 1}/${collections.length}] ${colName.padEnd(30)} -> ${colMigrated}/${colTotal} records migrated`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Database records migration completed: ${totalMigratedRecords} records migrated.`);
  console.log('----------------------------------------------------');

  // 6. Copy storage files
  console.log('\nCopying storage files...');
  const resolvedStorageSrc = path.isAbsolute(PB_STORAGE_DIR)
    ? PB_STORAGE_DIR
    : path.resolve(process.cwd(), PB_STORAGE_DIR);
  const resolvedStorageDest = path.resolve(__dirname, '../storage');

  console.log(`Storage Source:      ${resolvedStorageSrc}`);
  console.log(`Storage Destination: ${resolvedStorageDest}`);

  const copiedFiles = copyDirSync(resolvedStorageSrc, resolvedStorageDest);
  console.log(`Storage copy completed: ${copiedFiles} files copied.\n`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('====================================================');
  console.log(`   MIGRATION FINISHED IN ${elapsed}s`);
  console.log('====================================================');

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
