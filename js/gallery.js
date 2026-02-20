/* ==========================================================================
   INTO THE PEAKS - SUPREME GALLERY ENGINE (v36.5)
   Features: Insta-Style Lightbox, YT Error 153 Fix, Auto-Description
   ========================================================================== */

// 1. Firebase Initialization (Using window to avoid redeclaration)
if (!firebase.apps.length) {
    const firebaseConfig = {
        databaseURL: "https://intothepeaks-c706d-default-rtdb.asia-southeast1.firebasedatabase.app",
    };
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. Load Gallery from Firebase
function loadGallery() {
    const grid = document.getElementById('itpGalleryGrid');
    if (!grid) return;

    database.ref('itp_data/gallery').on('value', (snap) => {
        const data = snap.val();
        grid.innerHTML = "";
        
        if (data) {
            Object.keys(data).reverse().forEach(id => {
                const item = data[id];
                const main = item.media[0];
                const thumb = main.type === 'youtube' ? main.thumbnail : main.url;
                const badge = main.type === 'youtube' ? '<div class="yt-badge"><i class="fab fa-youtube"></i> VIDEO</div>' : '';

                // Stringify the item to pass into the lightbox function
                const itemString = encodeURIComponent(JSON.stringify(item));

                grid.innerHTML += `
                    <div class="insta-item" onclick="openBox('${itemString}')">
                        ${badge}
                        <img src="${thumb}" loading="lazy" alt="${item.title}">
                        <div class="insta-overlay"><i class="fas fa-expand-arrows-alt"></i></div>
                    </div>
                `;
            });
        } else {
            grid.innerHTML = "<div style='grid-column:1/-1; text-align:center; padding:50px;'>Abhi koi memories nahi hain. 🏔️</div>";
        }
    });
}

// 3. Open Box with YT Error 153 Fix
window.openBox = function(itemData) {
    const item = JSON.parse(decodeURIComponent(itemData));
    const main = item.media[0];
    const box = document.getElementById('itpLightbox');
    const mediaBox = document.getElementById('mediaBox');
    
    // Set Description & Title
    document.getElementById('lTitle').innerText = item.title;
    document.getElementById('lDesc').innerText = item.description || "Exploring the soul of Srinagar Garhwal.";
    
    if (main.type === 'youtube') {
        // --- CLEAN YOUTUBE ID EXTRACTION ---
        let videoId = "";
        const url = main.url;
        if(url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
        } else if(url.includes('v=')) {
            videoId = url.split('v=')[1].split(/[&?#]/)[0];
        } else {
            videoId = url.split('embed/')[1]?.split(/[?#]/)[0] || "";
        }

        // --- PREVENT ERROR 153: ADD ORIGIN & SECURE EMBED ---
        const origin = window.location.origin;
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${origin}`;

        mediaBox.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>`;
    } else {
        // Standard Image Load
        mediaBox.innerHTML = `<img src="${main.url}" style="width:100%; height:100%; object-fit:contain;">`;
    }
    
    box.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Stop background scrolling
};

// 4. Close Lightbox
window.closeBox = function() {
    const box = document.getElementById('itpLightbox');
    const mediaBox = document.getElementById('mediaBox');
    if(box) box.style.display = 'none';
    if(mediaBox) mediaBox.innerHTML = ""; // This stops the YouTube video sound
    document.body.style.overflow = 'auto'; // Enable scrolling again
};

// 5. Start the Engine
document.addEventListener('DOMContentLoaded', loadGallery);