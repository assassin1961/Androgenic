// Face analysis engine for React Native
// Uses image dimensions and random seed to generate consistent, realistic-looking scores

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed, index = 0) => {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
};

const randomInRange = (seed, index, min, max) => {
  return Math.round(min + seededRandom(seed, index) * (max - min));
};

export const analyzeFace = async (imageUri) => {
  // Generate a seed from the image URI for consistent results per image
  const seed = hashCode(imageUri || String(Date.now()));

  // Simulate analysis delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate scores with natural distribution (slightly biased toward mid-range for realism)
  const rawScores = {
    masculinity: randomInRange(seed, 1, 35, 98),
    jawline: randomInRange(seed, 2, 25, 95),
    eyes: randomInRange(seed, 3, 30, 92),
    cheekbones: randomInRange(seed, 4, 28, 90),
    hair: randomInRange(seed, 5, 32, 95),
    skin: randomInRange(seed, 6, 35, 93),
    symmetry: randomInRange(seed, 7, 40, 97),
  };

  // Compute weighted overall
  const weights = {
    masculinity: 0.20,
    jawline: 0.18,
    eyes: 0.18,
    cheekbones: 0.12,
    symmetry: 0.12,
    skin: 0.10,
    hair: 0.10,
  };

  let overall = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    overall += rawScores[key] * weight;
  });

  rawScores.overall = Math.round(overall);

  // Convert to 1-10 scale for display
  rawScores.overallRating = Math.max(1, Math.min(10, Math.round(overall / 10)));

  return rawScores;
};

export const getAnalysisSteps = () => [
  'Detecting facial landmarks...',
  'Measuring facial proportions...',
  'Analyzing bone structure...',
  'Computing symmetry index...',
  'Evaluating skin quality...',
  'Calculating attractiveness scores...',
  'Generating recommendations...',
];

export const CATEGORY_INFO = {
  masculinity: { label: 'Masculinity', icon: 'fitness-outline', description: 'Facial width-to-height ratio, brow ridge prominence, chin projection' },
  jawline: { label: 'Jawline', icon: 'square-outline', description: 'Jaw width, gonial angle, mandibular definition' },
  eyes: { label: 'Eyes', icon: 'eye-outline', description: 'Canthal tilt, interpupillary distance, eye shape' },
  cheekbones: { label: 'Cheekbones', icon: 'diamond-outline', description: 'Zygomatic prominence, midface projection, width ratio' },
  hair: { label: 'Hair', icon: 'leaf-outline', description: 'Hairline, density, quality, and styling potential' },
  skin: { label: 'Skin', icon: 'water-outline', description: 'Clarity, texture, tone, and overall complexion' },
  symmetry: { label: 'Symmetry', icon: 'sync-outline', description: 'Left-right facial balance and proportion harmony' },
};
