import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, X, Calculator, Search, FileText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useProductSearch } from '../hooks/useProductSearch';
import { useSavedItems } from '../hooks/useSavedItems';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import type { TariffCategory } from '../types';

interface SelectedProduct {
  id: string;
  name: string;
  price: string;
  url: string;
  category: string;
  supplier: string;
  applicableTariffs: string[];
  subtotal?: {
    baseAmount: number;
    tariffAmount: number;
    total: number;
    effectiveRate: number;
  };
}

const TARIFF_CATEGORIES: TariffCategory[] = [
  { id: 'live-animals', name: 'Live Animals & Aquaculture', rate: 0.10 },
  { id: 'meat', name: 'Meat & Edible Offal', rate: 0.10 },
  { id: 'dairy', name: 'Dairy, Eggs & Honey', rate: 0.10 },
  { id: 'produce', name: 'Produce & Nuts', rate: 0.10 },
  { id: 'grains', name: 'Grains, Milled Goods & Bakery', rate: 0.10 },
  { id: 'prepared-foods', name: 'Prepared Foods & Beverages', rate: 0.10 },
  { id: 'plastics-primary', name: 'Plastics in Primary Forms', rate: 0.10 },
  { id: 'plastic-articles', name: 'Plastic Articles & Packaging', rate: 0.10 },
  { id: 'rubber', name: 'Rubber & Rubber Goods', rate: 0.10 },
  { id: 'wood', name: 'Wood, Plywood & Panels', rate: 0.10 },
  { id: 'paper', name: 'Paper, Cartons & Printed Media', rate: 0.10 },
  { id: 'textile-yarns', name: 'Textile Yarns & Fabrics', rate: 0.10 },
  { id: 'knitted-apparel', name: 'Knitted Apparel', rate: 0.10 },
  { id: 'woven-apparel', name: 'Woven Apparel', rate: 0.10 },
  { id: 'home-textiles', name: 'Home Textiles & Furnishings', rate: 0.10 },
  { id: 'footwear', name: 'Footwear', rate: 0.10 },
  { id: 'headgear', name: 'Headgear, Umbrellas & Similar', rate: 0.10 },
  { id: 'stone-ceramic', name: 'Stone, Ceramic & Glassware', rate: 0.10 },
  { id: 'base-metals', name: 'Base Metals & Semi‑Finished Products', rate: 0.10 },
  { id: 'metal-tools', name: 'Metal Tools & Hardware', rate: 0.10 },
  { id: 'machinery', name: 'Machinery & Mechanical Appliances', rate: 0.10 },
  { id: 'computers', name: 'Computers & Office Machines', rate: 0.10 },
  { id: 'electrical', name: 'Electrical Machinery & Parts', rate: 0.10 },
  { id: 'electronics', name: 'Consumer Electronics & A/V', rate: 0.10 },
  { id: 'vehicles', name: 'Vehicles & Auto Parts', rate: 0.10 },
  { id: 'rail-aircraft', name: 'Rail, Aircraft & Spacecraft', rate: 0.10 },
  { id: 'optical-medical', name: 'Optical & Medical Instruments', rate: 0.10 },
  { id: 'jewellery', name: 'Jewellery & Precious Metals', rate: 0.10 },
  { id: 'toys-games', name: 'Toys, Games & Sporting Goods', rate: 0.10 },
  { id: 'furniture', name: 'Furniture & Bedding', rate: 0.10 },
  { id: 'chemicals', name: 'Chemicals & Fertilizers', rate: 0.10 },
  { id: 'cosmetics', name: 'Cosmetics, Soaps & Cleaners', rate: 0.10 },
  { id: 'photography', name: 'Photography & Cinematography', rate: 0.10 },
  { id: 'arms', name: 'Arms & Ammunition', rate: 0.10 },
  { id: 'misc', name: 'Miscellaneous Manufactures', rate: 0.10 }
];

