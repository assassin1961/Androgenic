/**
 * Androgenic - Main Application
 * Handles screen navigation, camera, photo upload, UI rendering, and pro gating
 */

// ============================================
// STATE
// ============================================

let currentScreen = 'loading-screen';
let currentPhoto = null;
let currentScores = null;
let cameraStream = null;
let facingMode = 'user';
let selectedPlan = 'monthly';
let currentPlanSavedTasks = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    const loadingBar = document.querySelector('.loading-bar');
    const loadingStatus = document.querySelector('.loading-status');

    loadingBar.style.width = '20%';
    loadingStatus.textContent = 'Loading AI engine...';

    try {
        await loadFaceApi();
        loadingBar.style.width = '40%';
        loadingStatus.textContent = 'Loading face detection models...';

        await loadModels((msg) => {
            loadingStatus.textContent = msg;
        });
        loadingBar.style.width = '80%';
    } catch (err) {
        console.warn('Face API load failed, using fallback mode:', err);
        loadingBar.style.width = '80%';
        loadingStatus.textContent = 'Using standard analysis mode...';
    }

    loadingBar.style.width = '100%';
    loadingStatus.textContent = 'Ready!';

    await sleep(500);
    showScreen('home-screen');
    bindEvents();
    updateProUI();
}

// ============================================
// EVENT BINDING
// ============================================

function bindEvents() {
    // Home screen
    document.getElementById('camera-btn').addEventListener('click', handleScanAttempt.bind(null, startCamera));
    document.getElementById('upload-btn').addEventListener('click', handleScanAttempt.bind(null, () => {
        document.getElementById('file-input').click();
    }));
    document.getElementById('file-input').addEventListener('change', handleFileUpload);
    document.getElementById('camera-input').addEventListener('change', handleFileUpload);
    document.getElementById('history-btn').addEventListener('click', () => showHistoryScreen());
    document.getElementById('settings-btn').addEventListener('click', () => showSettingsScreen());

    // Pro banner
    const proBanner = document.getElementById('pro-banner');
    if (proBanner) {
        proBanner.querySelector('.pro-banner-btn').addEventListener('click', () => showScreen('paywall-screen'));
        proBanner.addEventListener('click', (e) => {
            if (!e.target.classList.contains('pro-banner-btn')) showScreen('paywall-screen');
        });
    }

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

    // Paywall screen
    document.getElementById('paywall-back-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('restore-btn').addEventListener('click', handleRestore);
    document.getElementById('subscribe-btn').addEventListener('click', handleSubscribe);
    document.getElementById('trial-btn').addEventListener('click', handleStartTrial);
    renderPricingPlans();

    // Settings screen
    document.getElementById('settings-back-btn').addEventListener('click', () => showScreen('home-screen'));

    // Progress screen
    document.getElementById('progress-back-btn').addEventListener('click', () => showScreen('results-screen'));

    // Plan screen
    document.getElementById('plan-back-btn').addEventListener('click', () => showScreen('results-screen'));

    // Share modal
    document.getElementById('close-modal-btn').addEventListener('click', closeShareModal);
    document.getElementById('download-share').addEventListener('click', handleDownloadShare);
    document.getElementById('copy-share').addEventListener('click', () => copyResultsText(currentScores));
    document.getElementById('native-share').addEventListener('click', handleNativeShare);
    document.getElementById('share-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeShareModal();
    });
}

// ============================================
// PRO UI MANAGEMENT
// ============================================

function updateProUI() {
    const proStatus = isPro();
    const trialActive = isTrialActive();
    const scansLeft = getScansRemaining();
    const banner = document.getElementById('pro-banner');
    const counter = document.getElementById('scans-counter');

    if (proStatus) {
        // User is pro or on trial
        banner.style.display = 'none';
        counter.style.display = 'none';

        if (trialActive) {
            const daysLeft = getTrialDaysRemaining();
            banner.style.display = 'block';
            banner.className = 'trial-banner';
            banner.innerHTML = `
                <div class="pro-banner-content">
                    <span class="trial-banner-text">Free Trial Active</span>
                    <span class="trial-banner-days">${daysLeft} day${daysLeft !== 1 ? 's' : ''} left</span>
                </div>
            `;
        }
    } else {
        // Free user
        banner.style.display = 'block';
        banner.className = 'pro-banner';
        banner.innerHTML = `
            <div class="pro-banner-content">
                <span class="pro-banner-text">Unlock all features with PRO</span>
                <button class="pro-banner-btn" onclick="showScreen('paywall-screen')">Upgrade</button>
            </div>
        `;

        // Show scans remaining
        counter.style.display = 'block';
        const total = PRO_CONFIG.FREE_SCANS_LIMIT;
        const used = total - scansLeft;
        let dots = '';
        for (let i = 0; i < total; i++) {
            dots += `<div class="scan-dot-indicator ${i < used ? 'used' : 'available'}"></div>`;
        }
        counter.innerHTML = `
            <div class="scans-counter-inner">
                <span class="scans-text">${scansLeft} free scan${scansLeft !== 1 ? 's' : ''} remaining today</span>
                <div class="scans-dots">${dots}</div>
            </div>
        `;
    }
}

