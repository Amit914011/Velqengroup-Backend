
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { PORT } from './config/environment.js';

export const app = createApp();

export async function startServer() {
  try {
    await connectDatabase();

    console.log('✅ MongoDB connected successfully');

    const server = await new Promise<ReturnType<typeof app.listen>>(
      (resolve, reject) => {
        const instance = app.listen(PORT, () => resolve(instance));
        instance.once('error', reject);
      },
    );

    console.log('🚀 Server is running successfully');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);

    return server;
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
