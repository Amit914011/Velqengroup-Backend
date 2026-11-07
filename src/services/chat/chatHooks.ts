import { registerHook, AfterHookContext } from '../hookDispatcher.service.js';
import { EmployeeChatModel } from '../../models/employee_chat.js';
import { ChatComplianceAlertsModel } from '../../models/chat_compliance_alerts.js';
import { ChatDeletionAuditModel } from '../../models/chat_deletion_audit.js';
import { generatePbId } from '../../utils/idGenerator.js';

interface ComplianceRule {
  category: string;
  severity: string;
  confidence: number;
  patterns: RegExp[];
}

const RULES: ComplianceRule[] = [
  {
    category: 'Threat / Harassment',
    severity: 'High',
    confidence: 82,
    patterns: [
      /\bi(?:'ll| will)\s+(?:kill|hurt|beat|hit|slap|punch|harm|destroy)\b/i,
      /\bgoing\s+to\s+(?:kill|hurt|beat|hit|harm|destroy)\b/i,
      /\b(?:rape|threaten\s+to\s+kill)\b/i,
      /\bi\s+will\s+(?:ruin|end)\s+(?:your|u)\s+life\b/i,
    ],
  },
  {
    category: 'Abusive / Discriminatory Language',
    severity: 'High',
    confidence: 78,
    patterns: [/\b(?:n[i1]gg(?:a|er)|ch[i1]nk|f[a4]ggot)\b/i, /\byou\s+are\s+a\s+(?:whore|slut)\b/i],
  },
  {
    category: 'Credential / Password Sharing',
    severity: 'Critical',
    confidence: 88,
    patterns: [
      /\bpassword\s+is\b/i,
      /\bmy\s+password\b/i,
      /\bshare\s+(?:the\s+)?password\b/i,
      /\bcredentials\s+(?:are|is)\b/i,
      /\blogin\s+password\b/i,
      /\botp\s+is\b/i,
      /\bshare\s+(?:the\s+)?otp\b/i,
      /\bsend\s+(?:me\s+)?the\s+(?:password|otp|credentials)\b/i,
    ],
  },
  {
    category: 'Confidential Company/Client Data Disclosure',
    severity: 'High',
    confidence: 80,
    patterns: [
      /\bshare\s+(?:the\s+)?client\s+(?:list|database|records|data)\b/i,
      /\bclient\s+database\b/i,
      /\bshare\s+(?:the\s+)?leads\s+file\b/i,
      /\bconfidential\s+(?:company|client)\s+data\b/i,
      /\bexport\s+(?:the\s+)?client\s+list\b/i,
    ],
  },
  {
    category: 'Fraud / Record Manipulation',
    severity: 'Critical',
    confidence: 86,
    patterns: [
      /\bfake\s+(?:the\s+)?(?:receipt|invoice|bill)\b/i,
      /\bmanipulate\s+(?:the\s+)?(?:records|data|salary|attendance)\b/i,
      /\balter\s+(?:the\s+)?(?:salary|receipt|invoice|records|attendance)\b/i,
    ],
  },
];

function scanContent(content: string): ComplianceRule | null {
  for (const r of RULES) {
    for (const p of r.patterns) {
      if (p.test(content)) return r;
    }
  }
  return null;
}

export function registerChatHooks(): void {
  registerHook('employee_chat', 'afterCreate', async (ctx: AfterHookContext) => {
    const rec = ctx.record || {};
    const content = String(rec.content || '').trim();
    if (!content) return;

    const matched = scanContent(content);
    if (!matched) return;

    try {
      const alertId = generatePbId();
      await ChatComplianceAlertsModel.create({
        _id: alertId,
        message: rec._id,
        messageId: rec._id,
        sender: rec.sender || '',
        senderName: rec.senderName || '',
        category: matched.category,
        severity: matched.severity,
        confidence: matched.confidence,
        flaggedContent: content,
        reason: matched.category,
        status: 'Pending',
        detectedAt: new Date().toISOString(),
      });

      await EmployeeChatModel.findByIdAndUpdate(rec._id, {
        $set: {
          flagged: true,
          complianceCategory: matched.category,
          complianceConfidence: matched.confidence,
          complianceReason: matched.category,
          complianceAlert: alertId,
        },
      });
    } catch (_) {}
  });

  registerHook('employee_chat', 'afterUpdate', async (ctx: AfterHookContext) => {
    const rec = ctx.record || {};
    if (!rec.deleted) return;

    try {
      const exists = await ChatDeletionAuditModel.findOne({ messageId: rec._id }).lean();
      if (exists) return;

      await ChatDeletionAuditModel.create({
        _id: generatePbId(),
        message: rec._id,
        messageId: rec._id,
        sender: rec.sender || '',
        senderName: rec.senderName || '',
        conversationId: rec.room || '',
        conversationLabel: rec.isDm ? 'Direct Message' : `#${rec.room || ''}`,
        isDm: Boolean(rec.isDm),
        room: rec.room || '',
        participants: rec.participants || [],
        originalContent: rec.content || '',
        deletedBy: rec.deletedBy || '',
        deletedByName: rec.deletedByName || '',
        deletedAt: rec.deletedAt || new Date().toISOString(),
        reason: rec.deletionReason || '',
      });
    } catch (_) {}
  });
}
