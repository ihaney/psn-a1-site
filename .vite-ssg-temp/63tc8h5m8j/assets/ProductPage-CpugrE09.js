import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Share2, ExternalLink, Bookmark } from "lucide-react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { s as supabase, i as isBrowser, e as useSavedItems, f as useContactHistory, a as analytics, c as createSupplierUrl, V as Vt } from "../main.mjs";
import { P as ProductCard } from "./ProductCard-dZFnl1y5.js";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import "react-dom/client";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
function useSimilarProducts(productId) {
  return useQuery({
    queryKey: ["similarProducts", productId],
    queryFn: async () => {
      const { data: currentProduct, error: productError } = await supabase.from("Products").select("Product_Category_Name").eq("Product_ID", productId).single();
      if (productError) throw productError;
      const { data: similarProducts, error: similarError } = await supabase.from("Products").select(`
          Product_ID,
          Product_Title,
          Product_Price,
          Product_Image_URL,
          Product_URL,
          Product_MOQ,
          Product_Country_Name,
          Product_Category_Name,
          Product_Supplier_Name,
          Product_Source_Name
        `).eq("Product_Category_Name", currentProduct.Product_Category_Name).neq("Product_ID", productId).limit(4);
      if (similarError) throw similarError;
      return similarProducts.map((product) => ({
        id: product.Product_ID,
        name: product.Product_Title,
        Product_Price: product.Product_Price || "$0",
        image: product.Product_Image_URL || "",
        country: product.Product_Country_Name || "Unknown",
        category: product.Product_Category_Name || "Unknown",
        supplier: product.Product_Supplier_Name || "Unknown",
        Product_MOQ: product.Product_MOQ || "0",
        sourceUrl: product.Product_URL || "",
        marketplace: product.Product_Source_Name || "Unknown"
      }));
    },
    staleTime: 1e3 * 60 * 60
    // 1 hour
  });
}
function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobile] = useState(() => isBrowser ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false);
  const { data: savedItems = [], toggleSavedItem } = useSavedItems();
  const { recordContact } = useContactHistory();
  const { data: similarProducts = [], isLoading: loadingSimilar } = useSimilarProducts(id || "");
  const {
    data: product,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { count, error: countError } = await supabase.from("Products").select("Product_ID", { count: "exact", head: true }).eq("Product_ID", id);
      if (countError) throw countError;
      if (count === 0) return null;
      const { data: productData, error: productError } = await supabase.from("Products").select(`
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
        `).eq("Product_ID", id).maybeSingle();
      if (productError) throw productError;
      if (!productData) return null;
      analytics.trackEvent("product_view", {
        props: {
          product_id: productData.Product_ID,
          product_name: productData.Product_Title,
          product_category: productData.Product_Category_Name,
          product_country: productData.Product_Country_Name
        }
      });
      return productData;
    },
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
  const { data: supplierContact } = useQuery({
    queryKey: ["supplierContact", id],
    queryFn: async () => {
      if (!(product == null ? void 0 : product.Product_Supplier_ID)) return null;
      const { data, error: error2 } = await supabase.from("Supplier").select("Supplier_Email, Supplier_Whatsapp").eq("Supplier_ID", product.Product_Supplier_ID).maybeSingle();
      if (error2) throw error2;
      return data;
    },
    enabled: !!(product == null ? void 0 : product.Product_Supplier_ID),
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
  const formattedProduct = product ? {
    id: product.Product_ID,
    name: product.Product_Title,
    Product_Price: product.Product_Price || "$0",
    image: product.Product_Image_URL || "",
    country: product.Product_Country_Name || "Unknown",
    category: product.Product_Category_Name || "Unknown",
    supplier: product.Product_Supplier_Name || "Unknown",
    supplierEmail: (supplierContact == null ? void 0 : supplierContact.Supplier_Email) || "",
    supplierWhatsapp: (supplierContact == null ? void 0 : supplierContact.Supplier_Whatsapp) || "",
    Product_MOQ: product.Product_MOQ || "0",
    sourceUrl: product.Product_URL || "",
    marketplace: product.Product_Source_Name || "Unknown"
  } : null;
  const isSaved = savedItems.some((item) => item.id === (formattedProduct == null ? void 0 : formattedProduct.id));
  const handleShare = () => {
    if (!formattedProduct) return;
    const shareUrl = isBrowser ? window.location.href : "";
    const shareText = `I found this product on Paisán.

${formattedProduct.name}

${shareUrl}`;
    if (isMobile) {
      window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
    } else {
      const subject = encodeURIComponent(`Check out this product on Paisán`);
      window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(shareText)}`;
    }
    analytics.trackEvent("product_share", {
      props: {
        product_id: formattedProduct.id,
        product_name: formattedProduct.name,
        share_method: isMobile ? "sms" : "email"
      }
    });
  };
  const handleSaveClick = async () => {
    if (!formattedProduct) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Vt.error("Please log in to save items");
        return;
      }
      await toggleSavedItem(formattedProduct);
      Vt.success(isSaved ? "Item removed from saved items" : "Item saved successfully");
      analytics.trackEvent(isSaved ? "item_unsaved" : "item_saved", {
        props: {
          product_id: formattedProduct.id,
          product_name: formattedProduct.name
        }
      });
    } catch (error2) {
      console.error("Error saving item:", error2);
      Vt.error("Failed to save item. Please try again.");
    }
  };
  const handleContact = async (method) => {
    if (!formattedProduct) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Vt.error("Please log in to contact suppliers");
        return;
      }
      await recordContact(formattedProduct.id, method);
      analytics.trackEvent("contact_supplier_click", {
        props: {
          product_id: formattedProduct.id,
          product_name: formattedProduct.name,
          supplier: formattedProduct.supplier,
          contact_method: method
        }
      });
    } catch (error2) {
      console.error("Error recording contact:", error2);
    }
  };
  const handleSourceLinkClick = () => {
    if (!formattedProduct) return;
    analytics.trackEvent("source_link_click", {
      props: {
        product_id: formattedProduct.id,
        product_name: formattedProduct.name,
        marketplace: formattedProduct.marketplace
      }
    });
  };
  if (loading || error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-[#F4A024]", children: error ? "Error loading product" : "Loading product..." }) });
  }
  if (!formattedProduct) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        SEO,
        {
          title: "Product Not Found",
          description: "The requested product could not be found. Browse our other Latin American products."
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-100", children: "Product not found" }) }) })
    ] });
  }
  const currentUrl = window.location.href;
  const emailSubject = encodeURIComponent(formattedProduct.name);
  const emailBody = encodeURIComponent(`Hello, I am interested in this product that you offer. I found the listing from Paisán:

${formattedProduct.name}
${currentUrl}`);
  const whatsappMessage = encodeURIComponent(`Hello, I am interested in this product that you offer. I found the listing from Paisán:

${formattedProduct.name}
${currentUrl}`);
  const getContactLink = () => {
    if (formattedProduct.supplierEmail) {
      return `mailto:${formattedProduct.supplierEmail}?subject=${emailSubject}&body=${emailBody}`;
    } else if (formattedProduct.supplierWhatsapp) {
      const whatsappNumber = formattedProduct.supplierWhatsapp.replace(/\D/g, "");
      return `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    }
    return "#";
  };
  const getContactText = () => {
    if (formattedProduct.supplierEmail) {
      return "Contact Supplier via Email";
    } else if (formattedProduct.supplierWhatsapp) {
      return "Contact Supplier via WhatsApp";
    }
    return "Contact Supplier";
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: formattedProduct.name,
        description: `Buy ${formattedProduct.name} from ${formattedProduct.supplier}. ${formattedProduct.category} products from ${formattedProduct.country}. MOQ: ${formattedProduct.Product_MOQ} units.`,
        keywords: `${formattedProduct.name}, ${formattedProduct.category}, ${formattedProduct.country}, ${formattedProduct.supplier}, wholesale, B2B, Latin American products`,
        image: formattedProduct.image,
        type: "product"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: formattedProduct.name }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleShare,
          className: "inline-flex items-center gap-2 font-bold text-[#F4A024] hover:text-[#F4A024]/80",
          title: `Share via ${isMobile ? "SMS" : "email"}`,
          children: [
            /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Share" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-12", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "aspect-square overflow-hidden rounded-lg bg-gray-800/50",
            "data-tour": "product-details",
            children: /* @__PURE__ */ jsx(
              "img",
              {
                src: formattedProduct.image,
                alt: formattedProduct.name,
                className: "h-full w-full object-cover object-center"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-100", children: formattedProduct.name }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xl text-[#F4A024]", children: formattedProduct.Product_Price }),
              /* @__PURE__ */ jsx("span", { className: "px-2 py-1 bg-gray-800 rounded-full text-sm text-gray-300", children: formattedProduct.category })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-gray-300", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-100", children: "Country" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1", children: formattedProduct.country })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-100", children: "Category" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1", children: formattedProduct.category })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-100", children: "MOQ" }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1", children: [
                  formattedProduct.Product_MOQ,
                  " units"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-100", children: "Supplier" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      if (formattedProduct.supplierEmail || formattedProduct.supplierWhatsapp) {
                        supabase.from("Supplier").select("Supplier_ID").eq("Supplier_Title", formattedProduct.supplier).single().then(({ data }) => {
                          if (data) {
                            navigate(createSupplierUrl(formattedProduct.supplier, data.Supplier_ID));
                          }
                        });
                      }
                    },
                    className: "mt-1 text-left text-[#F4A024] hover:text-[#F4A024]",
                    children: formattedProduct.supplier
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-100", children: "Original Source" }),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: formattedProduct.sourceUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "mt-1 inline-flex items-center text-[#F4A024] hover:text-[#F4A024]",
                  onClick: handleSourceLinkClick,
                  children: [
                    "View on ",
                    formattedProduct.marketplace,
                    /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4 ml-1" })
                  ]
                }
              )
            ] })
          ] }),
          (formattedProduct.supplierEmail || formattedProduct.supplierWhatsapp) && /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: getContactLink(),
                className: "btn-primary flex-1 py-3 text-center block",
                "data-tour": "contact-supplier",
                onClick: () => handleContact(formattedProduct.supplierEmail ? "email" : "whatsapp"),
                target: formattedProduct.supplierWhatsapp ? "_blank" : void 0,
                rel: formattedProduct.supplierWhatsapp ? "noopener noreferrer" : void 0,
                children: getContactText()
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleSaveClick,
                className: `px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 ${isSaved ? "bg-gray-800 text-[#F4A024]" : "bg-gray-800 text-gray-300 hover:text-[#F4A024]"}`,
                children: [
                  /* @__PURE__ */ jsx(Bookmark, { className: "w-5 h-5", fill: isSaved ? "currentColor" : "none" }),
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: isSaved ? "Remove from saved" : "Save item" })
                ]
              }
            )
          ] })
        ] })
      ] }),
      similarProducts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-100 mb-8", children: "Related Products" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: similarProducts.map((product2) => /* @__PURE__ */ jsx(ProductCard, { product: product2 }, product2.id)) })
      ] })
    ] }) })
  ] });
}
export {
  ProductPage as default
};
//# sourceMappingURL=ProductPage-CpugrE09.js.map
