// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// // Get all portfolio items
// router.get("/", (req, res) => {
//   db.query("SELECT * FROM portfolio_items", (err, result) => {
//     if (err) return res.status(500).send(err);
//     res.json(result);
//   });
// });

// // Add new item
// router.post("/", (req, res) => {
//   const { stock_ticker, quantity, purchase_price, purchase_date } = req.body;
//   const sql = "INSERT INTO portfolio_items (stock_ticker, quantity, purchase_price, purchase_date) VALUES (?, ?, ?, ?)";
//   db.query(sql, [stock_ticker, quantity, purchase_price, purchase_date], (err, result) => {
//     if (err) return res.status(500).send(err);
//     res.json({ id: result.insertId });
//   });
// });

// // Delete item
// router.delete("/:id", (req, res) => {
//   const sql = "DELETE FROM portfolio_items WHERE id = ?";
//   db.query(sql, [req.params.id], (err) => {
//     if (err) return res.status(500).send(err);
//     res.json({ message: "Deleted" });
//   });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../db");

// Get portfolio items
router.get("/", (req, res) => {
  db.query("SELECT * FROM portfolio_items", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Add (BUY) item
router.post("/", (req, res) => {
  const { stock_ticker, quantity, purchase_price, purchase_date } = req.body;

  const insertPortfolio = `
    INSERT INTO portfolio_items (stock_ticker, quantity, purchase_price, purchase_date)
    VALUES (?, ?, ?, ?)
  `;
  db.query(insertPortfolio, [stock_ticker, quantity, purchase_price, purchase_date], (err, result) => {
    if (err) return res.status(500).send(err);

    const profit_loss = 0; // No profit/loss when buying

    const insertTransaction = `
      INSERT INTO transactions (stock_ticker, quantity, price, type, profit_loss)
      VALUES (?, ?, ?, 'buy', ?)
    `;
    db.query(insertTransaction, [stock_ticker, quantity, purchase_price, profit_loss], (err2) => {
      if (err2) return res.status(500).send(err2);
      res.json({ id: result.insertId });
    });
  });
});
// router.post("/", (req, res) => {
//   const { stock_ticker, quantity, purchase_price, purchase_date } = req.body;

//   const insertPortfolio = `
//     INSERT INTO portfolio_items (stock_ticker, quantity, purchase_price, purchase_date)
//     VALUES (?, ?, ?, ?)
//   `;
//   db.query(insertPortfolio, [stock_ticker, quantity, purchase_price, purchase_date], (err, result) => {
//     if (err) return res.status(500).send(err);

//     const insertTransaction = `
//       INSERT INTO transactions (stock_ticker, quantity, price, type,profit_loss)
//       VALUES (?, ?, ?, 'buy')
//     `;
//     db.query(insertTransaction, [stock_ticker, quantity, purchase_price], (err2) => {
//       if (err2) return res.status(500).send(err2);
//       res.json({ id: result.insertId });
//     });
//   });
// });


// Delete (SELL) item
router.delete("/:id", (req, res) => {
  const getItem = `SELECT * FROM portfolio_items WHERE id = ?`;
  db.query(getItem, [req.params.id], (err, rows) => {
    if (err) return res.status(500).send(err);
    if (rows.length === 0) return res.status(404).json({ message: "Item not found" });

    const { stock_ticker, quantity, purchase_price } = rows[0];

    const deleteItem = `DELETE FROM portfolio_items WHERE id = ?`;
    db.query(deleteItem, [req.params.id], (err2) => {
      if (err2) return res.status(500).send(err2);

      // Simulate live price — replace with real API or value
      const livePrice = purchase_price * 1.1; // 10% gain mock
      const profit_loss = (livePrice - purchase_price) * quantity;

      const insertTransaction = `
        INSERT INTO transactions (stock_ticker, quantity, price, type, profit_loss)
        VALUES (?, ?, ?, 'sell', ?)
      `;
      db.query(insertTransaction, [stock_ticker, quantity, livePrice, profit_loss], (err3) => {
        if (err3) return res.status(500).send(err3);
        res.json({ message: "Deleted and transaction recorded with profit/loss" });
      });
    });
  });
});
// router.delete("/:id", (req, res) => {
//   const getItem = `SELECT * FROM portfolio_items WHERE id = ?`;
//   db.query(getItem, [req.params.id], (err, rows) => {
//     if (err) return res.status(500).send(err);
//     if (rows.length === 0) return res.status(404).json({ message: "Item not found" });

//     const { stock_ticker, quantity, purchase_price } = rows[0];

//     const deleteItem = `DELETE FROM portfolio_items WHERE id = ?`;
//     db.query(deleteItem, [req.params.id], (err2) => {
//       if (err2) return res.status(500).send(err2);

//       const insertTransaction = `
//         INSERT INTO transactions (stock_ticker, quantity, price, type)
//         VALUES (?, ?, ?, 'sell')
//       `;
//       db.query(insertTransaction, [stock_ticker, quantity, purchase_price], (err3) => {
//         if (err3) return res.status(500).send(err3);
//         res.json({ message: "Deleted and transaction recorded" });
//       });
//     });
//   });
// });

// Get all transactions
router.get("/transactions", (req, res) => {
  db.query("SELECT * FROM transactions ORDER BY timestamp DESC", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

module.exports = router;
