// إعدادات الربط - الخطوة الأولى: تغيير الروابط من محلي إلى سحابي هنا
const CONFIG = {
    // استبدل 'localhost' برابط الـ API أو Firebase الفعلي عند الرفع
    DATABASE_URL: "https://your-project-id.firebaseio.com", 
    ADMIN_TOKEN: "20obaida44" // يفضل مستقبلاً وضعها في متغيرات بيئة (Environment Variables)
};

// جلب البيانات (ملاحظة: حالياً نستخدم localStorage، للإنتاج يجب الربط بـ CONFIG.DATABASE_URL)
let storedData = localStorage.getItem('my_apps_store');
let appsDatabase = storedData ? JSON.parse(storedData) : [];

// نظام التعليقات
let storedComments = localStorage.getItem('my_apps_comments');
let commentsDatabase = storedComments ? JSON.parse(storedComments) : [];

// كلمات محظورة للفلترة التلقائية
const bannedWords = ["مسيء", "سيء", "خداع", "فايروس", "كذب"];

let currentCategory = 'برامج وتطبيقات الكمبيوتر'; // تتبع القسم الحالي

let isAdminMode = sessionStorage.getItem('isAdminSession') === 'true'; // استعادة حالة الإدارة
let currentUser = JSON.parse(localStorage.getItem('user_profile')) || null; // بيانات المستخدم العادي
const isDeviceBanned = localStorage.getItem('site_blacklist') === 'true'; // فحص الحظر النهائي

