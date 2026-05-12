const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const form = new FormData();
form.append('document', fs.createReadStream('./test-id.jpg'));
form.append('fullName', 'John Smith');
form.append('idNumber', 'AB123456');

axios.post('http://localhost:3001/api/ai/kyc', form, {
  headers: form.getHeaders()
}).then(res => {
  console.log(JSON.stringify(res.data, null, 2));
}).catch(err => {
  console.error(err.response?.data || err.message);
});