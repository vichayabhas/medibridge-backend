/* eslint-disable @typescript-eslint/no-unused-vars */
// -- MediBridge Supabase schema
// -- Development reset: run this entire file in the Supabase SQL editor to wipe and recreate all tables.
// -- ⚠️  DROPS EVERYTHING — for development use only.

import mongoose from "mongoose";
import {
  arrayString,
  dataDate,
  dataId,
  dataNumber,
  dataString,
  dataStringDefault,
  getDefaultBoolean,
  reqNumber,
} from "../controllers/setup";

// -- ============================================================
// -- RESET (drop all objects in reverse dependency order)
// -- ============================================================
// drop table if exists public.notifications       cascade;
// drop table if exists public.reviews             cascade;
// drop table if exists public.order_items         cascade;
// drop table if exists public.orders              cascade;
// drop table if exists public.telemedicine_messages cascade;
// drop table if exists public.telemedicine_rooms  cascade;
// drop table if exists public.patient_handoffs    cascade;
// drop table if exists public.consultations       cascade;
// drop table if exists public.triage_sessions     cascade;
// drop table if exists public.products            cascade;
// drop table if exists public.pharmacists         cascade;
// drop table if exists public.pharmacies          cascade;
// drop table if exists public.patient_profiles    cascade;
// drop table if exists public.patient_clipboards    cascade;
// drop table if exists public.profiles            cascade;

// drop type if exists notification_type       cascade;
// drop type if exists review_target_type      cascade;
// drop type if exists order_status            cascade;
// drop type if exists fulfillment_type        cascade;
// drop type if exists telemedicine_channel    cascade;
// drop type if exists patient_request_type    cascade;
// drop type if exists patient_handoff_status  cascade;
// drop type if exists consultation_status     cascade;
// drop type if exists triage_status           cascade;
// drop type if exists pharmacist_availability cascade;
// drop type if exists verification_status     cascade;
// drop type if exists user_role               cascade;

// drop function if exists public.set_updated_at() cascade;

// -- ============================================================
// -- EXTENSIONS & TYPES
// -- ============================================================
// create extension if not exists pgcrypto;

// create type user_role as enum ('patient', 'pharmacist', 'pharmacy_admin', 'admin');
 const userRoles = [
  "patient",
  "pharmacist",
  "pharmacy_admin",
  "admin",
] as const;
 type UserRole = (typeof userRoles)[number];
// create type verification_status as enum ('pending', 'verified', 'rejected');
 const verificationStatuses = [
  "pending",
  "verified",
  "rejected",
] as const;
 type VerificationStatus = (typeof verificationStatuses)[number];
// create type pharmacist_availability as enum ('online', 'busy', 'offline');
 const pharmacistAvailabilities = ["online", "busy", "offline"] as const;
 type PharmacistAvailability = (typeof pharmacistAvailabilities)[number];
// create type triage_status as enum ('in_progress', 'completed', 'escalated');
 const triageStatuses = [
  "in_progress",
  "completed",
  "escalated",
] as const;
 type TriageStatus = (typeof triageStatuses)[number];
// create type consultation_status as enum ('waiting', 'active', 'completed', 'cancelled');
 const consultationStatuses = [
  "waiting",
  "active",
  "completed",
  "cancelled",
] as const;
 type ConsultationStatus = (typeof consultationStatuses)[number];

// create type patient_handoff_status as enum ('sent', 'accepted', 'ready', 'completed', 'rejected');
 const patientHandoffStatuses = [
  "sent",
  "accepted",
  "ready",
  "completed",
  "rejected",
] as const;
 type PatientHandoffStatus = (typeof patientHandoffStatuses)[number];

// create type patient_request_type as enum ('in_store', 'pickup', 'telemedicine', 'delivery');
 const patientRequestTypes = [
  "in_store",
  "pickup",
  "telemedicine",
  "delivery",
] as const;
 type PatientRequestType = (typeof patientRequestTypes)[number];