// قائمة التطبيقات الافتراضية المطلوب تواجدها دائماً
const defaultApps = [
    {
        id: 1,
        name: "تحميل كوكل كروم للكمبيوتر",
        category: "برامج وتطبيقات الكمبيوتر", 
        size: "120 MB",
        version: "أحدث إصدار",
        desc: "يعتبر متصفح جوجل كروم المتصفح الأكثر سرعة وأماناً وتوافقاً مع معايير الويب الحديثة، مما يوفر تجربة تصفح مثالية لمستخدمي الكمبيوتر.",
        downloadLink: "https://www.google.com/chrome/",
        publishDate: "2024-01-01", // تاريخ قديم حتى لا يظهر في "الجديدة"
        icon: "https://cdn.icon-icons.com/icons2/2107/PNG/512/google_chrome_icon_134011.png"
    },
    {
        id: 2,
        name: "WinRAR",
        category: "برامج وتطبيقات الكمبيوتر",
        size: "5 MB",
        version: "أحدث إصدار",
        desc: "برنامج WinRAR لفك ضغط الملفات هو أداة قوية وموثوقة لإدارة الملفات المضغوطة، ويدعم العديد من التنسيقات مثل RAR وZIP.",
        downloadLink: "https://www.win-rar.com/download.html",
        publishDate: "2024-01-01",
        icon: "https://cdn.icon-icons.com/icons2/2699/PNG/512/winrar_logo_icon_168864.png"
    },
    {
        id: 3,
        name: "تحميل مشغل الوسائط VLC",
        category: "برامج وتطبيقات الكمبيوتر",
        size: "40 MB",
        version: "3.0.20",
        desc: "VLC هو مشغل وسائط حر ومفتوح المصدر، قادر على تشغيل معظم ملفات الوسائط بالإضافة إلى الأقراص المدمجة وبروتوكولات البث.",
        downloadLink: "https://www.videolan.org/vlc/",
        publishDate: "2024-01-01",
        icon: "https://cdn.icon-icons.com/icons2/2699/PNG/512/vlc_media_player_logo_icon_168661.png"
    },
    {
        id: 4,
        name: "Internet Download Manager",
        category: "برامج وتطبيقات الكمبيوتر",
        size: "10 MB",
        version: "6.42",
        desc: "أداة قوية لزيادة سرعات التنزيل حتى 5 مرات، واستئناف التنزيلات المجدولة وتنظيمها.",
        downloadLink: "https://www.internetdownloadmanager.com/download.html",
        publishDate: new Date().toISOString(), // هذا سيظهر في قسم البرامج الجديدة
        icon: "https://cdn.icon-icons.com/icons2/2368/PNG/512/internet_download_manager_idm_icon_143714.png"
    },
    {
        id: 5,
        name: "Windows 11 Pro 23H2",
        category: "أنظمة تشغيل الكمبيوتر",
        size: "5.4 GB",
        version: "23H2 الرسمي",
        desc: "أحدث إصدار من نظام تشغيل ويندوز 11، يتضمن كافة التحديثات الأمنية والميزات الجديدة مع واجهة عصرية وسرعة فائقة في الأداء.",
        downloadLink: "https://www.microsoft.com/software-download/windows11",
        publishDate: new Date().toISOString(),
        icon: "https://cdn-icons-png.flaticon.com/512/732/732221.png"
    },
    {
        id: 6,
        name: "تعريف كرت الشاشة NVIDIA",
        category: "تعاريف الحاسوب",
        size: "650 MB",
        version: "v551.23",
        desc: "التعريف الرسمي لبطاقات الرسوميات NVIDIA GeForce، لضمان أفضل أداء للألعاب وبرامج التصميم الجرافيكي على حاسوبك.",
        downloadLink: "https://www.nvidia.com/download/index.aspx",
        publishDate: new Date().toISOString(),
        icon: "https://cdn-icons-png.flaticon.com/512/873/873130.png"
    },
    {
        id: 7,
        name: "تليجرام للكمبيوتر (Telegram)",
        category: "برامج وتطبيقات الكمبيوتر",
        size: "35 MB",
        version: "v5.1.1",
        desc: "نسخة سطح المكتب من تطبيق المراسلة الشهير تليجرام، يتميز بالسرعة العالية والأمان التام والمزامنة الفورية مع هاتفك المحمول.",
        downloadLink: "https://desktop.telegram.org/",
        publishDate: "2024-01-01",
        icon: "https://cdn.icon-icons.com/icons2/2108/PNG/512/telegram_logo_icon_134595.png"
    },
    {
        id: 8,
        name: "متصفح بريف (Brave Browser)",
        category: "برامج وتطبيقات الكمبيوتر",
        size: "95 MB",
        version: "أحدث إصدار",
        desc: "متصفح إنترنت سريع جداً يركز على الخصوصية، يقوم بحظر الإعلانات المزعجة والمتعقبات تلقائياً مما يوفر تجربة تصفح آمنة ومريحة.",
        downloadLink: "https://brave.com/download/",
        publishDate: "2024-01-01",
        icon: "https://cdn.icon-icons.com/icons2/2107/PNG/512/brave_browser_logo_icon_134160.png"
    },
    {
        id: 9,
        name: "Microsoft Office 2021",
        category: "برامج وتطبيقات الكمبيوتر",
        size: "4.2 GB",
        version: "Professional Plus",
        desc: "الحزمة المكتبية الأهم عالمياً، تضم Word و Excel و PowerPoint و Outlook مع ميزات الإنتاجية الحديثة والواجهة المتطورة.",
        downloadLink: "#",
        publishDate: new Date().toISOString(),
        icon: "https://cdn.icon-icons.com/icons2/2397/PNG/512/microsoft_office_logo_icon_145720.png"
    },
    {
        id: 10,
        name: "Adobe Photoshop 2024",
        category: "برامج وتطبيقات الكمبيوتر",
        size: "3.5 GB",
        version: "v25.0",
        desc: "البرنامج الرائد عالمياً في تعديل الصور والتصميم الجرافيكي، يدعم ميزات الذكاء الاصطناعي التوليدي الجديدة.",
        downloadLink: "#",
        publishDate: new Date().toISOString(),
        icon: "https://cdn.icon-icons.com/icons2/3053/PNG/512/adobe_photoshop_macos_bigsur_icon_190369.png"
    },
    {
        id: 11,
        name: "Windows 10 Pro (64-bit)",
        category: "أنظمة تشغيل الكمبيوتر",
        size: "5.1 GB",
        version: "22H2 الأصلي",
        desc: "نسخة ويندوز 10 الأكثر استقراراً، مثالية للأجهزة التي لا تدعم ويندوز 11 مع دعم كامل لكافة التحديثات الأمنية.",
        downloadLink: "https://www.microsoft.com/software-download/windows10",
        publishDate: new Date().toISOString(),
        icon: "https://cdn-icons-png.flaticon.com/512/732/732221.png"
    },
    {
        id: 12,
        name: "Windows 7 Ultimate",
        category: "أنظمة تشغيل الكمبيوتر",
        size: "3.2 GB",
        version: "SP1 (64-bit)",
        desc: "النسخة الكلاسيكية الخفيفة، مناسبة جداً للأجهزة القديمة والضعيفة وتتميز بواجهة بسيطة وسرعة في الأداء.",
        downloadLink: "#",
        publishDate: "2024-01-01",
        icon: "https://cdn-icons-png.flaticon.com/512/732/732221.png"
    },
    {
        id: 13,
        name: "Realtek High Definition Audio Driver",
        category: "تعاريف الحاسوب",
        size: "250 MB",
        version: "v6.0.96",
        desc: "التعريف الرسمي والشامل لمعظم كروت الصوت المدمجة في اللوحات الأم، يضمن لك الحصول على أفضل جودة صوت.",
        downloadLink: "https://www.realtek.com/en/downloads",
        publishDate: new Date().toISOString(),
        icon: "https://cdn-icons-png.flaticon.com/512/1150/1150604.png"
    },
    {
        id: 14,
        name: "Intel Graphics Driver (DCH)",
        category: "تعاريف الحاسوب",
        size: "540 MB",
        version: "أحدث إصدار 2024",
        desc: "تعريف معالجات الرسوميات المدمجة من إنتل (Intel UHD/Iris Xe) لتحسين أداء العرض ودعم تشغيل الألعاب بدقة عالية.",
        downloadLink: "https://www.intel.com/content/www/us/en/download-center/home.html",
        publishDate: new Date().toISOString(),
        icon: "https://cdn-icons-png.flaticon.com/512/5969/5969110.png"
    },
    {
        id: 15,
        name: "AMD Adrenalin Edition Driver",
        category: "تعاريف الحاسوب",
        size: "620 MB",
        version: "v24.1.1",
        desc: "برنامج وتعاريف كروت الشاشة AMD Radeon، يوفر لوحة تحكم متقدمة لضبط إعدادات الجرافيك وتحسين الأداء.",
        downloadLink: "https://www.amd.com/en/support",
        publishDate: new Date().toISOString(),
        icon: "https://cdn-icons-png.flaticon.com/512/5969/5969064.png"
    }
];

