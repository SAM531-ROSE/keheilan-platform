const express = require('express');
const cors = require('cors');
try {
  require('dotenv').config();
} catch(e) {
  console.log('dotenv error:', e.message);
}
const app = express();
app.use(cors());
app.use(express.json());
// Routes
try {
  const farmsRouter = require('./routes/farms');
  const aiRouter = require('./routes/ai');
  const adminRouter = require('./routes/admin');
  const investmentsRouter = require('./routes/investments');

  app.use('/api/farms', farmsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/investments', investmentsRouter);
} catch(e) {
  console.error('Route error:', e.message);
}
app.get('/', (req, res) => {
  res.json({ status: 'Farmaora backend running ' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (e) => {
  console.error('Server error:', e.message);
});