// PDF styles - moved outside component to avoid recreation
const pdfStyles = {
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #cccccc',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 5
  },
  date: {
    fontSize: 10,
    textAlign: 'right',
    color: '#666666'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 5,
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    padding: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#eeeeee',
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
    fontWeight: 'bold'
  },
  productInfo: {
    flex: 2
  },
  tariffInfo: {
    flex: 1
  },
  amountInfo: {
    flex: 1,
    textAlign: 'right'
  },
  totals: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 12,
    textAlign: 'right'
  },
  finalTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#cccccc'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666666',
    fontSize: 8,
    borderTop: '1 solid #cccccc',
    paddingTop: 10
  }
};

// PDF Document Component - will be created dynamically
const createTariffPDF = (PDFComponents: any, products: SelectedProduct[], grandTotal: any) => {
  const { Document, Page, Text, View, StyleSheet } = PDFComponents;
  
  const styles = StyleSheet.create(pdfStyles);

  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, "Tariff Calculation Report"),
        React.createElement(Text, { style: styles.subtitle }, "Generated by Paisán - Latin American Products Marketplace"),
        React.createElement(Text, { style: styles.date },
          new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        )
      ),

      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Calculation Details"),
        
        React.createElement(View, { style: styles.table },
          React.createElement(View, { style: styles.tableHeader },
            React.createElement(Text, { style: [styles.tableCellHeader, styles.productInfo] }, "Product Information"),
            React.createElement(Text, { style: [styles.tableCellHeader, styles.tariffInfo] }, "Tariff Category"),
            React.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Base Amount"),
            React.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Tariff Rate"),
            React.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Tariff Amount"),
            React.createElement(Text, { style: [styles.tableCellHeader, styles.amountInfo] }, "Total")
          ),

          ...products.map((product, index) =>
            React.createElement(View, { key: index, style: styles.tableRow },
              React.createElement(View, { style: [styles.tableCell, styles.productInfo] },
                React.createElement(Text, null, product.name),
                React.createElement(Text, { style: { fontSize: 8, color: '#666666' } },
                  `Supplier: ${product.supplier}`
                ),
                React.createElement(Text, { style: { fontSize: 8, color: '#666666' } },
                  `Link: ${product.url}`
                )
              ),
              React.createElement(Text, { style: [styles.tableCell, styles.tariffInfo] },
                product.applicableTariffs.map(tariffId => {
                  const category = TARIFF_CATEGORIES.find(cat => cat.id === tariffId);
                  return category?.name;
                }).join(', ')
              ),
              React.createElement(Text, { style: [styles.tableCell, styles.amountInfo] },
                `$${product.subtotal?.baseAmount.toFixed(2)}`
              ),
              React.createElement(Text, { style: [styles.tableCell, styles.amountInfo] },
                `${(product.subtotal?.effectiveRate || 0) * 100}%`
              ),
              React.createElement(Text, { style: [styles.tableCell, styles.amountInfo] },
                `$${product.subtotal?.tariffAmount.toFixed(2)}`
              ),
              React.createElement(Text, { style: [styles.tableCell, styles.amountInfo] },
                `$${product.subtotal?.total.toFixed(2)}`
              )
            )
          )
        ),

        React.createElement(View, { style: styles.totals },
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Total Base Amount:"),
            React.createElement(Text, { style: styles.totalAmount }, `$${grandTotal.baseAmount.toFixed(2)}`)
          ),
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Effective Tariff Rate:"),
            React.createElement(Text, { style: styles.totalAmount }, `${(grandTotal.effectiveRate * 100).toFixed(1)}%`)
          ),
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Total Tariffs:"),
            React.createElement(Text, { style: styles.totalAmount }, `$${grandTotal.tariffAmount.toFixed(2)}`)
          ),
          React.createElement(View, { style: [styles.totalRow, styles.finalTotal] },
            React.createElement(Text, { style: styles.totalLabel }, "Final Total:"),
            React.createElement(Text, { style: styles.totalAmount }, `$${grandTotal.total.toFixed(2)}`)
          )
        )
      ),

      React.createElement(Text, { style: styles.footer },
        "This tariff calculation report was automatically generated through Paisán (paisan.net). For any questions, please contact support@paisan.net"
      )
    )
  );
};