// التأكد من إضافة التطبيقات الافتراضية إذا لم تكن موجودة مسبقاً في المتصفح
defaultApps.forEach(defApp => {
    if (!appsDatabase.some(app => app.id === defApp.id)) {
        appsDatabase.push(defApp);
    }
});

// تحديث التخزين المحلي لضمان حفظ التطبيقات الجديدة
localStorage.setItem('my_apps_store', JSON.stringify(appsDatabase));

// إطلاق وتحميل البيانات في الواجهة فور تشغيل المتصفح مباشرة
document.addEventListener("DOMContentLoaded", function() {
    checkAdminAccess(); // فحص إذا كنت داخلاً من البوابة السرية
    // عرض قسم البرامج كافتراضي عند التحميل
    switchMainTab('برامج وتطبيقات الكمبيوتر', document.querySelector('.tab-btn'));
    initRevealOnScroll();
    renderCommentForm();
    renderComments();
});
function initRevealOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// دالة التبديل بين الأقسام الثلاثة الكبرى
function switchMainTab(category, btn) {
    currentCategory = category; // تحديث القسم النشط حالياً

    // تحديث شكل الأزرار
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active-tab', 'text-white'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.add('text-slate-400'));
    if(btn) {
        btn.classList.add('active-tab');
        btn.classList.remove('text-slate-400');
    }

    // تصفية البيانات وعرضها
    const filtered = appsDatabase.filter(app => app.category === category);
    renderStoreApps(filtered);
}

