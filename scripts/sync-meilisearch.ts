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

const productsIndex = meilisearchClient.index('products');
const BATCH_SIZE = 1000;

async function syncProductsToMeilisearch() {
  console.log('🚀 Starting product data sync to Meilisearch...');
  console.log(`📊 Meilisearch Host: ${meilisearchHost}`);
  console.log(`🔑 Admin Key (first 10 chars): ${meilisearchAdminKey.substring(0, 10)}...`);
  
  let offset = 0;
  let hasMore = true;
  let totalSynced = 0;

  try {
    // Test basic connection
    try {
      const health = await meilisearchClient.health();
      console.log('✅ Meilisearch connection successful:', health);
    } catch (error) {
      console.error('❌ Failed to connect to Meilisearch:', error);
      return;
    }

    // Test API key permissions by trying to get indexes
    try {
      const indexes = await meilisearchClient.getIndexes();
      console.log('✅ API key has valid permissions');
      console.log(`📋 Current indexes: ${indexes.results.map(idx => idx.uid).join(', ')}`);
    } catch (error) {
      console.error('❌ API key validation failed:', error);
      console.error('💡 Please check that your VITE_MEILISEARCH_ADMIN_KEY has admin permissions');
      return;
    }

    // Configure index settings
    console.log('⚙️ Configuring index settings...');
    try {
      await productsIndex.updateSettings({
        searchableAttributes: [
          'title',
          'category',
          'supplier',
          'country',
          'source'
        ],
        filterableAttributes: [
          'category',
          'supplier',
          'country',
          'source',
          'price'
        ],
        sortableAttributes: [
          'title',
          'price'
        ]
      });
      console.log('✅ Index settings configured successfully');
    } catch (error) {
      console.error('❌ Failed to configure index settings:', error);
      return;
    }

    while (hasMore) {
      console.log(`📥 Fetching products batch starting at offset ${offset}...`);
      
      const { data: products, error } = await supabase
        .from('Products')
        .select(`
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
        `)
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        console.error('❌ Error fetching products from Supabase:', error);
        break;
      }

      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }

      // Transform data for Meilisearch
      const documents = products.map((product) => ({
        id: product.Product_ID,
        title: product.Product_Title || 'Untitled Product',
        price: product.Product_Price || '$0',
        image: product.Product_Image_URL || '',
        url: product.Product_URL || '',
        moq: product.Product_MOQ || 'N/A',
        country: product.Product_Country_Name || 'Unknown',
        category: product.Product_Category_Name || 'Unknown',
        supplier: product.Product_Supplier_Name || 'Unknown',
        source: product.Product_Source_Name || 'Unknown',
      }));

      console.log(`📤 Adding ${documents.length} products to Meilisearch...`);
      
      // Add documents to Meilisearch
      const { taskUid } = await productsIndex.addDocuments(documents, { primaryKey: 'id' });
      
      console.log(`⏳ Waiting for Meilisearch task ${taskUid} to complete...`);
      const task = await meilisearchClient.waitForTask(taskUid);

      if (task.status === 'failed') {
        console.error('❌ Failed to add documents to Meilisearch:', task.error);
        break;
      }

      totalSynced += documents.length;
      console.log(`✅ Synced ${documents.length} products. Total synced: ${totalSynced}`);

      offset += BATCH_SIZE;
      if (products.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    console.log(`🎉 Product sync complete! Total products synced: ${totalSynced}`);
    
    // Get final index stats
    const stats = await productsIndex.getStats();
    console.log(`📊 Final index stats:`, stats);
    
  } catch (error) {
    console.error('💥 An unexpected error occurred during product sync:', error);
  }
}

syncProductsToMeilisearch();