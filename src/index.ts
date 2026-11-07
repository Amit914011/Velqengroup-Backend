import '../../network-guard.cjs';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { PORT } from './config/environment.js';
import { checkLiveStartupGuard } from './utils/integrationGate.js';

export const app = createApp();

function registerGracefulShutdown(server: ReturnType<typeof app.listen>): void {
  const shutdown = async () => {
    server.close(async () => {
      try {
        await mongoose.disconnect();
      } catch (_) {}
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export async function startServer() {
  try {
    checkLiveStartupGuard();
    await connectDatabase();

    const server = await new Promise<ReturnType<typeof app.listen>>(
      (resolve, reject) => {
        const instance = app.listen(PORT, () => resolve(instance));
        instance.once('error', reject);
      },
    );
    registerGracefulShutdown(server);
    return server;
  } catch (err) {
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
