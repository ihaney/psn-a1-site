```diff
--- a/src/pages/SearchResultsPage.tsx
+++ b/src/pages/SearchResultsPage.tsx
@@ -49,7 +49,7 @@
   const [results, setResults] = useState<SearchResult[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
-  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>({});
+  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>(() => {
+    const initialFilters: { [key: string]: string[] } = {};
+    const categoryParam = queryParams.get('category');
+    const countryParam = queryParams.get('country');
+    const sourceParam = queryParams.get('source');
+
+    if (categoryParam) {
+      initialFilters['Product_Category_Name'] = [categoryParam];
+    }
+    if (countryParam) {
+      if (initialMode === 'products') {
+        initialFilters['Product_Country_Name'] = [countryParam];
+      } else {
+        initialFilters['Supplier_Country_Name'] = [countryParam];
+      }
+    }
+    if (sourceParam) {
+      if (initialMode === 'products') {
+        initialFilters['Product_Source_Name'] = [sourceParam];
+      } else {
+        initialFilters['Supplier_Source_ID'] = [sourceParam];
+      }
+    }
+    return initialFilters;
+  });
   const [sortBy, setSortBy] = useState('relevance');
-  const [facetDistribution, setFacetDistribution] = useState<any>(null);
+  const [facetDistribution, setFacetDistribution] = useState<any>({});
   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
-  const [totalResults, setTotalResults] = useState(0);
 
   const debouncedQuery = useDebouncedValue(searchQuery, 300);
 
@@ -68,26 +68,6 @@
     staleTime: Infinity,
   });
 
-  // Initialize filters from URL params
-  useEffect(() => {
-    const initialFilters: { [key: string]: string[] } = {};
-    
-    if (initialCategory) {
-      initialFilters['Product_Category_Name'] = [initialCategory];
-    }
-    if (initialCountry) {
-      if (searchMode === 'products') {
-        initialFilters['Product_Country_Name'] = [initialCountry];
-      } else {
-        initialFilters['Supplier_Country_Name'] = [initialCountry];
-      }
-    }
-    if (initialSource) {
-      if (searchMode === 'products') {
-        initialFilters['Product_Source_Name'] = [initialSource];
-      } else {
-        initialFilters['Supplier_Source_ID'] = [initialSource];
-      }
-    }
-    
-    setActiveFilters(initialFilters);
-  }, [initialCategory, initialCountry, initialSource, searchMode]);
-
   // Update URL params when search state changes
   useEffect(() => {
     const params = new URLSearchParams();
@@ -100,7 +80,6 @@
     async function performSearch() {
       if (!debouncedQuery.trim()) {
         setResults([]);
-        setFacetDistribution(null);
-        setTotalResults(0);
+        setFacetDistribution({});
         return;
       }
 
@@ -113,7 +92,7 @@
         // Build Meilisearch filters from activeFilters state
         for (const filterKey in activeFilters) {
           if (activeFilters[filterKey].length > 0) {
-            const filterValues = activeFilters[filterKey].map(value => `"${value}"`).join(' OR ');
+            const filterValues = activeFilters[filterKey].map(value => `\`${filterKey}\` = "${value}"`).join(' OR ');
             meilisearchFilters.push(`(${filterValues})`);
           }
         }
