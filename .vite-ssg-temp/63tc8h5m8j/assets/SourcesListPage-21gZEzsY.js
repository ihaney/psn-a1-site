import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { L as LoadingSpinner, s as supabase } from "../main.mjs";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import "react-dom/client";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "lucide-react";
import "meilisearch";
function SourcesListPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchSources() {
      try {
        const { data: sourcesData, error: sourcesError } = await supabase.from("Sources").select("Source_ID, Source_Title, Source_Image, Source_About");
        if (sourcesError) throw sourcesError;
        const sourcesWithCounts = await Promise.all(
          (sourcesData || []).map(async (source) => {
            const { count: productCount } = await supabase.from("Products").select("*", { count: "exact", head: true }).eq("Product_Source_ID", source.Source_ID);
            const { count: supplierCount } = await supabase.from("Supplier").select("*", { count: "exact", head: true }).eq("Supplier_Source_ID", source.Source_ID);
            const { data: countriesData } = await supabase.from("Products").select("Product_Country_ID").eq("Product_Source_ID", source.Source_ID);
            const uniqueCountries = new Set(countriesData == null ? void 0 : countriesData.map((p) => p.Product_Country_ID));
            return {
              ...source,
              product_count: productCount || 0,
              supplier_count: supplierCount || 0,
              // This now shows ALL suppliers from this source
              country_count: uniqueCountries.size
            };
          })
        );
        const sortedSources = sourcesWithCounts.sort((a, b) => b.product_count - a.product_count);
        setSources(sortedSources);
      } catch (error) {
        console.error("Error fetching sources:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSources();
  }, []);
  const handleSourceClick = (sourceId) => {
    navigate(`/search?source=${sourceId}`);
  };
  const totalProducts = sources.reduce((sum, source) => sum + source.product_count, 0);
  const totalSuppliers = sources.reduce((sum, source) => sum + source.supplier_count, 0);
  const totalCountries = sources.reduce((sum, source) => sum + source.country_count, 0);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Product Sources",
        description: `Browse Latin American products from ${sources.length} trusted sources. Access ${totalProducts.toLocaleString()} products from ${totalSuppliers.toLocaleString()} suppliers across ${totalCountries} countries.`,
        keywords: `Latin American marketplaces, ${sources.map((s) => s.Source_Title).join(", ")}, B2B sources, wholesale sources`
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Product Sources" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", "data-tour": "sources-list", children: sources.map((source) => /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => handleSourceClick(source.Source_ID),
          className: "bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-all",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
              source.Source_Image && /* @__PURE__ */ jsx(
                "img",
                {
                  src: source.Source_Image,
                  alt: source.Source_Title,
                  className: "w-16 h-16 object-contain rounded-lg bg-gray-700/30 p-2"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-1", children: source.Source_Title }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-[#F4A024] font-medium", children: [
                  source.product_count.toLocaleString(),
                  " products"
                ] })
              ] })
            ] }),
            source.Source_About && /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm leading-relaxed line-clamp-3", children: source.Source_About }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-4 border-t border-gray-700/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Products:" }),
                /* @__PURE__ */ jsx("span", { className: "text-[#F4A024] font-medium", children: source.product_count.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Total Suppliers:" }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-300 font-medium", children: source.supplier_count.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Countries:" }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: source.country_count.toLocaleString() })
              ] })
            ] })
          ]
        },
        source.Source_ID
      )) })
    ] }) })
  ] });
}
export {
  SourcesListPage as default
};
//# sourceMappingURL=SourcesListPage-21gZEzsY.js.map
