import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { e as useSavedItems, q as queryClient, s as supabase, a as analytics, V as Vt } from "../main.mjs";
function ProductCard({ product }) {
  const navigate = useNavigate();
  const { data: savedItems = [], toggleSavedItem } = useSavedItems();
  const [imageError, setImageError] = useState(false);
  const isSaved = savedItems.some((item) => item.id === product.id);
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ["product", product.id],
      queryFn: async () => {
        const { data, error } = await supabase.from("Products").select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name,
            Product_Supplier_ID
          `).eq("Product_ID", product.id).maybeSingle();
        if (error) throw error;
        return data;
      },
      staleTime: 1e3 * 60 * 5
      // 5 minutes
    });
    if (product.supplier) {
      queryClient.prefetchQuery({
        queryKey: ["supplierContact", product.id],
        queryFn: async () => {
          const { data, error } = await supabase.from("Supplier").select("Supplier_Email, Supplier_Whatsapp").eq("Supplier_Title", product.supplier).maybeSingle();
          if (error) throw error;
          return data;
        },
        staleTime: 1e3 * 60 * 5
        // 5 minutes
      });
    }
  };
  const handleClick = async () => {
    analytics.trackEvent("product_click", {
      props: {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        product_country: product.country,
        product_supplier: product.supplier,
        product_source: product.marketplace,
        product_price: product.Product_Price
      }
    });
    try {
      await supabase.rpc("record_product_view", {
        product_id: product.id
      });
    } catch (error) {
      console.error("Error recording product view:", error);
    }
    navigate(`/product/${product.id}`);
  };
  const handleSaveClick = async (e) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Vt.error("Please log in to save items");
        return;
      }
      await toggleSavedItem(product);
      Vt.success(isSaved ? "Item removed from saved items" : "Item saved successfully");
      analytics.trackEvent(isSaved ? "item_unsaved" : "item_saved", {
        props: {
          product_id: product.id,
          product_name: product.name
        }
      });
    } catch (error) {
      console.error("Error saving item:", error);
      Vt.error("Failed to save item. Please try again.");
    }
  };
  const handleImageError = () => {
    setImageError(true);
  };
  return /* @__PURE__ */ jsxs("div", { className: "group relative", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        onMouseEnter: handleMouseEnter,
        className: "cursor-pointer",
        onClick: handleClick,
        children: [
          /* @__PURE__ */ jsx("div", { className: "aspect-square overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm", children: !imageError ? /* @__PURE__ */ jsx(
            "img",
            {
              src: product.image,
              alt: product.name,
              className: "h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity",
              onError: handleImageError
            }
          ) : /* @__PURE__ */ jsx("div", { className: "h-full w-full flex items-center justify-center p-4 group-hover:opacity-75 transition-opacity", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "No image available" })
          ] }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col min-h-[6rem]", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm text-gray-100 mb-2 line-clamp-2", children: product.name }),
            /* @__PURE__ */ jsxs("div", { className: "mt-auto space-y-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-[#F4A024]", children: product.Product_Price }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300 inline-block text-center", children: product.category }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300 inline-block text-center", children: [
                  product.marketplace,
                  " • ",
                  product.country
                ] })
              ] })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleSaveClick,
        className: `absolute top-2 right-2 p-2 rounded-full transition-colors ${isSaved ? "bg-gray-800/80 text-[#F4A024]" : "bg-gray-800/80 text-gray-300 hover:text-[#F4A024]"}`,
        children: [
          /* @__PURE__ */ jsx(Bookmark, { className: "w-5 h-5", fill: isSaved ? "currentColor" : "none" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: isSaved ? "Remove from saved" : "Save item" })
        ]
      }
    )
  ] });
}
export {
  ProductCard as P
};
//# sourceMappingURL=ProductCard-dZFnl1y5.js.map
