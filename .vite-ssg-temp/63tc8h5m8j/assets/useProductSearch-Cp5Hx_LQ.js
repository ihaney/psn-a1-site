import { useState, useEffect } from "react";
import { s as supabase } from "../main.mjs";
function useProductSearch(query, supplierId = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function searchProducts() {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        let productQuery = supabase.from("Products").select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_Category_Name,
            Product_Supplier_Name
          `).ilike("Product_Title", `%${query}%`).limit(5);
        if (supplierId) {
          productQuery = productQuery.eq("Product_Supplier_ID", supplierId);
        }
        const { data, error } = await productQuery;
        if (error) throw error;
        const formattedProducts = (data || []).map((product) => ({
          Product_ID: product.Product_ID,
          Product_Title: product.Product_Title,
          Product_Price: product.Product_Price || "$0",
          Product_Image_URL: product.Product_Image_URL || "",
          category_title: product.Product_Category_Name || "Unknown",
          supplier_title: product.Product_Supplier_Name || "Unknown Supplier"
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error searching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [query, supplierId]);
  return { products, loading };
}
export {
  useProductSearch as u
};
//# sourceMappingURL=useProductSearch-Cp5Hx_LQ.js.map
