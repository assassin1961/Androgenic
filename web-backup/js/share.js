/**
 * Androgenic - Share & Export Module
 * Creates shareable result cards and handles sharing
 */

/**
 * Generate a shareable image card from results
 */
async function generateShareCard(photoSrc, scores) {
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');

    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0a0a');
    bgGrad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Header gradient bar
    const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
    headerGrad.addColorStop(0, '#667eea');
    headerGrad.addColorStop(0.5, '#764ba2');
    headerGrad.addColorStop(1, '#f093fb');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, width, 4);

    // Logo text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Androgenic', width / 2, 50);

    ctx.fillStyle = '#666666';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('AI Face Analysis', width / 2, 72);

    // Photo circle
    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = photoSrc;
        });

        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 160, 60, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, width / 2 - 60, 100, 120, 120);
        ctx.restore();

        // Photo border
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width / 2, 160, 61, 0, Math.PI * 2);
        ctx.stroke();
    } catch (e) {
        // Draw placeholder circle
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(width / 2, 160, 60, 0, Math.PI * 2);
        ctx.fill();
    }

    // Overall score card
    const cardY = 240;
    const cardGrad = ctx.createLinearGradient(80, cardY, width - 80, cardY + 120);
    cardGrad.addColorStop(0, '#667eea');
    cardGrad.addColorStop(0.5, '#764ba2');
    cardGrad.addColorStop(1, '#f093fb');
    roundRect(ctx, 80, cardY, width - 160, 120, 16);
    ctx.fillStyle = cardGrad;
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("You're a", width / 2, cardY + 35);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(scores.overall.toString(), width / 2, cardY + 85);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('out of 10', width / 2, cardY + 108);

    // Score grid
    const categories = [
        { key: 'masculinity', emoji: '💪', name: 'Masculinity' },
        { key: 'jawline', emoji: '🦴', name: 'Jawline' },
        { key: 'cheekbones', emoji: '🧬', name: 'Cheekbones' },
        { key: 'eyes', emoji: '👀', name: 'Eyes' },
        { key: 'hair', emoji: '💇', name: 'Hair' },
        { key: 'skin', emoji: '✨', name: 'Skin' }
    ];

    const gridStartY = 400;
    const colWidth = (width - 100) / 3;
    const rowHeight = 80;

    categories.forEach((cat, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 50 + col * colWidth + colWidth / 2;
        const y = gridStartY + row * rowHeight;

        // Category card background
        roundRect(ctx, 50 + col * colWidth + 5, y - 10, colWidth - 10, 65, 10);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Score
        const score = scores[cat.key];
        const scoreLabel = getScoreOut10(score);

        ctx.textAlign = 'center';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#888888';
        ctx.fillText(cat.name, x, y + 10);

        const scoreColor = score > 65 ? '#00d26a' : score > 40 ? '#f5a623' : '#ff4757';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = scoreColor;
        ctx.fillText(scoreLabel + '/10', x, y + 40);
    });

    // Footer
    const footerY = gridStartY + 2 * rowHeight + 30;

    ctx.fillStyle = '#333333';
    ctx.fillRect(50, footerY, width - 100, 1);

    ctx.fillStyle = '#444444';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Analyzed by Androgenic AI', width / 2, footerY + 30);
    ctx.fillText('Get your rating at androgenic.app', width / 2, footerY + 50);

    return canvas.toDataURL('image/png');
}

function getScoreOut10(score100) {
    return Math.max(1, Math.min(10, Math.round(score100 / 10)));
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Download share card as image
 */
function downloadShareCard(dataUrl) {
    const link = document.createElement('a');
    link.download = 'androgenic-results.png';
    link.href = dataUrl;
    link.click();
}

/**
 * Native share if available
 */
async function nativeShare(dataUrl) {
    if (navigator.share) {
        try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'androgenic-results.png', { type: 'image/png' });
            await navigator.share({
                title: 'My Androgenic Results',
                text: 'Check out my face analysis results from Androgenic!',
                files: [file]
            });
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
            return false;
        }
    }
    return false;
}

/**
 * Copy results as text
 */
function copyResultsText(scores) {
    const text = `My Androgenic Face Analysis Results:
Overall: ${scores.overall}/10
Masculinity: ${getScoreOut10(scores.masculinity)}/10
Jawline: ${getScoreOut10(scores.jawline)}/10
Cheekbones: ${getScoreOut10(scores.cheekbones)}/10
Eyes: ${getScoreOut10(scores.eyes)}/10
Hair: ${getScoreOut10(scores.hair)}/10
Skin: ${getScoreOut10(scores.skin)}/10

Get your rating: androgenic.app`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Results copied to clipboard!');
    }).catch(() => {
        showToast('Could not copy to clipboard');
    });
}

/**
 * Show a toast notification
 */
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/**
 * Save analysis to history in localStorage
 */
function saveToHistory(photoSrc, scores) {
    const history = getHistory();
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        photo: photoSrc,
        scores: scores
    };

    history.unshift(entry);

    // Keep only last 20 entries
    if (history.length > 20) {
        history.splice(20);
    }

    try {
        localStorage.setItem('androgenic_history', JSON.stringify(history));
    } catch (e) {
        // Storage full - remove oldest entries
        history.splice(10);
        try {
            localStorage.setItem('androgenic_history', JSON.stringify(history));
        } catch (e2) {
            console.error('Cannot save to localStorage');
        }
    }
}

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('androgenic_history') || '[]');
    } catch {
        return [];
    }
}

function clearHistory() {
    localStorage.removeItem('androgenic_history');
}
