/*
  # Fix Supplier Categories and Product Sorting
  
  1. Changes
    - Remove non-existent Supplier_Category_ID column reference
    - Derive category from most common product category for each supplier
    - Ensure proper sorting by product count
    
  2. Security
    - Maintain existing RLS policies
    - Grant proper permissions
*/

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS get_suppliers_with_product_count(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_total_supplier_count();

-- Create improved function that derives category from products
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
  WITH supplier_product_stats AS (
    -- Get product count and most common category for each supplier
    SELECT 
      s."Supplier_ID",
      COUNT(p."Product_ID") as total_products,
      -- Get the most common category for this supplier
      (SELECT p2."Product_Category_Name" 
       FROM "Products" p2 
       WHERE p2."Product_Supplier_ID" = s."Supplier_ID" 
         AND p2."Product_Category_Name" IS NOT NULL
       GROUP BY p2."Product_Category_Name"
       ORDER BY COUNT(*) DESC, p2."Product_Category_Name"
       LIMIT 1) as most_common_category
    FROM "Supplier" s
    LEFT JOIN "Products" p ON s."Supplier_ID" = p."Product_Supplier_ID"
    GROUP BY s."Supplier_ID"
  )
  SELECT 
    s."Supplier_ID",
    COALESCE(s."Supplier_Title", 'Unknown Supplier') as "Supplier_Title",
    COALESCE(c."Country_Title", s."Supplier_Country_Name", 'Unknown') as "Country_Title",
    COALESCE(src."Source_Title", 'Unknown') as "Source_Title",
    COALESCE(stats.most_common_category, 'Uncategorized') as "Category_Title",
    COALESCE(stats.total_products, 0)::BIGINT as product_count
  FROM "Supplier" s
  LEFT JOIN supplier_product_stats stats ON s."Supplier_ID" = stats."Supplier_ID"
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
  LEFT JOIN "Countries" c ON s."Supplier_Country_ID" = c."Country_ID"
  ORDER BY 
    COALESCE(stats.total_products, 0) DESC,
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