const axios = require("axios");
const express = require("express");
const router = express.Router();
require("dotenv").config();

// Get previous weekday (skips weekends)
function getPreviousWeekday(date) {
  const d = new Date(date);
  do {
    d.setDate(d.getDate() - 1);
  } while (d.getDay() === 0 || d.getDay() === 6); // Sunday or Saturday
  return d.toISOString().split("T")[0];
}

// Fetch close price for a given ticker and date
async function fetchClosePrice(ticker, date) {
  const url = `https://api.polygon.io/v1/open-close/${ticker}/${date}?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`;
  const response = await axios.get(url);
  return response.data.close;
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Route to handle multiple tickers
router.get("/", async (req, res) => {
  const tickersParam = req.query.tickers;
  if (!tickersParam) {
    return res.status(400).json({ error: "Tickers query param is required" });
  }

  const tickers = tickersParam.split(",");
  const today = new Date().toISOString().split("T")[0];
  const fallbackDate = getPreviousWeekday(today);
  const results = {};

  for (const ticker of tickers) {
    await delay(15000); // Delay to respect rate limit (1.5 seconds between calls)

    try {
      const price = await fetchClosePrice(ticker, today);
      results[ticker] = price;
    } catch (err) {
      console.error(`Primary fetch failed for ${ticker} on ${today}:`, err?.response?.data || err.message);
      try {
        const fallbackPrice = await fetchClosePrice(ticker, fallbackDate);
        results[ticker] = fallbackPrice;
      } catch (fallbackErr) {
        console.error(`Fallback fetch failed for ${ticker} on ${fallbackDate}:`, fallbackErr?.response?.data || fallbackErr.message);
        results[ticker] = 0; // default or error value
      }
    }
  }

  return res.json(results);
});

module.exports = router;
