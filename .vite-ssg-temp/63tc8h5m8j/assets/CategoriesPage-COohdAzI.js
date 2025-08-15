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
function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log("Fetching categories...");
        const { data: categoriesData, error: categoriesError } = await supabase.from("Categories").select("*");
        if (categoriesError) {
          console.error("Categories error:", categoriesError);
          throw categoriesError;
        }
        console.log("Categories data:", categoriesData);
        if (!categoriesData || categoriesData.length === 0) {
          setCategories([]);
          setError("No categories found in the database");
          return;
        }
        console.log("Fetching all products for count aggregation...");
        const { data: allProducts, error: productsError } = await supabase.from("Products").select("Product_ID, Product_Category_ID, Product_Supplier_ID");
        if (productsError) {
          console.error("Products error:", productsError);
          throw productsError;
        }
        console.log("All products data:", (allProducts == null ? void 0 : allProducts.length) || 0, "products");
        const categoryProductCounts = /* @__PURE__ */ new Map();
        const categorySupplierSets = /* @__PURE__ */ new Map();
        categoriesData.forEach((category) => {
          categoryProductCounts.set(category.Category_ID, 0);
          categorySupplierSets.set(category.Category_ID, /* @__PURE__ */ new Set());
        });
        if (allProducts) {
          allProducts.forEach((product) => {
            const categoryId = product.Product_Category_ID;
            const supplierId = product.Product_Supplier_ID;
            if (categoryId) {
              const currentCount = categoryProductCounts.get(categoryId) || 0;
              categoryProductCounts.set(categoryId, currentCount + 1);
              if (supplierId) {
                const supplierSet = categorySupplierSets.get(categoryId);
                if (supplierSet) {
                  supplierSet.add(supplierId);
                }
              }
            }
          });
        }
        const categoriesWithCounts = categoriesData.map((category) => {
          var _a;
          return {
            Category_ID: category.Category_ID,
            Category_Name: category.Category_Name,
            product_count: categoryProductCounts.get(category.Category_ID) || 0,
            supplier_count: ((_a = categorySupplierSets.get(category.Category_ID)) == null ? void 0 : _a.size) || 0
          };
        });
        console.log("Categories with counts:", categoriesWithCounts.slice(0, 3));
        setCategories(categoriesWithCounts);
      } catch (error2) {
        console.error("Error fetching categories:", error2);
        setError(error2 instanceof Error ? error2.message : "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);
  const handleCategoryClick = (categoryId) => {
    navigate(`/search?category=${categoryId}`);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-red-500 mb-4", children: "Error Loading Categories" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: error }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-2", children: "Check the browser console for more details." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Product Categories",
        description: "Browse our Latin American product categories. Find wholesale products across various industries and categories.",
        keywords: "Latin American categories, product categories, wholesale categories, B2B categories"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Product Categories" }),
      categories.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: "No categories found." }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-2", children: "This might be a database connection issue." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", "data-tour": "categories-grid", children: categories.map((category) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleCategoryClick(category.Category_ID),
          className: "bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-colors text-left",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: category.Category_Name }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-gray-300", children: [
                category.product_count,
                " ",
                category.product_count === 1 ? "product" : "products"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-gray-300", children: [
                category.supplier_count,
                " ",
                category.supplier_count === 1 ? "supplier" : "suppliers"
              ] })
            ] })
          ]
        },
        category.Category_ID
      )) })
    ] }) })
  ] });
}
export {
  CategoriesPage as default
};
//# sourceMappingURL=CategoriesPage-COohdAzI.js.map
