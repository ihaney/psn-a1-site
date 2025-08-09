-- Debug and fix supplier list functionality

-- First, let's check what data we actually have
DO $$
DECLARE
    supplier_count INTEGER;
    product_count INTEGER;
    linked_count INTEGER;
    rec RECORD;
BEGIN
    -- Count total suppliers
    SELECT COUNT(*) INTO supplier_count FROM "Supplier";
    RAISE NOTICE 'Total suppliers: %', supplier_count;
    
    -- Count total products
    SELECT COUNT(*) INTO product_count FROM "Products";
    RAISE NOTICE 'Total products: %', product_count;
    
    -- Count suppliers that have products linked to them
    SELECT COUNT(DISTINCT p."Product_Supplier_ID") INTO linked_count
    FROM "Products" p
    WHERE p."Product_Supplier_ID" IS NOT NULL;
    RAISE NOTICE 'Suppliers with linked products: %', linked_count;
    
    -- Show sample data
    RAISE NOTICE 'Sample supplier IDs from Supplier table:';
    FOR rec IN (SELECT "Supplier_ID", "Supplier_Title" FROM "Supplier" LIMIT 5)
    LOOP
        RAISE NOTICE '  %: %', rec."Supplier_ID", rec."Supplier_Title";
    END LOOP;
    
    RAISE NOTICE 'Sample supplier IDs from Products table:';
    FOR rec IN (SELECT DISTINCT "Product_Supplier_ID", "Product_Supplier_Name" FROM "Products" WHERE "Product_Supplier_ID" IS NOT NULL LIMIT 5)
    LOOP
        RAISE NOTICE '  %: %', rec."Product_Supplier_ID", rec."Product_Supplier_Name";
    END LOOP;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_suppliers_with_product_count(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_total_supplier_count();

-- Create a simple, working function that returns all suppliers
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
    COALESCE(s."Supplier_Country_Name", 'Unknown Country') as "Country_Title",
    COALESCE(src."Source_Title", 'Unknown Source') as "Source_Title",
    COALESCE(
      (SELECT p."Product_Category_Name" 
       FROM "Products" p 
       WHERE p."Product_Supplier_ID" = s."Supplier_ID" 
         AND p."Product_Category_Name" IS NOT NULL
       LIMIT 1), 
      'Uncategorized'
    ) as "Category_Title",
    COALESCE(
      (SELECT COUNT(*)::BIGINT 
       FROM "Products" p 
       WHERE p."Product_Supplier_ID" = s."Supplier_ID"), 
      0::BIGINT
    ) as product_count
  FROM "Supplier" s
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
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

-- Test the function
DO $$
DECLARE
    test_result RECORD;
    result_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Testing get_suppliers_with_product_count function:';
    
    FOR test_result IN 
        SELECT * FROM get_suppliers_with_product_count(5, 0)
    LOOP
        result_count := result_count + 1;
        RAISE NOTICE 'Supplier %: % (% products)', 
            result_count, 
            test_result."Supplier_Title", 
            test_result.product_count;
    END LOOP;
    
    IF result_count = 0 THEN
        RAISE NOTICE 'No suppliers returned by function!';
    ELSE
        RAISE NOTICE 'Function returned % suppliers', result_count;
    END IF;
    
    -- Test total count
    RAISE NOTICE 'Total supplier count: %', (SELECT get_total_supplier_count());
END $$;