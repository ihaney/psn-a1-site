/*
  # Lead Tracking System

  1. New Tables
    - `leads`
      - `lead_id` (text, primary key)
      - `supplier_id` (text)
      - `sent_at` (timestamp with default now())
      - `opened_at` (timestamp nullable)
      - `delivered_at` (timestamp nullable)
      - `read_at` (timestamp nullable)
      - `replied_at` (timestamp nullable)
      - `billed` (boolean default false)

    - `lead_metrics_summary`
      - `id` (uuid, primary key)
      - `date` (date)
      - `total_leads` (integer)
      - `opened_leads` (integer)
      - `delivered_leads` (integer)
      - `read_leads` (integer)
      - `replied_leads` (integer)
      - `open_rate` (decimal)
      - `delivery_rate` (decimal)
      - `read_rate` (decimal)
      - `reply_rate` (decimal)
      - `created_at` (timestamp)

    - `supplier_phone_mapping`
      - `id` (uuid, primary key)
      - `phone_number` (text, unique)
      - `supplier_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  lead_id text PRIMARY KEY,
  supplier_id text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  opened_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  billed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create lead metrics summary table
CREATE TABLE IF NOT EXISTS lead_metrics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_leads integer NOT NULL DEFAULT 0,
  opened_leads integer NOT NULL DEFAULT 0,
  delivered_leads integer NOT NULL DEFAULT 0,
  read_leads integer NOT NULL DEFAULT 0,
  replied_leads integer NOT NULL DEFAULT 0,
  open_rate decimal(5,4) NOT NULL DEFAULT 0,
  delivery_rate decimal(5,4) NOT NULL DEFAULT 0,
  read_rate decimal(5,4) NOT NULL DEFAULT 0,
  reply_rate decimal(5,4) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create supplier phone mapping table
CREATE TABLE IF NOT EXISTS supplier_phone_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  supplier_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_supplier_id ON leads(supplier_id);
CREATE INDEX IF NOT EXISTS idx_leads_sent_at ON leads(sent_at);
CREATE INDEX IF NOT EXISTS idx_leads_opened_at ON leads(opened_at);
CREATE INDEX IF NOT EXISTS idx_leads_delivered_at ON leads(delivered_at);
CREATE INDEX IF NOT EXISTS idx_leads_read_at ON leads(read_at);
CREATE INDEX IF NOT EXISTS idx_leads_replied_at ON leads(replied_at);
CREATE INDEX IF NOT EXISTS idx_supplier_phone_mapping_phone ON supplier_phone_mapping(phone_number);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_phone_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies for leads table
CREATE POLICY "Allow authenticated users to manage leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for lead_metrics_summary table
CREATE POLICY "Allow authenticated users to view metrics"
  ON lead_metrics_summary
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage metrics"
  ON lead_metrics_summary
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for supplier_phone_mapping table
CREATE POLICY "Allow authenticated users to manage phone mappings"
  ON supplier_phone_mapping
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for leads table
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate daily metrics
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date date DEFAULT CURRENT_DATE - 1)
RETURNS void AS $$
DECLARE
  total_count integer;
  opened_count integer;
  delivered_count integer;
  read_count integer;
  replied_count integer;
  open_rate_calc decimal(5,4);
  delivery_rate_calc decimal(5,4);
  read_rate_calc decimal(5,4);
  reply_rate_calc decimal(5,4);
BEGIN
  -- Get counts for the target date
  SELECT 
    COUNT(*),
    COUNT(opened_at),
    COUNT(delivered_at),
    COUNT(read_at),
    COUNT(replied_at)
  INTO 
    total_count,
    opened_count,
    delivered_count,
    read_count,
    replied_count
  FROM leads
  WHERE DATE(sent_at) = target_date;

  -- Calculate rates (avoid division by zero)
  IF total_count > 0 THEN
    open_rate_calc := opened_count::decimal / total_count;
    delivery_rate_calc := delivered_count::decimal / total_count;
    read_rate_calc := read_count::decimal / total_count;
    reply_rate_calc := replied_count::decimal / total_count;
  ELSE
    open_rate_calc := 0;
    delivery_rate_calc := 0;
    read_rate_calc := 0;
    reply_rate_calc := 0;
  END IF;

  -- Insert or update the metrics
  INSERT INTO lead_metrics_summary (
    date,
    total_leads,
    opened_leads,
    delivered_leads,
    read_leads,
    replied_leads,
    open_rate,
    delivery_rate,
    read_rate,
    reply_rate
  ) VALUES (
    target_date,
    total_count,
    opened_count,
    delivered_count,
    read_count,
    replied_count,
    open_rate_calc,
    delivery_rate_calc,
    read_rate_calc,
    reply_rate_calc
  )
  ON CONFLICT (date) DO UPDATE SET
    total_leads = EXCLUDED.total_leads,
    opened_leads = EXCLUDED.opened_leads,
    delivered_leads = EXCLUDED.delivered_leads,
    read_leads = EXCLUDED.read_leads,
    replied_leads = EXCLUDED.replied_leads,
    open_rate = EXCLUDED.open_rate,
    delivery_rate = EXCLUDED.delivery_rate,
    read_rate = EXCLUDED.read_rate,
    reply_rate = EXCLUDED.reply_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;