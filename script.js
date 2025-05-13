// ========== المتغيرات والإعدادات الرئيسية ==========
let editor; // محرر الأكواد
let activeFile = null; // الملف النشط حاليًا
let openFiles = {}; // الملفات المفتوحة
let fileSystem = { // نظام الملفات
    root: {
        type: 'folder',
        children: {}
    }
};
let serverRunning = false; // حالة الخادم
let serverRootPath = ''; // مسار مجلد الخادم
let autoSaveTimer = null; // مؤقت الحفظ التلقائي

// الإعدادات الافتراضية
let settings = {
    theme: 'dark', // سمة التطبيق (فاتح/داكن)
    editorTheme: 'monokai', // سمة المحرر
    fontSize: '14px', // حجم الخط
    autoSave: true, // الحفظ التلقائي
    autoSaveInterval: 30000, // فترة الحفظ التلقائي (بالمللي ثانية)
    livePreview: false, // المعاينة المباشرة
    tabSize: 4, // حجم المسافة البادئة
    wrapLines: true, // التفاف الأسطر
    showInvisibles: false // إظهار الرموز غير المرئية
};

// قوالب الملفات الجاهزة
const fileTemplates = {
    html: {
        empty: '',
        basic: '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>العنوان</title>\n</head>\n<body>\n    \n</body>\n</html>',
        full: '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>العنوان</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <header>\n        <h1>العنوان الرئيسي</h1>\n    </header>\n    \n    <main>\n        <section>\n            <h2>قسم فرعي</h2>\n            <p>محتوى القسم</p>\n        </section>\n    </main>\n    \n    <footer>\n        <p>الحقوق محفوظة &copy; 2024</p>\n    </footer>\n    \n    <script src="script.js"></script>\n</body>\n</html>'
    },
    css: {
        empty: '',
        basic: '/* أنماط أساسية */\nbody {\n    font-family: Arial, sans-serif;\n    line-height: 1.6;\n    margin: 0;\n    padding: 0;\n}\n',
        full: '/* أنماط الصفحة */\n:root {\n    --primary-color: #3498db;\n    --secondary-color: #2ecc71;\n    --text-color: #333;\n    --light-color: #f4f4f4;\n}\n\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: \'Segoe UI\', Tahoma, sans-serif;\n    line-height: 1.6;\n    color: var(--text-color);\n    background-color: var(--light-color);\n}\n\nheader {\n    background-color: var(--primary-color);\n    color: white;\n    text-align: center;\n    padding: 1rem;\n}\n\nmain {\n    padding: 2rem;\n    max-width: 1200px;\n    margin: 0 auto;\n}\n\nsection {\n    margin-bottom: 2rem;\n}\n\nfooter {\n    background-color: var(--primary-color);\n    color: white;\n    text-align: center;\n    padding: 1rem;\n    margin-top: 2rem;\n}\n\n/* وسائط متعددة للتجاوب */\n@media (max-width: 768px) {\n    main {\n        padding: 1rem;\n    }\n}\n'
    },
    js: {
        empty: '',
        basic: '// الكود الرئيسي\nconsole.log("مرحبا بالعالم!");\n',
        full: '// عند تحميل الصفحة\ndocument.addEventListener("DOMContentLoaded", function() {\n    console.log("تم تحميل الصفحة");\n    \n    // الأحداث والتفاعلات\n    const header = document.querySelector("header");\n    if (header) {\n        header.addEventListener("click", function() {\n            console.log("تم النقر على الترويسة");\n        });\n    }\n    \n    // أمثلة لوظائف مفيدة\n    function showMessage(message) {\n        alert(message);\n    }\n    \n    function calculateSum(a, b) {\n        return a + b;\n    }\n});\n'
    },
    json: {
        empty: '{\n    \n}',
        basic: '{\n    "name": "المشروع",\n    "version": "1.0.0",\n    "description": "وصف المشروع"\n}',
        full: '{\n    "name": "المشروع",\n    "version": "1.0.0",\n    "description": "وصف المشروع",\n    "author": {\n        "name": "اسمك",\n        "email": "بريدك@مثال.com"\n    },\n    "settings": {\n        "theme": "dark",\n        "language": "ar",\n        "notifications": true\n    },\n    "dependencies": [\n        {\n            "name": "المكتبة1",\n            "version": "1.2.3"\n        },\n        {\n            "name": "المكتبة2",\n            "version": "4.5.6"\n        }\n    ]\n}'
    },
    txt: {
        empty: '',
        basic: 'هذا ملف نصي بسيط.\n',
        full: 'هذا ملف نصي يحتوي على معلومات المشروع.\n\nعنوان المشروع: [العنوان]\nالوصف: [الوصف]\nتاريخ البدء: [التاريخ]\n\nملاحظات:\n- الملاحظة الأولى\n- الملاحظة الثانية\n- الملاحظة الثالثة\n'
    }
};

// قوالب جاهزة للأكواد
const codeSnippets = {
    'html-template': '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>العنوان</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <header>\n        <h1>العنوان الرئيسي</h1>\n        <nav>\n            <ul>\n                <li><a href="#">الرئيسية</a></li>\n                <li><a href="#">من نحن</a></li>\n                <li><a href="#">الخدمات</a></li>\n                <li><a href="#">اتصل بنا</a></li>\n            </ul>\n        </nav>\n    </header>\n    \n    <main>\n        <section>\n            <h2>قسم فرعي</h2>\n            <p>محتوى القسم</p>\n        </section>\n    </main>\n    \n    <footer>\n        <p>الحقوق محفوظة &copy; 2024</p>\n    </footer>\n    \n    <script src="script.js"></script>\n</body>\n</html>',
    'css-reset': '/* CSS Reset */\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nhtml, body {\n    height: 100%;\n}\n\nbody {\n    line-height: 1.5;\n    -webkit-font-smoothing: antialiased;\n}\n\nimg, picture, video, canvas, svg {\n    display: block;\n    max-width: 100%;\n}\n\ninput, button, textarea, select {\n    font: inherit;\n}\n\np, h1, h2, h3, h4, h5, h6 {\n    overflow-wrap: break-word;\n}\n',
    'responsive-layout': '/* تخطيط متجاوب */\n.container {\n    width: 100%;\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 0 15px;\n}\n\n/* تخطيط الشبكة */\n.row {\n    display: flex;\n    flex-wrap: wrap;\n    margin: 0 -15px;\n}\n\n.col {\n    flex: 1 0 0%;\n    padding: 0 15px;\n}\n\n/* أعمدة بعروض محددة */\n.col-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }\n.col-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }\n.col-3 { flex: 0 0 25%; max-width: 25%; }\n.col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }\n.col-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }\n.col-6 { flex: 0 0 50%; max-width: 50%; }\n.col-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }\n.col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }\n.col-9 { flex: 0 0 75%; max-width: 75%; }\n.col-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }\n.col-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }\n.col-12 { flex: 0 0 100%; max-width: 100%; }\n\n/* نقاط الكسر للتجاوب */\n@media (max-width: 992px) {\n    .col-md-6 { flex: 0 0 50%; max-width: 50%; }\n    .col-md-12 { flex: 0 0 100%; max-width: 100%; }\n}\n\n@media (max-width: 768px) {\n    .col-sm-12 { flex: 0 0 100%; max-width: 100%; }\n}\n',
    'flex-grid': '/* شبكة Flex */\n.flex-container {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 20px;\n}\n\n.flex-item {\n    flex: 1 1 300px;\n    min-height: 200px;\n    background-color: #f0f0f0;\n    border-radius: 5px;\n    padding: 20px;\n    box-shadow: 0 2px 5px rgba(0,0,0,0.1);\n}\n\n/* تنسيقات إضافية */\n.flex-center {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.flex-between {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n.flex-column {\n    display: flex;\n    flex-direction: column;\n}\n',
    'js-dom': '// التفاعل مع DOM\ndocument.addEventListener("DOMContentLoaded", () => {\n    // اختصارات للوظائف الشائعة\n    const $ = (selector) => document.querySelector(selector);\n    const $$ = (selector) => document.querySelectorAll(selector);\n    \n    // أمثلة للتفاعل مع العناصر\n    const button = $(".button");\n    if (button) {\n        button.addEventListener("click", () => {\n            alert("تم النقر على الزر!");\n        });\n    }\n    \n    // إضافة عناصر ديناميكية\n    function createCard(title, content) {\n        const card = document.createElement("div");\n        card.className = "card";\n        \n        const cardTitle = document.createElement("h3");\n        cardTitle.textContent = title;\n        \n        const cardContent = document.createElement("p");\n        cardContent.textContent = content;\n        \n        card.appendChild(cardTitle);\n        card.appendChild(cardContent);\n        \n        return card;\n    }\n    \n    const container = $(".container");\n    if (container) {\n        container.appendChild(createCard("عنوان البطاقة", "محتوى البطاقة"));\n    }\n});\n'
};

// ========== التهيئة الأولية ==========
// تهيئة المحرر والتطبيق
function initializeApp() {
    // تهيئة محرر الأكواد
    initEditor();
    
    // تحميل الإعدادات
    loadSettings();
    
    // تحميل نظام الملفات المحفوظ
    loadFileSystem();
    
    // تهيئة مستكشف الملفات
    renderFileBrowser();
    
    // تهيئة مستمعي الأحداث
    setupEventListeners();
    
    // تحديث إحصاءات المشروع
    updateProjectStats();
    
    // تطبيق السمة
    applyTheme();
    
    // بدء الحفظ التلقائي إذا كان مفعلاً
    if (settings.autoSave) {
        startAutoSave();
    }
    
    // عرض رسالة ترحيب
    consoleLog('مرحباً بك في محرر الأكواد والخادم المحلي!', 'info');
}

