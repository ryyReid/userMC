// Load skins on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('skins-gallery')) {
        loadSkins();
    }
    
    const skinForm = document.getElementById('skinForm');
    if (skinForm) {
        skinForm.addEventListener('submit', handleSkinUpload);
    }
});

// Load and display skins from skins.json
async function loadSkins() {
    try {
        const response = await fetch('/api/skins');
        const skins = await response.json();
        
        const gallery = document.getElementById('skins-gallery');
        gallery.innerHTML = '';
        
        if (skins.length === 0) {
            gallery.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No skins uploaded yet.</p>';
            return;
        }
        
        skins.forEach(skin => {
            const skinCard = document.createElement('div');
            skinCard.className = 'skin-card';
            skinCard.innerHTML = `
                <img src="/uploads/${skin.filename}" alt="${skin.name}">
                <h3>${skin.name}</h3>
                <p>Uploaded: ${new Date(skin.uploadedAt).toLocaleDateString()}</p>
            `;
            gallery.appendChild(skinCard);
        });
    } catch (error) {
        console.error('Error loading skins:', error);
    }
}

// Handle skin upload
async function handleSkinUpload(e) {
    e.preventDefault();
    
    const skinName = document.getElementById('skinName').value;
    const skinFile = document.getElementById('skinFile').files[0];
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!skinName || !skinFile) {
        statusDiv.textContent = 'Please fill in all fields.';
        statusDiv.className = 'error';
        return;
    }
    
    const formData = new FormData();
    formData.append('name', skinName);
    formData.append('file', skinFile);
    
    try {
        statusDiv.textContent = 'Uploading...';
        statusDiv.className = '';
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            statusDiv.textContent = 'Skin uploaded successfully!';
            statusDiv.className = 'success';
            document.getElementById('skinForm').reset();
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            statusDiv.textContent = `Error: ${result.error}`;
            statusDiv.className = 'error';
        }
    } catch (error) {
        statusDiv.textContent = `Error uploading skin: ${error.message}`;
        statusDiv.className = 'error';
    }
}