// create type telemedicine_channel as enum ('chat', 'phone', 'video');
 const telemedicineChannels = ["chat", "phone", "video"] as const;
 type TelemedicineChannel = (typeof telemedicineChannels)[number];

// create type fulfillment_type as enum ('delivery', 'pickup');
 const fulfillmentTypes = ["delivery", "pickup"] as const;
 type FulfillmentType = (typeof fulfillmentTypes)[number];

// create type order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled');
 const orderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivering",
  "completed",
  "cancelled",
] as const;
 type OrderStatus = (typeof orderStatuses)[number];

// create type review_target_type as enum ('pharmacist', 'pharmacy');
 const reviewTargetTypes = ["pharmacist", "pharmacy"] as const;
 type ReviewTargetType = (typeof reviewTargetTypes)[number];

// create type notification_type as enum ('queue', 'pharmacist_reply', 'order_status', 'follow_up');
 const notificationTypes = [
  "queue",
  "pharmacist_reply",
  "order_status",
  "follow_up",
] as const;
 type NotificationType = (typeof notificationTypes)[number];
// create type gender as enum ('male', 'female', 'other');
 const genders = ["male", "female", "other"] as const;
 type Gender = (typeof genders)[number];
// create type sender_type as enum ('patient', 'pharmacist', 'system')
 const senderTypes = ["patient", "pharmacist", "system"] as const;
 type SenderType = (typeof senderTypes)[number];
//create type article_status as enum ('pending', 'approved', 'rejected')
 const articleStatuses = ["pending", "approved", "rejected"] as const;
 type ArticleStatus = (typeof articleStatuses)[number];
