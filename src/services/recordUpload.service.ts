import { saveUploadedFile, deleteStoredFile } from './storage.service.js';

const FILE_FIELD_NAMES = new Set([
  'avatar',
  'aadharFile',
  'panFile',
  'bankFile',
  'attachment',
  'file',
  'idProofFile',
  'paymentScreenshot',
  'screenshot',
  'ffDocument',
  'nocDocument',
  'acknowledgementDocument',
  'aadharImage',
  'govIdImage',
  'addressProofImage',
  'idDocument1',
  'idDocument2',
  'featuredImage',
  'additionalImages',
  'images',
]);

// Persist uploaded multipart files and map them to record field names
export async function processUploadedFiles(
  collection: string,
  recordId: string,
  files?: Express.Multer.File[]
): Promise<Record<string, any>> {
  if (!files || !Array.isArray(files) || files.length === 0) return {};
  const patches: Record<string, any> = {};

  for (const file of files) {
    const savedName = await saveUploadedFile(collection, recordId, file.originalname, file.buffer);
    if (file.fieldname === 'images' || file.fieldname === 'additionalImages') {
      patches[file.fieldname] = patches[file.fieldname] || [];
      patches[file.fieldname].push(savedName);
    } else {
      patches[file.fieldname] = savedName;
    }
  }
  return patches;
}

// Delete all disk files linked to record
export async function cleanupRecordFiles(collection: string, recordId: string, record: any): Promise<void> {
  if (!record) return;
  for (const [key, val] of Object.entries(record)) {
    if (FILE_FIELD_NAMES.has(key)) {
      if (typeof val === 'string' && val) {
        await deleteStoredFile(collection, recordId, val);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === 'string' && item) await deleteStoredFile(collection, recordId, item);
        }
      }
    }
  }
}

