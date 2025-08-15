import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { a as analytics, c as createSupplierUrl, s as supabase, p as productsIndex, b as suppliersIndex, L as LoadingSpinner, l as logSearchQuery, d as logError } from "../main.mjs";
import { P as ProductCard } from "./ProductCard-dZFnl1y5.js";
import { Building2, MapPin, Package } from "lucide-react";
import { S as StandardFilters } from "./StandardFilters-BYzhrUIK.js";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import "react-dom/client";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
function SupplierCard({ supplier }) {
  const navigate = useNavigate();
  const handleClick = () => {
    analytics.trackEvent("supplier_click", {
      props: {
        supplier_id: supplier.Supplier_ID,
        supplier_name: supplier.Supplier_Title,
        supplier_country: supplier.Supplier_Country_Name || "Unknown"
      }
    });
    navigate(createSupplierUrl(supplier.Supplier_Title, supplier.Supplier_ID));
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-200",
      onClick: handleClick,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-[#F4A024]/10 rounded-lg flex items-center justify-center group-hover:bg-[#F4A024]/20 transition-colors", children: /* @__PURE__ */ jsx(Building2, { className: "w-6 h-6 text-[#F4A024]" }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-100 mb-2 group-hover:text-[#F4A024] transition-colors", children: supplier.Supplier_Title }),
          supplier.Supplier_Description && /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed", children: supplier.Supplier_Description }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 text-sm text-gray-400", children: (supplier.Supplier_Country_Name || supplier.Supplier_Location) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: supplier.Supplier_Location || `${supplier.Supplier_City_Name ? supplier.Supplier_City_Name + ", " : ""}${supplier.Supplier_Country_Name}` })
          ] }) }),
          supplier.product_keywords && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 line-clamp-1", children: [
            "Keywords: ",
            supplier.product_keywords
          ] }) })
        ] })
      ] })
    }
  );
}
function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const mode = searchParams.get("mode") || "products";
  const categoryId = searchParams.get("category");
  const source = searchParams.get("source");
  const country = searchParams.get("country");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [suggestedSearches, setSuggestedSearches] = useState([]);
  const [currentDisplayMode, setCurrentDisplayMode] = useState(
    mode === "suppliers" ? "suppliers" : "products"
  );
  useQueryClient();
  const [filters, setFilters] = useState({
    categories: { title: "Categories", options: [], selected: [] },
    suppliers: { title: "Suppliers", options: [], selected: [] },
    sources: { title: "Sources", options: [], selected: [] },
    countries: { title: "Countries", options: [], selected: [] }
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 100;
  const { data: searchData, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ["searchResults", {
      query,
      mode: currentDisplayMode,
      categoryId,
      source,
      country
    }],
    queryFn: async () => {
      let productsData = [];
      let suppliersData = [];
      let productsCount = 0;
      let suppliersCount = 0;
      if (currentDisplayMode === "products") {
        if (source) {
          const { data, error, count } = await supabase.from("Products").select(`
              Product_ID,
              Product_Title,
              Product_Price,
              Product_Image_URL,
              Product_URL,
              Product_MOQ,
              Product_Country_Name,
              Product_Category_Name,
              Product_Supplier_Name,
              Product_Source_Name
            `, { count: "exact" }).eq("Product_Source_ID", source).order("Product_ID").limit(ITEMS_PER_PAGE);
          if (error) throw error;
          productsData = data || [];
          productsCount = count || 0;
        } else if (categoryId) {
          const { data, error, count } = await supabase.from("Products").select(`
              Product_ID,
              Product_Title,
              Product_Price,
              Product_Image_URL,
              Product_URL,
              Product_MOQ,
              Product_Country_Name,
              Product_Category_Name,
              Product_Supplier_Name,
              Product_Source_Name
            `, { count: "exact" }).eq("Product_Category_ID", categoryId).order("Product_ID").limit(ITEMS_PER_PAGE);
          if (error) throw error;
          productsData = data || [];
          productsCount = count || 0;
        } else if (country) {
          const { data, error, count } = await supabase.from("Products").select(`
              Product_ID,
              Product_Title,
              Product_Price,
              Product_Image_URL,
              Product_URL,
              Product_MOQ,
              Product_Country_Name,
              Product_Category_Name,
              Product_Supplier_Name,
              Product_Source_Name
            `, { count: "exact" }).eq("Product_Country_ID", country).order("Product_ID").limit(ITEMS_PER_PAGE);
          if (error) throw error;
          productsData = data || [];
          productsCount = count || 0;
        } else if (query) {
          const searchResults = await productsIndex.search(query, {
            limit: ITEMS_PER_PAGE,
            facets: ["supplier", "source", "country"]
          });
          productsData = searchResults.hits;
          productsCount = searchResults.estimatedTotalHits || 0;
        }
      }
      if (currentDisplayMode === "suppliers") {
        if (query) {
          const searchResults = await suppliersIndex.search(query, {
            limit: ITEMS_PER_PAGE,
            facets: ["Supplier_Country_Name", "Supplier_Source_ID"]
          });
          suppliersData = searchResults.hits;
          suppliersCount = searchResults.estimatedTotalHits || 0;
        } else if (country) {
          const { data, error, count } = await supabase.from("Supplier").select(`
              Supplier_ID,
              Supplier_Title,
              Supplier_Description,
              Supplier_Location,
              Supplier_Country_Name,
              Supplier_City_Name,
              Supplier_Source_ID
            `, { count: "exact" }).eq("Supplier_Country_ID", country).order("Supplier_Title").limit(ITEMS_PER_PAGE);
          if (error) throw error;
          suppliersData = data || [];
          suppliersCount = count || 0;
        } else if (source) {
          const { data, error, count } = await supabase.from("Supplier").select(`
              Supplier_ID,
              Supplier_Title,
              Supplier_Description,
              Supplier_Location,
              Supplier_Country_Name,
              Supplier_City_Name,
              Supplier_Source_ID
            `, { count: "exact" }).eq("Supplier_Source_ID", source).order("Supplier_Title").limit(ITEMS_PER_PAGE);
          if (error) throw error;
          suppliersData = data || [];
          suppliersCount = count || 0;
        }
      }
      return {
        productsData,
        suppliersData,
        productsCount,
        suppliersCount
      };
    },
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
  const generateSuggestions = (results2, searchQuery, searchMode) => {
    if (!results2.length || !searchQuery.trim()) {
      setSuggestedSearches([]);
      return;
    }
    const suggestions = /* @__PURE__ */ new Set();
    const queryLower = searchQuery.toLowerCase();
    if (searchMode === "products") {
      const materialTerms = /* @__PURE__ */ new Set();
      const applicationTerms = /* @__PURE__ */ new Set();
      const categoryTerms = /* @__PURE__ */ new Set();
      const materialKeywords = [
        // Metals
        "aluminum",
        "steel",
        "iron",
        "copper",
        "brass",
        "bronze",
        "titanium",
        "zinc",
        "stainless",
        "carbon",
        "alloy",
        "metal",
        "metallic",
        "chrome",
        "silver",
        "gold",
        "nickel",
        "tin",
        "lead",
        "magnesium",
        "tungsten",
        // Plastics and Polymers
        "plastic",
        "polymer",
        "pvc",
        "polyethylene",
        "polypropylene",
        "acrylic",
        "nylon",
        "abs",
        "polycarbonate",
        "vinyl",
        "resin",
        "fiberglass",
        "composite",
        // Natural Materials
        "wood",
        "bamboo",
        "cotton",
        "leather",
        "wool",
        "silk",
        "linen",
        "jute",
        "hemp",
        "rubber",
        "silicone",
        "ceramic",
        "glass",
        "stone",
        "marble",
        "granite",
        // Textiles
        "fabric",
        "textile",
        "polyester",
        "denim",
        "canvas",
        "felt",
        "fleece",
        "velvet",
        "satin",
        "suede",
        "microfiber",
        "mesh",
        // Paper Products
        "paper",
        "cardboard",
        "paperboard",
        "corrugated",
        // Construction Materials
        "concrete",
        "cement",
        "brick",
        "tile",
        "grout",
        "drywall",
        "plywood",
        "lumber",
        "insulation",
        "asphalt",
        "gypsum"
      ];
      const applicationKeywords = [
        // Industries
        "industrial",
        "automotive",
        "construction",
        "medical",
        "electronic",
        "electrical",
        "agricultural",
        "aerospace",
        "marine",
        "military",
        "commercial",
        "residential",
        "manufacturing",
        "mining",
        "oil",
        "gas",
        "chemical",
        "pharmaceutical",
        // Locations
        "kitchen",
        "bathroom",
        "bedroom",
        "living",
        "office",
        "garage",
        "garden",
        "outdoor",
        "indoor",
        "home",
        "school",
        "hospital",
        "restaurant",
        "hotel",
        "retail",
        // Functions
        "packaging",
        "storage",
        "transport",
        "safety",
        "security",
        "cleaning",
        "heating",
        "cooling",
        "lighting",
        "plumbing",
        "ventilation",
        "insulation",
        "decoration",
        "protection",
        "measurement",
        "monitoring",
        "control",
        "automation",
        "communication",
        // Product Types
        "tool",
        "machine",
        "equipment",
        "device",
        "system",
        "component",
        "accessory",
        "furniture",
        "appliance",
        "instrument",
        "container",
        "vehicle",
        "clothing",
        "footwear",
        "hardware",
        "software",
        "supply",
        "part",
        "assembly"
      ];
      results2.forEach((product) => {
        const productName = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        materialKeywords.forEach((material) => {
          if (productName.includes(material) && !queryLower.includes(material)) {
            materialTerms.add(material);
          }
        });
        applicationKeywords.forEach((application) => {
          if (productName.includes(application) && !queryLower.includes(application)) {
            applicationTerms.add(application);
          }
        });
        if (category !== "unknown" && !category.includes(queryLower) && !queryLower.includes(category) && category.length > 3) {
          categoryTerms.add(product.category);
        }
        const words = productName.split(/[\s\-_,\.()]+/).filter(
          (word) => word.length > 3 && word.length < 15 && // Avoid very long words
          !word.includes(queryLower) && !queryLower.includes(word) && // Enhanced stop words for better filtering
          ![
            "with",
            "from",
            "made",
            "high",
            "quality",
            "premium",
            "best",
            "new",
            "old",
            "large",
            "small",
            "mini",
            "micro",
            "super",
            "ultra",
            "professional",
            "standard",
            "heavy",
            "light",
            "strong",
            "durable",
            "portable",
            "electric",
            "manual",
            "automatic",
            "digital",
            "analog",
            "this",
            "that",
            "these",
            "those",
            "they",
            "them",
            "their",
            "there",
            "here",
            "where",
            "when",
            "what",
            "which",
            "who",
            "whom",
            "whose",
            "why",
            "how",
            "have",
            "has",
            "had",
            "does",
            "did",
            "doing",
            "done",
            "been",
            "being",
            "would",
            "could",
            "should",
            "will",
            "shall",
            "may",
            "might",
            "must",
            "can"
          ].includes(word) && // Avoid numbers and codes
          !/^\d+$/.test(word) && !/^[a-z]\d+/.test(word)
        );
        words.forEach((word) => {
          const wordCount = results2.filter(
            (p) => p.name.toLowerCase().includes(word)
          ).length;
          if (wordCount >= 2) {
            materialTerms.add(word);
          }
        });
      });
      const sortedMaterials = Array.from(materialTerms).sort((a, b) => {
        const countA = results2.filter((p) => p.name.toLowerCase().includes(a)).length;
        const countB = results2.filter((p) => p.name.toLowerCase().includes(b)).length;
        return countB - countA;
      });
      const sortedApplications = Array.from(applicationTerms).sort((a, b) => {
        const countA = results2.filter((p) => p.name.toLowerCase().includes(a)).length;
        const countB = results2.filter((p) => p.name.toLowerCase().includes(b)).length;
        return countB - countA;
      });
      const sortedCategories = Array.from(categoryTerms).sort((a, b) => {
        const countA = results2.filter((p) => p.category === a).length;
        const countB = results2.filter((p) => p.category === b).length;
        return countB - countA;
      });
      [...sortedMaterials.slice(0, 2), ...sortedApplications.slice(0, 1), ...sortedCategories.slice(0, 1)].slice(0, 3).forEach((term) => {
        const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);
        suggestions.add(displayTerm);
      });
    } else {
      const industryTerms = /* @__PURE__ */ new Set();
      const capabilityTerms = /* @__PURE__ */ new Set();
      const locationTerms = /* @__PURE__ */ new Set();
      const industryKeywords = [
        "manufacturing",
        "production",
        "export",
        "import",
        "wholesale",
        "retail",
        "distribution",
        "logistics",
        "supply",
        "trading",
        "sourcing",
        "procurement",
        "fabrication",
        "assembly",
        "processing",
        "packaging",
        "shipping",
        "consulting",
        "engineering",
        "design",
        "development",
        "research",
        "testing",
        "certification",
        "quality",
        "inspection",
        "maintenance",
        "repair",
        "installation",
        "service",
        "textile",
        "apparel",
        "furniture",
        "electronics",
        "automotive",
        "construction",
        "agricultural",
        "chemical",
        "pharmaceutical",
        "medical",
        "food",
        "beverage",
        "cosmetic",
        "plastic",
        "metal",
        "wood",
        "paper",
        "glass",
        "ceramic",
        "rubber"
      ];
      const locationKeywords = [
        "mexico",
        "colombia",
        "brazil",
        "argentina",
        "chile",
        "peru",
        "ecuador",
        "venezuela",
        "bolivia",
        "paraguay",
        "uruguay",
        "panama",
        "costa rica",
        "guatemala",
        "honduras",
        "el salvador",
        "nicaragua",
        "belize",
        "dominican",
        "puerto rico",
        "cuba",
        "jamaica",
        "haiti",
        "bahamas",
        "guyana",
        "suriname",
        "french guiana",
        "guadalajara",
        "monterrey",
        "tijuana",
        "cancun",
        "merida",
        "puebla",
        "queretaro",
        "leon",
        "mexico city",
        "bogota",
        "medellin",
        "cali",
        "barranquilla",
        "cartagena",
        "sao paulo",
        "rio de janeiro",
        "brasilia",
        "salvador",
        "fortaleza",
        "belo horizonte",
        "manaus",
        "curitiba"
      ];
      results2.forEach((supplier) => {
        if (supplier.product_keywords) {
          const keywords = supplier.product_keywords.toLowerCase().split(/[\s,]+/).filter(
            (word) => word.length > 3 && !word.includes(queryLower) && !queryLower.includes(word) && !["with", "from", "made", "high", "quality", "and", "the", "for", "our", "we", "are"].includes(word)
          );
          keywords.forEach((keyword) => {
            if (industryKeywords.includes(keyword)) {
              industryTerms.add(keyword);
            } else {
              capabilityTerms.add(keyword);
            }
          });
        }
        if (supplier.Supplier_Country_Name) {
          const location = supplier.Supplier_Country_Name.toLowerCase();
          locationKeywords.forEach((loc) => {
            if (location.includes(loc) && !queryLower.includes(loc)) {
              locationTerms.add(loc);
            }
          });
        }
        if (supplier.Supplier_City_Name) {
          const city = supplier.Supplier_City_Name.toLowerCase();
          locationKeywords.forEach((loc) => {
            if (city.includes(loc) && !queryLower.includes(loc)) {
              locationTerms.add(loc);
            }
          });
        }
        if (supplier.Supplier_Description) {
          const description = supplier.Supplier_Description.toLowerCase();
          industryKeywords.forEach((industry) => {
            if (description.includes(industry) && !queryLower.includes(industry)) {
              industryTerms.add(industry);
            }
          });
          const words = description.split(/[\s\-_,\.]+/).filter(
            (word) => word.length > 4 && !word.includes(queryLower) && !queryLower.includes(word) && ![
              "with",
              "from",
              "made",
              "high",
              "quality",
              "and",
              "the",
              "for",
              "our",
              "we",
              "are",
              "that",
              "this",
              "these",
              "those",
              "they",
              "them",
              "their",
              "there",
              "here",
              "where",
              "when",
              "what",
              "which",
              "who",
              "whom",
              "whose",
              "why",
              "how",
              "have",
              "has",
              "had"
            ].includes(word)
          );
          words.forEach((word) => {
            const wordCount = results2.filter(
              (s) => {
                var _a;
                return (_a = s.Supplier_Description) == null ? void 0 : _a.toLowerCase().includes(word);
              }
            ).length;
            if (wordCount >= 2) {
              capabilityTerms.add(word);
            }
          });
        }
      });
      const relevantIndustryTerms = Array.from(industryTerms).filter((term) => {
        const termCount = results2.filter(
          (s) => {
            var _a, _b;
            return ((_a = s.product_keywords) == null ? void 0 : _a.toLowerCase().includes(term)) || ((_b = s.Supplier_Description) == null ? void 0 : _b.toLowerCase().includes(term));
          }
        ).length;
        return termCount >= 2;
      }).sort((a, b) => {
        const countA = results2.filter(
          (s) => {
            var _a, _b;
            return ((_a = s.product_keywords) == null ? void 0 : _a.toLowerCase().includes(a)) || ((_b = s.Supplier_Description) == null ? void 0 : _b.toLowerCase().includes(a));
          }
        ).length;
        const countB = results2.filter(
          (s) => {
            var _a, _b;
            return ((_a = s.product_keywords) == null ? void 0 : _a.toLowerCase().includes(b)) || ((_b = s.Supplier_Description) == null ? void 0 : _b.toLowerCase().includes(b));
          }
        ).length;
        return countB - countA;
      });
      const relevantLocationTerms = Array.from(locationTerms).sort((a, b) => {
        const countA = results2.filter(
          (s) => {
            var _a, _b, _c;
            return ((_a = s.Supplier_Country_Name) == null ? void 0 : _a.toLowerCase().includes(a)) || ((_b = s.Supplier_City_Name) == null ? void 0 : _b.toLowerCase().includes(a)) || ((_c = s.Supplier_Location) == null ? void 0 : _c.toLowerCase().includes(a));
          }
        ).length;
        const countB = results2.filter(
          (s) => {
            var _a, _b, _c;
            return ((_a = s.Supplier_Country_Name) == null ? void 0 : _a.toLowerCase().includes(b)) || ((_b = s.Supplier_City_Name) == null ? void 0 : _b.toLowerCase().includes(b)) || ((_c = s.Supplier_Location) == null ? void 0 : _c.toLowerCase().includes(b));
          }
        ).length;
        return countB - countA;
      });
      const relevantCapabilityTerms = Array.from(capabilityTerms).sort((a, b) => {
        const countA = results2.filter(
          (s) => {
            var _a, _b;
            return ((_a = s.Supplier_Description) == null ? void 0 : _a.toLowerCase().includes(a)) || ((_b = s.product_keywords) == null ? void 0 : _b.toLowerCase().includes(a));
          }
        ).length;
        const countB = results2.filter(
          (s) => {
            var _a, _b;
            return ((_a = s.Supplier_Description) == null ? void 0 : _a.toLowerCase().includes(b)) || ((_b = s.product_keywords) == null ? void 0 : _b.toLowerCase().includes(b));
          }
        ).length;
        return countB - countA;
      });
      [...relevantIndustryTerms.slice(0, 1), ...relevantLocationTerms.slice(0, 1), ...relevantCapabilityTerms.slice(0, 1)].slice(0, 3).forEach((term) => {
        const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);
        suggestions.add(displayTerm);
      });
    }
    setSuggestedSearches(Array.from(suggestions).slice(0, 3));
  };
  const handleSuggestionClick = (suggestion) => {
    logSearchQuery(suggestion, currentDisplayMode);
    const searchParams2 = new URLSearchParams({
      q: suggestion,
      mode: currentDisplayMode
    });
    navigate(`/search?${searchParams2.toString()}`);
  };
  const handleDisplayModeToggle = (mode2) => {
    setCurrentDisplayMode(mode2);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("mode", mode2);
    setSearchParams(newParams, { replace: true });
    setCurrentPage(0);
    updateDisplayedResults(mode2);
    analytics.trackEvent("search_mode_toggle", {
      props: {
        mode: mode2,
        from: currentDisplayMode,
        query: query || "",
        category: categoryId || "",
        source: source || "",
        country: country || ""
      }
    });
  };
  useEffect(() => {
    async function fetchNames() {
      if (categoryId) {
        const { data, error } = await supabase.from("Categories").select("Category_Name").eq("Category_ID", categoryId).single();
        if (error) {
          console.error("Error fetching category:", error);
          return;
        }
        if (data) {
          setCategoryName(data.Category_Name);
        }
      }
      if (source) {
        const { data, error } = await supabase.from("Sources").select("Source_Title").eq("Source_ID", source).single();
        if (error) {
          console.error("Error fetching source:", error);
          return;
        }
        if (data) {
          setSourceName(data.Source_Title);
        }
      }
      if (country) {
        const { data, error } = await supabase.from("Countries").select("Country_Title").eq("Country_ID", country).single();
        if (error) {
          console.error("Error fetching country:", error);
          return;
        }
        if (data) {
          setCountryName(data.Country_Title);
        }
      }
    }
    fetchNames();
  }, [categoryId, source, country]);
  const loadAllResults = async () => {
    setLoading(true);
    setResults([]);
    setAllProducts([]);
    setAllSuppliers([]);
    setCurrentPage(0);
    setHasMore(true);
    try {
      console.log(`Loading all results for search... (mode: ${currentDisplayMode})`);
      let productsData = [];
      let suppliersData = [];
      let productsCount = 0;
      let suppliersCount = 0;
      if (source) {
        console.log("Loading products for source:", source);
        const { data, error, count } = await supabase.from("Products").select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name
          `, { count: "exact" }).eq("Product_Source_ID", source).order("Product_ID");
        if (error) throw error;
        productsData = data || [];
        productsCount = count || 0;
      } else if (categoryId) {
        console.log("Loading products for category:", categoryId);
        const { data, error, count } = await supabase.from("Products").select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name
          `, { count: "exact" }).eq("Product_Category_ID", categoryId).order("Product_ID");
        if (error) throw error;
        productsData = data || [];
        productsCount = count || 0;
      } else if (country) {
        console.log("Loading products for country:", country);
        const { data, error, count } = await supabase.from("Products").select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name
          `, { count: "exact" }).eq("Product_Country_ID", country).order("Product_ID");
        if (error) throw error;
        productsData = data || [];
        productsCount = count || 0;
      } else if (query) {
        console.log("Loading products for text search:", query);
        const searchResults = await productsIndex.search(query, {
          limit: 1e4,
          // Get all results
          facets: ["supplier", "source", "country"]
        });
        productsData = searchResults.hits;
        productsCount = searchResults.estimatedTotalHits || 0;
      }
      if (query) {
        console.log("Loading suppliers for text search:", query);
        const searchResults = await suppliersIndex.search(query, {
          limit: 1e4,
          // Get all results
          facets: ["Supplier_Country_Name", "Supplier_Source_ID"]
        });
        suppliersData = searchResults.hits;
        suppliersCount = searchResults.estimatedTotalHits || 0;
      } else if (country) {
        console.log("Loading suppliers for country:", country);
        const { data, error, count } = await supabase.from("Supplier").select(`
            Supplier_ID,
            Supplier_Title,
            Supplier_Description,
            Supplier_Location,
            Supplier_Country_Name,
            Supplier_City_Name,
            Supplier_Source_ID
          `, { count: "exact" }).eq("Supplier_Country_ID", country).order("Supplier_Title");
        if (error) throw error;
        suppliersData = data || [];
        suppliersCount = count || 0;
      } else if (source) {
        console.log("Loading suppliers for source:", source);
        const { data, error, count } = await supabase.from("Supplier").select(`
            Supplier_ID,
            Supplier_Title,
            Supplier_Description,
            Supplier_Location,
            Supplier_Country_Name,
            Supplier_City_Name,
            Supplier_Source_ID
          `, { count: "exact" }).eq("Supplier_Source_ID", source).order("Supplier_Title");
        if (error) throw error;
        suppliersData = data || [];
        suppliersCount = count || 0;
      }
      const sourceIds = [...new Set(
        suppliersData.map((supplier) => supplier.Supplier_Source_ID).filter(Boolean)
      )];
      let sourceTitles = {};
      if (sourceIds.length > 0) {
        try {
          const { data: sourcesData, error: sourcesError } = await supabase.from("Sources").select("Source_ID, Source_Title").in("Source_ID", sourceIds);
          if (sourcesError) {
            console.error("Error fetching sources:", sourcesError);
          } else if (sourcesData) {
            sourceTitles = sourcesData.reduce((acc, source2) => {
              acc[source2.Source_ID] = source2.Source_Title;
              return acc;
            }, {});
          }
        } catch (err) {
          console.error("Error in source fetch:", err);
        }
      }
      const formattedProducts = productsData.map((product) => ({
        id: product.Product_ID || product.id,
        name: product.Product_Title || product.title,
        Product_Price: product.Product_Price || product.price || "$0",
        image: product.Product_Image_URL || product.image || "",
        country: product.Product_Country_Name || product.country || "Unknown",
        category: product.Product_Category_Name || product.category || "Unknown",
        supplier: product.Product_Supplier_Name || product.supplier || "Unknown",
        Product_MOQ: product.Product_MOQ || product.moq || "0",
        sourceUrl: product.Product_URL || product.url || "",
        marketplace: product.Product_Source_Name || product.source || "Unknown"
      }));
      const formattedSuppliers = suppliersData.map((supplier) => ({
        Supplier_ID: supplier.Supplier_ID,
        Supplier_Title: supplier.Supplier_Title,
        Supplier_Description: supplier.Supplier_Description || "",
        Supplier_Country_Name: supplier.Supplier_Country_Name || "Unknown",
        Supplier_City_Name: supplier.Supplier_City_Name || "",
        Supplier_Location: supplier.Supplier_Location || "",
        product_count: supplier.product_count || 0,
        product_keywords: supplier.product_keywords || "",
        sourceTitle: sourceTitles[supplier.Supplier_Source_ID] || "Unknown Source"
      }));
      setAllProducts(formattedProducts);
      setAllSuppliers(formattedSuppliers);
      setTotalCount(currentDisplayMode === "products" ? productsCount : suppliersCount);
      if (currentDisplayMode === "products") {
        generateSuggestions(formattedProducts, query, "products");
      } else {
        generateSuggestions(formattedSuppliers, query, "suppliers");
      }
      updateDisplayedResults(currentDisplayMode);
      if (query) {
        logSearchQuery(query, currentDisplayMode);
      }
    } catch (err) {
      console.error("Search error:", err);
      logError(err instanceof Error ? err : new Error("Search failed"), {
        type: "search_error",
        query,
        category: categoryId,
        source,
        country,
        mode: currentDisplayMode
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAllResults();
  }, [query, categoryId, source, country]);
  useEffect(() => {
    if (currentDisplayMode === "suppliers") {
      const countryCounts = /* @__PURE__ */ new Map();
      const sourceCounts = /* @__PURE__ */ new Map();
      allSuppliers.forEach((supplier) => {
        if (supplier.Supplier_Country_Name) {
          countryCounts.set(supplier.Supplier_Country_Name, (countryCounts.get(supplier.Supplier_Country_Name) || 0) + 1);
        }
        if (supplier.sourceTitle) {
          sourceCounts.set(supplier.sourceTitle, (sourceCounts.get(supplier.sourceTitle) || 0) + 1);
        }
      });
      setFilters((prev) => ({
        ...prev,
        categories: { ...prev.categories, options: [] },
        suppliers: { ...prev.suppliers, options: [] },
        countries: {
          ...prev.countries,
          options: Array.from(countryCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count
          }))
        },
        sources: {
          ...prev.sources,
          options: Array.from(sourceCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count
          }))
        }
      }));
    } else {
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
          options: Array.from(categoryCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count
          }))
        },
        suppliers: {
          ...prev.suppliers,
          options: Array.from(supplierCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count
          }))
        },
        sources: {
          ...prev.sources,
          options: Array.from(sourceCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count
          }))
        },
        countries: {
          ...prev.countries,
          options: Array.from(countryCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count
          }))
        }
      }));
    }
  }, [allProducts, allSuppliers, currentDisplayMode]);
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1e3 && hasMore && !loadingMore && !loading) {
        loadMoreResults();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loading, currentPage]);
  const loadMoreResults = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const filteredResults2 = getFilteredAndSortedResults(currentDisplayMode);
    const newResults = filteredResults2.slice(startIndex, endIndex);
    setResults((prev) => [...prev, ...newResults]);
    setCurrentPage(nextPage);
    setHasMore(endIndex < filteredResults2.length);
    setLoadingMore(false);
  };
  const handleFilterChange = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        selected: prev[group].selected.includes(value) ? prev[group].selected.filter((v) => v !== value) : [...prev[group].selected, value]
      }
    }));
    setCurrentPage(0);
    updateDisplayedResults(currentDisplayMode);
  };
  const getFilteredAndSortedResults = (displayMode) => {
    if (displayMode === "suppliers") {
      let filtered = allSuppliers.filter((supplier) => {
        const matchesCountry = filters.countries.selected.length === 0 || filters.countries.selected.includes(supplier.Supplier_Country_Name || "Unknown");
        const matchesSource = filters.sources.selected.length === 0 || filters.sources.selected.includes(supplier.sourceTitle || "Unknown Source");
        return matchesCountry && matchesSource;
      });
      if (sortBy) {
        filtered = [...filtered].sort((a, b) => {
          let compareA, compareB;
          switch (sortBy) {
            case "country":
              compareA = (a.Supplier_Country_Name || "Unknown").toLowerCase();
              compareB = (b.Supplier_Country_Name || "Unknown").toLowerCase();
              break;
            case "marketplace":
              compareA = (a.sourceTitle || "Unknown").toLowerCase();
              compareB = (b.sourceTitle || "Unknown").toLowerCase();
              break;
            case "products":
              compareA = a.product_count || 0;
              compareB = b.product_count || 0;
              break;
            default:
              compareA = a.Supplier_Title.toLowerCase();
              compareB = b.Supplier_Title.toLowerCase();
              break;
          }
          if (sortOrder === "asc") {
            return compareA > compareB ? 1 : -1;
          } else {
            return compareA < compareB ? 1 : -1;
          }
        });
      }
      return filtered;
    } else {
      let filtered = allProducts.filter((product) => {
        const matchesCategory = filters.categories.selected.length === 0 || filters.categories.selected.includes(product.category);
        const matchesSupplier = filters.suppliers.selected.length === 0 || filters.suppliers.selected.includes(product.supplier);
        const matchesSource = filters.sources.selected.length === 0 || filters.sources.selected.includes(product.marketplace);
        const matchesCountry = filters.countries.selected.length === 0 || filters.countries.selected.includes(product.country);
        return matchesCategory && matchesSupplier && matchesSource && matchesCountry;
      });
      if (sortBy) {
        filtered = [...filtered].sort((a, b) => {
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
      }
      return filtered;
    }
  };
  const updateDisplayedResults = (displayMode) => {
    const filteredResults2 = getFilteredAndSortedResults(displayMode);
    setResults(filteredResults2.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredResults2.length > ITEMS_PER_PAGE);
    setCurrentPage(0);
    setTotalCount(filteredResults2.length);
  };
  useEffect(() => {
    updateDisplayedResults(currentDisplayMode);
  }, [filters, sortBy, sortOrder]);
  useEffect(() => {
    updateDisplayedResults(currentDisplayMode);
  }, [currentDisplayMode]);
  const getPageTitle = () => {
    if (currentDisplayMode === "suppliers") {
      if (country && countryName) return `Suppliers from ${countryName}`;
      if (source && sourceName) return `Suppliers from ${sourceName}`;
      return query ? `Supplier Results for "${query}"` : "All Suppliers";
    } else {
      if (categoryId && categoryName) return `Products in ${categoryName}`;
      if (source && sourceName) return `${totalCount.toLocaleString()} Products from ${sourceName}`;
      if (country && countryName) return `Products from ${countryName}`;
      return query ? `Search Results for "${query}"` : "All Products";
    }
  };
  const filteredResults = getFilteredAndSortedResults(currentDisplayMode);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: getPageTitle(),
        description: `Browse ${filteredResults.length} ${currentDisplayMode === "suppliers" ? "suppliers" : "products"} matching your search. Filter by ${currentDisplayMode === "suppliers" ? "country and source" : "supplier, source, and country"}.`,
        keywords: `search results, ${query}, ${currentDisplayMode === "suppliers" ? "supplier search, filter suppliers" : "product search, filter products"}`
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: getPageTitle() }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-300", children: [
            loading ? "Loading..." : `${filteredResults.length} of ${totalCount.toLocaleString()} results`,
            hasMore && !loading && ` (showing ${results.length})`
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center flex-wrap gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "View by:" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handleDisplayModeToggle("products"),
                    className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentDisplayMode === "products" ? "bg-[#F4A024] text-gray-900" : "bg-white/10 text-gray-300 hover:bg-white/20"}`,
                    children: [
                      /* @__PURE__ */ jsx(Package, { className: "w-4 h-4" }),
                      "Products"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handleDisplayModeToggle("suppliers"),
                    className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentDisplayMode === "suppliers" ? "bg-[#F4A024] text-gray-900" : "bg-white/10 text-gray-300 hover:bg-white/20"}`,
                    children: [
                      /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }),
                      "Suppliers"
                    ]
                  }
                )
              ] })
            ] }),
            suggestedSearches.length > 0 && query && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/30 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-gray-300 mb-3", children: [
                'Searches related to "',
                query,
                '"'
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: suggestedSearches.map((suggestion, index) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleSuggestionClick(suggestion),
                  className: "px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-[#F4A024] text-sm rounded-full transition-colors border border-gray-600/50 hover:border-[#F4A024]/50",
                  children: suggestion
                },
                index
              )) })
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
              setActiveDropdown,
              showCategories: currentDisplayMode === "products",
              showSuppliers: currentDisplayMode === "products",
              showSources: true,
              showCountries: true
            }
          )
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }) : results.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          currentDisplayMode === "suppliers" ? (
            // Supplier results grid
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: results.map((supplier) => /* @__PURE__ */ jsx(
              SupplierCard,
              {
                supplier
              },
              supplier.Supplier_ID
            )) })
          ) : (
            // Product results grid
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8", children: results.map((product) => /* @__PURE__ */ jsx(ProductCard, { product }, product.id)) })
          ),
          loadingMore && /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
            /* @__PURE__ */ jsx(LoadingSpinner, {}),
            /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-2", children: "Loading more results..." })
          ] }),
          !hasMore && results.length > 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "You've reached the end of the results" }) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-300 font-bold", children: [
            "No ",
            currentDisplayMode === "suppliers" ? "suppliers" : "products",
            " found",
            categoryId ? " in this category" : source ? " from this source" : country ? " from this country" : query ? ` for "${query}"` : ""
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-400 font-bold mt-2", children: [
            "Try ",
            categoryId ? "another category" : source ? "another source" : country ? "another country" : "searching with different keywords",
            " or browse our categories"
          ] }),
          currentDisplayMode === "products" && allSuppliers.length > 0 && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleDisplayModeToggle("suppliers"),
              className: "mt-4 text-[#F4A024] hover:text-[#F4A024]/80 font-medium",
              children: [
                "Switch to Suppliers view (",
                allSuppliers.length,
                " results available)"
              ]
            }
          ),
          currentDisplayMode === "suppliers" && allProducts.length > 0 && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleDisplayModeToggle("products"),
              className: "mt-4 text-[#F4A024] hover:text-[#F4A024]/80 font-medium",
              children: [
                "Switch to Products view (",
                allProducts.length,
                " results available)"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SearchResultsPage as default
};
//# sourceMappingURL=SearchResultsPage-B6cD8jWN.js.map
