import '../../network-guard.cjs';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { PORT } from './config/environment.js';
import { checkLiveStartupGuard } from './utils/integrationGate.js';

export const app = createApp();

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

    return server;
  } catch (err) {
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
