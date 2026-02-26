import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');
const CHAT_STORAGE_KEY = 'androgenic_chat_history';
const FREE_MESSAGE_LIMIT = 5;

const WELCOME_MESSAGE = {
  id: 'welcome',
  text: "Hey! I'm your Androgenic AI advisor. Ask me anything about facial aesthetics, mewing, skincare routines, jawline exercises, or your analysis results. What would you like to improve?",
  sender: 'ai',
  timestamp: null,
};

const QUICK_SUGGESTIONS = [
  'How to improve my jawline?',
  'Best skincare routine',
  'Explain mewing technique',
  'How to fix facial asymmetry?',
];

// ─── AI Knowledge Base ──────────────────────────────────────────────
const AI_RESPONSES = [
  {
    keywords: ['mewing', 'tongue posture', 'tongue position', 'mew'],
    response: "Mewing is one of the most impactful things you can do for facial development. Here's how to do it properly:\n\n1. Rest your ENTIRE tongue flat against the roof of your mouth — not just the tip\n2. The back third of your tongue is the most important part and should push gently upward against the soft palate\n3. Keep your lips sealed and teeth lightly touching or slightly apart\n4. Breathe through your nose at all times\n\nCommon mistakes: Only pressing the tongue tip, clenching your jaw, or mouth breathing at night. For best results, maintain this posture 24/7 including during sleep. Use mouth tape at night if needed.\n\nResults timeline: Soft tissue changes in 1-3 months. Bone remodeling takes 6-24 months and is more pronounced under age 25.",
  },
  {
    keywords: ['jawline', 'jaw', 'chin', 'mandible', 'jaw define', 'jaw exercise'],
    response: "Here's a complete jawline improvement protocol:\n\n**Exercises:**\n- Chin tucks: 3 sets of 15 reps daily. Pull chin straight back creating a double chin — this strengthens neck posture and defines the jaw-neck angle\n- Mastic gum chewing: Chew for 30-45 min daily, alternating sides. This builds masseter muscles for a wider jaw\n- Jaw clenches: Clench and hold for 5 seconds, repeat 20 times\n- Neck curls: Lie face-up, curl chin to chest for 3 sets of 15 to tighten submental area\n\n**Lifestyle:**\n- Maintain proper tongue posture (mewing)\n- Sleep on your back to avoid jaw asymmetry\n- Stay lean — lower body fat (12-15%) dramatically reveals jaw definition\n- Good posture pushes the jaw forward naturally\n\nConsistency is key. Expect visible masseter growth in 4-8 weeks with daily gum chewing.",
  },
  {
    keywords: ['skincare', 'skin care', 'skin routine', 'acne', 'pimple', 'breakout', 'clear skin'],
    response: "Here's a proven skincare routine for men looking to maximize facial aesthetics:\n\n**Morning:**\n1. Gentle cleanser (CeraVe or La Roche-Posay)\n2. Vitamin C serum — brightens and protects\n3. Lightweight moisturizer (with niacinamide if possible)\n4. SPF 30+ sunscreen — this is NON-NEGOTIABLE. UV damage is the #1 cause of premature aging\n\n**Evening:**\n1. Double cleanse if you wore sunscreen (oil cleanser then regular)\n2. Retinol/retinoid (start 2x per week, build to nightly) — this is the gold standard for anti-aging, texture, and acne\n3. Moisturizer\n\n**Weekly:**\n- Exfoliate 1-2x with salicylic acid (BHA) or glycolic acid (AHA)\n\n**Key tips:**\n- Hydration: drink 3+ liters of water daily\n- Change pillowcases weekly\n- Never touch your face\n- Cut dairy and sugar if acne-prone\n- Be patient — a new routine takes 4-6 weeks to show results.",
  },
  {
    keywords: ['asymmetry', 'asymmetric', 'uneven', 'one side', 'lopsided', 'symmetry'],
    response: "Facial asymmetry is extremely common — almost nobody has a perfectly symmetric face. Here's how to improve it:\n\n**Habits to fix:**\n- Sleep on your back. Side sleeping compresses one side of your face for 6-8 hours nightly and is a major cause of asymmetry\n- Chew evenly on both sides — most people favor one side, which overdevelops that masseter\n- Fix head posture. Tilting your head habitually creates muscular imbalances\n- Stop resting your face on your hand\n\n**Active improvements:**\n- Chew mastic gum on your weaker side more frequently to balance masseter size\n- Practice mewing with even tongue pressure on both sides of the palate\n- Facial massage on the tighter/shorter side to release tension\n- Neck stretches to correct any cervical tilt\n\n**Important:** Some asymmetry is structural (bone) and won't change with exercises. Focus on the soft tissue asymmetry you CAN fix. Camera lens distortion also exaggerates asymmetry in selfies — your face looks more symmetric in person.",
  },
  {
    keywords: ['hair', 'hairstyle', 'haircut', 'hairline', 'balding', 'hair loss', 'minoxidil', 'finasteride'],
    response: "Hair is a HUGE factor in facial aesthetics. Here's what to know:\n\n**Best hairstyles by face shape:**\n- Oval: You're lucky — almost anything works. Try medium-length textured styles\n- Round: Add height on top, keep sides short. Pompadour, quiff, or textured crop\n- Square: Embrace it. Short sides, medium top. Classic taper or crew cut\n- Long/Oblong: Avoid height on top. Go for side parts or fringe to add width\n\n**Hair health:**\n- Use sulfate-free shampoo 2-3x per week (not daily)\n- Condition every wash\n- Use a heat protectant before styling\n- Biotin supplements (5000mcg) can support growth\n- Scalp massage 5 min daily increases blood flow\n\n**Hair loss prevention:**\n- Minoxidil 5% (topical, twice daily) — proven to regrow hair. Results in 3-6 months\n- Finasteride (prescription) — blocks DHT, the hormone causing male pattern baldness\n- Microneedling (1.5mm derma roller on scalp weekly) boosts minoxidil effectiveness\n- Act EARLY. It's much easier to keep hair than regrow it.",
  },
  {
    keywords: ['nutrition', 'diet', 'food', 'eat', 'supplement', 'vitamin', 'collagen', 'protein'],
    response: "Nutrition directly affects your facial aesthetics. Here's how to optimize it:\n\n**Foods for facial gains:**\n- High protein (1g per lb bodyweight): Builds collagen and muscle including facial muscles\n- Omega-3 fatty acids (salmon, walnuts): Anti-inflammatory, improves skin glow\n- Vitamin A foods (sweet potato, carrots): Essential for skin cell turnover\n- Zinc-rich foods (oysters, beef, pumpkin seeds): Fights acne, supports testosterone\n- Berries and leafy greens: Antioxidants protect against aging\n\n**Supplements worth taking:**\n- Collagen peptides (10g daily): Improves skin elasticity and hydration\n- Vitamin D3 (2000-5000 IU): Most men are deficient — affects skin, hormones, and mood\n- Zinc (30mg): Supports clear skin and testosterone\n- Omega-3 fish oil (2g EPA/DHA): Reduces inflammation\n- Magnesium (400mg): Improves sleep quality which is crucial for skin repair\n\n**What to avoid:**\n- Excess sugar (causes glycation — ages your skin)\n- Dairy (inflammatory, linked to acne in many people)\n- Alcohol (dehydrates skin, causes puffiness)\n- Highly processed foods (inflammatory response affects skin clarity)",
  },
  {
    keywords: ['eye', 'eyes', 'eye area', 'dark circle', 'under eye', 'puffy', 'eye bag', 'canthal'],
    response: "The eye area is often called the most important facial feature. Here's how to optimize it:\n\n**Reducing dark circles:**\n- Sleep 7-9 hours consistently — this is the biggest factor\n- Caffeine eye cream (The Ordinary Caffeine Solution): Constricts blood vessels under eyes\n- Vitamin K cream can help with dark pigmentation\n- Cold compress or chilled spoons in the morning\n- Stay hydrated and reduce sodium intake\n\n**Reducing puffiness:**\n- Sleep slightly elevated (extra pillow)\n- Reduce alcohol and salt intake\n- Apply cold eye masks or chilled tea bags\n- Lymphatic drainage massage: gently press from inner corner outward\n\n**Enhancing eye area:**\n- Groomed eyebrows frame the eyes — clean up strays but maintain natural shape\n- Retinol eye cream for fine lines (start low concentration)\n- Adequate sleep gives brighter, more alert-looking eyes\n- Proper posture and forward head correction changes how your orbital area catches light\n\n**Canthal tilt:** This is mostly genetic (the angle of your eye corners). Squinting slightly in photos can simulate a positive canthal tilt. Some people use tape techniques but results are temporary.",
  },
  {
    keywords: ['cheekbone', 'cheek', 'midface', 'hollow cheek', 'buccal'],
    response: "Cheekbone prominence and hollow cheeks are elite-tier facial features. Here's how to enhance yours:\n\n**Getting hollow cheeks:**\n- Lower your body fat to 12-15%. This is THE biggest factor — face fat obscures cheekbone structure\n- Mewing: Proper tongue posture pushes the maxilla up and forward, naturally enhancing cheekbone projection\n- Chew mastic gum: Builds masseters which creates a wider, more angular lower face that contrasts with cheekbones\n\n**Facial exercises:**\n- Fish face holds: Suck in cheeks, hold 10 sec, repeat 15 times\n- Cheek lifts: Smile wide, press fingertips on cheeks, lift toward eyes\n- Jaw openers: Open mouth wide, push jaw forward, hold 10 seconds\n\n**Lifestyle factors:**\n- Hydration reduces face bloat which reveals bone structure\n- Reduce sodium and alcohol — both cause facial water retention\n- Sleep quality affects growth hormone which impacts facial bone maintenance\n\n**Reality check:** Cheekbone height and projection is largely genetic/structural. But lowering body fat combined with mewing and masseter development can dramatically change how your midface looks.",
  },
  {
    keywords: ['beard', 'facial hair', 'grow beard', 'patchy', 'stubble'],
    response: "Facial hair can completely transform jaw and facial aesthetics. Here's the guide:\n\n**Growing a fuller beard:**\n- Minoxidil 5% (liquid or foam): Apply to beard area twice daily. This is the #1 proven method for filling in patches. Results in 3-6 months, gains become permanent after ~2 years\n- Derma rolling (0.5mm, twice weekly before minoxidil): Increases absorption and stimulates follicles\n- Be patient — let it grow for at least 4-6 weeks before judging\n\n**Beard styles for face shapes:**\n- Round face: Keep it angular, longer on chin, shorter on sides\n- Long face: Fuller on sides, shorter chin length to add width\n- Square face: You have the ideal jaw — light stubble or short box beard works best\n- Oval face: Most styles work. Experiment freely\n\n**Beard care:**\n- Wash with beard shampoo 2-3x per week\n- Use beard oil daily for softness and skin health\n- Trim regularly with a quality trimmer — clean neckline is essential\n- Brush daily to train growth direction\n\n**If you can't grow a full beard:** Clean-shaven with a strong jaw is always better than a patchy beard. Work on the jaw itself with exercises.",
  },
  {
    keywords: ['posture', 'forward head', 'neck', 'slouch', 'hunch'],
    response: "Posture is the most underrated factor in facial aesthetics. Here's why and how to fix it:\n\n**Why it matters:**\n- Forward head posture pushes the jaw backward, weakening your jawline profile\n- Poor posture compresses the cervical spine, creating a shorter neck appearance\n- Slouching promotes mouth breathing which negatively impacts facial development\n- Correct posture can make you look 1-2 points more attractive instantly\n\n**Exercises to fix it:**\n- Chin tucks: Pull chin straight back, hold 5 seconds, 20 reps, 3x daily\n- Wall angels: Stand against wall, slide arms up and down, 3 sets of 10\n- Thoracic extensions: Foam roll upper back, extend over it 15 reps\n- Face pulls (with band): 3 sets of 15-20, external rotation at top\n- Dead hangs: Decompress spine, 30-60 seconds, 3 sets\n\n**Daily habits:**\n- Set hourly phone reminders to check posture\n- Keep monitor at eye level\n- Hold phone at eye level (reduces 'tech neck')\n- Strengthen your back: rows, pull-ups, reverse flyes\n- Sleep on your back with proper pillow height\n\nMost people see significant posture improvement in 4-8 weeks of consistent work.",
  },
  {
    keywords: ['body fat', 'lean', 'lose weight', 'fat', 'bloat', 'water retention', 'cut'],
    response: "Getting lean is the single most transformative thing for facial aesthetics. Here's the protocol:\n\n**Target body fat for face gains:**\n- 15-17%: Jaw starts becoming visible\n- 12-15%: Sweet spot — defined jaw, visible cheekbones, hollow cheeks emerge\n- 10-12%: Maximum facial definition (but harder to maintain)\n\n**How to get there:**\n- Caloric deficit of 300-500 calories below maintenance\n- High protein (1g per lb bodyweight) to preserve muscle\n- Strength train 3-5x per week — muscle raises metabolism\n- 8000+ steps daily for non-exercise activity\n- Track calories for at least a few weeks to understand portions\n\n**Reducing facial bloat specifically:**\n- Limit sodium to 2000mg daily\n- Drink MORE water (3+ liters) — counterintuitively, this reduces water retention\n- Reduce alcohol consumption — causes significant face puffiness\n- Minimize refined carbs (bread, pasta) which hold water\n- Sleep 7-9 hours (poor sleep increases cortisol and face bloat)\n\n**Timeline:** You'll start seeing face gains after losing 5-10 lbs. The face is often the first place you notice fat loss.",
  },
  {
    keywords: ['sleep', 'sleeping', 'rest', 'tired', 'insomnia'],
    response: "Sleep is when your body repairs and regenerates. It massively affects how your face looks:\n\n**Sleep optimization protocol:**\n- Get 7-9 hours consistently — non-negotiable for skin repair and HGH release\n- Sleep on your back: Side/stomach sleeping compresses your face for hours causing wrinkles and asymmetry\n- Use a silk pillowcase if you can't sleep on your back — less friction and less moisture absorption\n- Keep room at 65-68F (18-20C) for optimal sleep quality\n- Blackout curtains or sleep mask for complete darkness\n\n**Pre-sleep routine:**\n- No screens 30 min before bed (or use blue light glasses)\n- No caffeine after 2pm\n- Magnesium glycinate (400mg) before bed improves sleep depth\n- Apply your evening skincare (retinol works best overnight)\n- Mouth tape for forced nasal breathing during sleep (important for mewing)\n\n**Why it matters for looks:**\n- Growth hormone is released during deep sleep (facial bone and skin repair)\n- Poor sleep increases cortisol which breaks down collagen\n- Dark circles and puffy eyes are directly caused by bad sleep\n- Sleep deprivation is rated as significantly less attractive in studies",
  },
  {
    keywords: ['retinol', 'retinoid', 'tretinoin', 'anti aging', 'wrinkle', 'aging', 'fine line'],
    response: "Retinol/tretinoin is the single most evidence-backed ingredient in skincare:\n\n**What it does:**\n- Accelerates skin cell turnover (new, fresh skin faster)\n- Boosts collagen production\n- Reduces fine lines and wrinkles\n- Fades dark spots and hyperpigmentation\n- Improves skin texture and tone\n- Unclogs pores and reduces acne\n\n**How to start:**\n1. Begin with a low concentration (0.025% tretinoin or 0.3% retinol)\n2. Apply pea-sized amount to face 2x per week at night\n3. Increase to every other night after 2-3 weeks\n4. Build to nightly over 6-8 weeks\n5. ALWAYS use SPF 30+ during the day — retinol makes skin more sun-sensitive\n\n**Managing irritation (the retinol purge):**\n- Flaking and redness is normal for the first 2-4 weeks\n- Buffer by applying moisturizer first, then retinol on top\n- Skip a day if skin is very irritated\n- Do NOT combine with vitamin C, AHA/BHA on the same night\n\n**Timeline:** Expect visible improvement in texture at 4-6 weeks. Significant anti-aging results at 3-6 months. This is a long-term commitment — results compound over years.",
  },
  {
    keywords: ['sunscreen', 'spf', 'sun', 'uv', 'sun damage', 'tan'],
    response: "Sunscreen is the single most important anti-aging product. Period.\n\n**Why it's crucial:**\n- 80-90% of visible skin aging comes from UV exposure\n- UV breaks down collagen and elastin (causes sagging and wrinkles)\n- Prevents dark spots and uneven skin tone\n- Reduces skin cancer risk\n\n**How to use it correctly:**\n- Apply SPF 30-50 EVERY morning, even on cloudy days (80% of UV penetrates clouds)\n- Use 2 finger-lengths of product for full face coverage\n- Reapply every 2 hours if outdoors\n- Apply as the LAST step of your morning skincare, before makeup\n\n**Best types for men:**\n- Chemical sunscreens: Lightweight, invisible, better under makeup. Look for avobenzone or mexoryl\n- Mineral sunscreens: Zinc oxide/titanium dioxide. Better for sensitive skin but can leave a white cast\n- Asian sunscreens (Japanese/Korean brands) tend to be the most cosmetically elegant\n\n**Recommendations:**\n- Budget: Neutrogena Ultra Sheer SPF 50\n- Mid: La Roche-Posay Anthelios\n- Premium: Supergoop Unseen Sunscreen\n- Asian: Biore UV Aqua Rich Watery Essence",
  },
  {
    keywords: ['grooming', 'eyebrow', 'brow', 'nose hair', 'ear hair', 'hygiene'],
    response: "Grooming is the easiest quick win for facial aesthetics:\n\n**Eyebrows (hugely important):**\n- Clean up stray hairs between brows (unibrow) — pluck or thread\n- Trim any overly long brow hairs with small scissors\n- Maintain natural shape — don't over-pluck or create thin, unnatural arches\n- Brush brows upward with a spoolie for a fuller, groomed look\n- Consider brow gel to keep them in place\n\n**Facial hair grooming:**\n- Define a clean neckline: Place two fingers above Adam's apple — that's your line\n- Clean cheek lines weekly\n- Invest in a quality trimmer (Philips OneBlade is great)\n- Trim nose and ear hair regularly\n\n**Lips:**\n- Exfoliate lips weekly with a lip scrub or soft toothbrush\n- Apply lip balm with SPF daily\n- Hydrated lips look significantly better\n\n**General:**\n- Keep nails clean and trimmed\n- Moisturize hands and neck (often neglected)\n- Use a quality fragrance — scent is part of overall attractiveness\n- Whiten teeth (whitening strips or dentist treatment)\n\nThese small details separate a 6 from a 7+.",
  },
  {
    keywords: ['looksmax', 'glow up', 'improve', 'attractive', 'better looking', 'rating', 'score'],
    response: "Here's the complete looksmaxxing priority list, ranked by impact:\n\n**Tier 1 — Highest Impact:**\n1. Get lean (12-15% body fat) — reveals facial bone structure\n2. Skincare routine (cleanser, retinol, SPF) — healthy skin is foundational\n3. Proper sleep (7-9 hrs, on back) — repairs everything\n4. Mewing (24/7 tongue posture) — improves jaw and midface over time\n\n**Tier 2 — Major Impact:**\n5. Hairstyle optimized for face shape\n6. Eyebrow grooming — frames the face\n7. Posture correction — forward head kills your jawline\n8. Jawline exercises (gum + chin tucks)\n\n**Tier 3 — Solid Gains:**\n9. Teeth whitening\n10. Fragrance\n11. Facial hair optimization (grow or clean shave)\n12. Nutrition optimization (collagen, zinc, omega-3)\n\n**Tier 4 — Advanced:**\n13. Minoxidil for beard/hair if needed\n14. Professional skincare (chemical peels, microneedling)\n15. Style and fashion optimization\n\nStart with Tier 1 and work down. Most guys see dramatic improvement just from getting lean, fixing skin, and optimizing hair.",
  },
  {
    keywords: ['water', 'hydration', 'drink'],
    response: "Hydration is crucial for facial aesthetics — here's the full breakdown:\n\n**How much:** Aim for 3-4 liters per day minimum. More if you exercise or live in a hot climate.\n\n**Why it transforms your face:**\n- Plumps skin cells, reducing fine lines and making skin look healthier\n- Flushes toxins that cause breakouts\n- Reduces under-eye darkness and puffiness\n- Paradoxically, drinking MORE water reduces water retention and facial bloating\n- Improves skin elasticity and glow\n\n**Hydration protocol:**\n- Drink 500ml immediately upon waking\n- Carry a water bottle everywhere\n- Add electrolytes (sodium, potassium, magnesium) to one bottle daily for better absorption\n- Eat water-rich foods: cucumber, watermelon, celery\n- Reduce caffeine and alcohol which dehydrate\n\n**Pro tip:** Track your water intake for one week. Most people are shocked at how little they actually drink. A hydrated face literally looks 1-2 years younger than a dehydrated one.",
  },
  {
    keywords: ['testosterone', 'hormone', 'masculin', 'masculine', 'androgen'],
    response: "Testosterone and androgens directly impact facial masculinity:\n\n**Natural testosterone optimization:**\n- Lift heavy compound movements (squats, deadlifts, bench): boosts T significantly\n- Sleep 7-9 hours: T production happens during deep sleep\n- Maintain 12-20% body fat: too high or too low kills T\n- Zinc (30mg) and Vitamin D3 (5000 IU) supplementation\n- Reduce chronic stress (cortisol directly suppresses T)\n- Limit alcohol — even moderate drinking lowers testosterone\n\n**How T affects facial aesthetics:**\n- Stronger brow ridge and more prominent supraorbital area\n- Wider and more angular jaw (DHT stimulates jaw bone growth)\n- Increased facial hair growth and density\n- Deeper-set eyes and more defined features overall\n- More pronounced cheekbones\n\n**Important notes:**\n- Most facial bone development from hormones occurs during puberty (13-21)\n- After 25, hormonal impact on bone is minimal but soft tissue still responds\n- Never take exogenous T without medical supervision\n- Focus on maximizing natural T through lifestyle first\n\n**DHT (dihydrotestosterone)** is the primary androgen for facial masculinization. It's a double-edged sword — great for jaw/brow development but causes hair loss in genetically susceptible men.",
  },
  {
    keywords: ['exercise', 'gym', 'workout', 'lift', 'muscle', 'training', 'fitness'],
    response: "Exercise transforms your face in multiple ways:\n\n**How lifting improves facial aesthetics:**\n- Reduces body fat which reveals jawline, cheekbones, and facial bone structure\n- Boosts testosterone which enhances masculine facial features\n- Improves posture (rows, face pulls, deadlifts) which directly impacts jawline appearance\n- Increases blood flow giving your skin a healthy glow\n- Builds a proportional neck/trap frame that enhances facial aesthetics\n\n**Face-specific benefits by exercise:**\n- Deadlifts + Squats: Major T boost, overall fat loss\n- Neck curls + extensions: Thicker neck frames the jaw better\n- Face pulls: Fix rounded shoulders and forward head posture\n- Shrugs: Build traps that create a powerful jaw-to-shoulder line\n\n**Recommended program:**\n- Train 4-5x per week (PPL or Upper/Lower split)\n- Prioritize compound lifts for hormonal benefits\n- Add neck training 2-3x per week (seriously underrated)\n- Include 2-3 cardio sessions for fat loss\n\n**Neck training protocol:**\n- Neck curls: 3x15-20 (lie face up, curl weight on forehead)\n- Neck extensions: 3x15-20 (lie face down)\n- Start with light weight — neck muscles grow FAST",
  },
  {
    keywords: ['teeth', 'smile', 'whiten', 'whitening', 'dental', 'braces', 'invisalign'],
    response: "Your smile is one of the biggest factors in perceived attractiveness:\n\n**Teeth whitening options:**\n- Whitening strips (Crest 3D White): Easy at-home option, visible results in 1-2 weeks\n- Custom trays from dentist with professional gel: Best at-home results\n- In-office whitening (Zoom): Fastest results, 1-2 shades whiter in one session\n- Activated charcoal: Mixed evidence, may damage enamel with overuse\n\n**Alignment:**\n- Invisalign/clear aligners: Invisible, removable, 6-18 months treatment\n- Traditional braces: Most effective for complex cases\n- Even minor crowding affects smile aesthetics — worth correcting\n\n**Daily dental routine:**\n- Brush 2x daily with electric toothbrush (Oral-B or Sonicare)\n- Floss daily — non-negotiable for gum health\n- Use mouthwash (alcohol-free)\n- Tongue scraper for fresh breath\n\n**Smile tips:**\n- Practice smiling in the mirror — find your best natural smile\n- Show some teeth when smiling for photos\n- Avoid staining: coffee, tea, red wine, turmeric\n- Use a straw for dark beverages\n\nA bright, straight smile can add 1-2 points to your overall attractiveness.",
  },
  {
    keywords: ['confidence', 'mental', 'mindset', 'self esteem', 'motivation', 'anxiety', 'social'],
    response: "Confidence and mindset are arguably more important than physical features:\n\n**Building genuine confidence:**\n- Set small daily goals and achieve them — competence builds confidence\n- Track your progress with photos. Seeing improvement is incredibly motivating\n- Focus on what you CAN change, accept what you can't\n- Confidence is attractive at a biological level — it signals genetic fitness\n\n**Practical tips:**\n- Maintain strong eye contact (look at the bridge of their nose if direct eye contact feels intense)\n- Speak slowly and deliberately — rushing signals nervousness\n- Take up physical space — open posture, squared shoulders\n- Practice social interactions like a skill (it IS a skill)\n\n**Mindset shifts:**\n- Looksmaxxing is self-improvement, not self-hatred\n- Compare yourself to your past self, never to others\n- Consistency beats intensity — small daily actions compound massively\n- Most guys never put in ANY effort into their appearance — just trying puts you ahead of 80%\n\n**Important:** If you find yourself obsessing over minor flaws that others don't notice, step back. Body dysmorphia is real. The goal is to become your best version while maintaining a healthy relationship with your appearance.",
  },
  {
    keywords: ['nose', 'rhinoplasty', 'nose shape', 'nose job'],
    response: "Here's what to know about nose aesthetics:\n\n**Non-surgical options:**\n- Nose contouring with makeup (yes, men do this — subtle is key)\n- Nose shapers/clips: Limited evidence, but some people report minor temporary changes\n- Weight loss can slightly change how your nose looks relative to your face\n\n**Surgical option (rhinoplasty):**\n- One of the most common cosmetic procedures for men\n- Can reshape tip, bridge, width, and nostrils\n- Recovery: 1-2 weeks visible swelling, full result in 6-12 months\n- Cost: $5,000-$15,000 depending on location and surgeon\n- Research surgeons extensively — look at male-specific before/after photos\n\n**Perspective:**\n- Your nose often looks worse to you than it does to others (especially in selfies — front camera distorts nose size by up to 30%)\n- A slightly imperfect nose can add character\n- Focus on what you can change naturally first (skin, jaw, body fat) before considering surgery\n- If it genuinely bothers you and affects your confidence, a consultation with a board-certified surgeon is a reasonable step",
  },
  {
    keywords: ['skin tone', 'complexion', 'glow', 'dull', 'pale', 'tan', 'bright'],
    response: "Getting a healthy, glowing complexion:\n\n**For a natural glow:**\n- Vitamin C serum every morning — the #1 product for radiance\n- Chemical exfoliation 2x weekly (AHA like glycolic acid)\n- Hydrate aggressively — water + hyaluronic acid serum\n- Niacinamide (Vitamin B3) — evens skin tone and reduces redness\n- Get enough sleep — dull skin is almost always linked to poor sleep\n\n**Safe tanning:**\n- Gradual self-tanner (Jergens Natural Glow or St. Tropez)\n- Apply after exfoliating for even coverage\n- A light tan makes features look more defined\n- AVOID tanning beds — accelerated skin aging and cancer risk\n- If you want sun exposure, limit to 15-20 min and always use SPF after\n\n**Reducing redness:**\n- Azelaic acid (great for redness and rosacea)\n- Green-tinted primer neutralizes redness\n- Avoid hot showers on face\n- Niacinamide strengthens skin barrier\n\n**Diet for glow:**\n- Beta-carotene foods (carrots, sweet potatoes) — literally gives skin a warm, attractive tone\n- Omega-3s for reducing inflammation\n- Reduce sugar, dairy, and alcohol",
  },
  {
    keywords: ['lip', 'lips', 'lip care', 'chapped'],
    response: "Lip care is often overlooked but makes a noticeable difference:\n\n**Daily lip care:**\n- Apply SPF lip balm during the day (UV damages lips too)\n- Use a hydrating lip treatment at night (Aquaphor, Laneige lip mask)\n- Exfoliate lips 1-2x per week with a sugar scrub or soft toothbrush\n- Stay hydrated — dehydration shows on lips first\n\n**For fuller-looking lips:**\n- Peppermint lip products cause temporary plumping through increased blood flow\n- Hyaluronic acid lip products draw moisture in\n- Good hydration naturally makes lips fuller\n- Lip exercises: Purse lips, hold 5 seconds, repeat 20 times\n\n**What to avoid:**\n- Licking lips (saliva evaporates and dries them out further)\n- Picking at dry skin\n- Matte lip products that dry out lips\n- Flavored/scented lip balms that encourage licking\n\nHealthy, hydrated lips are a subtle but real attractiveness boost.",
  },
  {
    keywords: ['analysis', 'result', 'score', 'rating', 'scan', 'face scan'],
    response: "Here's how to interpret and act on your Androgenic analysis results:\n\n**Understanding your scores:**\n- 80-100: Exceptional — maintain what you have\n- 60-79: Above average — targeted improvements can push you higher\n- 40-59: Average — significant room for improvement with consistent effort\n- Below 40: Focus on fundamentals (skin, body fat, posture) for fastest gains\n\n**Prioritize your lowest scores:**\n- Your weakest categories are where you'll see the most dramatic improvement\n- A 10-point improvement in a weak area is more noticeable than a 10-point gain in a strong area\n\n**Tracking progress:**\n- Take photos in the same lighting, angle, and distance every 2-4 weeks\n- Compare scores over time in your History tab\n- Focus on trends, not day-to-day fluctuations\n\n**Important context:**\n- Lighting and camera angles significantly impact scores\n- Front camera distorts facial proportions (use rear camera or mirror for more accurate self-assessment)\n- Real attractiveness includes expression, energy, style, and confidence — things a scan can't fully capture\n\nUse your results as a roadmap, not a judgment. Every score can improve with the right approach!",
  },
  {
    keywords: ['routine', 'daily', 'schedule', 'morning', 'night', 'plan', 'habit'],
    response: "Here's the ultimate daily looksmaxxing routine:\n\n**Morning (20 min):**\n1. Splash face with cold water or gentle cleanser\n2. Vitamin C serum\n3. Moisturizer with niacinamide\n4. SPF 30+ sunscreen\n5. Style hair\n6. 3 sets of 15 chin tucks\n7. Check posture before leaving\n\n**Throughout the day:**\n- Mew constantly (tongue on roof of mouth)\n- Drink 3+ liters of water\n- Maintain good posture\n- Chew mastic gum 30-45 min\n- Eat clean: high protein, vegetables, low sugar\n\n**Evening (15 min):**\n1. Double cleanse (oil cleanser then regular cleanser)\n2. Retinol (start 2x per week, build up)\n3. Moisturizer\n4. Lip treatment\n5. Eye cream if needed\n6. 10 min of jaw/neck exercises\n\n**Before bed:**\n- No screens 30 min before sleep\n- Sleep on your back\n- Mouth tape for nasal breathing (if comfortable)\n- 7-9 hours of quality sleep\n\nThis entire routine takes less than 45 min per day and will produce visible results within 4-8 weeks.",
  },
];

