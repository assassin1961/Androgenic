/**
 * Androgenic - Main Application
 * Handles screen navigation, camera, photo upload, and UI rendering
 */

// ============================================
// STATE
// ============================================

let currentScreen = 'loading-screen';
let currentPhoto = null;
let currentScores = null;
let cameraStream = null;
let facingMode = 'user';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    const loadingBar = document.querySelector('.loading-bar');
    const loadingStatus = document.querySelector('.loading-status');

    // Step 1: Load face-api.js
    loadingBar.style.width = '20%';
    loadingStatus.textContent = 'Loading AI engine...';

    try {
        await loadFaceApi();
        loadingBar.style.width = '40%';
        loadingStatus.textContent = 'Loading face detection models...';

        // Step 2: Load models
        await loadModels((msg) => {
            loadingStatus.textContent = msg;
        });
        loadingBar.style.width = '80%';
    } catch (err) {
        console.warn('Face API load failed, using fallback mode:', err);
        loadingBar.style.width = '80%';
        loadingStatus.textContent = 'Using standard analysis mode...';
    }

    // Step 3: Initialize UI
    loadingBar.style.width = '100%';
    loadingStatus.textContent = 'Ready!';

    await sleep(500);
    showScreen('home-screen');

    // Bind event listeners
    bindEvents();
}

// ============================================
// EVENT BINDING
// ============================================

function bindEvents() {
    // Home screen
    document.getElementById('camera-btn').addEventListener('click', startCamera);
    document.getElementById('upload-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', handleFileUpload);
    document.getElementById('camera-input').addEventListener('change', handleFileUpload);
    document.getElementById('history-btn').addEventListener('click', () => showHistoryScreen());

    // Camera screen
    document.getElementById('camera-back-btn').addEventListener('click', () => {
        stopCamera();
        showScreen('home-screen');
    });
    document.getElementById('flip-camera-btn').addEventListener('click', flipCamera);
    document.getElementById('capture-btn').addEventListener('click', capturePhoto);

    // Results screen
    document.getElementById('results-back-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('retake-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('share-btn').addEventListener('click', openShareModal);
    document.getElementById('share-results-btn').addEventListener('click', openShareModal);

    // Tips screen
    document.getElementById('tips-back-btn').addEventListener('click', () => showScreen('results-screen'));

    // History screen
    document.getElementById('history-back-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        clearHistory();
        renderHistory();
        showToast('History cleared');
    });

    // Share modal
    document.getElementById('close-modal-btn').addEventListener('click', closeShareModal);
    document.getElementById('download-share').addEventListener('click', handleDownloadShare);
    document.getElementById('copy-share').addEventListener('click', () => copyResultsText(currentScores));
    document.getElementById('native-share').addEventListener('click', handleNativeShare);

    // Close modal on backdrop click
    document.getElementById('share-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeShareModal();
    });
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;

    // Scroll to top
    window.scrollTo(0, 0);
}

// ============================================
// CAMERA
// ============================================

async function startCamera() {
    showScreen('camera-screen');
    try {
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 960 }
            }
        };
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('camera-video');
        video.srcObject = cameraStream;
        video.play();
    } catch (err) {
        console.error('Camera error:', err);
        showToast('Camera access denied. Try uploading a photo instead.');
        showScreen('home-screen');
        // Fallback to file input with camera capture
        document.getElementById('camera-input').click();
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('camera-video');
    video.srcObject = null;
}

async function flipCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    try {
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 960 }
            }
        };
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('camera-video');
        video.srcObject = cameraStream;
        video.play();
    } catch (err) {
        console.error('Camera flip error:', err);
        showToast('Could not switch camera');
    }
}

function capturePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    // Mirror the capture if using front camera
    if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    processPhoto(photoData);
}

// ============================================
// FILE UPLOAD
// ============================================

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        processPhoto(e.target.result);
    };
    reader.readAsDataURL(file);

    // Reset file input
    event.target.value = '';
}

// ============================================
// PHOTO PROCESSING & ANALYSIS
// ============================================

