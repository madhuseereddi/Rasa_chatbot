const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('./customer.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create the `customer` table
db.run(`
    CREATE TABLE IF NOT EXISTS customer (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_number TEXT NOT NULL,
        order_status TEXT NOT NULL,
        location TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Customer table is ready');
    }
});

// POST: Add a new customer order
app.post('/customers', (req, res) => {
    const { customer_name, customer_number, order_status, location } = req.body;
    const query = `INSERT INTO customer (customer_name, customer_number, order_status, location) VALUES (?, ?, ?, ?)`;

    db.run(query, [customer_name, customer_number, order_status, location], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'Order created successfully', order_id: this.lastID });
        }
    });
});

// GET: Retrieve all customer records
app.get('/customers', (req, res) => {
    const query = `SELECT * FROM customer`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

// PUT: Update a customer order
app.put('/customers/:order_id', (req, res) => {
    const { order_id } = req.params;
    const { customer_name, customer_number, order_status, location } = req.body;

    const query = `
        UPDATE customer
        SET customer_name = ?, customer_number = ?, order_status = ?, location = ?
        WHERE order_id = ?
    `;

    db.run(query, [customer_name, customer_number, order_status, location, order_id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Order not found' });
        } else {
            res.status(200).json({ message: 'Order updated successfully' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
