const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all portfolio items
router.get("/", (req, res) => {
  db.query("SELECT * FROM portfolio_items", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Add new item
router.post("/", (req, res) => {
  const { stock_ticker, quantity, purchase_price, purchase_date } = req.body;
  const sql = "INSERT INTO portfolio_items (stock_ticker, quantity, purchase_price, purchase_date) VALUES (?, ?, ?, ?)";
  db.query(sql, [stock_ticker, quantity, purchase_price, purchase_date], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId });
  });
});

// Delete item
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM portfolio_items WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Deleted" });
  });
});

module.exports = router;
