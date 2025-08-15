import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React__default, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Zap, Shirt, Package } from "lucide-react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { P as ProductCard } from "./ProductCard-dZFnl1y5.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import { s as supabase, L as LoadingSpinner } from "../main.mjs";
import { S as StandardFilters } from "./StandardFilters-BYzhrUIK.js";
import "react-dom/client";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
const PRODUCTS_PER_PAGE = 100;
function useProducts() {
  return useInfiniteQuery({
    queryKey: ["products"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      try {
        console.log(`Fetching products page ${pageParam + 1} (items ${from + 1}-${to + 1})`);
        const { data, error, count } = await supabase.from("Products").select("*", { count: "exact" }).range(from, to).order("Product_ID");
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        const safeData = Array.isArray(data) ? data : [];
        console.log(`Fetched ${safeData.length} products for page ${pageParam + 1}`);
        const products = safeData.map((product) => ({
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
        const totalItems = count || 0;
        const currentItemsLoaded = (pageParam + 1) * PRODUCTS_PER_PAGE;
        const hasMore = currentItemsLoaded < totalItems;
        console.log(`Page ${pageParam + 1}: ${products.length} items, ${currentItemsLoaded}/${totalItems} total loaded, hasMore: ${hasMore}`);
        return {
          data: products,
          nextPage: hasMore ? pageParam + 1 : void 0,
          totalCount: totalItems,
          hasMore
        };
      } catch (error) {
        console.error("Query function error:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : void 0;
    },
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
}
function ProductsPage() {
  var _a, _b, _c;
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error
  } = useProducts();
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [filters, setFilters] = useState({
    categories: { title: "Categories", options: [], selected: [] },
    suppliers: { title: "Suppliers", options: [], selected: [] },
    sources: { title: "Sources", options: [], selected: [] },
    countries: { title: "Countries", options: [], selected: [] }
  });
  const sentinelRef = useRef(null);
  const allProducts = ((_a = data == null ? void 0 : data.pages) == null ? void 0 : _a.flatMap((page) => (page == null ? void 0 : page.data) || [])) || [];
  const totalCount = ((_c = (_b = data == null ? void 0 : data.pages) == null ? void 0 : _b[0]) == null ? void 0 : _c.totalCount) || 0;
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: "100px"
    });
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [handleIntersection]);
  useEffect(() => {
    setFeaturedCategories([
      {
        id: "industrial-tools",
        name: "Industrial Tools & Equipment",
        icon: /* @__PURE__ */ jsx(Factory, { className: "w-12 h-12 text-[#F4A024]" }),
        description: "Professional tools and industrial equipment for manufacturing and construction"
      },
      {
        id: "electronics",
        name: "Electronics",
        icon: /* @__PURE__ */ jsx(Zap, { className: "w-12 h-12 text-[#F4A024]" }),
        description: "Electronic components, devices, and technology solutions"
      },
      {
        id: "apparel-textiles",
        name: "Apparel & Textiles",
        icon: /* @__PURE__ */ jsx(Shirt, { className: "w-12 h-12 text-[#F4A024]" }),
        description: "Clothing, fabrics, and textile products for various applications"
      },
      {
        id: "logistics-packaging",
        name: "Logistics & Packaging Solutions",
        icon: /* @__PURE__ */ jsx(Package, { className: "w-12 h-12 text-[#F4A024]" }),
        description: "Packaging materials, shipping solutions, and logistics services"
      }
    ]);
  }, []);
  useEffect(() => {
    async function fetchFilterOptions() {
      const [categoriesData, suppliersData, sourcesData, countriesData] = await Promise.all([
        supabase.from("Categories").select("Category_ID, Category_Name").order("Category_Name"),
        supabase.from("Supplier").select("Supplier_ID, Supplier_Title").order("Supplier_Title"),
        supabase.from("Sources").select("Source_ID, Source_Title").order("Source_Title"),
        supabase.from("Countries").select("Country_ID, Country_Title").order("Country_Title")
      ]);
      if (categoriesData.data) {
        setFilters((prev) => ({
          ...prev,
          categories: {
            ...prev.categories,
            options: categoriesData.data.map((c) => ({
              id: c.Category_ID,
              title: c.Category_Name,
              count: 0
            }))
          }
        }));
      }
      if (suppliersData.data) {
        setFilters((prev) => ({
          ...prev,
          suppliers: {
            ...prev.suppliers,
            options: suppliersData.data.map((s) => ({
              id: s.Supplier_ID,
              title: s.Supplier_Title,
              count: 0
            }))
          }
        }));
      }
      if (sourcesData.data) {
        setFilters((prev) => ({
          ...prev,
          sources: {
            ...prev.sources,
            options: sourcesData.data.map((s) => ({
              id: s.Source_ID,
              title: s.Source_Title,
              count: 0
            }))
          }
        }));
      }
      if (countriesData.data) {
        setFilters((prev) => ({
          ...prev,
          countries: {
            ...prev.countries,
            options: countriesData.data.map((c) => ({
              id: c.Country_ID,
              title: c.Country_Title,
              count: 0
            }))
          }
        }));
      }
    }
    fetchFilterOptions();
  }, []);
  useEffect(() => {
    const categoryCounts = /* @__PURE__ */ new Map();
    const supplierCounts = /* @__PURE__ */ new Map();
    const sourceCounts = /* @__PURE__ */ new Map();
    const countryCounts = /* @__PURE__ */ new Map();
    allProducts.forEach((product) => {
      categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
      supplierCounts.set(product.supplier, (supplierCounts.get(product.supplier) || 0) + 1);
      sourceCounts.set(product.marketplace, (sourceCounts.get(product.marketplace) || 0) + 1);
      countryCounts.set(product.country, (countryCounts.get(product.country) || 0) + 1);
    });
    setFilters((prev) => ({
      categories: {
        ...prev.categories,
        options: prev.categories.options.map((opt) => ({
          ...opt,
          count: categoryCounts.get(opt.title) || 0
        }))
      },
      suppliers: {
        ...prev.suppliers,
        options: prev.suppliers.options.map((opt) => ({
          ...opt,
          count: supplierCounts.get(opt.title) || 0
        }))
      },
      sources: {
        ...prev.sources,
        options: prev.sources.options.map((opt) => ({
          ...opt,
          count: sourceCounts.get(opt.title) || 0
        }))
      },
      countries: {
        ...prev.countries,
        options: prev.countries.options.map((opt) => ({
          ...opt,
          count: countryCounts.get(opt.title) || 0
        }))
      }
    }));
  }, [allProducts]);
  const handleFilterChange = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        selected: prev[group].selected.includes(value) ? prev[group].selected.filter((v) => v !== value) : [...prev[group].selected, value]
      }
    }));
  };
  const handleCategoryClick = (categoryName) => {
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };
  const filteredProducts = React__default.useMemo(() => {
    return allProducts.filter((product) => {
      const matchesCategory = filters.categories.selected.length === 0 || filters.categories.selected.includes(product.category);
      const matchesSupplier = filters.suppliers.selected.length === 0 || filters.suppliers.selected.includes(product.supplier);
      const matchesSource = filters.sources.selected.length === 0 || filters.sources.selected.includes(product.marketplace);
      const matchesCountry = filters.countries.selected.length === 0 || filters.countries.selected.includes(product.country);
      return matchesCategory && matchesSupplier && matchesSource && matchesCountry;
    });
  }, [allProducts, filters]);
  const sortedProducts = React__default.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (!sortBy) return 0;
      let compareA, compareB;
      switch (sortBy) {
        case "price":
          compareA = parseFloat(a.Product_Price.replace(/[^0-9.-]+/g, ""));
          compareB = parseFloat(b.Product_Price.replace(/[^0-9.-]+/g, ""));
          break;
        case "country":
          compareA = a.country.toLowerCase();
          compareB = b.country.toLowerCase();
          break;
        case "category":
          compareA = a.category.toLowerCase();
          compareB = b.category.toLowerCase();
          break;
        case "marketplace":
          compareA = a.marketplace.toLowerCase();
          compareB = b.marketplace.toLowerCase();
          break;
        default:
          return 0;
      }
      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }, [filteredProducts, sortBy, sortOrder]);
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-red-500 mb-4", children: "Error Loading Products" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: "Please try refreshing the page." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "All Products",
        description: "Browse our complete catalog of Latin American products. Find wholesale products from trusted suppliers across various categories."
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-100 mb-8", children: "Featured Categories" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12", children: featuredCategories.map((category) => /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => handleCategoryClick(category.name),
          className: "relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer group bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all",
          children: /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center p-6 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-4", children: category.icon }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: category.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300", children: category.description })
          ] })
        },
        category.id
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-100", children: "All Products" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
              "Showing ",
              sortedProducts.length,
              " of ",
              totalCount.toLocaleString(),
              " products"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            StandardFilters,
            {
              filters,
              onFilterChange: handleFilterChange,
              sortBy,
              setSortBy,
              sortOrder,
              setSortOrder,
              activeDropdown,
              setActiveDropdown
            }
          )
        ] }),
        isLoading && allProducts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }) : sortedProducts.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: sortedProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, { product }, product.id)) }),
          /* @__PURE__ */ jsxs("div", { ref: sentinelRef, className: "flex justify-center py-8", children: [
            isFetchingNextPage && /* @__PURE__ */ jsx(LoadingSpinner, {}),
            !hasNextPage && allProducts.length > 0 && /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "You've reached the end of the catalog" })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsx("p", { className: "text-gray-300 font-bold", children: "No products found" }) })
      ] })
    ] }) })
  ] });
}
export {
  ProductsPage as default
};
//# sourceMappingURL=ProductsPage-CrltMV5-.js.map
