import { jsxs, jsx } from "react/jsx-runtime";
import { ChevronDown } from "lucide-react";
function StandardFilters({
  filters,
  onFilterChange,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  activeDropdown,
  setActiveDropdown,
  showCategories = true,
  showSuppliers = true,
  showSources = true,
  showCountries = true
}) {
  const filterGroups = [
    { key: "categories", show: showCategories },
    { key: "suppliers", show: showSuppliers },
    { key: "sources", show: showSources },
    { key: "countries", show: showCountries }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
    filterGroups.map(({ key, show }) => {
      if (!show) return null;
      const group = filters[key];
      return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveDropdown(activeDropdown === key ? null : key),
            className: "flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors text-sm",
            children: [
              group.title,
              group.selected.length > 0 && /* @__PURE__ */ jsx("span", { className: "bg-[#F4A024] text-gray-900 text-xs px-1.5 py-0.5 rounded-full font-medium", children: group.selected.length }),
              /* @__PURE__ */ jsx(ChevronDown, { className: `w-4 h-4 transition-transform ${activeDropdown === key ? "rotate-180" : ""}` })
            ]
          }
        ),
        activeDropdown === key && /* @__PURE__ */ jsx("div", { className: "absolute z-10 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "max-h-80 overflow-y-auto", children: group.options.map((option) => /* @__PURE__ */ jsxs(
          "label",
          {
            className: "flex items-center justify-between px-3 py-2 hover:bg-gray-700/50 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: group.selected.includes(option.title),
                    onChange: () => onFilterChange(key, option.title),
                    className: "rounded border-gray-600 text-[#F4A024] focus:ring-[#F4A024] w-4 h-4"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "ml-2 text-gray-300 text-sm", children: option.title })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: option.count })
            ]
          },
          option.id
        )) }) })
      ] }, key);
    }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: sortBy,
          onChange: (e) => setSortBy(e.target.value),
          className: "appearance-none bg-gray-800/50 text-gray-300 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A024] cursor-pointer text-sm",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Sort by" }),
            /* @__PURE__ */ jsx("option", { value: "price", children: "Price" }),
            /* @__PURE__ */ jsx("option", { value: "country", children: "Country" }),
            /* @__PURE__ */ jsx("option", { value: "category", children: "Category" }),
            /* @__PURE__ */ jsx("option", { value: "marketplace", children: "Source" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(ChevronDown, { className: "absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setSortOrder(sortOrder === "asc" ? "desc" : "asc"),
        className: "bg-gray-800/50 text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-sm",
        children: sortOrder === "asc" ? "↑ A-Z" : "↓ Z-A"
      }
    )
  ] });
}
export {
  StandardFilters as S
};
//# sourceMappingURL=StandardFilters-BYzhrUIK.js.map
