// Enhanced Worker Health Management System JavaScript with QR Features

// Global variables
let currentUser = null;
let currentLanguage = 'en';
let emergencyCount = 0;
let qrCodeScanner = null;
let videoStream = null;

// Enhanced mock data with QR support
const mockData = {
    languages: {
        "en": {"name": "English", "code": "en", "direction": "ltr"},
        "hi": {"name": "हिंदी", "code": "hi", "direction": "ltr"},
        "ta": {"name": "தமிழ்", "code": "ta", "direction": "ltr"},
        "kn": {"name": "ಕನ್ನಡ", "code": "kn", "direction": "ltr"},
        "mr": {"name": "मराठी", "code": "mr", "direction": "ltr"}
    },
    translations: {
        "en": {
            "title": "Worker Health Management System",
            "subtitle": "Comprehensive Healthcare Solution for Indian Workers",
            "login": "Login",
            "signup": "Sign Up",
            "worker": "Worker",
            "doctor": "Doctor",
            "admin": "Admin",
            "username": "Username",
            "password": "Password",
            "dashboard": "Dashboard",
            "qrLogin": "Login with QR Code",
            "aiChatbot": "AI Chatbot",
            "voiceAssistant": "Voice Assistant",
            "emergency": "Emergency",
            "bookAppointment": "Book Appointment",
            "consultDoctor": "Consult Doctor",
            "viewReports": "View Reports",
            "healthHistory": "Health History",
            "viewRecords": "View Records",
            "updateReports": "Update Reports",
            "checkAppointments": "Check Appointments",
            "sendAlerts": "Send Alerts",
            "manageUsers": "Manage Users",
            "monitorSystem": "Monitor System",
            "generateReports": "Generate Reports",
            "ensureSafety": "Ensure Safety",
            "logout": "Logout",
            "welcome": "Welcome",
            "selectLanguage": "Select Language",
            "emergencyAlert": "Emergency Alert",
            "appointmentBooked": "Appointment Booked Successfully",
            "reportUpdated": "Report Updated Successfully",
            "userAdded": "User Added Successfully"
        }
    },
    users: {
        workers: [
            {"id": "w001", "username": "rajesh.kumar", "password": "worker123", "name": "Rajesh Kumar", "department": "Manufacturing", "phone": "9876543210"},
            {"id": "w002", "username": "priya.sharma", "password": "worker123", "name": "Priya Sharma", "department": "Assembly", "phone": "9876543211"}
        ],
        doctors: [
            {"id": "d001", "username": "dr.singh", "password": "doctor123", "name": "Dr. Amit Singh", "specialization": "Occupational Medicine", "phone": "9876543220"},
            {"id": "d002", "username": "dr.patel", "password": "doctor123", "name": "Dr. Meera Patel", "specialization": "General Medicine", "phone": "9876543221"}
        ],
        admins: [
            {"id": "a001", "username": "admin", "password": "admin123", "name": "System Administrator", "role": "Super Admin", "phone": "9876543230"}
        ]
    },
    appointments: [],
    reports: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing enhanced app...');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing enhanced application...');

    // Load existing worker registrations from localStorage
    loadWorkerRegistrations();

    // Populate language selector
    populateLanguageSelector();

    // Set up event listeners
    setupEventListeners();

    // Load saved language preference
    const savedLanguage = localStorage.getItem('whms_language') || 'en';
    changeLanguage(savedLanguage);

    // Check if user is already logged in
    const savedUser = localStorage.getItem('whms_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showDashboard(currentUser.type);
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('whms_user');
            showLogin();
        }
    } else {
        showLogin();
    }

    // Load emergency count
    emergencyCount = parseInt(localStorage.getItem('whms_emergency_count')) || 0;
    updateEmergencyCount();

    console.log('Enhanced application initialized successfully');
}

function loadWorkerRegistrations() {
    const savedWorkers = localStorage.getItem('whms_registered_workers');
    if (savedWorkers) {
        try {
            const workers = JSON.parse(savedWorkers);
            // Merge with existing mock data, avoiding duplicates
            workers.forEach(worker => {
                const exists = mockData.users.workers.find(w => w.id === worker.id);
                if (!exists) {
                    mockData.users.workers.push(worker);
                }
            });
        } catch (e) {
            console.error('Error loading worker registrations:', e);
        }
    }
}

function populateLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;

    languageSelect.innerHTML = '';
    Object.keys(mockData.languages).forEach(langCode => {
        const option = document.createElement('option');
        option.value = langCode;
        option.textContent = mockData.languages[langCode].name;
        languageSelect.appendChild(option);
    });
}

function setupEventListeners() {
    console.log('Setting up enhanced event listeners...');

    // Language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function(e) {
            changeLanguage(e.target.value);
        });
    }

    // User type selector buttons
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.user-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Auth toggle buttons
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginToggle && signupToggle && loginForm && signupForm) {
        loginToggle.addEventListener('click', function() {
            loginToggle.classList.add('active');
            signupToggle.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });

        signupToggle.addEventListener('click', function() {
            signupToggle.classList.add('active');
            loginToggle.classList.remove('active');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // QR Login button
    const qrLoginBtn = document.getElementById('qrLoginBtn');
    if (qrLoginBtn) {
        qrLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('qrLoginModal');
            initQRScanner();
        });
    }

    // QR Scanner controls
    const startScanBtn = document.getElementById('startScanBtn');
    const stopScanBtn = document.getElementById('stopScanBtn');

    if (startScanBtn) {
        startScanBtn.addEventListener('click', startQRScanning);
    }

    if (stopScanBtn) {
        stopScanBtn.addEventListener('click', stopQRScanning);
    }

    // Download QR button
    const downloadQRBtn = document.getElementById('downloadQRBtn');
    if (downloadQRBtn) {
        downloadQRBtn.addEventListener('click', downloadQRCode);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // Emergency alert close
    const closeEmergency = document.getElementById('closeEmergency');
    if (closeEmergency) {
        closeEmergency.addEventListener('click', function() {
            document.getElementById('emergencyAlert').classList.add('hidden');
        });
    }

    // Modal background close
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
            // Stop QR scanning if modal is closed
            if (e.target.id === 'qrLoginModal') {
                stopQRScanning();
            }
        }
    });

    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    console.log('Enhanced event listeners set up successfully');
}

// Enhanced Authentication Functions
function handleLogin(e) {
    if (e) {
        e.preventDefault();
    }

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const userTypeBtn = document.querySelector('.user-type-btn.active');

    if (!userTypeBtn) {
        showNotification('Please select a user type', 'error');
        return false;
    }

    const userType = userTypeBtn.getAttribute('data-type');

    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return false;
    }

    // Validate credentials
    const user = authenticateUser(username, password, userType);
    if (user) {
        currentUser = { ...user, type: userType };
        localStorage.setItem('whms_user', JSON.stringify(currentUser));
        showDashboard(userType);
        showNotification(`Welcome, ${user.name}!`, 'success');
    } else {
        showNotification('Invalid credentials. Please check username and password.', 'error');
    }

    return false;
}

function handleSignup(e) {
    if (e) {
        e.preventDefault();
    }

    const userTypeBtn = document.querySelector('.user-type-btn.active');
    if (!userTypeBtn || userTypeBtn.getAttribute('data-type') !== 'worker') {
        showNotification('Signup is only available for workers', 'error');
        return false;
    }

    const name = document.getElementById('signupName').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!name || !username || !phone || !password) {
        showNotification('Please fill all fields', 'error');
        return false;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return false;
    }

    if (phone.length !== 10 || !/^[0-9]+$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return false;
    }

    // Check if username already exists
    const existingUser = mockData.users.workers.find(worker => worker.username === username);
    if (existingUser) {
        showNotification('Username already exists. Please choose a different one.', 'error');
        return false;
    }

    // Generate unique worker ID
    const workerId = generateWorkerId();

    // Create new worker
    const newWorker = {
        id: workerId,
        username: username,
        password: password,
        name: name,
        phone: phone,
        department: 'General',
        registeredAt: new Date().toISOString(),
        qrData: generateWorkerQRData(workerId, username, name)
    };

    // Add to mock data
    mockData.users.workers.push(newWorker);

    // Save to localStorage
    saveWorkerRegistrations();

    // Show success modal with QR code
    showSignupSuccess(newWorker);

    // Reset form
    document.getElementById('signupForm').reset();

    return false;
}