// تهيئة محرر الأكواد
function initEditor() {
    editor = ace.edit("editor");
    
    // إعدادات المحرر
    editor.setTheme("ace/theme/" + settings.editorTheme);
    editor.session.setMode("ace/mode/html");
    editor.setFontSize(settings.fontSize);
    editor.setShowInvisibles(settings.showInvisibles);
    editor.setOption("wrap", settings.wrapLines);
    editor.session.setTabSize(settings.tabSize);
    
    // تفعيل أدوات لغوية متقدمة
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        enableEmmet: true
    });
    
    // مراقبة التغييرات
    editor.on("change", function() {
        if (activeFile) {
            // تحديث حالة الملف إلى "غير محفوظ"
            openFiles[activeFile].isDirty = true;
            updateTabStatus(activeFile);
            
            // تحديث المعاينة المباشرة إذا كانت مفعلة
            if (settings.livePreview && activeFile.endsWith('.html')) {
                updateLivePreview();
            }
        }
    });
    
    // تحديث موضع المؤشر في شريط الحالة
    editor.selection.on("changeCursor", function() {
        updateCursorPosition();
    });
    
    // تعطيل التحذيرات غير الضرورية
    editor.$blockScrolling = Infinity;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار التبديل في الشريط العلوي
    document.querySelector('.toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('save-button').addEventListener('click', saveCurrentFile);
    document.getElementById('format-button').addEventListener('click', formatCode);
    document.getElementById('run-button').addEventListener('click', runApplication);
    document.getElementById('export-button').addEventListener('click', showExportModal);
    
    // تنسيقات المحرر
    document.getElementById('editor-theme').addEventListener('change', function() {
        settings.editorTheme = this.value;
        editor.setTheme("ace/theme/" + settings.editorTheme);
        saveSettings();
    });
    
    document.getElementById('editor-font-size').addEventListener('change', function() {
        settings.fontSize = this.value;
        editor.setFontSize(settings.fontSize);
        saveSettings();
    });
    
    // استمع لأحداث لوحة المفاتيح
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // البحث
    document.getElementById('close-search').addEventListener('click', toggleSearchBar);
    document.getElementById('search-next').addEventListener('click', searchNext);
    document.getElementById('search-prev').addEventListener('click', searchPrev);
    document.getElementById('replace-btn').addEventListener('click', replaceSelection);
    document.getElementById('replace-all-btn').addEventListener('click', replaceAll);
    
    // ضبط أحداث وحدة التحكم
    document.getElementById('console-clear').addEventListener('click', clearConsole);
    document.getElementById('console-close').addEventListener('click', hideConsole);
    document.getElementById('preview-console').addEventListener('click', toggleConsole);
    
    // ضبط أحداث المعاينة
    document.getElementById('preview-refresh').addEventListener('click', function() {
        runApplication(true);
    });
    
    document.getElementById('preview-back').addEventListener('click', stopServer);
    document.getElementById('preview-device').addEventListener('change', changePreviewDevice);
    
    // أزرار مستكشف الملفات
    document.querySelector('.new-file-btn').addEventListener('click', function() {
        showNewFileModal();
    });
    
    document.querySelector('.new-folder-btn').addEventListener('click', function() {
        showNewFolderModal();
    });
    
    document.querySelector('.refresh-btn').addEventListener('click', renderFileBrowser);
    
    // النقر المزدوج لإعادة التسمية
    document.getElementById('file-browser').addEventListener('dblclick', function(e) {
        const fileOrFolder = e.target.closest('.file, .folder');
        if (fileOrFolder && !e.target.closest('.folder-toggle')) {
            const path = fileOrFolder.getAttribute('data-path');
            if (path) {
                renameFileOrFolder(path);
            }
        }
    });
    
    // أحداث القائمة السياقية
    document.getElementById('file-browser').addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const fileOrFolder = e.target.closest('.file, .folder');
        
        if (fileOrFolder) {
            const path = fileOrFolder.getAttribute('data-path');
            const type = fileOrFolder.classList.contains('file') ? 'file' : 'folder';
            showContextMenu(e, path, type);
        } else {
            // النقر بزر الفأرة الأيمن على مساحة فارغة في مستكشف الملفات
            showContextMenu(e, 'root', 'folder');
        }
    });
    
    // سياق محرر الأكواد
    document.getElementById('editor').addEventListener('contextmenu', function(e) {
        if (activeFile) {
            e.preventDefault();
            showEditorContextMenu(e);
        }
    });
    
    // الإجراءات السريعة
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch (action) {
                case 'new-html':
                    showNewFileModal('html');
                    break;
                    
                case 'new-css':
                    showNewFileModal('css');
                    break;
                    
                case 'new-js':
                    showNewFileModal('js');
                    break;
                    
                case 'upload':
                    showUploadModal();
                    break;
            }
        });
    });
    
    // قوالب الأكواد الجاهزة
    document.querySelectorAll('.snippet-item').forEach(item => {
        item.addEventListener('click', function() {
            const snippetName = this.getAttribute('data-snippet');
            insertCodeSnippet(snippetName);
        });
    });
    
    // أحداث رفع الملفات
    document.querySelector('.upload-button').addEventListener('click', showUploadModal);
    document.getElementById('upload-files-btn').addEventListener('click', uploadFiles);
    document.getElementById('change-destination').addEventListener('click', showFolderSelectModal);
    document.getElementById('select-folder-btn').addEventListener('click', selectUploadDestination);
    
    // أزرار المودال
    document.getElementById('create-file-btn').addEventListener('click', createNewFile);
    document.getElementById('create-folder-btn').addEventListener('click', createNewFolder);
    document.getElementById('export-project-btn').addEventListener('click', exportProject);
    
    // إغلاق المودال
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // أحداث السحب والإفلات
    const uploadZone = document.querySelector('.file-input-label');
    
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        handleFileSelection(e);
    });
    
    // أحداث تحديد الملفات للرفع
    document.getElementById('upload-file-input').addEventListener('change', handleFileSelection);
    
    // أحداث تبديل المعاينة المباشرة
    document.getElementById('live-preview-toggle').addEventListener('click', toggleLivePreview);
    
    // قسم المفضلة/القوالب
    document.querySelector('.section-toggle').addEventListener('click', function() {
        this.classList.toggle('collapsed');
        const snippetsList = document.querySelector('.snippets-list');
        
        if (this.classList.contains('collapsed')) {
            snippetsList.style.display = 'none';
        } else {
            snippetsList.style.display = 'block';
        }
    });
}

// التعامل مع اختصارات لوحة المفاتيح
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S: حفظ الملف
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
    }
    
    // Ctrl/Cmd + F: فتح شريط البحث
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        toggleSearchBar();
    }
    
    // Ctrl/Cmd + H: فتح شريط البحث مع الاستبدال
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggleSearchBar(true);
    }
    
    // F5: تشغيل التطبيق
    if (e.key === 'F5') {
        e.preventDefault();
        runApplication();
    }
    
    // Alt + Shift + F: تنسيق الكود
    if (e.altKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        formatCode();
    }
}

// ========== وظائف نظام الملفات ==========
// حفظ نظام الملفات في التخزين المحلي
function saveFileSystem() {
    try {
        localStorage.setItem('file-system', JSON.stringify(fileSystem));
    } catch (e) {
        console.error('فشل حفظ نظام الملفات:', e);
        showToast('فشل حفظ نظام الملفات، قد تكون مساحة التخزين المحلي ممتلئة', 'error');
    }
}

// استرجاع نظام الملفات من التخزين المحلي
function loadFileSystem() {
    try {
        const storedFS = localStorage.getItem('file-system');
        
        if (storedFS) {
            fileSystem = JSON.parse(storedFS);
            
            // إنشاء مجلد رئيسي إذا لم يكن موجودًا
            if (!fileSystem.root) {
                fileSystem.root = {
                    type: 'folder',
                    children: {}
                };
            }
        } else {
            // إضافة مشروع نموذجي إذا كان نظام الملفات فارغًا
            createExampleProject();
        }
    } catch (e) {
        console.error('فشل تحميل نظام الملفات:', e);
        showToast('فشل تحميل نظام الملفات، سيتم إنشاء نظام ملفات جديد', 'error');
        
        // إعادة تعيين نظام الملفات
        fileSystem = {
            root: {
                type: 'folder',
                children: {}
            }
        };
        
        // إنشاء مشروع نموذجي
        createExampleProject();
    }
}

// إنشاء مشروع نموذجي
function createExampleProject() {
    // إضافة ملفات نموذجية
    fileSystem.root.children['index.html'] = {
        type: 'file',
        fileType: 'html',
        content: fileTemplates.html.full.replace('العنوان', 'مشروعي الأول').replace('العنوان الرئيسي', 'مرحباً بالعالم!').replace('قسم فرعي', 'مرحباً بك في موقعي').replace('محتوى القسم', 'هذا هو محتوى موقعي الأول.'),
        lastModified: new Date()
    };
    
    fileSystem.root.children['styles.css'] = {
        type: 'file',
        fileType: 'css',
        content: fileTemplates.css.full,
        lastModified: new Date()
    };
    
    fileSystem.root.children['script.js'] = {
        type: 'file',
        fileType: 'js',
        content: fileTemplates.js.full,
        lastModified: new Date()
    };
    
    // إضافة مجلد assets
    fileSystem.root.children['assets'] = {
        type: 'folder',
        children: {}
    };
    
    // حفظ نظام الملفات
    saveFileSystem();
}

// الحصول على كائن ملفي بناءً على المسار
function getFileSystemObjectByPath(path) {
    if (!path || path === '') return null;
    
    // معالجة المسار الرئيسي
    if (path === 'root') {
        return fileSystem.root;
    }
    
    // تقسيم المسار إلى أجزاء
    const parts = path.split('/');
    
    // إزالة الجزء الأول (root) إن وجد
    if (parts[0] === 'root') {
        parts.shift();
    }
    
    // البحث في هيكل الملفات
    let current = fileSystem.root;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // المجلد الحالي ليس مجلدًا أو لا يحتوي على الجزء التالي
        if (!current.children || !current.children[part]) {
            return null;
        }
        
        current = current.children[part];
    }
    
    return current;
}

// الحصول على مسار المجلد الأب من مسار الملف
function getParentFolderFromPath(path) {
    if (!path || path === 'root' || path === '') {
        return 'root';
    }
    
    const parts = path.split('/');
    
    // إذا كان المسار في المستوى الأعلى
    if (parts.length === 1 || (parts.length === 2 && parts[0] === 'root')) {
        return 'root';
    }
    
    // إزالة آخر جزء (اسم الملف)
    parts.pop();
    
    return parts.join('/');
}

// عرض مستكشف الملفات
function renderFileBrowser() {
    const fileBrowser = document.getElementById('file-browser');
    fileBrowser.innerHTML = '';
    
    // إنشاء عناصر الملفات والمجلدات
    function renderFolder(folder, folderPath, parentElement) {
        for (const itemName in folder.children) {
            const item = folder.children[itemName];
            const itemPath = `${folderPath}/${itemName}`;
            const itemElem = document.createElement('div');
            
            if (item.type === 'file') {
                // تحديد أيقونة الملف حسب النوع
                let iconClass = 'fas fa-file';
                let fileClass = '';
                
                switch (item.fileType) {
                    case 'html':
                        iconClass = 'fab fa-html5';
                        fileClass = 'html-file';
                        break;
                    case 'css':
                        iconClass = 'fab fa-css3-alt';
                        fileClass = 'css-file';
                        break;
                    case 'js':
                        iconClass = 'fab fa-js';
                        fileClass = 'js-file';
                        break;
                    case 'json':
                        iconClass = 'fas fa-code';
                        fileClass = 'json-file';
                        break;
                    default:
                        iconClass = 'fas fa-file-alt';
                        break;
                }
                
                itemElem.className = `file ${fileClass}`;
                itemElem.innerHTML = `<i class="${iconClass}"></i>${itemName}`;
                itemElem.setAttribute('data-path', itemPath);
                
                // فتح الملف عند النقر عليه
                itemElem.addEventListener('click', function() {
                    openFile(itemPath);
                });
                
                // تطبيق التنشيط إذا كان هذا هو الملف النشط
                if (itemPath === activeFile) {
                    itemElem.classList.add('active');
                }
            } else if (item.type === 'folder') {
                itemElem.className = 'folder';
                
                // إضافة أيقونة التبديل
                itemElem.innerHTML = `
                    <span class="folder-toggle"><i class="fas fa-caret-right"></i></span>
                    <i class="fas fa-folder"></i>${itemName}
                `;
                
                itemElem.setAttribute('data-path', itemPath);
                
                // إضافة محتوى المجلد
                const folderContent = document.createElement('div');
                folderContent.className = 'folder-content';
                
                // تكرار العملية لمحتويات المجلد
                renderFolder(item, itemPath, folderContent);
                
                itemElem.appendChild(folderContent);
                
                // تبديل عرض محتوى المجلد عند النقر على الأيقونة
                const folderToggle = itemElem.querySelector('.folder-toggle');
                
                folderToggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // تبديل حالة المجلد
                    itemElem.classList.toggle('open');
                    
                    // تبديل أيقونة السهم
                    const icon = this.querySelector('i');
                    
                    if (itemElem.classList.contains('open')) {
                        icon.className = 'fas fa-caret-down';
                    } else {
                        icon.className = 'fas fa-caret-right';
                    }
                });
                
                // تبديل عرض المجلد عند النقر على اسمه
                itemElem.addEventListener('click', function(e) {
                    // تجنب تنفيذ هذا عند النقر على أحد العناصر داخل المجلد
                    if (e.target === itemElem || e.target.closest('.folder') === itemElem && !e.target.closest('.folder-content')) {
                        // إيقاف انتشار الحدث
                        e.stopPropagation();
                        
                        // تشغيل نقرة على أيقونة التبديل
                        folderToggle.click();
                    }
                });
            }
            
            parentElement.appendChild(itemElem);
        }
    }
    
    // عرض المجلد الرئيسي
    renderFolder(fileSystem.root, 'root', fileBrowser);
    
    // فتح المجلدات التي تحتوي على الملف النشط
    if (activeFile) {
        openParentFolders(activeFile);
    }
}