@@ -121,15 +100,7 @@
         // Build Meilisearch sort
         if (sortBy !== 'relevance') {
           if (sortBy === 'price:asc') {
-            meilisearchSort.push('price:asc');
-          } else if (sortBy === 'price:desc') {
-            meilisearchSort.push('price:desc');
-          } else if (sortBy === 'product_count:desc') {
-            meilisearchSort.push('product_count:desc');
-          } else if (sortBy === 'product_count:asc') {
-            meilisearchSort.push('product_count:asc');
-          }
-        }
+            meilisearchSort.push('price:asc'); // This is already handled by the sortBy state directly
+          } else if (sortBy === 'price:desc') { // This is already handled by the sortBy state directly
+            meilisearchSort.push('price:desc'); // This is already handled by the sortBy state directly
+          } else if (sortBy === 'product_count:desc') { // This is already handled by the sortBy state directly
+            meilisearchSort.push('product_count:desc'); // This is already handled by the sortBy state directly
+          } else if (sortBy === 'product_count:asc') { // This is already handled by the sortBy state directly
+            meilisearchSort.push('product_count:asc'); // This is already handled by the sortBy state directly
+          }
+          meilisearchSort.push(sortBy);
+        }
 
         if (searchMode === 'products') {
           facets = ['Product_Category_Name', 'Product_Country_Name', 'Product_Source_Name'];
@@ -155,7 +126,6 @@
             url: `/product/${hit.id}`
           }));
           setFacetDistribution(productsResults.facetDistribution);
-          setTotalResults(productsResults.estimatedTotalHits || productsResults.hits.length);
 
         } else { // searchMode === 'suppliers'
           facets = ['Supplier_Country_Name', 'Supplier_Source_ID'];
@@ -179,13 +149,12 @@
             url: createSupplierUrl(hit.Supplier_Title as string, hit.Supplier_ID as string)
           }));
           setFacetDistribution(suppliersResults.facetDistribution);
-          setTotalResults(suppliersResults.estimatedTotalHits || suppliersResults.hits.length);
         }
 
         setResults(searchResults);
         logSearchQuery(debouncedQuery.trim(), searchMode);
 
       } catch (err) {
         console.error('Search error:', err);
         setError('Failed to perform search. Please try again.');
-        setResults([]);
-        setFacetDistribution(null);
-        setTotalResults(0);
+        setResults([]); // Clear results on error
+        setFacetDistribution({}); // Reset facet distribution on error
       } finally {
         setLoading(false);
       }
