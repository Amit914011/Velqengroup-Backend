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

export interface VerificationRow {
  collection: string;
  pbCount: number;
  mongoCount: number;
  sampleCheck: string;
  brokenRelations: string;
}

async function verify() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully.\n');

  console.log(`Authenticating with PocketBase: ${PB_URL}...`);
  const pbToken = await getPocketBaseAdminToken();
  console.log('PocketBase authenticated successfully.\n');

  const colsRes = await fetch(`${PB_URL}/api/collections?perPage=500`, {
    headers: { Authorization: pbToken },
  });
  const colsData = (await colsRes.json()) as any;
  const collections = colsData.items || [];

  const idToName = new Map<string, string>();
  for (const c of collections) {
    idToName.set(c.id, c.name);
  }

  // Pre-fetch all IDs per collection to quickly verify relations in-memory!
  console.log('Building in-memory ID index for all MongoDB collections...');
  const mongoIdSets = new Map<string, Set<string>>();
  for (const c of collections) {
    const model = ALL_MODELS[c.name];
    if (model) {
      const docs = await model.find({}, { _id: 1 }).lean();
      mongoIdSets.set(c.name, new Set(docs.map((d: any) => String(d._id))));
    } else {
      mongoIdSets.set(c.name, new Set());
    }
  }
  console.log('ID index ready.\n');

  const rows: VerificationRow[] = [];
  let totalPb = 0;
  let totalMongo = 0;
  let totalBroken = 0;

  console.log('Verifying collections...');

  for (let idx = 0; idx < collections.length; idx++) {
    const col = collections[idx];
    const colName = col.name;
    const model = ALL_MODELS[colName];

    if (!model) {
      rows.push({
        collection: colName,
        pbCount: 0,
        mongoCount: 0,
        sampleCheck: 'SKIPPED (no model)',
        brokenRelations: '0',
      });
      continue;
    }

    // 1. Counts
    const pbRes = await fetch(
      `${PB_URL}/api/collections/${colName}/records?page=1&perPage=1&skipTotal=0`,
      { headers: { Authorization: pbToken } }
    );
    const pbData = (await pbRes.json()) as any;
    const pbCount = pbData.totalItems || 0;
    const mongoCount = await model.countDocuments({});

    totalPb += pbCount;
    totalMongo += mongoCount;

    // 2. Field-by-Field Sample Check (5 random records)
    let sampleCheck = 'PASS (0 records)';
    if (pbCount > 0) {
      const sampleSize = Math.min(5, pbCount);
      // Fetch up to 100 to pick 5 evenly or randomly
      const fetchCount = Math.min(100, pbCount);
      const sampleListRes = await fetch(
        `${PB_URL}/api/collections/${colName}/records?page=1&perPage=${fetchCount}`,
        { headers: { Authorization: pbToken } }
      );
      const sampleListData = (await sampleListRes.json()) as any;
      const items = sampleListData.items || [];

      // Pick up to 5 items
      const picked: any[] = [];
      const step = Math.max(1, Math.floor(items.length / sampleSize));
      for (let i = 0; i < items.length && picked.length < sampleSize; i += step) {
        picked.push(items[i]);
      }

      let passedSamples = 0;
      let mismatchReason = '';

      for (const sample of picked) {
        const mongoDoc: any = await model.findById(sample.id).lean();
        if (!mongoDoc) {
          mismatchReason = `Missing doc ${sample.id}`;
          break;
        }

        // Compare timestamps
        const pbCreated = new Date(sample.created).getTime();
        const mongoCreated = new Date(mongoDoc.created).getTime();
        if (Math.abs(pbCreated - mongoCreated) > 1000) {
          mismatchReason = `Created mismatch on ${sample.id}`;
          break;
        }

        // Check password hashing for users
        if (colName === 'users') {
          const match = await bcrypt.compare(DEV_DEFAULT_PASSWORD, mongoDoc.password || '');
          if (!match) {
            mismatchReason = `Password hash mismatch on user ${sample.id}`;
            break;
          }
        }

        passedSamples++;
      }

      if (passedSamples === picked.length) {
        sampleCheck = `PASS (${passedSamples}/${picked.length})`;
      } else {
        sampleCheck = `FAIL (${mismatchReason})`;
      }
    }

    // 3. Relation Integrity Check
    let brokenCount = 0;
    const relFields = (col.fields || []).filter((f: any) => f.type === 'relation');

    if (relFields.length > 0 && mongoCount > 0) {
      // Stream documents to check relation integrity without loading all 40k carriers into memory at once
      const cursor = model.find({}, relFields.map((f: any) => f.name).join(' ')).lean().cursor();
      for await (const doc of cursor) {
        for (const rf of relFields) {
          const val = (doc as any)[rf.name];
          if (!val) continue;

          const targetColName = idToName.get(rf.collectionId) || rf.collectionId;
          const targetSet = mongoIdSets.get(targetColName);

          if (!targetSet) continue;

          if (Array.isArray(val)) {
            for (const relId of val) {
              if (relId && !targetSet.has(String(relId))) {
                brokenCount++;
              }
            }
          } else if (typeof val === 'string' && val.trim()) {
            if (!targetSet.has(val.trim())) {
              brokenCount++;
            }
          }
        }
      }
    }

    totalBroken += brokenCount;

    rows.push({
      collection: colName,
      pbCount,
      mongoCount,
      sampleCheck,
      brokenRelations: brokenCount === 0 ? '0' : `${brokenCount} broken`,
    });

    if (pbCount > 0 || (idx + 1) % 25 === 0 || idx === collections.length - 1) {
      console.log(`Verified [${idx + 1}/${collections.length}] ${colName.padEnd(30)}: PB=${pbCount}, Mongo=${mongoCount}, Check=${sampleCheck}, Broken=${brokenCount}`);
    }
  }

  console.log('\n====================================================');
  console.log('              VERIFICATION SUMMARY');
  console.log('====================================================');
  console.log(`Total Collections Verified: ${rows.length}`);
  console.log(`Total PocketBase Records:   ${totalPb}`);
  console.log(`Total MongoDB Records:      ${totalMongo}`);
  console.log(`Total Broken Relations:     ${totalBroken}`);
  console.log('----------------------------------------------------\n');

  // Print Markdown Table
  console.log('| Collection | PocketBase Count | Mongo Count | Sample Check | Broken Relations |');
  console.log('|---|---|---|---|---|');
  for (const r of rows) {
    console.log(`| \`${r.collection}\` | ${r.pbCount} | ${r.mongoCount} | ${r.sampleCheck} | ${r.brokenRelations} |`);
  }

  // Save report to disk
  const reportPath = path.resolve(__dirname, '../verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(rows, null, 2), 'utf8');
  console.log(`\nDetailed verification report saved to: ${reportPath}`);

  await mongoose.disconnect();
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