// عرض شجرة المجلدات
function renderFolderTree(selectedPath = 'root') {
    const folderTree = document.getElementById('folder-tree');
    folderTree.innerHTML = '';
    
    // إضافة المجلد الرئيسي
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-tree-item';
    rootItem.innerHTML = '<i class="fas fa-folder"></i>المجلد الرئيسي';
    rootItem.setAttribute('data-path', 'root');
    
    if (selectedPath === 'root') {
        rootItem.classList.add('selected');
    }
    
    rootItem.addEventListener('click', function() {
        // إزالة التحديد من جميع العناصر
        document.querySelectorAll('.folder-tree-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // تحديد هذا العنصر
        this.classList.add('selected');
    });
    
    folderTree.appendChild(rootItem);
    
    // وظيفة تكرارية لإضافة المجلدات
    function addFoldersToTree(folder, folderPath, indent = 1) {
        for (const itemName in folder.children) {
            const item = folder.children[itemName];
            
            if (item.type === 'folder') {
                const itemPath = `${folderPath}/${itemName}`;
                const folderItem = document.createElement('div');
                folderItem.className = 'folder-tree-item';
                
                // إضافة مسافة للإزاحة
                let indentHtml = '';
                for (let i = 0; i < indent; i++) {
                    indentHtml += '<span class="indent"></span>';
                }
                
                folderItem.innerHTML = `${indentHtml}<i class="fas fa-folder"></i>${itemName}`;
                folderItem.setAttribute('data-path', itemPath);
                
                if (itemPath === selectedPath) {
                    folderItem.classList.add('selected');
                }
                
                folderItem.addEventListener('click', function() {
                    // إزالة التحديد من جميع العناصر
                    document.querySelectorAll('.folder-tree-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // تحديد هذا العنصر
                    this.classList.add('selected');
                });
                
                folderTree.appendChild(folderItem);
                
                // استدعاء متكرر للمجلدات الفرعية
                addFoldersToTree(item, itemPath, indent + 1);
            }
        }
    }
    
    // إضافة كل المجلدات إلى الشجرة
    addFoldersToTree(fileSystem.root, 'root');
}

// فتح المجلدات الأب للملف المحدد
function openParentFolders(filePath) {
    const parts = filePath.split('/');
    
    // لا داعي للمعالجة إذا كان الملف في المستوى الأعلى
    if (parts.length <= 2) {
        return;
    }
    
    // إزالة الجزء الأخير (اسم الملف)
    parts.pop();
    
    // فتح كل مجلد في المسار
    let currentPath = 'root';
    
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        currentPath += '/' + part;
        
        const folderElem = document.querySelector(`.folder[data-path="${currentPath}"]`);
        
        if (folderElem && !folderElem.classList.contains('open')) {
            // تبديل حالة المجلد
            folderElem.classList.add('open');
            
            // تغيير أيقونة السهم
            const icon = folderElem.querySelector('.folder-toggle i');
            icon.className = 'fas fa-caret-down';
        }
    }
}

// ========== وظائف الملفات ==========
// فتح ملف
function openFile(filePath) {
    const fileObj = getFileSystemObjectByPath(filePath);
    
    if (!fileObj || fileObj.type !== 'file') {
        console.error('الملف غير موجود:', filePath);
        showToast('فشل فتح الملف: الملف غير موجود', 'error');
        return;
    }
    
    // التحقق مما إذا كان الملف مفتوحًا بالفعل
    if (activeFile === filePath) {
        return;
    }
    
    // حفظ الملف النشط الحالي قبل التبديل
    if (activeFile && settings.autoSave) {
        saveFile(activeFile);
    }
    
    // إضافة أو تحديث الملف في قائمة الملفات المفتوحة
    if (!openFiles[filePath]) {
        openFiles[filePath] = {
            isDirty: false
        };
    }
    
    // تحديث الملف النشط
    activeFile = filePath;
    
    // وضع محتوى الملف في المحرر
    editor.session.setValue(fileObj.content);
    editor.clearSelection();
    
    // تغيير وضع المحرر حسب نوع الملف
    setEditorMode(fileObj.fileType);
    
    // تحديث واجهة المستخدم
    updateUIForFile(filePath);
    
    // إضافة إلى التاريخ
    addToHistory(filePath);
    
    // تحديث المعاينة المباشرة إذا كان ملف HTML
    if (filePath.endsWith('.html') && settings.livePreview) {
        updateLivePreview();
    }
    
    // إظهار المحرر
    document.getElementById('editor').style.display = 'block';
    document.querySelector('.no-file-opened').style.display = 'none';
}

// تعيين وضع المحرر حسب نوع الملف
function setEditorMode(fileType) {
    let mode;
    
    switch (fileType) {
        case 'html':
            mode = 'ace/mode/html';
            break;
        case 'css':
            mode = 'ace/mode/css';
            break;
        case 'js':
            mode = 'ace/mode/javascript';
            break;
        case 'json':
            mode = 'ace/mode/json';
            break;
        default:
            mode = 'ace/mode/text';
            break;
    }
    
    editor.session.setMode(mode);
    
    // تحديث مؤشر اللغة في شريط الحالة
    document.getElementById('language-indicator').textContent = 'لغة: ' + fileType.toUpperCase();
}

// تحديث واجهة المستخدم عند فتح ملف
function updateUIForFile(filePath) {
    const fileName = filePath.split('/').pop();
    
    // تحديث علامة التبويب أو إنشاؤها
    updateTabs(filePath, fileName);
    
    // تحديث حالة الملف النشط في مستكشف الملفات
    document.querySelectorAll('.file').forEach(fileElem => {
        fileElem.classList.remove('active');
        
        if (fileElem.getAttribute('data-path') === filePath) {
            fileElem.classList.add('active');
        }
    });
}

// إضافة الملف إلى التاريخ
function addToHistory(filePath) {
    // الحصول على الملف من نظام الملفات
    const fileObj = getFileSystemObjectByPath(filePath);
    
    if (fileObj) {
        // تحديث تاريخ آخر تعديل
        fileObj.lastModified = new Date();
    }
}

// تحديث علامات التبويب
function updateTabs(filePath, fileName) {
    const tabs = document.getElementById('tabs');
    const existingTab = document.querySelector(`.tab[data-path="${filePath}"]`);
    
    if (existingTab) {
        // تنشيط علامة التبويب الموجودة
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        existingTab.classList.add('active');
        return;
    }
    
    // إنشاء علامة تبويب جديدة
    const tab = document.createElement('div');
    tab.className = 'tab active';
    tab.setAttribute('data-path', filePath);
    
    // تحديد أيقونة الملف حسب النوع
    let iconClass = 'fas fa-file';
    const fileType = filePath.split('.').pop();
    
    switch (fileType) {
        case 'html':
            iconClass = 'fab fa-html5';
            break;
        case 'css':
            iconClass = 'fab fa-css3-alt';
            break;
        case 'js':
            iconClass = 'fab fa-js';
            break;
        case 'json':
            iconClass = 'fas fa-code';
            break;
        default:
            iconClass = 'fas fa-file-alt';
            break;
    }
    
    tab.innerHTML = `
        <i class="${iconClass}"></i>
        <span class="file-name">${fileName}</span>
        <span class="dirty-indicator" style="display: none;">*</span>
        <span class="close-btn"><i class="fas fa-times"></i></span>
    `;
    
    // إزالة التنشيط من جميع علامات التبويب الأخرى
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إضافة حدث النقر لتنشيط علامة التبويب
    tab.addEventListener('click', function(e) {
        if (!e.target.closest('.close-btn')) {
            openFile(filePath);
        }
    });
    
    // إضافة حدث إغلاق علامة التبويب
    tab.querySelector('.close-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        closeTab(filePath);
    });
    
    tabs.appendChild(tab);
    
    // تمرير لإظهار علامة التبويب الجديدة
    tabs.scrollLeft = tabs.scrollWidth;
}

// تحديث حالة علامة التبويب (محفوظة/غير محفوظة)
function updateTabStatus(filePath) {
    const tab = document.querySelector(`.tab[data-path="${filePath}"]`);
    
    if (tab) {
        const dirtyIndicator = tab.querySelector('.dirty-indicator');
        
        if (openFiles[filePath].isDirty) {
            dirtyIndicator.style.display = 'inline';
        } else {
            dirtyIndicator.style.display = 'none';
        }
    }
}

// إغلاق علامة تبويب
function closeTab(filePath) {
    // حفظ الملف إذا كان غير محفوظ
    if (openFiles[filePath] && openFiles[filePath].isDirty && settings.autoSave) {
        saveFile(filePath);
    }
    
    // إزالة علامة التبويب
    const tab = document.querySelector(`.tab[data-path="${filePath}"]`);
    
    if (tab) {
        // التحقق مما إذا كانت هذه هي علامة التبويب النشطة
        const isActive = tab.classList.contains('active');
        tab.remove();
        
        // إزالة الملف من قائمة الملفات المفتوحة
        delete openFiles[filePath];
        
        // إذا كانت هذه هي علامة التبويب النشطة، افتح علامة تبويب أخرى أو أغلق المحرر
        if (isActive) {
            // البحث عن علامة تبويب أخرى لفتحها
            const remainingTabs = document.querySelectorAll('.tab');
            
            if (remainingTabs.length > 0) {
                // فتح آخر علامة تبويب
                const lastTab = remainingTabs[remainingTabs.length - 1];
                const newPath = lastTab.getAttribute('data-path');
                
                openFile(newPath);
            } else {
                // لم تعد هناك علامات تبويب مفتوحة، أظهر شاشة "لا توجد ملفات مفتوحة"
                activeFile = null;
                document.getElementById('editor').style.display = 'none';
                document.querySelector('.no-file-opened').style.display = 'flex';
                
                // إخفاء المعاينة المباشرة إذا كانت ظاهرة
                if (settings.livePreview) {
                    document.getElementById('editor-container').classList.remove('editor-split');
                }
            }
        }
    }
}

// حفظ الملف الحالي
function saveCurrentFile() {
    if (activeFile) {
        if (saveFile(activeFile)) {
            showToast('تم حفظ الملف بنجاح', 'success');
        }
    } else {
        showToast('لا يوجد ملف مفتوح للحفظ', 'warning');
    }
}

// حفظ ملف
function saveFile(filePath) {
    if (!filePath || !openFiles[filePath]) {
        return false;
    }
    
    const fileObj = getFileSystemObjectByPath(filePath);
    
    if (!fileObj || fileObj.type !== 'file') {
        showToast('فشل حفظ الملف: الملف غير موجود', 'error');
        return false;
    }
    
    // تحديث محتوى الملف من المحرر إذا كان هذا هو الملف النشط
    if (filePath === activeFile) {
        fileObj.content = editor.getValue();
    }
    
    // تحديث تاريخ آخر تعديل
    fileObj.lastModified = new Date();
    
    // إزالة علامة "غير محفوظ"
    openFiles[filePath].isDirty = false;
    updateTabStatus(filePath);
    
    // حفظ نظام الملفات
    saveFileSystem();
    
    return true;
}

// حفظ جميع الملفات المفتوحة
function saveAllFiles() {
    let count = 0;
    
    for (const filePath in openFiles) {
        if (saveFile(filePath)) {
            count++;
        }
    }
    
    if (count > 0) {
        showToast(`تم حفظ ${count} ملفات بنجاح`, 'success');
    }
    
    return count;
}

// إنشاء ملف جديد
function createNewFile() {
    const modal = document.getElementById('new-file-modal');
    const parentPath = modal.getAttribute('data-parent-path') || 'root';
    const fileName = document.getElementById('new-file-name').value.trim();
    const fileType = document.getElementById('new-file-type').value;
    const templateType = document.getElementById('new-file-template').value;
    
    if (!fileName) {
        alert('يرجى إدخال اسم للملف');
        return;
    }
    
    // إضافة امتداد الملف إذا لم يكن موجودًا
    let finalFileName = fileName;
    
    if (!finalFileName.includes('.')) {
        finalFileName += `.${fileType}`;
    }
    
    // التحقق من وجود الملف
    const parentFolder = getFileSystemObjectByPath(parentPath);
    
    if (!parentFolder || parentFolder.type !== 'folder') {
        alert('المجلد الأب غير صالح');
        return;
    }
    
    if (parentFolder.children[finalFileName]) {
        if (!confirm(`الملف ${finalFileName} موجود بالفعل. هل تريد استبداله؟`)) {
            return;
        }
    }
    
    // تحديد محتوى الملف حسب القالب
    let fileContent = '';
    
    if (fileTemplates[fileType]) {
        fileContent = fileTemplates[fileType][templateType] || '';
    }
    
    // إنشاء كائن الملف
    parentFolder.children[finalFileName] = {
        type: 'file',
        fileType: fileType,
        content: fileContent,
        lastModified: new Date()
    };
    
    // حفظ نظام الملفات
    saveFileSystem();
    
    // تحديث مستكشف الملفات
    renderFileBrowser();
    
    // فتح الملف الجديد
    openFile(`${parentPath}/${finalFileName}`);
    
    // إغلاق المودال
    modal.style.display = 'none';
    
    // إظهار تنبيه
    showToast(`تم إنشاء الملف ${finalFileName} بنجاح`, 'success');
    
    // تحديث إحصاءات المشروع
    updateProjectStats();
}

