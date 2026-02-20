/**
 * INTO THE PEAKS - SUPREME MASTER ENGINE (v20.0 - ULTIMATE)
 * Status: MISSION READY | Location: Srinagar Garhwal
 * Features: Brute-Force Content Mapping, Anti-Crash Loop, WhatsApp v3.0
 */

/* ==========================================
    1. GLOBAL CONFIGURATION
=========================================== */
const AppConfig = {
    brandName: "IntoThePeaks",
    supportNumber: "918057608837",
    adminID: "Gammi",
    adminKey: "BOSS",
    basecampDefault: "Srinagar Garhwal, Uttarakhand",
    placeholders: {
        img: "assets/placeholder.jpg",
        desc: "Mountain stories and adventures are being synchronized... Stay tuned."
    }
};

let activeTrekName = "";
let activeTrekPrice = 0;
let cloudDB;
let launchLock = false; // The Crash Guard

/* ==========================================
    2. THE CORE ENGINE INITIALIZER
=========================================== */
document.addEventListener('DOMContentLoaded', () => {
    console.log("ITP v20.0: Engine Ignition...");

    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        cloudDB = firebase.database();
    } else {
        console.error("ITP Error: Firebase Connection Failed.");
        return; 
    }

    const path = window.location.pathname.toLowerCase();
    
    // Sub-System Activation
    initNavbarDynamics();
    initMobileSystem();
    initAdminGatekeeper();
    injectGlobalStyles();
    
    // Launch Data Sync
    initMasterCloudSync(path);

    // Form Listener
    const bookingForm = document.getElementById('trekBookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmission);
    }
});

/* ==========================================
    3. SMART CLOUD SYNC (ANTI-LOOP)
=========================================== */
async function initMasterCloudSync(path) {
    if(!cloudDB || launchLock) return;

    try {
        // FETCH ONCE: Fixes the 'page closing within a sec' crash
        const snapshot = await cloudDB.ref('itp_data').once('value');
        const cloudData = snapshot.val();
        
        if (!cloudData) return;

        const isHome = path === "/" || path.includes("index") || path === "" || path.endsWith("/");
        const isPackages = path.includes("packages");
        const isItinerary = path.includes("itinerary");
        const isBlogs = path.includes("blogs.html");
        const isBlogDetail = path.includes("blog-detail");

        // UI Routing Logic
        if ((isHome || isPackages) && cloudData.tours) {
            renderTreks(Object.entries(cloudData.tours), 'journeyDisplay', isHome ? 3 : 100);
        }
        
        if ((isHome || isBlogs) && cloudData.blogs) {
            renderBlogs(Object.entries(cloudData.blogs), 'blogDisplay', isHome ? 3 : 100);
        }

        if (isItinerary && cloudData.tours) {
            renderItinerarySystem(Object.entries(cloudData.tours));
        }

        if (isBlogDetail && cloudData.blogs) {
            renderBlogDetailSystem(cloudData.blogs);
        }

        launchLock = true; 
        console.log("ITP v20.0: Core Synchronized.");

    } catch (err) {
        console.error("ITP Kernel Panic:", err);
    }
}

/* ==========================================
    4. RENDERERS (ERROR PROOFING)
=========================================== */

