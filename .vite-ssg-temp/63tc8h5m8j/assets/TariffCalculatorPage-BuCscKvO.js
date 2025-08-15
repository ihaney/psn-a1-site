import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import React__default, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, Search, X, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { u as useProductSearch } from "./useProductSearch-Cp5Hx_LQ.js";
import { e as useSavedItems, V as Vt, i as isBrowser, L as LoadingSpinner } from "../main.mjs";
import "react-dom/client";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
const TARIFF_CATEGORIES = [
  { id: "live-animals", name: "Live Animals & Aquaculture", rate: 0.1 },
  { id: "meat", name: "Meat & Edible Offal", rate: 0.1 },
  { id: "dairy", name: "Dairy, Eggs & Honey", rate: 0.1 },
  { id: "produce", name: "Produce & Nuts", rate: 0.1 },
  { id: "grains", name: "Grains, Milled Goods & Bakery", rate: 0.1 },
  { id: "prepared-foods", name: "Prepared Foods & Beverages", rate: 0.1 },
  { id: "plastics-primary", name: "Plastics in Primary Forms", rate: 0.1 },
  { id: "plastic-articles", name: "Plastic Articles & Packaging", rate: 0.1 },
  { id: "rubber", name: "Rubber & Rubber Goods", rate: 0.1 },
  { id: "wood", name: "Wood, Plywood & Panels", rate: 0.1 },
  { id: "paper", name: "Paper, Cartons & Printed Media", rate: 0.1 },
  { id: "textile-yarns", name: "Textile Yarns & Fabrics", rate: 0.1 },
  { id: "knitted-apparel", name: "Knitted Apparel", rate: 0.1 },
  { id: "woven-apparel", name: "Woven Apparel", rate: 0.1 },
  { id: "home-textiles", name: "Home Textiles & Furnishings", rate: 0.1 },
  { id: "footwear", name: "Footwear", rate: 0.1 },
  { id: "headgear", name: "Headgear, Umbrellas & Similar", rate: 0.1 },
  { id: "stone-ceramic", name: "Stone, Ceramic & Glassware", rate: 0.1 },
  { id: "base-metals", name: "Base Metals & Semi‑Finished Products", rate: 0.1 },
  { id: "metal-tools", name: "Metal Tools & Hardware", rate: 0.1 },
  { id: "machinery", name: "Machinery & Mechanical Appliances", rate: 0.1 },
  { id: "computers", name: "Computers & Office Machines", rate: 0.1 },
  { id: "electrical", name: "Electrical Machinery & Parts", rate: 0.1 },
  { id: "electronics", name: "Consumer Electronics & A/V", rate: 0.1 },
  { id: "vehicles", name: "Vehicles & Auto Parts", rate: 0.1 },
  { id: "rail-aircraft", name: "Rail, Aircraft & Spacecraft", rate: 0.1 },
  { id: "optical-medical", name: "Optical & Medical Instruments", rate: 0.1 },
  { id: "jewellery", name: "Jewellery & Precious Metals", rate: 0.1 },
  { id: "toys-games", name: "Toys, Games & Sporting Goods", rate: 0.1 },
  { id: "furniture", name: "Furniture & Bedding", rate: 0.1 },
  { id: "chemicals", name: "Chemicals & Fertilizers", rate: 0.1 },
  { id: "cosmetics", name: "Cosmetics, Soaps & Cleaners", rate: 0.1 },
  { id: "photography", name: "Photography & Cinematography", rate: 0.1 },
  { id: "arms", name: "Arms & Ammunition", rate: 0.1 },
  { id: "misc", name: "Miscellaneous Manufactures", rate: 0.1 }
];
const pdfStyles = {
  page: {
    padding: 40,
    fontFamily: "Helvetica"
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #cccccc",
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666666",
    marginBottom: 5
  },
  date: {
    fontSize: 10,
    textAlign: "right",
    color: "#666666"
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    padding: 5,
    fontWeight: "bold"
  },
  table: {
    width: "100%",
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomColor: "#cccccc",
    borderBottomWidth: 1,
    padding: 8
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#eeeeee",
    borderBottomWidth: 1,
    padding: 8,
    minHeight: 24
  },
  tableCell: {
    flex: 1,
    fontSize: 10
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold"
  },
  productInfo: {
    flex: 2
  },
  tariffInfo: {
    flex: 1
  },
  amountInfo: {
    flex: 1,
    textAlign: "right"
  },
  totals: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 10
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold"
  },
  totalAmount: {
    fontSize: 12,
    textAlign: "right"
  },
  finalTotal: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#cccccc"
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#666666",
    fontSize: 8,
    borderTop: "1 solid #cccccc",
    paddingTop: 10
  }
};
const createTariffPDF = (PDFComponents, products, grandTotal) => {
  const { Document, Page, Text, View, StyleSheet } = PDFComponents;
  const styles = StyleSheet.create(pdfStyles);
  return React__default.createElement(
    Document,
    null,
    React__default.createElement(
      Page,
      { size: "A4", style: styles.page },
      React__default.createElement(
        View,
        { style: styles.header },
        React__default.createElement(Text, { style: styles.title }, "Tariff Calculation Report"),
        React__default.createElement(Text, { style: styles.subtitle }, "Generated by Paisán - Latin American Products Marketplace"),
        React__default.createElement(
          Text,
          { style: styles.date },
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        )
      ),
      React__default.createElement(
        View,
        { style: styles.section },
        React__default.createElement(Text, { style: styles.sectionTitle }, "Calculation Details"),
        React__default.createElement(
          View,
          { style: styles.table },
          React__default.createElement(
            View,
            { style: styles.tableHeader },
            React__default.createElement(Text, { style: [styles.tableCellHeader, styles.productInfo] }, "Product Information"),
            React__default.createElement(Text, { style: [styles.tableCellHeader, styles.tariffInfo] }, "Tariff Category"),
            React__default.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Base Amount"),
            React__default.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Tariff Rate"),
            React__default.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Tariff Amount"),
            React__default.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Total")
          ),
          ...products.map(
            (product, index) => {
              var _a, _b, _c, _d;
              return React__default.createElement(
                View,
                { key: index, style: styles.tableRow },
                React__default.createElement(
                  View,
                  { style: [styles.tableCell, styles.productInfo] },
                  React__default.createElement(Text, null, product.name),
                  React__default.createElement(
                    Text,
                    { style: { fontSize: 8, color: "#666666" } },
                    `Supplier: ${product.supplier}`
                  ),
                  React__default.createElement(
                    Text,
                    { style: { fontSize: 8, color: "#666666" } },
                    `Link: ${product.url}`
                  )
                ),
                React__default.createElement(
                  Text,
                  { style: [styles.tableCell, styles.tariffInfo] },
                  product.applicableTariffs.map((tariffId) => {
                    const category = TARIFF_CATEGORIES.find((cat) => cat.id === tariffId);
                    return category == null ? void 0 : category.name;
                  }).join(", ")
                ),
                React__default.createElement(
                  Text,
                  { style: [styles.tableCell, styles.amountInfo] },
                  `$${(_a = product.subtotal) == null ? void 0 : _a.baseAmount.toFixed(2)}`
                ),
                React__default.createElement(
                  Text,
                  { style: [styles.tableCell, styles.amountInfo] },
                  `${(((_b = product.subtotal) == null ? void 0 : _b.effectiveRate) || 0) * 100}%`
                ),
                React__default.createElement(
                  Text,
                  { style: [styles.tableCell, styles.amountInfo] },
                  `$${(_c = product.subtotal) == null ? void 0 : _c.tariffAmount.toFixed(2)}`
                ),
                React__default.createElement(
                  Text,
                  { style: [styles.tableCell, styles.amountInfo] },
                  `$${(_d = product.subtotal) == null ? void 0 : _d.total.toFixed(2)}`
                )
              );
            }
          )
        ),
        React__default.createElement(
          View,
          { style: styles.totals },
          React__default.createElement(
            View,
            { style: styles.totalRow },
            React__default.createElement(Text, { style: styles.totalLabel }, "Total Base Amount:"),
            React__default.createElement(Text, { style: styles.totalAmount }, `$${grandTotal.baseAmount.toFixed(2)}`)
          ),
          React__default.createElement(
            View,
            { style: styles.totalRow },
            React__default.createElement(Text, { style: styles.totalLabel }, "Effective Tariff Rate:"),
            React__default.createElement(Text, { style: styles.totalAmount }, `${(grandTotal.effectiveRate * 100).toFixed(1)}%`)
          ),
          React__default.createElement(
            View,
            { style: styles.totalRow },
            React__default.createElement(Text, { style: styles.totalLabel }, "Total Tariffs:"),
            React__default.createElement(Text, { style: styles.totalAmount }, `$${grandTotal.tariffAmount.toFixed(2)}`)
          ),
          React__default.createElement(
            View,
            { style: [styles.totalRow, styles.finalTotal] },
            React__default.createElement(Text, { style: styles.totalLabel }, "Final Total:"),
            React__default.createElement(Text, { style: styles.totalAmount }, `$${grandTotal.total.toFixed(2)}`)
          )
        )
      ),
      React__default.createElement(
        Text,
        { style: styles.footer },
        "This tariff calculation report was automatically generated through Paisán (paisan.net). For any questions, please contact support@paisan.net"
      )
    )
  );
};
function TariffCalculatorPage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { products, loading: productLoading } = useProductSearch(productSearchQuery);
  const { data: savedItems = [], isLoading: savedItemsLoading } = useSavedItems();
  useEffect(() => {
    const updatedProducts = selectedProducts.map((product) => {
      const baseAmount = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
      if (isNaN(baseAmount)) return product;
      const applicableTariffs = product.applicableTariffs;
      const tariffRate = applicableTariffs.reduce((rate, catId) => {
        const category = TARIFF_CATEGORIES.find((cat) => cat.id === catId);
        return rate + ((category == null ? void 0 : category.rate) || 0);
      }, 0);
      const tariffAmount = baseAmount * tariffRate;
      return {
        ...product,
        subtotal: {
          baseAmount,
          tariffAmount,
          total: baseAmount + tariffAmount,
          effectiveRate: tariffRate
        }
      };
    });
    setSelectedProducts(updatedProducts);
  }, [selectedCategories]);
  const addProduct = (product) => {
    if (!product) return;
    const basePrice = parseFloat((product.Product_Price || "").replace(/[^0-9.-]+/g, ""));
    if (!isNaN(basePrice)) {
      const applicableTariffs = ["misc"];
      setSelectedProducts((prev) => [...prev, {
        id: product.Product_ID,
        name: product.Product_Title || "Untitled Product",
        price: product.Product_Price || "$0",
        url: `https://paisan.net/product/${product.Product_ID}`,
        category: product.category_title || "Miscellaneous",
        supplier: product.supplier_title || "Unknown Supplier",
        applicableTariffs
      }]);
      setSelectedCategories((prev) => {
        const newCategories = /* @__PURE__ */ new Set([...prev, ...applicableTariffs]);
        return Array.from(newCategories);
      });
    }
    setProductSearchQuery("");
  };
  const removeProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    const remainingProducts = selectedProducts.filter((p) => p.id !== productId);
    const newCategories = /* @__PURE__ */ new Set();
    remainingProducts.forEach((product) => {
      product.applicableTariffs.forEach((cat) => newCategories.add(cat));
    });
    setSelectedCategories(Array.from(newCategories));
  };
  const importSavedItems = () => {
    if (savedItems.length === 0) {
      Vt.error("No saved items found");
      return;
    }
    const newProducts = savedItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.Product_Price,
      url: `https://paisan.net/product/${item.id}`,
      category: item.category,
      supplier: item.supplier,
      applicableTariffs: ["misc"]
      // Default to misc category
    }));
    const existingProductIds = new Set(selectedProducts.map((product) => product.id));
    const productsToAdd = newProducts.filter((product) => !existingProductIds.has(product.id));
    if (productsToAdd.length === 0) {
      Vt.info("All saved items are already in your tariff calculation");
      return;
    }
    setSelectedProducts((prev) => [...prev, ...productsToAdd]);
    const newCategories = new Set(selectedCategories);
    productsToAdd.forEach((product) => {
      product.applicableTariffs.forEach((cat) => newCategories.add(cat));
    });
    setSelectedCategories(Array.from(newCategories));
    Vt.success(`Added ${productsToAdd.length} saved items to your tariff calculation`);
  };
  const grandTotal = {
    baseAmount: selectedProducts.reduce((sum, product) => {
      var _a;
      return sum + (((_a = product.subtotal) == null ? void 0 : _a.baseAmount) || 0);
    }, 0),
    tariffAmount: selectedProducts.reduce((sum, product) => {
      var _a;
      return sum + (((_a = product.subtotal) == null ? void 0 : _a.tariffAmount) || 0);
    }, 0),
    total: selectedProducts.reduce((sum, product) => {
      var _a;
      return sum + (((_a = product.subtotal) == null ? void 0 : _a.total) || 0);
    }, 0),
    effectiveRate: selectedProducts.length > 0 ? selectedProducts.reduce((sum, product) => {
      var _a;
      return sum + (((_a = product.subtotal) == null ? void 0 : _a.tariffAmount) || 0);
    }, 0) / selectedProducts.reduce((sum, product) => {
      var _a;
      return sum + (((_a = product.subtotal) == null ? void 0 : _a.baseAmount) || 0);
    }, 0) : 0
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };
  const handlePDFDownload = useCallback(async () => {
    setPdfLoading(true);
    try {
      const PDFModule = await import("@react-pdf/renderer");
      const pdfComponents = {
        PDFDownloadLink: PDFModule.PDFDownloadLink,
        Document: PDFModule.Document,
        Page: PDFModule.Page,
        Text: PDFModule.Text,
        View: PDFModule.View,
        StyleSheet: PDFModule.StyleSheet
      };
      const document = createTariffPDF(pdfComponents, selectedProducts, grandTotal);
      const blob = await PDFModule.pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tariff-calculation.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Vt.error("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [selectedProducts, grandTotal]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Tariff Calculator",
        description: "Calculate import tariffs for Mexican products. Estimate duties and fees for different product categories.",
        keywords: "tariff calculator, import duties, Mexican imports, customs duties, trade calculator"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate(-1),
          className: "inline-flex items-center font-bold text-[#F4A024] hover:text-[#F4A024]/80 mb-8",
          style: { display: isBrowser ? "flex" : "none" },
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5 mr-2" }),
            "Back"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Tariff Calculator" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Calculate import duties for Mexican products" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-[#F4A024] mt-2", children: "Note: Each category adds a 10% tariff" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-lg p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Select Products" }),
            savedItems.length > 0 && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: importSavedItems,
                disabled: savedItemsLoading,
                className: "flex items-center gap-2 bg-[#F4A024] text-gray-900 px-4 py-2 rounded-md hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }),
                  "Import Saved Items (",
                  savedItems.length,
                  ")"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative mb-6", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: productSearchQuery,
                onChange: (e) => setProductSearchQuery(e.target.value),
                placeholder: "Search products...",
                className: "w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
              }
            ),
            productSearchQuery && /* @__PURE__ */ jsx("div", { className: "absolute z-10 left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg", children: productLoading ? /* @__PURE__ */ jsx("div", { className: "text-center py-4", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }) : products.length > 0 ? /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-y-auto", children: products.map((product) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => addProduct(product),
                className: "w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors",
                children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: product.Product_Title || "Untitled Product" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[#F4A024]", children: product.Product_Price || "$0" })
                ] })
              },
              product.Product_ID
            )) }) : /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm p-4", children: "No products found" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            selectedProducts.length > 0 ? selectedProducts.map((product) => /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: product.name }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: product.category }),
                    /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "•" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: product.supplier }),
                    /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "•" }),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: product.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-sm text-[#F4A024] hover:text-[#F4A024]/80",
                        children: "View product"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: product.price }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => removeProduct(product.id),
                      className: "text-gray-400 hover:text-red-500 transition-colors",
                      children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Applied Tariff Categories:" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: product.applicableTariffs.map((catId) => {
                  const category = TARIFF_CATEGORIES.find((cat) => cat.id === catId);
                  return category ? /* @__PURE__ */ jsxs(
                    "span",
                    {
                      className: "text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300",
                      children: [
                        category.name,
                        " (10%)"
                      ]
                    },
                    catId
                  ) : null;
                }) })
              ] }),
              product.subtotal && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Base Amount" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: formatCurrency(product.subtotal.baseAmount) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Tariff Rate" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[#F4A024]", children: [
                    (product.subtotal.effectiveRate * 100).toFixed(1),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Tariff Amount" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[#F4A024]", children: [
                    "+",
                    formatCurrency(product.subtotal.tariffAmount)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Total" }),
                  /* @__PURE__ */ jsx("p", { className: "text-white font-medium", children: formatCurrency(product.subtotal.total) })
                ] })
              ] }) })
            ] }, product.id)) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 border-2 border-dashed border-gray-700 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-gray-400 font-bold mb-2", children: "No products added yet" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 font-bold", children: savedItems.length > 0 ? 'Use the "Import Saved Items" button above or search for products to add' : "Search for products above to start calculating tariffs" })
            ] }),
            selectedProducts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-6 border-t border-gray-700", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Grand Total" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Total Base Amount" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-300", children: formatCurrency(grandTotal.baseAmount) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Effective Rate" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xl text-[#F4A024]", children: [
                    (grandTotal.effectiveRate * 100).toFixed(1),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Total Tariffs" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xl text-[#F4A024]", children: [
                    "+",
                    formatCurrency(grandTotal.tariffAmount)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Final Total" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xl text-white font-bold", children: formatCurrency(grandTotal.total) })
                ] })
              ] })
            ] })
          ] })
        ] }),
        selectedProducts.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handlePDFDownload,
            disabled: pdfLoading,
            className: "flex items-center gap-2 bg-[#F4A024] text-gray-900 px-6 py-3 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
            children: [
              /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5" }),
              pdfLoading ? "Generating PDF..." : "Export as PDF"
            ]
          }
        ) })
      ] })
    ] }) })
  ] });
}
export {
  TariffCalculatorPage as default
};
//# sourceMappingURL=TariffCalculatorPage-BuCscKvO.js.map
