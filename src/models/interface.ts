export const userRoles = [
  "patient",
  "pharmacist",
  "pharmacy_admin",
  "admin",
] as const;
export const verificationStatuses = [
  "pending",
  "verified",
  "rejected",
] as const;
export const pharmacistAvailabilities = ["online", "busy", "offline"] as const;
export const triageStatuses = [
  "in_progress",
  "completed",
  "escalated",
] as const;
export const consultationStatuses = [
  "waiting",
  "active",
  "completed",
  "cancelled",
] as const;
export const patientHandoffStatuses = [
  "sent",
  "accepted",
  "ready",
  "completed",
  "rejected",
] as const;
export const patientRequestTypes = [
  "in_store",
  "pickup",
  "telemedicine",
  "delivery",
] as const;
export const telemedicineChannels = ["chat", "phone", "video"] as const;
export const fulfillmentTypes = ["delivery", "pickup"] as const;
export const orderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivering",
  "completed",
  "cancelled",
] as const;
export const reviewTargetTypes = ["pharmacist", "pharmacy"] as const;
export const notificationTypes = [
  "queue",
  "pharmacist_reply",
  "order_status",
  "follow_up",
] as const;
export const genders = ["male", "female", "other"] as const;
export const senderTypes = ["patient", "pharmacist", "system"] as const;
export const articleStatuses = ["pending", "approved", "rejected"] as const;
export type UserRole = (typeof userRoles)[number];
export type VerificationStatus = (typeof verificationStatuses)[number];
export type PharmacistAvailability = (typeof pharmacistAvailabilities)[number];
export type TriageStatus = (typeof triageStatuses)[number];
export type ConsultationStatus = (typeof consultationStatuses)[number];
export type PatientHandoffStatus = (typeof patientHandoffStatuses)[number];
export type PatientRequestType = (typeof patientRequestTypes)[number];
export type TelemedicineChannel = (typeof telemedicineChannels)[number];
export type FulfillmentType = (typeof fulfillmentTypes)[number];
export type OrderStatus = (typeof orderStatuses)[number];
export type ReviewTargetType = (typeof reviewTargetTypes)[number];
export type NotificationType = (typeof notificationTypes)[number];
export type Gender = (typeof genders)[number];
export type SenderType = (typeof senderTypes)[number];
export type ArticleStatus = (typeof articleStatuses)[number];
