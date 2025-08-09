-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_suppliers_with_product_count(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_total_supplier_count();

-- Function to get suppliers with product count and category information
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
  WITH supplier_categories AS (
    -- Get the most common category for each supplier based on their products
    SELECT 
      p."Product_Supplier_ID",
      p."Product_Category_Name",
      COUNT(*) as category_count,
      ROW_NUMBER() OVER (PARTITION BY p."Product_Supplier_ID" ORDER BY COUNT(*) DESC) as rn
    FROM "Products" p
    WHERE p."Product_Supplier_ID" IS NOT NULL 
      AND p."Product_Category_Name" IS NOT NULL
    GROUP BY p."Product_Supplier_ID", p."Product_Category_Name"
  ),
  supplier_stats AS (
    -- Get product count and other stats per supplier
    SELECT 
      p."Product_Supplier_ID",
      COUNT(*) as total_products,
      p."Product_Country_Name",
      p."Product_Source_Name"
    FROM "Products" p
    WHERE p."Product_Supplier_ID" IS NOT NULL
    GROUP BY p."Product_Supplier_ID", p."Product_Country_Name", p."Product_Source_Name"
  )
  SELECT 
    s."Supplier_ID",
    COALESCE(s."Supplier_Title", 'Unknown Supplier') as "Supplier_Title",
    COALESCE(s."Supplier_Country_Name", stats."Product_Country_Name", 'Unknown') as "Country_Title",
    COALESCE(src."Source_Title", stats."Product_Source_Name", 'Unknown') as "Source_Title",
    COALESCE(sc."Product_Category_Name", 'Uncategorized') as "Category_Title",
    COALESCE(stats.total_products, 0) as product_count
  FROM "Supplier" s
  LEFT JOIN supplier_stats stats ON s."Supplier_ID" = stats."Product_Supplier_ID"
  LEFT JOIN supplier_categories sc ON s."Supplier_ID" = sc."Product_Supplier_ID" AND sc.rn = 1
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
  WHERE stats.total_products > 0  -- Only include suppliers with products
  ORDER BY stats.total_products DESC NULLS LAST
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Function to get total supplier count
CREATE OR REPLACE FUNCTION get_total_supplier_count()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(DISTINCT s."Supplier_ID")
  INTO total_count
  FROM "Supplier" s
  INNER JOIN "Products" p ON s."Supplier_ID" = p."Product_Supplier_ID"
  WHERE p."Product_Supplier_ID" IS NOT NULL;
  
  RETURN COALESCE(total_count, 0);
END;
$$;