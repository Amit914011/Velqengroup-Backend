import { Model } from 'mongoose';

import { MfasModel, IMfas } from './_mfas.js';
import { OtpsModel, IOtps } from './_otps.js';
import { ExternalAuthsModel, IExternalAuths } from './_externalAuths.js';
import { AuthOriginsModel, IAuthOrigins } from './_authOrigins.js';
import { SuperusersModel, ISuperusers } from './_superusers.js';
import { UsersModel, IUsers } from './users.js';
import { IntegratedAiMessagesModel, IIntegratedAiMessages } from './_integratedAiMessages.js';
import { IntegratedAiImagesModel, IIntegratedAiImages } from './_integratedAiImages.js';
import { LeadsModel, ILeads } from './leads.js';
import { TargetsModel, ITargets } from './targets.js';
import { LeadNotesModel, ILeadNotes } from './lead_notes.js';
import { LeaveRequestsModel, ILeaveRequests } from './leave_requests.js';
import { AttendanceModel, IAttendance } from './attendance.js';
import { LeaveMarksModel, ILeaveMarks } from './leave_marks.js';
import { PlPayoutsModel, IPlPayouts } from './pl_payouts.js';
import { TrustedDevicesModel, ITrustedDevices } from './trusted_devices.js';
import { LoginAttemptsModel, ILoginAttempts } from './login_attempts.js';
import { SalarySlipsModel, ISalarySlips } from './salary_slips.js';
import { PaymentReceiptsModel, IPaymentReceipts } from './payment_receipts.js';
import { PasswordResetRequestsModel, IPasswordResetRequests } from './password_reset_requests.js';
import { SheetConnectionsModel, ISheetConnections } from './sheet_connections.js';
import { SalarySlipRequestsModel, ISalarySlipRequests } from './salary_slip_requests.js';
import { WeeklyAcknowledgementsModel, IWeeklyAcknowledgements } from './weekly_acknowledgements.js';
import { ClientDocumentsModel, IClientDocuments } from './client_documents.js';
import { EmployeeBreaksModel, IEmployeeBreaks } from './employee_breaks.js';
import { SupportTicketsModel, ISupportTickets } from './support_tickets.js';
import { CompanyExpensesModel, ICompanyExpenses } from './company_expenses.js';
import { EmployeeAdvancesModel, IEmployeeAdvances } from './employee_advances.js';
import { CompanyIncomeModel, ICompanyIncome } from './company_income.js';
import { VisitorsModel, IVisitors } from './visitors.js';
import { AllocationStateModel, IAllocationState } from './allocation_state.js';
import { PhoneOtpsModel, IPhoneOtps } from './phone_otps.js';
import { NotificationsModel, INotifications } from './notifications.js';
import { BroadcastsModel, IBroadcasts } from './broadcasts.js';
import { LeadContactsModel, ILeadContacts } from './lead_contacts.js';
import { CaDocumentsModel, ICaDocuments } from './ca_documents.js';
import { LeaveChangeRequestsModel, ILeaveChangeRequests } from './leave_change_requests.js';
import { EmployeeChatModel, IEmployeeChat } from './employee_chat.js';
import { EmailOtpsModel, IEmailOtps } from './email_otps.js';
import { MarketplaceUsersModel, IMarketplaceUsers } from './marketplace_users.js';
import { MarketplaceListingsModel, IMarketplaceListings } from './marketplace_listings.js';
import { MarketplaceContactRequestsModel, IMarketplaceContactRequests } from './marketplace_contact_requests.js';
import { RecipientsModel, IRecipients } from './recipients.js';
import { EodReportsModel, IEodReports } from './eod_reports.js';
import { MonthlyTargetsModel, IMonthlyTargets } from './monthly_targets.js';
import { CallLogsModel, ICallLogs } from './call_logs.js';
import { IncomingCallsModel, IIncomingCalls } from './incoming_calls.js';
import { CallHistoryModel, ICallHistory } from './call_history.js';
import { WhatsappHistoryModel, IWhatsappHistory } from './whatsapp_history.js';
import { SalaryRecordsModel, ISalaryRecords } from './salary_records.js';
import { ExitRecordsModel, IExitRecords } from './exit_records.js';
import { VelqenSmileInquiriesModel, IVelqenSmileInquiries } from './velqen_smile_inquiries.js';
import { VelqenSmileDonorsModel, IVelqenSmileDonors } from './velqen_smile_donors.js';
import { VelqenSmileHelpSeekersModel, IVelqenSmileHelpSeekers } from './velqen_smile_help_seekers.js';
import { VolunteerRegistrationsModel, IVolunteerRegistrations } from './volunteer_registrations.js';
import { LateApologiesModel, ILateApologies } from './late_apologies.js';
import { LeadAllocationRequestsModel, ILeadAllocationRequests } from './lead_allocation_requests.js';
import { ClientStatusHistoryModel, IClientStatusHistory } from './client_status_history.js';
import { ApplicationStatusHistoryModel, IApplicationStatusHistory } from './application_status_history.js';
import { SalarySlipAuditModel, ISalarySlipAudit } from './salary_slip_audit.js';
import { EmployeeChangeRequestsModel, IEmployeeChangeRequests } from './employee_change_requests.js';
import { PayrollSettingsModel, IPayrollSettings } from './payroll_settings.js';
import { PayrollSettingsAuditModel, IPayrollSettingsAudit } from './payroll_settings_audit.js';
import { ManagerSalaryRequestsModel, IManagerSalaryRequests } from './manager_salary_requests.js';
import { ManagerCompiledEodsModel, IManagerCompiledEods } from './manager_compiled_eods.js';
import { ManagerEodReportsModel, IManagerEodReports } from './manager_eod_reports.js';
import { EmployeeDocumentsModel, IEmployeeDocuments } from './employee_documents.js';
import { ManagerEodReviewsModel, IManagerEodReviews } from './manager_eod_reviews.js';
import { ManagerEodConsolidatedModel, IManagerEodConsolidated } from './manager_eod_consolidated.js';
import { VisitorFeedbackModel, IVisitorFeedback } from './visitor_feedback.js';
import { ResignationRequestsModel, IResignationRequests } from './resignation_requests.js';
import { DisciplinaryRecordsModel, IDisciplinaryRecords } from './disciplinary_records.js';
import { WebsiteUpdatesModel, IWebsiteUpdates } from './website_updates.js';
import { WhatsappAccountsModel, IWhatsappAccounts } from './whatsapp_accounts.js';
import { WhatsappConversationsModel, IWhatsappConversations } from './whatsapp_conversations.js';
import { WaCrmMessagesModel, IWaCrmMessages } from './wa_crm_messages.js';
import { WhatsappTemplatesModel, IWhatsappTemplates } from './whatsapp_templates.js';
import { WhatsappWebhookEventsModel, IWhatsappWebhookEvents } from './whatsapp_webhook_events.js';
import { LoginSessionsModel, ILoginSessions } from './login_sessions.js';
import { PaymentReferencesModel, IPaymentReferences } from './payment_references.js';
import { CardPaymentsModel, ICardPayments } from './card_payments.js';
import { RecruitmentCandidatesModel, IRecruitmentCandidates } from './recruitment_candidates.js';
import { RecruitmentConversationsModel, IRecruitmentConversations } from './recruitment_conversations.js';
import { RecruitmentInterviewsModel, IRecruitmentInterviews } from './recruitment_interviews.js';
import { RecruitmentAssessmentsModel, IRecruitmentAssessments } from './recruitment_assessments.js';
import { RecruitmentHireRequestsModel, IRecruitmentHireRequests } from './recruitment_hire_requests.js';
import { HrRoundRobinStateModel, IHrRoundRobinState } from './hr_round_robin_state.js';
import { CandidateNotesModel, ICandidateNotes } from './candidate_notes.js';
import { ManagerActivityLogModel, IManagerActivityLog } from './manager_activity_log.js';
import { EmployeeReactivationLogModel, IEmployeeReactivationLog } from './employee_reactivation_log.js';
import { LogisticsUsersModel, ILogisticsUsers } from './logistics_users.js';
import { LogisticsLoadsModel, ILogisticsLoads } from './logistics_loads.js';
import { LogisticsSavedLoadsModel, ILogisticsSavedLoads } from './logistics_saved_loads.js';
import { LogisticsLoadResponsesModel, ILogisticsLoadResponses } from './logistics_load_responses.js';
import { LogisticsJobsModel, ILogisticsJobs } from './logistics_jobs.js';
import { LogisticsJobApplicationsModel, ILogisticsJobApplications } from './logistics_job_applications.js';
import { LogisticsDispatchRequestsModel, ILogisticsDispatchRequests } from './logistics_dispatch_requests.js';
import { LogisticsDrayageRequestsModel, ILogisticsDrayageRequests } from './logistics_drayage_requests.js';
import { LogisticsFreightRequestsModel, ILogisticsFreightRequests } from './logistics_freight_requests.js';
import { LogisticsNotificationsModel, ILogisticsNotifications } from './logistics_notifications.js';
import { CarrierVerificationsModel, ICarrierVerifications } from './carrier_verifications.js';
import { FmcsaCarriersModel, IFmcsaCarriers } from './fmcsa_carriers.js';
import { FmcsaImportsModel, IFmcsaImports } from './fmcsa_imports.js';
import { CarrierGoogleReputationModel, ICarrierGoogleReputation } from './carrier_google_reputation.js';
import { FinancialTransactionsModel, IFinancialTransactions } from './financial_transactions.js';
import { CompanyHolidaysModel, ICompanyHolidays } from './company_holidays.js';
import { CompanyHolidayAuditModel, ICompanyHolidayAudit } from './company_holiday_audit.js';
import { OvertimeRequestsModel, IOvertimeRequests } from './overtime_requests.js';
import { OvertimeSettingsModel, IOvertimeSettings } from './overtime_settings.js';
import { RealtimeHeartbeatModel, IRealtimeHeartbeat } from './realtime_heartbeat.js';
import { ChatComplianceAlertsModel, IChatComplianceAlerts } from './chat_compliance_alerts.js';
import { ChatDeletionAuditModel, IChatDeletionAudit } from './chat_deletion_audit.js';
import { ChatAccessLogModel, IChatAccessLog } from './chat_access_log.js';
import { SecuritySessionsModel, ISecuritySessions } from './security_sessions.js';
import { SecurityAuditModel, ISecurityAudit } from './security_audit.js';
import { RecruitmentCandidateEditsModel, IRecruitmentCandidateEdits } from './recruitment_candidate_edits.js';
import { EmployeeLettersModel, IEmployeeLetters } from './employee_letters.js';
import { ClientDocumentRequestsModel, IClientDocumentRequests } from './client_document_requests.js';
import { FillingOfficerAuditModel, IFillingOfficerAudit } from './filling_officer_audit.js';
import { FoEmailsModel, IFoEmails } from './fo_emails.js';
import { SaturdaySpecialConfigModel, ISaturdaySpecialConfig } from './saturday_special_config.js';
import { ManagerWeeklyReportsModel, IManagerWeeklyReports } from './manager_weekly_reports.js';
import { ManagerLocationLogModel, IManagerLocationLog } from './manager_location_log.js';
import { CompaniesModel, ICompanies } from './companies.js';