export default function TariffCalculatorPage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { products, loading: productLoading } = useProductSearch(productSearchQuery);
  const { data: savedItems = [], isLoading: savedItemsLoading } = useSavedItems();

  useEffect(() => {
    const updatedProducts = selectedProducts.map(product => {
      const baseAmount = parseFloat(product.price.replace(/[^0-9.-]+/g, ''));
      if (isNaN(baseAmount)) return product;

      const applicableTariffs = product.applicableTariffs;
      const tariffRate = applicableTariffs.reduce((rate, catId) => {
        const category = TARIFF_CATEGORIES.find(cat => cat.id === catId);
        return rate + (category?.rate || 0);
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

  const addProduct = (product: any) => {
    if (!product) return;
    
    const basePrice = parseFloat((product.Product_Price || '').replace(/[^0-9.-]+/g, ''));
    if (!isNaN(basePrice)) {
      const applicableTariffs = ['misc']; // Default to misc category
      setSelectedProducts(prev => [...prev, {
        id: product.Product_ID,
        name: product.Product_Title || 'Untitled Product',
        price: product.Product_Price || '$0',
        url: `https://paisan.net/product/${product.Product_ID}`,
        category: product.category_title || 'Miscellaneous',
        supplier: product.supplier_title || 'Unknown Supplier',
        applicableTariffs
      }]);

      setSelectedCategories(prev => {
        const newCategories = new Set([...prev, ...applicableTariffs]);
        return Array.from(newCategories);
      });
    }
    setProductSearchQuery('');
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    
    const remainingProducts = selectedProducts.filter(p => p.id !== productId);
    const newCategories = new Set<string>();
    remainingProducts.forEach(product => {
      product.applicableTariffs.forEach(cat => newCategories.add(cat));
    });
    setSelectedCategories(Array.from(newCategories));
  };

  const importSavedItems = () => {
    if (savedItems.length === 0) {
      toast.error('No saved items found');
      return;
    }

    const newProducts = savedItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.Product_Price,
      url: `https://paisan.net/product/${item.id}`,
      category: item.category,
      supplier: item.supplier,
      applicableTariffs: ['misc'] // Default to misc category
    }));

    // Filter out items that are already in the calculator
    const existingProductIds = new Set(selectedProducts.map(product => product.id));
    const productsToAdd = newProducts.filter(product => !existingProductIds.has(product.id));

    if (productsToAdd.length === 0) {
      toast.info('All saved items are already in your tariff calculation');
      return;
    }

    setSelectedProducts(prev => [...prev, ...productsToAdd]);

    // Update categories
    const newCategories = new Set(selectedCategories);
    productsToAdd.forEach(product => {
      product.applicableTariffs.forEach(cat => newCategories.add(cat));
    });
    setSelectedCategories(Array.from(newCategories));

    toast.success(`Added ${productsToAdd.length} saved items to your tariff calculation`);
  };

  const grandTotal = {
    baseAmount: selectedProducts.reduce((sum, product) => sum + (product.subtotal?.baseAmount || 0), 0),
    tariffAmount: selectedProducts.reduce((sum, product) => sum + (product.subtotal?.tariffAmount || 0), 0),
    total: selectedProducts.reduce((sum, product) => sum + (product.subtotal?.total || 0), 0),
    effectiveRate: selectedProducts.length > 0
      ? selectedProducts.reduce((sum, product) => sum + (product.subtotal?.tariffAmount || 0), 0) /
        selectedProducts.reduce((sum, product) => sum + (product.subtotal?.baseAmount || 0), 0)
      : 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePDFDownload = useCallback(async () => {
    setPdfLoading(true);
    try {
      const PDFModule = await import('@react-pdf/renderer');
      const pdfComponents = {
        PDFDownloadLink: PDFModule.PDFDownloadLink,
        Document: PDFModule.Document,
        Page: PDFModule.Page,
        Text: PDFModule.Text,
        View: PDFModule.View,
        StyleSheet: PDFModule.StyleSheet
      };

      const document = createTariffPDF(pdfComponents, selectedProducts, grandTotal);
      
      // Create a temporary link element to trigger download
      const blob = await PDFModule.pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tariff-calculation.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  }, [selectedProducts, grandTotal]);

  return (
    <>
      <SEO 
        title="Tariff Calculator"
        description="Calculate import tariffs for Mexican products. Estimate duties and fees for different product categories."
        keywords="tariff calculator, import duties, Mexican imports, customs duties, trade calculator"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center font-bold text-[#F4A024] hover:text-[#F4A024]/80 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Tariff Calculator</h1>
            <p className="text-gray-400">Calculate import duties for Mexican products</p>
            <p className="text-sm text-[#F4A024] mt-2">Note: Each category adds a 10% tariff</p>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-900 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Select Products</h2>
                {savedItems.length > 0 && (
                  <button
                    onClick={importSavedItems}
                    disabled={savedItemsLoading}
                    className="flex items-center gap-2 bg-[#F4A024] text-gray-900 px-4 py-2 rounded-md hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    Import Saved Items ({savedItems.length})
                  </button>
                )}
              </div>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
                />
                
                {productSearchQuery && (
                  <div className="absolute z-10 left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    {productLoading ? (
                      <div className="text-center py-4">
                        <LoadingSpinner />
                      </div>
                    ) : products.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {products.map((product) => (
                          <button
                            key={product.Product_ID}
                            onClick={() => addProduct(product)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">{product.Product_Title || 'Untitled Product'}</span>
                              <span className="text-[#F4A024]">{product.Product_Price || '$0'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm p-4">No products found</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedProducts.length > 0 ? (
                  selectedProducts.map((product) => (
                    <div key={product.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-300">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{product.category}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-400">{product.supplier}</span>
                            <span className="text-gray-500">•</span>
                            <a 
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#F4A024] hover:text-[#F4A024]/80"
                            >
                              View product
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-300">{product.price}</span>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-400">Applied Tariff Categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.applicableTariffs.map(catId => {
                            const category = TARIFF_CATEGORIES.find(cat => cat.id === catId);
                            return category ? (
                              <span
                                key={catId}
                                className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300"
                              >
                                {category.name} (10%)
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {product.subtotal && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Base Amount</p>
                              <p className="text-gray-300">{formatCurrency(product.subtotal.baseAmount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Tariff Rate</p>
                              <p className="text-[#F4A024]">{(product.subtotal.effectiveRate * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Tariff Amount</p>
                              <p className="text-[#F4A024]">+{formatCurrency(product.subtotal.tariffAmount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Total</p>
                              <p className="text-white font-medium">{formatCurrency(product.subtotal.total)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-400 font-bold mb-2">No products added yet</p>
                    <p className="text-sm text-gray-500 font-bold">
                      {savedItems.length > 0 
                        ? 'Use the "Import Saved Items" button above or search for products to add'
                        : 'Search for products above to start calculating tariffs'
                      }
                    </p>
                  </div>
                )}

                {selectedProducts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Grand Total</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400">Total Base Amount</p>
                        <p className="text-xl text-gray-300">{formatCurrency(grandTotal.baseAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Effective Rate</p>
                        <p className="text-xl text-[#F4A024]">{(grandTotal.effectiveRate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Tariffs</p>
                        <p className="text-xl text-[#F4A024]">+{formatCurrency(grandTotal.tariffAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Final Total</p>
                        <p className="text-xl text-white font-bold">{formatCurrency(grandTotal.total)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handlePDFDownload}
                  disabled={pdfLoading}
                  className="flex items-center gap-2 bg-[#F4A024] text-gray-900 px-6 py-3 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-5 h-5" />
                  {pdfLoading ? 'Generating PDF...' : 'Export as PDF'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}