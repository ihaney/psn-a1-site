import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Globe, Mail, MessageSquare, ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { g as getSupplierIdFromParams, s as supabase, L as LoadingSpinner, a as analytics } from "../main.mjs";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { P as ProductCard } from "./ProductCard-dZFnl1y5.js";
import "react-dom/client";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: buttonVariants({ variant, size, className }),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: `shrink-0 bg-border ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"} ${className}`,
      ...props
    }
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;
function SupplierPage() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  const params = useParams();
  const navigate = useNavigate();
  const supplierId = getSupplierIdFromParams(params);
  const [showMoreProductsOffered, setShowMoreProductsOffered] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const {
    data: supplier,
    isLoading,
    error
  } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => {
      var _a2, _b2, _c2;
      if (!supplierId) return null;
      const { data, error: error2 } = await supabase.from("Supplier").select(`
          Supplier_ID,
          Supplier_Title,
          Supplier_Country_ID,
          Supplier_Location,
          Sources:Supplier_Source_ID (
            Source_Title
          ),
          Supplier_Website,
          Supplier_Email,
          Supplier_Whatsapp,
          ai_related_terms,
          ai_business_summary,
          ai_industries_supported,
          ai_products_services,
          Landing_Page_URL,
          Countries:Supplier_Country_ID (
            Country_Title,
            Country_Image
          )
        `).eq("Supplier_ID", supplierId).maybeSingle();
      if (error2) throw error2;
      if (!data) return null;
      return {
        Supplier_ID: data.Supplier_ID,
        Supplier_Name: data.Supplier_Title,
        Supplier_Country_ID: data.Supplier_Country_ID,
        Supplier_Location: data.Supplier_Location,
        Supplier_Source_Name: ((_a2 = data.Sources) == null ? void 0 : _a2.Source_Title) || "",
        Supplier_Website: data.Supplier_Website,
        Supplier_Email: data.Supplier_Email,
        Supplier_Whatsapp: data.Supplier_Whatsapp,
        ai_related_terms: data.ai_related_terms,
        ai_business_summary: data.ai_business_summary,
        ai_industries_supported: data.ai_industries_supported,
        ai_products_services: data.ai_products_services,
        Landing_Page_URL: data.Landing_Page_URL,
        Countries: {
          Country_Name: ((_b2 = data.Countries) == null ? void 0 : _b2.Country_Title) || "",
          Country_Image: ((_c2 = data.Countries) == null ? void 0 : _c2.Country_Image) || ""
        }
      };
    },
    enabled: !!supplierId,
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
  const {
    data: supplierProducts = [],
    isLoading: productsLoading
  } = useQuery({
    queryKey: ["supplierProducts", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      const { data, error: error2 } = await supabase.from("Products").select(`
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
        `).eq("Product_Supplier_ID", supplierId).order("Product_Title");
      if (error2) throw error2;
      return (data || []).map((product) => ({
        id: product.Product_ID,
        name: product.Product_Title || "Untitled Product",
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
    enabled: !!supplierId,
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
  const { data: productCount = 0 } = useQuery({
    queryKey: ["supplierProductCount", supplierId],
    queryFn: async () => {
      if (!supplierId) return 0;
      const { count, error: error2 } = await supabase.from("Products").select("*", { count: "exact", head: true }).eq("Product_Supplier_ID", supplierId);
      if (error2) throw error2;
      return count ?? 0;
    },
    enabled: !!supplierId,
    staleTime: 1e3 * 60 * 5
  });
  const normalizePhoneNumber = (phone) => phone.replace(/\D/g, "");
  const parseTerms = (terms) => (terms == null ? void 0 : terms.trim()) ? terms.split(",").map((t) => t.trim()).filter(Boolean).filter((t, i, a) => a.indexOf(t) === i) : [];
  const parseListContent = (content) => (content == null ? void 0 : content.trim()) ? content.split("\n").flatMap((l) => l.split(",")).map((i) => i.trim()).filter(Boolean).filter((t, i, a) => a.indexOf(t) === i) : [];
  const handleRelatedTermClick = (term) => {
    analytics.trackEvent("related_term_clicked", {
      term,
      supplier_id: supplierId,
      supplier_name: supplier == null ? void 0 : supplier.Supplier_Name
    });
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (!supplier) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        SEO,
        {
          title: "Supplier Not Found",
          description: "The requested supplier could not be found. Browse our other Latin American suppliers."
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-100", children: "Supplier not found" }) }) })
    ] });
  }
  const relatedTerms = parseTerms(supplier.ai_related_terms);
  const industriesSupported = parseListContent(supplier.ai_products_services);
  const productsOffered = parseListContent(supplier.ai_industries_supported);
  const normalizedPhone = normalizePhoneNumber(supplier.Supplier_Whatsapp || "");
  const shouldShowWhatsApp = normalizedPhone.length >= 7;
  console.log("Supplier location data:", {
    location: supplier == null ? void 0 : supplier.Supplier_Location,
    country: (_a = supplier == null ? void 0 : supplier.Countries) == null ? void 0 : _a.Country_Name
  });
  const hasMoreSupplierProducts = (productCount ?? 0) > 6;
  const limitedProducts = supplierProducts.slice(0, 6);
  const handleShowAllSupplierProducts = () => {
    if (supplier == null ? void 0 : supplier.Supplier_Name) {
      navigate(`/search?q=${encodeURIComponent(supplier.Supplier_Name)}&mode=products`);
    } else {
      navigate("/products");
    }
  };
  const maxProductsOfferedToShow = 5;
  const visibleProductsOffered = showMoreProductsOffered ? productsOffered : productsOffered.slice(0, maxProductsOfferedToShow);
  const hasMoreProductsOffered = productsOffered.length > maxProductsOfferedToShow;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: `${supplier.Supplier_Name} — ${supplier.Countries.Country_Name}`,
        description: ((_b = supplier.ai_business_summary) == null ? void 0 : _b.substring(0, 160)) || `${supplier.Supplier_Name} - Latin American supplier from ${supplier.Countries.Country_Name}`,
        keywords: `${supplier.Supplier_Name}, ${supplier.Countries.Country_Name}, Latin American supplier, wholesale, B2B, ${relatedTerms.join(", ")}`,
        type: "profile"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: supplier.Supplier_Name }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/50 backdrop-blur-sm rounded-lg p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-6", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: supplier.Countries.Country_Image ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: supplier.Countries.Country_Image,
                  alt: `${supplier.Countries.Country_Name} flag`,
                  className: "w-8 h-8 rounded object-cover"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded bg-gray-600 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300", children: "🏳️" }) }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-100 mb-2", children: supplier.Supplier_Name }),
                ((_c = supplier.Supplier_Location) == null ? void 0 : _c.trim()) && /* @__PURE__ */ jsx("p", { className: "text-gray-300 mb-1 font-bold", children: supplier.Supplier_Location.trim() }),
                ((_d = supplier.Supplier_Source_Name) == null ? void 0 : _d.trim()) && /* @__PURE__ */ jsx("div", { className: "mb-1", children: /* @__PURE__ */ jsxs("span", { className: "inline-block px-2 py-1 rounded-full bg-[#F4A024]/20 text-[#F4A024] text-xs font-medium", children: [
                  "Source: ",
                  supplier.Supplier_Source_Name.trim()
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
              ((_e = supplier.Supplier_Website) == null ? void 0 : _e.trim()) && /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: supplier.Supplier_Website.trim(),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90",
                  children: [
                    /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4 mr-2" }),
                    "Website"
                  ]
                }
              ) }),
              ((_f = supplier.Supplier_Email) == null ? void 0 : _f.trim()) && /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: `mailto:${supplier.Supplier_Email.trim()}`,
                  className: "bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90",
                  children: [
                    /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 mr-2" }),
                    "Email"
                  ]
                }
              ) }),
              shouldShowWhatsApp && /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: `https://wa.me/${normalizedPhone}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90",
                  children: [
                    /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 mr-2" }),
                    "WhatsApp"
                  ]
                }
              ) })
            ] })
          ] }),
          relatedTerms.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator, { className: "bg-gray-700" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Related Terms" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: relatedTerms.map((term, index) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleRelatedTermClick(term),
                  className: "px-3 py-1 bg-gray-700/50 hover:bg-[#F4A024]/20 text-gray-300 hover:text-[#F4A024] rounded-full text-sm transition-colors",
                  children: term.length > 20 ? `${term.substring(0, 20)}...` : term
                },
                index
              )) })
            ] })
          ] }),
          ((_g = supplier.ai_business_summary) == null ? void 0 : _g.trim()) && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator, { className: "bg-gray-700" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "About" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed", children: supplier.ai_business_summary.trim() })
            ] })
          ] }),
          ((_h = supplier.Landing_Page_URL) == null ? void 0 : _h.trim()) && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator, { className: "bg-gray-700 lg:hidden" }),
            /* @__PURE__ */ jsxs("div", { className: "lg:hidden", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Website Preview" }),
              /* @__PURE__ */ jsx("div", { className: "bg-gray-700/50 rounded-lg overflow-hidden aspect-video mb-4", children: !imageLoadError ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: supplier.Landing_Page_URL.trim(),
                  alt: `Website screenshot for ${supplier.Supplier_Name}`,
                  className: "w-full h-full object-cover",
                  onError: () => setImageLoadError(true)
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center p-6", children: [
                /* @__PURE__ */ jsx(Globe, { className: "w-12 h-12 text-gray-400 mb-4" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm", children: "Screenshot unavailable" })
              ] }) }),
              ((_i = supplier.Supplier_Website) == null ? void 0 : _i.trim()) && /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: supplier.Supplier_Website.trim(),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90",
                  children: [
                    /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4 mr-2" }),
                    "Visit Website"
                  ]
                }
              ) }) })
            ] })
          ] }),
          ((_j = supplier.ai_industries_supported) == null ? void 0 : _j.trim()) && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator, { className: "bg-gray-700" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Industries Supported" }),
              /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: industriesSupported.map((industry, index) => /* @__PURE__ */ jsxs("li", { className: "text-gray-300 flex items-start", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[#F4A024] mr-2", children: "•" }),
                industry
              ] }, index)) })
            ] })
          ] }),
          productsOffered.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator, { className: "bg-gray-700" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Products Offered" }),
              /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: visibleProductsOffered.map((product, index) => /* @__PURE__ */ jsxs("li", { className: "text-gray-300 flex items-start", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[#F4A024] mr-2", children: "•" }),
                product
              ] }, index)) }),
              hasMoreProductsOffered && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setShowMoreProductsOffered(!showMoreProductsOffered),
                  className: "mt-4 text-[#F4A024] hover:text-[#F4A024]/80 text-sm font-medium flex items-center gap-1",
                  children: showMoreProductsOffered ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" }),
                    "Show less"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" }),
                    "Show more (",
                    productsOffered.length - maxProductsOfferedToShow,
                    " more)"
                  ] })
                }
              )
            ] })
          ] }),
          ((_k = supplier.Supplier_Location) == null ? void 0 : _k.trim()) && supplier.Countries.Country_Name && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator, { className: "bg-gray-700" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Supplier Location Overview" }),
              /* @__PURE__ */ jsx("div", { className: "bg-gray-700/30 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
                "iframe",
                {
                  src: `https://www.google.com/maps/embed/v1/place?key=${"AIzaSyDIREfdVeV2V1pLQn36cHNKRY-nC2GaY1E"}&q=${encodeURIComponent(
                    `${supplier.Supplier_Location.trim()}, ${supplier.Countries.Country_Name}`
                  )}&zoom=10`,
                  width: "100%",
                  height: "300",
                  style: { border: 0 },
                  allowFullScreen: true,
                  loading: "lazy",
                  referrerPolicy: "no-referrer-when-downgrade",
                  title: `Map showing general area of ${supplier.Supplier_Name}`
                }
              ) }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-2", children: "This map shows the general area where the supplier is located for reference purposes." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator, { className: "bg-gray-700" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: [
                "Supplier Products",
                supplierProducts.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-sm font-normal text-gray-400 ml-2", children: [
                  "(",
                  productCount,
                  " ",
                  productCount === 1 ? "product" : "products",
                  ")"
                ] })
              ] }),
              productsLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }) : supplierProducts.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: limitedProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, { product }, product.id)) }),
                hasMoreSupplierProducts && /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: handleShowAllSupplierProducts,
                    className: "text-[#F4A024] hover:text-[#F4A024]/80 text-sm font-medium flex items-center gap-1 mx-auto",
                    children: [
                      "View All Products from ",
                      supplier.Supplier_Name,
                      /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
                    ]
                  }
                ) })
              ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 bg-gray-700/30 rounded-lg", children: [
                /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "No products found for this supplier." }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Products may not be available in our current catalog." })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: ((_l = supplier.Landing_Page_URL) == null ? void 0 : _l.trim()) && /* @__PURE__ */ jsx("div", { className: "hidden lg:block lg:sticky lg:top-24", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/50 backdrop-blur-sm rounded-lg p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Website Preview" }),
          /* @__PURE__ */ jsx("div", { className: "bg-gray-700/50 rounded-lg overflow-hidden aspect-video mb-4", children: !imageLoadError ? /* @__PURE__ */ jsx(
            "img",
            {
              src: supplier.Landing_Page_URL.trim(),
              alt: `Website screenshot for ${supplier.Supplier_Name}`,
              className: "w-full h-full object-cover",
              onError: () => setImageLoadError(true)
            }
          ) : /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center p-6", children: [
            /* @__PURE__ */ jsx(Globe, { className: "w-12 h-12 text-gray-400 mb-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm", children: "Screenshot unavailable" })
          ] }) }),
          ((_m = supplier.Supplier_Website) == null ? void 0 : _m.trim()) && /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: supplier.Supplier_Website.trim(),
              target: "_blank",
              rel: "noopener noreferrer",
              className: "bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90",
              children: [
                /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4 mr-2" }),
                "Visit Website"
              ]
            }
          ) }) })
        ] }) }) })
      ] })
    ] }) })
  ] });
}
export {
  SupplierPage as default
};
//# sourceMappingURL=SupplierPage-nva6IuOy.js.map