function generateWorkerId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WKR${timestamp}${random}`;
}

function generateWorkerQRData(workerId, username, name) {
    const qrData = {
        type: 'worker_login',
        id: workerId,
        username: username,
        name: name,
        timestamp: Date.now()
    };
    return JSON.stringify(qrData);
}

function saveWorkerRegistrations() {
    const registeredWorkers = mockData.users.workers.filter(worker => worker.registeredAt);
    localStorage.setItem('whms_registered_workers', JSON.stringify(registeredWorkers));
}

function showSignupSuccess(worker) {
    // Populate worker details
    document.getElementById('workerIdDisplay').textContent = worker.id;
    document.getElementById('workerNameDisplay').textContent = worker.name;
    document.getElementById('workerUsernameDisplay').textContent = worker.username;

    // Generate QR code
    const qrContainer = document.getElementById('workerQRCode');
    qrContainer.innerHTML = ''; // Clear previous QR code

    try {
        const qrCode = new QRCode(qrContainer, {
            text: worker.qrData,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Store QR code for download
        window.currentWorkerQR = qrCode;
        window.currentWorkerData = worker;

    } catch (error) {
        console.error('Error generating QR code:', error);
        qrContainer.innerHTML = '<p>QR code generation failed</p>';
    }

    // Show success modal
    openModal('signupSuccessModal');
}

function downloadQRCode() {
    if (!window.currentWorkerQR || !window.currentWorkerData) {
        showNotification('No QR code available for download', 'error');
        return;
    }

    try {
        // Get the QR code image
        const qrContainer = document.getElementById('workerQRCode');
        const canvas = qrContainer.querySelector('canvas');
        const img = qrContainer.querySelector('img');

        let dataURL;
        if (canvas) {
            dataURL = canvas.toDataURL('image/png');
        } else if (img && img.src) {
            dataURL = img.src;
        } else {
            throw new Error('No QR code image found');
        }

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = `${window.currentWorkerData.username}_qr_code.png`;
        downloadLink.style.display = 'none';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        showNotification('QR code downloaded successfully', 'success');

    } catch (error) {
        console.error('Error downloading QR code:', error);
        showNotification('Failed to download QR code', 'error');
    }
}

function authenticateUser(username, password, userType) {
    const usersList = mockData.users[userType + 's'] || [];
    return usersList.find(user => user.username === username && user.password === password);
}

function authenticateUserByQR(qrData) {
    try {
        const data = JSON.parse(qrData);
        if (data.type !== 'worker_login') {
            throw new Error('Invalid QR code type');
        }

        const worker = mockData.users.workers.find(w => w.id === data.id && w.username === data.username);
        if (worker) {
            return { ...worker, type: 'worker' };
        }

        return null;
    } catch (error) {
        console.error('Error parsing QR data:', error);
        return null;
    }
}

// QR Scanner Functions
function initQRScanner() {
    console.log('Initializing QR scanner...');
    // Reset scanner UI
    document.getElementById('startScanBtn').classList.remove('hidden');
    document.getElementById('stopScanBtn').classList.add('hidden');
}

function startQRScanning() {
    console.log('Starting QR scan...');

    const video = document.getElementById('qrVideo');
    const canvas = document.getElementById('qrCanvas');
    const context = canvas.getContext('2d');

    // Get camera access
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment' // Use back camera if available
        } 
    })
    .then(function(stream) {
        videoStream = stream;
        video.srcObject = stream;
        video.play();

        // Update UI
        document.getElementById('startScanBtn').classList.add('hidden');
        document.getElementById('stopScanBtn').classList.remove('hidden');

        // Start scanning
        scanQRCode(video, canvas, context);

    })
    .catch(function(err) {
        console.error('Error accessing camera:', err);
        showNotification('Could not access camera. Please check permissions.', 'error');
    });
}

function scanQRCode(video, canvas, context) {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Use jsQR library to decode
        if (typeof jsQR !== 'undefined') {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                console.log('QR Code detected:', code.data);
                handleQRLogin(code.data);
                return;
            }
        }
    }

    // Continue scanning if no QR code found and scanning is active
    if (videoStream && videoStream.active) {
        requestAnimationFrame(() => scanQRCode(video, canvas, context));
    }
}

function stopQRScanning() {
    console.log('Stopping QR scan...');

    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    const video = document.getElementById('qrVideo');
    video.srcObject = null;

    // Update UI
    document.getElementById('startScanBtn').classList.remove('hidden');
    document.getElementById('stopScanBtn').classList.add('hidden');
}

function handleQRLogin(qrData) {
    console.log('Handling QR login with data:', qrData);

    const user = authenticateUserByQR(qrData);
    if (user) {
        // Stop scanning
        stopQRScanning();

        // Close QR modal
        closeModal('qrLoginModal');

        // Log in user
        currentUser = user;
        localStorage.setItem('whms_user', JSON.stringify(currentUser));
        showDashboard(user.type);
        showNotification(`Welcome, ${user.name}! Logged in via QR code.`, 'success');

    } else {
        showNotification('Invalid QR code. Please try again.', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('whms_user');

    // Stop any active QR scanning
    stopQRScanning();

    showLogin();
    showNotification('Logged out successfully', 'success');
}

// Language functionality
function changeLanguage(langCode) {
    currentLanguage = langCode;
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = langCode;
    }
    localStorage.setItem('whms_language', langCode);

    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (mockData.translations[langCode] && mockData.translations[langCode][key]) {
            element.textContent = mockData.translations[langCode][key];
        }
    });

    document.documentElement.lang = langCode;
}

// Navigation functions
function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').classList.add('active');
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.classList.add('hidden');
    }

    // Reset forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');

    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();

    // Show login form by default
    if (loginForm && signupForm && loginToggle && signupToggle) {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
    }

    // Reset user type selection
    document.querySelectorAll('.user-type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.user-type-btn[data-type="worker"]').classList.add('active');
}

function showDashboard(userType) {
    hideAllPages();
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.classList.remove('hidden');
    }

    switch(userType) {
        case 'worker':
            document.getElementById('workerDashboard').classList.add('active');
            const workerName = document.getElementById('workerName');
            if (workerName && currentUser) {
                workerName.textContent = currentUser.name;
            }
            break;
        case 'doctor':
            document.getElementById('doctorDashboard').classList.add('active');
            const doctorName = document.getElementById('doctorName');
            if (doctorName && currentUser) {
                doctorName.textContent = currentUser.name;
            }
            break;
        case 'admin':
            document.getElementById('adminDashboard').classList.add('active');
            const adminName = document.getElementById('adminName');
            if (adminName && currentUser) {
                adminName.textContent = currentUser.name;
            }
            break;
    }
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');

        // Stop QR scanning if QR modal is closed
        if (modalId === 'qrLoginModal') {
            stopQRScanning();
        }
    }
}

// Emergency functionality
function triggerEmergency() {
    if (!currentUser) {
        showNotification('Please log in first', 'error');
        return;
    }

    const message = `Emergency alert from ${currentUser.name}! Immediate assistance required.`;

    const emergencyMessage = document.getElementById('emergencyMessage');
    const emergencyAlert = document.getElementById('emergencyAlert');

    if (emergencyMessage && emergencyAlert) {
        emergencyMessage.textContent = message;
        emergencyAlert.classList.remove('hidden');
    }

    emergencyCount++;
    localStorage.setItem('whms_emergency_count', emergencyCount.toString());
    updateEmergencyCount();

    logEmergency(currentUser.id, message);
    showNotification('Emergency alert sent!', 'error');

    setTimeout(() => {
        if (emergencyAlert) {
            emergencyAlert.classList.add('hidden');
        }
    }, 10000);
}

function logEmergency(userId, message) {
    const emergencies = JSON.parse(localStorage.getItem('whms_emergencies') || '[]');
    emergencies.push({
        id: 'emg_' + Date.now(),
        userId: userId,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'active'
    });
    localStorage.setItem('whms_emergencies', JSON.stringify(emergencies));
}

function updateEmergencyCount() {
    const countElement = document.getElementById('emergencyCount');
    if (countElement) {
        countElement.textContent = emergencyCount.toString();
    }
}

// AI Chatbot functionality
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(response, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const icon = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    messageDiv.innerHTML = `
        ${icon}
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(message) {
    const responses = {
        'headache': 'For headaches, try resting in a quiet, dark room. Stay hydrated and consider gentle neck stretches. If headaches persist or worsen, consult a doctor.',
        'back pain': 'For back pain, try gentle stretching, maintain good posture, and apply heat/cold therapy. Avoid heavy lifting. If pain persists, book an appointment with our occupational medicine specialist.',
        'fever': 'For fever, rest and stay hydrated. Monitor your temperature regularly. If fever exceeds 102°F or persists for more than 3 days, seek medical attention immediately.',
        'stress': 'For stress management, try deep breathing exercises, take regular breaks, and maintain work-life balance. Consider speaking with our counseling services if stress continues.',
        'injury': 'For workplace injuries, seek immediate medical attention. Report the incident to your supervisor and document everything. Our doctors can provide proper treatment and recovery plans.',
        'hello': 'Hello! I\'m here to help with your health questions. You can ask me about symptoms, workplace safety, or general health advice.',
        'help': 'I can assist you with health advice, symptom guidance, and general wellness tips. Try asking me about headaches, back pain, stress, fever, or workplace injuries.'
    };

    const lowerMessage = message.toLowerCase();
    for (let key in responses) {
        if (lowerMessage.includes(key)) {
            return responses[key];
        }
    }

    return 'Thank you for your question. For specific health concerns, I recommend booking an appointment with one of our doctors who can provide personalized advice based on your situation.';
}

