-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reservation status enum
CREATE TYPE reservation_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'checked_in',
  'checked_out'
);

-- Rooms table
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  capacity    INT  NOT NULL DEFAULT 2,
  price_per_night INT NOT NULL, -- in JPY
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reservations table
CREATE TABLE reservations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id                 UUID NOT NULL REFERENCES rooms(id),
  guest_name              TEXT NOT NULL,
  guest_email             TEXT NOT NULL,
  guest_phone             TEXT,
  check_in                DATE NOT NULL,
  check_out               DATE NOT NULL,
  num_guests              INT  NOT NULL DEFAULT 1,
  total_price             INT  NOT NULL, -- in JPY
  status                  reservation_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_session_id        TEXT,
  sesame_pin               TEXT,
  notes                    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT check_dates CHECK (check_out > check_in),
  CONSTRAINT check_guests CHECK (num_guests >= 1),
  CONSTRAINT check_price CHECK (total_price >= 0)
);

-- Index for availability check
CREATE INDEX reservations_room_dates ON reservations (room_id, check_in, check_out)
  WHERE status IN ('pending', 'confirmed', 'checked_in');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed: 5 rooms
INSERT INTO rooms (name, description, capacity, price_per_night) VALUES
  ('SAKURA（桜）', '1階・和モダンシングルルーム。畳ベッドフレームと桜の装飾。', 1, 5500),
  ('FUJI（富士）', '2階・ダブルルーム。富士山の絵画が特徴のゆったりした和室。', 2, 8800),
  ('MOMIJI（紅葉）', '2階・シングルルーム。紅葉をモチーフにした落ち着いた空間。', 1, 5500),
  ('MATSU（松）', '3階・ダブルルーム。松をモチーフにした禅スタイルの部屋。', 2, 9500),
  ('TAKE（竹）', '3階・ファミリールーム。竹をモチーフにした広々とした部屋。', 4, 14000);

-- RLS Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Rooms: publicly readable
CREATE POLICY "rooms_public_read" ON rooms
  FOR SELECT USING (is_active = TRUE);

-- Reservations: anyone can insert (for booking)
CREATE POLICY "reservations_insert" ON reservations
  FOR INSERT WITH CHECK (TRUE);

-- Reservations: guests can read their own
CREATE POLICY "reservations_guest_read" ON reservations
  FOR SELECT USING (guest_email = current_setting('request.jwt.claims', TRUE)::json->>'email');
