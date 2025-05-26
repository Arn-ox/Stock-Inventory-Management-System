const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'smartpark-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SIMS'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.userId = user.user_id;
        req.session.username = user.username;
        res.json({ message: 'Login successful', username: user.username });
    });
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check authentication status
app.get('/api/auth/check', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Spare Parts routes
app.get('/api/spare-parts', requireAuth, (req, res) => {
    db.query('SELECT * FROM Spare_Part ORDER BY created_at DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/spare-parts', requireAuth, (req, res) => {
    const { Name, Category, Quantity, UnitPrice } = req.body;

    // Validate Name field to only contain letters and spaces
    const lettersOnlyRegex = /^[a-zA-Z\s]+$/;
    if (!lettersOnlyRegex.test(Name)) {
        return res.status(400).json({ message: 'Part Name must contain only letters and spaces' });
    }

    const TotalPrice = Quantity * UnitPrice;

    db.query(
        'INSERT INTO Spare_Part (Name, Category, Quantity, UnitPrice, TotalPrice) VALUES (?, ?, ?, ?, ?)',
        [Name, Category, Quantity, UnitPrice, TotalPrice],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            res.json({ message: 'Spare part added successfully', id: result.insertId });
        }
    );
});

// Stock In routes
app.get('/api/stock-in', requireAuth, (req, res) => {
    db.query(`
        SELECT si.*, sp.Name as spare_part_name
        FROM Stock_In si
        JOIN Spare_Part sp ON si.spare_part_id = sp.spare_part_id
        ORDER BY si.created_at DESC
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/stock-in', requireAuth, (req, res) => {
    const { spare_part_id, StockInQuantity, StockInDate } = req.body;

    // Insert stock in record
    db.query(
        'INSERT INTO Stock_In (spare_part_id, StockInQuantity, StockInDate) VALUES (?, ?, ?)',
        [spare_part_id, StockInQuantity, StockInDate],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            // Update spare part quantity
            db.query(
                'UPDATE Spare_Part SET Quantity = Quantity + ? WHERE spare_part_id = ?',
                [StockInQuantity, spare_part_id],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ message: 'Failed to update spare part quantity' });
                    }
                    res.json({ message: 'Stock in recorded successfully' });
                }
            );
        }
    );
});

// Stock Out routes
app.get('/api/stock-out', requireAuth, (req, res) => {
    db.query(`
        SELECT so.*, sp.Name as spare_part_name
        FROM Stock_Out so
        JOIN Spare_Part sp ON so.spare_part_id = sp.spare_part_id
        ORDER BY so.created_at DESC
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/stock-out', requireAuth, (req, res) => {
    const { spare_part_id, StockOutQuantity, StockOutUnitPrice, StockOutDate } = req.body;
    const StockOutTotalPrice = StockOutQuantity * StockOutUnitPrice;

    // Check if enough stock available
    db.query('SELECT Quantity FROM Spare_Part WHERE spare_part_id = ?', [spare_part_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Spare part not found' });
        }

        const currentQuantity = results[0].Quantity;
        if (currentQuantity < StockOutQuantity) {
            return res.status(400).json({ message: 'Insufficient stock quantity' });
        }

        // Insert stock out record
        db.query(
            'INSERT INTO Stock_Out (spare_part_id, StockOutQuantity, StockOutUnitPrice, StockOutTotalPrice, StockOutDate) VALUES (?, ?, ?, ?, ?)',
            [spare_part_id, StockOutQuantity, StockOutUnitPrice, StockOutTotalPrice, StockOutDate],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }

                // Update spare part quantity
                db.query(
                    'UPDATE Spare_Part SET Quantity = Quantity - ? WHERE spare_part_id = ?',
                    [StockOutQuantity, spare_part_id],
                    (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({ message: 'Failed to update spare part quantity' });
                        }
                        res.json({ message: 'Stock out recorded successfully' });
                    }
                );
            }
        );
    });
});

app.put('/api/stock-out/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { spare_part_id, StockOutQuantity, StockOutUnitPrice, StockOutDate } = req.body;
    const StockOutTotalPrice = StockOutQuantity * StockOutUnitPrice;

    db.query(
        'UPDATE Stock_Out SET spare_part_id = ?, StockOutQuantity = ?, StockOutUnitPrice = ?, StockOutTotalPrice = ?, StockOutDate = ? WHERE stock_out_id = ?',
        [spare_part_id, StockOutQuantity, StockOutUnitPrice, StockOutTotalPrice, StockOutDate, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            res.json({ message: 'Stock out updated successfully' });
        }
    );
});

app.delete('/api/stock-out/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM Stock_Out WHERE stock_out_id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Stock out deleted successfully' });
    });
});

// Reports routes
app.get('/api/reports/daily-stock-out', requireAuth, (req, res) => {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    db.query(`
        SELECT so.*, sp.Name as spare_part_name, sp.Category
        FROM Stock_Out so
        JOIN Spare_Part sp ON so.spare_part_id = sp.spare_part_id
        WHERE DATE(so.StockOutDate) = ?
        ORDER BY so.StockOutDate DESC
    `, [reportDate], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/reports/stock-status', requireAuth, (req, res) => {
    db.query(`
        SELECT
            sp.Name as spare_part_name,
            sp.Quantity as stored_quantity,
            COALESCE(SUM(so.StockOutQuantity), 0) as total_stock_out,
            sp.Quantity as remaining_quantity,
            sp.Category,
            sp.UnitPrice
        FROM Spare_Part sp
        LEFT JOIN Stock_Out so ON sp.spare_part_id = so.spare_part_id
        GROUP BY sp.spare_part_id, sp.Name, sp.Quantity, sp.Category, sp.UnitPrice
        ORDER BY sp.Name
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