// Voice Assistant functionality
let isVoiceActive = false;

function toggleVoiceAssistant() {
    if (!isVoiceActive) {
        startVoiceAssistant();
    } else {
        stopVoiceAssistant();
    }
}

function startVoiceAssistant() {
    isVoiceActive = true;
    const voiceIcon = document.getElementById('voiceIcon');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceBtn = document.getElementById('voiceBtn');

    if (voiceIcon) voiceIcon.classList.add('active');
    if (voiceStatus) voiceStatus.textContent = 'Listening... Speak now';
    if (voiceBtn) voiceBtn.textContent = 'Stop Listening';

    setTimeout(() => {
        const responses = [
            'Your next appointment is scheduled for September 15th at 10:00 AM with Dr. Amit Singh.',
            'Your last health checkup shows normal vital signs. Keep up the good work!',
            'Remember to take regular breaks and stay hydrated during your shift.',
            'I can help you book appointments, check reports, or answer health questions. What do you need?'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const voiceResponseText = document.getElementById('voiceResponseText');
        const voiceResponse = document.getElementById('voiceResponse');

        if (voiceResponseText) voiceResponseText.textContent = randomResponse;
        if (voiceResponse) voiceResponse.classList.remove('hidden');

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(randomResponse);
            utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
            speechSynthesis.speak(utterance);
        }

        stopVoiceAssistant();
    }, 3000);
}

function stopVoiceAssistant() {
    isVoiceActive = false;
    const voiceIcon = document.getElementById('voiceIcon');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceBtn = document.getElementById('voiceBtn');

    if (voiceIcon) voiceIcon.classList.remove('active');
    if (voiceStatus) voiceStatus.textContent = 'Click the microphone to start';
    if (voiceBtn) voiceBtn.textContent = 'Start Voice Assistant';
}

// Utility functions
function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type);

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'});
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1200;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
        font-size: 14px;
        font-weight: 500;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function generateGovReport() {
    showNotification('Government report generated successfully', 'success');
}

// Global functions for HTML onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.triggerEmergency = triggerEmergency;
window.sendChatMessage = sendChatMessage;
window.toggleVoiceAssistant = toggleVoiceAssistant;
window.generateGovReport = generateGovReport;
window.handleLogout = handleLogout;

console.log('Enhanced Worker Health Management System loaded successfully');