// دالة حقن وتوليد كروت التطبيقات والبرامج في المتجر العام باحترافية وتناسق عالي
function renderStoreApps(appsArray) {
    const grid = document.getElementById("product-grid"); // Changed ID to product-grid
    const adminToken = sessionStorage.getItem('admin_token');
    const isVerifiedAdmin = isAdminMode && adminToken === CONFIG.ADMIN_TOKEN;
    const categoryTitle = document.getElementById("current-category-title");

    // تحديث عنوان القسم ليعكس الفئة الحالية
    if (categoryTitle) {
        categoryTitle.innerHTML = `<i class="fa-solid fa-th-large text-blue-600"></i> ${currentCategory}`;
    }

    if (appsArray.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center p-20 bg-slate-800 border border-slate-700 rounded-lg text-gray-400 font-bold reveal active">
                <i class="fa-solid fa-magnifying-glass-minus text-4xl mb-4 text-orange-500 block"></i>
                عذراً، لم يتم العثور على أي برنامج يطابق بحثك الحالي!
            </div>
        `;
        return;
    }

    grid.innerHTML = "";
    appsArray.forEach((app, index) => {
        const dateFormatted = new Date(app.publishDate).toLocaleDateString('ar-EG');
        grid.innerHTML += `
            <div class="glow-card rounded-lg shadow-xl p-6 flex flex-col text-right reveal">
                <div class="flex justify-between items-start mb-4">
                     <span class="bg-slate-900 text-blue-400 text-[9px] font-bold px-2 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-calendar-day ml-1"></i> ${dateFormatted}</span>
                    <span class="text-slate-400 text-xs font-bold"><i class="fa-solid fa-hard-drive ml-1"></i> ${app.size}</span>
                </div>
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-2xl text-blue-500 shadow-inner p-1">
                        <img 
                            src="${app.icon && app.icon.trim() !== '' ? app.icon : 'https://cdn-icons-png.flaticon.com/512/5164/5164023.png'}" 
                            alt="${app.name}" 
                            class="w-12 h-12 object-contain block"
                            loading="lazy"
                            onerror="this.src='https://cdn-icons-png.flaticon.com/512/5164/5164023.png';"
                        >
                    </div>
                    <div>
                        <h4 class="font-black text-white text-lg tracking-tight">${app.name}</h4>
                        <p class="text-[10px] text-slate-400 font-bold uppercase" dir="ltr">الإصدار: <span class="text-blue-400">${app.version}</span></p>
                    </div>
                </div>
                <p class="text-sm text-slate-300 leading-relaxed line-clamp-3 mb-6 flex-grow font-medium">${app.desc}</p>

                ${isVerifiedAdmin ? `
                <div class="mb-4 flex justify-end border-t border-slate-800 pt-3">
                    <button onclick="deleteApp(${app.id})" class="text-[10px] bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition flex items-center gap-1"><i class="fa-solid fa-trash-can"></i> حذف البرنامج</button>
                </div>
                ` : ''}
                
                <div class="pt-4 border-t border-slate-800">
                    <a href="${app.downloadLink}" target="_blank" rel="noopener noreferrer" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full text-sm text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 active:scale-95">
                        <i class="fa-solid fa-cloud-arrow-down"></i> تحميل مباشر مجاني
                    </a>
                </div>
            </div>
        `;
    });
    initRevealOnScroll(); // إعادة تفعيل مراقب التمرير للعناصر الجديدة
}

// دالة حذف التطبيق للمسؤول
function deleteApp(id) {
    if (confirm("هل أنت متأكد من حذف هذا البرنامج نهائياً؟")) {
        appsDatabase = appsDatabase.filter(app => app.id !== id);
        localStorage.setItem('my_apps_store', JSON.stringify(appsDatabase));
        showToast("تم حذف البرنامج بنجاح.", "bg-red-600");
        // إعادة عرض القسم الحالي فقط بعد الحذف
        const filtered = appsDatabase.filter(app => app.category === currentCategory);
        renderStoreApps(filtered);
    }
}

// دالة نشر وإضافة تطبيق جديد للمتجر من قبل الآدمن عبيدة
function publishNewApp(event) {
    event.preventDefault();

    const name = document.getElementById("app-name").value.trim();
    const category = document.getElementById("app-category").value;
    const size = document.getElementById("app-size").value.trim();
    const version = document.getElementById("app-version").value.trim();
    const link = document.getElementById("app-link").value.trim();
    const desc = document.getElementById("app-desc").value.trim();
    // جلب رابط الأيقونة إذا كان هناك حقل إدخال له بالمعرف app-icon
    const icon = document.getElementById("app-icon") ? document.getElementById("app-icon").value.trim() : "";

    // تشكيل كائن التطبيق الجديد
    const newApp = {
        id: Date.now(), // استخدام طابع زمني لضمان فرادة المعرف
        name: name,
        category: category,
        size: size,
        version: version,
        desc: desc,
        downloadLink: link,
        publishDate: new Date().toISOString(), // إضافة تاريخ النشر الفعلي
        icon: icon
    };

    // إضافته بأعلى قائمة البيانات لتظهر فوراً في أول المتجر العام
    appsDatabase.unshift(newApp);

    // حفظ التغييرات في التخزين المحلي للمتصفح لضمان عدم ضياع البيانات عند التحديث
    localStorage.setItem('my_apps_store', JSON.stringify(appsDatabase));

    // إعادة تصفير الاستمارة
    event.target.reset();

    // الانتقال فوراً للقسم الذي تم إضافة البرنامج إليه
    const tabButtons = document.querySelectorAll('.tab-btn');
    let targetBtn = Array.from(tabButtons).find(btn => btn.innerText.includes(category));
    switchMainTab(category, targetBtn);

    showToast("تم نشر البرنامج بنجاح في قسم " + category, "bg-green-600");
    
    // التمرير لأسفل لرؤية البرنامج الجديد
    document.getElementById('product-grid-section').scrollIntoView({ behavior: 'smooth' });
}

// دالة إظهار/إخفاء لوحة تحكم المدير
function toggleAdminDashboard() {
    const panel = document.getElementById('admin-panel-overlay');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}
// دالة تصفية البرامج الجديدة (خلال آخر 5 أيام)
function filterNewApps() {
    const now = new Date();
    const filtered = appsDatabase.filter(app => {
        if (!app.publishDate) return false;
        const pubDate = new Date(app.publishDate);
        const diffTime = Math.abs(now - pubDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 5;
    });
    renderStoreApps(filtered);
}

// دالة البحث الذكي
function searchApps() {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    const filtered = appsDatabase.filter(app => 
        app.name.toLowerCase().includes(query) || 
        app.category.toLowerCase().includes(query) || 
        app.desc.toLowerCase().includes(query)
    );
    renderStoreApps(filtered);
}

// دالة التنقل السلس بين الأقسام
function switchTab(tabId) {
    const target = document.getElementById('product-grid-section');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
}

// آلية الدخول السري للمسؤول عبر الرابط
function checkAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminToken = urlParams.get('admin_gate_key');

    if (adminToken === CONFIG.ADMIN_TOKEN) {
        isAdminMode = true;
        sessionStorage.setItem('isAdminSession', 'true');
        sessionStorage.setItem('admin_token', adminToken);
        
        // تنظيف الرابط فوراً لإخفاء المفتاح عن الأعين
        window.history.replaceState({}, document.title, window.location.pathname);
        
        showToast("أهلاً بك يا مدير عبيدة، تم تفعيل الصلاحيات.", "bg-green-600");
        renderCommentForm();
        renderComments();
    }
}

// --- نظام التعليقات المطور ---

// وظيفة تنظيف النصوص لمنع هجمات XSS (حقن الأكواد)
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// دالة بناء واجهة المستخدم أو التعليق بناءً على حالة تسجيل الدخول
function renderCommentForm() {
    const container = document.getElementById('auth-container');
    const navAuth = document.getElementById('nav-auth-container');
    if (!container) return;

    const isVerifiedAdmin = isAdminMode && sessionStorage.getItem('admin_token') === CONFIG.ADMIN_TOKEN;

    const adminPanel = document.getElementById('admin-panel-overlay');

    // تحديث شريط التنقل العلوي (Navbar)
    if (navAuth) {
        if (isVerifiedAdmin) {
            navAuth.innerHTML = `
                <div class="flex items-center gap-4 bg-slate-900/50 px-4 py-1.5 rounded-full border border-orange-500/30">
                    <div class="flex items-center gap-2">
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" class="w-8 h-8 rounded-full border-2 border-orange-500 object-cover">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-white font-black leading-tight">عبيده عامر</span>
                            <span class="text-[8px] text-orange-400 font-bold uppercase tracking-tighter">المدير العام</span>
                        </div>
                    </div>
                    <button onclick="toggleAdminDashboard()" class="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-3 py-1 rounded font-bold transition"><i class="fa-solid fa-gauge-high ml-1"></i> لوحة التحكم</button>
                    <button onclick="logoutAdmin()" class="text-[10px] text-slate-400 hover:text-red-400 transition"><i class="fa-solid fa-power-off"></i></button>
                </div>
            `;
        } else if (currentUser) { // إذا كان المستخدم العادي مسجلاً، أظهر معلوماته
            navAuth.innerHTML = `
                <div class="flex items-center gap-4 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-700/30">
                    <div class="flex items-center gap-2">
                        <img src="${currentUser.avatar}" class="w-8 h-8 rounded-full border-2 border-slate-600 object-cover">
                        <span class="text-[10px] text-white font-black leading-tight">${currentUser.name}</span>
                    </div>
                    <button onclick="logoutUser()" class="text-[10px] text-slate-400 hover:text-red-400 transition"><i class="fa-solid fa-power-off"></i></button>
                </div>
            `;
        } else { // إذا لم يكن هناك لا مدير ولا مستخدم، أظهر زر تسجيل دخول المستخدم
            navAuth.innerHTML = `
                <a href="login.html" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-xs font-bold transition">
                    <i class="fa-solid fa-user ml-1"></i> تسجيل دخول مستخدم
                </a>
            `;
        }
    }

    // إظهار لوحة التحكم بالأعلى للمسؤول
    if (adminPanel) adminPanel.classList.toggle('hidden', !isVerifiedAdmin);

    // إذا كان الجهاز محظوراً نهائياً
    if (isDeviceBanned) {
        container.innerHTML = `
            <div class="text-center p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <i class="fa-solid fa-user-slash text-red-500 text-3xl mb-2"></i>
                <p class="text-xs text-red-400 font-bold">عذراً، تم حظر جهازك نهائياً لانتهاك سياسات المحتوى.</p>
            </div>
        `;
        return;
    }

    if (!isVerifiedAdmin && !currentUser) {
        // واجهة "القفل" قبل تسجيل الدخول
        container.innerHTML = `
            <div class="text-center space-y-4 py-4">
                <i class="fa-solid fa-lock text-slate-600 text-4xl block mb-2"></i>
                <p class="text-sm text-slate-400 font-bold">يرجى تسجيل الدخول أولاً لتتمكن من إضافة تعليق</p>
                <a href="login.html" class="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-xs font-black transition-all transform hover:scale-105 shadow-lg shadow-orange-500/20">
                    <i class="fa-solid fa-right-to-bracket ml-1"></i> تسجيل الدخول الآن
                </a>
            </div>
        `;
    } else if (isVerifiedAdmin || currentUser) {
        // واجهة كتابة التعليق للمستخدم المسجل (التعرف التلقائي)
        const name = isVerifiedAdmin ? "عبيده عامر (المسؤول)" : currentUser.name;
        const avatar = isVerifiedAdmin ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" : currentUser.avatar;
        const roleLabel = isVerifiedAdmin ? "مسؤول" : "مستخدم";
        const roleClass = isVerifiedAdmin ? "bg-orange-600 text-white" : "bg-slate-700 text-slate-400";

        container.innerHTML = `
            <div class="flex items-center gap-3 mb-4 p-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <img src="${avatar}" class="w-10 h-10 rounded-full border border-slate-600 object-cover bg-slate-800">
                <div class="flex-1">
                    <p class="text-sm font-bold text-white">${name}</p>
                    ${!isVerifiedAdmin ? `<button onclick="logoutUser()" class="text-[10px] text-red-400 hover:text-red-300 transition">تسجيل الخروج</button>` : `<span class="text-[10px] text-orange-400 italic">مرحباً بك يا مدير</span>`}
                </div> 
                <span class="text-[8px] ${roleClass} px-1 rounded">رتبة: ${roleLabel}</span>
            </div>
            <form onsubmit="handleCommentSubmit(event)" class="space-y-4">
                <textarea id="comment-text" placeholder="اكتب رأيك هنا..." rows="3" maxlength="500" required class="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none resize-none"></textarea>
                <button type="submit" id="submit-btn" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-md transition flex items-center justify-center gap-2">
                    <span>نشر التعليق</span>
                </button>
            </form>
        `;
    }
}

// محاكاة لبروتوكول الذكاء الاصطناعي لفحص الصور (مثل Google Vision)
async function simulateAIImageModeration(imageSrc) {
    // في الواقع العملي، يتم إرسال imageSrc إلى API خارجي
    return new Promise((resolve) => {
        setTimeout(() => {
            // محاكاة: إذا كانت الصورة تحتوي على نص معين للتمويه أو حجم مريب (مثال فقط)
            // هنا نعتبر جميع الصور سليمة إلا إذا كانت فارغة أو تالفة
            resolve(true); 
        }, 1500);
    });
}

async function handleUserRegistration(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const file = document.getElementById('reg-avatar').files[0];
    const btn = document.getElementById('reg-submit-btn');
    
    if (file) {
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="loader"></span> جاري الدخول...`;
        
        const reader = new FileReader();
        reader.onloadend = async function() {
            const imageData = reader.result;
            
            // 1. الفحص التلقائي للصورة (محاكاة)
            const isSafe = await simulateAIImageModeration(imageData);
            
            if (!isSafe) {
                // 2. الحظر النهائي والرفض
                localStorage.setItem('site_blacklist', 'true');
                location.reload(); // إعادة تحميل لتفعيل الحظر
                return;
            }

            currentUser = { name: name, avatar: reader.result, role: 'User' };
            localStorage.setItem('user_profile', JSON.stringify(currentUser));
            
            toggleModal(false); // إغلاق النافذة بنجاح
            showToast(`تم إنشاء حسابك بنجاح. أهلاً بك يا ${name}!`, "bg-blue-600");
            renderCommentForm();
        }
        reader.readAsDataURL(file);
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminSession');
    sessionStorage.removeItem('admin_token');
    isAdminMode = false;
    showToast("تم الخروج من وضع الإدارة.");
    location.reload();
}

function logoutUser() {
    if (confirm("هل تريد تسجيل الخروج؟")) {
        localStorage.removeItem('user_profile');
        currentUser = null;
        renderCommentForm();
        renderComments(); 
    }
}

function handleCommentSubmit(event) {
    event.preventDefault();

    const isVerifiedAdmin = isAdminMode && sessionStorage.getItem('admin_token') === CONFIG.ADMIN_TOKEN;

    // منع التعليق إذا لم يكن هناك مستخدم أو مسؤول
    if (!currentUser && !isVerifiedAdmin) {
        showToast("يرجى تسجيل الدخول أولاً لإضافة تعليق.", "bg-red-600");
        return;
    }
    
    // نظام Rate Limiting: منع النشر المتكرر السريع
    const lastPost = localStorage.getItem('last_post_time');
    if (lastPost && Date.now() - lastPost < 15000) { // 15 ثانية بين كل تعليق
        showToast("يرجى الانتظار قليلاً قبل إضافة تعليق آخر.", "bg-orange-700");
        return;
    }

    const rawText = document.getElementById("comment-text").value.trim();
    const text = sanitizeHTML(rawText); // تنظيف النص فوراً
    const btn = document.getElementById("submit-btn");
    
    // تأثير التحميل
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="loader"></span> جاري المعالجة...`;

    setTimeout(() => {
        // الفلترة التلقائية
        const isBad = bannedWords.some(word => text.includes(word));
        
        if (isBad) {
            showToast("عذراً، يحتوي تعليقك على كلمات تنتهك سياسة الموقع.", "bg-red-600");
            btn.disabled = false;
            btn.innerHTML = originalContent;
            return;
        }

        const newComment = {
            id: Date.now(),
            user: isVerifiedAdmin ? "عبيدة عامر (المدير)" : currentUser.name,
            text: text,
            avatar: isVerifiedAdmin ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" : currentUser.avatar,
            status: isVerifiedAdmin ? 'approved' : 'pending', 
            role: isVerifiedAdmin ? 'admin' : 'user',
            pinned: false,
            date: new Date().toLocaleString('ar-EG')
        };

        commentsDatabase.unshift(newComment);
        localStorage.setItem('my_apps_comments', JSON.stringify(commentsDatabase));
        localStorage.setItem('last_post_time', Date.now()); // تسجيل وقت النشر
        
        // حفظ معرف التعليق في الجلسة ليراه المستخدم كـ "قيد المراجعة"
        const myPending = JSON.parse(sessionStorage.getItem('myPendingComments') || '[]');
        myPending.push(newComment.id);
        sessionStorage.setItem('myPendingComments', JSON.stringify(myPending));
        
        // إعادة ضبط النموذج
        renderCommentForm();
        btn.disabled = false;
        btn.innerHTML = originalContent;
        
        showToast(isVerifiedAdmin ? "تم نشر تعليقك فوراً كمسؤول." : "تم إرسال تعليقك بنجاح، وهو بانتظار المراجعة.");
        renderComments();
    }, 1200);
}

function renderComments() {
    const container = document.getElementById("comments-display");
    container.innerHTML = "";

    const isVerifiedAdmin = isAdminMode && sessionStorage.getItem('admin_token') === CONFIG.ADMIN_TOKEN;
    // إزالة شارة المسؤول إذا كانت موجودة
    const badge = document.getElementById('admin-badge'); // هذا العنصر سيتم حذفه من HTML أيضاً

    // جلب التعليقات التي كتبها المستخدم الحالي في هذه الجلسة
    const myPending = JSON.parse(sessionStorage.getItem('myPendingComments') || '[]');

    // تحديد التعليقات المرئية
    const visibleComments = commentsDatabase.filter(c => {
        if (isVerifiedAdmin) return true; // المسؤول يرى الكل
        if (c.status === 'approved') return true; // الجميع يرى التعليقات المعتمدة
        if (myPending.includes(c.id)) return true; // المستخدم يرى تعليقاته المعلقة
        return false;
    }).sort((a, b) => {
        // فرز: المثبت أولاً
        return (b.pinned || false) - (a.pinned || false);
    });

    if (visibleComments.length === 0) {
        container.innerHTML = `<p class="text-slate-500 text-sm italic text-center py-4">لا توجد تعليقات حالياً...</p>`;
        return;
    }

    visibleComments.forEach(comment => {
        const isPending = comment.status === 'pending';
        const isAdminPost = comment.role === 'admin';
        const card = document.createElement('div');
        card.id = `comment-${comment.id}`;
        card.className = `p-4 rounded-lg border ${comment.pinned ? 'border-orange-500 shadow-md shadow-orange-500/10' : 'border-slate-700'} ${isAdminPost ? 'bg-orange-900/10' : 'bg-slate-800/50'} comment-fade-in relative group`;
        
        card.innerHTML = `
            ${comment.pinned ? '<div class="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full shadow-lg z-10"><i class="fa-solid fa-thumbtack ml-1"></i> مثبت</div>' : ''}
            <div class="flex gap-4 items-start"> 
                <img src="${comment.avatar}" alt="${comment.user}" class="w-12 h-12 rounded-full border-2 ${isAdminPost ? 'border-orange-500' : 'border-slate-700'} object-cover flex-shrink-0 bg-slate-800 shadow-sm">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold ${isAdminPost ? 'text-orange-500' : 'text-orange-400'} text-sm">${comment.user}</span>
                        <span class="text-[10px] text-slate-500">${comment.date}</span>
                    </div>
                    <p class="text-sm text-slate-300 leading-relaxed">${comment.text}</p>
                    ${isPending ? `<span class="text-[10px] text-orange-500 font-bold mt-2 inline-block"><i class="fa-solid fa-clock-rotate-left ml-1"></i> قيد المراجعة</span>` : ''}
                    
                    ${isVerifiedAdmin ? `
                        <div class="mt-3 flex gap-2 justify-end border-t border-slate-700/50 pt-2">
                            ${isPending ? `
                                <button onclick="approveComment(${comment.id})" class="text-[10px] bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md text-white font-bold transition flex items-center gap-1 shadow-lg shadow-green-900/20">
                                    <i class="fa-solid fa-check"></i> قبول النشر
                                </button>
                                <button onclick="rejectComment(${comment.id})" class="text-[10px] bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-white font-bold transition flex items-center gap-1 shadow-lg shadow-red-900/20">
                                    <i class="fa-solid fa-xmark"></i> رفض وحذف
                                </button>
                            ` : `
                                <button onclick="pinComment(${comment.id})" class="text-[10px] bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white transition">
                                    ${comment.pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                                </button>
                                <button onclick="deleteComment(${comment.id})" class="text-[10px] bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white transition">حذف</button>
                            `}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// دالة قبول التعليق (تغيير الحالة من معلق إلى مقبول)
function approveComment(id) {
    const comment = commentsDatabase.find(c => c.id === id);
    if (comment) {
        comment.status = 'approved';
        localStorage.setItem('my_apps_comments', JSON.stringify(commentsDatabase));
        showToast("تمت الموافقة بنجاح! التعليق الآن مرئي للجميع.", "bg-green-600");
        renderComments();
    }
}

// دالة رفض وحذف التعليق
function rejectComment(id) {
    if (confirm("هل أنت متأكد من رفض وحذف هذا التعليق نهائياً؟")) {
        // نستخدم دالة الحذف الموجودة مسبقاً مع أنميشن التلاشي
        deleteComment(id);
        // سيقوم deleteComment بعرض التنبيه وإعادة الرندرة تلقائياً
    }
}

function pinComment(id) {
    const comment = commentsDatabase.find(c => c.id === id);
    if (comment) comment.pinned = !comment.pinned;
    localStorage.setItem('my_apps_comments', JSON.stringify(commentsDatabase));
    renderComments();
}

function deleteComment(id) {
    const el = document.getElementById(`comment-${id}`);
    el.classList.add('shrink-out'); // أنميشن الحذف
    
    setTimeout(() => {
        commentsDatabase = commentsDatabase.filter(c => c.id !== id);
        localStorage.setItem('my_apps_comments', JSON.stringify(commentsDatabase));
        renderComments();
    }, 400);
}

function showToast(message, bgColor = "bg-slate-800") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${bgColor}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-info ml-2"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// إضافة أنميشن ظهور البطاقات برمجياً
const style = document.createElement('style');
style.innerHTML = `
    /* Removed fadeInUp animation for Amazon-like simplicity */
    .no-scrollbar::-webkit-scrollbar { display: none; }
`;
document.head.appendChild(style);
