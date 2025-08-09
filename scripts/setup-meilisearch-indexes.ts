import { MeiliSearch } from 'meilisearch';
import 'dotenv/config';

const meilisearchHost = process.env.VITE_MEILISEARCH_HOST as string;
const meilisearchAdminKey = process.env.VITE_MEILISEARCH_ADMIN_KEY as string;

if (!meilisearchHost || !meilisearchAdminKey) {
  console.error('Missing Meilisearch environment variables. Please check your .env file.');
  console.error('Required variables: VITE_MEILISEARCH_HOST, VITE_MEILISEARCH_ADMIN_KEY');
  process.exit(1);
}

const meilisearchClient = new MeiliSearch({
  host: meilisearchHost,
  apiKey: meilisearchAdminKey,
});

async function setupMeilisearchIndexes() {
  console.log('🚀 Setting up Meilisearch indexes...');
  console.log(`📊 Meilisearch Host: ${meilisearchHost}`);

  try {
    // Test connection
    const health = await meilisearchClient.health();
    console.log('✅ Meilisearch connection successful:', health);

    // Setup products index
    console.log('📦 Setting up products index...');
    const productsIndex = meilisearchClient.index('products');
    
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
      ],
      displayedAttributes: [
        'id',
        'title',
        'price',
        'image',
        'url',
        'moq',
        'country',
        'category',
        'supplier',
        'source'
      ]
    });
    console.log('✅ Products index configured');

    // Setup suppliers index
    console.log('🏢 Setting up suppliers index...');
    const suppliersIndex = meilisearchClient.index('suppliers');
    
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
      ],
      displayedAttributes: [
        'Supplier_ID',
        'Supplier_Title',
        'Supplier_Description',
        'Supplier_Website',
        'Supplier_Email',
        'Supplier_Location',
        'Supplier_Whatsapp',
        'Supplier_Country_Name',
        'Supplier_City_Name',
        'Supplier_Source_ID',
        'product_count',
        'product_keywords'
      ]
    });
    console.log('✅ Suppliers index configured');

    console.log('🎉 Meilisearch indexes setup complete!');
    
    // Display current indexes
    const indexes = await meilisearchClient.getIndexes();
    console.log('📋 Available indexes:', indexes.results.map(idx => idx.uid));

  } catch (error) {
    console.error('💥 Error setting up Meilisearch indexes:', error);
  }
}

setupMeilisearchIndexes();