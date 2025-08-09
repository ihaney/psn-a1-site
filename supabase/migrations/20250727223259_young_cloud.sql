/*
  # Create get_all_suppliers_paged RPC function

  1. New Function
    - `get_all_suppliers_paged` - Efficiently retrieves paginated supplier data with product counts
    - Parameters: limit_count (INT), offset_count (INT)
    - Returns: supplier details with product counts and total count for pagination

  2. Performance Benefits
    - Single database query instead of N+1 queries
    - Server-side sorting by product count
    - Efficient pagination with LIMIT/OFFSET
    - Includes total count for client-side pagination controls

  3. Data Structure
    - Returns all necessary supplier fields
    - Includes product_count for each supplier
    - Includes total_suppliers_count for pagination metadata
*/

CREATE OR REPLACE FUNCTION public.get_all_suppliers_paged(
    limit_count INT DEFAULT 100,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    supplier_id TEXT,
    supplier_title TEXT,
    supplier_description TEXT,
    supplier_website TEXT,
    supplier_email TEXT,
    supplier_location TEXT,
    supplier_whatsapp TEXT,
    supplier_country_name TEXT,
    supplier_city_name TEXT,
    supplier_source_id TEXT,
    product_count BIGINT,
    total_suppliers_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH supplier_product_counts AS (
    -- Calculate product count for each supplier
    SELECT 
      s."Supplier_ID",
      COUNT(p."Product_ID") as product_count
    FROM "Supplier" s
    LEFT JOIN "Products" p ON s."Supplier_ID" = p."Product_Supplier_ID"
    GROUP BY s."Supplier_ID"
  ),
  all_suppliers_with_counts AS (
    -- Get all supplier data with product counts
    SELECT 
      s."Supplier_ID",
      s."Supplier_Title",
      s."Supplier_Description",
      s."Supplier_Website",
      s."Supplier_Email",
      s."Supplier_Location",
      s."Supplier_Whatsapp",
      s."Supplier_Country_Name",
      s."Supplier_City_Name",
      s."Supplier_Source_ID",
      COALESCE(spc.product_count, 0) as product_count
    FROM "Supplier" s
    LEFT JOIN supplier_product_counts spc ON s."Supplier_ID" = spc."Supplier_ID"
  )
  SELECT 
    aswc."Supplier_ID",
    COALESCE(aswc."Supplier_Title", 'Unknown Supplier'),
    COALESCE(aswc."Supplier_Description", ''),
    COALESCE(aswc."Supplier_Website", ''),
    COALESCE(aswc."Supplier_Email", ''),
    COALESCE(aswc."Supplier_Location", ''),
    COALESCE(aswc."Supplier_Whatsapp", ''),
    COALESCE(aswc."Supplier_Country_Name", 'Unknown'),
    COALESCE(aswc."Supplier_City_Name", ''),
    COALESCE(aswc."Supplier_Source_ID", ''),
    aswc.product_count::BIGINT,
    (SELECT COUNT(*) FROM all_suppliers_with_counts)::BIGINT as total_suppliers_count
  FROM all_suppliers_with_counts aswc
  ORDER BY 
    aswc.product_count DESC,
    aswc."Supplier_Title" ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;