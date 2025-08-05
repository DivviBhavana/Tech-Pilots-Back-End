const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// Polygon: Get historical prices for chart
app.get('/api/stock-history/:ticker', async (req, res) => {
  const { ticker } = req.params;
  // Get last 30 days range
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const fromStr = from.toISOString().split('T')[0];
  const toStr = new Date().toISOString().split('T')[0];

  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});


const portfolioRoutes = require("./routes/portfolio");
app.use("/api/portfolio", portfolioRoutes);
const priceRoutes = require("./routes/price");
app.use("/api/price", priceRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
