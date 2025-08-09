/*
  # Fix RPC function for supplier data retrieval
  
  1. Changes
    - Update RPC function to return correct column names
    - Fix data mapping and transformation
    - Ensure proper category and country data
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_suppliers_with_product_count(INTEGER, INTEGER);

-- Create improved function with correct column mapping
CREATE OR REPLACE FUNCTION get_suppliers_with_product_count(
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  "Supplier_ID" text,
  "Supplier_Title" text,
  "Country_Title" text,
  "Source_Title" text,
  "Category_Title" text,
  product_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s."Supplier_ID",
    s."Supplier_Title",
    COALESCE(c."Country_Title", s."Supplier_Country_Name", 'Unknown') as "Country_Title",
    COALESCE(src."Source_Title", 'Unknown') as "Source_Title",
    COALESCE(cat."Category_Name", 'Unknown') as "Category_Title",
    COALESCE(
      (SELECT COUNT(*) 
       FROM "Products" p 
       WHERE p."Product_Supplier_ID" = s."Supplier_ID"), 
      0
    ) as product_count
  FROM "Supplier" s
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
  LEFT JOIN "Countries" c ON s."Supplier_Country_ID" = c."Country_ID"
  LEFT JOIN "Categories" cat ON s."Supplier_Category_ID" = cat."Category_ID"
  ORDER BY product_count DESC, s."Supplier_Title" ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;