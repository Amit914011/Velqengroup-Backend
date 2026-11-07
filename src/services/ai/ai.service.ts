import { IntegratedAiMessagesModel } from '../../models/_integratedAiMessages.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function verifyDocument(data: any, userId = '') {
  const expectedType = String(data.expectedType || 'Passport').trim();
  const expectedNumber = String(data.expectedNumber || 'A12345678').trim();
  const expectedName = String(data.expectedName || 'Test User').trim();

  const result = {
    verified: true,
    detectedType: expectedType,
    detectedNumber: expectedNumber,
    detectedName: expectedName,
    reason: 'Document details matched successfully.',
    isSimulated: true,
  };

  // Persist verification audit record
  await recordAiMessage(userId || 'anonymous', 'document_verification', {
    expectedType,
    expectedNumber,
    expectedName,
    result,
  });

  return result;
}

export async function recordAiMessage(userId = '', role = 'user', content: any = {}) {
  const doc = new IntegratedAiMessagesModel({
    _id: generatePbId(),
    userId: userId || 'anonymous',
    role,
    content,
    created: new Date(),
  });
  await doc.save();
  return doc;
}

