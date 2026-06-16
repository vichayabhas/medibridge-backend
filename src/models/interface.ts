import { Id } from "./configTypes";

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
export type AuthRoleSeed = {
  value: UserRole;
  label: string;
};

export type AuthUser = {
  _id: Id;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createAt: Date;
};

export type LoginInput = {
  email: string;
  password: string;
  role: UserRole;
};

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  avatarUrl: string;
};
export interface ArticleReady {
  _id: Id;
  title: string;
  category: string;
  coverImage: string;
  excerpt: string;
  body: string;
  authorId: Id;
  authorName: string;
  isAIGenerated: boolean;
  tags: string[];
  views: number;
  status: "pending" | "approved" | "rejected";
  createAt: Date;
}
export interface HomePageData {
  articleReadies: ArticleReady[];
}
export type PatientHandoffType = {
  _id: Id;
  patientName: string;
  age: number;
  gender: string;
  symptoms: string[];
  duration: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
  patientSummary: string;
  aiSummary: string;
  pharmacyId: Id;
  pharmacistId: Id;
  appointmentTime: Date;
  fulfillment: string;
  suggestedAction: string;
  requestType: PatientRequestType;
  telemedicineChannel: TelemedicineChannel;
  telemedicinePatientNote: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  telemedicineCollectedData?: any;
  telemedicineRequestTime: Date;
  telemedicineStartTime: Date;
  telemedicineEndTime: Date;
  consultDurationMinutes: number;
  status: PatientHandoffStatus;
  createAt: Date;
  // communicationMethod: string;
  // pharmacistNote: string;
  // pharmacistAction: string;
  // assessment: string;
  // plan?: string;
};
export interface PharmacistType {
  _id: Id;
  pharmacyId: string;
  name: string;
  licenseNo: string;
  // avatar: string;
  availability: PharmacistAvailability;
  rating: number;
  reviewCount: number;
  specialties: string[];
  // money: number;
  methodRates: { chat: number; phone: number; video: number };
  bookedSlots: string[];
  consultDurations: number[];
  experience: number;
  workplace: string;
  languages: string[];
  insurance: string[];
  bio: string;
  nextAvailable: string;
  verificationStatus: VerificationStatus;
}
export const socketEvents = [
  "new_message",
  "profile-sync",
  "handoff",
  "update-pharmacistProfile",
  "update-article",
  "update-pharmacist",
  "update-pharmacy",
  "update-single-pharmacy",
  "update-order",
] as const;
export type SocketEvent = (typeof socketEvents)[number];
export interface ChatMessage {
  _id: Id;
  handoffId: Id;
  senderType: SenderType;
  senderName?: string;
  content: string;
  createdAt: Date;
  imageUrl?: string;
  attachmentUrl?: string;
  fileName?: string;
}
export interface CreateTextMessage {
  senderType: SenderType;
  senderName: string;
  content: string;
  handoffId: Id;
}
export type FilteredHandoffsOptions = {
  pharmacistId: string;
  statuses: PatientHandoffStatus[];
  page?: number;
  pageSize?: number;
};
export interface HandoffStatusCount {
  waiting: number;
  ongoing: number;
  finished: number;
}
export type GetHandoffsOptions = {
  page?: number;
  pageSize?: number;
  pharmacyId?: Id;
  statuses?: PatientHandoffType["status"][];
};
export interface OpeningHours {
  day: number; // 0=Sun, 1=Mon, ...
  open: string; // "08:00"
  close: string; // "22:00"
}
export interface Pharmacy {
  _id: Id;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  openingHours: OpeningHours[];
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  services: string[];
  hasDelivery: boolean;
}
export interface PharmacyWithDistance extends Pharmacy {
  distance: number; // km
  isOpen: boolean;
  onlinePharmacists: number;
  estimatedWaitTime: number; // minutes
}
export interface UpdateProfile {
  name: string;
  email: string;
  phone: string;
}
export interface PharmacyType {
  _id: Id;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  openingHours: OpeningHours[];
  verificationStatus: "pending" | "verified" | "rejected";
  rating: number;
  reviewCount: number;
  imageUrl: string;
  services: string[];
  hasDelivery: boolean;
}
export interface GetPharmacistData {
  user: AuthUser;
  pharmacist: PharmacistType;
  pharmacy: PharmacyWithDistance;
  handoffs: PatientHandoffType[];
  handOffStatusCount: HandoffStatusCount;
}

export type CreatePatientHandoff = Omit<PatientHandoffType, "_id" | "createAt">;
export interface CreateArticle {
  title: string;
  category: string;
  coverImage: string;
  excerpt: string;
  body: string;
  tags: string[];
  isAIGenerated: boolean;
}
export interface UpdatePharmacistProfile {
  name: string;
  licenseNo: string;
  availability: PharmacistAvailability;
}
export interface HandoffStatusCount {
  waiting: number;
  ongoing: number;
  finished: number;
}
export interface HandoffWithMessages {
  handoff: PatientHandoffType;
  messages: ChatMessage[];
}
export interface PharmaShiftData {
  pharmacist: PharmacistType;
  pharmacy: PharmacyWithDistance;
  arrayHandoffWithMessages: HandoffWithMessages[];
}
export type ConsultationData =
  | {
      handoff: PatientHandoffType;
      isChat: true;
      messages: ChatMessage[];
      isPhone: false;
      isVideo: false;
      pharmacist: PharmacistType;
      pharmacy: PharmacyWithDistance;
    }
  | {
      handoff: PatientHandoffType;
      isChat: false;
      isPhone: false;
      isVideo: true;
      roomUrl: string | null;
      pharmacist: PharmacistType;
      pharmacy: PharmacyWithDistance;
      messages: ChatMessage[];
    }
  | {
      handoff: PatientHandoffType;
      isChat: false;
      isPhone: true;
      isVideo: false;
      roomUrl: string | null;
      pharmacist: PharmacistType;
      pharmacy: PharmacyWithDistance;
      messages: ChatMessage[];
    };
export interface PatientCallData {
  handoff: PatientHandoffType;
  messageInputs: ChatMessage[];
  pharmacyName: string;
  error: string | null;
}
export interface AdminData {
  pharmacists: PharmacistType[];
  pharmacies: PharmacyWithDistance[];
  articles: ArticleReady[];
}
export interface OrderType {
  consultationId: Id;
  userId: Id;
  pharmacyId: Id;
  pharmacistId: Id;
  fulfillment: FulfillmentType;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  otpCode: string;
  estimatedTime: string;
  createAt: Date;
  updateAt: Date;
  _id: Id;
}
export interface PharmacyDashboardData {
  pharmacy: PharmacyType | null;
  orders: OrderType[];
}
export interface PharmacyRegister {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  imageUrl: string;
}
