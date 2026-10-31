import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CollectionRules } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rulesCache: Record<string, CollectionRules> = {};

// Load PocketBase collection rules definition from JSON
export function loadRules(): Record<string, CollectionRules> {
  if (Object.keys(rulesCache).length > 0) return rulesCache;

  const candidates = [
    path.resolve(__dirname, '../../rules/collections.rules.json'),
    path.resolve(process.cwd(), 'src/rules/collections.rules.json'),
    path.resolve(process.cwd(), 'apps/server/src/rules/collections.rules.json'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        rulesCache = JSON.parse(fs.readFileSync(c, 'utf8'));
        return rulesCache;
      } catch (_) {}
    }
  }

  return {};
}

