const tipsDatabase = {
  masculinity: {
    low: [
      { title: 'Start Mewing', text: 'Proper tongue posture (mewing) can enhance facial structure over time. Keep your tongue pressed against the roof of your mouth at all times.', source: 'looksmax.org' },
      { title: 'Grow Facial Hair', text: 'A well-groomed beard can add perceived masculinity. Use minoxidil if you have patchy growth areas.', source: 'looksmax.org' },
      { title: 'Neck Training', text: 'A thick neck adds masculinity. Do neck curls and extensions 3x per week to build neck mass.', source: 'looksmax.org' },
    ],
    mid: [
      { title: 'Lean Down', text: 'Getting to 10-12% body fat reveals masculine bone structure. Focus on losing facial fat through caloric deficit.', source: 'looksmax.org' },
      { title: 'Testosterone Optimization', text: 'Sleep 8+ hours, lift heavy, eat zinc and vitamin D rich foods. High T creates more masculine features.', source: 'looksmax.org' },
      { title: 'Brow Ridge Enhancement', text: 'Use castor oil on eyebrows to thicken them. Darker, fuller brows increase perceived masculinity.', source: 'looksmax.org' },
    ],
    high: [
      { title: 'Maintain Your Edge', text: 'Keep body fat low to maintain defined features. Your masculine bone structure is your best asset.', source: 'looksmax.org' },
      { title: 'Optimize Grooming', text: 'Fine-tune facial hair to complement your strong features. Consider stubble length that highlights your jawline.', source: 'looksmax.org' },
    ],
  },
  jawline: {
    low: [
      { title: 'Mastic Gum Chewing', text: 'Chew mastic gum for 30-60 minutes daily to build masseter muscles and create a wider, more defined jaw.', source: 'looksmax.org' },
      { title: 'Mewing Technique', text: 'Proper tongue posture pushes the maxilla forward over time. Hard mewing can accelerate results.', source: 'looksmax.org' },
      { title: 'Lose Face Fat', text: 'A caloric deficit of 500kcal/day will help reveal your jawline. Avoid alcohol and excess sodium.', source: 'looksmax.org' },
    ],
    mid: [
      { title: 'Jawzrsize Device', text: 'Use a jaw exercise device for 20 minutes daily. Combined with gum chewing, this builds masseter hypertrophy.', source: 'looksmax.org' },
      { title: 'Chin Tucks', text: 'Perform chin tucks throughout the day to improve jaw posture and create a more defined chin-jaw angle.', source: 'looksmax.org' },
    ],
    high: [
      { title: 'Elite Jawline Maintenance', text: 'Your jawline is already strong. Continue chewing exercises to maintain. Avoid sleeping on your side to prevent asymmetry.', source: 'looksmax.org' },
    ],
  },
  eyes: {
    low: [
      { title: 'Fix Dark Circles', text: 'Apply vitamin C serum and caffeine eye cream daily. Get 8+ hours of sleep on your back. Stay hydrated.', source: 'looksmax.org' },
      { title: 'Canthal Tilt Tricks', text: 'Use eye drops to brighten whites. Groom eyebrows to lift at the outer corners for a hunter-eye appearance.', source: 'looksmax.org' },
      { title: 'Reduce Puffiness', text: 'Sleep elevated, apply cold spoons in the morning, and reduce sodium intake to minimize under-eye bags.', source: 'looksmax.org' },
    ],
    mid: [
      { title: 'Eye Area Enhancement', text: 'Castor oil on lashes and brows for thickness. Consider lash tinting for more contrast and depth.', source: 'looksmax.org' },
      { title: 'Under Eye Treatment', text: 'Retinol eye cream at night to reduce fine lines. Hyaluronic acid serum for hydration around the eye area.', source: 'looksmax.org' },
    ],
    high: [
      { title: 'Elite Eye Area', text: 'Your eye area is a standout feature. Maintain with proper sleep and hydration. Consider limbal ring enhancing drops.', source: 'looksmax.org' },
    ],
  },
  cheekbones: {
    low: [
      { title: 'Facial Yoga', text: 'Do cheek lift exercises daily: smile wide, press fingers on cheeks, and lift for 10 reps. Builds muscle over bones.', source: 'looksmax.org' },
      { title: 'Lose Buccal Fat', text: 'Getting lean reveals cheekbone structure. A low-sodium, anti-inflammatory diet reduces facial bloating.', source: 'looksmax.org' },
    ],
    mid: [
      { title: 'Mewing for Cheekbones', text: 'Proper tongue posture pushes the maxilla upward and forward, which lifts cheekbones over time.', source: 'looksmax.org' },
      { title: 'Face Massage', text: 'Gua sha along the cheekbone area improves blood flow and can create temporary lift. Do daily for cumulative effect.', source: 'looksmax.org' },
    ],
    high: [
      { title: 'High Cheekbones', text: 'Your prominent cheekbones are a top-tier feature. Stay lean to keep them visible. Avoid facial bloating.', source: 'looksmax.org' },
    ],
  },
  hair: {
    low: [
      { title: 'Hair Loss Prevention', text: 'Start finasteride or use topical minoxidil ASAP. The earlier you start, the more hair you save. Consider ketoconazole shampoo.', source: 'looksmax.org' },
      { title: 'Scalp Health', text: 'Massage scalp daily for 5 minutes to improve blood flow. Use paraben-free, sulfate-free shampoo.', source: 'looksmax.org' },
      { title: 'Dermarolling', text: 'Microneedle your scalp with a 1.5mm derma roller weekly. Studies show this boosts minoxidil effectiveness by 4x.', source: 'looksmax.org' },
    ],
    mid: [
      { title: 'Optimize Hair Style', text: 'Get a hairstyle that complements your face shape. Consult a barber about what works for your structure.', source: 'looksmax.org' },
      { title: 'Hair Supplements', text: 'Biotin 5000mcg, zinc, and saw palmetto daily. These support hair growth and reduce DHT effects.', source: 'looksmax.org' },
    ],
    high: [
      { title: 'Premium Hair', text: 'Your hair is a strong asset. Maintain with quality products. Avoid heat styling and use silk pillowcases.', source: 'looksmax.org' },
    ],
  },
  skin: {
    low: [
      { title: 'Basic Skincare Stack', text: 'AM: Cleanser → Vitamin C → Moisturizer → SPF 50. PM: Oil cleanser → Cleanser → Retinol → Moisturizer.', source: 'looksmax.org' },
      { title: 'Acne Protocol', text: 'Use benzoyl peroxide 2.5% as spot treatment. Salicylic acid cleanser 2x/week. Consider seeing a dermatologist for prescription options.', source: 'looksmax.org' },
      { title: 'Diet for Skin', text: 'Cut dairy, sugar, and processed foods. Eat omega-3 rich foods (salmon, walnuts). Drink 3+ liters of water daily.', source: 'looksmax.org' },
    ],
    mid: [
      { title: 'Advanced Skincare', text: 'Add niacinamide for pores, AHA/BHA exfoliants 2x/week, and peptide serums for anti-aging.', source: 'looksmax.org' },
      { title: 'Sun Protection', text: 'SPF 50 every single day, even indoors. UV damage is the #1 cause of skin aging. Reapply every 2 hours when outside.', source: 'looksmax.org' },
    ],
    high: [
      { title: 'Glass Skin', text: 'Your skin quality is excellent. Maintain your routine and never skip sunscreen. Add anti-aging treatments preventatively.', source: 'looksmax.org' },
    ],
  },
  symmetry: {
    low: [
      { title: 'Sleep Position', text: 'Sleep on your back only. Side sleeping causes facial asymmetry over time. Use a cervical pillow for support.', source: 'looksmax.org' },
      { title: 'Chewing Balance', text: 'Chew gum equally on both sides. Most people chew on one side, creating jaw asymmetry. Alternate every 5 minutes.', source: 'looksmax.org' },
      { title: 'Posture Correction', text: 'Fix forward head posture and scoliosis. These cause facial asymmetry. Do chin tucks and wall angels daily.', source: 'looksmax.org' },
    ],
    mid: [
      { title: 'Facial Exercises', text: 'Target the weaker side with extra exercises. If one jaw is smaller, chew more on that side to balance.', source: 'looksmax.org' },
      { title: 'TMJ Treatment', text: 'If you have TMJ issues, see a specialist. TMJ dysfunction causes significant facial asymmetry.', source: 'looksmax.org' },
    ],
    high: [
      { title: 'Symmetrical Features', text: 'Your facial symmetry is excellent. Maintain with balanced habits. Sleep on your back and chew on both sides.', source: 'looksmax.org' },
    ],
  },
};