async function processPhoto(photoDataUrl) {
    currentPhoto = photoDataUrl;

    // Show analyzing screen
    showScreen('analyzing-screen');
    document.getElementById('analyzing-photo').src = photoDataUrl;

    // Reset analysis steps
    const steps = ['step-detect', 'step-measure', 'step-score', 'step-tips'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active', 'done');
    });

    // Animate through steps
    const stepDelay = 800;

    // Step 1: Detecting
    document.getElementById('step-detect').classList.add('active');
    await sleep(stepDelay);
    document.getElementById('step-detect').classList.remove('active');
    document.getElementById('step-detect').classList.add('done');

    // Step 2: Measuring
    document.getElementById('step-measure').classList.add('active');

    // Actually run analysis
    const img = new Image();
    img.src = photoDataUrl;
    await new Promise(resolve => {
        if (img.complete) resolve();
        else img.onload = resolve;
    });

    const scores = await analyzeFace(img);
    currentScores = scores;

    await sleep(stepDelay);
    document.getElementById('step-measure').classList.remove('active');
    document.getElementById('step-measure').classList.add('done');

    // Step 3: Scoring
    document.getElementById('step-score').classList.add('active');
    await sleep(stepDelay);
    document.getElementById('step-score').classList.remove('active');
    document.getElementById('step-score').classList.add('done');

    // Step 4: Tips
    document.getElementById('step-tips').classList.add('active');
    await sleep(stepDelay);
    document.getElementById('step-tips').classList.remove('active');
    document.getElementById('step-tips').classList.add('done');

    await sleep(400);

    // Save to history
    saveToHistory(photoDataUrl, scores);

    // Show results
    renderResults(scores);
    showScreen('results-screen');
}

// ============================================
// RENDER RESULTS
// ============================================

