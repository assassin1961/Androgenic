export const secureSet = async (key, value) => {
  try { localStorage.setItem('sec_' + key, value); } catch {}
};

export const secureGet = async (key) => {
  try { return localStorage.getItem('sec_' + key); } catch { return null; }
};

export const secureDelete = async (key) => {
  try { localStorage.removeItem('sec_' + key); } catch {}
};

const rateLimits = {};
export const checkRateLimit = (action, maxPerMinute = 10) => {
  const now = Date.now();
  if (!rateLimits[action]) rateLimits[action] = [];
  rateLimits[action] = rateLimits[action].filter(t => now - t < 60000);
  if (rateLimits[action].length >= maxPerMinute) return false;
  rateLimits[action].push(now);
  return true;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>\"'&]/g, '').trim().substring(0, 1000);
};

export const isValidImageUri = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://') || uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('http');
};

export const getSessionToken = async () => {
  return 'web-session-' + Date.now().toString(36);
};

let suspiciousActions = 0;
export const reportSuspiciousActivity = (reason) => {
  suspiciousActions++;
  console.warn('Suspicious activity:', reason);
};

export const getSuspiciousCount = () => suspiciousActions;