const generalTips = {
  low: [
    { title: 'Looksmax Fundamentals', text: 'Focus on the basics first: skincare, body fat reduction, mewing, and grooming. These give the biggest returns.', source: 'looksmax.org' },
    { title: 'Body Recomposition', text: 'Hit the gym 4-5x/week. Build muscle and lose fat simultaneously. A fit body elevates your entire look.', source: 'looksmax.org' },
  ],
  mid: [
    { title: 'Level Up Strategy', text: 'You have a solid foundation. Now focus on your weakest areas for the biggest improvements. Target 2-3 specific areas.', source: 'looksmax.org' },
    { title: 'Style Optimization', text: 'Get your wardrobe right. Well-fitting clothes that match your body type can add 1-2 points alone.', source: 'looksmax.org' },
  ],
  high: [
    { title: 'Elite Maintenance', text: 'You\'re in the top tier. Focus on maintenance and subtle optimization. Small 1% improvements compound over time.', source: 'looksmax.org' },
    { title: 'Social Skills', text: 'At your level, charisma and confidence matter more than further looks improvements. Master your presence.', source: 'looksmax.org' },
  ],
};

export const getScoreLevel = (score) => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
};

export const getTipsForCategory = (category, score) => {
  const level = getScoreLevel(score);
  const categoryTips = tipsDatabase[category];
  if (!categoryTips) return [];
  return categoryTips[level] || [];
};

export const getOverallTips = (score) => {
  const level = getScoreLevel(score);
  return generalTips[level] || [];
};

export const getAllCategoryTips = (scores) => {
  const allTips = {};
  Object.keys(scores).forEach((category) => {
    if (category !== 'overall') {
      allTips[category] = getTipsForCategory(category, scores[category]);
    }
  });
  return allTips;
};
