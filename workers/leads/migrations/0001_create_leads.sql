-- Cloudflare D1 archive for contact enquiries. Contains personal data.
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  service TEXT NOT NULL,
  details TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  landing TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '',
  utm_term TEXT NOT NULL DEFAULT '',
  notify_state TEXT NOT NULL DEFAULT 'pending' CHECK (notify_state IN ('pending','sent')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  notified_at INTEGER,
  last_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_leads_retry ON leads(notify_state,next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_leads_date ON leads(created_at);
