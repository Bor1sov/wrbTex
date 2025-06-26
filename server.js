const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
// Database setup
const db = new sqlite3.Database('./portfolio.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Projects table with UUID as primary key
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            technologies TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Messages table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT 0
        )`);

        // Visits table
        db.run(`CREATE TABLE IF NOT EXISTS visits (
            id TEXT PRIMARY KEY,
            ip_address TEXT,
            user_agent TEXT,
            visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert sample data if empty
        db.get("SELECT count(*) as count FROM projects", (err, row) => {
            if (err) throw err;
            if (row.count === 0) {
                const stmt = db.prepare(
                    "INSERT INTO projects (id, title, description, technologies, image_url) VALUES (?, ?, ?, ?, ?)"
                );
                stmt.run(uuidv4(), "Путешествия по России", "Описание проекта 1", "HTML, CSS, JS", "/assets/project1.jpg");
                stmt.run(uuidv4(), "Магазин техники", "Описание проекта 2", "React, Node.js", "/assets/project2.jpg");
                stmt.finalize();
            }
        });
    });
}

// API Routes

// Get all projects
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM projects ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM projects WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(row);
    });
});

// Create project
app.post('/api/projects', (req, res) => {
    const { title, description, technologies, image_url } = req.body;
    if (!title || !technologies) {
        return res.status(400).json({ error: "Title and technologies are required" });
    }

    const id = uuidv4();
    db.run(
        "INSERT INTO projects (id, title, description, technologies, image_url) VALUES (?, ?, ?, ?, ?)",
        [id, title, description, technologies, image_url],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id });
        }
    );
});

// Update project
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, technologies, image_url } = req.body;

    db.run(
        "UPDATE projects SET title = ?, description = ?, technologies = ?, image_url = ? WHERE id = ?",
        [title, description, technologies, image_url, id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Project not found" });
            }
            res.json({ success: true });
        }
    );
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM projects WHERE id = ?", [id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json({ success: true });
    });
});

// Contact form
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email and message are required" });
    }

    const id = uuidv4();
    db.run(
        "INSERT INTO messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)",
        [id, name, email, subject, message],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            
            // Track visit
            db.run(
                "INSERT INTO visits (id, ip_address, user_agent) VALUES (?, ?, ?)",
                [uuidv4(), req.ip, req.get('User-Agent')],
                () => {}
            );
            
            res.status(201).json({ success: true });
        }
    );
});

// Statistics
app.get('/api/statistics', (req, res) => {
    db.get("SELECT COUNT(*) as total_visits FROM visits", [], (err, visits) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        
        db.get("SELECT COUNT(*) as unread_messages FROM messages WHERE is_read = 0", [], (err, messages) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            
            res.json({
                total_visits: visits.total_visits,
                unread_messages: messages.unread_messages
            });
        });
    });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});