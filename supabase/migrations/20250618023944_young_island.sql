/*
  # Create RPC function for efficient supplier queries with product counts
  
  1. New Functions
    - get_suppliers_with_product_count: Returns suppliers sorted by product count
    
  2. Performance
    - Efficient sorting and pagination at database level
    - Reduces client-side processing
*/

-- Create function to get suppliers with product counts, sorted by product count descending
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
    COALESCE(s."Supplier_Country_Name", 'Unknown') as "Country_Title",
    COALESCE(src."Source_Title", 'Unknown') as "Source_Title",
    COALESCE(
      (SELECT p."Product_Category_Name" 
       FROM "Products" p 
       WHERE p."Product_Supplier_ID" = s."Supplier_ID" 
       LIMIT 1), 
      'Unknown'
    ) as "Category_Title",
    COALESCE(
      (SELECT COUNT(*) 
       FROM "Products" p 
       WHERE p."Product_Supplier_ID" = s."Supplier_ID"), 
      0
    ) as product_count
  FROM "Supplier" s
  LEFT JOIN "Sources" src ON s."Supplier_Source_ID" = src."Source_ID"
  ORDER BY product_count DESC, s."Supplier_Title" ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;