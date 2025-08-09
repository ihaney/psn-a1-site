-- Debug migration to understand supplier data structure

-- First, let's see what's in the Supplier table
DO $$
DECLARE
    supplier_count INTEGER;
    product_count INTEGER;
    sample_supplier RECORD;
    sample_product RECORD;
BEGIN
    -- Count suppliers
    SELECT COUNT(*) INTO supplier_count FROM "Supplier";
    RAISE NOTICE 'Total suppliers in database: %', supplier_count;
    
    -- Count products
    SELECT COUNT(*) INTO product_count FROM "Products";
    RAISE NOTICE 'Total products in database: %', product_count;
    
    -- Show sample supplier
    SELECT * INTO sample_supplier FROM "Supplier" LIMIT 1;
    IF FOUND THEN
        RAISE NOTICE 'Sample supplier: ID=%, Title=%, Country=%, Source=%', 
            sample_supplier."Supplier_ID", 
            sample_supplier."Supplier_Title",
            sample_supplier."Supplier_Country_Name",
            sample_supplier."Supplier_Source_ID";
    END IF;
    
    -- Show sample product
    SELECT * INTO sample_product FROM "Products" LIMIT 1;
    IF FOUND THEN
        RAISE NOTICE 'Sample product: ID=%, Title=%, Supplier=%', 
            sample_product."Product_ID", 
            sample_product."Product_Title",
            sample_product."Product_Supplier_ID";
    END IF;
    
    -- Check how many suppliers have products
    SELECT COUNT(DISTINCT s."Supplier_ID") INTO supplier_count
    FROM "Supplier" s
    INNER JOIN "Products" p ON s."Supplier_ID" = p."Product_Supplier_ID";
    RAISE NOTICE 'Suppliers with products: %', supplier_count;
    
END $$;

-- Create a simplified function that returns all suppliers regardless of products
CREATE OR REPLACE FUNCTION get_all_suppliers_debug(
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
    COALESCE(s."Supplier_Country_Name", 'Unknown') as "Country_Title",
    COALESCE(src."Source_Title", 'Unknown') as "Source_Title",
    'Debug Category' as "Category_Title",
    COALESCE(
      (SELECT COUNT(*) FROM "Products" p WHERE p."Product_Supplier_ID" = s."Supplier_ID"), 
      0
    ) as product_count
  FROM "Supplier" s
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
  ORDER BY s."Supplier_Title"
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Update the main function to be less restrictive
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
  WITH supplier_stats AS (
    -- Get product count per supplier
    SELECT 
      s."Supplier_ID",
      COALESCE(COUNT(p."Product_ID"), 0) as total_products,
      -- Get the most common category for this supplier
      (SELECT p2."Product_Category_Name" 
       FROM "Products" p2 
       WHERE p2."Product_Supplier_ID" = s."Supplier_ID" 
         AND p2."Product_Category_Name" IS NOT NULL
       GROUP BY p2."Product_Category_Name"
       ORDER BY COUNT(*) DESC
       LIMIT 1) as most_common_category
    FROM "Supplier" s
    LEFT JOIN "Products" p ON s."Supplier_ID" = p."Product_Supplier_ID"
    GROUP BY s."Supplier_ID"
  )
  SELECT 
    s."Supplier_ID",
    COALESCE(s."Supplier_Title", 'Unknown Supplier') as "Supplier_Title",
    COALESCE(s."Supplier_Country_Name", 'Unknown') as "Country_Title",
    COALESCE(src."Source_Title", 'Unknown') as "Source_Title",
    COALESCE(stats.most_common_category, 'Uncategorized') as "Category_Title",
    stats.total_products as product_count
  FROM "Supplier" s
  LEFT JOIN supplier_stats stats ON s."Supplier_ID" = stats."Supplier_ID"
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
  ORDER BY stats.total_products DESC NULLS LAST, s."Supplier_Title"
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Update total count function to count all suppliers
CREATE OR REPLACE FUNCTION get_total_supplier_count()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_count FROM "Supplier";
  RETURN COALESCE(total_count, 0);
END;
$$;