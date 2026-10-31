import { Request, Response } from 'express';
import { ALL_MODELS } from '../models/index.js';

// Health check endpoint conforming to PocketBase health shape
export function healthCheck(_req: Request, res: Response): void {
  res.json({
    code: 200,
    message: 'API is healthy.',
    data: {
      canBackup: false,
    },
  });
}

// Summary count of documents across all collections
export async function collectionsSummary(_req: Request, res: Response): Promise<void> {
  try {
    const counts: Record<string, number> = {};
    for (const [name, model] of Object.entries(ALL_MODELS)) {
      counts[name] = await model.countDocuments({});
    }
    res.json({ success: true, counts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

