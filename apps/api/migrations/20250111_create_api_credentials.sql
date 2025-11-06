-- Create api_credentials table for storing encrypted API keys and webhook URLs
CREATE TABLE IF NOT EXISTS api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  api_key TEXT, -- Encrypted in application layer before storing
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique service per user
  UNIQUE(user_id, service_name)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_credentials_user_id ON api_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_api_credentials_service_name ON api_credentials(service_name);

-- Enable RLS (Row Level Security)
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own credentials
CREATE POLICY "Users can view own credentials"
  ON api_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own credentials
CREATE POLICY "Users can insert own credentials"
  ON api_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own credentials
CREATE POLICY "Users can update own credentials"
  ON api_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own credentials
CREATE POLICY "Users can delete own credentials"
  ON api_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE api_credentials IS 'Stores encrypted API keys and webhook URLs for external services (OpenAI, PhantomBuster, Instantly.ai, N8N, etc.)';





