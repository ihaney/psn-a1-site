import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
function Breadcrumbs({ currentPageTitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previousPage, setPreviousPage] = useState(null);
  useEffect(() => {
    const historyStack = JSON.parse(sessionStorage.getItem("navigationHistory") || "[]");
    if (historyStack.length > 1) {
      setPreviousPage(historyStack[historyStack.length - 2]);
    } else {
      setPreviousPage(null);
    }
  }, [location.pathname]);
  const handleLinkHover = (path) => {
    if (path.startsWith("/product/")) {
      const productId = path.split("/").pop();
      if (productId) {
        queryClient.prefetchQuery({
          queryKey: ["product", productId],
          queryFn: async () => {
            const { data } = await supabase.from("Products").select("*").eq("Product_ID", productId).single();
            return data;
          }
        });
      }
    } else if (path.startsWith("/search")) {
      const params = new URLSearchParams(path.split("?")[1]);
      const category = params.get("category");
      const query = params.get("q");
      if (category) {
        queryClient.prefetchQuery({
          queryKey: ["searchResults", { category }],
          queryFn: async () => {
            const { data } = await supabase.from("Products").select("*").eq("Product_Category_ID", category).limit(20);
            return data;
          }
        });
      } else if (query) {
        queryClient.prefetchQuery({
          queryKey: ["searchResults", { query }],
          queryFn: async () => {
            const searchResults = await productsIndex.search(query, {
              limit: 20
            });
            return searchResults.hits;
          }
        });
      }
    }
  };
  const handlePreviousClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };
  if (!previousPage) {
    return /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-100", children: currentPageTitle }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm mb-2", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "#",
          onMouseEnter: () => previousPage && handleLinkHover(previousPage.path),
          onClick: handlePreviousClick,
          className: "text-[#F4A024] hover:text-[#F4A024]/80 font-medium",
          children: previousPage.title
        }
      ),
      /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 mx-2 text-gray-500" }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: currentPageTitle })
    ] }),
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-100", children: currentPageTitle })
  ] });
}
export {
  Breadcrumbs as B
};
//# sourceMappingURL=Breadcrumbs-Ciuu5swn.js.map
