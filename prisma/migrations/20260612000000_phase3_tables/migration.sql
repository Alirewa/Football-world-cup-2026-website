-- Phase 3: New tables — Language, EmailSetting, SmsSetting, Rule, Prize

CREATE TABLE languages (
  code        VARCHAR(5)  NOT NULL,
  name        VARCHAR(50) NOT NULL,
  native_name VARCHAR(50) NOT NULL,
  direction   VARCHAR(3)  NOT NULL DEFAULT 'ltr',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  is_default  BOOLEAN     NOT NULL DEFAULT false,
  sort_order  INT         NOT NULL DEFAULT 0,
  CONSTRAINT languages_pkey PRIMARY KEY (code)
);

CREATE TABLE email_settings (
  key   VARCHAR(100) NOT NULL,
  value TEXT         NOT NULL,
  CONSTRAINT email_settings_pkey PRIMARY KEY (key)
);

CREATE TABLE sms_settings (
  key   VARCHAR(100) NOT NULL,
  value TEXT         NOT NULL,
  CONSTRAINT sms_settings_pkey PRIMARY KEY (key)
);

CREATE TABLE rules (
  id          UUID         NOT NULL DEFAULT gen_random_uuid(),
  title_fa    VARCHAR(200) NOT NULL,
  title_en    VARCHAR(200) NOT NULL,
  content_fa  TEXT         NOT NULL,
  content_en  TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  updated_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT rules_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_rules_sort ON rules (sort_order);

CREATE TABLE prizes (
  id            UUID          NOT NULL DEFAULT gen_random_uuid(),
  title_fa      VARCHAR(200)  NOT NULL,
  title_en      VARCHAR(200)  NOT NULL,
  content_fa    TEXT          NOT NULL,
  content_en    TEXT          NOT NULL,
  rank_position INT,
  prize_value   VARCHAR(100),
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  sort_order    INT           NOT NULL DEFAULT 0,
  updated_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT prizes_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_prizes_sort ON prizes (sort_order);

-- Seed default languages
INSERT INTO languages (code, name, native_name, direction, is_active, is_default, sort_order) VALUES
  ('fa', 'Persian', 'فارسی', 'rtl', true,  true,  1),
  ('en', 'English', 'English', 'ltr', true, false, 2)
ON CONFLICT (code) DO NOTHING;

-- Seed default email settings (disabled by default — admin must configure)
INSERT INTO email_settings (key, value) VALUES
  ('enabled',     'false'),
  ('smtp_host',   ''),
  ('smtp_port',   '587'),
  ('smtp_user',   ''),
  ('smtp_pass',   ''),
  ('smtp_from',   ''),
  ('smtp_secure', 'false')
ON CONFLICT (key) DO NOTHING;

-- Seed default SMS settings (populated from Kaveh Negar env vars during first run)
INSERT INTO sms_settings (key, value) VALUES
  ('provider',         'kaveh_negar'),
  ('fallback_enabled', 'false'),
  ('sender',           ''),
  ('template_otp',     '')
ON CONFLICT (key) DO NOTHING;