export {
  MfasModel,
  type IMfas,
  OtpsModel,
  type IOtps,
  ExternalAuthsModel,
  type IExternalAuths,
  AuthOriginsModel,
  type IAuthOrigins,
  SuperusersModel,
  type ISuperusers,
  UsersModel,
  type IUsers,
  IntegratedAiMessagesModel,
  type IIntegratedAiMessages,
  IntegratedAiImagesModel,
  type IIntegratedAiImages,
  LeadsModel,
  type ILeads,
  TargetsModel,
  type ITargets,
  LeadNotesModel,
  type ILeadNotes,
  LeaveRequestsModel,
  type ILeaveRequests,
  AttendanceModel,
  type IAttendance,
  LeaveMarksModel,
  type ILeaveMarks,
  PlPayoutsModel,
  type IPlPayouts,
  TrustedDevicesModel,
  type ITrustedDevices,
  LoginAttemptsModel,
  type ILoginAttempts,
  SalarySlipsModel,
  type ISalarySlips,
  PaymentReceiptsModel,
  type IPaymentReceipts,
  PasswordResetRequestsModel,
  type IPasswordResetRequests,
  SheetConnectionsModel,
  type ISheetConnections,
  SalarySlipRequestsModel,
  type ISalarySlipRequests,
  WeeklyAcknowledgementsModel,
  type IWeeklyAcknowledgements,
  ClientDocumentsModel,
  type IClientDocuments,
  EmployeeBreaksModel,
  type IEmployeeBreaks,
  SupportTicketsModel,
  type ISupportTickets,
  CompanyExpensesModel,
  type ICompanyExpenses,
  EmployeeAdvancesModel,
  type IEmployeeAdvances,
  CompanyIncomeModel,
  type ICompanyIncome,
  VisitorsModel,
  type IVisitors,
  AllocationStateModel,
  type IAllocationState,
  PhoneOtpsModel,
  type IPhoneOtps,
  NotificationsModel,
  type INotifications,
  BroadcastsModel,
  type IBroadcasts,
  LeadContactsModel,
  type ILeadContacts,
  CaDocumentsModel,
  type ICaDocuments,
  LeaveChangeRequestsModel,
  type ILeaveChangeRequests,
  EmployeeChatModel,
  type IEmployeeChat,
  EmailOtpsModel,
  type IEmailOtps,
  MarketplaceUsersModel,
  type IMarketplaceUsers,
  MarketplaceListingsModel,
  type IMarketplaceListings,
  MarketplaceContactRequestsModel,
  type IMarketplaceContactRequests,
  RecipientsModel,
  type IRecipients,
  EodReportsModel,
  type IEodReports,
  MonthlyTargetsModel,
  type IMonthlyTargets,
  CallLogsModel,
  type ICallLogs,
  IncomingCallsModel,
  type IIncomingCalls,
  CallHistoryModel,
  type ICallHistory,
  WhatsappHistoryModel,
  type IWhatsappHistory,
  SalaryRecordsModel,
  type ISalaryRecords,
  ExitRecordsModel,
  type IExitRecords,
  VelqenSmileInquiriesModel,
  type IVelqenSmileInquiries,
  VelqenSmileDonorsModel,
  type IVelqenSmileDonors,
  VelqenSmileHelpSeekersModel,
  type IVelqenSmileHelpSeekers,
  VolunteerRegistrationsModel,
  type IVolunteerRegistrations,
  LateApologiesModel,
  type ILateApologies,
  LeadAllocationRequestsModel,
  type ILeadAllocationRequests,
  ClientStatusHistoryModel,
  type IClientStatusHistory,
  ApplicationStatusHistoryModel,
  type IApplicationStatusHistory,
  SalarySlipAuditModel,
  type ISalarySlipAudit,
  EmployeeChangeRequestsModel,
  type IEmployeeChangeRequests,
  PayrollSettingsModel,
  type IPayrollSettings,
  PayrollSettingsAuditModel,
  type IPayrollSettingsAudit,
  ManagerSalaryRequestsModel,
  type IManagerSalaryRequests,
  ManagerCompiledEodsModel,
  type IManagerCompiledEods,
  ManagerEodReportsModel,
  type IManagerEodReports,
  EmployeeDocumentsModel,
  type IEmployeeDocuments,
  ManagerEodReviewsModel,
  type IManagerEodReviews,
  ManagerEodConsolidatedModel,
  type IManagerEodConsolidated,
  VisitorFeedbackModel,
  type IVisitorFeedback,
  ResignationRequestsModel,
  type IResignationRequests,
  DisciplinaryRecordsModel,
  type IDisciplinaryRecords,
  WebsiteUpdatesModel,
  type IWebsiteUpdates,
  WhatsappAccountsModel,
  type IWhatsappAccounts,
  WhatsappConversationsModel,
  type IWhatsappConversations,
  WaCrmMessagesModel,
  type IWaCrmMessages,
  WhatsappTemplatesModel,
  type IWhatsappTemplates,
  WhatsappWebhookEventsModel,
  type IWhatsappWebhookEvents,
  LoginSessionsModel,
  type ILoginSessions,
  PaymentReferencesModel,
  type IPaymentReferences,
  CardPaymentsModel,
  type ICardPayments,
  RecruitmentCandidatesModel,
  type IRecruitmentCandidates,
  RecruitmentConversationsModel,
  type IRecruitmentConversations,
  RecruitmentInterviewsModel,
  type IRecruitmentInterviews,
  RecruitmentAssessmentsModel,
  type IRecruitmentAssessments,
  RecruitmentHireRequestsModel,
  type IRecruitmentHireRequests,
  HrRoundRobinStateModel,
  type IHrRoundRobinState,
  CandidateNotesModel,
  type ICandidateNotes,
  ManagerActivityLogModel,
  type IManagerActivityLog,
  EmployeeReactivationLogModel,
  type IEmployeeReactivationLog,
  LogisticsUsersModel,
  type ILogisticsUsers,
  LogisticsLoadsModel,
  type ILogisticsLoads,
  LogisticsSavedLoadsModel,
  type ILogisticsSavedLoads,
  LogisticsLoadResponsesModel,
  type ILogisticsLoadResponses,
  LogisticsJobsModel,
  type ILogisticsJobs,
  LogisticsJobApplicationsModel,
  type ILogisticsJobApplications,
  LogisticsDispatchRequestsModel,
  type ILogisticsDispatchRequests,
  LogisticsDrayageRequestsModel,
  type ILogisticsDrayageRequests,
  LogisticsFreightRequestsModel,
  type ILogisticsFreightRequests,
  LogisticsNotificationsModel,
  type ILogisticsNotifications,
  CarrierVerificationsModel,
  type ICarrierVerifications,
  FmcsaCarriersModel,
  type IFmcsaCarriers,
  FmcsaImportsModel,
  type IFmcsaImports,
  CarrierGoogleReputationModel,
  type ICarrierGoogleReputation,
  FinancialTransactionsModel,
  type IFinancialTransactions,
  CompanyHolidaysModel,
  type ICompanyHolidays,
  CompanyHolidayAuditModel,
  type ICompanyHolidayAudit,
  OvertimeRequestsModel,
  type IOvertimeRequests,
  OvertimeSettingsModel,
  type IOvertimeSettings,
  RealtimeHeartbeatModel,
  type IRealtimeHeartbeat,
  ChatComplianceAlertsModel,
  type IChatComplianceAlerts,
  ChatDeletionAuditModel,
  type IChatDeletionAudit,
  ChatAccessLogModel,
  type IChatAccessLog,
  SecuritySessionsModel,
  type ISecuritySessions,
  SecurityAuditModel,
  type ISecurityAudit,
  RecruitmentCandidateEditsModel,
  type IRecruitmentCandidateEdits,
  EmployeeLettersModel,
  type IEmployeeLetters,
  ClientDocumentRequestsModel,
  type IClientDocumentRequests,
  FillingOfficerAuditModel,
  type IFillingOfficerAudit,
  FoEmailsModel,
  type IFoEmails,
  SaturdaySpecialConfigModel,
  type ISaturdaySpecialConfig,
  ManagerWeeklyReportsModel,
  type IManagerWeeklyReports,
  ManagerLocationLogModel,
  type IManagerLocationLog,
  CompaniesModel,
  type ICompanies,
};

