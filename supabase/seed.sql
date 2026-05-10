-- Seed data for development

-- Countries
INSERT INTO countries (name, code, flag_emoji, region) VALUES
  ('United Kingdom', 'GB', '🇬🇧', 'Europe'),
  ('France', 'FR', '🇫🇷', 'Europe'),
  ('Germany', 'DE', '🇩🇪', 'Europe'),
  ('Italy', 'IT', '🇮🇹', 'Europe'),
  ('Spain', 'ES', '🇪🇸', 'Europe'),
  ('Portugal', 'PT', '🇵🇹', 'Europe'),
  ('Netherlands', 'NL', '🇳🇱', 'Europe'),
  ('Switzerland', 'CH', '🇨🇭', 'Europe'),
  ('United States', 'US', '🇺🇸', 'North America'),
  ('Canada', 'CA', '🇨🇦', 'North America'),
  ('Mexico', 'MX', '🇲🇽', 'North America'),
  ('Japan', 'JP', '🇯🇵', 'Asia'),
  ('South Korea', 'KR', '🇰🇷', 'Asia'),
  ('Thailand', 'TH', '🇹🇭', 'Asia'),
  ('Australia', 'AU', '🇦🇺', 'Oceania'),
  ('Global', 'XX', '🌍', 'Global')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, flag_emoji = EXCLUDED.flag_emoji, region = EXCLUDED.region;

-- Get country IDs for plan insertion
DO $$
DECLARE
  gb_id UUID;
  fr_id UUID;
  de_id UUID;
  it_id UUID;
  es_id UUID;
  us_id UUID;
  jp_id UUID;
  global_id UUID;
BEGIN
  SELECT id INTO gb_id FROM countries WHERE code = 'GB';
  SELECT id INTO fr_id FROM countries WHERE code = 'FR';
  SELECT id INTO de_id FROM countries WHERE code = 'DE';
  SELECT id INTO it_id FROM countries WHERE code = 'IT';
  SELECT id INTO es_id FROM countries WHERE code = 'ES';
  SELECT id INTO us_id FROM countries WHERE code = 'US';
  SELECT id INTO jp_id FROM countries WHERE code = 'JP';
  SELECT id INTO global_id FROM countries WHERE code = 'XX';

  -- Delete existing plans to avoid duplicates on re-seed
  DELETE FROM plans;

  -- Country plans
  INSERT INTO plans (country_id, name, description, data_amount_gb, validity_days, price_cents, coverage_type, popular, apn) VALUES
    (gb_id, 'UK 5GB', '5GB high-speed data across the United Kingdom. Perfect for a week trip.', 5, 14, 999, 'country', false, 'internet'),
    (gb_id, 'UK 20GB', '20GB high-speed data in the United Kingdom. Great for longer stays.', 20, 30, 1999, 'country', true, 'internet'),
    (gb_id, 'UK 50GB', '50GB for heavy data users in the UK. Stream, work, and navigate freely.', 50, 30, 3499, 'country', false, 'internet'),

    (fr_id, 'France 10GB', '10GB high-speed data throughout France. Covers Paris, Lyon, and rural areas.', 10, 14, 1299, 'country', false, 'internet'),
    (fr_id, 'France 30GB', '30GB across France. Ideal for digital nomads and long holidays.', 30, 30, 2799, 'country', true, 'internet'),

    (de_id, 'Germany 10GB', '10GB across Germany on the best networks.', 10, 14, 1299, 'country', false, 'internet'),
    (de_id, 'Germany 30GB', '30GB for Germany. Reliable coverage nationwide.', 30, 30, 2799, 'country', false, 'internet'),

    (it_id, 'Italy 15GB', '15GB throughout Italy. From Milan to Sicily.', 15, 21, 1599, 'country', true, 'internet'),
    (es_id, 'Spain 15GB', '15GB across Spain including the Canary Islands.', 15, 21, 1499, 'country', false, 'internet'),

    (us_id, 'USA 10GB', '10GB across the United States on top networks.', 10, 14, 1499, 'country', false, 'internet'),
    (us_id, 'USA 30GB', '30GB USA-wide coverage. Great for road trips.', 30, 30, 2999, 'country', true, 'internet'),
    (us_id, 'USA Unlimited', 'Unlimited data in the USA (fair use policy applies after 50GB).', 50, 30, 4499, 'country', false, 'internet'),

    (jp_id, 'Japan 10GB', '10GB high-speed data throughout Japan.', 10, 14, 1399, 'country', true, 'internet'),
    (jp_id, 'Japan 30GB', '30GB for Japan. Perfect for extended travel.', 30, 30, 2999, 'country', false, 'internet');

  -- Regional plans
  INSERT INTO plans (country_id, name, description, data_amount_gb, validity_days, price_cents, coverage_type, coverage_region, popular, apn) VALUES
    (global_id, 'Europe 10GB', '10GB across 30+ European countries. One eSIM for the whole trip.', 10, 14, 1199, 'regional', 'Europe', true, 'internet'),
    (global_id, 'Europe 50GB', '50GB across Europe. Stream, navigate, and work anywhere in the EU.', 50, 30, 3499, 'regional', 'Europe', true, 'internet'),
    (global_id, 'Asia 15GB', '15GB across 12 Asian countries including Japan, Korea, Thailand, and more.', 15, 21, 1999, 'regional', 'Asia', false, 'internet'),
    (global_id, 'Global 20GB', '20GB global eSIM. Works in 100+ countries worldwide.', 20, 30, 2999, 'regional', 'Global', true, 'internet');
END $$;
