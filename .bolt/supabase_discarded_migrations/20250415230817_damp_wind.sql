/*
  # Initial Database Setup

  1. Tables
    - Products
    - Supplier
    - Sources
    - Countries
    - Categories
    - error_logs

  2. Search Functionality
    - Full text search with weighted columns
    - GIN indexes for performance
    - Proper foreign key relationships

  3. Security
    - Row Level Security (RLS) enabled
    - Public read access policies
    - Admin-only access for error logs
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create Countries table
CREATE TABLE IF NOT EXISTS "Countries" (
    "Country_ID" text PRIMARY KEY,
    "Country_Title" text,
    "Country_Image" text
);

ALTER TABLE "Countries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
    ON "Countries"
    FOR SELECT
    TO public
    USING (true);

-- Create Categories table
CREATE TABLE IF NOT EXISTS "Categories" (
    "Category_ID" text PRIMARY KEY,
    "Category_Title" text NOT NULL
);

ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories"
    ON "Categories"
    FOR SELECT
    TO public
    USING (true);

-- Create Sources table
CREATE TABLE IF NOT EXISTS "Sources" (
    "Source_ID" text PRIMARY KEY,
    "Source_Title" text,
    "Source_Image" text,
    "Source_Link" text
);

ALTER TABLE "Sources" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
    ON "Sources"
    FOR SELECT
    TO public
    USING (true);

-- Create Supplier table
CREATE TABLE IF NOT EXISTS "Supplier" (
    "Supplier_ID" text PRIMARY KEY,
    "Supplier_Title" text,
    "Supplier_Description" text,
    "Supplier_Website" text,
    "Supplier_Email" text,
    "Supplier_Location" text,
    "Supplier_Source_ID" text,
    "Supplier_Country_ID" text REFERENCES "Countries"("Country_ID"),
    "Supplier_Category_ID" text,
    "Supplier_Whatsapp" text
);

ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to supplier data"
    ON "Supplier"
    FOR SELECT
    TO public
    USING (true);

-- Create Products table
CREATE TABLE IF NOT EXISTS "Products" (
    "Product_ID" text PRIMARY KEY,
    "Product_Title" text NOT NULL,
    "Product_Price" text,
    "Product_Image_URL" text,
    "Product_Category_ID" text REFERENCES "Categories"("Category_ID"),
    "Product_Title_URL" text,
    "Product_Source_ID" text REFERENCES "Sources"("Source_ID"),
    "Product_Country_ID" text REFERENCES "Countries"("Country_ID"),
    "Product_Supplier_ID" text REFERENCES "Supplier"("Supplier_ID"),
    "Product_MOQ" text,
    "supplier_title" text,
    "category_title" text,
    "country_title" text,
    "source_title" text,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce("Product_Title", '')), 'A') ||
        setweight(to_tsvector('english', coalesce(supplier_title, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(category_title, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(country_title, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(source_title, '')), 'D')
    ) STORED
);

ALTER TABLE "Products" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products"
    ON "Products"
    FOR SELECT
    TO public
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_search ON "Products" USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products" ("Product_Category_ID");
CREATE INDEX IF NOT EXISTS idx_products_country ON "Products" ("Product_Country_ID");
CREATE INDEX IF NOT EXISTS idx_products_supplier ON "Products" ("Product_Supplier_ID");
CREATE INDEX IF NOT EXISTS idx_products_source ON "Products" ("Product_Source_ID");

-- Create error_logs table for application monitoring
CREATE TABLE IF NOT EXISTS error_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message text NOT NULL,
    stack text,
    context jsonb,
    user_id uuid REFERENCES auth.users,
    timestamp timestamptz NOT NULL DEFAULT now(),
    severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserting logs from authenticated users
CREATE POLICY "Allow inserting error logs"
    ON error_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow admin role to view all logs
CREATE POLICY "Allow admin to view all logs"
    ON error_logs
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create triggers to update denormalized fields
CREATE OR REPLACE FUNCTION update_products_supplier_title()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Products"
    SET supplier_title = NEW."Supplier_Title"
    WHERE "Product_Supplier_ID" = NEW."Supplier_ID";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_products_category_title()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Products"
    SET category_title = NEW."Category_Title"
    WHERE "Product_Category_ID" = NEW."Category_ID";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_products_country_title()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Products"
    SET country_title = NEW."Country_Title"
    WHERE "Product_Country_ID" = NEW."Country_ID";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_products_source_title()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Products"
    SET source_title = NEW."Source_Title"
    WHERE "Product_Source_ID" = NEW."Source_ID";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_supplier_title
    AFTER UPDATE ON "Supplier"
    FOR EACH ROW
    EXECUTE FUNCTION update_products_supplier_title();

CREATE TRIGGER trig_update_category_title
    AFTER UPDATE ON "Categories"
    FOR EACH ROW
    EXECUTE FUNCTION update_products_category_title();

CREATE TRIGGER trig_update_country_title
    AFTER UPDATE ON "Countries"
    FOR EACH ROW
    EXECUTE FUNCTION update_products_country_title();

CREATE TRIGGER trig_update_source_title
    AFTER UPDATE ON "Sources"
    FOR EACH ROW
    EXECUTE FUNCTION update_products_source_title();