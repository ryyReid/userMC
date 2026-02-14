const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// This allows the server to handle the large image strings (DataURLs)
app.use(express.json({ limit: '50mb' })); 
app.use(express.static('.')); 

const DB_PATH = path.join(__dirname, 'skins.json');

// Helper to read the JSON file
const getSkins = () => {
    if (!fs.existsSync(DB_PATH)) return [];
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
};

// 1. Get all skins from the database
app.get('/api/skins', (req, res) => {
    res.json(getSkins());
});

// 2. Add a new skin to the database
app.post('/api/skins', (req, res) => {
    const skins = getSkins();
    const newSkin = { 
        ...req.body, 
        id: Date.now() // Give it a unique ID
    };
    skins.unshift(newSkin); // Add to the start of the list
    fs.writeFileSync(DB_PATH, JSON.stringify(skins, null, 2));
    res.status(201).json(newSkin);
});

// 3. Delete a skin by ID
app.delete('/api/skins/:id', (req, res) => {
    let skins = getSkins();
    const skinId = parseInt(req.params.id);
    skins = skins.filter(s => s.id !== skinId);
    fs.writeFileSync(DB_PATH, JSON.stringify(skins, null, 2));
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`🚀 Database server running at http://localhost:${PORT}`);
});