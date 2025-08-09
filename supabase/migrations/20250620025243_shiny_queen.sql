-- Fix supplier list functionality

-- Drop existing functions
DROP FUNCTION IF EXISTS get_suppliers_with_product_count(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_total_supplier_count();
DROP FUNCTION IF EXISTS get_all_suppliers_debug(INTEGER, INTEGER);

-- Create improved function that properly joins with related tables
CREATE OR REPLACE FUNCTION get_suppliers_with_product_count(
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  "Supplier_ID" TEXT,
  "Supplier_Title" TEXT,
  "Country_Title" TEXT,
  "Source_Title" TEXT,
  "Category_Title" TEXT,
  product_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s."Supplier_ID",
    COALESCE(s."Supplier_Title", 'Unknown Supplier') as "Supplier_Title",
    COALESCE(c."Country_Title", s."Supplier_Country_Name", 'Unknown') as "Country_Title",
    COALESCE(src."Source_Title", 'Unknown') as "Source_Title",
    COALESCE(cat."Category_Name", 'Unknown') as "Category_Title",
    COALESCE(
      (SELECT COUNT(*)::BIGINT 
       FROM "Products" p 
       WHERE p."Product_Supplier_ID" = s."Supplier_ID"), 
      0::BIGINT
    ) as product_count
  FROM "Supplier" s
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
  LEFT JOIN "Countries" c ON s."Supplier_Country_ID" = c."Country_ID"
  LEFT JOIN "Categories" cat ON s."Supplier_Category_ID" = cat."Category_ID"
  ORDER BY 
    (SELECT COUNT(*) FROM "Products" p WHERE p."Product_Supplier_ID" = s."Supplier_ID") DESC,
    s."Supplier_Title" ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Create total count function
CREATE OR REPLACE FUNCTION get_total_supplier_count()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (SELECT COUNT(*)::BIGINT FROM "Supplier");
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_suppliers_with_product_count(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_suppliers_with_product_count(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_total_supplier_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_supplier_count() TO anon;