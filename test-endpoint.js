import fetch from 'node-fetch';

async function testHumorStyleEndpoint() {
  try {
    console.log('🧪 Testing humor_style question endpoint...');
    
    const response = await fetch('http://localhost:3001/api/questions/humor_style/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        answer: 'witty'
      })
    });

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Response Body:', responseText);

    if (response.status === 404) {
      console.log('❌ Still getting 404 - question not found');
    } else if (response.status === 401) {
      console.log('🔐 Getting 401 - authentication issue (expected with test token)');
    } else if (response.status === 200) {
      console.log('✅ Success! Question endpoint is working');
    } else {
      console.log(`ℹ️ Unexpected status: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testHumorStyleEndpoint();