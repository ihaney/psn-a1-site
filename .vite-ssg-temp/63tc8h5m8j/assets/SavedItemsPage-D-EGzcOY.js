import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "react-router-dom";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { P as ProductCard } from "./ProductCard-dZFnl1y5.js";
import { e as useSavedItems, L as LoadingSpinner } from "../main.mjs";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import "react";
import "lucide-react";
import "react-dom/client";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
function SavedItemsPage() {
  useNavigate();
  const { data: savedItems = [], isLoading } = useSavedItems();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Saved Items",
        description: "View your saved Latin American products. Access your curated list of wholesale products from trusted suppliers."
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Saved Items" }),
      isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }) : savedItems.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 font-bold mb-4", children: "You haven't saved any items yet." }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: "text-[#F4A024] hover:text-[#F4A024]/80 font-bold",
            children: "Browse products"
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: savedItems.map((product) => /* @__PURE__ */ jsx(ProductCard, { product }, product.id)) })
    ] }) })
  ] });
}
export {
  SavedItemsPage as default
};
//# sourceMappingURL=SavedItemsPage-D-EGzcOY.js.map