const FALLBACK_RESPONSE = "That's a great question! While I don't have a specific answer for that topic, here are some general tips that help almost everyone improve their facial aesthetics:\n\n1. **Get lean** — Lower body fat reveals your natural bone structure\n2. **Skincare basics** — Cleanser, moisturizer, and SPF every single day\n3. **Mewing** — Proper tongue posture on the palate 24/7\n4. **Sleep** — 7-9 hours on your back\n5. **Hydration** — 3+ liters of water daily\n\nFeel free to ask me about any of these topics specifically and I'll give you a detailed breakdown!";

const getAIResponse = (userMessage) => {
  const lower = userMessage.toLowerCase();
  for (const entry of AI_RESPONSES) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.response;
      }
    }
  }
  return FALLBACK_RESPONSE;
};

// ─── Components ─────────────────────────────────────────────────────

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const dotStyle = (dot) => ({
    opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={styles.typingRow}>
      <View style={styles.aiAvatarSmall}>
        <Ionicons name="sparkles" size={10} color="#fff" />
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, dotStyle(dot1)]} />
        <Animated.View style={[styles.typingDot, dotStyle(dot2)]} />
        <Animated.View style={[styles.typingDot, dotStyle(dot3)]} />
      </View>
    </View>
  );
};

const ChatBubble = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(item.sender === 'ai' ? -20 : 20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const isAI = item.sender === 'ai';
  const time = item.timestamp
    ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isAI ? styles.messageRowAI : styles.messageRowUser,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {isAI && (
        <View style={styles.aiAvatarSmall}>
          <Ionicons name="sparkles" size={10} color="#fff" />
        </View>
      )}
      <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
        <Text style={[styles.bubbleText, isAI ? styles.bubbleTextAI : styles.bubbleTextUser]}>
          {item.text}
        </Text>
        {time ? <Text style={styles.timestamp}>{time}</Text> : null}
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setMessages(parsed);
          const userMsgCount = parsed.filter((m) => m.sender === 'user').length;
          setSessionCount(userMsgCount);
          if (userMsgCount > 0) setShowSuggestions(false);
        } else {
          const welcome = { ...WELCOME_MESSAGE, timestamp: Date.now() };
          setMessages([welcome]);
        }
      } catch {
        const welcome = { ...WELCOME_MESSAGE, timestamp: Date.now() };
        setMessages([welcome]);
      }
    };
    loadHistory();
  }, []);

  // Persist messages
  const persistMessages = useCallback(async (msgs) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
    } catch {}
  }, []);

  const addAIResponse = useCallback((userText, currentMessages) => {
    setIsTyping(true);
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const responseText = getAIResponse(userText);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        text: responseText,
        sender: 'ai',
        timestamp: Date.now(),
      };
      const updated = [...currentMessages, aiMsg];
      setMessages(updated);
      persistMessages(updated);
      setIsTyping(false);
    }, delay);
  }, [persistMessages]);

  const handleSend = useCallback((text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed) return;

    // Check message limit for free users
    if (!isPro() && sessionCount >= FREE_MESSAGE_LIMIT) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      text: trimmed,
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    persistMessages(updatedMessages);
    setInputText('');
    setShowSuggestions(false);
    setSessionCount((prev) => prev + 1);

    addAIResponse(trimmed, updatedMessages);
  }, [inputText, messages, sessionCount, addAIResponse, persistMessages]);

  const handleSuggestion = useCallback((suggestion) => {
    handleSend(suggestion);
  }, [handleSend]);

  const limitReached = !isPro() && sessionCount >= FREE_MESSAGE_LIMIT;

  const renderItem = useCallback(({ item, index }) => (
    <ChatBubble item={item} index={index} />
  ), []);

  const renderFooter = useCallback(() => {
    const components = [];

    if (showSuggestions && messages.length <= 1) {
      components.push(
        <View key="suggestions" style={styles.suggestionsContainer}>
          {QUICK_SUGGESTIONS.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionChip}
              onPress={() => handleSuggestion(s)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (isTyping) {
      components.push(<TypingIndicator key="typing" />);
    }

    return components.length > 0 ? <View>{components}</View> : null;
  }, [showSuggestions, messages.length, isTyping, handleSuggestion]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Advisor</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {!isPro() && (
            <View style={styles.msgCounter}>
              <Text style={styles.msgCounterText}>
                {Math.max(0, FREE_MESSAGE_LIMIT - sessionCount)}/{FREE_MESSAGE_LIMIT}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chat */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Upsell card when limit reached */}
        {limitReached && (
          <View style={styles.upsellCard}>
            <View style={styles.upsellIconRow}>
              <Ionicons name="lock-closed" size={20} color={COLORS.accent} />
              <Text style={styles.upsellTitle}>Message Limit Reached</Text>
            </View>
            <Text style={styles.upsellText}>
              Unlock unlimited AI advice with PRO. Get personalized guidance on mewing, skincare, jawline, and more.
            </Text>
            <TouchableOpacity
              style={styles.upsellButton}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <Text style={styles.upsellButtonText}>Unlock Unlimited AI Advice</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={limitReached ? 'Upgrade to PRO to continue...' : 'Ask me anything...'}
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!limitReached}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || limitReached) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || limitReached}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !limitReached ? '#fff' : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.scoreHigh,
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  msgCounter: {
    backgroundColor: 'rgba(0,102,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  msgCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentLight,
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
    marginRight: 44,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
    marginLeft: 44,
  },
  aiAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: width * 0.72,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAI: {
    backgroundColor: COLORS.bgCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleUser: {
    backgroundColor: '#0066ff',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextAI: {
    color: COLORS.textPrimary,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.accentLight,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#000',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.bgCard,
  },
  upsellCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  upsellIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  upsellTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  upsellText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  upsellButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upsellButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
