import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { s as supabase, L as LoadingSpinner, c as createSupplierUrl } from "../main.mjs";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import "react-dom/client";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
const SUPPLIERS_PER_PAGE = 50;
function SuppliersListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const { data, isLoading, error } = useQuery({
    queryKey: ["suppliersList", currentPage],
    queryFn: async () => {
      const from = currentPage * SUPPLIERS_PER_PAGE;
      const to = from + SUPPLIERS_PER_PAGE - 1;
      const { data: suppliersData, error: suppliersError, count } = await supabase.from("Supplier").select("*", { count: "exact" }).range(from, to).order("Supplier_Title", { ascending: true });
      if (suppliersError) {
        console.error("Error fetching suppliers:", suppliersError);
        throw suppliersError;
      }
      const suppliers2 = (suppliersData || []).map((supplier) => ({
        Supplier_ID: supplier.Supplier_ID,
        Supplier_Title: supplier.Supplier_Title || "Unknown Supplier",
        Supplier_Description: supplier.Supplier_Description || "",
        Supplier_Website: supplier.Supplier_Website || "",
        Supplier_Email: supplier.Supplier_Email || "",
        Supplier_Location: supplier.Supplier_Location || "",
        Supplier_Whatsapp: supplier.Supplier_Whatsapp || "",
        Supplier_Country_Name: supplier.Supplier_Country_Name || "Unknown",
        Supplier_City_Name: supplier.Supplier_City_Name || "",
        Supplier_Source_ID: supplier.Supplier_Source_ID || ""
      }));
      const totalCount2 = count || 0;
      const totalPages2 = Math.ceil(totalCount2 / SUPPLIERS_PER_PAGE);
      const hasNextPage2 = currentPage < totalPages2 - 1;
      const hasPrevPage2 = currentPage > 0;
      return {
        data: suppliers2,
        totalCount: totalCount2,
        currentPage,
        totalPages: totalPages2,
        hasNextPage: hasNextPage2,
        hasPrevPage: hasPrevPage2
      };
    },
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
  const suppliers = (data == null ? void 0 : data.data) || [];
  const totalCount = (data == null ? void 0 : data.totalCount) || 0;
  const totalPages = (data == null ? void 0 : data.totalPages) || 0;
  const hasNextPage = (data == null ? void 0 : data.hasNextPage) || false;
  const hasPrevPage = (data == null ? void 0 : data.hasPrevPage) || false;
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleSupplierClick = (supplier) => {
    navigate(createSupplierUrl(supplier.Supplier_Title, supplier.Supplier_ID));
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        SEO,
        {
          title: "Error Loading Suppliers",
          description: "Unable to load suppliers directory. Please try again later."
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-red-500 mb-4", children: "Error Loading Suppliers" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: "Please try refreshing the page." }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-2", children: error.message })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Suppliers Directory",
        description: `Browse ${totalCount.toLocaleString()} verified Latin American suppliers. Find trusted wholesale suppliers across Latin America.`,
        keywords: "Latin American suppliers, wholesale suppliers, B2B suppliers, verified suppliers"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Suppliers Directory" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
          "Showing ",
          suppliers.length,
          " of ",
          totalCount.toLocaleString(),
          " suppliers",
          currentPage > 0 && ` (Page ${currentPage + 1} of ${totalPages})`
        ] }) }) }),
        suppliers.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6", "data-tour": "suppliers-list", children: suppliers.map((supplier) => /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => handleSupplierClick(supplier),
              className: "group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-200",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-[#F4A024]/10 rounded-lg flex items-center justify-center group-hover:bg-[#F4A024]/20 transition-colors", children: /* @__PURE__ */ jsx(Building2, { className: "w-6 h-6 text-[#F4A024]" }) }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-100 mb-2 group-hover:text-[#F4A024] transition-colors", children: supplier.Supplier_Title }),
                  supplier.Supplier_Description && /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed", children: supplier.Supplier_Description }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 text-sm text-gray-400", children: (supplier.Supplier_Country_Name || supplier.Supplier_Location) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { children: supplier.Supplier_Location || `${supplier.Supplier_City_Name ? supplier.Supplier_City_Name + ", " : ""}${supplier.Supplier_Country_Name}` })
                  ] }) })
                ] })
              ] })
            },
            supplier.Supplier_ID
          )) }),
          totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center gap-4 mt-8", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handlePrevPage,
                disabled: !hasPrevPage,
                className: "flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                children: [
                  /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }),
                  "Previous"
                ]
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-400", children: [
              "Page ",
              currentPage + 1,
              " of ",
              totalPages
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleNextPage,
                disabled: !hasNextPage,
                className: "flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                children: [
                  "Next",
                  /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
                ]
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "text-center py-12 bg-gray-800/30 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "No suppliers found." }) })
      ] })
    ] }) })
  ] });
}
export {
  SuppliersListPage as default
};
//# sourceMappingURL=SuppliersListPage-BNaC5CBu.js.map