function handleScanAttempt(callback) {
    if (isPro()) {
        callback();
        return;
    }

    const scansLeft = getScansRemaining();
    if (scansLeft <= 0) {
        showPaywallWithReason('You\'ve used all free scans today');
        return;
    }

    callback();
}

function showPaywallWithReason(reason) {
    showScreen('paywall-screen');
    if (reason) {
        showToast(reason);
    }
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    window.scrollTo(0, 0);

    if (screenId === 'home-screen') {
        updateProUI();
    }
    if (screenId === 'paywall-screen') {
        renderPricingPlans();
        updateTrialButton();
    }
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

    // Check scan limit for free users
    if (!isPro() && getScansRemaining() <= 0) {
        event.target.value = '';
        showPaywallWithReason('You\'ve used all free scans today');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        processPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

// ============================================
// PHOTO PROCESSING & ANALYSIS
// ============================================

async function processPhoto(photoDataUrl) {
    currentPhoto = photoDataUrl;

    // Use a scan
    if (!isPro()) {
        useScan();
    }

    showScreen('analyzing-screen');
    document.getElementById('analyzing-photo').src = photoDataUrl;

    const steps = ['step-detect', 'step-measure', 'step-score', 'step-tips'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active', 'done');
    });

    const stepDelay = 800;

    document.getElementById('step-detect').classList.add('active');
    await sleep(stepDelay);
    document.getElementById('step-detect').classList.remove('active');
    document.getElementById('step-detect').classList.add('done');

    document.getElementById('step-measure').classList.add('active');

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

    document.getElementById('step-score').classList.add('active');
    await sleep(stepDelay);
    document.getElementById('step-score').classList.remove('active');
    document.getElementById('step-score').classList.add('done');

    document.getElementById('step-tips').classList.add('active');
    await sleep(stepDelay);
    document.getElementById('step-tips').classList.remove('active');
    document.getElementById('step-tips').classList.add('done');

    await sleep(400);

    saveToHistory(photoDataUrl, scores);
    renderResults(scores);
    showScreen('results-screen');
}

// ============================================
// RENDER RESULTS (with pro gating)
// ============================================

function renderResults(scores) {
    document.getElementById('result-photo').src = currentPhoto;

    const overallEl = document.getElementById('overall-score');
    animateNumber(overallEl, 0, scores.overall, 1000);

    const percentile = getPercentile(scores.overall);
    document.getElementById('overall-percentile').textContent = percentile;

    const allCategories = [
        { key: 'masculinity', emoji: '💪', name: 'Masculinity' },
        { key: 'jawline', emoji: '🦴', name: 'Jawline' },
        { key: 'eyes', emoji: '👀', name: 'Eyes' },
        { key: 'cheekbones', emoji: '🧬', name: 'Cheekbones' },
        { key: 'hair', emoji: '💇', name: 'Hair' },
        { key: 'skin', emoji: '✨', name: 'Skin' }
    ];

    const cardsContainer = document.getElementById('score-cards');
    cardsContainer.innerHTML = '';

    allCategories.forEach((cat, index) => {
        const score = scores[cat.key];
        const label = getScoreLabel(score);
        const barClass = getBarClass(score);
        const percentileText = getScorePercentile(score);
        const isLocked = !canAccessCategory(cat.key);

        const card = document.createElement('div');
        card.className = `score-card animate-in ${isLocked ? 'locked' : ''}`;
        card.style.animationDelay = `${index * 0.1}s`;

        if (isLocked) {
            card.innerHTML = `
                <div class="score-card-label">${cat.name}</div>
                <div class="score-card-value ${label.class}">${score}</div>
                <div class="score-card-bar">
                    <div class="score-card-bar-fill ${barClass}" style="width: ${score}%"></div>
                </div>
                <div class="score-card-rank">
                    <span>${percentileText}</span>
                    <span class="${label.class}">${label.text}</span>
                </div>
                <div class="score-card-lock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" width="18" height="18">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>PRO</span>
                </div>
            `;
            card.addEventListener('click', () => showScreen('paywall-screen'));
        } else {
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
            setTimeout(() => {
                card.querySelector('.score-card-bar-fill').style.width = `${score}%`;
            }, 300 + index * 100);
        }

        cardsContainer.appendChild(card);
    });

    // Detailed stats
    renderDetailedStats(scores, allCategories);

    // Pro features sections
    const resultsContent = document.getElementById('results-content');

    // Remove old pro sections if re-rendering
    document.querySelectorAll('.celeb-section, .ratios-section, .pro-upsell-card, .pro-results-features').forEach(el => el.remove());

    if (isPro()) {
        renderProResultsSections(scores, allCategories);
    } else {
        renderProUpsellCard();
    }

    // Recommendations
    renderRecommendations(scores, allCategories);
}

function renderProResultsSections(scores, categories) {
    const recsSection = document.getElementById('recommendations-section');

    // Celebrity match
    const celebMatch = getCelebrityMatch(scores);
    const celebHTML = document.createElement('div');
    celebHTML.className = 'celeb-section';
    celebHTML.innerHTML = `
        <h3>Celebrity Match <span class="pro-badge pro-badge-sm">PRO</span></h3>
        <div class="celeb-card">
            <div class="celeb-avatar">${celebMatch.primary.img}</div>
            <div class="celeb-info">
                <div class="celeb-name">${celebMatch.primary.name}</div>
                <div class="celeb-match-pct">${celebMatch.matchPercentage}% Match</div>
                <div class="celeb-traits">${celebMatch.primary.traits}</div>
            </div>
        </div>
        <div class="celeb-card" style="opacity:0.8">
            <div class="celeb-avatar" style="background:var(--bg-elevated)">${celebMatch.secondary.img}</div>
            <div class="celeb-info">
                <div class="celeb-name">${celebMatch.secondary.name}</div>
                <div class="celeb-match-pct" style="color:var(--text-secondary)">${Math.max(50, celebMatch.matchPercentage - 12)}% Match</div>
                <div class="celeb-traits">${celebMatch.secondary.traits}</div>
            </div>
        </div>
    `;
    recsSection.parentNode.insertBefore(celebHTML, recsSection);

    // Facial ratios
    const ratios = computeFacialRatios(scores);
    const ratiosHTML = document.createElement('div');
    ratiosHTML.className = 'ratios-section';
    let ratiosInner = `<h3>Facial Ratios <span class="pro-badge pro-badge-sm">PRO</span></h3>`;

    for (const [key, ratio] of Object.entries(ratios)) {
        const color = ratio.rating >= 7 ? 'score-high' : ratio.rating >= 5 ? 'score-mid' : 'score-low';
        ratiosInner += `
            <div class="ratio-card">
                <div class="ratio-emoji">${ratio.emoji}</div>
                <div class="ratio-info">
                    <div class="ratio-name">${ratio.name}</div>
                    <div class="ratio-desc">${ratio.description}</div>
                    <div class="ratio-values">
                        <span class="ratio-actual">Yours: ${ratio.actual}</span>
                        <span class="ratio-ideal">Ideal: ${ratio.ideal}</span>
                    </div>
                </div>
                <div class="ratio-score">
                    <div class="ratio-score-num ${color}">${ratio.rating}</div>
                    <div class="ratio-score-label">/10</div>
                </div>
            </div>
        `;
    }
    ratiosHTML.innerHTML = ratiosInner;
    recsSection.parentNode.insertBefore(ratiosHTML, recsSection);

    // Pro feature action buttons
    const proFeatures = document.createElement('div');
    proFeatures.className = 'pro-results-features';
    proFeatures.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;';
    proFeatures.innerHTML = `
        <div class="action-btn secondary" onclick="showProgressScreen()" style="cursor:pointer;font-size:13px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Progress
        </div>
        <div class="action-btn secondary" onclick="showPlanScreen()" style="cursor:pointer;font-size:13px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Plan
        </div>
    `;
    recsSection.parentNode.insertBefore(proFeatures, recsSection);
}

function renderProUpsellCard() {
    const recsSection = document.getElementById('recommendations-section');
    const upsell = document.createElement('div');
    upsell.className = 'pro-upsell-card';
    upsell.onclick = () => showScreen('paywall-screen');
    upsell.innerHTML = `
        <h4>Unlock Full Analysis</h4>
        <p>Get complete insights with Androgenic PRO</p>
        <div class="pro-upsell-features">
            <span class="pro-upsell-feature">All 7 Categories</span>
            <span class="pro-upsell-feature">Facial Ratios</span>
            <span class="pro-upsell-feature">Celebrity Match</span>
            <span class="pro-upsell-feature">Progress Tracker</span>
            <span class="pro-upsell-feature">12-Week Plan</span>
            <span class="pro-upsell-feature">All Tips</span>
        </div>
        <button class="pro-upsell-btn">Upgrade to PRO</button>
    `;
    recsSection.parentNode.insertBefore(upsell, recsSection);
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
        const isLocked = !canAccessCategory(cat.key);

        html += `
            <div class="stat-row ${isLocked ? 'locked' : ''}" ${isLocked ? 'onclick="showScreen(\'paywall-screen\')"' : ''}>
                <div class="stat-row-icon">${cat.emoji}</div>
                <div class="stat-row-info">
                    <div class="stat-row-name">${cat.name} ${isLocked ? '<span class="pro-badge pro-badge-sm" style="margin-left:6px">PRO</span>' : ''}</div>
                    <div class="stat-row-desc">${desc}</div>
                </div>
                <div class="stat-row-score ${label.class}">${isLocked ? '?' : out10}<span class="stat-row-suffix">/10</span></div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderRecommendations(scores, categories) {
    const container = document.getElementById('recommendations-section');

    const allCatsWithScore = [...categories, { key: 'symmetry', emoji: '📐', name: 'Symmetry' }]
        .map(cat => ({ ...cat, score: scores[cat.key] }))
        .sort((a, b) => a.score - b.score);

    const weakest = allCatsWithScore.slice(0, 3);

    let html = '<h3>Recommendations</h3>';

    // General tips
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

        const isCatLocked = !canAccessCategory(cat.key);
        const label = getScoreLabel(cat.score);
        const out10 = Math.max(1, Math.min(10, Math.round(cat.score / 10)));
        const maxTips = getMaxTipsForCategory(cat.key);

        html += `
            <div class="recommendation-category">
                <div class="rec-category-header" ${!isCatLocked ? `onclick="showTipsScreen('${cat.key}', ${cat.score})"` : `onclick="showScreen('paywall-screen')"`}>
                    <div class="rec-category-icon">${cat.emoji || '📋'}</div>
                    <div class="rec-category-title">${cat.name} ${isCatLocked ? '<span class="pro-badge pro-badge-sm">PRO</span>' : ''}</div>
                    <div class="rec-category-score ${label.class}">${isCatLocked ? '?' : out10}/10</div>
                </div>
        `;

        if (isCatLocked) {
            html += `
                <div class="rec-card locked" onclick="showScreen('paywall-screen')" style="cursor:pointer">
                    <div class="rec-card-title">
                        <span class="tip-icon">🔒</span>
                        Unlock ${cat.name} tips with PRO
                    </div>
                    <div class="rec-card-text">Get personalized ${cat.name.toLowerCase()} improvement recommendations</div>
                    <div class="rec-card-unlock">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Upgrade to unlock
                    </div>
                </div>
            `;
        } else {
            const visibleTips = isPro() ? tips : tips.slice(0, maxTips);
            const hiddenCount = tips.length - visibleTips.length;

            visibleTips.forEach(tip => {
                html += createRecCard(tip);
            });

            if (hiddenCount > 0) {
                html += `
                    <div class="rec-card locked" onclick="showScreen('paywall-screen')" style="cursor:pointer">
                        <div class="rec-card-title">
                            <span class="tip-icon">🔒</span>
                            ${hiddenCount} more tip${hiddenCount > 1 ? 's' : ''} available
                        </div>
                        <div class="rec-card-text" style="filter:blur(0)">Upgrade to PRO to see all recommendations</div>
                        <div class="rec-card-unlock">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Unlock all tips
                        </div>
                    </div>
                `;
            } else if (tips.length > 2) {
                html += `
                    <div class="rec-card" onclick="showTipsScreen('${cat.key}', ${cat.score})" style="text-align:center; cursor:pointer; color: var(--accent-blue);">
                        <div class="rec-card-title" style="justify-content:center">View all ${tips.length} tips →</div>
                    </div>
                `;
            }
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
    if (!canAccessCategory(category)) {
        showScreen('paywall-screen');
        return;
    }

    const catData = TIPS_DATABASE[category];
    if (!catData) return;

    document.getElementById('tips-title').textContent = catData.name + ' Tips';

    const tips = getTipsForCategory(category, score);
    const maxTips = getMaxTipsForCategory(category);
    const visibleTips = isPro() ? tips : tips.slice(0, maxTips);
    const lockedTips = tips.length - visibleTips.length;

    const out10 = Math.max(1, Math.min(10, Math.round(score / 10)));
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

    visibleTips.forEach(tip => {
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

    if (lockedTips > 0) {
        html += `
            <div class="pro-upsell-card" onclick="showScreen('paywall-screen')" style="margin-top:8px">
                <h4>🔒 ${lockedTips} More Tips Available</h4>
                <p>Upgrade to PRO to unlock all ${tips.length} tips for ${catData.name}</p>
                <button class="pro-upsell-btn" style="margin-top:8px">Unlock All Tips</button>
            </div>
        `;
    }

    html += '</div>';

    document.getElementById('tips-content').innerHTML = html;
    showScreen('tips-screen');
}

// ============================================
// PAYWALL
// ============================================

function renderPricingPlans() {
    const container = document.getElementById('pricing-plans');
    let html = '';

    for (const [id, plan] of Object.entries(PRO_CONFIG.PLANS)) {
        const isSelected = id === selectedPlan;
        html += `
            <div class="plan-card ${isSelected ? 'selected' : ''}" onclick="selectPlan('${id}')">
                ${plan.badge ? `<div class="plan-card-badge">${plan.badge}</div>` : ''}
                <div class="plan-card-name" style="${plan.badge ? 'margin-top:16px' : ''}">${plan.name}</div>
                <div class="plan-card-price">${plan.price}</div>
                <div class="plan-card-period">/${plan.period}</div>
                ${plan.savings ? `<div class="plan-card-savings">${plan.savings}</div>` : ''}
            </div>
        `;
    }

    container.innerHTML = html;
}

function selectPlan(planId) {
    selectedPlan = planId;
    renderPricingPlans();
    updateSubscribeButton();
}

function updateSubscribeButton() {
    const plan = PRO_CONFIG.PLANS[selectedPlan];
    const btn = document.getElementById('subscribe-btn');
    if (plan) {
        btn.textContent = `Subscribe - ${plan.price}/${plan.period}`;
    }
}

function updateTrialButton() {
    const trialBtn = document.getElementById('trial-btn');
    if (!hasUsedTrial()) {
        trialBtn.style.display = 'block';
    } else {
        trialBtn.style.display = 'none';
    }
    updateSubscribeButton();
}

function handleSubscribe() {
    const success = purchasePlan(selectedPlan);
    if (success) {
        showToast('Welcome to Androgenic PRO!');
        showScreen('home-screen');
        updateProUI();

        // Re-render results if available
        if (currentScores) {
            renderResults(currentScores);
        }
    }
}

function handleStartTrial() {
    const success = startFreeTrial();
    if (success) {
        showToast('3-day free trial activated!');
        showScreen('home-screen');
        updateProUI();

        if (currentScores) {
            renderResults(currentScores);
        }
    } else {
        showToast('Free trial already used');
    }
}

function handleRestore() {
    const success = restorePurchase();
    if (success) {
        showToast('Purchase restored!');
        updateProUI();
        showScreen('home-screen');
    } else {
        showToast('No previous purchase found');
    }
}

// ============================================
// SETTINGS SCREEN
// ============================================

function showSettingsScreen() {
    const container = document.getElementById('settings-content');
    const proActive = isPro();
    const trial = isTrialActive();
    const plan = getCurrentPlan();

    let html = '';

    // Pro status card
    if (proActive && !trial) {
        html += `
            <div class="settings-pro-card settings-pro-active">
                <h3>PRO Active ✓</h3>
                <p>${plan ? `${plan.name} plan - ${plan.price}/${plan.period}` : 'Subscribed'}</p>
            </div>
        `;
    } else if (trial) {
        const daysLeft = getTrialDaysRemaining();
        html += `
            <div class="settings-pro-card" onclick="showScreen('paywall-screen')">
                <h3>Free Trial - ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left</h3>
                <p>Upgrade to keep PRO features forever</p>
            </div>
        `;
    } else {
        html += `
            <div class="settings-pro-card" onclick="showScreen('paywall-screen')">
                <h3>Upgrade to PRO</h3>
                <p>Unlock all features, unlimited scans & more</p>
            </div>
        `;
    }

    // Subscription section
    html += `
        <div class="settings-section">
            <div class="settings-section-title">Subscription</div>
            <div class="settings-card">
                <div class="settings-item" onclick="showScreen('paywall-screen')">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">👑</div>
                        <div class="settings-item-label">${proActive ? 'Manage Subscription' : 'Upgrade to PRO'}</div>
                    </div>
                    <div class="settings-item-right">
                        ${proActive ? '<span class="pro-badge pro-badge-sm">ACTIVE</span>' : ''}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                </div>
                <div class="settings-item" onclick="handleRestore()">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">🔄</div>
                        <div class="settings-item-label">Restore Purchase</div>
                    </div>
                    <div class="settings-item-right">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Features section
    html += `
        <div class="settings-section">
            <div class="settings-section-title">Features</div>
            <div class="settings-card">
                <div class="settings-item" onclick="${proActive ? 'showProgressScreen()' : 'showScreen(\'paywall-screen\')'}">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">📈</div>
                        <div class="settings-item-label">Progress Tracker</div>
                    </div>
                    <div class="settings-item-right">
                        ${!proActive ? '<span class="pro-badge pro-badge-sm">PRO</span>' : ''}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                </div>
                <div class="settings-item" onclick="${proActive ? 'showPlanScreen()' : 'showScreen(\'paywall-screen\')'}">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">📋</div>
                        <div class="settings-item-label">Improvement Plan</div>
                    </div>
                    <div class="settings-item-right">
                        ${!proActive ? '<span class="pro-badge pro-badge-sm">PRO</span>' : ''}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                </div>
                <div class="settings-item" onclick="showHistoryScreen()">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">🕐</div>
                        <div class="settings-item-label">Analysis History</div>
                    </div>
                    <div class="settings-item-right">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Data section
    html += `
        <div class="settings-section">
            <div class="settings-section-title">Data</div>
            <div class="settings-card">
                <div class="settings-item" onclick="clearHistory(); showToast('History cleared');">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">🗑️</div>
                        <div class="settings-item-label">Clear History</div>
                    </div>
                    <div class="settings-item-right">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                </div>
            </div>
        </div>
    `;

    // App info
    html += `
        <div class="settings-section">
            <div class="settings-section-title">About</div>
            <div class="settings-card">
                <div class="settings-item">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">📱</div>
                        <div class="settings-item-label">Version</div>
                    </div>
                    <div class="settings-item-right">
                        <span>1.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    showScreen('settings-screen');
}

// ============================================
// PROGRESS SCREEN (PRO)
// ============================================

function showProgressScreen() {
    if (!isPro()) {
        showScreen('paywall-screen');
        return;
    }

    const container = document.getElementById('progress-content');
    const progress = getProgressData();

    if (!progress) {
        container.innerHTML = `
            <div class="empty-history" style="padding-top:80px">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64" opacity="0.3">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p>Not enough data yet</p>
                <p class="empty-sub">Take at least 2 analyses to see progress</p>
            </div>
        `;
        showScreen('progress-screen');
        return;
    }

    let html = '';

    // Overall progress chart
    html += `
        <div class="progress-chart">
            <h4>Overall Score Over Time</h4>
            <div class="chart-container">
    `;

    const maxScore = 10;
    const maxBarHeight = 160;

    progress.entries.forEach(entry => {
        const height = (entry.overall / maxScore) * maxBarHeight;
        const color = entry.overall >= 7 ? 'var(--score-high)' : entry.overall >= 5 ? 'var(--score-mid)' : 'var(--score-low)';
        html += `
            <div class="chart-bar-group">
                <div class="chart-bar-value" style="color:${color}">${entry.overall}</div>
                <div class="chart-bar" style="height:${height}px;background:${color}"></div>
                <div class="chart-label">${entry.date}</div>
            </div>
        `;
    });

    html += `</div></div>`;

    // Trends
    html += `<div class="progress-chart"><h4>Score Trends</h4>`;

    const catInfo = {
        overall: { emoji: '🏆', name: 'Overall' },
        masculinity: { emoji: '💪', name: 'Masculinity' },
        jawline: { emoji: '🦴', name: 'Jawline' },
        eyes: { emoji: '👀', name: 'Eyes' },
        cheekbones: { emoji: '🧬', name: 'Cheekbones' },
        hair: { emoji: '💇', name: 'Hair' },
        skin: { emoji: '✨', name: 'Skin' },
        symmetry: { emoji: '📐', name: 'Symmetry' }
    };

    for (const [key, trend] of Object.entries(progress.trends)) {
        const info = catInfo[key] || { emoji: '📊', name: key };
        const dirClass = trend.direction === 'up' ? 'trend-up' : trend.direction === 'down' ? 'trend-down' : 'trend-stable';
        const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';
        const sign = trend.change > 0 ? '+' : '';

        html += `
            <div class="trend-card">
                <div class="trend-emoji">${info.emoji}</div>
                <div class="trend-info">
                    <div class="trend-name">${info.name}</div>
                </div>
                <div class="trend-change ${dirClass}">
                    <span class="trend-arrow">${arrow}</span>
                    <span>${sign}${trend.change}${key === 'overall' ? '' : '%'}</span>
                </div>
            </div>
        `;
    }

    html += `</div>`;

    container.innerHTML = html;
    showScreen('progress-screen');
}

// ============================================
// IMPROVEMENT PLAN SCREEN (PRO)
// ============================================

function showPlanScreen() {
    if (!isPro()) {
        showScreen('paywall-screen');
        return;
    }

    if (!currentScores) {
        showToast('Analyze your face first to get a plan');
        return;
    }

    const container = document.getElementById('plan-content');
    const plan = generateImprovementPlan(currentScores);

    // Load saved task states
    const savedTasks = getSavedPlanTasks();

    let html = `
        <div style="text-align:center;margin-bottom:20px">
            <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Your 12-Week Glow Up</h2>
            <p style="font-size:13px;color:var(--text-secondary)">Personalized plan based on your analysis</p>
        </div>
    `;

    // Phases
    plan.phases.forEach((phase, phaseIdx) => {
        html += `
            <div class="plan-phase">
                <div class="phase-header">
                    <div class="phase-title">${phase.name}</div>
                    <div class="phase-weeks">Week ${phase.weeks}</div>
                </div>
        `;

        phase.tasks.forEach((task, taskIdx) => {
            const taskId = `${phaseIdx}-${taskIdx}`;
            const isDone = savedTasks[taskId] || false;
            html += `
                <div class="plan-task ${isDone ? 'done' : ''}" onclick="togglePlanTask('${taskId}', this)">
                    <div class="task-check"></div>
                    <div>
                        <div class="task-text">${task.task}</div>
                        <span class="task-category">${task.category}</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
    });

    // Weekly checklist
    html += `
        <div class="weekly-checklist">
            <h3>Weekly Habits</h3>
    `;

    plan.weeklyChecklist.forEach(item => {
        html += `
            <div class="checklist-item">
                <div class="checklist-emoji">${item.emoji}</div>
                <span>${item.task}</span>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
    showScreen('plan-screen');
}

function togglePlanTask(taskId, element) {
    const saved = getSavedPlanTasks();
    saved[taskId] = !saved[taskId];
    savePlanTasks(saved);

    element.classList.toggle('done');
}

function getSavedPlanTasks() {
    try {
        return JSON.parse(localStorage.getItem('androgenic_plan_tasks') || '{}');
    } catch {
        return {};
    }
}

function savePlanTasks(tasks) {
    try {
        localStorage.setItem('androgenic_plan_tasks', JSON.stringify(tasks));
    } catch (e) {}
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
    const maxEntries = getMaxHistory();

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

    const visibleHistory = history.slice(0, maxEntries);
    const hiddenCount = history.length - visibleHistory.length;

    let html = '<div class="history-list">';
    visibleHistory.forEach(entry => {
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

    if (hiddenCount > 0) {
        html += `
            <div class="pro-upsell-card" onclick="showScreen('paywall-screen')" style="margin-top:8px">
                <h4>🔒 ${hiddenCount} More Entries</h4>
                <p>Upgrade to PRO for unlimited history</p>
                <button class="pro-upsell-btn" style="margin-top:8px">Unlock</button>
            </div>
        `;
    }

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
        const eased = 1 - Math.pow(1 - progress, 3);
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