// إنشاء مجلد جديد
function createNewFolder() {
    const modal = document.getElementById('new-folder-modal');
    const parentPath = modal.getAttribute('data-parent-path') || 'root';
    const folderName = document.getElementById('new-folder-name').value.trim();
    
    if (!folderName) {
        alert('يرجى إدخال اسم للمجلد');
        return;
    }
    
    // التحقق من وجود المجلد
    const parentFolder = getFileSystemObjectByPath(parentPath);
    
    if (!parentFolder || parentFolder.type !== 'folder') {
        alert('المجلد الأب غير صالح');
        return;
    }
    
    if (parentFolder.children[folderName]) {
        if (!confirm(`المجلد ${folderName} موجود بالفعل. هل تريد استبداله؟`)) {
            return;
        }
    }
    
    // إنشاء كائن المجلد
    parentFolder.children[folderName] = {
        type: 'folder',
        children: {}
    };
    
    // حفظ نظام الملفات
    saveFileSystem();
    
    // تحديث مستكشف الملفات
    renderFileBrowser();
    
    // إغلاق المودال
    modal.style.display = 'none';
    
    // إظهار تنبيه
    showToast(`تم إنشاء المجلد ${folderName} بنجاح`, 'success');
    
    // تحديث إحصاءات المشروع
    updateProjectStats();
}

// إعادة تسمية ملف أو مجلد
function renameFileOrFolder(path) {
    const item = getFileSystemObjectByPath(path);
    
    if (!item) {
        showToast('العنصر غير موجود', 'error');
        return;
    }
    
    const parentPath = getParentFolderFromPath(path);
    const currentName = path.split('/').pop();
    const newName = prompt('أدخل الاسم الجديد:', currentName);
    
    if (!newName || newName === currentName) {
        return;
    }
    
    // التحقق من وجود عنصر بنفس الاسم
    const parentFolder = getFileSystemObjectByPath(parentPath);
    
    if (parentFolder.children[newName]) {
        if (!confirm(`يوجد عنصر آخر باسم "${newName}". هل تريد استبداله؟`)) {
            return;
        }
    }
    
    // إذا كان الملف مفتوح، أغلق علامة تبويبه
    if (item.type === 'file' && openFiles[path]) {
        closeTab(path);
    }
    
    // نسخ العنصر باسمه الجديد
    parentFolder.children[newName] = item;
    
    // حذف العنصر القديم
    delete parentFolder.children[currentName];
    
    // حفظ نظام الملفات
    saveFileSystem();
    
    // تحديث مستكشف الملفات
    renderFileBrowser();
    
    // إذا كان ملفًا، افتحه باسمه الجديد
    if (item.type === 'file') {
        openFile(`${parentPath}/${newName}`);
    }
    
    // إظهار تنبيه
    showToast(`تم إعادة تسمية "${currentName}" إلى "${newName}" بنجاح`, 'success');
    
    // تحديث إحصاءات المشروع
    updateProjectStats();
}

// استنساخ ملف أو مجلد
function duplicateFileOrFolder(path) {
    const item = getFileSystemObjectByPath(path);
    
    if (!item) {
        showToast('العنصر غير موجود', 'error');
        return;
    }
    
    const parentPath = getParentFolderFromPath(path);
    const currentName = path.split('/').pop();
    const baseName = currentName.includes('.') ? 
        currentName.substring(0, currentName.lastIndexOf('.')) : 
        currentName;
    const extension = currentName.includes('.') ? 
        currentName.substring(currentName.lastIndexOf('.')) : 
        '';
    
    // إنشاء اسم جديد مع إضافة "نسخة"
    let newName = `${baseName} - نسخة${extension}`;
    let counter = 1;
    
    // التحقق من عدم وجود ملف بنفس الاسم الجديد
    const parentFolder = getFileSystemObjectByPath(parentPath);
    
    while (parentFolder.children[newName]) {
        counter++;
        newName = `${baseName} - نسخة ${counter}${extension}`;
    }
    
    // نسخ العنصر
    if (item.type === 'file') {
        // نسخ ملف
        parentFolder.children[newName] = {
            type: 'file',
            fileType: item.fileType,
            content: item.content,
            lastModified: new Date()
        };
        
        // حفظ نظام الملفات
        saveFileSystem();
        
        // تحديث مستكشف الملفات
        renderFileBrowser();
        
        // فتح الملف الجديد
        openFile(`${parentPath}/${newName}`);
    } else if (item.type === 'folder') {
        // نسخ مجلد بشكل متكرر
        parentFolder.children[newName] = {
            type: 'folder',
            children: {}
        };
        
        // وظيفة متكررة لنسخ محتويات المجلد
        function copyFolderContents(source, target) {
            for (const itemName in source.children) {
                const sourceItem = source.children[itemName];
                
                if (sourceItem.type === 'file') {
                    target.children[itemName] = {
                        type: 'file',
                        fileType: sourceItem.fileType,
                        content: sourceItem.content,
                        lastModified: new Date()
                    };
                } else if (sourceItem.type === 'folder') {
                    target.children[itemName] = {
                        type: 'folder',
                        children: {}
                    };
                    
                    copyFolderContents(sourceItem, target.children[itemName]);
                }
            }
        }
        
        // نسخ محتويات المجلد
        copyFolderContents(item, parentFolder.children[newName]);
        
        // حفظ نظام الملفات
        saveFileSystem();
        
        // تحديث مستكشف الملفات
        renderFileBrowser();
    }
    
    // إظهار تنبيه
    showToast(`تم استنساخ "${currentName}" إلى "${newName}" بنجاح`, 'success');
    
    // تحديث إحصاءات المشروع
    updateProjectStats();
}

// حذف ملف أو مجلد
function deleteFileOrFolder(path) {
    const item = getFileSystemObjectByPath(path);
    
    if (!item) {
        showToast('العنصر غير موجود', 'error');
        return;
    }
    
    const parentPath = getParentFolderFromPath(path);
    const itemName = path.split('/').pop();
    
    // التحقق من المجلد الأب
    const parentFolder = getFileSystemObjectByPath(parentPath);
    
    if (!parentFolder || parentFolder.type !== 'folder') {
        showToast('المجلد الأب غير صالح', 'error');
        return;
    }
    
    // إذا كان الملف مفتوح، أغلق علامة تبويبه
    if (item.type === 'file' && openFiles[path]) {
        closeTab(path);
    } else if (item.type === 'folder') {
        // إغلاق جميع الملفات المفتوحة داخل هذا المجلد
        for (const filePath in openFiles) {
            if (filePath.startsWith(path + '/')) {
                closeTab(filePath);
            }
        }
    }
    
    // حذف العنصر
    delete parentFolder.children[itemName];
    
    // حفظ نظام الملفات
    saveFileSystem();
    
    // تحديث مستكشف الملفات
    renderFileBrowser();
    
    // إظهار تنبيه
    showToast(`تم حذف "${itemName}" بنجاح`, 'success');
    
    // تحديث إحصاءات المشروع
    updateProjectStats();
}

// نسخ مسار ملف أو مجلد
function copyPath(path) {
    // إنشاء عنصر مؤقت لنسخ النص
    const tempInput = document.createElement('input');
    tempInput.value = path;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // إظهار تنبيه
    showToast(`تم نسخ المسار "${path}" إلى الحافظة`, 'success');
}

