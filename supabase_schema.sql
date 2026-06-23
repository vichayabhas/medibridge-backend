-- Generated Supabase Migration Script

CREATE TABLE IF NOT EXISTS article (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL,
  is_aigenerated BOOLEAN,
  tags JSONB,
  views NUMERIC,
  status TEXT,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triage_session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pharmacist_id UUID NOT NULL,
  pharmacy_id UUID NOT NULL,
  status TEXT,
  messages JSONB,
  approved_products JSONB,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN,
  action_url TEXT NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pharmacy_id UUID NOT NULL,
  pharmacist_id UUID NOT NULL,
  fulfillment TEXT NOT NULL,
  status TEXT,
  subtotal NUMERIC,
  delivery_fee NUMERIC,
  total NUMERIC,
  otp_code TEXT NOT NULL,
  estimated_time TEXT NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  instructions TEXT
);

CREATE TABLE IF NOT EXISTS patient_clipboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT,
  is_default BOOLEAN,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_handoff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  age NUMERIC,
  gender TEXT NOT NULL,
  symptoms JSONB,
  duration TEXT NOT NULL,
  conditions JSONB,
  medications JSONB,
  allergies JSONB,
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
  consult_duration_minutes NUMERIC,
  status TEXT NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  telemedicine_room_id UUID,
  chat_ids JSONB
);

CREATE TABLE IF NOT EXISTS patient_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  allergies JSONB,
  conditions JSONB,
  current_medications JSONB,
  is_pregnant BOOLEAN,
  is_breastfeeding BOOLEAN,
  blood_type TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  patient_handoff_ids JSONB,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS pharmacist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL,
  name TEXT NOT NULL,
  license_no TEXT NOT NULL,
  avatar_url TEXT,
  availability TEXT,
  rating NUMERIC,
  review_count NUMERIC,
  specialties JSONB,
  method_rates JSONB,
  booked_slots JSONB,
  consult_durations JSONB,
  experience NUMERIC,
  workplace TEXT,
  languages JSONB,
  insurance JSONB,
  bio TEXT,
  next_available TEXT,
  verification_status TEXT,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  articles_ids JSONB,
  patient_handoff_ids JSONB,
  order_ids JSONB
);

CREATE TABLE IF NOT EXISTS pharmacy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  phone TEXT NOT NULL,
  opening_hours JSONB,
  verification_status TEXT,
  rating NUMERIC,
  review_count NUMERIC,
  image_url TEXT NOT NULL,
  services JSONB,
  has_delivery BOOLEAN,
  manager_id UUID NOT NULL,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  pharmacist_ids JSONB
);

CREATE TABLE IF NOT EXISTS product (
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
  in_stock BOOLEAN,
  stock_quantity NUMERIC,
  warnings JSONB,
  side_effects JSONB,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  role_id UUID
);

CREATE TABLE IF NOT EXISTS review (
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

CREATE TABLE IF NOT EXISTS telemedicine_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id UUID NOT NULL,
  sender_type TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemedicine_room (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  handoff_id UUID NOT NULL,
  room_identifier TEXT NOT NULL,
  room_url TEXT NOT NULL,
  pharmacist_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  enable_recording BOOLEAN,
  max_participants NUMERIC,
  status TEXT,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS triage_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symptoms JSONB,
  red_flags JSONB,
  has_red_flag BOOLEAN,
  summary JSONB,
  status TEXT,
  create_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now()
);

