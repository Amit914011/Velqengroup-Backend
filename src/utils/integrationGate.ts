export type IntegrationMode = 'off' | 'sandbox' | 'live';

// Resolve the active integration execution mode
export function getIntegrationsMode(): IntegrationMode {
  const mode = (process.env.INTEGRATIONS_MODE || 'off').toLowerCase();
  if (mode === 'live' || mode === 'sandbox') return mode;
  return 'off';
}

// Guard against booting with live integrations in non-production environments
export function checkLiveStartupGuard(): void {
  const mode = getIntegrationsMode();
  if (mode === 'live') {
    const isProd = process.env.NODE_ENV === 'production';
    const host = (process.env.HOST || '').toLowerCase();
    const dbUrl = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').toLowerCase();
    const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    if (!isProd || isLocalHost || isLocalDb) {
      throw new Error('Refusing to run with live integrations in a non-production or local environment.');
    }
  }
}

// Evaluate whether an integration call is permitted by current environment policy
export function checkIntegrationAllowed(integrationName: string): { allowed: boolean; errorResponse?: any } {
  const mode = getIntegrationsMode();
  if (mode === 'off') {
    return {
      allowed: false,
      errorResponse: {
        code: 503,
        message: 'This integration is switched off in this environment.',
        data: { integration: integrationName, mode: 'off' },
      },
    };
  }
  if (mode === 'sandbox') {
    if (integrationName.toLowerCase() === 'paypal' || integrationName.toLowerCase() === 'paypal_sandbox') {
      return { allowed: true };
    }
    return {
      allowed: false,
      errorResponse: {
        code: 503,
        message: 'This integration is switched off in this environment.',
        data: { integration: integrationName, mode: 'sandbox' },
      },
    };
  }
  return { allowed: true };
}
