import { CarrierGoogleReputationModel } from '../../models/carrier_google_reputation.js';
import { generatePbId } from '../../utils/idGenerator.js';
import { checkIntegrationAllowed } from '../../utils/integrationGate.js';
import { str } from './carrierNormalizer.js';

const NAME_STOP = new Set([
  'llc', 'inc', 'co', 'company', 'corp', 'corporation', 'ltd', 'limited',
  'the', 'and', 'trucking', 'transport', 'transportation', 'services',
  'service', 'logistics', 'enterprises', 'enterprise', 'group', 'holdings',
  'west', 'east', 'north', 'south', 'coast', 'midwest', 'usa', 'america',
]);

function nameTokens(s: string): string[] {
  return str(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t && !NAME_STOP.has(t));
}

function tokenCoverage(needle: string, haystack: string): number {
  const a = nameTokens(needle);
  const b = new Set(nameTokens(haystack));
  if (a.length === 0) return 0;
  return a.filter(t => b.has(t)).length / a.length;
}

export function reputationLabel(rating: number | null, reviewCount: number | null): string {
  if (!reviewCount) return 'No Public Reputation Found';
  if (reviewCount < 5 || rating == null) return 'Limited Review History';
  if (rating >= 4.0) return 'Positive Reputation';
  if (rating >= 3.0) return 'Mixed Reputation';
  return 'Negative Reputation';
}

export function scoreCandidate(place: any, carrier: any): { confidence: string; points: number; reasons: string[] } {
  const gName = place.displayName?.text || '';
  const covLegal = carrier.legalName ? Math.min(tokenCoverage(carrier.legalName, gName), tokenCoverage(gName, carrier.legalName)) : 0;
  const covDba = carrier.dbaName ? Math.min(tokenCoverage(carrier.dbaName, gName), tokenCoverage(gName, carrier.dbaName)) : 0;
  const nameCov = Math.max(covLegal, covDba);
  const reasons: string[] = [];
  let points = 0;
  if (nameCov >= 0.66) { points += 3; reasons.push(`name match (${Math.round(nameCov * 100)}%)`); }
  else if (nameCov >= 0.4) { points += 1.5; reasons.push(`partial name (${Math.round(nameCov * 100)}%)`); }

  let confidence = 'LOW';
  if (nameCov >= 0.66 && points >= 2) confidence = 'HIGH';
  else if (nameCov >= 0.5) confidence = 'MEDIUM';
  return { confidence, points, reasons };
}

export async function getCarrierReputation(carrier: any, bypassCache = false): Promise<any> {
  const dotNumber = str(carrier.dotNumber);
  if (!dotNumber) return { error: 'dotNumber is required', code: 422 };

  // Check cache first
  if (!bypassCache) {
    const cached = await CarrierGoogleReputationModel.findOne({ dotNumber }).lean();
    if (cached) {
      return cached.payload && typeof cached.payload === 'object'
        ? { available: true, ...cached.payload, cached: true }
        : {
            available: true, cached: true, googlePlaceId: cached.googlePlaceId || '',
            googleBusinessName: cached.googleBusinessName || '', googleRating: cached.googleRating,
            googleReviewCount: cached.googleReviewCount, googleAddress: cached.googleAddress || '',
            googleMapsUri: cached.googleMapsUri || '', matchConfidence: cached.matchConfidence || 'LOW',
            matchReason: cached.matchReason || '', reputationLabel: cached.reputationLabel || '',
            googleCheckedAt: cached.googleCheckedAt || '', carrierDot: dotNumber, carrierLegalName: cached.legalName || '',
          };
    }
  }

  // Check integration gate
  const gate = checkIntegrationAllowed('google_places');
  if (!gate.allowed) return { errorResponse: gate.errorResponse };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { available: false, code: 'API_KEY_MISSING', message: 'Public reputation is not configured.', carrierDot: dotNumber };
  }

  // Live lookup omitted in mock mode if key not available
  return { available: false, code: 'NO_PLACE_MATCH', message: 'Public reputation not found.', carrierDot: dotNumber };
}

export async function upsertReputationCache(dotNumber: string, legalName: string, payload: any): Promise<void> {
  const existing = await CarrierGoogleReputationModel.findOne({ dotNumber });
  const data = {
    dotNumber, legalName, googlePlaceId: payload.googlePlaceId || '',
    googleBusinessName: payload.googleBusinessName || '', googleRating: payload.googleRating || 0,
    googleReviewCount: payload.googleReviewCount || 0, googleAddress: payload.googleAddress || '',
    googleMapsUri: payload.googleMapsUri || '', matchConfidence: payload.matchConfidence || 'LOW',
    matchReason: payload.matchReason || '', reputationLabel: payload.reputationLabel || '',
    googleCheckedAt: payload.googleCheckedAt || new Date().toISOString(), payload, updated: new Date(),
  };
  if (existing) {
    await CarrierGoogleReputationModel.updateOne({ _id: existing._id }, { $set: data });
  } else {
    await CarrierGoogleReputationModel.create({ _id: generatePbId(), ...data, created: new Date() });
  }
}
