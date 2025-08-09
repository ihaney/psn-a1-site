import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;
const meilisearchHost = process.env.VITE_MEILISEARCH_HOST as string;
const meilisearchAdminKey = process.env.VITE_MEILISEARCH_ADMIN_KEY as string;

if (!supabaseUrl || !supabaseAnonKey || !meilisearchHost || !meilisearchAdminKey) {
  console.error('Missing environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MEILISEARCH_HOST, VITE_MEILISEARCH_ADMIN_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const meilisearchClient = new MeiliSearch({
  host: meilisearchHost,
  apiKey: meilisearchAdminKey,
});

const suppliersIndex = meilisearchClient.index('suppliers');
const BATCH_SIZE = 100;

async function populateSuppliersToMeilisearch() {
  console.log('🚀 Starting supplier data population to Meilisearch...');
  console.log(`📊 Meilisearch Host: ${meilisearchHost}`);
  
  let offset = 0;
  let hasMore = true;
  let totalSynced = 0;

  try {
    // First, let's check if we can connect to Meilisearch
    try {
      const health = await meilisearchClient.health();
      console.log('✅ Meilisearch connection successful:', health);
    } catch (error) {
      console.error('❌ Failed to connect to Meilisearch:', error);
      return;
    }

    // Configure index settings
    console.log('⚙️ Configuring suppliers index settings...');
    await suppliersIndex.updateSettings({
      searchableAttributes: [
        'Supplier_Title',
        'Supplier_Description',
        'Supplier_Location',
        'Supplier_Country_Name',
        'Supplier_City_Name',
        'product_keywords'
      ],
      filterableAttributes: [
        'Supplier_Country_Name',
        'Supplier_Source_ID',
        'product_count'
      ],
      sortableAttributes: [
        'Supplier_Title',
        'product_count'
      ]
    });

    // Fetch all products to build a map of supplier_id to product keywords
    console.log('📦 Fetching all products to build supplier product keywords...');
    const { data: allProducts, error: productsError } = await supabase
      .from('Products')
      .select('Product_Supplier_ID, Product_Title, Product_Description, Product_Category_Name');

    if (productsError) {
      console.error('❌ Error fetching all products for keywords:', productsError);
      return;
    }

    const supplierProductKeywords = new Map<string, string[]>();
    const supplierProductCounts = new Map<string, number>();
    
    if (allProducts) {
      allProducts.forEach(product => {
        if (product.Product_Supplier_ID) {
          const keywords = [
            product.Product_Title, 
            product.Product_Description,
            product.Product_Category_Name
          ]
            .filter(Boolean)
            .join(' ');
          
          if (!supplierProductKeywords.has(product.Product_Supplier_ID)) {
            supplierProductKeywords.set(product.Product_Supplier_ID, []);
            supplierProductCounts.set(product.Product_Supplier_ID, 0);
          }
          
          supplierProductKeywords.get(product.Product_Supplier_ID)?.push(keywords);
          supplierProductCounts.set(
            product.Product_Supplier_ID, 
            (supplierProductCounts.get(product.Product_Supplier_ID) || 0) + 1
          );
        }
      });
    }
    console.log(`✅ Built keywords map for ${supplierProductKeywords.size} suppliers`);

    while (hasMore) {
      console.log(`📥 Fetching suppliers batch starting at offset ${offset}...`);
      
      const { data: suppliers, error } = await supabase
        .from('Supplier')
        .select(`
          Supplier_ID,
          Supplier_Title,
          Supplier_Description,
          Supplier_Website,
          Supplier_Email,
          Supplier_Location,
          Supplier_Whatsapp,
          Supplier_Country_Name,
          Supplier_City_Name,
          Supplier_Source_ID
        `)
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        console.error('❌ Error fetching suppliers from Supabase:', error);
        break;
      }

      if (!suppliers || suppliers.length === 0) {
        hasMore = false;
        break;
      }

      // Transform data for Meilisearch
      const documents = suppliers.map((supplier) => ({
        Supplier_ID: supplier.Supplier_ID,
        Supplier_Title: supplier.Supplier_Title || 'Unknown Supplier',
        Supplier_Description: supplier.Supplier_Description || '',
        Supplier_Website: supplier.Supplier_Website || '',
        Supplier_Email: supplier.Supplier_Email || '',
        Supplier_Location: supplier.Supplier_Location || '',
        Supplier_Whatsapp: supplier.Supplier_Whatsapp || '',
        Supplier_Country_Name: supplier.Supplier_Country_Name || 'Unknown',
        Supplier_City_Name: supplier.Supplier_City_Name || '',
        Supplier_Source_ID: supplier.Supplier_Source_ID || '',
        product_count: supplierProductCounts.get(supplier.Supplier_ID) || 0,
        product_keywords: supplierProductKeywords.get(supplier.Supplier_ID)?.join(' ') || '',
      }));

      console.log(`📤 Adding ${documents.length} suppliers to Meilisearch...`);
      
      // Add documents to Meilisearch
      const { taskUid } = await suppliersIndex.addDocuments(documents, { primaryKey: 'Supplier_ID' });
      
      console.log(`⏳ Waiting for Meilisearch task ${taskUid} to complete...`);
      const task = await meilisearchClient.waitForTask(taskUid);

      if (task.status === 'failed') {
        console.error('❌ Failed to add documents to Meilisearch:', task.error);
        break;
      }

      totalSynced += documents.length;
      console.log(`✅ Synced ${documents.length} suppliers. Total synced: ${totalSynced}`);

      offset += BATCH_SIZE;
      if (suppliers.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    console.log(`🎉 Supplier population complete! Total suppliers synced: ${totalSynced}`);
    
    // Get final index stats
    const stats = await suppliersIndex.getStats();
    console.log(`📊 Final suppliers index stats:`, stats);
    
  } catch (error) {
    console.error('💥 An unexpected error occurred during supplier population:', error);
  }
}

populateSuppliersToMeilisearch();