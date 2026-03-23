const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up SQLite database
const dbPath = path.join(__dirname, 'rsvp.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS rsvps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            food TEXT NOT NULL,
            dietary_restrictions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// API endpoint to submit RSVP
app.post('/api/rsvp', (req, res) => {
    const { name, student_id, food, dietary_restrictions } = req.body;
    
    // Validate required fields
    if (!name || !student_id || !food) {
        return res.status(400).json({ error: 'Name, Student ID, and Food are required fields.' });
    }

    const query = `INSERT INTO rsvps (name, student_id, food, dietary_restrictions) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, student_id, food, dietary_restrictions], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Failed to save RSVP. Please try again later.' });
        }
        res.status(201).json({ success: true, id: this.lastID });
    });
});

// API endpoint to retrieve all RSVPs
app.get('/api/rsvps', (req, res) => {
    const query = `SELECT name, food FROM rsvps ORDER BY created_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve RSVPs.' });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