@@ -209,66 +178,70 @@
   }, []);
 
   const filterGroups: FilterGroup[] = useMemo(() => {
-    if (!facetDistribution) return [];
-
     const groups: FilterGroup[] = [];
 
     if (searchMode === 'products') {
       // Categories
-      if (facetDistribution['Product_Category_Name']) {
-        groups.push({
-          title: 'Category',
-          key: 'Product_Category_Name',
-          options: Object.entries(facetDistribution['Product_Category_Name']).map(([name, count]) => ({
-            id: name,
-            name: name,
-            count: count as number,
-          })).sort((a, b) => b.count - a.count),
-          selected: activeFilters['Product_Category_Name'] || [],
-        });
-      }
+      groups.push({
+        title: 'Category Type',
+        key: 'Product_Category_Name',
+        options: Object.entries(facetDistribution['Product_Category_Name'] || {}).map(([name, count]) => ({
+          id: name,
+          name: name,
+          count: count as number,
+        })).sort((a, b) => b.count - a.count),
+        selected: activeFilters['Product_Category_Name'] || [],
+      });
+
       // Supplier Country
-      if (facetDistribution['Product_Country_Name']) {
-        groups.push({
-          title: 'Supplier Country',
-          key: 'Product_Country_Name',
-          options: Object.entries(facetDistribution['Product_Country_Name']).map(([name, count]) => ({
-            id: name,
-            name: name,
-            count: count as number,
-          })).sort((a, b) => b.count - a.count),
-          selected: activeFilters['Product_Country_Name'] || [],
-        });
-      }
+      groups.push({
+        title: 'Supplier Country',
+        key: 'Product_Country_Name',
+        options: Object.entries(facetDistribution['Product_Country_Name'] || {}).map(([name, count]) => ({
+          id: name,
+          name: name,
+          count: count as number,
+        })).sort((a, b) => b.count - a.count),
+        selected: activeFilters['Product_Country_Name'] || [],
+      });
+
       // Sources
-      if (facetDistribution['Product_Source_Name']) {
-        groups.push({
-          title: 'Sources',
-          key: 'Product_Source_Name',
-          options: Object.entries(facetDistribution['Product_Source_Name']).map(([name, count]) => ({
-            id: name,
-            name: name,
-            count: count as number,
-          })).sort((a, b) => b.count - a.count),
-          selected: activeFilters['Product_Source_Name'] || [],
-        });
-      }
+      groups.push({
+        title: 'Sources',
+        key: 'Product_Source_Name',
+        options: Object.entries(facetDistribution['Product_Source_Name'] || {}).map(([name, count]) => ({
+          id: name,
+          name: name,
+          count: count as number,
+        })).sort((a, b) => b.count - a.count),
+        selected: activeFilters['Product_Source_Name'] || [],
+      });
     } else { // searchMode === 'suppliers'
       // Supplier Country
-      if (facetDistribution['Supplier_Country_Name']) {
-        groups.push({
-          title: 'Supplier Country',
-          key: 'Supplier_Country_Name',
-          options: Object.entries(facetDistribution['Supplier_Country_Name']).map(([name, count]) => ({
-            id: name,
-            name: name,
-            count: count as number,
-          })).sort((a, b) => b.count - a.count),
-          selected: activeFilters['Supplier_Country_Name'] || [],
-        });
-      }
+      groups.push({
+        title: 'Supplier Country',
+        key: 'Supplier_Country_Name',
+        options: Object.entries(facetDistribution['Supplier_Country_Name'] || {}).map(([name, count]) => ({
+          id: name,
+          name: name,
+          count: count as number,
+        })).sort((a, b) => b.count - a.count),
+        selected: activeFilters['Supplier_Country_Name'] || [],
+      });
+
       // Sources (using Product_Source_Name for consistency)
-      if (facetDistribution['Product_Source_Name']) {
+      // Always rely on Product_Source_Name for sources, even in supplier mode
+      // Meilisearch facet for suppliers is Supplier_Source_ID, so we need to map it
+      if (facetDistribution['Supplier_Source_ID'] && allSourcesMap) {
         groups.push({
           title: 'Sources',
-          key: 'Product_Source_Name',
-          options: Object.entries(facetDistribution['Product_Source_Name']).map(([name, count]) => ({
-            id: name,
-            name: name,
+          key: 'Supplier_Source_ID', // Use the actual Meilisearch facet key
+          options: Object.entries(facetDistribution['Supplier_Source_ID'] || {}).map(([id, count]) => ({
+            id: id,
+            name: allSourcesMap[id] || id, // Map ID to Title, or use ID if not found
             count: count as number,
           })).sort((a, b) => b.count - a.count),
-          selected: activeFilters['Product_Source_Name'] || [],
+          selected: activeFilters['Supplier_Source_ID'] || [],
         });
       }
     }
@@ -284,6 +257,8 @@
         { value: 'relevance', label: 'Relevance' },
         { value: 'price:asc', label: 'Price: Low to High' },
         { value: 'price:desc', label: 'Price: High to Low' },
+        // Removed Name: A-Z and Name: Z-A as per request
+        // Removed Product Count: High to Low and Product Count: Low to High as per request
       ];
     } else { // searchMode === 'suppliers'
       return [
@@ -291,14 +266,10 @@
         { value: 'product_count:desc', label: 'Product Count: High to Low' },
         { value: 'product_count:asc', label: 'Product Count: Low to High' },
       ];
-    }
-  }, [searchMode]);
-
-  const clearAllFilters = useCallback(() => {
-    setActiveFilters({});
-  }, []);
-
-  const totalActiveFilters = useMemo(() => {
-    return Object.values(activeFilters).reduce((total, filters) => total + filters.length, 0);
-  }, [activeFilters]);
+    }
+  }, [searchMode]); // Re-run memoization if searchMode changes
+
+  const clearAllFilters = () => {
+    setActiveFilters({}); // Reset all filters
+  };
 
   return (
     <>
@@ -308,13 +279,13 @@
       />
       <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
-          <Breadcrumbs currentPageTitle={`Search Results for "${initialQuery}"`} />
-
-          <div className="flex flex-col lg:flex-row gap-8">
+          <Breadcrumbs currentPageTitle={`Search Results for "${searchQuery}"`} />
+
+          <div className="flex flex-col md:flex-row gap-8">
             {/* Left Column: Filters */}
-            <div className="lg:w-1/4">
+            <div className="md:w-1/4">
               <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 lg:sticky lg:top-24">
-                <div className="flex items-center justify-between mb-6">
+                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xl font-semibold text-gray-100">Filters</h2>
                   {totalActiveFilters > 0 && (
                     <button
@@ -325,7 +296,7 @@
                     </button>
                   )}
                 </div>
-                
+
                 {loading && !facetDistribution ? (
                   <div className="flex justify-center py-4">
                     <LoadingSpinner />
@@ -334,7 +305,7 @@
                   <p className="text-gray-400 text-sm">No filters available for this search.</p>
                 ) : (
                   <div className="space-y-6">
-                    {filterGroups.map(group => (
+                    {filterGroups.map((group) => (
                       <div key={group.key} className="border-b border-gray-700 pb-4 last:border-b-0">
                         <button
                           onClick={() => setActiveDropdown(activeDropdown === group.key ? null : group.key)}
@@ -343,14 +314,14 @@
                           <span className="flex items-center gap-2">
                             {group.title}
                             {group.selected.length > 0 && (
-                              <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
+                              <span className="bg-[#F4A024] text-gray-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                 {group.selected.length}
                               </span>
                             )}
                           </span>
                           <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === group.key ? 'rotate-180' : ''}`} />
                         </button>
-                        {(activeDropdown === group.key || group.selected.length > 0) && (
+                        {(activeDropdown === group.key || group.selected.length > 0 || group.options.length > 0) && (
                           <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                             {group.options.length > 0 ? (
                               group.options.map(option => (
@@ -360,7 +331,7 @@
                                       type="checkbox"
                                       checked={group.selected.includes(option.id)}
                                       onChange={() => handleFilterChange(group.key, option.id)}
-                                      className="rounded border-gray-600 text-[#F4A024] focus:ring-[#F4A024] focus:ring-offset-0 w-4 h-4 bg-gray-700"
+                                      className="rounded border-gray-600 text-[#F4A024] focus:ring-[#F4A024] focus:ring-offset-0 w-4 h-4 bg-gray-700/50"
                                     />
                                     <span className="ml-3 truncate">{option.name}</span>
                                   </div>
@@ -377,7 +348,7 @@
             </div>
 
             {/* Right Column: Results and Sorting */}
-            <div className="lg:w-3/4">
+            <div className="md:w-3/4">
               {/* Search Mode Tabs */}
               <div className="flex border-b border-gray-700 mb-6">
                 <button
@@ -402,7 +373,7 @@
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                 <div>
                   <h1 className="text-2xl font-bold text-gray-100">
-                    Showing {results.length}+ {searchMode} for "{initialQuery}"
+                    Showing {results.length} {searchMode} for "{searchQuery}"
                   </h1>
                   {totalActiveFilters > 0 && (
                     <p className="text-gray-400 text-sm mt-1">
@@ -420,7 +391,7 @@
                       onChange={handleSortChange}
                       className="appearance-none bg-gray-800/50 text-gray-300 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A024] cursor-pointer text-sm border border-gray-600"
                     >
-                      {sortOptions.map(option => (
+                      {sortOptions.map((option) => (
                         <option key={option.value} value={option.value} className="bg-gray-800">
                           {option.label}
                         </option>
@@ -440,7 +411,7 @@
                   <p className="text-gray-300">Please try again later.</p>
                 </div>
               ) : results.length === 0 ? (
-                <div className="text-center py-12">
+                <div className="text-center py-12 bg-gray-800/30 rounded-lg">
                   <p className="text-gray-300 font-bold">No {searchMode} found for "{initialQuery}"</p>
                   {totalActiveFilters > 0 && (
                     <p className="text-gray-400 text-sm mt-2">Try adjusting your search query or clearing some fil