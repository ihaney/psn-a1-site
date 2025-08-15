import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "react-router-dom";
import { Mail, MessageSquare } from "lucide-react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { f as useContactHistory, L as LoadingSpinner } from "../main.mjs";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import "react";
import "react-dom/client";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
function MessageHistoryPage() {
  useNavigate();
  const { data: history = [], isLoading } = useContactHistory();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Message History",
        description: "View your supplier contact history. Track your communications with Latin American suppliers."
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Message History" }),
      isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }) : history.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 font-bold mb-4", children: "You haven't contacted any suppliers yet." }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: "text-[#F4A024] hover:text-[#F4A024]/80 font-bold",
            children: "Browse products"
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: history.map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-gray-800/50 rounded-lg p-4 flex items-center gap-4",
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: item.product.image,
                alt: item.product.name,
                className: "w-24 h-24 object-cover rounded-lg"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-100", children: item.product.name }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: item.product.supplier }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 text-sm text-gray-400", children: [
                item.contactMethod === "email" ? /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Contacted via ",
                  item.contactMethod,
                  " on",
                  " ",
                  new Date(item.contactedAt).toLocaleDateString()
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `/product/${item.product.id}`,
                className: "text-[#F4A024] hover:text-[#F4A024]/80",
                children: "View Product"
              }
            )
          ]
        },
        item.id
      )) })
    ] }) })
  ] });
}
export {
  MessageHistoryPage as default
};
//# sourceMappingURL=MessageHistoryPage-BVZPet-I.js.map
