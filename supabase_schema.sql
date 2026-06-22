-- Generated Supabase Migration Script

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  coverImage TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  authorId UUID NOT NULL,
  isAIGenerated BOOLEAN,
  tags JSONB,
  views NUMERIC,
  status TEXT,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triageSessionId UUID NOT NULL,
  userId UUID NOT NULL,
  pharmacistId UUID NOT NULL,
  pharmacyId UUID NOT NULL,
  status TEXT,
  messages JSONB,
  approvedProducts JSONB,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN,
  actionUrl TEXT NOT NULL,
  createAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultationId UUID NOT NULL,
  userId UUID NOT NULL,
  pharmacyId UUID NOT NULL,
  pharmacistId UUID NOT NULL,
  fulfillment TEXT NOT NULL,
  status TEXT,
  subtotal NUMERIC,
  deliveryFee NUMERIC,
  total NUMERIC,
  otpCode TEXT NOT NULL,
  estimatedTime TEXT NOT NULL,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orderitems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID NOT NULL,
  productId UUID NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  instructions TEXT
);

CREATE TABLE IF NOT EXISTS patientclipboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  name TEXT,
  isDefault BOOLEAN,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patienthandoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  patientName TEXT NOT NULL,
  age NUMERIC,
  gender TEXT NOT NULL,
  symptoms JSONB,
  duration TEXT NOT NULL,
  conditions JSONB,
  medications JSONB,
  allergies JSONB,
  patientSummary TEXT NOT NULL,
  aiSummary TEXT NOT NULL,
  pharmacyId UUID NOT NULL,
  pharmacistId UUID NOT NULL,
  appointmentTime TIMESTAMPTZ NOT NULL,
  fulfillment TEXT NOT NULL,
  suggestedAction TEXT NOT NULL,
  requestType TEXT NOT NULL,
  telemedicineChannel TEXT NOT NULL,
  telemedicinePatientNote TEXT NOT NULL,
  telemedicineCollectedData JSONB,
  telemedicineRequestTime TIMESTAMPTZ NOT NULL,
  telemedicineStartTime TIMESTAMPTZ NOT NULL,
  telemedicineEndTime TIMESTAMPTZ NOT NULL,
  consultDurationMinutes NUMERIC,
  status TEXT NOT NULL,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now(),
  telemedicineRoomId UUID,
  chatIds JSONB
);

CREATE TABLE IF NOT EXISTS patientprofiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  gender TEXT NOT NULL,
  age NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  allergies JSONB,
  conditions JSONB,
  currentMedications JSONB,
  isPregnant BOOLEAN,
  isBreastfeeding BOOLEAN,
  bloodType TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  patientHandoffIds JSONB,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now(),
  userId UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS pharmacists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacyId UUID NOT NULL,
  name TEXT NOT NULL,
  licenseNo TEXT NOT NULL,
  avatarUrl TEXT NOT NULL,
  availability TEXT,
  rating NUMERIC,
  reviewCount NUMERIC,
  specialties JSONB,
  methodRates JSONB,
  bookedSlots JSONB,
  consultDurations JSONB,
  experience NUMERIC,
  workplace TEXT,
  languages JSONB,
  insurance JSONB,
  bio TEXT,
  nextAvailable TEXT,
  verificationStatus TEXT,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now(),
  articlesIds JSONB,
  patientHandoffIds JSONB,
  orderIds JSONB
);

CREATE TABLE IF NOT EXISTS pharmacys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  phone TEXT NOT NULL,
  openingHours JSONB,
  verificationStatus TEXT,
  rating NUMERIC,
  reviewCount NUMERIC,
  imageUrl TEXT NOT NULL,
  services JSONB,
  hasDelivery BOOLEAN,
  managerId UUID NOT NULL,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now(),
  pharmacistIds JSONB
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacyId UUID NOT NULL,
  name TEXT NOT NULL,
  genericName TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  imageUrl TEXT NOT NULL,
  dosageForm TEXT NOT NULL,
  strength TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  inStock BOOLEAN,
  stockQuantity NUMERIC,
  warnings JSONB,
  sideEffects JSONB,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  avatarUrl TEXT NOT NULL,
  role TEXT,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now(),
  roleId UUID
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  userName TEXT NOT NULL,
  targetType TEXT NOT NULL,
  targetId UUID NOT NULL,
  consultationId UUID NOT NULL,
  rating NUMERIC NOT NULL,
  comment TEXT NOT NULL,
  createAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemedicinemessages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoffId UUID NOT NULL,
  senderType TEXT NOT NULL,
  senderName TEXT NOT NULL,
  content TEXT NOT NULL,
  messageType TEXT,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemedicinerooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taskId UUID NOT NULL,
  handoffId UUID NOT NULL,
  roomIdentifier TEXT NOT NULL,
  roomUrl TEXT NOT NULL,
  pharmacistName TEXT NOT NULL,
  expiresAt TIMESTAMPTZ,
  enableRecording BOOLEAN,
  maxParticipants NUMERIC,
  status TEXT,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS triagesessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  symptoms JSONB,
  redFlags JSONB,
  hasRedFlag BOOLEAN,
  summary JSONB,
  status TEXT,
  createAt TIMESTAMPTZ DEFAULT now(),
  updateAt TIMESTAMPTZ DEFAULT now()
);

