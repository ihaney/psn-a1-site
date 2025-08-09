-- Enable pgvector extension (no‑op if already exists)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column for 1536‑dim vectors
ALTER TABLE public."Products"
  ADD COLUMN IF NOT EXISTS embedding vector(1536);
