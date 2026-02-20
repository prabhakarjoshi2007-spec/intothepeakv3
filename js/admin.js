/* ==========================================================================
   INTO THE PEAKS - SUPREME ADMIN ENGINE (v44.0 - STABLE)
   Location: Srinagar Garhwal | All Features Integrated
   ========================================================================== */

// 1. GLOBAL INITIALIZATION
var db = db || firebase.database();
var dbRef = dbRef || db.ref('itp_data');
var base64String = base64String || ""; 

// 2. TAB NAVIGATION & AUTO-LOADER
window.showTab = function(id, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(id);
    if(target) {
        target.classList.add('active');
        if(btn) btn.classList.add('active');
    }
    
    // Switch case for auto-loading data
    if(id === 'manageTab') window.loadInventory();
    if(id === 'bookingTab') window.loadBookings();
    if(id === 'galleryTab') window.loadAdminGallery();
    if(id === 'dashTab') window.updateDashboardStats();
};

// 3. MEDIA UTILITIES
function extractYTID(url) {
    if (!url) return "";
    // Ye regex normal videos aur shorts dono ki ID nikal lega
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
}

window.preview = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            base64String = e.target.result;
            const prevImg = document.getElementById('previewImg');
            const prevBox = document.getElementById('previewBox');
            if(prevImg) prevImg.src = e.target.result;
            if(prevBox) prevBox.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// 4. CONTENT MANAGEMENT (Save & Update)
window.saveToCloud = async function(e) {
    if(e) e.preventDefault();
    
    const typeEl = document.getElementById('type');
    const titleEl = document.getElementById('title');
    if(!typeEl || !titleEl) return alert("Error: Form elements missing!");

    const type = typeEl.value; 
    const itemId = document.getElementById('editId')?.value;

    const itemData = {
        title: titleEl.value,
        price: document.getElementById('price')?.value || 0,
        duration: document.getElementById('duration')?.value || "",
        basecamp: document.getElementById('basecamp')?.value || "",
        desc: document.getElementById('desc')?.value || "",
        content: document.getElementById('content')?.value || "",
        videoUrl: document.getElementById('videoUrl')?.value || "", 
        img: base64String || document.getElementById('imgUrl')?.value || "assets/placeholder.jpg",
        itinerary: document.getElementById('itinerary')?.value || "",
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };

    const path = type === 'tour' ? 'tours' : 'blogs';
    
    try {
        if(itemId) {
            await dbRef.child(path).child(itemId).update(itemData);
        } else {
            itemData.createdAt = firebase.database.ServerValue.TIMESTAMP;
            await dbRef.child(path).push(itemData);
        }
        alert("Pahaad Cloud Updated! 🏔️");
        location.reload();
    } catch (err) { alert("Error: " + err.message); }
};