function renderResults(scores) {
    // Set photo
    document.getElementById('result-photo').src = currentPhoto;

    // Overall score with animation
    const overallEl = document.getElementById('overall-score');
    animateNumber(overallEl, 0, scores.overall, 1000);

    // Percentile
    const percentile = getPercentile(scores.overall);
    document.getElementById('overall-percentile').textContent = percentile;

    // Score cards
    const categories = [
        { key: 'masculinity', emoji: '💪', name: 'Masculinity' },
        { key: 'jawline', emoji: '🦴', name: 'Jawline' },
        { key: 'eyes', emoji: '👀', name: 'Eyes' },
        { key: 'cheekbones', emoji: '🧬', name: 'Cheekbones' },
        { key: 'hair', emoji: '💇', name: 'Hair' },
        { key: 'skin', emoji: '✨', name: 'Skin' }
    ];

    const cardsContainer = document.getElementById('score-cards');
    cardsContainer.innerHTML = '';

    categories.forEach((cat, index) => {
        const score = scores[cat.key];
        const label = getScoreLabel(score);
        const barClass = getBarClass(score);
        const percentileText = getScorePercentile(score);

        const card = document.createElement('div');
        card.className = 'score-card animate-in';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="score-card-label">${cat.name}</div>
            <div class="score-card-value ${label.class}">${score}</div>
            <div class="score-card-bar">
                <div class="score-card-bar-fill ${barClass}" style="width: 0%"></div>
            </div>
            <div class="score-card-rank">
                <span>${percentileText}</span>
                <span class="${label.class}">${label.text}</span>
            </div>
        `;

        card.addEventListener('click', () => showTipsScreen(cat.key, score));
        cardsContainer.appendChild(card);

        // Animate bar fill
        setTimeout(() => {
            card.querySelector('.score-card-bar-fill').style.width = `${score}%`;
        }, 300 + index * 100);
    });

    // Detailed stats
    renderDetailedStats(scores, categories);

    // Recommendations
    renderRecommendations(scores, categories);
}

function renderDetailedStats(scores, categories) {
    const container = document.getElementById('detailed-stats');

    const allCats = [...categories, { key: 'symmetry', emoji: '📐', name: 'Symmetry' }];

    let html = '<h3>Score Breakdown</h3>';

    allCats.forEach(cat => {
        const score = scores[cat.key];
        const label = getScoreLabel(score);
        const out10 = Math.max(1, Math.min(10, Math.round(score / 10)));
        const desc = TIPS_DATABASE[cat.key] ? TIPS_DATABASE[cat.key].description : 'Overall facial balance';

        html += `
            <div class="stat-row">
                <div class="stat-row-icon">${cat.emoji}</div>
                <div class="stat-row-info">
                    <div class="stat-row-name">${cat.name}</div>
                    <div class="stat-row-desc">${desc}</div>
                </div>
                <div class="stat-row-score ${label.class}">${out10}<span class="stat-row-suffix">/10</span></div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderRecommendations(scores, categories) {
    const container = document.getElementById('recommendations-section');

    // Find weakest categories to prioritize
    const sorted = [...categories, { key: 'symmetry', emoji: '📐', name: 'Symmetry' }]
        .map(cat => ({ ...cat, score: scores[cat.key] }))
        .sort((a, b) => a.score - b.score);

    // Show recommendations for the 3 weakest categories + general tips
    const weakest = sorted.slice(0, 3);

    let html = '<h3>Recommendations</h3>';

    // General tips first
    const generalTips = getOverallTips(scores.overall);
    html += `
        <div class="recommendation-category">
            <div class="rec-category-header">
                <div class="rec-category-icon">🏆</div>
                <div class="rec-category-title">General Improvement</div>
                <div class="rec-category-score ${getScoreLabel(scores.overall * 10).class}">${scores.overall}/10</div>
            </div>
    `;
    generalTips.forEach(tip => {
        html += createRecCard(tip);
    });
    html += '</div>';

    // Category-specific tips
    weakest.forEach(cat => {
        const tips = getTipsForCategory(cat.key, cat.score);
        if (tips.length === 0) return;

        const label = getScoreLabel(cat.score);
        const out10 = Math.max(1, Math.min(10, Math.round(cat.score / 10)));

        html += `
            <div class="recommendation-category">
                <div class="rec-category-header" onclick="showTipsScreen('${cat.key}', ${cat.score})">
                    <div class="rec-category-icon">${cat.emoji || '📋'}</div>
                    <div class="rec-category-title">${cat.name}</div>
                    <div class="rec-category-score ${label.class}">${out10}/10</div>
                </div>
        `;

        // Show first 2 tips, with link to see more
        tips.slice(0, 2).forEach(tip => {
            html += createRecCard(tip);
        });

        if (tips.length > 2) {
            html += `
                <div class="rec-card" onclick="showTipsScreen('${cat.key}', ${cat.score})" style="text-align:center; cursor:pointer; color: var(--accent-blue);">
                    <div class="rec-card-title" style="justify-content:center">View all ${tips.length} tips →</div>
                </div>
            `;
        }

        html += '</div>';
    });

    container.innerHTML = html;
}

function createRecCard(tip) {
    return `
        <div class="rec-card">
            <div class="rec-card-title">
                <span class="tip-icon">💡</span>
                ${tip.title}
            </div>
            <div class="rec-card-text">${tip.text}</div>
            ${tip.source ? `<span class="rec-card-source">Source: ${tip.source}</span>` : ''}
        </div>
    `;
}

// ============================================
// TIPS SCREEN
// ============================================

function showTipsScreen(category, score) {
    const catData = TIPS_DATABASE[category];
    if (!catData) return;

    document.getElementById('tips-title').textContent = catData.name + ' Tips';

    const tips = getTipsForCategory(category, score);
    const label = getScoreLabel(score);
    const out10 = Math.max(1, Math.min(10, Math.round(score / 10)));

    // Determine color
    const color = score > 65 ? '#00d26a' : score > 40 ? '#f5a623' : '#ff4757';
    const circumference = 2 * Math.PI * 26;
    const offset = circumference - (score / 100) * circumference;

    let html = `
        <div class="tip-score-header">
            <div class="tip-score-circle">
                <svg viewBox="0 0 64 64">
                    <circle class="bg-circle" cx="32" cy="32" r="26"/>
                    <circle class="score-circle" cx="32" cy="32" r="26"
                        stroke="${color}"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${offset}"/>
                </svg>
                <span style="color:${color}">${out10}</span>
            </div>
            <div class="tip-score-info">
                <h2>${catData.name}</h2>
                <p>${catData.description}</p>
            </div>
        </div>

        <div class="tip-graph">
            <div class="tip-graph-label">Your Score Distribution</div>
            <div class="tip-graph-bar">
                <div class="tip-graph-fill ${getBarClass(score)}" style="width: ${score}%"></div>
            </div>
            <div class="tip-graph-markers">
                <span>Low</span>
                <span>Average</span>
                <span>High</span>
            </div>
        </div>

        <h3 style="margin-bottom:12px;font-size:16px;">💡 Recommendations</h3>
        <div class="tips-list">
    `;

    tips.forEach(tip => {
        html += `
            <div class="tip-item">
                <div class="tip-item-header">
                    <div class="tip-item-icon">💡</div>
                    <div class="tip-item-title">${tip.title}</div>
                </div>
                <div class="tip-item-text">${tip.text}</div>
                ${tip.source ? `<div class="tip-item-source">Source: ${tip.source}</div>` : ''}
            </div>
        `;
    });

    html += '</div>';

    document.getElementById('tips-content').innerHTML = html;
    showScreen('tips-screen');
}

// ============================================
// HISTORY
// ============================================

function showHistoryScreen() {
    renderHistory();
    showScreen('history-screen');
}

function renderHistory() {
    const history = getHistory();
    const container = document.getElementById('history-content');

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-history">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64" opacity="0.3">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>No analysis history yet</p>
                <p class="empty-sub">Take a selfie to get started</p>
            </div>
        `;
        return;
    }

    let html = '<div class="history-list">';
    history.forEach(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const scores = entry.scores;
        html += `
            <div class="history-item" onclick='loadHistoryEntry(${JSON.stringify(entry.id)})'>
                <div class="history-photo">
                    <img src="${entry.photo}" alt="Analysis">
                </div>
                <div class="history-info">
                    <div class="history-score-label">Score: ${scores.overall}/10</div>
                    <div class="history-date">${dateStr}</div>
                    <div class="history-mini-scores">
                        <span class="mini-score">Jaw ${Math.round(scores.jawline / 10)}</span>
                        <span class="mini-score">Eyes ${Math.round(scores.eyes / 10)}</span>
                        <span class="mini-score">Skin ${Math.round(scores.skin / 10)}</span>
                    </div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="opacity:0.3">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function loadHistoryEntry(id) {
    const history = getHistory();
    const entry = history.find(e => e.id === id);
    if (!entry) return;

    currentPhoto = entry.photo;
    currentScores = entry.scores;
    renderResults(entry.scores);
    showScreen('results-screen');
}

// ============================================
// SHARE MODAL
// ============================================

async function openShareModal() {
    if (!currentScores || !currentPhoto) return;

    const modal = document.getElementById('share-modal');
    modal.classList.add('active');

    const preview = document.getElementById('share-preview');
    preview.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px">Generating share card...</p>';

    try {
        const dataUrl = await generateShareCard(currentPhoto, currentScores);
        preview.innerHTML = `<img src="${dataUrl}" alt="Share card">`;
    } catch (err) {
        console.error('Share card generation error:', err);
        preview.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px">Could not generate share card</p>';
    }
}

function closeShareModal() {
    document.getElementById('share-modal').classList.remove('active');
}

async function handleDownloadShare() {
    try {
        const dataUrl = await generateShareCard(currentPhoto, currentScores);
        downloadShareCard(dataUrl);
        showToast('Image saved!');
    } catch (err) {
        showToast('Could not save image');
    }
}

async function handleNativeShare() {
    try {
        const dataUrl = await generateShareCard(currentPhoto, currentScores);
        const shared = await nativeShare(dataUrl);
        if (!shared) {
            showToast('Sharing not supported on this device');
        }
    } catch (err) {
        showToast('Could not share');
    }
}

// ============================================
// UTILITIES
// ============================================

function animateNumber(element, from, to, duration) {
    const start = performance.now();
    const isDecimal = to % 1 !== 0;

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        const current = from + (to - from) * eased;

        element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function getPercentile(overall) {
    if (overall >= 9.5) return 'Top 1%';
    if (overall >= 8.5) return 'Top 5%';
    if (overall >= 7.5) return 'Top 15%';
    if (overall >= 6.5) return 'Top 30%';
    if (overall >= 5.5) return 'Top 45%';
    if (overall >= 4.5) return 'Average';
    if (overall >= 3.5) return 'Below Average';
    return 'Bottom 20%';
}

function getScorePercentile(score) {
    if (score >= 90) return 'Top 1%';
    if (score >= 80) return 'Top 5%';
    if (score >= 70) return 'Top 15%';
    if (score >= 60) return 'Top 30%';
    if (score >= 50) return 'Average';
    if (score >= 40) return 'Below Avg';
    return 'Low';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