function renderTreks(toursEntries, targetId, limit) {
    const container = document.getElementById(targetId);
    if (!container) return;
    const sorted = [...toursEntries].reverse();

    container.innerHTML = sorted.slice(0, limit).map(([id, trek]) => {
        const cleanPrice = String(trek.price || 0).replace(/[^0-9]/g, "");
        const safeTitle = (trek.title || "Adventure").replace(/'/g, "\\'"); 
        const trekImg = trek.img || trek.image || AppConfig.placeholders.img;

        return `
        <div class="package-card" style="background:#fff; border-radius:25px; overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.05); margin-bottom:30px; border:1px solid #eee;">
            <div style="position:relative; height:280px; overflow:hidden;">
                <img src="${trekImg}" style="width:100%; height:100%; object-fit:cover;">
                <div style="position:absolute; top:20px; right:20px; background:rgba(30,30,45,0.95); color:#FFB800; padding:10px 22px; border-radius:50px; font-weight:800;">₹${Number(cleanPrice).toLocaleString('en-IN')}</div>
            </div>
            <div style="padding:30px;">
                <h3 style="margin-bottom:12px; font-size:1.6rem;">${trek.title || 'Quest'}</h3>
                <p style="color:#666; font-size:0.95rem; line-height:1.6;">${trek.desc ? trek.desc.substring(0, 95) : AppConfig.placeholders.desc}...</p>
                <div style="display:flex; gap:15px; margin-top:25px;">
                    <a href="itinerary.html?id=${id}" style="flex:1.2; background:#1E1E2D; color:#fff; text-align:center; padding:15px; border-radius:14px; text-decoration:none; font-weight:700;">Details</a>
                    <button onclick="openBookingDirect('${safeTitle}', '${cleanPrice}')" style="flex:1; background:#FFB800; border:none; padding:15px; border-radius:14px; font-weight:800; cursor:pointer;">Reserve</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderBlogs(blogsEntries, targetId, limit) {
    const container = document.getElementById(targetId);
    if (!container) return;
    const sorted = [...blogsEntries].reverse();

    container.innerHTML = sorted.slice(0, limit).map(([id, blog]) => {
        const blogImg = blog.img || blog.image || AppConfig.placeholders.img;
        const blogText = blog.desc || blog.content || blog.shortDesc || "Mountain guides are sharing their tales from the trail.";

        return `
        <div class="story-card" style="background:#fff; border-radius:25px; overflow:hidden; border:1px solid #eee; margin-bottom:20px;">
            <img src="${blogImg}" style="width:100%; height:220px; object-fit:cover;">
            <div style="padding:25px;">
                <h3 style="font-weight:800; margin-bottom:12px;">${blog.title || 'Untitled'}</h3>
                <p style="color:#666; font-size:0.9rem;">${blogText.substring(0, 85)}...</p>
                <a href="blog-detail.html?id=${id}" style="display:inline-block; margin-top:18px; color:#1E1E2D; font-weight:700; text-decoration:none; border-bottom:3px solid #FFB800;">Read Story</a>
            </div>
        </div>`;
    }).join('');
}

/* ==========================================
    5. BRUTE-FORCE CONTENT MAPPING (THE BIG FIX)
=========================================== */

function renderBlogDetailSystem(blogs) {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get('id');
    
    // Database se specific blog nikaalo
    const blog = blogs[blogId];

    if (blog) {
        console.log("ITP Debug: Raw Blog Data Received:", blog);

        const titleEl = document.getElementById('title');
        const contentEl = document.getElementById('content');
        const heroImgEl = document.getElementById('heroImg');

        // 1. Title Fix
        if(titleEl) titleEl.innerText = blog.title || blog.officialTitle || "Himalayan Story";
        
        // 2. THE CONTENT FIX (Checking every possible field name)
        // Ye line dhyaan se dekh, isme saare possible field names cover kiye hain
        let rawContent = blog.fullContent || blog.content || blog.desc || blog.description || blog.blogBody || blog.body || blog.text || "";
        
        if(contentEl) {
            if(rawContent && rawContent.length > 5) {
                // Agar data mein '|' pipe hai toh paragraphs bana do, varna seedha dikhao
                contentEl.innerHTML = rawContent.replace(/\|/g, '<br><br>');
            } else {
                contentEl.innerText = "The trail notes for this journey are being finalized at the basecamp. Please check back soon!";
            }
        }
        
        // 3. Image Fix
        const blogImg = blog.img || blog.image || blog.banner || 'assets/placeholder.jpg';
        if(heroImgEl) heroImgEl.src = blogImg;

        // 4. Video Engine Fix
        const mediaBox = document.getElementById('blogMediaBox');
        if (mediaBox) {
            const vidUrl = blog.videoUrl || blog.video || blog.youtube;
            if (vidUrl && vidUrl.length > 5) {
                let vID = "";
                try {
                    if(vidUrl.includes('v=')) vID = vidUrl.split('v=')[1].split('&')[0];
                    else if(vidUrl.includes('shorts/')) vID = vidUrl.split('shorts/')[1].split('?')[0];
                    else vID = vidUrl.split('/').pop().split('?')[0];
                    
                    mediaBox.innerHTML = `<iframe src="https://www.youtube.com/embed/${vID}" style="width:100%; height:100%; border:none; border-radius:20px;" allowfullscreen></iframe>`;
                } catch(e) {
                    mediaBox.innerHTML = `<img src="${blogImg}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
                }
            } else {
                mediaBox.innerHTML = `<img src="${blogImg}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
            }
        }
    } else {
        console.error("ITP Error: Blog ID not found in database.");
        if(document.getElementById('content')) document.getElementById('content').innerText = "Trail lost! Story not found.";
    }
}

function renderItinerarySystem(toursEntries) {
    const params = new URLSearchParams(window.location.search);
    const trekId = params.get('id');
    const trekEntry = toursEntries.find(([id, t]) => id === trekId);
    if (!trekEntry) return;
    const trek = trekEntry[1];

    activeTrekName = trek.title || "Himalayan Trip";
    activeTrekPrice = Number(String(trek.price || 0).replace(/[^0-9]/g, ""));

    const elements = {
        'trekTitle': trek.title,
        'trekPrice': `₹${activeTrekPrice.toLocaleString('en-IN')}`,
        'trekDesc': trek.desc || trek.content,
        'trekBasecamp': trek.basecamp || AppConfig.basecampDefault
    };

    Object.entries(elements).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    });

    const hero = document.getElementById('packageHero');
    if (hero && (trek.img || trek.image)) hero.style.backgroundImage = `url('${trek.img || trek.image}')`;

    const container = document.getElementById('timelineDisplay');
    if (container && trek.itinerary) {
        container.innerHTML = trek.itinerary.split('|').map((content, i) => `
            <div class="acc-item ${i === 0 ? 'active' : ''}" onclick="toggleAccordionITP(this)" style="margin-bottom:15px; border:1px solid #eee; border-radius:15px; background:#fff; overflow:hidden;">
                <div style="cursor:pointer; padding:20px; font-weight:800; display:flex; justify-content:space-between; align-items:center; background:#fafafa;">
                    <div><span style="background:#FFB800; padding:4px 12px; border-radius:6px; font-size:0.75rem; margin-right:12px;">DAY ${i + 1}</span> ACTIVITY</div>
                    <i class="fas fa-chevron-down" style="opacity:0.5;"></i>
                </div>
                <div class="acc-content" style="padding:25px; color:#555; display:${i === 0 ? 'block' : 'none'}; border-top:1px solid #eee; line-height:1.8;">${content.trim()}</div>
            </div>`).join('');
    }
}

/* ==========================================
    6. WHATSAPP & UI INTERNALS
=========================================== */
function handleFormSubmission(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const group = document.getElementById('groupSize').value || 1;
    const date = document.getElementById('trekDate').value;
    const total = group * activeTrekPrice;

    const message = `🏔️ *NEW RESERVATION - ITP*\n\n📍 *Adventure:* ${activeTrekName}\n👤 *Customer:* ${name}\n📱 *Phone:* ${phone}\n👥 *Group:* ${group} Person(s)\n📅 *Date:* ${date}\n💰 *Total:* ₹${total.toLocaleString('en-IN')}`;

    const waLink = `https://wa.me/${AppConfig.supportNumber}?text=${encodeURIComponent(message)}`;
    
    cloudDB.ref('itp_data/bookings').push({
        name, trek: activeTrekName, totalPrice: total, group, phone, date, 
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        window.open(waLink, '_blank');
        closeBooking();
    });
}

window.openBookingDirect = (name, price) => {
    activeTrekName = name;
    activeTrekPrice = Number(price);
    const modal = document.getElementById('bookingModal');
    if (modal) {
        if(document.getElementById('trekTitleModal')) document.getElementById('trekTitleModal').innerText = name;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.handleItineraryBooking = () => {
    const n = document.getElementById('trekTitle')?.innerText || activeTrekName;
    const p = document.getElementById('trekPrice')?.innerText || "0";
    openBookingDirect(n, p.replace(/[^0-9]/g, ""));
};

window.closeBooking = () => {
    const modal = document.getElementById('bookingModal');
    if(modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.toggleAccordionITP = (el) => {
    const content = el.querySelector('.acc-content');
    const isActive = content.style.display === 'block';
    document.querySelectorAll('.acc-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('active'));
    if (!isActive) {
        content.style.display = 'block';
        el.classList.add('active');
    }
};

function initNavbarDynamics() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (!nav) return;
        window.scrollY > 60 ? (nav.style.background = "#1E1E2D", nav.style.height = "75px") : (nav.style.background = "transparent", nav.style.height = "90px");
    });
}

function initMobileSystem() {
    window.togglePeaksMenu = () => {
        const menu = document.getElementById('mainMenu');
        if (menu) menu.classList.toggle('active');
    };
}

function initAdminGatekeeper() {
    const trigger = document.getElementById('adminTrigger');
    if (trigger) {
        trigger.addEventListener('dblclick', () => {
            if (prompt("Admin ID:") === AppConfig.adminID && prompt("Key:") === AppConfig.adminKey) {
                window.location.href = 'admin.html';
            }
        });
    }
}

function injectGlobalStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        .acc-item.active { border-color: #FFB800 !important; }
        .nav-links.active { display: flex !important; right: 0 !important; }
        .scrolled { background: #1E1E2D !important; }
    `;
    document.head.appendChild(style);
}