// تنزيل ملف أو مجلد
function downloadFileOrFolder(path) {
    const item = getFileSystemObjectByPath(path);
    
    if (!item) {
        showToast('العنصر غير موجود', 'error');
        return;
    }
    
    const itemName = path.split('/').pop();
    
    if (item.type === 'file') {
        // تنزيل ملف
        const blob = new Blob([item.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = itemName;
        a.click();
        
        URL.revokeObjectURL(url);
        
        showToast(`تم تنزيل الملف "${itemName}" بنجاح`, 'success');
    } else if (item.type === 'folder') {
        // تنزيل مجلد كملف مضغوط
        const zip = new JSZip();
        
        // وظيفة متكررة لإضافة الملفات إلى الملف المضغوط
        function addFolderToZip(folder, folderPath, zipFolder) {
            for (const childName in folder.children) {
                const child = folder.children[childName];
                
                if (child.type === 'file') {
                    zipFolder.file(childName, child.content);
                } else if (child.type === 'folder') {
                    const newZipFolder = zipFolder.folder(childName);
                    addFolderToZip(child, `${folderPath}/${childName}`, newZipFolder);
                }
            }
        }
        
        // إضافة محتويات المجلد إلى الملف المضغوط
        addFolderToZip(item, path, zip);
        
        // توليد الملف المضغوط وتنزيله
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            const url = URL.createObjectURL(content);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${itemName}.zip`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            showToast(`تم تنزيل المجلد "${itemName}" بنجاح`, 'success');
        });
    }
}

// ========== وظائف القوالب وقصاصات الكود ==========
// إدراج قالب كود
function insertCodeSnippet(snippetName) {
    if (!activeFile) {
        showToast('يرجى فتح ملف أولاً', 'warning');
        return;
    }
    
    const snippet = codeSnippets[snippetName];
    
    if (!snippet) {
        showToast('قالب الكود غير موجود', 'error');
        return;
    }
    
    // إدراج القالب في المحرر
    editor.insert(snippet);
    
    // تنسيق الكود بعد الإدراج
    formatCode();
    
    // عرض تنبيه
    showToast('تم إدراج قالب الكود بنجاح', 'success');
}

// تحديث موضع المؤشر في شريط الحالة
function updateCursorPosition() {
    const position = editor.getCursorPosition();
    document.getElementById('cursor-position').textContent = `السطر: ${position.row + 1}، العمود: ${position.column + 1}`;
}

// ========== وظائف الإعدادات ==========
// حفظ الإعدادات
function saveSettings() {
    try {
        localStorage.setItem('editor-settings', JSON.stringify(settings));
    } catch (e) {
        console.error('فشل حفظ الإعدادات:', e);
    }
}

// استرجاع الإعدادات
function loadSettings() {
    try {
        const storedSettings = localStorage.getItem('editor-settings');
        if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            // دمج الإعدادات المخزنة مع الإعدادات الافتراضية
            settings = { ...settings, ...parsedSettings };
        }
    } catch (e) {
        console.error('فشل تحميل الإعدادات:', e);
    }
    
    // تطبيق الإعدادات على المحرر
    if (editor) {
        editor.setTheme("ace/theme/" + settings.editorTheme);
        editor.setFontSize(settings.fontSize);
        editor.setShowInvisibles(settings.showInvisibles);
        editor.setOption("wrap", settings.wrapLines);
        editor.session.setTabSize(settings.tabSize);
    }
    
    // تحديث قيم عناصر الإعدادات في واجهة المستخدم
    document.getElementById('editor-theme').value = settings.editorTheme;
    document.getElementById('editor-font-size').value = settings.fontSize;
}

// تطبيق السمة
function applyTheme() {
    if (settings.theme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.remove('light-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// تبديل السمة (فاتح/داكن)
function toggleTheme() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    saveSettings();
    applyTheme();
}

// ========== وظائف تنسيق الكود ==========
// تنسيق الكود
function formatCode() {
    if (!activeFile) {
        showToast('يرجى فتح ملف أولاً', 'warning');
        return;
    }
    
    const fileObj = getFileSystemObjectByPath(activeFile);
    if (!fileObj) {
        return;
    }
    
    try {
        let beautify;
        let formattedCode;
        
        // استخدام ace-builds/src-noconflict/ext-beautify.js
        beautify = ace.require("ace/ext/beautify");
        
        if (beautify && beautify.beautify) {
            // تنسيق الكود باستخدام Ace beautify
            beautify.beautify(editor.session);
            showToast('تم تنسيق الكود بنجاح', 'success');
        } else {
            // تنسيق يدوي حسب نوع الملف
            formattedCode = formatByFileType(editor.getValue(), fileObj.fileType);
            editor.setValue(formattedCode);
            editor.clearSelection();
            showToast('تم تنسيق الكود بنجاح', 'success');
        }
        
        // تحديث التاريخ
        addToHistory(activeFile);
        
        // تحديث حالة الملف
        openFiles[activeFile].isDirty = true;
        updateTabStatus(activeFile);
    } catch (error) {
        console.error('خطأ في تنسيق الكود:', error);
        showToast('فشل تنسيق الكود', 'error');
    }
}

// تنسيق الكود حسب نوع الملف
function formatByFileType(code, fileType) {
    // تنظيف الأكواد المختلفة حسب نوع الملف
    switch (fileType) {
        case 'html':
            return formatHTML(code);
        case 'css':
            return formatCSS(code);
        case 'js':
            return formatJS(code);
        case 'json':
            try {
                return JSON.stringify(JSON.parse(code), null, 4);
            } catch (e) {
                return code;
            }
        default:
            return code;
    }
}

// تنسيق HTML بطريقة مبسطة
function formatHTML(code) {
    // تنظيف الأسطر الفارغة المتتالية
    code = code.replace(/(\r\n|\n|\r){2,}/gm, '\n\n');
    
    // إضافة مسافات بادئة للوسوم
    let formatted = '';
    let indent = 0;
    const lines = code.split('\n');
    
    for (let line of lines) {
        line = line.trim();
        if (!line) {
            formatted += '\n';
            continue;
        }
        
        // تقليل المسافة البادئة للوسوم المغلقة
        if (line.match(/^<\/[^>]+>/) || line.match(/^<([^>]+)>.*<\/\1>$/)) {
            indent = Math.max(0, indent - 1);
        }
        
        // إضافة المسافة البادئة الحالية
        formatted += ' '.repeat(indent * 4) + line + '\n';
        
        // زيادة المسافة البادئة للوسوم المفتوحة
        if (line.match(/^<[^\/!][^>]*[^\/]>$/) && !line.match(/<(meta|link|img|br|hr|input)[^>]*>/i)) {
            indent++;
        }
    }
    
    return formatted.trim();
}

// تنسيق CSS بطريقة مبسطة
function formatCSS(code) {
    // تنظيف الفراغات الزائدة
    code = code.replace(/\s+/g, ' ');
    code = code.replace(/\{ /g, '{');
    code = code.replace(/ \}/g, '}');
    code = code.replace(/\: /g, ':');
    code = code.replace(/\; /g, ';');
    
    // إضافة أسطر جديدة
    code = code.replace(/\{/g, ' {\n    ');
    code = code.replace(/\}/g, '\n}\n');
    code = code.replace(/\;/g, ';\n    ');
    code = code.replace(/\n    \n/g, '\n');
    
    // تنظيف الأسطر الفارغة المتتالية
    code = code.replace(/(\r\n|\n|\r){2,}/gm, '\n\n');
    
    return code.trim();
}

// تنسيق JavaScript بطريقة مبسطة
function formatJS(code) {
    // في المشروع الأصلي، يتم استخدام محرر Ace لتنسيق JS
    // لتحسين الدقة، يمكننا إضافة منطق تنسيق بسيط
    
    // تنظيف الفراغات الزائدة
    code = code.replace(/\s+/g, ' ');
    code = code.replace(/\{ /g, '{');
    code = code.replace(/ \}/g, '}');
    code = code.replace(/\: /g, ':');
    code = code.replace(/\; /g, ';');
    
    // إضافة أسطر جديدة للأقواس
    code = code.replace(/\{/g, ' {\n');
    code = code.replace(/\}/g, '\n}\n');
    
    // تنسيق الشروط والحلقات
    code = code.replace(/(if|for|while|switch|function)\s*\(/g, '$1 (');
    
    // تنسيق الأقواس المغلقة المتبوعة بـ else
    code = code.replace(/\}\s*else/g, '} else');
    
    // تنظيف الأسطر الفارغة المتتالية
    code = code.replace(/(\r\n|\n|\r){2,}/gm, '\n\n');
    
    return code;
}

// ========== وظائف البحث والاستبدال ==========
// إظهار/إخفاء شريط البحث
function toggleSearchBar(showReplace = false) {
    const searchBar = document.getElementById('search-bar');
    
    if (searchBar.style.display === 'flex') {
        searchBar.style.display = 'none';
        editor.focus();
    } else {
        searchBar.style.display = 'flex';
        
        if (showReplace) {
            document.getElementById('replace-input').style.display = 'block';
            document.getElementById('replace-btn').style.display = 'inline-block';
            document.getElementById('replace-all-btn').style.display = 'inline-block';
        } else {
            document.getElementById('replace-input').style.display = 'none';
            document.getElementById('replace-btn').style.display = 'none';
            document.getElementById('replace-all-btn').style.display = 'none';
        }
        
        document.getElementById('search-input').focus();
        
        // إذا كان هناك نص محدد، ضعه في حقل البحث
        const selectedText = editor.getSelectedText();
        if (selectedText) {
            document.getElementById('search-input').value = selectedText;
        }
    }
}

// البحث عن التالي
function searchNext() {
    const searchText = document.getElementById('search-input').value;
    
    if (!searchText) {
        return;
    }
    
    editor.find(searchText, {
        backwards: false,
        wrap: true,
        caseSensitive: false,
        wholeWord: false,
        regExp: false
    });
}

// البحث عن السابق
function searchPrev() {
    const searchText = document.getElementById('search-input').value;
    
    if (!searchText) {
        return;
    }
    
    editor.find(searchText, {
        backwards: true,
        wrap: true,
        caseSensitive: false,
        wholeWord: false,
        regExp: false
    });
}

// استبدال النص المحدد
function replaceSelection() {
    const searchText = document.getElementById('search-input').value;
    const replaceText = document.getElementById('replace-input').value;
    
    if (!searchText) {
        return;
    }
    
    // البحث أولاً
    editor.find(searchText, {
        backwards: false,
        wrap: true,
        caseSensitive: false,
        wholeWord: false,
        regExp: false
    });
    
    // ثم الاستبدال إذا تم العثور على شيء
    const range = editor.selection.getRange();
    if (!range.isEmpty()) {
        editor.session.replace(range, replaceText);
        
        // البحث عن التالي
        searchNext();
    }
}

// استبدال كل المطابقات
function replaceAll() {
    const searchText = document.getElementById('search-input').value;
    const replaceText = document.getElementById('replace-input').value;
    
    if (!searchText) {
        return;
    }
    
    // الحصول على محتوى المحرر
    let content = editor.getValue();
    
    // إنشاء تعبير عادي لمطابقة النص
    const regex = new RegExp(searchText, 'g');
    
    // استبدال كل المطابقات
    const newContent = content.replace(regex, replaceText);
    
    // تحديث المحرر
    editor.setValue(newContent);
    editor.clearSelection();
    
    // إحصاء عدد الاستبدالات
    const count = (content.match(regex) || []).length;
    
    // عرض تنبيه
    showToast(`تم استبدال ${count} مطابقات`, 'success');
}

// ========== وظائف الخادم المحلي ==========
// تشغيل التطبيق
function runApplication(reload = false) {
    if (serverRunning && !reload) {
        // إيقاف الخادم
        stopServer();
        return;
    }
    
    // حفظ جميع الملفات المفتوحة قبل التشغيل
    saveAllFiles();
    
    // البحث عن ملف HTML للتشغيل
    let htmlFilePath;
    
    if (activeFile && activeFile.endsWith('.html')) {
        htmlFilePath = activeFile;
    } else {
        // البحث عن index.html في المجلد الرئيسي
        htmlFilePath = 'root/index.html';
        
        // تحقق من وجود الملف
        if (!getFileSystemObjectByPath(htmlFilePath)) {
            // البحث عن أي ملف HTML
            const htmlFiles = findAllFilesOfType('html');
            if (htmlFiles.length > 0) {
                htmlFilePath = htmlFiles[0];
            } else {
                showToast('لم يتم العثور على ملف HTML لتشغيله', 'error');
                return;
            }
        }
    }
    
    // بدء الخادم
    startServer(htmlFilePath);
}

// وظيفة للبحث عن جميع الملفات من نوع معين
function findAllFilesOfType(fileType) {
    const results = [];
    
    function searchInFolder(folderPath, folder) {
        if (!folder.children) {
            return;
        }
        
        for (const itemName in folder.children) {
            const item = folder.children[itemName];
            const itemPath = `${folderPath}/${itemName}`;
            
            if (item.type === 'file' && item.fileType === fileType) {
                results.push(itemPath);
            } else if (item.type === 'folder') {
                searchInFolder(itemPath, item);
            }
        }
    }
    
    searchInFolder('root', fileSystem.root);
    return results;
}

// بدء الخادم المحلي
function startServer(htmlFilePath) {
    // تحديث حالة الخادم
    const parentFolderPath = getParentFolderFromPath(htmlFilePath);
    updateServerStatus(true, parentFolderPath);
    
    // إظهار حاوية المعاينة
    document.getElementById('preview-container').style.display = 'block';
    document.getElementById('editor-container').style.display = 'none';
    
    // إظهار وحدة التحكم
    showConsole();
    clearConsole();
    consoleLog('بدء تشغيل الخادم...', 'info');
    
    // تحضير الـ iframe
    const iframe = document.getElementById('preview-iframe');
    
    // تهيئة محتوى الـ iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    
    // إضافة كود الاعتراض للـ console.log
    const interceptCode = `
        <script>
            // اعتراض وظائف وحدة التحكم
            (function() {
                const originalConsoleLog = console.log;
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;
                const originalConsoleInfo = console.info;
                
                // وظيفة لإرسال الرسائل إلى وحدة التحكم الرئيسية
                function sendToParentConsole(message, type) {
                    window.parent.postMessage({
                        type: 'console',
                        logType: type,
                        message: typeof message === 'object' ? JSON.stringify(message) : String(message)
                    }, '*');
                }
                
                // اعتراض وظائف وحدة التحكم
                console.log = function() {
                    originalConsoleLog.apply(console, arguments);
                    sendToParentConsole(arguments[0], 'log');
                };
                
                console.error = function() {
                    originalConsoleError.apply(console, arguments);
                    sendToParentConsole(arguments[0], 'error');
                };
                
                console.warn = function() {
                    originalConsoleWarn.apply(console, arguments);
                    sendToParentConsole(arguments[0], 'warning');
                };
                
                console.info = function() {
                    originalConsoleInfo.apply(console, arguments);
                    sendToParentConsole(arguments[0], 'info');
                };
                
                // اعتراض أخطاء JavaScript
                window.addEventListener('error', function(event) {
                    sendToParentConsole(event.message + ' (في ' + event.filename + ':' + event.lineno + ')', 'error');
                });
                
                // حل المسارات النسبية
                function resolveUrl(url) {
                    if (url.startsWith('http') || url.startsWith('//')) {
                        return url;
                    }
                    
                    // إرسال طلب للحصول على المحتوى من الأب
                    return new Promise((resolve, reject) => {
                        const requestId = Date.now() + Math.random().toString(36).substring(2, 15);
                        
                        window.addEventListener('message', function handler(event) {
                            if (event.data.requestId === requestId) {
                                window.removeEventListener('message', handler);
                                
                                if (event.data.error) {
                                    reject(new Error(event.data.error));
                                } else {
                                    resolve(event.data.content);
                                }
                            }
                        });
                        
                        window.parent.postMessage({
                            type: 'resolveUrl',
                            url: url,
                            requestId: requestId
                        }, '*');
                    });
                }
                
                // اعتراض طلبات الموارد (صور، CSS، JS، إلخ)
                window.resolveUrl = resolveUrl;
            })();
        </script>
    `;
    
    // إضافة محتوى الملف الرئيسي
    const htmlFile = getFileSystemObjectByPath(htmlFilePath);
    if (htmlFile) {
        let htmlContent = htmlFile.content;
        
        // إدراج كود الاعتراض قبل نهاية وسم head
        if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', interceptCode + '</head>');
        } else {
            // إذا لم يتم العثور على وسم head، قم بإضافته
            htmlContent = '<!DOCTYPE html>\n<html>\n<head>' + interceptCode + '</head>\n<body>' + htmlContent + '</body>\n</html>';
        }
        
        iframeDoc.write(htmlContent);
    }
    
    iframeDoc.close();
    
    // معالجة الرسائل من الـ iframe
    window.addEventListener('message', handleIframeMessage);
    
    consoleLog('تم بدء الخادم بنجاح. يمكنك الآن رؤية تطبيقك قيد التشغيل.', 'info');
}

// إيقاف الخادم
function stopServer() {
    // تحديث حالة الخادم
    updateServerStatus(false);
    
    // إخفاء حاوية المعاينة
    document.getElementById('preview-container').style.display = 'none';
    document.getElementById('editor-container').style.display = 'block';
    
    // إزالة مستمع الرسائل
    window.removeEventListener('message', handleIframeMessage);
    
    // مسح محتوى الـ iframe
    const iframe = document.getElementById('preview-iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write('<html><body></body></html>');
    iframeDoc.close();
    
    consoleLog('تم إيقاف الخادم.', 'info');
}

// معالجة الرسائل من الـ iframe
function handleIframeMessage(event) {
    if (!event.data || typeof event.data !== 'object') {
        return;
    }
    
    switch (event.data.type) {
        case 'console':
            // رسالة من وحدة تحكم الـ iframe
            consoleLog(event.data.message, event.data.logType || 'log');
            break;
            
        case 'resolveUrl':
            // طلب حل عنوان URL
            handleUrlResolution(event.data);
            break;
    }
}
// معالجة حل عناوين URL
function handleUrlResolution(data) {
    const baseUrl = serverRootPath;
    const fullPath = resolvePath(baseUrl, data.url);
    const fileObj = getFileSystemObjectByPath(fullPath);
    
    const response = {
        requestId: data.requestId
    };
    
    if (fileObj && fileObj.type === 'file') {
        response.content = fileObj.content;
        response.mimeType = getMimeType(fullPath);
    } else {
        response.error = `الملف غير موجود: ${data.url}`;
        consoleLog(`خطأ: الملف غير موجود - ${data.url}`, 'error');
    }
    
    // إرسال الرد إلى الـ iframe
    document.getElementById('preview-iframe').contentWindow.postMessage(response, '*');
}

// تحسين معالجة المسارات النسبية
function resolvePath(basePath, relativePath) {
    // إذا كان المسار مطلقًا (يبدأ بـ '/')
    if (relativePath.startsWith('/')) {
        return 'root' + relativePath;
    }
    
    // إزالة ./ من بداية المسار النسبي
    if (relativePath.startsWith('./')) {
        relativePath = relativePath.substring(2);
    }
    
    // الانتقال إلى المجلد الأب
    const parts = basePath.split('/');
    const relativeParts = relativePath.split('/');
    
    while (relativeParts.length > 0) {
        const part = relativeParts[0];
        
        if (part === '..') {
            // الانتقال إلى المجلد الأب
            parts.pop();
            relativeParts.shift();
        } else {
            break;
        }
    }
    
    return parts.join('/') + '/' + relativeParts.join('/');
}

// الحصول على نوع MIME حسب امتداد الملف
function getMimeType(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'html':
        case 'htm':
            return 'text/html';
        case 'css':
            return 'text/css';
        case 'js':
            return 'application/javascript';
        case 'json':
            return 'application/json';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        default:
            return 'text/plain';
    }
}

// تحديث حالة الخادم
function updateServerStatus(isRunning, rootPath = '') {
    const statusElement = document.getElementById('server-status');
    serverRunning = isRunning;
    serverRootPath = rootPath;
    
    if (isRunning) {
        statusElement.classList.remove('offline');
        statusElement.innerHTML = '<i class="fas fa-circle"></i>الخادم: نشط';
        document.getElementById('run-button').innerHTML = '<i class="fas fa-stop"></i>إيقاف';
    } else {
        statusElement.classList.add('offline');
        statusElement.innerHTML = '<i class="fas fa-circle"></i>الخادم: غير نشط';
        document.getElementById('run-button').innerHTML = '<i class="fas fa-play"></i>تشغيل';
    }
}

// تغيير جهاز المعاينة
function changePreviewDevice() {
    const deviceValue = document.getElementById('preview-device').value;
    const previewContainer = document.getElementById('preview-container');
    
    // إزالة جميع أصناف الأجهزة
    previewContainer.classList.remove('device-desktop', 'device-laptop', 'device-tablet', 'device-mobile');
    
    // إضافة الصنف المناسب
    if (deviceValue !== 'responsive') {
        previewContainer.classList.add('device-' + deviceValue);
    }
}

// ========== وظائف وحدة التحكم ==========
// إضافة وظيفة سجل وحدة التحكم
function consoleLog(message, type = 'log') {
    const consoleContent = document.getElementById('console-content');
    const logElement = document.createElement('div');
    logElement.className = `console-log ${type}`;
    
    // تنسيق الرسالة
    let formattedMessage = message;
    
    // التعامل مع الكائنات
    if (typeof message === 'object') {
        try {
            formattedMessage = JSON.stringify(message, null, 2);
        } catch (e) {
            formattedMessage = message.toString();
        }
    }
    
    // إضافة الوقت
    const now = new Date();
    const time = now.toLocaleTimeString('ar-EG');
    const timestamp = document.createElement('span');
    timestamp.className = 'console-timestamp';
    timestamp.textContent = `[${time}] `;
    
    logElement.appendChild(timestamp);
    logElement.appendChild(document.createTextNode(formattedMessage));
    consoleContent.appendChild(logElement);
    
    // تمرير إلى الأسفل
    consoleContent.scrollTop = consoleContent.scrollHeight;
}

// مسح وحدة التحكم
function clearConsole() {
    document.getElementById('console-content').innerHTML = '';
}

// إظهار وحدة التحكم
function showConsole() {
    document.getElementById('console-container').style.display = 'flex';
}

// إخفاء وحدة التحكم
function hideConsole() {
    document.getElementById('console-container').style.display = 'none';
}

// تبديل عرض وحدة التحكم
function toggleConsole() {
    const consoleContainer = document.getElementById('console-container');
    
    if (consoleContainer.style.display === 'flex') {
        hideConsole();
    } else {
        showConsole();
    }
}

// ========== وظائف المعاينة المباشرة ==========
// تحديث المعاينة المباشرة
function updateLivePreview() {
    if (!activeFile || !activeFile.endsWith('.html')) {
        return;
    }
    
    const livePreview = document.getElementById('live-preview');
    const htmlContent = editor.getValue();
    
    // تحديث المحتوى
    livePreview.innerHTML = '';
    
    // إنشاء iframe محلي
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    livePreview.appendChild(iframe);
    
    // تحديث محتوى الـ iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
}

// تبديل المعاينة المباشرة
function toggleLivePreview() {
    if (!activeFile || !activeFile.endsWith('.html')) {
        showToast('المعاينة المباشرة متاحة فقط لملفات HTML', 'warning');
        return;
    }
    
    settings.livePreview = !settings.livePreview;
    saveSettings();
    
    if (settings.livePreview) {
        document.getElementById('editor-container').classList.add('editor-split');
        updateLivePreview();
        showToast('تم تفعيل المعاينة المباشرة', 'success');
    } else {
        document.getElementById('editor-container').classList.remove('editor-split');
        showToast('تم إلغاء تفعيل المعاينة المباشرة', 'info');
    }
}

// ========== وظائف التنبيهات ==========
// إظهار إشعار الحفظ
function showSaveNotification() {
    const notification = document.querySelector('.autosave-notification');
    notification.classList.add('show');
    
    // إخفاء الإشعار بعد ثانيتين
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// عرض تنبيه
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    
    // إنشاء عنصر التنبيه
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // تحديد الأيقونة حسب النوع
    let icon = 'info-circle';
    let title = 'معلومات';
    
    switch (type) {
        case 'success':
            icon = 'check-circle';
            title = 'نجاح';
            break;
        case 'error':
            icon = 'times-circle';
            title = 'خطأ';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            title = 'تحذير';
            break;
    }
    
    // إنشاء محتوى التنبيه
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    // إضافة التنبيه إلى الحاوية
    container.appendChild(toast);
    
    // إضافة مستمع لإغلاق التنبيه
    toast.querySelector('.toast-close').addEventListener('click', function() {
        closeToast(toast);
    });
    
    // إغلاق التنبيه تلقائيًا بعد فترة
    setTimeout(() => {
        closeToast(toast);
    }, duration);
}

// إغلاق تنبيه
function closeToast(toast) {
    toast.classList.add('closing');
    
    // إزالة التنبيه بعد انتهاء الرسوم المتحركة
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

// ========== وظائف الحفظ التلقائي ==========
// بدء الحفظ التلقائي
function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    
    autoSaveTimer = setInterval(() => {
        if (settings.autoSave) {
            autoSaveFiles();
        }
    }, settings.autoSaveInterval);
    
    document.getElementById('autosave-status').textContent = 'حفظ تلقائي: مفعل';
}

// إيقاف الحفظ التلقائي
function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
    
    document.getElementById('autosave-status').textContent = 'حفظ تلقائي: معطل';
}

// تبديل الحفظ التلقائي
function toggleAutoSave() {
    settings.autoSave = !settings.autoSave;
    saveSettings();
    
    if (settings.autoSave) {
        startAutoSave();
        showToast('تم تفعيل الحفظ التلقائي', 'success');
    } else {
        stopAutoSave();
        showToast('تم تعطيل الحفظ التلقائي', 'info');
    }
}

// وظيفة الحفظ التلقائي
function autoSaveFiles() {
    let count = 0;
    
    for (const filePath in openFiles) {
        if (openFiles[filePath].isDirty) {
            if (saveFile(filePath)) {
                count++;
            }
        }
    }
    
    if (count > 0) {
        showSaveNotification();
    }
}

// ========== وظائف رفع الملفات ==========
// عرض مودال رفع الملفات
function showUploadModal() {
    document.getElementById('upload-file-modal').style.display = 'flex';
    document.getElementById('upload-file-input').value = '';
    document.getElementById('upload-file-list').innerHTML = '';
    document.getElementById('upload-file-modal').setAttribute('data-parent-path', 'root');
    document.getElementById('upload-destination-path').textContent = 'المجلد الرئيسي';
}

// معالجة تحديد الملفات
function handleFileSelection(event) {
    const fileList = document.getElementById('upload-file-list');
    fileList.innerHTML = '';
    
    let files;
    
    if (event.dataTransfer) {
        files = event.dataTransfer.files;
    } else {
        files = event.target.files;
    }
    
    if (files && files.length > 0) {
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.textContent = file.name;
            fileList.appendChild(fileItem);
        });
        
        // عرض مودال رفع الملفات إذا تم سحب الملفات
        if (event.dataTransfer) {
            showUploadModal();
        }
    }
}

// وظيفة لرفع الملفات
function uploadFiles() {
    const modal = document.getElementById('upload-file-modal');
    const parentPath = modal.getAttribute('data-parent-path');
    const files = document.getElementById('upload-file-input').files;
    
    if (files.length === 0) {
        alert('يرجى اختيار ملف واحد على الأقل');
        return;
    }
    
    const parentFolder = getFileSystemObjectByPath(parentPath);
    
    if (!parentFolder || parentFolder.type !== 'folder') {
        alert('المجلد الأب غير صالح');
        return;
    }
    
    // قراءة كل ملف
    let uploadedCount = 0;
    
    Array.from(files).forEach(file => {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        // تحديد نوع الملف
        let fileType = 'txt';
        if (fileExtension === 'html' || fileExtension === 'htm') {
            fileType = 'html';
        } else if (fileExtension === 'css') {
            fileType = 'css';
        } else if (fileExtension === 'js') {
            fileType = 'js';
        } else if (fileExtension === 'json') {
            fileType = 'json';
        }
        
        // التحقق من وجود الملف
        if (parentFolder.children[fileName]) {
            if (!confirm(`الملف ${fileName} موجود بالفعل. هل تريد استبداله؟`)) {
                return;
            }
        }
        
        // قراءة محتوى الملف
        const reader = new FileReader();
        reader.onload = function(e) {
            // إضافة الملف إلى النظام الملفي
            parentFolder.children[fileName] = {
                type: 'file',
                fileType: fileType,
                content: e.target.result,
                lastModified: new Date()
            };
            
            uploadedCount++;
            
            // إذا كانت هذه هي الملف الأخير
            if (uploadedCount === files.length) {
                // حفظ نظام الملفات
                saveFileSystem();
                
                // إعادة رسم مستكشف الملفات
                renderFileBrowser();
                
                // تحديث إحصاءات المشروع
                updateProjectStats();
                
                // إغلاق المودال
                modal.style.display = 'none';
                
                // عرض تنبيه
                showToast(`تم رفع ${uploadedCount} ملفات بنجاح`, 'success');
            }
        };
        
        reader.readAsText(file);
    });
}

// عرض مودال اختيار المجلد
function showFolderSelectModal() {
    document.getElementById('folder-select-modal').style.display = 'flex';
    renderFolderTree(document.getElementById('upload-file-modal').getAttribute('data-parent-path'));
}

// اختيار مجلد الوجهة
function selectUploadDestination() {
    const selectedFolder = document.querySelector('.folder-tree-item.selected');
    
    if (selectedFolder) {
        const folderPath = selectedFolder.getAttribute('data-path');
        const folderName = folderPath.split('/').pop();
        
        document.getElementById('upload-file-modal').setAttribute('data-parent-path', folderPath);
        document.getElementById('upload-destination-path').textContent = folderName || 'المجلد الرئيسي';
    }
    
    document.getElementById('folder-select-modal').style.display = 'none';
}

// ========== وظائف تصدير المشروع ==========
// عرض مودال تصدير المشروع
function showExportModal() {
    document.getElementById('export-modal').style.display = 'flex';
}

// تصدير المشروع
function exportProject() {
    // حفظ جميع الملفات المفتوحة أولاً
    saveAllFiles();
    
    const fileName = document.getElementById('export-file-name').value || 'my-project.zip';
    const includeAll = document.getElementById('export-include-all').checked;
    const minify = document.getElementById('export-minify').checked;
    
    // إنشاء ملف مضغوط
    const zip = new JSZip();
    
    // إضافة الملفات للملف المضغوط
    function addFolderToZip(folderObj, folderPath, zipFolder) {
        for (const itemName in folderObj.children) {
            const item = folderObj.children[itemName];
            
            if (item.type === 'file') {
                let content = item.content;
                
                // تصغير الكود إذا كان مفعلاً
                if (minify && (item.fileType === 'css' || item.fileType === 'js')) {
                    content = minifyCode(content, item.fileType);
                }
                
                zipFolder.file(itemName, content);
            } else if (item.type === 'folder') {
                // إضافة المجلد
                const newZipFolder = zipFolder.folder(itemName);
                addFolderToZip(item, `${folderPath}/${itemName}`, newZipFolder);
            }
        }
    }
    
    // إضافة المحتويات للملف المضغوط
    if (includeAll) {
        // تصدير كامل المشروع
        addFolderToZip(fileSystem.root, '', zip);
    } else {
        // تصدير فقط المجلد الحالي إذا كان هناك ملف نشط
        if (activeFile) {
            const folderPath = getParentFolderFromPath(activeFile);
            const folder = getFileSystemObjectByPath(folderPath);
            
            if (folder) {
                addFolderToZip(folder, '', zip);
            } else {
                // تصدير المجلد الرئيسي
                addFolderToZip(fileSystem.root, '', zip);
            }
        } else {
            // تصدير المجلد الرئيسي
            addFolderToZip(fileSystem.root, '', zip);
        }
    }
    
    // توليد الملف المضغوط وتنزيله
    zip.generateAsync({ type: 'blob' }).then(function(content) {
        saveAs(content, fileName);
        
        // إغلاق المودال
        document.getElementById('export-modal').style.display = 'none';
        
        // عرض تنبيه
        showToast('تم تصدير المشروع بنجاح', 'success');
    });
}

// تصغير الكود
function minifyCode(code, type) {
    switch (type) {
        case 'css':
            // تصغير CSS بطريقة بسيطة
            return code
                .replace(/\/\*[\s\S]*?\*\//g, '') // إزالة التعليقات
                .replace(/\s+/g, ' ') // استبدال الفراغات المتعددة بفراغ واحد
                .replace(/\s*{\s*/g, '{') // إزالة الفراغات حول الأقواس
                .replace(/\s*}\s*/g, '}')
                .replace(/\s*:\s*/g, ':')
                .replace(/\s*;\s*/g, ';')
                .replace(/;\s*}/g, '}') // إزالة الفاصلة المنقوطة الأخيرة
                .trim();
            
        case 'js':
            // تصغير JavaScript بطريقة بسيطة
            return code
                .replace(/\/\/.*$/gm, '') // إزالة تعليقات السطر الواحد
                .replace(/\/\*[\s\S]*?\*\//g, '') // إزالة تعليقات متعددة الأسطر
                .replace(/\s+/g, ' ') // استبدال الفراغات المتعددة بفراغ واحد
                .replace(/\s*{\s*/g, '{') // إزالة الفراغات حول الأقواس
                .replace(/\s*}\s*/g, '}')
                .replace(/\s*:\s*/g, ':')
                .replace(/\s*;\s*/g, ';')
                .replace(/\s*,\s*/g, ',')
                .trim();
            
        default:
            return code;
    }
}

// ========== وظائف قائمة السياق ==========
// عرض قائمة السياق للملفات
function showContextMenu(event, path, type) {
    const contextMenu = document.getElementById('context-menu');
    
    // تحديد العناصر التي ستظهر في القائمة حسب النوع
    document.querySelectorAll('.context-menu-item').forEach(item => {
        const action = item.getAttribute('data-action');
        
        if (type === 'file' && (action === 'new-file' || action === 'new-folder')) {
            item.style.display = 'none';
        } else {
            item.style.display = 'flex';
        }
    });
    
    // وضع القائمة
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.display = 'block';
    
    // تخزين معلومات العنصر المحدد
    contextMenu.setAttribute('data-target-path', path);
    contextMenu.setAttribute('data-target-type', type);
    
    // منع الإجراء الافتراضي للقائمة السياقية للمتصفح
    event.preventDefault();
}

// عرض قائمة سياق المحرر
function showEditorContextMenu(event) {
    const contextMenu = document.getElementById('editor-context-menu');
    
    // وضع القائمة
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.display = 'block';
    
    // منع الإجراء الافتراضي للقائمة السياقية للمتصفح
    event.preventDefault();
}

// إخفاء قائمة السياق
function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'none';
}

// إخفاء قائمة سياق المحرر
function hideEditorContextMenu() {
    const contextMenu = document.getElementById('editor-context-menu');
    contextMenu.style.display = 'none';
}

// ========== وظائف العرض ==========
// تغيير عرض الشريط الجانبي
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('sidebar-collapsed');
}

// تحديث إحصاءات المشروع
function updateProjectStats() {
    let filesCount = 0;
    let foldersCount = 0;
    let projectSize = 0;
    
    function countItems(folder) {
        for (const itemName in folder.children) {
            const item = folder.children[itemName];
            
            if (item.type === 'file') {
                filesCount++;
                projectSize += item.content.length;
            } else if (item.type === 'folder') {
                foldersCount++;
                countItems(item);
            }
        }
    }
    
    countItems(fileSystem.root);
    
    // تحويل حجم المشروع إلى KB أو MB
    let sizeText = projectSize + ' بايت';
    
    if (projectSize > 1024 * 1024) {
        sizeText = (projectSize / (1024 * 1024)).toFixed(2) + ' ميجابايت';
    } else if (projectSize > 1024) {
        sizeText = (projectSize / 1024).toFixed(2) + ' كيلوبايت';
    }
    
    document.getElementById('files-count').textContent = filesCount;
    document.getElementById('folders-count').textContent = foldersCount;
    document.getElementById('project-size').textContent = sizeText;
}

// ========== إضافة ميزات جديدة ==========

// إضافة تلميحات حية للكود (Live Hints)
function setupCodeHints() {
    if (editor) {
        // تكوين خيارات الإكمال التلقائي
        const langTools = ace.require("ace/ext/language_tools");
        langTools.setCompleters([
            langTools.snippetCompleter,
            langTools.keyWordCompleter,
            langTools.textCompleter,
            {
                // مكمل مخصص للأكواد العربية
                getCompletions: function(editor, session, pos, prefix, callback) {
                    const arabicKeywords = [
                        { value: 'function', meta: 'وظيفة' },
                        { value: 'if', meta: 'إذا' },
                        { value: 'else', meta: 'وإلا' },
                        { value: 'for', meta: 'للتكرار' },
                        { value: 'while', meta: 'طالما' },
                        { value: 'return', meta: 'إرجاع' },
                        { value: 'document', meta: 'المستند' },
                        { value: 'window', meta: 'النافذة' },
                        { value: 'addEventListener', meta: 'إضافة مستمع حدث' }
                    ];
                    
                    callback(null, arabicKeywords.map(function(word) {
                        return {
                            caption: word.value + ' - ' + word.meta,
                            value: word.value,
                            meta: word.meta,
                            score: 100
                        };
                    }));
                }
            }
        ]);
    }
}

// إضافة تلميحات الأخطاء (Error Hints)
function setupErrorHints() {
    if (editor) {
        const session = editor.getSession();
        
        // استمع لأحداث تغيير الكود لفحص الأخطاء
        session.on("change", function() {
            if (activeFile) {
                const fileType = activeFile.split('.').pop();
                
                // فحص الأخطاء حسب نوع الملف
                let annotations = [];
                
                switch (fileType) {
                    case 'js':
                        // فحص أخطاء جافاسكريبت بسيطة
                        try {
                            // محاولة تفسير الكود
                            new Function(session.getValue());
                        } catch (e) {
                            // إضافة تعليق خطأ
                            annotations.push({
                                row: (e.lineNumber || 1) - 1,
                                column: 0,
                                text: e.message,
                                type: "error"
                            });
                        }
                        break;
                        
                    case 'json':
                        // فحص صحة JSON
                        try {
                            JSON.parse(session.getValue());
                        } catch (e) {
                            annotations.push({
                                row: 0,
                                column: 0,
                                text: e.message,
                                type: "error"
                            });
                        }
                        break;
                }
                
                // تطبيق التعليقات
                session.setAnnotations(annotations);
            }
        });
    }
}

// إضافة ميزة النسخ الاحتياطي التلقائي
function setupAutoBackup() {
    // إنشاء نسخة احتياطية كل ساعة
    setInterval(() => {
        // حفظ نسخة احتياطية من نظام الملفات
        const backupName = 'file-system-backup-' + new Date().toISOString().replace(/:/g, '-');
        try {
            localStorage.setItem(backupName, JSON.stringify(fileSystem));
            
            // الاحتفاظ بآخر 5 نسخ احتياطية فقط
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('file-system-backup-')) {
                    backups.push(key);
                }
            }
            
            // ترتيب النسخ الاحتياطية حسب التاريخ
            backups.sort().reverse();
            
            // حذف النسخ القديمة
            for (let i = 5; i < backups.length; i++) {
                localStorage.removeItem(backups[i]);
            }
        } catch (e) {
            console.error('فشل إنشاء نسخة احتياطية:', e);
        }
    }, 3600000); // كل ساعة
}

// وظيفة لاستعادة نسخة احتياطية
function restoreBackup() {
    // الحصول على قائمة النسخ الاحتياطية
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('file-system-backup-')) {
            backups.push({
                key: key,
                date: key.replace('file-system-backup-', '')
            });
        }
    }
    
    if (backups.length === 0) {
        showToast('لا توجد نسخ احتياطية متاحة.', 'warning');
        return;
    }
    
    // ترتيب النسخ الاحتياطية حسب التاريخ
    backups.sort((a, b) => b.date.localeCompare(a.date));
    
    // إنشاء قائمة بالنسخ الاحتياطية
    const backupsList = backups.map((backup, index) => {
        const date = new Date(backup.date.replace(/-/g, ':'));
        return `${index + 1}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }).join('\n');
    
    // طلب اختيار نسخة احتياطية
    const choice = prompt(`اختر نسخة احتياطية للاستعادة (1-${backups.length}):\n${backupsList}`);
    
    if (choice && !isNaN(choice) && choice >= 1 && choice <= backups.length) {
        const backupKey = backups[parseInt(choice) - 1].key;
        
        // استرجاع النسخة الاحتياطية
        try {
            const backup = localStorage.getItem(backupKey);
            
            if (backup) {
                // إغلاق جميع الملفات المفتوحة
                for (const filePath in openFiles) {
                    closeTab(filePath);
                }
                
                // استعادة نظام الملفات
                fileSystem = JSON.parse(backup);
                
                // تحديث واجهة المستخدم
                renderFileBrowser();
                updateProjectStats();
                
                showToast('تم استعادة النسخة الاحتياطية بنجاح.', 'success');
            }
        } catch (e) {
            console.error('فشل استعادة النسخة الاحتياطية:', e);
            showToast('فشل استعادة النسخة الاحتياطية.', 'error');
        }
    }
}

// إضافة ميزة البحث في المشروع
function searchInProject() {
    // إنشاء مودال البحث في المشروع
    const searchModal = document.createElement('div');
    searchModal.className = 'modal';
    searchModal.id = 'project-search-modal';
    
    searchModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>البحث في المشروع</h2>
                <i class="fas fa-times close-modal"></i>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <input type="text" id="project-search-input" class="form-control" placeholder="أدخل نص البحث...">
                </div>
                <div class="form-group">
                    <label>خيارات البحث:</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="search-case-sensitive">
                        <label for="search-case-sensitive">مطابقة حالة الأحرف</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="search-whole-word">
                        <label for="search-whole-word">مطابقة الكلمة كاملة</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="search-regexp">
                        <label for="search-regexp">استخدام التعبيرات العادية</label>
                    </div>
                </div>
                <div id="search-results-container" style="max-height: 300px; overflow-y: auto; margin-top: 10px;"></div>
            </div>
            <div class="modal-footer">
                <button class="modal-button cancel close-modal">إغلاق</button>
                <button class="modal-button primary" id="start-search-btn">بحث</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(searchModal);
    
    // إضافة مستمعي الأحداث
    document.getElementById('start-search-btn').addEventListener('click', function() {
        const searchText = document.getElementById('project-search-input').value;
        const caseSensitive = document.getElementById('search-case-sensitive').checked;
        const wholeWord = document.getElementById('search-whole-word').checked;
        const useRegExp = document.getElementById('search-regexp').checked;
        
        if (!searchText) {
            alert('يرجى إدخال نص للبحث');
            return;
        }
        
        // إجراء البحث
        const results = findInProject(searchText, caseSensitive, wholeWord, useRegExp);
        
        // عرض النتائج
        displaySearchResults(results);
    });
    
    // إضافة مستمع لإغلاق المودال
    searchModal.querySelector('.close-modal').addEventListener('click', function() {
        searchModal.style.display = 'none';
    });
    
    return searchModal;
}

// البحث في جميع ملفات المشروع
function findInProject(searchText, caseSensitive, wholeWord, useRegExp) {
    const results = [];
    
    // إنشاء نمط البحث
    let regex;
    
    try {
        if (useRegExp) {
            regex = new RegExp(searchText, caseSensitive ? 'g' : 'gi');
        } else {
            let pattern = searchText;
            
            // escape special regex characters
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // إضافة حدود الكلمة إذا كان مطلوبًا
            if (wholeWord) {
                pattern = '\\b' + pattern + '\\b';
            }
            
            regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
        }
    } catch (e) {
        alert('خطأ في التعبير العادي: ' + e.message);
        return results;
    }
    
    // وظيفة للبحث في الملفات
    function searchInFolder(folder, folderPath) {
        for (const itemName in folder.children) {
            const item = folder.children[itemName];
            const itemPath = `${folderPath}/${itemName}`;
            
            if (item.type === 'file') {
                // البحث في محتوى الملف
                const content = item.content;
                const lines = content.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const matches = line.match(regex);
                    
                    if (matches) {
                        results.push({
                            path: itemPath,
                            line: i + 1,
                            text: line.trim(),
                            matches: matches.length
                        });
                    }
                }
            } else if (item.type === 'folder') {
                // البحث في المجلد بشكل متكرر
                searchInFolder(item, itemPath);
            }
        }
    }
    
    // بدء البحث من المجلد الرئيسي
    searchInFolder(fileSystem.root, 'root');
    
    return results;
}

