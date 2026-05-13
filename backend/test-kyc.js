const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const form = new FormData();
form.append('document', fs.createReadStream('./test-id.jpg'));
form.append('fullName', 'sama muhammmad ');
form.append('idNumber', '200261589');

axios.post('http://localhost:3001/api/ai/kyc', form, {
  headers: form.getHeaders()
}).then(res => {
  console.log(JSON.stringify(res.data, null, 2));
}).catch(err => {
  console.error(err.response?.data || err.message);
});
