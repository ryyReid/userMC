const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only PNG files are allowed'));
        }
    }
});

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Load skins from JSON
function loadSkins() {
    const skinsFile = path.join(__dirname, 'skins.json');
    if (fs.existsSync(skinsFile)) {
        const data = fs.readFileSync(skinsFile, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Save skins to JSON
function saveSkins(skins) {
    const skinsFile = path.join(__dirname, 'skins.json');
    fs.writeFileSync(skinsFile, JSON.stringify(skins, null, 2));
}

// API Routes

// Get all skins
app.get('/api/skins', (req, res) => {
    try {
        const skins = loadSkins();
        res.json(skins);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load skins' });
    }
});

// Upload a skin
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.body.name) {
            // Delete the uploaded file if no name provided
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Skin name is required' });
        }

        const skins = loadSkins();
        const newSkin = {
            id: Date.now(),
            name: req.body.name,
            filename: req.file.filename,
            uploadedAt: new Date().toISOString()
        };

        skins.push(newSkin);
        saveSkins(skins);

        res.json({ success: true, skin: newSkin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a skin
app.delete('/api/skins/:id', (req, res) => {
    try {
        const skins = loadSkins();
        const skinIndex = skins.findIndex(s => s.id === parseInt(req.params.id));

        if (skinIndex === -1) {
            return res.status(404).json({ error: 'Skin not found' });
        }

        const skin = skins[skinIndex];
        const filePath = path.join(uploadsDir, skin.filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        skins.splice(skinIndex, 1);
        saveSkins(skins);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Minecraft Skin Site running on http://localhost:${PORT}`);
});
