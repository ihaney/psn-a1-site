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
function CountriesListPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchCountries() {
      try {
        const { data: countriesData, error: countriesError } = await supabase.from("Countries").select("Country_ID, Country_Title, Country_Image");
        if (countriesError) throw countriesError;
        const countriesWithCounts = await Promise.all(
          (countriesData || []).map(async (country) => {
            const [{ count: productCount }, { count: supplierCount }] = await Promise.all([
              supabase.from("Products").select("*", { count: "exact", head: true }).eq("Product_Country_ID", country.Country_ID),
              supabase.from("Supplier").select("*", { count: "exact", head: true }).eq("Supplier_Country_ID", country.Country_ID)
            ]);
            return {
              ...country,
              product_count: productCount || 0,
              supplier_count: supplierCount || 0
            };
          })
        );
        setCountries(countriesWithCounts);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);
  const handleCountryClick = (countryId) => {
    navigate(`/search?country=${countryId}`);
  };
  const totalProducts = countries.reduce((sum, country) => sum + country.product_count, 0);
  const totalSuppliers = countries.reduce((sum, country) => sum + country.supplier_count, 0);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Latin American Countries",
        description: `Explore products and suppliers from ${countries.length} Latin American countries. Browse ${totalProducts.toLocaleString()} products from ${totalSuppliers.toLocaleString()} verified suppliers.`,
        keywords: `Latin American countries, ${countries.map((c) => c.Country_Title).join(", ")}, international trade, B2B marketplace`
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Countries" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: countries.map((country) => /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => handleCountryClick(country.Country_ID),
          className: "bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-all",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
              country.Country_Image && /* @__PURE__ */ jsx(
                "img",
                {
                  src: country.Country_Image,
                  alt: country.Country_Title,
                  className: "w-12 h-12 object-contain rounded-full"
                }
              ),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100", children: country.Country_Title })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400", children: [
                country.product_count,
                " ",
                country.product_count === 1 ? "product" : "products"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400", children: [
                country.supplier_count,
                " ",
                country.supplier_count === 1 ? "supplier" : "suppliers"
              ] })
            ] })
          ]
        },
        country.Country_ID
      )) })
    ] }) })
  ] });
}
export {
  CountriesListPage as default
};
//# sourceMappingURL=CountriesListPage-CnHHRQCl.js.map
