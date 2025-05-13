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
    // سنستخدم محرر Ace لتنسيق JavaScript لأنه معقد
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
function showToast(message, type = 'info', duration = 5000) {
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

// ========== وظائف الإعدادات ==========
// حفظ الإعدادات
function saveSettings() {
    // حفظ الإعدادات في localStorage
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
}

// تبديل السمة (فاتح/داكن)
function toggleTheme() {
    const isDark = !document.body.classList.contains('light-theme');
    
    if (isDark) {
        document.body.classList.add('light-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        settings.theme = 'light';
    } else {
        document.body.classList.remove('light-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        settings.theme = 'dark';
    }
    
    saveSettings();
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
    
    // إضافة مستمع لإخفاء القائمة عند النقر في أي مكان آخر
    window.addEventListener('click', hideContextMenu);
    window.addEventListener('contextmenu', hideContextMenu);
}

// عرض قائمة سياق المحرر
function showEditorContextMenu(event) {
    const contextMenu = document.getElementById('editor-context-menu');
    
    // وضع القائمة
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.display = 'block';
    
    // إضافة مستمع لإخفاء القائمة عند النقر في أي مكان آخر
    window.addEventListener('click', hideEditorContextMenu);
}

// إخفاء قائمة السياق
function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'none';
    
    // إزالة المستمعين
    window.removeEventListener('click', hideContextMenu);
    window.removeEventListener('contextmenu', hideContextMenu);
}

// إخفاء قائمة سياق المحرر
function hideEditorContextMenu() {
    const contextMenu = document.getElementById('editor-context-menu');
    contextMenu.style.display = 'none';
    
    // إزالة المستمعين
    window.removeEventListener('click', hideEditorContextMenu);
}

// معالجة إجراءات قائمة السياق
document.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const contextMenu = document.getElementById('context-menu');
        const targetPath = contextMenu.getAttribute('data-target-path');
        const targetType = contextMenu.getAttribute('data-target-type');
        
        switch (action) {
            case 'new-file':
                showNewFileModal(null, targetPath);
                break;
                
            case 'new-folder':
                showNewFolderModal(targetPath);
                break;
                
            case 'rename':
                renameFileOrFolder(targetPath);
                break;
                
            case 'duplicate':
                duplicateFileOrFolder(targetPath);
                break;
                
            case 'delete':
                if (confirm('هل أنت متأكد من أنك تريد حذف هذا العنصر؟')) {
                    deleteFileOrFolder(targetPath);
                }
                break;
                
            case 'copy-path':
                copyPath(targetPath);
                break;
                
            case 'download':
                downloadFileOrFolder(targetPath);
                break;
        }
        
        hideContextMenu();
    });
});

// معالجة إجراءات قائمة سياق المحرر
document.querySelectorAll('.editor-context-menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        
        switch (action) {
            case 'cut':
                editor.cut();
                break;
                
            case 'copy':
                editor.copy();
                break;
                
            case 'paste':
                editor.paste();
                break;
                
            case 'select-all':
                editor.selectAll();
                break;
                
            case 'find':
                toggleSearchBar();
                break;
                
            case 'format-code':
                formatCode();
                break;
        }
        
        hideEditorContextMenu();
    });
});

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

// ========== وظائف مساعدة ==========
// إظهار مودال إنشاء ملف جديد
function showNewFileModal(fileType = null, parentPath = 'root') {
    const modal = document.getElementById('new-file-modal');
    modal.style.display = 'flex';
    document.getElementById('new-file-name').value = '';
    modal.setAttribute('data-parent-path', parentPath);
    
    if (fileType) {
        document.getElementById('new-file-type').value = fileType;
    }
}

// إظهار مودال إنشاء مجلد جديد
function showNewFolderModal(parentPath = 'root') {
    const modal = document.getElementById('new-folder-modal');
    modal.style.display = 'flex';
    document.getElementById('new-folder-name').value = '';
    modal.setAttribute('data-parent-path', parentPath);
}

// عند تحميل الصفحة
window.addEventListener('load', function() {
    // تحميل الإعدادات
    loadSettings();
    
    // تطبيق السمة المناسبة
    if (settings.theme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.remove('light-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // بدء الحفظ التلقائي إذا كان مفعلاً
    if (settings.autoSave) {
        startAutoSave();
    } else {
        document.getElementById('autosave-status').textContent = 'حفظ تلقائي: معطل';
    }
});