// عرض نتائج البحث
function displaySearchResults(results) {
    const container = document.getElementById('search-results-container');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">لم يتم العثور على نتائج.</div>';
        return;
    }
    
    // إنشاء عنوان
    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.textContent = `تم العثور على ${results.length} نتائج:`;
    container.appendChild(header);
    
    // إنشاء قائمة النتائج
    const resultsList = document.createElement('div');
    resultsList.className = 'search-results-list';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        // استخراج اسم الملف من المسار
        const fileName = result.path.split('/').pop();
        
        resultItem.innerHTML = `
            <div class="result-path">${fileName} (السطر ${result.line})</div>
            <div class="result-text">${result.text}</div>
        `;
        
        // إضافة حدث النقر لفتح الملف عند السطر المحدد
        resultItem.addEventListener('click', function() {
            // فتح الملف
            openFile(result.path);
            
            // الانتقال إلى السطر المحدد
            editor.gotoLine(result.line);
            
            // إبراز السطر
            editor.session.highlightLines(result.line - 1, result.line - 1);
            
            // إغلاق مودال البحث
            document.getElementById('project-search-modal').style.display = 'none';
        });
        
        resultsList.appendChild(resultItem);
    });
    
    container.appendChild(resultsList);
}

// إضافة ميزة تذكر تاريخ التحرير
function setupEditHistory() {
    // تاريخ التحرير
    let editHistory = {
        past: [],
        future: [],
        maxSize: 100 // الحد الأقصى لعدد الخطوات
    };
    
    if (editor) {
        // إضافة مستمع للتغييرات
        let debounceTimer;
        
        editor.on('change', function() {
            // استخدام debounce لتجنب تسجيل كل تغيير صغير
            clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
                if (activeFile) {
                    // حفظ الحالة الحالية
                    const currentState = {
                        filePath: activeFile,
                        content: editor.getValue(),
                        cursorPosition: editor.getCursorPosition()
                    };
                    
                    // التحقق من أن هذه الحالة مختلفة عن آخر حالة محفوظة
                    const lastState = editHistory.past[editHistory.past.length - 1];
                    
                    if (!lastState || lastState.content !== currentState.content) {
                        // إضافة الحالة الحالية إلى التاريخ
                        editHistory.past.push(currentState);
                        
                        // إذا تجاوز الحد الأقصى، قم بإزالة الحالة الأقدم
                        if (editHistory.past.length > editHistory.maxSize) {
                            editHistory.past.shift();
                        }
                        
                        // مسح المستقبل
                        editHistory.future = [];
                    }
                }
            }, 500);
        });
        
        // إضافة اختصارات لوحة المفاتيح للتراجع والإعادة
        editor.commands.addCommand({
            name: 'undo',
            bindKey: {win: 'Ctrl-Z', mac: 'Command-Z'},
            exec: function(editor) {
                // التراجع باستخدام تاريخ التحرير
                if (editHistory.past.length > 1) {
                    // الحصول على الحالة الحالية
                    const currentState = editHistory.past.pop();
                    
                    // إضافتها إلى المستقبل
                    editHistory.future.push(currentState);
                    
                    // استعادة الحالة السابقة
                    const previousState = editHistory.past[editHistory.past.length - 1];
                    
                    if (previousState) {
                        // إذا كان الملف مختلفًا، قم بفتحه أولاً
                        if (previousState.filePath !== activeFile) {
                            openFile(previousState.filePath);
                        }
                        
                        // استعادة المحتوى
                        editor.setValue(previousState.content, 1);
                        
                        // استعادة موضع المؤشر
                        editor.moveCursorToPosition(previousState.cursorPosition);
                    }
                }
            },
            readOnly: false
        });
        
        editor.commands.addCommand({
            name: 'redo',
            bindKey: {win: 'Ctrl-Shift-Z|Ctrl-Y', mac: 'Command-Shift-Z|Command-Y'},
            exec: function(editor) {
                // الإعادة باستخدام تاريخ التحرير
                if (editHistory.future.length > 0) {
                    // الحصول على الحالة التالية
                    const nextState = editHistory.future.pop();
                    
                    // إضافتها إلى الماضي
                    editHistory.past.push(nextState);
                    
                    // إذا كان الملف مختلفًا، قم بفتحه أولاً
                    if (nextState.filePath !== activeFile) {
                        openFile(nextState.filePath);
                    }
                    
                    // استعادة المحتوى
                    editor.setValue(nextState.content, 1);
                    
                    // استعادة موضع المؤشر
                    editor.moveCursorToPosition(nextState.cursorPosition);
                }
            },
            readOnly: false
        });
    }
}