// create or replace function public.set_updated_at()
// returns trigger
// language plpgsql
// as $$
// begin
//   new.updated_at = now();
//   return new;
// end;
// $$;
new mongoose.Schema({
  fullName: dataString,
  // create table if not exists public.profiles (
  //    id uuid primary key references auth.users(id) on delete cascade,
  //    full_name text not null,
  //    phone text not null,
  phone: dataString,
  //    email text,
  email: dataString,
  //    avatar_url text,
  avatarUrl: dataString,
  //    role user_role not null default 'patient',
  role: {
    type: String,
    enum: userRoles,
    default: "patient",
  },
  //    created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //    updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.patient_profiles (
  //    user_id uuid primary key references public.profiles(id) on delete cascade,
  //    first_name text not null,
  firstName: dataString,
  //    last_name text not null,
  lastName: dataString,
  //    gender text not null check (gender in ('male', 'female', 'other')),
  gender: {
    type: String,
    enum: genders,
    required: true,
  },
  //    age integer check (age >= 0),
  age: reqNumber,
  //    weight numeric(6,2),
  weight: reqNumber,
  //    allergies text[] default '{}'::text[],
  allergies: arrayString,
  //    conditions text[] default '{}'::text[],
  conditions: arrayString,
  //    current_medications text[] default '{}'::text[],
  currentMedications: arrayString,
  //    is_pregnant boolean,
  isPregnant: getDefaultBoolean(false),
  //    is_breastfeeding boolean,
  isBreastfeeding: getDefaultBoolean(false),
  //    blood_type text,
  bloodType: dataString,
  //    symptoms text,
  symptoms: dataString,
  //    created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //    updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});
new mongoose.Schema({
  // create table if not exists public.pharmacies (
  //    id text primary key,
  //    name text not null,
  name: dataString,
  //    address text not null,
  address: dataString,
  //    lat numeric(10,7) not null,
  latitude: reqNumber,
  //    lng numeric(10,7) not null,
  longitude: reqNumber,
  //    phone text not null,
  phone: dataString,
  //    opening_hours jsonb not null default '[]'::jsonb,
  openingHours: mongoose.Schema.Types.Mixed,
  //    verification_status verification_status not null default 'pending',
  verificationStatus: {
    type: String,
    enum: verificationStatuses,
    default: "pending",
  },
  //    rating numeric(3,2) not null default 0,
  rating: dataNumber,
  //    review_count integer not null default 0,
  reviewCount: dataNumber,
  //    image_url text,
  imageUrl: dataString,
  //    services text[] not null default '{}'::text[],
  services: arrayString,
  //    has_delivery boolean not null default false,
  hasDelivery: getDefaultBoolean(false),
  //    manager_id uuid references public.profiles(id) on delete set null,
  managerId: dataId,
  //    created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //    updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.pharmacists (
  //   id text primary key,
  //   pharmacy_id text not null references public.pharmacies(id) on delete cascade,
  pharmacyId: dataString,
  //   name text not null,
  name: dataString,
  //   license_no text not null,
  licenseNo: dataString,
  //   avatar_url text,
  avatarUrl: dataString,
  //   availability pharmacist_availability not null default 'offline',
  availability: {
    type: String,
    enum: pharmacistAvailabilities,
    default: "offline",
  },
  //   rating numeric(3,2) not null default 0,
  rating: dataNumber,
  //   review_count integer not null default 0,
  reviewCount: dataNumber,
  //   specialties text[] not null default '{}'::text[],
  specialties: arrayString,
  //   method_rates      jsonb     not null default '{"chat":0,"phone":0,"video":0}'::jsonb,
  methodRates: {
    type: Object,
    default: { chat: 0, phone: 0, video: 0 },
  },
  //   booked_slots      text[]    not null default '{}'::text[],
  bookedSlots: arrayString,
  //   consult_durations integer[] not null default '{15,30}'::integer[],
  consultDurations: {
    type: [Number],
    default: [15, 30],
  },
  //   experience        integer   not null default 0,
  experience: dataNumber,
  //   workplace         text      not null default '',
  workplace: dataStringDefault,
  //   languages         text[]    not null default '{}'::text[],
  languages: arrayString,
  //   insurance         text[]    not null default '{}'::text[],
  insurance: arrayString,
  //   bio               text      not null default '',
  bio: dataStringDefault,
  //   next_available    text      not null default '',
  nextAvailable: dataStringDefault,
  //   verification_status verification_status not null default 'pending',
  verificationStatus: {
    type: String,
    enum: verificationStatuses,
    default: "pending",
  },
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.products (
  //   id text primary key,
  //   pharmacy_id text not null references public.pharmacies(id) on delete cascade,
  pharmacyId: dataId,
  //   name text not null,
  name: dataString,
  //   generic_name text not null,
  genericName: dataString,
  //   category text not null,
  category: dataString,
  //   description text not null,
  description: dataString,
  //   price numeric(10,2) not null,
  price: reqNumber,
  //   image_url text,
  imageUrl: dataString,
  //   dosage_form text not null,
  dosageForm: dataString,
  //   strength text not null,
  strength: dataString,
  //   manufacturer text not null,
  manufacturer: dataString,
  //   in_stock boolean not null default true,
  inStock: getDefaultBoolean(true),
  //   stock_quantity integer not null default 0,
  stockQuantity: dataNumber,
  //   warnings text[] not null default '{}'::text[],
  warnings: arrayString,
  //   side_effects text[] not null default '{}'::text[],
  sideEffects: arrayString,
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.triage_sessions (
  //   id uuid primary key default gen_random_uuid(),
  //   user_id uuid not null references public.profiles(id) on delete cascade,
  userId: dataId,
  //   symptoms jsonb not null default '[]'::jsonb,
  symptoms: mongoose.Schema.Types.Mixed,
  //   red_flags text[] not null default '{}'::text[],
  redFlags: arrayString,
  //   has_red_flag boolean not null default false,
  hasRedFlag: getDefaultBoolean(false),
  //   summary jsonb,
  summary: mongoose.Schema.Types.Mixed,
  //   status triage_status not null default 'in_progress',
  status: {
    type: String,
    enum: triageStatuses,
    default: "in_progress",
  },
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.consultations (
  //   id uuid primary key default gen_random_uuid(),
  //   triage_session_id uuid not null unique references public.triage_sessions(id) on delete cascade,
  triageSessionId: dataId,
  //   user_id uuid not null references public.profiles(id) on delete cascade,
  userId: dataId,
  //   pharmacist_id text not null references public.pharmacists(id) on delete restrict,
  pharmacistId: dataId,
  //   pharmacy_id text not null references public.pharmacies(id) on delete restrict,
  pharmacyId: dataId,
  //   status consultation_status not null default 'waiting',
  status: {
    type: String,
    enum: consultationStatuses,
    default: "waiting",
  },
  //   messages jsonb not null default '[]'::jsonb,
  messages: mongoose.Schema.Types.Mixed,
  //   approved_products jsonb not null default '[]'::jsonb,
  approvedProducts: {
    type: Array,
    default: [],
  },
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.patient_handoffs (
  //   id text primary key,
  //   user_id uuid references public.profiles(id) on delete set null,
  userId: dataId,
  //   patient_name text not null,
  patientName: dataString,
  //   age integer,
  age: dataNumber,
  //   gender text,
  gender: dataString,
  //   symptoms text[] not null default '{}'::text[],
  symptoms: arrayString,
  //   duration text,
  duration: dataString,
  //   conditions text[] not null default '{}'::text[],
  conditions: arrayString,
  //   medications text[] not null default '{}'::text[],
  medications: arrayString,
  //   allergies text[] not null default '{}'::text[],
  allergies: arrayString,
  //   patient_summary text,
  patientSummary: dataString,
  //   ai_summary text,
  aiSummary: dataString,
  //   pharmacy_id text references public.pharmacies(id) on delete set null,
  pharmacyId: dataId,
  //   pharmacist_id text references public.pharmacists(id) on delete set null,
  pharmacistId: dataId,
  //   appointment_time timestamptz,
  appointmentTime: dataDate,
  //   fulfillment text,
  fulfillment: dataString,
  //   suggested_action text,
  suggestedAction: dataString,
  //   request_type patient_request_type,
  requestType: {
    type: String,
    enum: patientRequestTypes,
    required: true,
  },
  //   telemedicine_channel telemedicine_channel,
  telemedicineChannel: {
    type: String,
    enum: telemedicineChannels,
    required: true,
  },
  //   telemedicine_patient_note text,
  telemedicinePatientNote: dataString,
  //   telemedicine_collected_data jsonb,
  telemedicineCollectedData: mongoose.Schema.Types.Mixed,
  //   telemedicine_request_time timestamptz,
  telemedicineRequestTime: dataDate,
  //   telemedicine_start_time timestamptz,
  telemedicineStartTime: dataDate,
  //   telemedicine_end_time timestamptz,
  telemedicineEndTime: dataDate,
  //   consult_duration_minutes integer,
  consultDurationMinutes: dataNumber,
  //   status patient_handoff_status not null,
  status: {
    type: String,
    enum: patientHandoffStatuses,
    required: true,
  },
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.telemedicine_rooms (
  //   id uuid primary key default gen_random_uuid(),
  //   task_id text not null unique,
  taskId: dataId,
  //   handoff_id text references public.patient_handoffs(id) on delete set null,
  handoffId: dataId,
  //   room_id text not null unique,
  roomId: dataId,
  //   room_url text not null,
  roomUrl: dataString,
  //   pharmacist_name text not null,
  pharmacistName: dataString,
  //   expires_at timestamptz,
  expiresAt: dataDate,
  //   enable_recording boolean not null default false,
  enableRecording: getDefaultBoolean(false),
  //   max_participants smallint not null default 2,
  maxParticipants: {
    type: Number,
    default: 2,
  },
  //   status text not null default 'active',
  status: {
    type: String,
    default: "active",
    enum: consultationStatuses,
  },
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.telemedicine_messages (
  //   id uuid primary key default gen_random_uuid(),
  //   handoff_id text not null references public.patient_handoffs(id) on delete cascade,
  handoffId: dataId,
  //   sender_type text not null check (sender_type in ('patient', 'pharmacist', 'system')),
  senderType: {
    type: String,
    enum: senderTypes,
    required: true,
  },
  //   sender_name text,
  senderName: dataString,
  //   content text not null,
  content: dataString,
  //   message_type text not null default 'text',
  messageType: {
    type: String,
    default: "text",
  },
  //   created_at timestamptz not null default now()
  createAt: {
    type: Date,
    default: Date.now,
  },
});

new mongoose.Schema({
  // create table if not exists public.orders (
  //   id uuid primary key default gen_random_uuid(),
  //   consultation_id uuid not null references public.consultations(id) on delete cascade,
  consultationId: dataId,
  //   user_id uuid not null references public.profiles(id) on delete cascade,
  userId: dataId,
  //   pharmacy_id text not null references public.pharmacies(id) on delete restrict,
  pharmacyId: dataId,
  //   pharmacist_id text not null references public.pharmacists(id) on delete restrict,
  pharmacistId: dataId,
  //   fulfillment fulfillment_type not null,
  fulfillment: {
    type: String,
    enum: fulfillmentTypes,
    required: true,
  },
  //   status order_status not null default 'pending',
  status: {
    type: String,
    enum: orderStatuses,
    default: "pending",
  },
  //   subtotal numeric(10,2) not null default 0,
  subtotal: dataNumber,
  //   delivery_fee numeric(10,2) not null default 0,
  deliveryFee: dataNumber,
  //   total numeric(10,2) not null default 0,
  total: dataNumber,
  //   otp_code text,
  otpCode: dataString,
  //   estimated_time text,
  estimatedTime: dataString,
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

new mongoose.Schema({
  // create table if not exists public.order_items (
  //   id uuid primary key default gen_random_uuid(),
  //   order_id uuid not null references public.orders(id) on delete cascade,
  orderId: dataId,
  //   product_id text not null references public.products(id) on delete restrict,
  productId: dataId,
  //   name text not null,
  name: dataString,
  //   quantity integer not null check (quantity > 0),
  quantity: reqNumber,
  //   price numeric(10,2) not null,
  price: reqNumber,
  //   instructions text not null default ''
  instructions: dataStringDefault,
});

new mongoose.Schema({
  // create table if not exists public.reviews (
  //   id uuid primary key default gen_random_uuid(),
  //   user_id uuid not null references public.profiles(id) on delete cascade,
  userId: dataId,
  //   user_name text not null,
  userName: dataString,
  //   target_type review_target_type not null,
  targetType: {
    type: String,
    enum: reviewTargetTypes,
    required: true,
  },
  //   target_id text not null,
  targetId: dataId,
  //   consultation_id uuid references public.consultations(id) on delete set null,
  consultationId: dataId,
  //   rating smallint not null check (rating between 1 and 5),
  rating: reqNumber,
  //   comment text not null,
  comment: dataString,
  //   created_at timestamptz not null default now()
  createAt: {
    type: Date,
    default: Date.now,
  },
});

new mongoose.Schema({
  // create table if not exists public.notifications (
  //   id uuid primary key default gen_random_uuid(),
  //   user_id uuid not null references public.profiles(id) on delete cascade,
  userId: dataString,
  //   type notification_type not null,
  type: {
    type: String,
    enum: notificationTypes,
    required: true,
  },
  //   title text not null,
  title: dataString,
  //   message text not null,
  message: dataString,
  //   read boolean not null default false,
  read: getDefaultBoolean(false),
  //   action_url text,
  actionUrl: dataString,
  //   created_at timestamptz not null default now()
  createAt: {
    type: Date,
    default: Date.now,
  },
});

// create index if not exists idx_patient_handoffs_user_id on public.patient_handoffs (user_id);
// create index if not exists idx_patient_handoffs_pharmacy_id on public.patient_handoffs (pharmacy_id);
// create index if not exists idx_patient_handoffs_status on public.patient_handoffs (status);
// create index if not exists idx_consultations_user_id on public.consultations (user_id);
// create index if not exists idx_consultations_pharmacist_id on public.consultations (pharmacist_id);
// create index if not exists idx_consultations_pharmacy_id on public.consultations (pharmacy_id);
// create index if not exists idx_orders_user_id on public.orders (user_id);
// create index if not exists idx_orders_pharmacy_id on public.orders (pharmacy_id);
// create index if not exists idx_telemedicine_rooms_task_id on public.telemedicine_rooms (task_id);
// create index if not exists idx_telemedicine_rooms_handoff_id on public.telemedicine_rooms (handoff_id);

// drop trigger if exists set_profiles_updated_at on public.profiles;
// create trigger set_profiles_updated_at
// before update on public.profiles
// for each row execute function public.set_updated_at();

// drop trigger if exists set_patient_profiles_updated_at on public.patient_profiles;
// create trigger set_patient_profiles_updated_at
// before update on public.patient_profiles
// for each row execute function public.set_updated_at();

// drop trigger if exists set_pharmacies_updated_at on public.pharmacies;
// create trigger set_pharmacies_updated_at
// before update on public.pharmacies
// for each row execute function public.set_updated_at();

// drop trigger if exists set_pharmacists_updated_at on public.pharmacists;
// create trigger set_pharmacists_updated_at
// before update on public.pharmacists
// for each row execute function public.set_updated_at();

// drop trigger if exists set_products_updated_at on public.products;
// create trigger set_products_updated_at
// before update on public.products
// for each row execute function public.set_updated_at();

// drop trigger if exists set_triage_sessions_updated_at on public.triage_sessions;
// create trigger set_triage_sessions_updated_at
// before update on public.triage_sessions
// for each row execute function public.set_updated_at();

// drop trigger if exists set_consultations_updated_at on public.consultations;
// create trigger set_consultations_updated_at
// before update on public.consultations
// for each row execute function public.set_updated_at();

// drop trigger if exists set_patient_handoffs_updated_at on public.patient_handoffs;
// create trigger set_patient_handoffs_updated_at
// before update on public.patient_handoffs
// for each row execute function public.set_updated_at();

// drop trigger if exists set_telemedicine_rooms_updated_at on public.telemedicine_rooms;
// create trigger set_telemedicine_rooms_updated_at
// before update on public.telemedicine_rooms
// for each row execute function public.set_updated_at();

// drop trigger if exists set_orders_updated_at on public.orders;
// create trigger set_orders_updated_at
// before update on public.orders
// for each row execute function public.set_updated_at();

// alter table public.profiles enable row level security;
// alter table public.patient_profiles enable row level security;

// -- Clipboard preset table for quick copy templates
new mongoose.Schema({
  // CREATE TABLE IF NOT EXISTS public.patient_clipboards (
  //   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  //   user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  userId: dataId,
  //   name text NOT NULL DEFAULT 'กระดานข้อมูล',
  name: {
    type: String,
    default: "กระดานข้อมูล",
  },
  //   is_default boolean NOT NULL DEFAULT false,
  isDefault: getDefaultBoolean(false),
  //   fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  fields: mongoose.Schema.Types.Mixed,
  //   created_at timestamptz NOT NULL DEFAULT now(),
  createAt: {
    type: Date,
    default: Date.now,
  },
  //   updated_at timestamptz NOT NULL DEFAULT now()
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // );
});

// ALTER TABLE public.patient_clipboards ENABLE ROW LEVEL SECURITY;
// alter table public.pharmacies enable row level security;
// alter table public.pharmacists enable row level security;
// alter table public.products enable row level security;
// alter table public.triage_sessions enable row level security;
// alter table public.consultations enable row level security;
// alter table public.patient_handoffs enable row level security;
// alter table public.telemedicine_rooms enable row level security;
// alter table public.telemedicine_messages enable row level security;
// alter table public.orders enable row level security;
// alter table public.order_items enable row level security;
// alter table public.reviews enable row level security;
// alter table public.notifications enable row level security;

// create policy "profiles are viewable by owner"
// on public.profiles for select
// using (auth.uid() = id);

// create policy "profiles are insertable by authenticated users"
// on public.profiles for insert
// with check (auth.uid() = id);

// create policy "profiles are updatable by owner"
// on public.profiles for update
// using (auth.uid() = id)
// with check (auth.uid() = id);

// create policy "patient profiles are viewable by owner"
// on public.patient_profiles for select
// using (auth.uid() = user_id);

// create policy "patient profiles are insertable by owner"
// on public.patient_profiles for insert
// with check (auth.uid() = user_id);

// create policy "patient profiles are updatable by owner"
// on public.patient_profiles for update
// using (auth.uid() = user_id)
// with check (auth.uid() = user_id);

// create policy "patient clipboards are viewable by owner"
// on public.patient_clipboards for select
// using (auth.uid() = user_id);

// create policy "patient clipboards are insertable by owner"
// on public.patient_clipboards for insert
// with check (auth.uid() = user_id);

// create policy "patient clipboards are updatable by owner"
// on public.patient_clipboards for update
// using (auth.uid() = user_id)
// with check (auth.uid() = user_id);

// create policy "patient clipboards are deletable by owner"
// on public.patient_clipboards for delete
// using (auth.uid() = user_id);

// drop trigger if exists set_patient_clipboards_updated_at on public.patient_clipboards;
// create trigger set_patient_clipboards_updated_at
// before update on public.patient_clipboards
// for each row execute function public.set_updated_at();

// create policy "public can read pharmacies"
// on public.pharmacies for select
// using (true);

// create policy "admins and managers can insert pharmacies"
// on public.pharmacies for insert
// with check (
//   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') or
//   (exists (select 1 from public.profiles where id = auth.uid() and role = 'pharmacy_admin') and manager_id = auth.uid())
// );

// create policy "admins and managers can update pharmacies"
// on public.pharmacies for update
// using (
//   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') or
//   manager_id = auth.uid()
// );

// create policy "admins can delete pharmacies"
// on public.pharmacies for delete
// using (
//   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
// );

// create policy "public can read pharmacists"
// on public.pharmacists for select
// using (true);

// create policy "admins and managers can insert pharmacists"
// on public.pharmacists for insert
// with check (
//   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') or
//   exists (select 1 from public.pharmacies where id = pharmacy_id and manager_id = auth.uid())
// );

// create policy "admins and managers can update pharmacists"
// on public.pharmacists for update
// using (
//   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') or
//   exists (select 1 from public.pharmacies where id = pharmacy_id and manager_id = auth.uid())
// );

// create policy "admins and managers can delete pharmacists"
// on public.pharmacists for delete
// using (
//   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') or
//   exists (select 1 from public.pharmacies where id = pharmacy_id and manager_id = auth.uid())
// );

// create policy "public can read products"
// on public.products for select
// using (true);

// create policy "users can read their triage sessions"
// on public.triage_sessions for select
// using (auth.uid() = user_id);

// create policy "users can insert their triage sessions"
// on public.triage_sessions for insert
// with check (auth.uid() = user_id);

// create policy "users can update their triage sessions"
// on public.triage_sessions for update
// using (auth.uid() = user_id)
// with check (auth.uid() = user_id);

// create policy "users can read related consultations"
// on public.consultations for select
// using (auth.uid() = user_id);

// create policy "users can insert consultations"
// on public.consultations for insert
// with check (auth.uid() = user_id);

// create policy "users can update related consultations"
// on public.consultations for update
// using (auth.uid() = user_id)
// with check (auth.uid() = user_id);

// create policy "users can read their handoffs"
// on public.patient_handoffs for select
// using (
//   auth.uid() = user_id or
//   exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'pharmacist')) or
//   exists (select 1 from public.pharmacies where id = pharmacy_id and manager_id = auth.uid())
// );

// create policy "users can insert their handoffs"
// on public.patient_handoffs for insert
// with check (auth.uid() = user_id);

// create policy "users can update their handoffs"
// on public.patient_handoffs for update
// using (
//   auth.uid() = user_id or
//   exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'pharmacist')) or
//   exists (select 1 from public.pharmacies where id = pharmacy_id and manager_id = auth.uid())
// );

// create policy "authenticated users can read telemedicine rooms"
// on public.telemedicine_rooms for select
// using (auth.role() = 'authenticated');

// create policy "authenticated users can read telemedicine messages"
// on public.telemedicine_messages for select
// using (auth.role() = 'authenticated');

// create policy "authenticated users can insert telemedicine messages"
// on public.telemedicine_messages for insert
// with check (auth.role() = 'authenticated');

// create policy "users can read their orders"
// on public.orders for select
// using (
//   auth.uid() = user_id or
//   exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'pharmacist')) or
//   exists (select 1 from public.pharmacies where id = pharmacy_id and manager_id = auth.uid())
// );

// create policy "users can insert their orders"
// on public.orders for insert
// with check (auth.uid() = user_id);

// create policy "users can update their orders"
// on public.orders for update
// using (
//   auth.uid() = user_id or
//   exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'pharmacist')) or
//   exists (select 1 from public.pharmacies where id = pharmacy_id and manager_id = auth.uid())
// );

// create policy "users can read their order items"
// on public.order_items for select
// using (
//   exists (
//     select 1 from public.orders o
//     where o.id = order_id and (
//       o.user_id = auth.uid() or
//       exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'pharmacist')) or
//       exists (select 1 from public.pharmacies where id = o.pharmacy_id and manager_id = auth.uid())
//     )
//   )
// );

// create policy "users can read their reviews"
// on public.reviews for select
// using (auth.uid() = user_id);

// create policy "users can insert their reviews"
// on public.reviews for insert
// with check (auth.uid() = user_id);

// create policy "users can read their notifications"
// on public.notifications for select
// using (auth.uid() = user_id);

// create policy "users can update their notifications"
// on public.notifications for update
// using (auth.uid() = user_id)
// with check (auth.uid() = user_id);

// -- ============================================================
// -- ARTICLES SYSTEM (Pharmacist Articles & Admin Approval)
// -- ============================================================
new mongoose.Schema({
  // create table if not exists public.articles (
  //   id text primary key,
  //   title text not null,
  title: dataString,
  //   category text not null,
  category: dataString,
  //   cover_image text,
  coverImage: dataString,
  //   excerpt text not null,
  excerpt: dataString,
  //   body text not null,
  body: dataString,
  //   author_id text not null references public.pharmacists(id) on delete cascade,
  authorId: dataId,
  //   is_ai_generated boolean not null default false,
  isAiGenerated: getDefaultBoolean(false),
  //   tags text[] not null default '{}'::text[],
  tags: arrayString,
  //   views integer not null default 0,
  views: dataNumber,
  //   status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  status: {
    type: String,
    enum: articleStatuses,
    default: "pending",
  },
  //   created_at timestamptz not null default now(),
  createAt: {
    type: Date,
    default: Date.now, // Fix: Passed as reference to avoid server boot-time trap
  },
  //   updated_at timestamptz not null default now()
  updateAt: {
    type: Date,
    default: Date.now, // Fix: Passed as reference to avoid server boot-time trap
  },
  // );
});

// alter table public.articles enable row level security;

// drop trigger if exists set_articles_updated_at on public.articles;
// create trigger set_articles_updated_at
// before update on public.articles
// for each row execute function public.set_updated_at();

// create policy "anyone can read approved articles"
// on public.articles for select
// using (
//   status = 'approved'
//   or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
//   or author_id in (
//     select id from public.pharmacists
//     where name = (select full_name from public.profiles where id = auth.uid())
//   )
// );

// create policy "pharmacists can insert articles"
// on public.articles for insert
// with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'pharmacist'));

// create policy "pharmacists can update their own articles"
// on public.articles for update
// using (
//   exists (select 1 from public.profiles where id = auth.uid() and role = 'pharmacist')
// );

// create policy "admins can do anything with articles"
// on public.articles for all
// using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
