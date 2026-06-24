-- Generated Supabase Migration Script

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL,
  is_aigenerated BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  views NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triage_session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pharmacist_id UUID NOT NULL,
  pharmacy_id UUID NOT NULL,
  status TEXT DEFAULT 'waiting',
  messages JSONB,
  approved_products JSONB DEFAULT '[]'::jsonb,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pharmacy_id UUID NOT NULL,
  pharmacist_id UUID NOT NULL,
  fulfillment TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  subtotal NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  otp_code TEXT NOT NULL,
  estimated_time TEXT NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  instructions TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS patient_clipboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT DEFAULT 'กระดานข้อมูล',
  is_default BOOLEAN DEFAULT false,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  age NUMERIC DEFAULT 0,
  gender TEXT NOT NULL,
  symptoms JSONB DEFAULT '[]'::jsonb,
  duration TEXT NOT NULL,
  conditions JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  patient_summary TEXT NOT NULL,
  ai_summary TEXT NOT NULL,
  pharmacy_id UUID NOT NULL,
  pharmacist_id UUID NOT NULL,
  appointment_time TIMESTAMPTZ NOT NULL,
  fulfillment TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  request_type TEXT NOT NULL,
  telemedicine_channel TEXT NOT NULL,
  telemedicine_patient_note TEXT NOT NULL,
  telemedicine_collected_data JSONB,
  telemedicine_request_time TIMESTAMPTZ NOT NULL,
  telemedicine_start_time TIMESTAMPTZ NOT NULL,
  telemedicine_end_time TIMESTAMPTZ NOT NULL,
  consult_duration_minutes NUMERIC DEFAULT 0,
  status TEXT NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  telemedicine_room_id UUID,
  chat_ids JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  allergies JSONB DEFAULT '[]'::jsonb,
  conditions JSONB DEFAULT '[]'::jsonb,
  current_medications JSONB DEFAULT '[]'::jsonb,
  is_pregnant BOOLEAN DEFAULT false,
  is_breastfeeding BOOLEAN DEFAULT false,
  blood_type TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  patient_handoff_ids JSONB DEFAULT '[]'::jsonb,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS pharmacists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL,
  name TEXT NOT NULL,
  license_no TEXT NOT NULL,
  avatar_url TEXT,
  availability TEXT DEFAULT 'offline',
  rating NUMERIC DEFAULT 0,
  review_count NUMERIC DEFAULT 0,
  specialties JSONB DEFAULT '[]'::jsonb,
  method_rates JSONB DEFAULT '{}'::jsonb,
  booked_slots JSONB DEFAULT '[]'::jsonb,
  consult_durations JSONB DEFAULT '[15,30]'::jsonb,
  experience NUMERIC DEFAULT 0,
  workplace TEXT DEFAULT '',
  languages JSONB DEFAULT '[]'::jsonb,
  insurance JSONB DEFAULT '[]'::jsonb,
  bio TEXT DEFAULT '',
  next_available TEXT DEFAULT '',
  verification_status TEXT DEFAULT 'pending',
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  articles_ids JSONB DEFAULT '[]'::jsonb,
  patient_handoff_ids JSONB DEFAULT '[]'::jsonb,
  order_ids JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS pharmacys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  phone TEXT NOT NULL,
  opening_hours JSONB DEFAULT '[]'::jsonb,
  verification_status TEXT DEFAULT 'pending',
  rating NUMERIC DEFAULT 0,
  review_count NUMERIC DEFAULT 0,
  image_url TEXT NOT NULL,
  services JSONB DEFAULT '[]'::jsonb,
  has_delivery BOOLEAN DEFAULT false,
  manager_id UUID NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  pharmacist_ids JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL,
  name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  dosage_form TEXT NOT NULL,
  strength TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity NUMERIC DEFAULT 0,
  warnings JSONB DEFAULT '[]'::jsonb,
  side_effects JSONB DEFAULT '[]'::jsonb,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'patient',
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  role_id UUID
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  consultation_id UUID NOT NULL,
  rating NUMERIC NOT NULL,
  comment TEXT NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemedicine_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id UUID NOT NULL,
  sender_type TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemedicine_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  handoff_id UUID NOT NULL,
  room_identifier TEXT NOT NULL,
  room_url TEXT NOT NULL,
  pharmacist_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  enable_recording BOOLEAN DEFAULT false,
  max_participants NUMERIC DEFAULT 2,
  status TEXT DEFAULT 'active',
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS triage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symptoms JSONB,
  red_flags JSONB DEFAULT '[]'::jsonb,
  has_red_flag BOOLEAN DEFAULT false,
  summary JSONB,
  status TEXT DEFAULT 'in_progress',
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

