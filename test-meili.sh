#!/bin/bash

# MeiliSearch Connection Test Script
# This script tests the MeiliSearch connection with the provided configuration

set -e  # Exit on any error

echo "🔍 Testing MeiliSearch Connection..."

# Set the environment variables
export MEILI_HOST="http://172.16.14.211:7700"
export MEILI_MASTER_KEY="XesTe6esXiz8KKHjsQgPm_hs7t0vf6tDVYv_Yxd4NRo"

echo "📍 MeiliSearch Host: $MEILI_HOST"
echo "🔑 API Key: ${MEILI_MASTER_KEY:0:10}..."

# Create a temporary Node.js script to test the connection
cat > temp-meili-test.js << 'EOF'
const { MeiliSearch } = require('meilisearch');

async function testMeiliSearch() {
  try {
    console.log('🔌 Initializing MeiliSearch client...');
    
    const client = new MeiliSearch({
      host: process.env.MEILI_HOST,
      apiKey: process.env.MEILI_MASTER_KEY,
    });

    console.log('✅ MeiliSearch client created successfully');
    
    // Test the connection by getting health status
    console.log('🏥 Checking MeiliSearch health...');
    const health = await client.health();
    console.log('✅ Health check passed:', health);
    
    // List indexes using the correct method
    console.log('📋 Listing indexes...');
    const indexes = await client.getIndexes();
    console.log('✅ Indexes found:', indexes.results.length);
    
    // Test creating a simple index
    console.log('🔨 Testing index creation...');
    try {
      const testIndex = await client.createIndex('test-connection', { primaryKey: 'id' });
      console.log('✅ Test index created:', testIndex.uid);
      
      // Clean up - delete the test index
      await client.deleteIndex('test-connection');
      console.log('✅ Test index cleaned up');
    } catch (indexError) {
      console.log('ℹ️  Index creation test skipped (might already exist):', indexError.message);
    }
    
    console.log('🎉 MeiliSearch connection test successful!');
    
  } catch (error) {
    console.error('❌ MeiliSearch connection failed:', error.message);
    process.exit(1);
  }
}

testMeiliSearch();
EOF

# Run the test
echo "🚀 Running MeiliSearch connection test..."
node temp-meili-test.js

# Clean up
rm temp-meili-test.js

echo "✨ Test completed!" 