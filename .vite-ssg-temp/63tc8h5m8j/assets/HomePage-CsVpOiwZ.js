import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { Building2, Package, Search, Users, Database, UserCheck } from "lucide-react";
import { u as useDebouncedValue, a as analytics, l as logSearchQuery, L as LoadingSpinner, s as supabase, p as productsIndex, b as suppliersIndex, c as createSupplierUrl, d as logError, i as isBrowser } from "../main.mjs";
import { useNavigate } from "react-router-dom";
import "react-dom/client";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
function getSavedSearchMode() {
  if (!isBrowser) return "products";
  try {
    const saved = localStorage.getItem("paisan_search_mode");
    return saved === "suppliers" ? "suppliers" : "products";
  } catch {
    return "products";
  }
}
function saveSearchMode(mode) {
  if (!isBrowser) return;
  try {
    localStorage.setItem("paisan_search_mode", mode);
  } catch {
  }
}
function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(getSavedSearchMode);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(null);
  const [totalSuppliers, setTotalSuppliers] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  useEffect(() => {
    const fetchStats = async () => {
      setStatsError(null);
      try {
        const productsResponse = await supabase.from("Products").select("Product_ID", { count: "estimated", head: true });
        if (productsResponse.error) {
          console.error("Error fetching products count:", productsResponse.error);
          setStatsError("Unable to load product statistics");
          return;
        }
        const suppliersResponse = await supabase.from("Supplier").select("Supplier_ID", { count: "estimated", head: true });
        if (suppliersResponse.error) {
          console.error("Error fetching suppliers count:", suppliersResponse.error);
          setStatsError("Unable to load supplier statistics");
          return;
        }
        setTotalProducts(productsResponse.count || 0);
        setTotalSuppliers(suppliersResponse.count || 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStatsError("Unable to load statistics");
      }
    };
    fetchStats();
  }, []);
  useEffect(() => {
    saveSearchMode(searchMode);
  }, [searchMode]);
  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        let searchResults = [];
        if (searchMode === "products") {
          const productsResults = await productsIndex.search(debouncedQuery, {
            limit: 1,
            // Limit to 1 result for the dropdown
            attributesToRetrieve: [
              "id",
              "title",
              "price",
              "image",
              "url",
              "moq",
              "country",
              "category",
              "supplier",
              "source"
            ]
          });
          searchResults = productsResults.hits.map((hit) => ({
            id: hit.id,
            name: hit.title,
            type: "product",
            image: hit.image || "",
            country: hit.country || "Unknown",
            category: hit.category || "Unknown",
            supplier: hit.supplier || "Unknown",
            marketplace: hit.source || "Unknown",
            price: hit.price,
            moq: hit.moq || "N/A",
            url: `/product/${hit.id}`
          }));
        } else {
          const suppliersResults = await suppliersIndex.search(debouncedQuery, {
            limit: 1,
            // Limit to 1 result for the dropdown
            attributesToRetrieve: [
              "Supplier_ID",
              "Supplier_Title",
              "Supplier_Description",
              "Supplier_Country_Name",
              "Supplier_City_Name",
              "Supplier_Location",
              "Supplier_Source_ID",
              "product_count",
              "product_keywords"
            ]
          });
          const sourceIds = [...new Set(
            suppliersResults.hits.map((hit) => hit.Supplier_Source_ID).filter(Boolean)
          )];
          let sourceTitles = {};
          if (sourceIds.length > 0) {
            try {
              const { data: sourcesData, error: sourcesError } = await supabase.from("Sources").select("Source_ID, Source_Title").in("Source_ID", sourceIds);
              if (sourcesError) {
                console.error("Error fetching sources:", sourcesError);
              } else if (sourcesData) {
                sourceTitles = sourcesData.reduce((acc, source) => {
                  acc[source.Source_ID] = source.Source_Title;
                  return acc;
                }, {});
              }
            } catch (err) {
              console.error("Error in source fetch:", err);
            }
          }
          searchResults = suppliersResults.hits.map((hit) => ({
            id: hit.Supplier_ID,
            name: hit.Supplier_Title,
            type: "supplier",
            country: hit.Supplier_Country_Name || "Unknown",
            location: hit.Supplier_Location || hit.Supplier_City_Name || "Unknown",
            description: hit.Supplier_Description || "",
            product_count: hit.product_count || 0,
            sourceId: hit.Supplier_Source_ID || "",
            sourceTitle: sourceTitles[hit.Supplier_Source_ID] || "Unknown Source",
            productKeywords: hit.product_keywords || "",
            url: createSupplierUrl(hit.Supplier_Title, hit.Supplier_ID)
          }));
        }
        setResults(searchResults);
        if (!searchResults.length && debouncedQuery.length > 2) {
          logError(new Error("Hero search returned no results"), {
            type: "hero_search_no_results",
            query: debouncedQuery,
            mode: searchMode
          }, "warning");
        }
      } catch (err) {
        console.error("Search error:", err);
        logError(err instanceof Error ? err : new Error("Hero search failed"), {
          type: "hero_search_error",
          query: debouncedQuery,
          mode: searchMode
        });
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [debouncedQuery, searchMode]);
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      analytics.trackEvent("hero_search_submit", {
        props: {
          query: searchQuery,
          mode: searchMode
        }
      });
      logSearchQuery(searchQuery.trim(), searchMode);
      const searchParams = new URLSearchParams({
        q: searchQuery.trim(),
        mode: searchMode
      });
      navigate(`/search?${searchParams.toString()}`);
    }
  }, [searchQuery, navigate, searchMode]);
  const handleResultClick = (result) => {
    analytics.trackEvent("hero_search_result_click", {
      props: {
        result_id: result.id,
        result_name: result.name,
        result_type: result.type,
        query: searchQuery
      }
    });
    logSearchQuery(searchQuery.trim(), searchMode);
    navigate(result.url);
    setSearchQuery("");
    setResults([]);
  };
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    analytics.trackEvent("hero_search_mode_change", {
      props: { mode }
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden bg-black", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto", children: /* @__PURE__ */ jsx("div", { className: "relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32 pt-32", children: /* @__PURE__ */ jsx("main", { className: "mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-4xl tracking-tight font-extrabold text-gray-100 sm:text-5xl md:text-6xl", children: [
      /* @__PURE__ */ jsx("span", { className: "block", children: "Discover" }),
      /* @__PURE__ */ jsx("span", { className: "block text-[#F4A024]", children: "Latin American Products" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl", children: "We connect Latin American suppliers with global markets." }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 sm:mt-12 flex justify-center px-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "w-full max-w-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => handleSearchModeChange("suppliers"),
            className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${searchMode === "suppliers" ? "bg-[#F4A024] text-gray-900" : "bg-white/10 text-gray-300 hover:bg-white/20"}`,
            children: [
              /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }),
              "Suppliers"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => handleSearchModeChange("products"),
            className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${searchMode === "products" ? "bg-[#F4A024] text-gray-900" : "bg-white/10 text-gray-300 hover:bg-white/20"}`,
            children: [
              /* @__PURE__ */ jsx(Package, { className: "w-4 h-4" }),
              "Products"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 z-10", children: /* @__PURE__ */ jsx(Search, { className: "w-5 h-5 text-[#F4A024]" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: searchMode === "products" ? "Search products, categories, suppliers..." : "Search suppliers by name, location, capabilities...",
            className: "w-full px-12 py-4 bg-white/10 hover:bg-white/20 focus:bg-white/20 rounded-lg text-gray-100 placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-[#F4A024] transition-all duration-200"
          }
        ),
        searchQuery && /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden", children: loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-4", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }) : results.length > 0 ? /* @__PURE__ */ jsx("div", { children: results.slice(0, 1).map((result) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleResultClick(result),
            className: "w-full text-left px-4 py-4 hover:bg-gray-700/50 transition-colors",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              result.type === "product" && result.image && /* @__PURE__ */ jsx(
                "img",
                {
                  src: result.image,
                  alt: result.name,
                  className: "w-16 h-16 object-cover rounded"
                }
              ),
              result.type === "supplier" && /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-[#F4A024]/10 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx(Building2, { className: "w-8 h-8 text-[#F4A024]" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium text-white truncate", children: result.name }),
                result.type === "product" ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-sm text-gray-400", children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: result.category }),
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsx("span", { children: result.price })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-sm text-gray-400", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[#F4A024]", children: "Supplier" }),
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsx("span", { children: result.country }),
                  result.product_count !== void 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("span", { children: "•" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      result.product_count,
                      " products"
                    ] })
                  ] })
                ] })
              ] })
            ] })
          },
          `${result.type}-${result.id}`
        )) }) : /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-sm p-4", children: [
          "No ",
          searchMode,
          " found. Try different keywords or browse categories."
        ] }) })
      ] })
    ] }) })
  ] }) }) }) }) });
}
function HomePage() {
  const [metrics, setMetrics] = useState({
    suppliers: 0,
    products: 0,
    sources: 0
  });
  const formatMetricNumber = (num) => {
    if (num < 1e3) {
      return num.toString();
    }
    const rounded = Math.round(num / 500) * 500;
    if (rounded >= 1e3) {
      const kValue = rounded / 1e3;
      if (kValue % 1 === 0) {
        return `${kValue}K`;
      } else {
        return `${kValue.toFixed(1)}K`;
      }
    }
    return rounded.toString();
  };
  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching metrics...");
        const [suppliersCount, productsCount, sourcesCount] = await Promise.all([
          supabase.from("Supplier").select("*", { count: "estimated", head: true }),
          supabase.from("Products").select("*", { count: "estimated", head: true }),
          supabase.from("Sources").select("*", { count: "estimated", head: true })
        ]);
        console.log("Metrics results:", { suppliersCount, productsCount, sourcesCount });
        setMetrics({
          suppliers: suppliersCount.count || 0,
          products: productsCount.count || 0,
          sources: sourcesCount.count || 0
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }
    fetchData();
  }, []);
  console.log("HomePage render:", {
    metrics
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Latin American Products Marketplace",
        description: "Discover authentic Latin American products and connect with trusted suppliers. Find wholesale products from Mexico, Colombia, Brazil and more.",
        keywords: "Latin American marketplace, wholesale products, B2B marketplace, Mexican products, Colombian products, Brazilian products"
      }
    ),
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx("main", { className: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: /* @__PURE__ */ jsx("div", { className: "space-y-12", children: /* @__PURE__ */ jsxs("div", { className: "py-16 border-t border-gray-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-6xl font-bold paisan-text text-[#F4A024] mb-4", children: "Paisán" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl text-gray-300 mb-8", children: "A Trusted Sourcing Tool" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-400 max-w-3xl mx-auto", children: "Simplifying sourcing across Latin America by providing comprehensive supplier and product data." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4", children: /* @__PURE__ */ jsx(Building2, { className: "w-6 h-6 text-[#F4A024]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-[#F4A024] mb-2", children: [
            formatMetricNumber(metrics.suppliers),
            "+"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Suppliers" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-[#F4A024]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-[#F4A024] mb-2", children: [
            formatMetricNumber(metrics.products),
            "+"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Products" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4", children: /* @__PURE__ */ jsx(Database, { className: "w-6 h-6 text-[#F4A024]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-[#F4A024] mb-2", children: [
            formatMetricNumber(metrics.sources),
            "+"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Sources" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4", children: /* @__PURE__ */ jsx(UserCheck, { className: "w-6 h-6 text-[#F4A024]" }) }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-[#F4A024] mb-2", children: "5M+" }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Monthly Audience" })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  HomePage as default
};
//# sourceMappingURL=HomePage-CsVpOiwZ.js.map