// إضافة ميزة التكبير والتصغير
function setupZoom() {
    // وظيفة التكبير
    function zoomIn() {
        const fontSize = parseInt(editor.getFontSize(), 10);
        editor.setFontSize(fontSize + 2);
        settings.fontSize = fontSize + 2 + 'px';
        saveSettings();
    }
    
    // وظيفة التصغير
    function zoomOut() {
        const fontSize = parseInt(editor.getFontSize(), 10);
        if (fontSize > 8) {
            editor.setFontSize(fontSize - 2);
            settings.fontSize = fontSize - 2 + 'px';
            saveSettings();
        }
    }
    
    // وظيفة إعادة الضبط
    function zoomReset() {
        editor.setFontSize('14px');
        settings.fontSize = '14px';
        saveSettings();
    }
    
    // إضافة اختصارات لوحة المفاتيح
    document.addEventListener('keydown', function(e) {
        // Ctrl+Plus: تكبير
        if ((e.ctrlKey || e.metaKey) && e.key === '+') {
            e.preventDefault();
            zoomIn();
        }
        
        // Ctrl+Minus: تصغير
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            zoomOut();
        }
        
        // Ctrl+0: إعادة الضبط
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            zoomReset();
        }
    });
    
    // إضافة أزرار التكبير والتصغير إلى واجهة المستخدم
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
        <button id="zoom-in" title="تكبير (Ctrl+)"><i class="fas fa-search-plus"></i></button>
        <button id="zoom-out" title="تصغير (Ctrl-)"><i class="fas fa-search-minus"></i></button>
        <button id="zoom-reset" title="إعادة الضبط (Ctrl+0)"><i class="fas fa-sync-alt"></i></button>
    `;
    
    // إضافة الأزرار إلى شريط الحالة
    const editorControls = document.querySelector('.editor-controls');
    editorControls.appendChild(zoomControls);
    
    // إضافة مستمعي الأحداث
    document.getElementById('zoom-in').addEventListener('click', zoomIn);
    document.getElementById('zoom-out').addEventListener('click', zoomOut);
    document.getElementById('zoom-reset').addEventListener('click', zoomReset);
}

// وظيفة التهيئة الرئيسية مع الميزات الجديدة
window.onload = function() {
    // تهيئة التطبيق الأساسي
    initializeApp();
    
    // إضافة الميزات الجديدة
    setupCodeHints();
    setupErrorHints();
    setupAutoBackup();
    setupEditHistory();
    setupZoom();
    
    // إضافة عنصر مودال البحث في المشروع
    searchInProject();
    
    // إضافة زر إضافي للبحث في المشروع
    const searchProjectBtn = document.createElement('button');
    searchProjectBtn.innerHTML = '<i class="fas fa-search"></i> بحث في المشروع';
    searchProjectBtn.className = 'search-project-btn';
    
    // إضافة الزر بعد زر التنسيق
    document.getElementById('format-button').after(searchProjectBtn);
    
    // إضافة حدث النقر
    searchProjectBtn.addEventListener('click', function() {
        document.getElementById('project-search-modal').style.display = 'flex';
        document.getElementById('project-search-input').focus();
    });
    
    // إضافة زر استعادة النسخة الاحتياطية
    const restoreBackupBtn = document.createElement('button');
    restoreBackupBtn.innerHTML = '<i class="fas fa-history"></i> استعادة نسخة احتياطية';
    restoreBackupBtn.className = 'restore-backup-btn';
    
    // إضافة الزر إلى شريط الأدوات
    document.querySelector('.header-buttons').appendChild(restoreBackupBtn);
    
    // إضافة حدث النقر
    restoreBackupBtn.addEventListener('click', restoreBackup);
    
    // إضافة دعم لسحب وإفلات الملفات في الشريط الجانبي
    const fileBrowser = document.getElementById('file-browser');
    
    fileBrowser.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
    
    fileBrowser.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // تحديد المجلد الهدف
        let targetFolder = e.target.closest('.folder');
        let targetPath;
        
        if (targetFolder) {
            targetPath = targetFolder.getAttribute('data-path');
        } else {
            targetPath = 'root';
        }
        
        // عرض مودال رفع الملفات
        document.getElementById('upload-file-modal').style.display = 'flex';
        document.getElementById('upload-file-modal').setAttribute('data-parent-path', targetPath);
        document.getElementById('upload-destination-path').textContent = targetPath === 'root' ? 'المجلد الرئيسي' : targetPath.split('/').pop();
        
        // معالجة الملفات المسحوبة
        handleFileSelection(e);
    });
    
    // إضافة زر للمعاينة المباشرة
    const livePreviewBtn = document.createElement('button');
    livePreviewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    livePreviewBtn.className = 'live-preview-toggle';
    livePreviewBtn.title = 'تبديل المعاينة المباشرة';
    livePreviewBtn.id = 'live-preview-toggle';
    
    // إضافة الزر إلى شريط الحالة
    document.querySelector('.status-bar').appendChild(livePreviewBtn);
    
    // تحديث UI عند تغيير الإعدادات
    applyTheme();
};