// 5. ADVANCED GALLERY ENGINE (Photo + Video)
window.saveSupremeAlbum = async function() {
    const imgLink = document.getElementById('imgLink')?.value; 
    const ytLink = document.getElementById('ytLink')?.value;
    const title = document.getElementById('albumTitle')?.value;
    const desc = document.getElementById('albumDesc')?.value;
    const btn = document.getElementById('uploadBtn');

    if (!title || (!imgLink && !ytLink)) return alert("Bhai, Title aur Media link toh daal!");

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;

    try {
        let mediaObj = { url: imgLink || "", type: 'image' };
        
        if(ytLink) {
            const ytID = extractYTID(ytLink);
            if(ytID) mediaObj = { 
                url: `https://www.youtube.com/embed/${ytID}`, 
                thumb: `https://img.youtube.com/vi/${ytID}/maxresdefault.jpg`,
                type: 'youtube' 
            };
        }

        await dbRef.child('gallery').push({
            title, description: desc, 
            media: [mediaObj], 
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        alert("Gallery Updated! 📷");
        location.reload();
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
        btn.innerHTML = "Sync to Gallery";
    }
};

window.loadAdminGallery = function() {
    const list = document.getElementById('adminGalleryList');
    if (!list) return;
    dbRef.child('gallery').on('value', (snap) => {
        list.innerHTML = "";
        const data = snap.val();
        if(data) {
            Object.keys(data).reverse().forEach(id => {
                const item = data[id];
                list.innerHTML += `
                    <div class="booking-item">
                        <div><strong>[GALLERY]</strong> ${item.title}</div>
                        <button onclick="window.deleteFromCloud('${id}', 'gallery')" class="del-booking-btn"><i class="fas fa-trash"></i></button>
                    </div>`;
            });
        }
    });
};

// 6. BOOKING ENGINE & REVENUE ANALYTICS
window.loadBookings = function() {
    const list = document.getElementById('bookingList');
    const revDisp = document.getElementById('totalRevenueDisplay');
    if (!list) return;

    dbRef.child('bookings').on('value', (snap) => {
        const data = snap.val();
        list.innerHTML = "";
        let total = 0;
        let count = 0;

        if (data) {
            Object.keys(data).reverse().forEach(id => {
                const b = data[id];
                const amt = Number(b.totalPrice || 0);
                total += amt;
                count++;
                list.innerHTML += `
                    <div class="booking-item">
                        <div>
                            <span class="trek-tag">${b.trek}</span>
                            <div class="cust-name">${b.name}</div>
                            <div style="font-size:0.8rem; color:#666;">${b.phone} | ${new Date(b.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align:right">
                            <div class="price-display">₹${amt.toLocaleString('en-IN')}</div>
                            <button onclick="window.deleteFromCloud('${id}', 'bookings')" class="del-booking-btn" style="padding:5px 10px; font-size:0.7rem;">Delete</button>
                        </div>
                    </div>`;
            });
        }
        if(revDisp) revDisp.innerText = `₹${total.toLocaleString('en-IN')}`;
        if(document.getElementById('bookingCount')) document.getElementById('bookingCount').innerText = count;
    });
};

// 7. EXCEL EXPORT ENGINE
window.exportBookingsToExcel = function() {
    dbRef.child('bookings').once('value', (snap) => {
        const data = snap.val();
        if(!data) return alert("No bookings to export!");

        const rows = Object.keys(data).map(id => ({
            "Date": new Date(data[id].timestamp).toLocaleDateString(),
            "Customer Name": data[id].name,
            "Phone": data[id].phone,
            "Trek": data[id].trek,
            "Total Price": data[id].totalPrice,
            "Booking ID": id
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ITP Bookings");
        XLSX.writeFile(wb, `ITP_Bookings_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
};

// 8. DATA UTILITIES (Edit, Delete, Stats)
window.editItem = function(id, path) {
    dbRef.child(path).child(id).once('value', (snap) => {
        const data = snap.val();
        if(!data) return;
        window.showTab('addTab', document.querySelector('[onclick*="addTab"]'));
        
        document.getElementById('type').value = path === 'tours' ? 'tour' : 'blog';
        document.getElementById('title').value = data.title || "";
        document.getElementById('price').value = data.price || 0;
        document.getElementById('duration').value = data.duration || "";
        document.getElementById('basecamp').value = data.basecamp || "";
        document.getElementById('desc').value = data.desc || "";
        document.getElementById('content').value = data.content || "";
        document.getElementById('videoUrl').value = data.videoUrl || "";
        document.getElementById('imgUrl').value = data.img || "";
        document.getElementById('itinerary').value = data.itinerary || "";

        let editIdInput = document.getElementById('editId') || document.createElement('input');
        editIdInput.type = 'hidden'; editIdInput.id = 'editId';
        if(!document.getElementById('editId')) document.getElementById('tourForm').appendChild(editIdInput);
        editIdInput.value = id;
        
        document.querySelector('#tourForm button').innerText = "Update Record";
        window.scrollTo(0,0);
    });
};

window.deleteFromCloud = async function(id, path) {
    if(confirm("Bhai, pakka uda doon? Ye permanently chala jayega!")) {
        try {
            await dbRef.child(path).child(id).remove();
            alert("Uda diya gaya! ✅");
        } catch(e) { alert("Delete failed: " + e.message); }
    }
};

window.loadInventory = function() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    dbRef.on('value', (snap) => {
        const val = snap.val();
        list.innerHTML = "";
        if (val) {
            ['tours', 'blogs'].forEach(path => {
                if(val[path]) {
                    Object.keys(val[path]).forEach(id => {
                        const item = val[path][id];
                        list.innerHTML += `
                            <div class="booking-item">
                                <div><strong>[${path.toUpperCase()}]</strong> ${item.title}</div>
                                <div class="action-btns">
                                    <button onclick="window.editItem('${id}', '${path}')" class="edit-btn">Edit</button>
                                    <button onclick="window.deleteFromCloud('${id}', '${path}')" class="del-booking-btn">Delete</button>
                                </div>
                            </div>`;
                    });
                }
            });
        }
    });
};

// Initialize Global Analytics
window.updateDashboardStats = function() {
    dbRef.once('value', (snap) => {
        const val = snap.val();
        if(val) {
            const tourCount = val.tours ? Object.keys(val.tours).length : 0;
            const blogCount = val.blogs ? Object.keys(val.blogs).length : 0;
            if(document.getElementById('trekTotal')) document.getElementById('trekTotal').innerText = tourCount;
            if(document.getElementById('inventoryCount')) document.getElementById('inventoryCount').innerText = tourCount + blogCount;
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    window.updateDashboardStats();
    window.loadInventory();
});