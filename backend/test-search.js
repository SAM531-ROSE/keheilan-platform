const axios = require('axios');

async function test() {
  try {
    console.log('Sending request...');
    const res = await axios.post('http://localhost:3001/api/ai/search', {
      query: 'low risk wheat farms in egypt'
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('ERROR:', err.response?.data || err.message);
  }
}

test();