export const ALL_MODELS: Record<string, Model<any>> = {
  '_mfas': MfasModel,
  '_otps': OtpsModel,
  '_externalAuths': ExternalAuthsModel,
  '_authOrigins': AuthOriginsModel,
  '_superusers': SuperusersModel,
  'users': UsersModel,
  '_integratedAiMessages': IntegratedAiMessagesModel,
  '_integratedAiImages': IntegratedAiImagesModel,
  'leads': LeadsModel,
  'targets': TargetsModel,
  'lead_notes': LeadNotesModel,
  'leave_requests': LeaveRequestsModel,
  'attendance': AttendanceModel,
  'leave_marks': LeaveMarksModel,
  'pl_payouts': PlPayoutsModel,
  'trusted_devices': TrustedDevicesModel,
  'login_attempts': LoginAttemptsModel,
  'salary_slips': SalarySlipsModel,
  'payment_receipts': PaymentReceiptsModel,
  'password_reset_requests': PasswordResetRequestsModel,
  'sheet_connections': SheetConnectionsModel,
  'salary_slip_requests': SalarySlipRequestsModel,
  'weekly_acknowledgements': WeeklyAcknowledgementsModel,
  'client_documents': ClientDocumentsModel,
  'employee_breaks': EmployeeBreaksModel,
  'support_tickets': SupportTicketsModel,
  'company_expenses': CompanyExpensesModel,
  'employee_advances': EmployeeAdvancesModel,
  'company_income': CompanyIncomeModel,
  'visitors': VisitorsModel,
  'allocation_state': AllocationStateModel,
  'phone_otps': PhoneOtpsModel,
  'notifications': NotificationsModel,
  'broadcasts': BroadcastsModel,
  'lead_contacts': LeadContactsModel,
  'ca_documents': CaDocumentsModel,
  'leave_change_requests': LeaveChangeRequestsModel,
  'employee_chat': EmployeeChatModel,
  'email_otps': EmailOtpsModel,
  'marketplace_users': MarketplaceUsersModel,
  'marketplace_listings': MarketplaceListingsModel,
  'marketplace_contact_requests': MarketplaceContactRequestsModel,
  'recipients': RecipientsModel,
  'eod_reports': EodReportsModel,
  'monthly_targets': MonthlyTargetsModel,
  'call_logs': CallLogsModel,
  'incoming_calls': IncomingCallsModel,
  'call_history': CallHistoryModel,
  'whatsapp_history': WhatsappHistoryModel,
  'salary_records': SalaryRecordsModel,
  'exit_records': ExitRecordsModel,
  'velqen_smile_inquiries': VelqenSmileInquiriesModel,
  'velqen_smile_donors': VelqenSmileDonorsModel,
  'velqen_smile_help_seekers': VelqenSmileHelpSeekersModel,
  'volunteer_registrations': VolunteerRegistrationsModel,
  'late_apologies': LateApologiesModel,
  'lead_allocation_requests': LeadAllocationRequestsModel,
  'client_status_history': ClientStatusHistoryModel,
  'application_status_history': ApplicationStatusHistoryModel,
  'salary_slip_audit': SalarySlipAuditModel,
  'employee_change_requests': EmployeeChangeRequestsModel,
  'payroll_settings': PayrollSettingsModel,
  'payroll_settings_audit': PayrollSettingsAuditModel,
  'manager_salary_requests': ManagerSalaryRequestsModel,
  'manager_compiled_eods': ManagerCompiledEodsModel,
  'manager_eod_reports': ManagerEodReportsModel,
  'employee_documents': EmployeeDocumentsModel,
  'manager_eod_reviews': ManagerEodReviewsModel,
  'manager_eod_consolidated': ManagerEodConsolidatedModel,
  'visitor_feedback': VisitorFeedbackModel,
  'resignation_requests': ResignationRequestsModel,
  'disciplinary_records': DisciplinaryRecordsModel,
  'website_updates': WebsiteUpdatesModel,
  'whatsapp_accounts': WhatsappAccountsModel,
  'whatsapp_conversations': WhatsappConversationsModel,
  'wa_crm_messages': WaCrmMessagesModel,
  'whatsapp_templates': WhatsappTemplatesModel,
  'whatsapp_webhook_events': WhatsappWebhookEventsModel,
  'login_sessions': LoginSessionsModel,
  'payment_references': PaymentReferencesModel,
  'card_payments': CardPaymentsModel,
  'recruitment_candidates': RecruitmentCandidatesModel,
  'recruitment_conversations': RecruitmentConversationsModel,
  'recruitment_interviews': RecruitmentInterviewsModel,
  'recruitment_assessments': RecruitmentAssessmentsModel,
  'recruitment_hire_requests': RecruitmentHireRequestsModel,
  'hr_round_robin_state': HrRoundRobinStateModel,
  'candidate_notes': CandidateNotesModel,
  'manager_activity_log': ManagerActivityLogModel,
  'employee_reactivation_log': EmployeeReactivationLogModel,
  'logistics_users': LogisticsUsersModel,
  'logistics_loads': LogisticsLoadsModel,
  'logistics_saved_loads': LogisticsSavedLoadsModel,
  'logistics_load_responses': LogisticsLoadResponsesModel,
  'logistics_jobs': LogisticsJobsModel,
  'logistics_job_applications': LogisticsJobApplicationsModel,
  'logistics_dispatch_requests': LogisticsDispatchRequestsModel,
  'logistics_drayage_requests': LogisticsDrayageRequestsModel,
  'logistics_freight_requests': LogisticsFreightRequestsModel,
  'logistics_notifications': LogisticsNotificationsModel,
  'carrier_verifications': CarrierVerificationsModel,
  'fmcsa_carriers': FmcsaCarriersModel,
  'fmcsa_imports': FmcsaImportsModel,
  'carrier_google_reputation': CarrierGoogleReputationModel,
  'financial_transactions': FinancialTransactionsModel,
  'company_holidays': CompanyHolidaysModel,
  'company_holiday_audit': CompanyHolidayAuditModel,
  'overtime_requests': OvertimeRequestsModel,
  'overtime_settings': OvertimeSettingsModel,
  'realtime_heartbeat': RealtimeHeartbeatModel,
  'chat_compliance_alerts': ChatComplianceAlertsModel,
  'chat_deletion_audit': ChatDeletionAuditModel,
  'chat_access_log': ChatAccessLogModel,
  'security_sessions': SecuritySessionsModel,
  'security_audit': SecurityAuditModel,
  'recruitment_candidate_edits': RecruitmentCandidateEditsModel,
  'employee_letters': EmployeeLettersModel,
  'client_document_requests': ClientDocumentRequestsModel,
  'filling_officer_audit': FillingOfficerAuditModel,
  'fo_emails': FoEmailsModel,
  'saturday_special_config': SaturdaySpecialConfigModel,
  'manager_weekly_reports': ManagerWeeklyReportsModel,
  'manager_location_log': ManagerLocationLogModel,
  'companies': CompaniesModel,
};

export function getModelByCollection(name: string): Model<any> | undefined {
  return ALL_MODELS[name];
}
