import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Dimensions, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withDelay, FadeInLeft, FadeInRight, FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/theme';
import { isPro } from '../utils/pro';
import GlassBackground from '../components/GlassBackground';

const { width } = Dimensions.get('window');
const CHAT_STORAGE_KEY = 'androgenic_chat_history';
const REACTIONS_STORAGE_KEY = 'androgenic_chat_reactions';
const FREE_MESSAGE_LIMIT = 10;

const AI_NAME = 'ANDRO';

const WELCOME_MESSAGE = {
  id: 'welcome',
  text: `What's up! I'm ${AI_NAME}, your personal face analysis advisor. I know everything about looksmaxxing, skincare science, facial aesthetics, and self-improvement. Think of me as that one friend who's obsessed with this stuff and actually knows what he's talking about.\n\nAsk me anything — mewing technique, skincare routines, jawline exercises, facial ratios, procedures, lifestyle optimization... I've got you covered. What are we working on today?`,
  sender: 'ai',
  timestamp: null,
};

// ─── Categorized Quick Suggestions ─────────────────────────────────
const SUGGESTION_CATEGORIES = [
  {
    id: 'popular',
    label: 'Popular',
    icon: 'flame-outline',
    suggestions: [
      'How do I start looksmaxxing?',
      'Best mewing technique',
      'How to get a sharp jawline',
      'Complete skincare routine',
    ],
  },
  {
    id: 'skin',
    label: 'Skin',
    icon: 'water-outline',
    suggestions: [
      'How to use retinol properly',
      'Best sunscreen for men',
      'How to fade dark circles',
      'Acne treatment routine',
    ],
  },
  {
    id: 'face',
    label: 'Face',
    icon: 'person-outline',
    suggestions: [
      'How to fix facial asymmetry',
      'What is canthal tilt?',
      'How to get hollow cheeks',
      'Improve my facial ratios',
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    icon: 'cut-outline',
    suggestions: [
      'Best hairstyle for my face',
      'How to prevent hair loss',
      'Grow a thicker beard',
      'Eyebrow grooming tips',
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    icon: 'fitness-outline',
    suggestions: [
      'Sleep optimization for looks',
      'Best supplements for skin',
      'How exercise changes your face',
      'Nutrition for facial aesthetics',
    ],
  },
];

// ─── AI Knowledge Base (50+ topics with response variations) ────────
const AI_RESPONSES = [
  {
    keywords: ['mewing', 'tongue posture', 'tongue position', 'mew', 'tongue on roof'],
    followUps: ['How long until I see mewing results?', 'Can mewing fix my recessed chin?', 'Best mewing exercises for beginners'],
    responses: [
      `Alright let's talk mewing — this is foundational stuff and honestly one of the best things you can do for free.\n\nHere's the proper technique that most people get wrong:\n\n1. Your ENTIRE tongue needs to be flat against the palate — not just the tip. The back third is actually the most important part and provides the most force on the maxilla.\n2. Lips sealed, teeth lightly touching or slightly apart (never clenching).\n3. Breathe exclusively through your nose. If you can't, you likely have a deviated septum or swollen turbinates — see an ENT.\n4. The suction hold method works best: swallow and notice how your tongue naturally suctions to the roof. Maintain that position.\n\nBiggest mistakes I see: only pressing the tongue tip (does almost nothing), pressing too hard and getting headaches, and forgetting to mew during sleep. Mouth tape at night is a game-changer for maintaining posture while unconscious.\n\nTimeline: Soft tissue changes (sharper jawline appearance) in 1-3 months. Actual bone remodeling takes 6-24 months and is significantly more effective under age 25 while bones are still somewhat malleable. But even older guys report improvements — it's just slower.`,
      `Mewing is basically the foundation of natural facial development — let me break down exactly how to do it right because most YouTube tutorials oversimplify it.\n\nThe key insight most people miss: it's not about pushing your tongue UP, it's about maintaining proper oral posture 24/7. Your tongue should rest naturally against the entire palate with light pressure. Think of it like good body posture — it should become your default, not an exercise.\n\nStep-by-step:\n- Swallow. Notice where your tongue goes at the peak of the swallow — that's your target position\n- The posterior third of your tongue (the part near your throat) should press against the soft palate. This is the hardest part and where most of the structural force comes from\n- Your lips should be sealed without effort. If you have to force them closed, you need to practice more\n- Teeth in light contact or 1-2mm apart. Never clench.\n\nPro tips from my experience: Start with 30-minute conscious practice sessions and gradually extend. Use a sticky note on your computer/phone as a reminder. The McKenzie chin tuck helps find the right tongue position. And seriously — mouth tape at night. Game. Changer.\n\nResults vary massively by age and genetics, but everyone benefits from proper oral posture regardless of bone changes.`,
    ],
  },
  {
    keywords: ['jawline', 'jaw', 'chin', 'mandible', 'jaw define', 'jaw exercise', 'sharp jaw', 'chiseled'],
    followUps: ['What gum is best for jawline?', 'How does body fat affect jawline?', 'Can I get a jawline at any age?'],
    responses: [
      `The jawline is king when it comes to facial aesthetics — here's your complete protocol to maximize it:\n\n**Masseter Development (width):**\nChew mastic gum or Falim gum for 30-45 minutes daily, alternating sides every 5 minutes. This directly hypertrophies your masseter muscles, creating a wider, more angular lower face. Start with softer gum and progress to harder varieties. You'll see visible growth in 4-8 weeks — it's one of the fastest visual changes you can make.\n\n**Jaw-Neck Angle (definition):**\nChin tucks are your best friend. Pull your chin straight back creating a double chin — hold 5 seconds, 3 sets of 15 reps daily. This strengthens the deep cervical flexors and dramatically improves the angle between your jaw and neck. Neck curls (lie face up, curl chin to chest) tighten the submental area — that soft tissue under your chin.\n\n**Body Fat (the biggest factor honestly):**\nYou can have an amazing jaw structure hidden under face fat. Getting to 12-15% body fat is where most guys see their jawline truly emerge. The face is one of the first places you notice fat loss, so even losing 5-10 lbs can be transformative.\n\n**Posture:**\nForward head posture literally pushes your jaw backward. Fix your posture and your jaw naturally comes forward — free jawline gains.\n\nConsistency over intensity. Do these daily and you'll see real changes within 2-3 months.`,
      `Let's get that jaw looking sharp. Here's what actually works based on anatomy and real results:\n\nFirst, understand that jawline appearance comes from three things: bone structure (genetic but modifiable when young), muscle mass (your masseters), and body fat level. You can improve all three.\n\n**For masseter growth:**\nMastic gum is the gold standard — it's 10x harder than regular gum and provides real resistance training for your jaw muscles. Chew 30-45 min daily. Falim gum is a cheaper alternative that's almost as good. You'll literally see your jaw get wider from the side view within 6-8 weeks.\n\n**For definition:**\n- Chin tucks: 3x20 daily. This one exercise does more for jawline appearance than most people realize because it fixes the jaw-neck angle\n- Neck curls and extensions: Build the sternocleidomastoid and posterior neck muscles. A thicker, well-defined neck actually makes your jaw look more prominent by contrast\n- Submental exercises: Press your tongue hard against the roof of your mouth while tilting your head back. Hold 10 sec, 15 reps\n\n**The shortcuts:**\n- Drop body fat to 12-15%. This alone can take you from "no jawline" to "sharp jaw" if you have decent bone structure underneath\n- Sleep on your back to prevent jaw compression and asymmetry\n- Mew 24/7 for gradual bone remodeling of the maxilla and mandible\n\nMost guys already have a good jaw hiding under a layer of face fat and poor posture. Fix those two things first before anything else.`,
    ],
  },
  {
    keywords: ['skincare', 'skin care', 'skin routine', 'clear skin', 'routine for skin'],
    followUps: ['What retinol should I start with?', 'Best products for oily skin?', 'How to layer skincare products'],
    responses: [
      `Here's the no-BS skincare routine that actually works for men looking to maximize facial aesthetics. I'm keeping it simple because consistency beats complexity every time:\n\n**Morning Routine (3-4 min):**\n1. Gentle cleanser — CeraVe Hydrating or La Roche-Posay Toleriane. Don't use that 10-in-1 body wash on your face bro.\n2. Vitamin C serum (15-20% L-ascorbic acid) — brightens, protects from UV damage, boosts collagen. The Ordinary or Timeless are solid.\n3. Lightweight moisturizer — CeraVe PM or Neutrogena Hydro Boost. If it has niacinamide, even better.\n4. SPF 30-50 sunscreen — THIS IS NON-NEGOTIABLE. UV is responsible for 80-90% of visible skin aging. Skip this and everything else is pointless.\n\n**Evening Routine (3-4 min):**\n1. Double cleanse if you wore sunscreen: oil-based cleanser first (DHC or Banila Co), then your regular cleanser\n2. Retinol/Tretinoin — the gold standard for anti-aging, texture, acne, everything. Start 2x/week, build to nightly over 6-8 weeks\n3. Moisturizer — slightly heavier at night is fine\n\n**Weekly:**\n- Chemical exfoliant 1-2x: BHA (salicylic acid 2%) for oily/acne-prone, AHA (glycolic acid) for texture and glow\n\n**Lifestyle factors that matter as much as products:**\n- 3+ liters water daily\n- Change pillowcase every 3-4 days\n- Don't touch your face\n- Cut dairy and refined sugar if acne-prone\n- 7-9 hours sleep (skin repairs overnight)\n\nGive any new routine 6-8 weeks before judging. Skin cell turnover takes about 28 days.`,
      `Skincare is honestly one of the highest-ROI things for your appearance. Clear, healthy skin makes you look younger, healthier, and more attractive across the board. Let me give you the framework.\n\n**The non-negotiable basics (do these or nothing else matters):**\n1. CLEANSE — morning and evening. Use something gentle (pH 5.5). If your face feels tight after washing, your cleanser is too harsh.\n2. MOISTURIZE — every single time after cleansing. Even if you have oily skin. Dehydrated oily skin overproduces sebum.\n3. SPF — every morning. Rain or shine. Winter or summer. I cannot stress this enough.\n\n**The upgrades that deliver real results:**\n- Vitamin C serum (AM): antioxidant protection + brightening. Makes your skin literally glow.\n- Retinol/Tretinoin (PM): accelerates cell turnover, boosts collagen, fights acne AND aging simultaneously. The closest thing to a miracle product.\n- Niacinamide (AM or PM): strengthens skin barrier, minimizes pores, reduces redness.\n\n**Common mistakes men make:**\n- Using harsh products (bar soap, alcohol-based things) that destroy the moisture barrier\n- Skipping sunscreen because "I'm not outside much" (UVA goes through windows)\n- Expecting overnight results and giving up after 2 weeks\n- Over-exfoliating (once or twice a week is enough)\n\nStart with cleanser + moisturizer + SPF for 2 weeks. Then add ONE active at a time, every 2-3 weeks. This prevents irritation and lets you identify what works for YOUR skin.\n\nBudget doesn't matter much — CeraVe and The Ordinary have you covered for under $40 total.`,
    ],
  },
  {
    keywords: ['acne', 'pimple', 'breakout', 'zit', 'cystic', 'hormonal acne'],
    followUps: ['Should I try accutane?', 'Best diet changes for acne?', 'How to treat acne scars'],
    responses: [
      `Acne is a battle I know well — let me give you the full arsenal:\n\n**Understanding your acne type matters:**\n- Whiteheads/blackheads (comedonal): Your pores are clogged. BHA (salicylic acid) is your weapon.\n- Red inflammatory bumps: Bacterial or inflammatory. Benzoyl peroxide + niacinamide.\n- Deep cystic bumps: Hormonal or severe. May need prescription treatment (tretinoin or isotretinoin).\n\n**The proven treatment protocol:**\n1. Gentle cleanser 2x daily (CeraVe, Vanicream). Harsh cleansers make acne WORSE by damaging your barrier.\n2. Benzoyl peroxide 2.5% (mornings) — kills acne bacteria. Higher concentrations aren't more effective, just more irritating.\n3. Salicylic acid 2% (few times a week) — penetrates oil and unclogs pores from within.\n4. Tretinoin 0.025% (evenings, prescription) — prevents new breakouts by accelerating turnover. The long-term solution.\n5. Non-comedogenic moisturizer — always. Damaged barriers cause more breakouts.\n6. SPF — especially on tretinoin/BP since they increase sun sensitivity.\n\n**Lifestyle changes that actually help:**\n- Cut dairy (especially milk and whey protein — strong correlation with acne)\n- Reduce refined sugar and high-glycemic foods\n- Change pillowcase every 2-3 days\n- Don't touch your face during the day\n- Manage stress (cortisol triggers sebum production)\n- Zinc supplement 30mg daily (clinically proven to reduce acne)\n\n**When to see a dermatologist:**\nIf you've tried OTC treatments for 3 months with no improvement, or if you have cystic/scarring acne. Isotretinoin (Accutane) is a nuclear option that works for 85%+ of severe cases — worth discussing with a derm.\n\nPatience is crucial. Most treatments take 6-12 weeks to show full results. It often gets slightly worse before it gets better (the purge).`,
    ],
  },
  {
    keywords: ['asymmetry', 'asymmetric', 'uneven', 'one side', 'lopsided', 'symmetry', 'symmetric'],
    followUps: ['Does sleeping position cause asymmetry?', 'Exercises for facial symmetry', 'Is my asymmetry noticeable to others?'],
    responses: [
      `Let's talk asymmetry — first thing I want you to know is that literally NOBODY has a perfectly symmetric face. Studies show that even the most attractive people have measurable asymmetry. So take a breath.\n\nThat said, here's how to minimize it:\n\n**Habit fixes (these are huge):**\n- Sleep on your back. This is probably the #1 thing. Side sleeping compresses one side of your face for 6-8 hours every night. Over years, this creates real structural differences.\n- Chew on BOTH sides equally. Most people have a dominant chewing side, which overdevelops that masseter. Consciously alternate.\n- Stop resting your face on your hand. Seriously — if you do this at your desk, it's pushing your jaw to one side.\n- Fix any head tilt. If you habitually tilt your head, the muscles on each side develop differently.\n\n**Active improvements:**\n- Chew mastic gum on your weaker/smaller side 2:1 ratio (e.g., 10 min left, 5 min right) until they balance\n- Mew with conscious even pressure on both sides of the palate\n- Facial massage: Deep tissue massage on the tighter, more developed side to release tension\n- Neck stretches and cervical corrections — asymmetric neck muscles tilt the jaw\n\n**Reality check:**\n- Some asymmetry is bone-based (structural) and won't change without surgery. Focus on soft tissue differences you CAN fix.\n- Front-facing phone cameras create significant lens distortion that exaggerates asymmetry. Your face looks more symmetric in the mirror and to other people than in selfies.\n- Nobody studies your face as closely as you do. What you obsess over, others don't notice.\n\nTrack progress with photos taken at arm's length with the rear camera. Give habit changes 3-6 months to show structural differences.`,
    ],
  },
  {
    keywords: ['hair', 'hairstyle', 'haircut', 'hair style', 'face shape hair'],
    followUps: ['Best products for mens hair?', 'How to find my face shape', 'Should I grow out my hair?'],
    responses: [
      `Hair is easily one of the biggest levers for changing how you look. The right hairstyle can literally change your perceived face shape and overall rating by 1-2 points. Let me break this down:\n\n**Best styles by face shape:**\n- Oval face: Lucky you — almost everything works. Try textured crops, side parts, or medium-length styles with movement.\n- Round face: You need to add height and reduce width. Pompadour, quiff, high fade with longer top, or textured spikes. Avoid full fringes.\n- Square face: You've got the ideal masculine structure. Short sides + medium top. Classic taper, crew cut, or textured crop all look great. Don't hide the jaw.\n- Long/oblong: Avoid adding height on top. Side parts, fringes, and shorter styles add width. French crop is excellent.\n- Diamond: Textured fringe to reduce forehead width, medium length on sides.\n\n**Hair health optimization:**\n- Shampoo only 2-3x per week with a sulfate-free formula. Daily shampooing strips natural oils.\n- Condition every wash. Leave-in conditioner if you have dry or wavy hair.\n- Use a heat protectant before blow-drying or using hot tools.\n- Sea salt spray adds texture and volume without looking like you tried hard.\n- Biotin (5000mcg daily) and zinc support hair growth from within.\n- Scalp massage 5 min daily — increases blood flow to follicles.\n\n**Styling tips that elevate your look:**\n- Invest in a blow dryer. Blow-drying with direction gives 10x more volume and shape than air drying.\n- Find a good barber and go every 3-4 weeks. Consistency matters.\n- Use matte products for a natural look, high-shine for more formal styles.\n- Your hairline shape matters — ask your barber to clean it up each visit.`,
    ],
  },
  {
    keywords: ['hair loss', 'balding', 'receding', 'thinning', 'minoxidil', 'finasteride', 'hairline'],
    followUps: ['Is finasteride safe?', 'When should I start treatment?', 'Microneedling for hair loss?'],
    responses: [
      `Hair loss is something that affects 50%+ of men by age 30, so you're not alone. The good news: if you catch it early, you can keep most of your hair. Here's the real talk:\n\n**The Big 3 (proven treatments):**\n1. Minoxidil 5% (topical, twice daily): Stimulates hair growth by increasing blood flow to follicles. Available OTC. Results in 3-6 months. Must continue indefinitely or gains reverse.\n2. Finasteride 1mg (oral, daily, prescription): Blocks DHT — the hormone that causes male pattern baldness. Reduces DHT by ~70%. Most effective treatment available. Side effects are rare (1-2%) and reversible.\n3. Microneedling (1.5mm derma pen on scalp, weekly): Creates controlled micro-injuries that trigger growth factors. Studies show it DOUBLES minoxidil's effectiveness when combined.\n\n**Additional tools:**\n- Ketoconazole shampoo (Nizoral) 2-3x/week: Anti-fungal that also has mild anti-androgen effects on the scalp\n- Low-level laser therapy (LLLT caps): Some evidence, convenient but expensive\n- PRP injections: Platelet-rich plasma injections every 3-6 months. Moderate evidence.\n\n**The critical rule: ACT EARLY.**\nIt is dramatically easier to maintain existing hair than to regrow lost hair. If you notice thinning or recession, start treatment NOW. Waiting even a year means losing follicles that may never come back.\n\n**When to shave it:**\nIf you've tried treatments for 1-2 years with minimal results and loss is advanced, a clean shave with a strong jaw looks better than clinging to thin hair. Build your neck and traps to compensate, grow a beard if possible, and own it.\n\n**Supplements that support hair:** Biotin (5000mcg), Zinc (30mg), Vitamin D3 (5000 IU), Iron (if deficient), Saw Palmetto (mild natural DHT blocker).`,
    ],
  },
  {
    keywords: ['eye', 'eyes', 'eye area', 'dark circle', 'under eye', 'puffy', 'eye bag'],
    followUps: ['Best eye cream for dark circles?', 'How to look more awake', 'Do eye exercises work?'],
    responses: [
      `The eye area is arguably the most important facial feature — it's the first place people look and communicates health, energy, and attractiveness. Here's how to optimize it:\n\n**Dark circles — understanding the causes:**\n- Genetic: Thin under-eye skin revealing blood vessels underneath. Harder to fix but manageable.\n- Sleep deprivation: Dilates blood vessels, making them more visible. Fix your sleep.\n- Allergies: Histamine response causes under-eye swelling and darkening. Take antihistamines.\n- Dehydration: Makes skin thinner and darker. Drink more water.\n- Iron/B12 deficiency: Get bloodwork done if circles are severe.\n\n**Treatment protocol:**\n- Sleep 7-9 hours consistently on your back (fluid pools under eyes when face-down)\n- Caffeine eye serum (The Ordinary Caffeine Solution 5%): Constricts blood vessels, reduces appearance instantly\n- Vitamin C eye cream: Brightens pigmentation over time\n- Vitamin K cream: Specifically targets the blue/purple discoloration\n- Cold compress or chilled spoons for 5 min each morning: Instant de-puffing\n- Reduce sodium and alcohol — both cause significant periorbital water retention\n\n**Reducing puffiness:**\n- Sleep slightly elevated (add a second pillow to prevent fluid accumulation)\n- Lymphatic drainage massage: Use ring finger, gently press from inner corner to temple. 30 seconds each morning.\n- Cold green tea bags (the caffeine + cold combo works fast)\n- Consistent hydration — 3+ liters daily\n\n**Long-term eye area enhancement:**\n- Retinol eye cream (low concentration 0.025%) for fine lines and skin quality\n- Adequate sleep is honestly 70% of the battle\n- Good posture and forward head correction changes how light hits your orbital area\n- Well-groomed eyebrows frame the eyes and make them look better proportionally\n\nDon't underestimate the impact of simply being well-rested and hydrated. That alone can make your eye area look dramatically better.`,
    ],
  },
  {
    keywords: ['canthal tilt', 'hunter eyes', 'positive tilt', 'eye shape', 'eye angle'],
    followUps: ['Can I change my canthal tilt?', 'What makes eyes attractive?', 'How to get hunter eyes'],
    responses: [
      `Canthal tilt and hunter eyes — let me explain what these mean and what's actually achievable:\n\n**What is canthal tilt?**\nIt's the angle between your inner eye corner (medial canthus) and outer eye corner (lateral canthus). Positive canthal tilt means the outer corner is higher than the inner corner — this is considered the most attractive eye shape and gives that "hunter eyes" predatory look.\n\n**What are hunter eyes?**\nDeep-set eyes with a positive canthal tilt, minimal upper eyelid exposure, hooded brow, and compact eye area. Think young Alain Delon, Sean O'Pry, or young Brad Pitt. The opposite — round, protruding, droopy eyes — are sometimes called "prey eyes."\n\n**Can you change it? Honestly:**\n- Canthal tilt is primarily determined by bone structure (orbital rim shape). You cannot significantly change bone with exercises.\n- However, you CAN improve the appearance through:\n  - Reducing periorbital fat (lean body fat 12-15%) to deepen eye sockets\n  - Building the brow ridge appearance through proper mewing and forward growth\n  - Squinting slightly in photos (the "squintmaxx" — models do this constantly)\n  - Reducing upper eyelid puffiness through less sodium and better sleep\n  - Losing face fat makes eyes appear deeper-set\n\n**What actually makes eyes attractive (more than tilt):**\n- Limbal ring darkness and contrast (the dark ring around your iris) — enhanced by health and youth\n- Eye color contrast with skin tone\n- Minimal upper eyelid exposure\n- Interpupillary distance relative to face width\n- Eyebrow position and shape (slightly overhanging the orbital rim)\n\n**Realistic approach:**\nDon't obsess over canthal tilt degrees. Focus on reducing puffiness, getting lean for deeper-set appearance, grooming your brows well, and getting adequate sleep for brighter, whiter sclera. These changes are achievable and make a real difference.`,
    ],
  },
  {
    keywords: ['cheekbone', 'cheek', 'hollow cheek', 'zygomatic', 'cheek bone'],
    followUps: ['How low should my body fat be for hollow cheeks?', 'Mewing for cheekbone projection', 'Buccal fat removal — worth it?'],
    responses: [
      `Cheekbones and hollow cheeks are elite-tier facial aesthetics. Here's the honest breakdown on how to maximize yours:\n\n**The hierarchy of what matters (most to least):**\n\n1. **Body fat percentage** — This is 70% of the battle. Most men have decent cheekbone structure hidden under facial fat. Getting to 12-15% body fat is where hollow cheeks start appearing. At 10-12% they become very prominent. You literally cannot have visible hollow cheeks above 18-20% body fat no matter your bone structure.\n\n2. **Mewing (long-term)** — Proper tongue posture pushes the maxilla upward and forward over time, which increases cheekbone projection. The zygomatic bones connect to the maxilla, so maxillary advancement = better cheekbones. This takes 6-24 months minimum.\n\n3. **Masseter development** — Building wider masseters through gum chewing creates MORE contrast with the cheekbone area. A wider jaw makes the hollow cheek area between jaw and cheekbone more visible. It's counterintuitive but works.\n\n4. **Reducing facial bloat** — Even temporary measures help:\n   - Cut sodium below 2000mg daily\n   - Eliminate alcohol (causes severe face puffiness)\n   - Drink MORE water (reduces water retention paradoxically)\n   - Reduce refined carbs that hold water\n   - Get consistent sleep (cortisol from poor sleep causes face bloat)\n\n**Facial exercises (supplementary):**\n- Fish face holds: Suck in cheeks hard, hold 10 sec, 15 reps\n- Tongue-in-cheek pushes: Push tongue against inner cheek, 15 per side\n- Deliberate "model face" practice: Slightly suck in cheeks while keeping lips relaxed\n\n**On buccal fat removal:**\nThis is a procedure that removes the fat pads in your cheeks. It CAN create hollow cheeks but is irreversible and can age you prematurely if you're already lean. Most people should exhaust natural options first. Your face also naturally loses buccal fat with age, so removing it at 20 might make you look gaunt at 40.\n\nStart with getting lean. Seriously — that alone transforms cheekbone appearance more than anything else.`,
    ],
  },
  {
    keywords: ['midface', 'midface ratio', 'midface length'],
    followUps: ['What is the ideal midface ratio?', 'Can mewing shorten the midface?', 'How to assess my midface'],
    responses: [
      `The midface ratio is one of those blackpill-adjacent metrics that gets overblown online, but understanding it IS useful for knowing your face's aesthetics. Let me explain:\n\n**What is the midface ratio?**\nIt's the ratio of midface length (distance from the center of your pupils to the middle of your upper lip) divided by midface width (interpupillary distance — the distance between the centers of your pupils). A shorter midface relative to width = more compact, youthful, attractive appearance.\n\n**Ideal ratios:**\n- Below 1.0: Compact midface — considered very attractive. Think Sean O'Pry, young Leonardo DiCaprio\n- 1.0-1.05: Average — still looks good\n- Above 1.05: Longer midface — can appear less compact but many attractive people have this\n\n**Can you actually change it?**\nHonestly, bone structure determines this. But you can INFLUENCE the appearance:\n- Mewing can theoretically improve this by moving the maxilla up and forward, reducing perceived midface length\n- Lower body fat makes the midface appear more compact due to tighter skin\n- Beard/stubble on the lower face can create the illusion of a shorter midface by adding visual weight below\n- Hairstyle: Adding volume on top or having bangs can balance a longer midface\n- Eyebrow position: Slightly lower-set brows reduce perceived midface height\n\n**My honest take:**\nDon't obsess over this measurement. It's ONE factor among many, and plenty of objectively attractive men have longer midfaces. Focus on things you can actually change — skin quality, body fat, jaw development, hair, style. These impact your overall look way more than a 0.05 difference in midface ratio.\n\nIf someone online tells you your midface ratio means you're doomed, they're full of it. Attractiveness is holistic.`,
    ],
  },
  {
    keywords: ['fwhr', 'facial width', 'face width', 'bizygomatic', 'facial width to height'],
    followUps: ['What is ideal FWHR?', 'How to increase facial width', 'Does FWHR matter for attractiveness?'],
    responses: [
      `FWHR (Facial Width-to-Height Ratio) is a metric that measures how wide your face is relative to its height. It's gotten popular in the looksmaxxing community, so let me break it down:\n\n**What is FWHR?**\nMeasured as bizygomatic width (widest point of your cheekbones) divided by upper face height (distance from upper lip to brow). Higher = wider face relative to height.\n\n**What's considered attractive:**\n- 1.80-2.10: Wide face — associated with masculinity, dominance, and perceived attractiveness in men\n- 1.60-1.80: Average range\n- Below 1.60: Narrower face — can still look great depending on other features\n\n**Research shows that higher FWHR in men is associated with:**\n- Perceived dominance and testosterone levels\n- Higher attractiveness ratings from women (moderate levels)\n- More "masculine" appearance overall\n\n**Can you improve it?**\n- Masseter development (mastic gum chewing) adds width to the lower face, which increases perceived facial width\n- Mewing: Upward and forward maxillary movement can widen the midface over time by expanding the palate\n- Lower body fat: Reduces vertical face height slightly (less fat padding on cheeks) which improves the ratio\n- Cheekbone-area muscle development through mewing and chewing\n\n**Important context:**\nFWHR is ONE measurement among hundreds that contribute to attractiveness. Chris Hemsworth and Henry Cavill have different FWHRs but are both considered top-tier. Don't reduce your self-worth to a single number.\n\nFocus on what you can control: masseter width, body fat level, skin quality, and overall facial harmony. A face that works well together always looks better than hitting one arbitrary metric.`,
    ],
  },
  {
    keywords: ['golden ratio', 'facial ratio', 'phi', 'proportion', 'facial proportion'],
    followUps: ['How is the golden ratio measured on faces?', 'Which celebrities match the golden ratio?', 'How to improve my facial proportions'],
    responses: [
      `The golden ratio (phi = 1.618) is probably the most famous attractiveness metric. Here's what's real and what's overhyped:\n\n**How it applies to faces:**\nSeveral facial proportions that are considered attractive approximate phi:\n- Face length / face width should be close to 1.618\n- Distance between eyes / nose width\n- Nose length / distance from nose to chin\n- Width of mouth / width of nose\n- The "thirds" rule: hairline to brow, brow to nose tip, nose to chin should be roughly equal\n\n**The reality:**\n- NO face perfectly matches the golden ratio. Even the most attractive celebrities only approximate it.\n- Facial attractiveness is more about HARMONY between features than hitting exact numbers\n- Symmetry, skin quality, and averageness (being close to population average proportions) consistently predict attractiveness better than golden ratio adherence\n\n**What you can actually optimize:**\n- Vertical thirds: If your lower third (jaw area) is short, mewing and jawline exercises can help. If it's long, beard can balance.\n- Facial width: Masseter development adds width for more balanced proportions\n- Nose-to-chin distance: Achieving a well-projected chin through posture and mewing\n- Forehead proportion: Hairstyle can visually adjust your hairline-to-brow ratio\n\n**My take:**\nThe golden ratio is a useful reference point but don't lose sleep over exact measurements. Focus on the fundamentals: get lean, clear skin, good jaw development, proper posture. A healthy, fit face with good skin will always beat a "golden ratio" face with bad skin and extra fat.\n\nTake your measurements for awareness, then focus your energy on actionable improvements.`,
    ],
  },
  {
    keywords: ['gonial angle', 'jaw angle', 'ramus', 'mandible angle'],
    followUps: ['What is the ideal gonial angle?', 'Can mewing change the gonial angle?', 'How to measure my gonial angle'],
    responses: [
      `The gonial angle is the angle formed at the corner of your jaw where the ramus (vertical part) meets the body (horizontal part) of the mandible. It's a key metric for jaw aesthetics.\n\n**Ideal range:**\n- 115-125 degrees: Considered the most attractive for men. Creates a sharp, angular jaw corner.\n- Below 115: Very acute angle — extremely angular, almost "too sharp" (rare naturally)\n- 125-135: Average — still looks fine but less defined\n- Above 135: Steep/obtuse — creates a softer, less defined jaw corner. Common with mouth breathing or weak jaw development.\n\n**Why it matters:**\nA more acute (lower degree) gonial angle creates that sharp jaw corner you see on models and actors. It makes the jaw look more angular, masculine, and defined from both the front and side profile.\n\n**What influences it:**\n- Genetics: This is primarily genetic and established during jaw growth\n- Childhood breathing patterns: Mouth breathing leads to steeper (higher) gonial angles due to downward jaw growth\n- Mewing: Proper tongue posture during development promotes forward growth, which can create a more favorable gonial angle\n- Masseter muscle: Well-developed masseters can make the angle APPEAR more defined by adding muscle mass at the jaw corner\n\n**Can you change it as an adult?**\n- Bone remodeling is minimal after 25, but possible very slowly\n- Mewing may help slightly over years by encouraging forward mandibular positioning\n- Masseter development (gum chewing) makes the angle appear sharper by building muscle at the gonion\n- Losing body fat reveals the existing angle better\n- Jaw angle implants exist as a surgical option for those seeking dramatic change\n\n**Practical advice:**\nUnless you're considering surgery, focus on making the most of what you have: masseter development, low body fat, and good posture all make your existing gonial angle look better. Most guys who think they have a bad gonial angle actually just have fat or underdeveloped masseters hiding it.`,
    ],
  },
  {
    keywords: ['beard', 'facial hair', 'grow beard', 'patchy', 'stubble', 'beard growth'],
    followUps: ['How long does minoxidil beard take?', 'Best beard style for my face?', 'Beard care routine'],
    responses: [
      `Facial hair is one of the most powerful tools for transforming jaw and lower-face aesthetics. Here's the complete guide:\n\n**Growing a fuller beard (if you're patchy):**\n\nMinoxidil is the #1 proven method:\n- Apply 5% foam or liquid to beard area twice daily (clean-shaven or stubble length)\n- Results start showing at 2-3 months, significant gains at 6-12 months\n- The gains become PERMANENT after about 2 years of consistent use — the vellus hairs mature into terminal hairs\n- Pair with a 0.5mm derma roller 1-2x per week (NOT on the same day as minoxidil application) for enhanced results\n- Side effects: Some initial skin dryness, possible shedding phase. Moisturize well.\n\n**Optimizing what you have:**\n- Let it grow for at least 4-6 weeks before judging. Many patches fill in with length.\n- Use a beard trimmer to keep everything even — even coverage at 3-5mm looks better than patchy long growth\n- If you can't grow a full beard: strategic stubble (3-7 day growth) often looks better than trying for a full beard\n\n**Beard styles by face shape:**\n- Round face: Grow it longer on the chin, shorter on sides. Creates length and angular appearance.\n- Long face: Keep it fuller on the sides, shorter chin. Adds width.\n- Square face: Your jaw is already great. Light stubble or a short box beard accentuates it.\n- Oval face: Most styles work. Classic medium-length or Van Dyke are excellent choices.\n- Weak chin/jaw: A beard is your best friend. It can literally create the jaw definition you lack.\n\n**Beard maintenance:**\n- Wash with dedicated beard shampoo 2-3x per week (not head shampoo — different pH)\n- Beard oil daily for softness, itch prevention, and skin health\n- Brush/comb daily to train growth direction and distribute oils\n- Clean neckline is ESSENTIAL — draw a line from ear to ear, curving below the jaw. Everything below goes.\n- Trim cheek line to keep it sharp\n\nA well-maintained beard can genuinely add 1-2 points. But a scraggly, patchy, unkempt beard subtracts points. If you can't grow it well yet, clean-shaven with jaw exercises is better.`,
    ],
  },
  {
    keywords: ['eyebrow', 'brow', 'eyebrows', 'brow shape', 'unibrow', 'brow grooming'],
    followUps: ['How to shape eyebrows for men', 'Should men pluck eyebrows?', 'How to grow thicker eyebrows'],
    responses: [
      `Eyebrows are honestly one of the most underrated features for facial aesthetics. They frame your entire face and can make or break your eye area. Here's the guide:\n\n**Why they matter so much:**\n- They frame and define your eye area (the most important facial zone)\n- Well-groomed brows signal attention to detail and health\n- The position, shape, and thickness of brows affect perceived attractiveness, age, and masculinity\n- Small changes here are immediately visible and require zero downtime\n\n**How to groom (for men):**\n1. Remove unibrow area ONLY with tweezers or threading. Pluck individual hairs — never shave (creates shadow).\n2. Trim overly long hairs: Brush brows upward with a spoolie, trim any hairs extending above the natural top line with small scissors.\n3. Clean up stray hairs below the brow (between brow and eyelid) — just the obvious outliers.\n4. DO NOT over-pluck or shape them into thin arches. Masculine brows are thicker, straighter, and more natural-looking.\n5. The golden rule: Remove what shouldn't be there, don't try to create a new shape.\n\n**For thicker/fuller brows:**\n- Castor oil applied nightly (some evidence it promotes growth)\n- Minoxidil 5% works on eyebrows too — apply carefully with a Q-tip. Results in 2-4 months.\n- Biotin supplement (5000mcg)\n- Brow serum products (Revitabrow, GrandeBrow)\n- Avoid over-plucking history — some follicles die permanently if repeatedly plucked\n\n**Ideal masculine brow characteristics:**\n- Slightly overhanging the orbital rim (not too high above it)\n- Relatively straight with a subtle arch at the lateral third\n- Medium to thick density\n- Low-set (closer to the eyes) reads as more masculine and intimidating\n- Defined but natural — not sculpted or "done"\n\n**Quick fix:** Brow gel (clear or tinted) brushed upward creates instant fullness and a groomed look. Takes 10 seconds and makes a noticeable difference. Try it.`,
    ],
  },
  {
    keywords: ['posture', 'forward head', 'neck posture', 'slouch', 'hunch', 'tech neck'],
    followUps: ['How long to fix forward head posture?', 'Best exercises for posture', 'Does posture affect jawline?'],
    responses: [
      `Posture is probably the most underrated factor in facial aesthetics. Let me explain exactly why and how to fix it:\n\n**Why posture massively affects how your face looks:**\n- Forward head posture pushes your jaw backward and downward, making your jawline disappear from the side view\n- It creates a double chin even on lean people by compressing the submental area\n- It makes your neck look shorter and thicker (not in the good way)\n- Rounded shoulders make your head look bigger relative to your frame\n- Correcting posture can literally make you look 1-2 attractiveness points better INSTANTLY because your jaw comes forward to its natural position\n\n**The fix — exercises to do daily:**\n\n1. Chin tucks (KING exercise): Pull chin straight back creating a double chin, hold 5 sec, 20 reps. Do this 3x daily minimum. This single exercise does more than anything else.\n\n2. Wall angels: Stand with back flat against wall, arms at 90 degrees against wall, slide up and down. 3 sets of 10. Fixes rounded shoulders.\n\n3. Thoracic extensions: Lie on a foam roller placed across your upper back, extend backward over it. 15 reps. Opens up the chest.\n\n4. Face pulls (with resistance band): Pull band toward face, externally rotate at top. 3 sets of 15-20. Builds the rear deltoids and external rotators that hold shoulders back.\n\n5. Dead hangs: Hang from a pull-up bar 30-60 seconds. Decompresses the spine and stretches tight shoulders.\n\n6. Doorway stretches: Lean through a doorway with arms on the frame at 90 degrees. 30 sec hold. Stretches tight pecs.\n\n**Daily habits (these matter more than exercises):**\n- Set hourly posture check reminders on your phone\n- Monitor at eye level (buy a stand)\n- Hold phone at eye level (this is the biggest modern posture killer)\n- Strengthen your back: rows, pull-ups, reverse flyes 3x/week\n- Sleep on your back with proper pillow height (one thin pillow)\n- Consider a posture corrector brace for the first few weeks as a training tool\n\n**Timeline:** Most people see significant improvement in 4-8 weeks of daily work. The posture exercises take 10 minutes — do them while watching something. Your jaw will literally look different.`,
    ],
  },
  {
    keywords: ['body fat', 'lean', 'lose weight', 'fat loss', 'bloat', 'water retention', 'cutting', 'face fat', 'chubby face'],
    followUps: ['How to lose face fat specifically?', 'Best diet for getting lean?', 'How low should my body fat be?'],
    responses: [
      `Getting lean is hands-down the SINGLE most transformative thing you can do for facial aesthetics. I cannot stress this enough. Here's the complete protocol:\n\n**Why body fat matters so much for your face:**\n- Face fat sits over your bone structure, hiding your jawline, cheekbones, and overall definition\n- The face is actually one of the FIRST places you notice fat loss\n- Going from 20% to 13% body fat can literally make you look like a different person\n- Most guys have way better bone structure than they think — it's just buried under fat\n\n**Target body fat levels:**\n- 18-20%: Jaw starts becoming slightly visible\n- 15-17%: Jaw clearly defined, cheekbones beginning to show\n- 12-15%: The sweet spot — sharp jawline, visible cheekbones, hollow cheeks emerging. This is where most model-tier faces live.\n- 10-12%: Maximum facial definition. Incredible bone structure visibility but harder to maintain.\n\n**The fat loss protocol:**\n- Calculate your TDEE (total daily energy expenditure)\n- Eat at a 300-500 calorie deficit (no more — aggressive deficits cause muscle loss and metabolic adaptation)\n- High protein: 1g per lb of bodyweight minimum. Preserves muscle and keeps you full.\n- Strength train 3-5x per week — maintaining muscle keeps your metabolism high and prevents the "skinny fat" look\n- 8000-10000 steps daily for non-exercise activity (NEAT)\n- Track calories at least initially to learn portion sizes\n\n**Reducing facial bloat specifically (even without fat loss):**\n- Limit sodium to 2000mg daily (check nutrition labels — it's hidden in everything)\n- Drink MORE water (3-4 liters) — counterintuitively reduces water retention\n- Reduce/eliminate alcohol (causes massive face puffiness for 24-48 hours)\n- Minimize refined carbs (each gram of glycogen holds 3g of water)\n- Get 7-9 hours of quality sleep (poor sleep raises cortisol which causes facial bloat and fat storage)\n- Limit caffeine to morning only\n\n**Timeline:** You'll start seeing face gains after losing 5-10 lbs. Most guys are shocked at how much their face changes after dropping 15-20 lbs. Take weekly photos in the same lighting.`,
    ],
  },
  {
    keywords: ['sleep', 'sleeping', 'rest', 'tired', 'insomnia', 'sleep quality', 'sleep position'],
    followUps: ['How to sleep on my back', 'Best sleep supplements?', 'Does mouth taping work?'],
    responses: [
      `Sleep is literally when your face repairs, regenerates, and grows. If you're not optimizing sleep, you're leaving massive gains on the table. Here's the full protocol:\n\n**Why sleep is crucial for facial aesthetics:**\n- Growth hormone (HGH) is released primarily during deep sleep stages — this is what repairs skin, builds collagen, and maintains bone density\n- Skin cell turnover and repair happens during sleep (hence "beauty sleep" being real)\n- Poor sleep increases cortisol by 30-40%, which breaks down collagen, causes water retention, and accelerates aging\n- One week of 5-hour sleep makes you look measurably less attractive in studies\n- Dark circles, puffy eyes, dull skin, accelerated aging — all from bad sleep\n\n**Sleep position (this is important):**\n- Sleep on your back. Non-negotiable for facial aesthetics.\n- Side sleeping compresses one side of your face for 6-8 hours creating asymmetry over time\n- Stomach sleeping is the worst — full face compression plus neck strain\n- If you can't sleep on your back: use a U-shaped pillow to prevent rolling, or put tennis balls in a t-shirt pocket on your sides\n- Use a silk pillowcase if you must side-sleep — less friction and moisture absorption\n\n**Optimizing sleep quality:**\n- Consistent schedule: Same bed/wake time every day (yes, weekends too)\n- Room temperature: 65-68F / 18-20C — cool environment triggers melatonin\n- Complete darkness: Blackout curtains + no LEDs. Even small amounts of light reduce melatonin\n- No screens 30-60 min before bed (blue light suppresses melatonin by 50%)\n- No caffeine after 12-2pm (caffeine half-life is 5-6 hours)\n- No alcohol before bed (it sedates you but destroys sleep quality and causes morning face bloat)\n\n**Supplements that help:**\n- Magnesium glycinate (400mg): Relaxes muscles, improves sleep depth\n- Glycine (3g): Lowers core body temperature, improves sleep quality\n- L-theanine (200mg): Promotes relaxation without drowsiness\n- Melatonin (0.3-1mg ONLY): Lower doses are actually more effective than higher. Use for jet lag or schedule resets only.\n\n**Night routine for aesthetics:**\n- Apply retinol (it works best at night)\n- Lip treatment/mask\n- Mouth tape for nasal breathing (forces tongue to palate = mewing while sleeping)\n- Sleep on your back\n- 7-9 hours minimum\n\nThis single habit improvement can change how you look within 1-2 weeks. No joke.`,
    ],
  },
  {
    keywords: ['retinol', 'retinoid', 'tretinoin', 'anti aging', 'wrinkle', 'aging', 'fine line', 'tret'],
    followUps: ['How to avoid retinol irritation?', 'Retinol vs tretinoin difference?', 'When will I see retinol results?'],
    responses: [
      `Retinol/Tretinoin is the single most evidence-backed anti-aging ingredient in existence. If you only add one "active" to your routine, this should be it. Here's everything you need to know:\n\n**What it does (the science is overwhelming):**\n- Accelerates skin cell turnover — fresh, new skin surfaces faster\n- Directly stimulates collagen and elastin production\n- Reduces and prevents fine lines and wrinkles\n- Fades dark spots, hyperpigmentation, and acne marks\n- Improves overall skin texture (smoothness, evenness)\n- Unclogs pores and prevents acne\n- Thickens the dermis layer over time\n- Basically it does EVERYTHING. No other ingredient comes close.\n\n**The hierarchy (weakest to strongest):**\n- Retinyl palmitate (barely works, in many moisturizers)\n- Retinol 0.3-1% (OTC, good starting point)\n- Retinaldehyde (stronger OTC option)\n- Adapalene 0.1% (OTC in US — Differin gel. Great for acne)\n- Tretinoin 0.025% (prescription — where real results start)\n- Tretinoin 0.05% (standard prescription strength)\n- Tretinoin 0.1% (max strength — harsh but incredibly effective)\n\n**How to start without destroying your face:**\n1. Start LOW: 0.025% tretinoin or 0.3% retinol\n2. Apply pea-sized amount 2x per week at night only\n3. Wait 20 min after washing face before applying (damp skin = more penetration = more irritation)\n4. Buffer method: Apply moisturizer FIRST, then retinol on top (reduces irritation without reducing efficacy much)\n5. Increase to every other night after 3-4 weeks if tolerated\n6. Build to nightly over 6-8 weeks\n7. ALWAYS use SPF 30+ during the day — retinoids make skin more photosensitive\n\n**The retinization period (the "purge"):**\n- Weeks 1-4: Flaking, redness, dryness, possible breakouts. This is NORMAL.\n- Weeks 4-8: Skin adjusts, irritation decreases\n- Weeks 8-12: You start seeing real improvements in texture\n- Months 3-6: Significant visible anti-aging and clarity improvements\n- Months 6-12+: Full results. Skin looks genuinely younger and healthier.\n\n**Do NOT combine with (on the same night):**\n- Vitamin C (can cause irritation when layered with retinol)\n- AHA/BHA exfoliants (too much irritation)\n- Benzoyl peroxide (can deactivate retinol)\n\nThis is a long-term commitment. Results compound over YEARS. Many dermatologists consider tretinoin the closest thing to turning back the clock on skin aging.`,
    ],
  },
  {
    keywords: ['vitamin c', 'vitamin c serum', 'ascorbic acid', 'brightening'],
    followUps: ['Best vitamin C serum?', 'When to apply vitamin C?', 'Does vitamin C help with dark spots?'],
    responses: [
      `Vitamin C serum is your morning MVP — here's why every man should be using it:\n\n**What it does:**\n- Powerful antioxidant that neutralizes free radical damage from UV and pollution\n- Brightens skin tone and fades hyperpigmentation/dark spots\n- Boosts collagen synthesis (proven in multiple studies)\n- Enhances your sunscreen's UV protection\n- Gives skin a visible "glow" that looks healthy and attractive\n- Helps fade acne marks and post-inflammatory hyperpigmentation\n- Evens out skin tone over time\n\n**How to choose:**\n- Look for L-ascorbic acid at 15-20% concentration (the most researched form)\n- pH should be below 3.5 for proper absorption\n- Look for added Vitamin E and Ferulic acid — they stabilize it and triple the effectiveness (the "CE Ferulic" formula)\n- It should be clear or pale yellow. If it's dark orange/brown, it's oxidized and useless.\n\n**Recommended products:**\n- Budget: The Ordinary Vitamin C Suspension 23% (gritty texture but effective)\n- Mid-range: Timeless CE Ferulic (best value for CE Ferulic formula)\n- Premium: Skinceuticals CE Ferulic (the original research formula, expensive but gold standard)\n- Alternative: The Ordinary Ascorbyl Glucoside 12% (stable, gentle, good for beginners)\n\n**How to use:**\n- Apply in the morning after cleansing, before moisturizer\n- 4-5 drops, spread over face and neck\n- Wait 1-2 minutes before next step\n- Follow with moisturizer and SPF\n- Store in a cool, dark place (fridge is ideal) — Vitamin C degrades with light and air\n\n**Timeline:** Brightening effects visible in 2-4 weeks. Significant dark spot fading and collagen benefits at 2-3 months of consistent use.\n\nThis is a non-negotiable AM active. If you're using retinol at night and Vitamin C in the morning with daily SPF, you're covering like 80% of what skincare can do for you.`,
    ],
  },
  {
    keywords: ['niacinamide', 'vitamin b3', 'niacin', 'pore', 'pores', 'minimiz'],
    followUps: ['Can I use niacinamide with retinol?', 'Best niacinamide product?', 'Does niacinamide reduce oil?'],
    responses: [
      `Niacinamide (Vitamin B3) is one of the most versatile and well-tolerated skincare ingredients out there. It's a great addition for basically everyone:\n\n**What it does:**\n- Minimizes pore appearance (reduces sebum production and improves skin texture around pores)\n- Strengthens the skin barrier (helps with sensitivity, redness, and moisture retention)\n- Reduces redness and blotchiness\n- Fades hyperpigmentation and evens skin tone\n- Regulates oil production without drying skin out\n- Anti-inflammatory — calms acne and irritation\n- Pairs well with almost everything (very few incompatibilities)\n\n**How to use:**\n- 5-10% concentration is the sweet spot. Higher than 10% can cause irritation or flushing in some people.\n- Apply morning or evening (or both) after cleansing\n- Layer under moisturizer\n- Can be mixed into your moisturizer if you prefer fewer steps\n\n**Where it fits in your routine:**\n- Morning: Cleanser > Vitamin C > Niacinamide (or use a moisturizer with niacinamide built in) > SPF\n- Evening: Cleanser > Niacinamide > Retinol > Moisturizer\n- It plays well with retinol, vitamin C, BHA/AHA, and basically everything else\n\n**Best products:**\n- The Ordinary Niacinamide 10% + Zinc 1% — dirt cheap, effective, widely available\n- CeraVe PM Facial Moisturizing Lotion — has 4% niacinamide built into a great moisturizer\n- Paula's Choice 10% Niacinamide Booster — elegant formula\n\n**Why I recommend it for men specifically:**\nMen tend to have oilier skin and larger pores. Niacinamide addresses both without harsh treatments. It also helps with the redness and irritation from shaving. And since it strengthens the skin barrier, it helps your other actives (retinol, vitamin C) work better with less irritation.\n\nBottom line: If you're building a skincare routine and want something gentle that does a lot, niacinamide is a no-brainer. Zero downtime, basically no irritation risk, and real results.`,
    ],
  },
  {
    keywords: ['sunscreen', 'spf', 'sun protection', 'uv', 'sun damage'],
    followUps: ['Best sunscreen that does not look white?', 'Do I need sunscreen indoors?', 'Chemical vs mineral sunscreen?'],
    responses: [
      `I'm going to be real with you: sunscreen is the single most important anti-aging product. More important than retinol, vitamin C, or anything else. Here's why and how:\n\n**Why it's non-negotiable:**\n- 80-90% of visible skin aging (wrinkles, sagging, dark spots, texture) comes from UV exposure. Not genetics, not time — UV.\n- UVA rays (aging rays) penetrate through clouds AND windows. You're getting UV exposure indoors near windows.\n- UV degrades collagen and elastin, causing permanent structural damage\n- It prevents hyperpigmentation, melasma, and uneven skin tone\n- Men who use daily SPF from their 20s look 10-15 years younger by their 40s\n\n**How to use it correctly (most people mess this up):**\n- Apply SPF 30-50 every single morning as the last step of skincare\n- Use 2-3 finger-lengths of product for face and neck (most people use 1/4 of what's needed)\n- Reapply every 2 hours if outdoors or sweating\n- Apply 15 min before sun exposure for chemical sunscreens\n- Don't forget: ears, neck, back of hands\n\n**Types and what to choose:**\n- Chemical (organic filters): Lightweight, invisible, absorbs UV. Good for daily wear. May irritate very sensitive skin.\n- Mineral (zinc oxide, titanium dioxide): Physically blocks UV. Better for sensitive skin but can leave a white cast on darker skin.\n- Hybrid: Contains both. Often best of both worlds.\n\n**My recommendations by priority:**\n- For no white cast + elegance: Asian sunscreens are unmatched. Biore UV Aqua Rich, Canmake Mermaid Skin, Beauty of Joseon Sun\n- For sensitive skin: La Roche-Posay Anthelios Mineral, EltaMD UV Clear\n- For budget: Neutrogena Ultra Sheer SPF 50, CeraVe AM SPF 30\n- For sport/sweat: Supergoop Play, Neutrogena Sport Face\n\n**Busting myths:**\n- "I'm dark-skinned, I don't need it" — Wrong. You're protected from sunburn but not from photoaging and UV damage\n- "It's cloudy" — 80% of UV penetrates clouds\n- "I'm inside" — UVA goes through windows. If you sit near one, you need SPF\n- "SPF in my moisturizer is enough" — Usually not. Dedicated sunscreen applied generously is far more reliable.\n\nStart today. Your future self will thank you massively.`,
    ],
  },
  {
    keywords: ['moisturizer', 'moisturiz', 'dry skin', 'hydrat', 'dehydrat', 'moisture barrier', 'skin barrier'],
    followUps: ['Best moisturizer for oily skin?', 'How to fix damaged skin barrier?', 'Do I need moisturizer if my skin is oily?'],
    responses: [
      `Moisturizer is the backbone of any skincare routine — yes, even for oily skin. Let me break down why and what to use:\n\n**Why EVERYONE needs to moisturize:**\n- Maintains the skin barrier (your defense against bacteria, pollution, and irritation)\n- Dehydrated skin overproduces oil to compensate — moisturizing actually REDUCES oiliness\n- Creates a smooth, plump skin surface that looks healthier and more youthful\n- Helps your active ingredients (retinol, vitamin C) work better with less irritation\n- Prevents transepidermal water loss (TEWL) — keeping water IN your skin\n\n**Choosing the right one:**\n\nFor oily skin:\n- Lightweight gel or gel-cream formulas\n- Look for: hyaluronic acid, niacinamide, no heavy oils\n- Products: Neutrogena Hydro Boost, CeraVe PM, Belif Aqua Bomb\n\nFor dry skin:\n- Richer cream formulas with ceramides and fatty acids\n- Look for: ceramides, squalane, shea butter, cholesterol\n- Products: CeraVe Moisturizing Cream, Vanicream, First Aid Beauty Ultra Repair\n\nFor normal/combination:\n- Medium-weight lotion or light cream\n- CeraVe PM is honestly perfect for most men\n\n**Ingredients to look for:**\n- Ceramides: Repair and strengthen the barrier\n- Hyaluronic acid: Holds 1000x its weight in water\n- Niacinamide: Barrier support + oil control\n- Squalane: Lightweight oil that mimics natural sebum\n- Peptides: Support collagen production\n\n**How to apply:**\n- Apply to slightly damp skin (within 60 seconds of washing) to lock in hydration\n- Gentle patting motion, don't rub aggressively\n- Morning: lighter formula under SPF\n- Evening: can go slightly richer, especially over retinol\n\n**Skin barrier repair (if you've over-exfoliated or over-used actives):**\n- Stop all actives (retinol, vitamin C, acids) for 2-4 weeks\n- Use only gentle cleanser + ceramide-rich moisturizer + SPF\n- Add a few drops of squalane oil for extra barrier support\n- Your skin barrier heals in 2-4 weeks with this protocol\n\nDon't overcomplicate this. A basic $10-15 moisturizer used consistently beats a $100 product used occasionally.`,
    ],
  },
  {
    keywords: ['exfoliat', 'aha', 'bha', 'glycolic', 'salicylic', 'chemical exfoliant', 'peel', 'dead skin'],
    followUps: ['How often should I exfoliate?', 'AHA vs BHA difference?', 'Best exfoliant for acne?'],
    responses: [
      `Chemical exfoliation is a game-changer for skin texture and clarity. Here's the complete breakdown:\n\n**AHA vs BHA — which one you need:**\n\nBHA (Salicylic Acid):\n- Oil-soluble — penetrates INTO pores\n- Best for: acne, blackheads, oily skin, enlarged pores\n- Anti-inflammatory — calms existing breakouts\n- Use 2% concentration, 2-3x per week\n- Best product: Paula's Choice 2% BHA Liquid Exfoliant (cult favorite for a reason)\n\nAHA (Glycolic Acid, Lactic Acid, Mandelic Acid):\n- Water-soluble — works on the skin surface\n- Best for: dull skin, texture, hyperpigmentation, sun damage, fine lines\n- Increases cell turnover and reveals fresh skin underneath\n- Start with 5-8%, can work up to 10-15%\n- Best products: The Ordinary Glycolic Toning Solution 7%, COSRX AHA Whitehead Power Liquid\n\n**How to incorporate:**\n- Start 1-2x per week, evening only\n- Apply after cleansing on dry skin\n- Wait 2-3 minutes before next step\n- Follow with moisturizer\n- NEVER use on the same night as retinol (too much exfoliation)\n- Always use SPF the next day (AHAs increase photosensitivity)\n\n**Signs you're over-exfoliating:**\n- Skin feels tight, shiny, or "plastic-looking"\n- Increased redness, sensitivity, or stinging with normal products\n- More breakouts than usual\n- Flaking that doesn't resolve\nIf this happens: stop all exfoliants for 2 weeks, use only gentle cleanser and rich moisturizer\n\n**Physical vs chemical:**\n- Skip physical scrubs (St. Ives, walnut shell scrubs) — they create micro-tears and uneven exfoliation\n- Chemical exfoliants are more effective, more even, and less damaging\n- The only physical exfoliation I'd recommend: a soft washcloth or konjac sponge, and even that sparingly\n\n**At-home peels (advanced):**\n- The Ordinary AHA 30% + BHA 2% Peeling Solution: Use 1x per week maximum, 10 minutes only\n- NOT for beginners — build up to this over months\n\nProper exfoliation gives you that "glowing from within" look that people notice but can't quite pinpoint why your skin looks so good.`,
    ],
  },
  {
    keywords: ['dark spot', 'hyperpigmentation', 'acne scar', 'acne mark', 'pigment', 'scar', 'discoloration', 'melasma'],
    followUps: ['How long to fade dark spots?', 'Best ingredients for hyperpigmentation?', 'Difference between acne scars and marks?'],
    responses: [
      `Hyperpigmentation and acne marks are super common and totally treatable. Here's your plan of attack:\n\n**First — understanding what you have:**\n- Post-inflammatory hyperpigmentation (PIH): Flat brown/dark spots left after acne. Not actual scars — these WILL fade.\n- Post-inflammatory erythema (PIE): Red/pink marks left after acne. More common in lighter skin. Also fades but slower.\n- Melasma: Patchy brown areas, often hormonal. More stubborn.\n- True acne scars: Indented (icepick, boxcar, rolling) or raised (keloid). These are textural, not just color. Need different treatment.\n\n**For flat dark spots/PIH (most common):**\n\nThe treatment stack (layer these):\n1. Vitamin C serum (AM): Inhibits melanin production, brightens existing spots\n2. Niacinamide 5-10% (AM/PM): Prevents melanin transfer to skin surface\n3. Alpha arbutin 2% (AM/PM): Gentle melanin inhibitor\n4. Retinol/tretinoin (PM): Speeds cell turnover so pigmented cells shed faster\n5. AHA exfoliant (2x/week): Removes pigmented surface cells\n6. SPF 50 (AM): CRITICAL — UV makes dark spots worse and undoes all your treatment progress\n\n**Key products:**\n- The Ordinary Alpha Arbutin 2% + HA\n- Good Molecules Discoloration Correcting Serum\n- Murad Rapid Dark Spot Correcting Serum\n\n**For red marks/PIE:**\n- Niacinamide to strengthen capillaries\n- Azelaic acid 10-20% (reduces redness specifically)\n- Time — these fade on their own in 3-12 months but above ingredients speed it up\n- Vascular laser treatments if you want faster results\n\n**For true textural scars:**\n- Microneedling (professional, 1.5-2.0mm depth) — stimulates collagen remodeling. Series of 3-6 sessions.\n- TCA CROSS (trichloroacetic acid): For deep ice pick scars specifically\n- Fractional CO2 laser: Most aggressive option, significant downtime but best results\n- Tretinoin helps mildly with shallow scarring over time\n\n**Timeline for flat marks:** With an active treatment routine + SPF, expect 50% improvement in 2-3 months, significant fading in 4-6 months. Without treatment, PIH can take 6-24 months to fade naturally.\n\nMost important rule: SPF EVERY DAY. One day of sun without protection can reverse weeks of fading progress.`,
    ],
  },
  {
    keywords: ['nutrition', 'diet', 'food', 'eat', 'eating', 'meal', 'foods for skin'],
    followUps: ['Best foods for clear skin?', 'Does dairy cause acne?', 'Nutrition for hair growth'],
    responses: [
      `Nutrition directly affects how your face looks — your skin, bone health, and body composition all depend on what you eat. Here's the protocol:\n\n**Foods that improve facial aesthetics:**\n\nFor skin glow and clarity:\n- Fatty fish (salmon, mackerel, sardines): Omega-3s reduce inflammation, improve skin hydration and elasticity\n- Berries (blueberries, strawberries): Antioxidants protect collagen from free radical damage\n- Sweet potatoes and carrots: Beta-carotene literally gives skin a warm, healthy undertone (studies confirm this is rated as more attractive)\n- Avocados: Healthy fats + vitamin E for skin barrier health\n- Tomatoes: Lycopene provides internal UV protection\n\nFor testosterone and facial masculinity:\n- Oysters: Highest zinc food, directly supports testosterone\n- Eggs: Cholesterol is the precursor to all sex hormones + biotin for hair\n- Beef liver: Most nutrient-dense food on earth (vitamin A, B12, iron, zinc)\n- Brazil nuts (2-3 daily): Selenium for testosterone production\n- Cruciferous vegetables: Help metabolize excess estrogen\n\nFor collagen and bone health:\n- Bone broth: Natural collagen + minerals\n- Vitamin C-rich foods: Required for collagen synthesis\n- Organ meats: Proline and glycine (collagen building blocks)\n- Dark leafy greens: Vitamin K for bone density\n\n**What to avoid/minimize:**\n- Sugar: Causes glycation — literally cross-links your collagen fibers making skin stiff and wrinkled\n- Dairy: Strong correlation with acne in many people. Try cutting it for 4-6 weeks and see.\n- Alcohol: Dehydrates skin, causes face bloat, damages liver which shows on face\n- Processed/fried foods: Inflammatory omega-6 fats worsen skin conditions\n- Excess salt: Causes water retention and facial puffiness\n\n**Macro framework for face gains:**\n- Protein: 1g per lb bodyweight (supports collagen, muscle, and satiety for fat loss)\n- Healthy fats: 25-30% of calories (hormone production)\n- Carbs: Fill remaining calories, favor complex sources\n- Total calories: Slight deficit if you need to lose face fat, maintenance if already lean\n\nYou literally are what you eat. Two weeks of clean eating shows on your face — better skin tone, less puffiness, more definition.`,
    ],
  },
  {
    keywords: ['supplement', 'vitamin', 'collagen', 'biotin', 'zinc', 'vitamin d', 'omega'],
    followUps: ['Which supplements are actually worth it?', 'Best collagen supplement?', 'Does zinc really help skin?'],
    responses: [
      `Let me cut through the supplement noise and tell you what's actually worth your money for facial aesthetics:\n\n**Tier 1 — Strongly recommended (evidence-backed):**\n\n1. Vitamin D3 (2000-5000 IU daily): 70%+ of people are deficient. Affects skin health, testosterone, mood, and immune function. Get bloodwork to check your levels. Take with fat for absorption.\n\n2. Omega-3 Fish Oil (2-3g EPA+DHA daily): Anti-inflammatory. Improves skin hydration, reduces redness, supports brain health. Get one with high EPA+DHA per capsule. Nordic Naturals or Carlson's are quality brands.\n\n3. Zinc (15-30mg daily): Essential for skin health, testosterone production, and acne reduction. Zinc picolinate or glycinate forms absorb best. Don't exceed 40mg (can deplete copper). Take with food.\n\n4. Magnesium (300-400mg before bed): 60% of people are deficient. Improves sleep quality, reduces stress, supports hundreds of enzymatic reactions. Glycinate form for sleep/relaxation, citrate for general.\n\n**Tier 2 — Good supporting evidence:**\n\n5. Collagen Peptides (10-15g daily): Improves skin hydration, elasticity, and reduces wrinkles in multiple studies. Takes 4-8 weeks to notice. Mix in coffee, smoothies, or water. Any hydrolyzed collagen works.\n\n6. Vitamin C (500-1000mg): If your diet lacks fruits/vegetables. Essential for collagen synthesis internally.\n\n7. Biotin (5000mcg): Supports hair and nail growth. Most useful if deficient. Don't expect miracles if your levels are already normal.\n\n8. Astaxanthin (4-12mg): Powerful carotenoid antioxidant. Internal sun protection, skin elasticity, anti-aging. One of the most underrated supplements.\n\n**Tier 3 — Situational:**\n\n9. Iron: Only if bloodwork shows deficiency (common cause of dark circles and paleness)\n10. B-Complex: If you don't eat meat or have energy issues\n11. Saw Palmetto (320mg): Mild natural DHT blocker for hair loss\n12. Ashwagandha (600mg KSM-66): Reduces cortisol, supports testosterone. Good if you're stressed.\n\n**What's NOT worth it:**\n- Most "beauty supplements" marketed on Instagram (overpriced, underdosed)\n- Hair gummies (too little of everything to do anything)\n- Individual amino acids unless you have a specific deficiency\n\n**Important notes:**\n- Supplements enhance a good diet — they don't replace it\n- Get bloodwork done first to identify actual deficiencies\n- Buy from reputable brands (NOW Foods, Thorne, Life Extension, Nordic Naturals)\n- Take fat-soluble vitamins (D, E, A, K) with a meal containing fat\n- Consistency matters more than perfection. A simple D3 + Zinc + Omega-3 stack taken daily beats a complex protocol taken sporadically.`,
    ],
  },
  {
    keywords: ['water', 'hydration', 'drink water', 'water intake', 'dehydrated'],
    followUps: ['How much water should I actually drink?', 'Does water really change your face?', 'Best time to drink water'],
    responses: [
      `Hydration is one of those simple things that makes a shockingly visible difference. Let me explain why and how to optimize it:\n\n**How water transforms your face:**\n- Plumps skin cells, literally reducing the appearance of fine lines and wrinkles\n- Improves skin elasticity and that "bouncy" healthy texture\n- Flushes metabolic waste that contributes to breakouts\n- Paradoxically REDUCES water retention and facial bloating (when you're dehydrated, your body holds onto water)\n- Reduces dark circle severity (dehydration makes under-eye skin thinner and darker)\n- Gives skin a noticeable glow within days of proper hydration\n\n**How much to drink:**\n- Base: 3-4 liters per day for most men\n- Add 500ml-1L on training days\n- Add more in hot climates or if you sweat a lot\n- Track for one week — most guys are shocked to find they drink less than 2L\n\n**Hydration protocol for maximum face gains:**\n- 500ml immediately upon waking (your body is dehydrated from 7-8 hours without water)\n- 500ml before each meal (also helps with satiety if cutting)\n- Carry a large water bottle everywhere — visual reminder\n- Add electrolytes to 1-2 bottles daily (Liquid IV, LMNT, or just a pinch of salt + splash of lemon)\n- Eat water-rich foods: cucumber (96% water), watermelon, celery, oranges\n\n**Signs you're dehydrated (beyond just thirst):**\n- Urine darker than pale yellow\n- Dry or flaky skin despite moisturizing\n- Headaches, especially in the afternoon\n- Under-eye area looks sunken or dark\n- Skin doesn't bounce back when pinched (poor turgor)\n\n**What to reduce:**\n- Coffee after 2pm (diuretic + sleep disruptor)\n- Alcohol (severely dehydrating — one drink requires 2+ glasses of water to compensate)\n- Sugary drinks (inflammatory + empty calories that contribute to face fat)\n\n**Pro tip:** A properly hydrated face literally looks 1-2 years younger than a dehydrated one. This costs nothing and takes zero extra time beyond drinking. There's no excuse not to optimize this.`,
    ],
  },
  {
    keywords: ['exercise', 'gym', 'workout', 'lift', 'muscle', 'training', 'fitness', 'weight training'],
    followUps: ['Does cardio or lifting change face more?', 'Best workout split for aesthetics?', 'How does exercise affect skin?'],
    responses: [
      `Exercise transforms your face in ways most people don't realize. It's not just about body composition — here's the full picture:\n\n**How lifting changes your face:**\n- Fat loss reveals jawline, cheekbones, and bone structure (the #1 benefit)\n- Testosterone boost from heavy compound lifts enhances masculine features over time\n- Improved blood circulation gives skin a healthy, glowing appearance\n- Posture improvement (rows, face pulls, deadlifts) directly impacts jawline visibility\n- Neck/trap development frames your face better within a proportional body\n- Growth hormone release during intense exercise supports skin and collagen maintenance\n\n**Exercises with the highest facial aesthetic ROI:**\n\n1. Neck training (seriously underrated):\n   - Neck curls: Lie face up, curl chin to chest with plate on forehead. 3x15-25.\n   - Neck extensions: Lie face down, extend head up with plate on back of head. 3x15-25.\n   - Lateral raises: Side neck curls with band or plate. 3x15 each side.\n   - A thick, well-developed neck makes your jaw look more defined and your face more proportional. Start LIGHT — neck muscles grow fast but are easy to injure.\n\n2. Compound lifts for hormones:\n   - Squats, deadlifts, bench press: Biggest testosterone and GH boost\n   - These also drive the caloric expenditure needed for fat loss\n\n3. Posture exercises:\n   - Face pulls: 3x15-20, squeeze at the top with external rotation. Fixes rounded shoulders.\n   - Rows (cable, barbell, dumbbell): Strengthens mid-back, pulls shoulders back\n   - Rear delt flyes: 3x15-20. Directly counters forward shoulder posture.\n\n4. Traps/upper back:\n   - Shrugs: Big traps create a powerful jaw-to-shoulder line\n   - Pull-ups: Wide back makes waist look smaller and face/jaw more proportional\n\n**Recommended program:**\n- Push/Pull/Legs split, 4-6 days per week\n- Add neck training 2-3x per week (takes 5 minutes)\n- Include 2-3 cardio sessions for fat loss (walking, cycling, or HIIT)\n- Don't skip legs — overall muscular development affects hormone levels\n\n**Skin benefits of exercise:**\n- Increased blood flow delivers nutrients to skin cells\n- Sweating helps clear pores (but WASH YOUR FACE after)\n- Stress reduction (lower cortisol = less inflammation, less acne, less bloating)\n- Better sleep quality from physical fatigue\n\n**One warning:** Don't overtrain. Excessive exercise raises cortisol which can actually worsen skin and cause facial bloating. 4-6 sessions per week with rest days is plenty.`,
    ],
  },
  {
    keywords: ['confidence', 'mental', 'mindset', 'self esteem', 'motivation', 'anxiety', 'social', 'insecure'],
    followUps: ['How to stop comparing myself to others?', 'Does looksmaxxing help confidence?', 'How to build social skills'],
    responses: [
      `Real talk — confidence and mindset are arguably more important than physical features. I've seen average-looking guys who carry themselves like kings dominate socially, and I've seen genetically gifted guys who hide in corners because of insecurity. Here's the framework:\n\n**Building genuine, lasting confidence:**\n\n1. Competence breeds confidence. Set small daily goals and ACCOMPLISH them. Every win — hitting the gym, sticking to skincare, eating clean — compounds into self-belief. You can't just "think positive" your way there.\n\n2. Track your progress visually. Take photos monthly. When you can see tangible improvement, it rewires your self-perception from "I'm not good enough" to "I'm actively becoming better."\n\n3. Separate self-worth from appearance. Your looks are ONE dimension. Develop skills, knowledge, humor, social intelligence. These all contribute to how attractive people find you — not just your face.\n\n**Practical confidence techniques:**\n- Maintain strong eye contact (look at the bridge of their nose if direct feels too intense). Break eye contact sideways, never down.\n- Speak at 70% of your natural speed. Rushing = nervousness. Slowness = status.\n- Take up physical space. Uncross arms, squared shoulders, feet shoulder-width\n- Practice social interactions DAILY like a skill. Small talk with cashiers, asking for directions, complimenting strangers. Volume builds comfort.\n- Before any social situation: 2-minute power pose (hands on hips, chest open). Sounds cheesy, actually works.\n\n**Mindset shifts that matter:**\n- Looksmaxxing should be self-IMPROVEMENT, not self-HATRED. If you're doing this from a place of disgust rather than ambition, it'll make you miserable.\n- Compare yourself to your past self, NEVER to others. There will always be someone more attractive.\n- Most guys put in ZERO effort. Just trying puts you ahead of 80% of men.\n- Nobody scrutinizes your flaws as much as you do. People are too busy worrying about themselves.\n\n**When to check yourself:**\nIf you're spending hours daily analyzing your face in the mirror, if you avoid social situations because of perceived flaws others don't notice, if this is consuming your happiness — step back. Body dysmorphia is real and it's not weakness to talk to a professional about it.\n\nThe goal: look your best while being psychologically healthy. Improve AND accept. These aren't contradictions — they're the balanced path.`,
    ],
  },
  {
    keywords: ['dating', 'attract', 'tinder', 'dating app', 'girlfriend', 'women', 'date', 'approach'],
    followUps: ['Best photos for dating apps?', 'How much do looks matter in dating?', 'How to be more attractive overall'],
    responses: [
      `Let's talk about dating and attraction — because ultimately a lot of guys are here for this reason. Here's the honest, research-backed breakdown:\n\n**How much do looks actually matter:**\n- Online dating: A LOT. Photos are 90% of the decision on swipe apps. This is where looksmaxxing pays off most directly.\n- In person: Still important, but personality, confidence, humor, and social skills matter equally or more. Women are far more holistic in their attraction than men.\n- The "threshold" theory: You need to meet a minimum attractiveness threshold, after which personality/status/confidence determine the outcome. Looksmaxxing helps you clear more thresholds.\n\n**Maximizing dating photos:**\n- Use REAR camera (not selfies — front camera distorts your face by 10-30%)\n- Natural lighting (golden hour: 30 min before sunset is perfect)\n- Shoot slightly below eye level for more dominant/masculine angle\n- Genuine smile in 1-2 photos, neutral/slightly intense in others\n- Show variety: activity shot, dressed up shot, social shot, close-up\n- Get friends to take candids. These look more natural than posed selfies.\n- Edit SUBTLY: slight brightness increase, contrast. Never filter or facetune.\n\n**Attraction multipliers beyond face:**\n- Height optimization: Posture adds 0.5-1 inch. Shoe lifts add 1-2 inches discreetly.\n- Style: Well-fitting clothes that match your body type. Get basics right: good jeans, clean sneakers, well-fitted shirts.\n- Scent: Good fragrance is scientifically proven to increase perceived attractiveness. Invest in 1-2 quality fragrances.\n- Voice: Deeper, slower, resonant voices are more attractive. Neck training and posture actually improve voice resonance.\n- Social proof: Photos with friends, at events, in interesting locations\n\n**The unsexy truth:**\n- Most attraction happens through REPEATED exposure and personality revelation, not instant "hotness"\n- Being interesting, passionate, and confident about something (anything) is genuinely attractive\n- Humor is the #1 personality trait women cite for attraction\n- Good conversational skills beat looks in almost every long-term scenario\n\n**My advice:** Looksmax as a foundation, then invest equally in social skills, conversation ability, humor, and genuine interests. The guys who do best combine both — they look good AND have personality. One without the other limits you.`,
    ],
  },
  {
    keywords: ['photo', 'photo tip', 'selfie', 'camera', 'look good in photos', 'photogenic', 'angle'],
    followUps: ['Best angle for face photos?', 'Why do I look different in photos?', 'How to take better selfies'],
    responses: [
      `Looking good in photos is a skill that can be learned. Most people look way better in person than in photos because of lens distortion and poor technique. Here's how to fix that:\n\n**Why you look different in photos vs mirror:**\n- Front camera (selfie): Wide-angle lens distorts proportions. Makes nose 30% bigger, narrows jaw, and flattens midface. This is NOT what you actually look like.\n- Mirror: You see a reversed image. You're used to this version, so photos (which are un-reversed) look "off."\n- Solution: ALWAYS use rear camera held at arm's length or further for accurate representation.\n\n**Angles that enhance facial aesthetics:**\n- Slightly above eye level (10-15 degrees): Slims face, makes jaw look more defined\n- Slight 3/4 turn (not straight-on): Shows jaw angularity and creates depth\n- Chin slightly down and forward: Defines jawline and eliminates double chin\n- Camera at arm's length minimum (further = less distortion)\n- Don't tilt head back (shows nostrils) or too far forward (forehead looks massive)\n\n**Lighting (this matters more than you think):**\n- Golden hour (30 min before sunset): Warm, soft light that makes everyone look great\n- Window light from the side: Creates flattering shadows that define features\n- AVOID: Direct overhead light (creates under-eye shadows), fluorescent lighting (makes skin look dead), direct flash (flat and unflattering)\n- The sun should be BEHIND the camera facing you, or to your side. Never behind you.\n\n**Expression:**\n- "Squintmaxxing": Slightly narrow your eyes. This mimics a genuine smile and creates "hunter eyes" appearance. Models do this constantly.\n- Jaw tension: Slightly clench your jaw for masseter definition\n- Think of something genuinely amusing for a natural smile\n- Slight smirk or closed-mouth grin often photographs better than a full smile for men\n\n**Technical:**\n- Portrait mode blurs background and is more flattering\n- 2x zoom (50mm equivalent) is most flattering for face — no distortion\n- Take many photos and choose the best. Even models take 50 shots for 1 good one.\n- Slight post-processing: Increase contrast slightly, add warmth, ensure good exposure. Don't overdo it.\n\nPractice at home until you know your best angles and expressions. This is an actual skill that improves dramatically with practice.`,
    ],
  },
  {
    keywords: ['grooming', 'hygiene', 'self care', 'nose hair', 'ear hair', 'nail', 'groom'],
    followUps: ['Complete grooming checklist', 'Best grooming tools for men?', 'Grooming routine frequency'],
    responses: [
      `Grooming is the lowest-effort, highest-impact area of aesthetics. These are the details that separate someone who looks "put together" from someone who looks unkempt. Here's the comprehensive checklist:\n\n**Weekly essentials:**\n\nEyebrows (top priority):\n- Remove any unibrow hairs (tweeze, don't shave)\n- Trim overly long hairs with a spoolie + scissors\n- Clean up stragglers below the brow bone\n- Don't over-shape. Natural but tidy is the goal.\n\nFacial hair:\n- Whether bearded or clean-shaven, maintain clean edges\n- Neckline: 2 fingers above Adam's apple as your guide\n- Cheek line: Natural or slightly cleaned up\n- Nose hair: Trim weekly with a dedicated trimmer. Never pull.\n- Ear hair: Trim or remove any visible strands\n\n**Teeth & smile:**\n- Brush 2x daily with electric toothbrush (clinically superior to manual)\n- Floss daily — non-negotiable for gum health and breath\n- Tongue scraper every morning (removes bacteria that cause bad breath)\n- Whitening strips every 3-6 months (Crest 3D White works)\n- Mouthwash (alcohol-free to avoid dry mouth)\n\n**Hands & nails:**\n- Trim nails weekly. Filed edges look better than rough-cut.\n- Push back cuticles after shower\n- Moisturize hands (they're visible constantly)\n- Clean under nails daily\n\n**Scent:**\n- Daily antiperspirant/deodorant (non-negotiable)\n- Quality fragrance: 1-2 sprays on pulse points (neck, wrists). Less is more.\n- Don't skip: stale body odor negates everything else\n- Fresh breath at all times (carry mints/gum)\n\n**Skin-level details:**\n- Lip balm with SPF daily (dry, cracked lips are noticeable)\n- Moisturize face AND neck daily\n- Sunscreen (prevents premature aging, spots, unevenness)\n\n**The "above average" extras:**\n- Well-fitted clothes (nothing too baggy or too tight)\n- Clean, white sneakers or polished shoes\n- A quality watch or minimal jewelry\n- A good haircut every 3-4 weeks (don't let it grow out)\n\nAll of this together takes maybe 10-15 minutes per day and once-weekly maintenance. But it's the difference between looking like a 6 and a 7-8 with the same face. Don't neglect the basics while chasing advanced stuff.`,
    ],
  },
  {
    keywords: ['nose', 'rhinoplasty', 'nose shape', 'nose job', 'big nose', 'nose size'],
    followUps: ['Is rhinoplasty worth it?', 'Non-surgical nose options?', 'Does my nose look bigger in selfies?'],
    responses: [
      `The nose is something a lot of guys fixate on, so let me give you the full picture — both what's achievable naturally and what requires intervention:\n\n**First, the selfie distortion reality check:**\nFront-facing cameras at close distance can make your nose appear 20-30% larger than reality. This is lens distortion physics, not your actual face. Always evaluate your nose in a mirror or with a rear camera at 5+ feet distance. Many guys who think they have a "big nose" actually have a normal one distorted by selfie cameras.\n\n**Non-surgical options:**\n- Dermal filler "liquid nose job": Can smooth bumps, lift the tip, and add symmetry. Lasts 12-18 months. Costs $600-1500. No downtime.\n- Contouring (yes, men can do subtle makeup): Matte bronzer on sides of nose, highlight down the center. Undetectable if done right.\n- Weight loss: Losing body fat slightly changes how your nose appears relative to the rest of your face\n- Nose clips/shapers: Very limited evidence. May provide temporary compression effect at best.\n\n**Surgical rhinoplasty (if it genuinely affects your quality of life):**\n- Can reshape tip, reduce bridge bump, narrow width, adjust nostrils\n- Recovery: 1 week splint, 2-3 weeks swelling, full final result at 12-18 months\n- Cost: $5,000-$15,000+ depending on surgeon and location\n- Research surgeons EXTENSIVELY. Look specifically at their male rhinoplasty results.\n- Get 2-3 consultations minimum\n- A good surgeon preserves masculine character while improving proportion\n\n**Perspective:**\n- A "perfect" nose matters less than you think. Overall facial harmony, skin quality, and expression are more impactful.\n- Many iconic attractive men have imperfect noses (Owen Wilson, Adrien Brody, Ryan Gosling)\n- Focus on what you can change naturally first: skin, jaw, body fat, posture. These frame the nose and affect how prominent it appears.\n- If after optimizing everything else your nose still significantly bothers you, a consultation with a board-certified facial plastic surgeon is completely reasonable.\n\nDon't make a surgical decision based on how you look in selfies. Seriously.`,
    ],
  },
  {
    keywords: ['filler', 'dermal filler', 'botox', 'injectable', 'cosmetic procedure'],
    followUps: ['Are fillers safe for men?', 'Best areas for filler in men?', 'How long do fillers last?'],
    responses: [
      `Cosmetic procedures are becoming more common for men — here's an informational breakdown so you can make informed decisions:\n\n**Dermal Fillers (hyaluronic acid):**\n\nPopular areas for men:\n- Jawline/chin: Adds definition, projection, and angularity. Most popular male filler area.\n- Cheeks: Adds midface projection and can create a more chiseled look\n- Under-eyes (tear trough): Fills hollows that cause dark circles\n- Nose (liquid rhinoplasty): Smooths bumps, lifts tip\n- Temples: Fills hollowing that occurs with age\n\nWhat to know:\n- Costs $600-$2000 per syringe area\n- Results last 6-18 months depending on product and area\n- Minimal downtime (possible bruising/swelling for 2-5 days)\n- Reversible with hyaluronidase enzyme if you don't like the result\n- Start SUBTLE. You can always add more. "Overfilled" look is obvious and unattractive.\n\n**Botox/Dysport:**\n- Prevents/treats forehead lines, frown lines, and crow's feet\n- Lasts 3-4 months per treatment\n- Can also slim the jawline (masseter botox for square/wide jaw reduction)\n- Minimal pain, no downtime\n- Cost: $200-$600 per area per treatment\n\n**My honest take for young men:**\n- Exhaust natural options first: getting lean, mewing, masseter development, skincare\n- Fillers are best for specific structural deficiencies (weak chin, hollow under-eyes) rather than general "make me hotter"\n- The risk of looking "done" or plastic increases with each treatment. Restraint is key.\n- Always go to a board-certified professional (dermatologist or plastic surgeon), never a med spa with unqualified injectors\n- Research your provider extensively. Look at their male-specific results.\n\n**Red flags in a provider:**\n- Pressure to do more than you came for\n- Very cheap pricing (cutting corners on product quality)\n- Won't show male before/afters\n- Non-medical background\n\nNothing wrong with considering these as tools — just be informed and cautious. The best results are the ones nobody can tell you had.`,
    ],
  },
  {
    keywords: ['rhinoplasty', 'nose job', 'nose surgery'],
    followUps: ['How to choose a rhinoplasty surgeon?', 'Rhinoplasty recovery timeline?', 'Closed vs open rhinoplasty?'],
    responses: [
      `Rhinoplasty is one of the most common cosmetic procedures for men and can significantly change your facial profile. Here's everything you should know if you're considering it:\n\n**Types of rhinoplasty:**\n- Open rhinoplasty: Small incision at the columella (between nostrils). Better visibility for surgeon. Used for more complex reshaping.\n- Closed rhinoplasty: All incisions inside the nose. Less swelling, no external scarring. Limited to simpler modifications.\n- Revision rhinoplasty: Correcting a previous nose job. More complex and expensive.\n\n**What it can change:**\n- Reduce or smooth dorsal hump (bridge bump)\n- Refine and rotate nasal tip\n- Narrow overall width\n- Correct deviation/asymmetry\n- Adjust nostril size and shape\n- Improve breathing (functional rhinoplasty, often covered by insurance)\n\n**Important considerations for men:**\n- A masculine nose has different proportions than feminine. Make sure your surgeon understands male aesthetic goals.\n- Don't go too small/refined — it can look incongruent with masculine features\n- Maintain a straight or slightly convex bridge (slight bump is actually masculine)\n- Tip rotation should be minimal for men (0-5 degrees max)\n\n**Recovery timeline:**\n- Day 1-7: Splint on, bruising under eyes, swelling\n- Week 2-3: Splint off, still swollen but presentable\n- Month 1-3: 70% of swelling resolved, shape becoming visible\n- Month 6-12: 90% final result\n- 12-18 months: FINAL result (tip takes longest to settle)\n\n**Choosing a surgeon (critical):**\n- Board-certified facial plastic surgeon or plastic surgeon with rhinoplasty specialization\n- Look at 50+ before/after photos of MALE patients specifically\n- Get 2-3 consultations and compare their approaches\n- Ask about their revision rate (should be low)\n- Cost: $7,000-$15,000+ (don't bargain-hunt for facial surgery)\n\n**Should you do it?**\nIf your nose genuinely affects your confidence and quality of life, and you've exhausted non-surgical options (filler for bumps, weight loss for proportion), it's a valid option. Just ensure you have realistic expectations — rhinoplasty improves but doesn't create perfection.`,
    ],
  },
  {
    keywords: ['buccal fat', 'buccal fat removal', 'chubby cheek', 'baby face', 'face slim'],
    followUps: ['Am I too young for buccal fat removal?', 'Natural alternatives to buccal fat removal?', 'Does buccal fat reduce with age?'],
    responses: [
      `Buccal fat removal has become trendy — but here's what most people don't tell you:\n\n**What it is:**\nSurgical removal of the buccal fat pads (walnut-sized fat deposits in your cheeks between the cheekbones and jaw). Creates a more sculpted, hollow-cheek appearance.\n\n**The serious considerations:**\n\n1. It's IRREVERSIBLE. Unlike filler, you cannot undo this. The fat pads don't grow back.\n\n2. Your face naturally loses volume with age. Those buccal fat pads that make you look "chubby" at 22 are what keep you looking youthful at 35-45. Many people who get this procedure young end up looking gaunt and prematurely aged by their 40s.\n\n3. Results depend heavily on starting face structure. If you have wide cheekbones and a defined jaw, it can look great. If you have a narrow face or weak bone structure, it can make you look sick/hollow.\n\n**Before considering surgery, try these first:**\n- Get to 12-15% body fat. This alone creates "hollow cheeks" for most people.\n- The subcutaneous face fat is what's usually making you look chubby, NOT buccal fat. And that goes away with general fat loss.\n- Mewing: Forward maxillary growth changes cheek contour over time\n- Masseter development: Wider jaw creates more contrast with cheek area\n- Reduce bloat: Cut sodium, alcohol, excess carbs. You'll be shocked how much slimmer your face looks.\n\n**If you still want the procedure after exhausting natural options:**\n- Wait until at least age 25+ (face is still developing before then)\n- Consult 2-3 facial plastic surgeons\n- Ask to see patients 5+ years post-procedure (not just fresh results)\n- Consider partial removal rather than full removal\n- Cost: $2,000-$5,000\n\n**My honest recommendation:**\n90% of guys who think they need buccal fat removal actually just need to lose overall body fat. Get to 12-13% body fat first. If after that you still have excessively round cheeks (which is rare), THEN consider it. But exhaust the free options first.`,
    ],
  },
  {
    keywords: ['testosterone', 'hormone', 'masculin', 'masculine', 'androgen', 'test level', 'low t'],
    followUps: ['How to naturally boost testosterone?', 'Signs of low testosterone?', 'Does testosterone change face shape?'],
    responses: [
      `Testosterone is literally what builds masculine facial features. Here's the full breakdown:\n\n**How testosterone/DHT shape your face:**\n- Brow ridge prominence: T drives supraorbital bone growth\n- Jaw width and angularity: DHT (dihydrotestosterone) stimulates mandibular bone growth\n- Cheekbone definition: Androgens affect zygomatic arch development\n- Facial hair density: Directly DHT-dependent\n- Deeper-set eyes: Related to brow ridge growth\n- Overall "masculine" vs "soft" appearance: Androgen exposure during puberty determines this\n\n**Optimizing testosterone naturally:**\n\nThe big levers:\n1. Sleep 7-9 hours (T is produced during deep sleep. 5 hours = 15% lower T than 8 hours)\n2. Resistance training with heavy compound lifts (squats, deadlifts, bench, rows)\n3. Maintain 12-20% body fat (too high = aromatization to estrogen; too low = hormonal suppression)\n4. Manage stress (chronic cortisol directly suppresses T production)\n5. Limit alcohol (even 2-3 drinks reduces T significantly for 24+ hours)\n\nSupplements that support T:\n- Zinc 30mg (essential for T synthesis — most men are mildly deficient)\n- Vitamin D3 5000 IU (low D correlates directly with low T)\n- Magnesium 400mg (supports enzymatic T production)\n- Ashwagandha 600mg KSM-66 (clinically shown to increase T 15-20%)\n- Boron 10mg (may increase free T by lowering SHBG)\n\n**Important reality checks:**\n- Most facial bone development from hormones happens during puberty (13-21)\n- After age 25, hormonal impact on BONE is minimal. Soft tissue still responds (beard, muscle, fat distribution)\n- Natural T optimization provides modest improvements (15-30% increase). Don't expect dramatic facial bone changes at 25+.\n- Never take exogenous testosterone without medical supervision. TRT shuts down natural production permanently.\n\n**Signs of genuinely low T (get bloodwork):**\n- Persistent fatigue and low motivation\n- Difficulty building muscle despite training\n- Low libido\n- Brain fog and poor concentration\n- Increased body fat especially around abdomen\n- Depression or irritability\n\nIf total T is below 300-400 ng/dL on multiple tests, see an endocrinologist. Otherwise, lifestyle optimization is your best path.`,
    ],
  },
  {
    keywords: ['neck', 'neck training', 'thick neck', 'neck exercise', 'pencil neck', 'thin neck'],
    followUps: ['How fast does neck grow?', 'Best neck exercises?', 'Does neck size affect face appearance?'],
    responses: [
      `Neck training is the most underrated thing for facial aesthetics — seriously. Here's why everyone should be doing it:\n\n**Why neck size matters for your face:**\n- A proportional neck frames your jaw and makes it look more defined by contrast\n- A thin "pencil neck" makes your head look oversized and unmasculine regardless of facial features\n- It improves your posture dramatically (fixes forward head posture which kills jawline appearance)\n- Creates a powerful jaw-to-shoulder line that reads as masculine and dominant\n- Actually improves voice resonance due to supporting structures\n\n**The training protocol:**\n\nExercises (2-3x per week, takes 5-10 minutes):\n\n1. Neck Curls (front): Lie face up on bench, head hanging off edge. Place plate/weight on forehead with towel. Curl chin to chest. 3x15-25 reps.\n\n2. Neck Extensions (back): Lie face down on bench, head hanging off edge. Place plate on back of head. Extend head upward. 3x15-25 reps.\n\n3. Lateral Flexion (sides): Lie on side, weight on temple. Curl head up toward shoulder. 3x15-20 each side.\n\n4. Neck harness (if you have one): Great for progressive overload on extensions. Highly recommended investment.\n\n5. Shrugs (supplementary): Build upper trap which connects to neck visually. 3x12-15 heavy.\n\n**Critical safety notes:**\n- START VERY LIGHT. 5-10 lbs is plenty to begin with.\n- The neck grows FAST — often 0.5-1 inch in the first month\n- Never do explosive or jerky movements\n- Full range of motion, slow controlled reps\n- If anything feels painful (not muscular burn), stop immediately\n- Don't train neck if it's already sore\n\n**Expected timeline:**\n- 2 weeks: Muscles feel firmer/thicker\n- 4 weeks: Visually noticeable from the side (0.5-1 inch gain typical)\n- 8 weeks: Very obvious improvement in neck-jaw proportion\n- 12+ weeks: Substantial size that frames your face completely differently\n\n**Target measurements:**\n- Your neck should ideally be close to the same circumference as your head for masculine proportions\n- Average male neck: 14-15 inches. Aesthetic target: 16-17+ inches\n\nThis is honestly one of the biggest bang-for-your-buck things. 5 minutes, 3x per week, and people will notice within a month.`,
    ],
  },
  {
    keywords: ['skin tone', 'complexion', 'glow', 'dull skin', 'pale', 'tan', 'radiant', 'glowing skin'],
    followUps: ['How to get a natural glow?', 'Safe tanning methods?', 'Foods for better complexion'],
    responses: [
      `A healthy, glowing complexion signals youth and vitality. Here's how to get that "lit from within" look:\n\n**For immediate glow:**\n- Vitamin C serum every morning (the #1 product for radiance — gives visible results in 2 weeks)\n- Chemical exfoliation 2x weekly (AHA removes the dull, dead skin layer revealing fresh cells)\n- Hyaluronic acid serum on damp skin (plumps and reflects light)\n- Adequate sleep the night before (nothing replaces this for skin glow)\n- Hydration — a properly hydrated face literally has better light reflection\n\n**For healthy color/tone:**\n- Beta-carotene diet: Eat sweet potatoes, carrots, mangoes, and tomatoes regularly. Studies show this gives skin a warm, golden undertone that's rated MORE attractive than an actual tan.\n- Astaxanthin supplement (4-12mg): Carotenoid that gives skin a healthy warm tone from the inside\n- Light natural sun exposure (15-20 min without sunscreen) provides vitamin D and slight coloring without damage\n\n**If you want a tan appearance:**\n- Gradual self-tanner: Jergens Natural Glow, St. Tropez Gradual Tan. Apply after exfoliating for even coverage.\n- Apply to clean, dry skin. Use sparingly on face (mix with moisturizer for subtle color)\n- A light tan makes jawline, cheekbones, and muscle definition more visible\n- AVOID tanning beds — they accelerate skin aging by DECADES and dramatically increase cancer risk\n- If using real sun: limit to short sessions and always use SPF 30+ after\n\n**Reducing dullness and uneven tone:**\n- Niacinamide (5-10%): Evens skin tone and reduces redness\n- Azelaic acid: Great for redness-prone or rosacea skin\n- Consistent retinol use: Improves overall texture and tone over months\n- Reduce alcohol (causes redness and dullness) and sugar (causes sallowness)\n\n**For redness specifically:**\n- Green-tinted primer (invisible, neutralizes red tones — many men use this)\n- Centella asiatica (CICA) products: Calming and anti-redness\n- Avoid very hot showers on your face\n- Oatmeal-based products soothe irritated skin\n\nDiet + proper skincare + hydration + sleep = a complexion that makes people ask what you're doing differently. It takes 2-4 weeks to notice.`,
    ],
  },
  {
    keywords: ['lip', 'lips', 'lip care', 'chapped', 'dry lips', 'lip balm'],
    followUps: ['How to get fuller lips naturally?', 'Best lip balm for men?', 'Do lip exercises work?'],
    responses: [
      `Lips are a subtle but important part of facial aesthetics. Well-maintained lips signal health and youthfulness. Here's the guide:\n\n**Daily lip care protocol:**\n- SPF lip balm during the day (lips have no melanin protection — they burn and age from UV too)\n- Hydrating lip treatment at night (Aquaphor, Laneige Lip Sleeping Mask, or plain vaseline)\n- Exfoliate lips 1-2x weekly: Use a soft toothbrush in gentle circles, or a sugar lip scrub\n- Stay aggressively hydrated — lips show dehydration before anywhere else\n\n**For fuller-looking lips (naturally):**\n- Hydration is #1 — well-hydrated lips are visibly plumper\n- Peppermint oil-based lip products cause temporary volumizing through increased blood flow\n- Hyaluronic acid lip products draw moisture in and create temporary plumping\n- Lip exercises: Press lips together firmly, hold 5 seconds, release. Purse and hold. 2 sets of 20.\n- Proper blood circulation (exercise, hot/cold therapy)\n\n**What to avoid:**\n- Licking your lips (saliva evaporates and leaves them drier than before)\n- Picking at dry skin (creates wounds and scarring)\n- Matte/drying lip products\n- Breathing through your mouth (chronic mouth breathing dries and changes lip shape over time)\n- Extremely hot or spicy foods if prone to irritation\n\n**For lip color/health:**\n- Lips should be a healthy pink/red. Pale lips can indicate anemia or dehydration.\n- Iron-rich diet supports lip color\n- Exfoliation removes dead skin that makes lips look pale\n- A tinted lip balm (clear to barely tinted) is totally acceptable for men and looks natural\n\n**Lip filler (informational):**\n- Can add volume and definition. Very subtle amounts (0.5-1ml) can look natural.\n- Lasts 6-12 months. Reversible.\n- For men: focus on subtle projection rather than volume to maintain masculine appearance\n- Not necessary for most people — well-hydrated, healthy lips look great.\n\nThe minimum: SPF lip balm during the day, heavy moisturizing treatment at night. Takes 5 seconds and your lips will look noticeably better within a week.`,
    ],
  },
  {
    keywords: ['teeth', 'smile', 'whiten', 'whitening', 'dental', 'braces', 'invisalign', 'tooth'],
    followUps: ['Best whitening method?', 'How white should teeth be?', 'Does a smile really matter that much?'],
    responses: [
      `Your smile is statistically one of the biggest factors in perceived attractiveness — studies consistently rank it in the top 3 features people notice. Here's how to optimize:\n\n**Teeth whitening (ranked by effectiveness):**\n1. In-office professional whitening (Zoom, etc): 2-8 shades whiter in one session. Fastest results. $300-$600.\n2. Custom-fitted trays + professional gel from dentist: Best at-home results. 4-6 shades over 2 weeks. $200-$400.\n3. Crest 3D Whitestrips Professional Effects: Best OTC option. 3-4 shades over 2 weeks. $40-50.\n4. Whitening toothpaste: Maintains whiteness, doesn't dramatically improve. Use as maintenance.\n\nImportant: Go for natural white, not blinding toilet-bowl white. A shade too white looks fake and draws attention in the wrong way. B1 shade on the dental color guide is a good target — bright but natural.\n\n**Alignment options:**\n- Invisalign/SmileDirectClub: Clear aligners, invisible, removable. 4-18 months depending on complexity. Great for mild-moderate crowding.\n- Traditional braces: Most effective for complex cases. Less cool looking but superior results.\n- Cosmetic bonding: Quick fix for chipped or slightly uneven front teeth. Same-day.\n- Veneers (porcelain): Complete smile makeover. Expensive ($1000-2000/tooth) but dramatic transformation.\n\n**Daily dental care for the best smile:**\n- Electric toothbrush 2x daily (Oral-B iO or Sonicare — clinically superior to manual)\n- Floss every night before brushing (removes 40% of plaque manual brushing misses)\n- Tongue scraper each morning (bad breath and white tongue are instant unattractiveness)\n- Alcohol-free mouthwash (alcohol dries out mouth which actually worsens breath long-term)\n- Water after every meal to rinse acids and prevent staining\n\n**Smile technique:**\n- Practice in the mirror. Find the smile that shows teeth naturally without looking forced.\n- A slight squint with your eyes when smiling reads as genuine (Duchenne smile)\n- Don't cover your mouth when laughing/smiling — it signals insecurity\n\n**Stain prevention:**\n- Use a straw for coffee, tea, and dark beverages\n- Rinse mouth with water after staining foods\n- Brush 30 min after eating acidic foods (not immediately — acid softens enamel temporarily)\n- Regular dental cleanings every 6 months\n\nInvesting in your smile is one of the highest-ROI aesthetics moves. A bright, aligned smile makes your entire face look better.`,
    ],
  },
  {
    keywords: ['stress', 'cortisol', 'relax', 'meditation', 'overwhelm'],
    followUps: ['How does stress age your face?', 'Best stress reduction techniques?', 'Does meditation help appearance?'],
    responses: [
      `Stress is a silent destroyer of facial aesthetics. Let me explain exactly how and what to do about it:\n\n**How chronic stress damages your appearance:**\n- Cortisol breaks down collagen and elastin (causes premature aging and sagging)\n- Triggers inflammation which worsens acne, eczema, and redness\n- Causes facial water retention and puffiness (puffy morning face that won't go away)\n- Promotes fat storage, especially around the face and midsection\n- Disrupts sleep quality which cascades into dark circles, dull skin, and poor recovery\n- Accelerates hair loss in genetically susceptible men\n- Weakens skin barrier leading to sensitivity and breakouts\n\n**The cortisol-face connection is REAL:**\nStudy after study shows that stressed individuals are rated as significantly less attractive. It affects your skin tone, facial puffiness, dark circles, and even your resting facial expression (tension, furrowed brow).\n\n**Stress management protocol (for aesthetics):**\n\nDaily (choose 1-2):\n- 10-minute meditation (Headspace, Calm, or just seated breathing): Proven to lower cortisol 15-25%\n- Deep breathing: 4-7-8 technique (inhale 4 sec, hold 7, exhale 8). Do 5 rounds.\n- Exercise: Single best stress reducer. Even a 20-minute walk drops cortisol significantly.\n- Cold exposure: 2-min cold shower ending reduces cortisol and improves mood via norepinephrine\n- Journaling: Brain-dump worries onto paper. Externalization reduces rumination.\n\nLifestyle:\n- Set boundaries on work hours (chronic overwork = chronic high cortisol)\n- Limit social media doom-scrolling (activates fight-or-flight)\n- Nature exposure: 20 min in greenery reduces cortisol measurably\n- Social connection: Isolation increases stress hormones\n- Magnesium glycinate (400mg before bed): Directly modulates stress response\n- Ashwagandha (600mg KSM-66): Clinically shown to reduce cortisol by 30%\n\n**What high-stress does to your face over time:**\n- Forehead lines from furrowed brow tension\n- Nasolabial folds from chronic jaw clenching\n- Under-eye darkness from poor sleep\n- Gray/sallow skin tone from poor circulation\n- Breakouts along the jaw and chin (cortisol triggers sebum production)\n\nReducing stress is literally anti-aging. You'll notice: clearer skin, less puffiness, better sleep, and you'll just LOOK more relaxed and attractive. It's not soft — it's strategic.`,
    ],
  },
  {
    keywords: ['looksmax', 'glow up', 'improve look', 'attractive', 'better looking', 'where to start', 'beginner'],
    followUps: ['What should I focus on first?', 'How long until I see results?', 'Most impactful change I can make?'],
    responses: [
      `Welcome to the game. Here's the complete looksmaxxing roadmap, prioritized by impact so you know exactly where to start:\n\n**TIER 1 — Highest Impact (start here):**\n1. Get lean (12-15% body fat): Reveals jawline, cheekbones, and bone structure. This single change often makes people unrecognizable. Start a caloric deficit + high protein + lifting.\n2. Skincare routine: Cleanser + moisturizer + SPF daily, retinol at night. Healthy skin is the foundation of attractiveness.\n3. Sleep optimization: 7-9 hours on your back. This is when growth hormone repairs everything.\n4. Mewing: Proper tongue posture 24/7. Free, zero downtime, compounds over months and years.\n\n**TIER 2 — Major Impact (add these in weeks 2-4):**\n5. Hairstyle: Get a cut optimized for your face shape. This can change your look overnight.\n6. Eyebrow grooming: Clean up strays, maintain natural shape. Frames the entire face.\n7. Posture correction: Chin tucks, face pulls, wall angels. Forward head posture kills your jawline.\n8. Jawline exercises: Mastic gum 30-45 min daily + chin tucks. Visible masseter growth in 4-8 weeks.\n\n**TIER 3 — Solid Gains (month 2+):**\n9. Teeth whitening (Crest strips are fine)\n10. Fragrance (invest in 1-2 quality scents)\n11. Facial hair optimization (grow strategically or clean shave)\n12. Nutrition: High protein, omega-3s, collagen, reduce sugar/dairy\n13. Supplements: Vitamin D, Zinc, Magnesium, Omega-3\n\n**TIER 4 — Advanced (month 3+):**\n14. Minoxidil for beard or hair if needed\n15. Professional skincare (chemical peels, microneedling)\n16. Neck training (builds jaw-framing neck in 4-8 weeks)\n17. Style and wardrobe optimization\n18. Advanced skincare actives (tretinoin, vitamin C, niacinamide stack)\n\n**Expected timeline:**\n- 2 weeks: Skin starts looking better, initial bloat reduction from diet changes\n- 1 month: Clear skin improvement, initial jawline gains from gum, hairstyle impact\n- 3 months: Significant body fat change, skin transformation, posture improvement visible\n- 6 months: If committed, you will look notably different. People will comment.\n- 12 months: Complete transformation is achievable for most men.\n\nThe secret? Consistency beats intensity. Do a little every single day rather than going hard for a week and quitting. Start with Tier 1 TODAY.`,
      `Alright let's get you on the path. The good news: most guys do NOTHING for their appearance, so even basic effort puts you ahead of the majority. Here's my priority system:\n\n**Quick wins (visible within 1-2 weeks):**\n- Start a basic skincare routine (cleanser, moisturizer, SPF)\n- Get a haircut that actually suits your face shape\n- Groom your eyebrows (just clean up, don't reshape)\n- Drink 3+ liters of water daily\n- Cut alcohol and excess sodium (face bloat disappears fast)\n- Buy a quality fragrance\n\n**Medium-term gains (4-8 weeks):**\n- Start losing body fat (if above 15%) — face changes are the first you'll notice\n- Begin mewing and make it a 24/7 habit\n- Chew mastic gum daily for masseter development\n- Fix forward head posture with chin tucks\n- Add retinol to evening routine\n- Start lifting weights and add neck training\n\n**Long-term transformation (3-12 months):**\n- Reach 12-15% body fat for maximum facial definition\n- Consistent mewing showing bone structure changes (especially under 25)\n- Full skincare routine matured with tretinoin results\n- Body built with proportional neck and traps framing your face\n- Confidence naturally built through visible improvement\n\n**The 80/20 of looksmaxxing (if you do NOTHING else):**\n1. Get lean\n2. Good skin\n3. Good hair\n4. Good posture\n\nThese four things alone account for about 80% of controllable attractiveness. Everything else is optimization on top. Don't get overwhelmed by trying to do everything at once — just start with the fundamentals and add layers.\n\nAnd remember: you're playing a long game. The guys who look best at 30 are the ones who started building habits at 20-22. Every day you start is better than tomorrow.`,
    ],
  },
  {
    keywords: ['routine', 'daily routine', 'schedule', 'morning routine', 'night routine', 'plan', 'daily habit'],
    followUps: ['How much time does this take daily?', 'Minimal effort routine?', 'Weekend vs weekday routine?'],
    responses: [
      `Here's the complete daily looksmaxxing routine broken into time blocks so you can actually stick to it:\n\n**MORNING (15-20 minutes):**\n1. Splash face with cold water or use gentle cleanser (1 min)\n2. Vitamin C serum — 4-5 drops, pat in (30 sec)\n3. Moisturizer with niacinamide (30 sec)\n4. SPF 30-50 sunscreen — generous application (1 min)\n5. Style hair (3-5 min)\n6. Chin tucks: 3 sets of 15 reps (3 min)\n7. Drink 500ml water with electrolytes (30 sec)\n8. Posture check before leaving — shoulders back, chin neutral (10 sec)\n\n**THROUGHOUT THE DAY:**\n- Maintain tongue posture (mewing) — this should be constant\n- Drink water consistently — aim for 3-4L total\n- Chew mastic gum for 30-45 min (during commute, work, etc.)\n- Maintain good posture — set hourly phone reminders if needed\n- Eat clean: high protein, colorful vegetables, healthy fats\n- Phone at eye level (no tech neck)\n- Short walks for blood circulation and stress reduction\n\n**EVENING (15-20 minutes):**\n1. Oil cleanser to remove sunscreen/dirt (1 min)\n2. Regular cleanser second (1 min)\n3. Retinol/tretinoin: pea-sized amount (30 sec) — or alternate nights\n4. Moisturizer (30 sec)\n5. Eye cream if needed (15 sec)\n6. Lip treatment/mask (10 sec)\n7. Neck exercises: curls + extensions, 3x15-20 (5 min) — on training days\n8. Jaw exercises or additional gum chewing (5 min)\n\n**BEFORE BED:**\n- No screens 30 min before sleep\n- Magnesium glycinate 400mg\n- Mouth tape for nasal breathing while sleeping\n- Sleep on your back\n- Room cool (65-68F), completely dark\n- Aim for 7-9 hours\n\n**WEEKLY additions:**\n- Chemical exfoliant (BHA/AHA) 1-2x per week (replace retinol on those nights)\n- Derma rolling (if using for beard or hair)\n- Deep facial massage for lymphatic drainage\n- Progress photos (same angle, same lighting)\n- Trim/maintain eyebrows and facial hair\n\n**Total daily time investment:** 35-45 minutes (morning + evening + exercises)\n\nThat's less than one Netflix episode per day for a completely transformed appearance within 3-6 months. The hardest part is the first 2 weeks of habit formation. After that, it becomes automatic.\n\nStart with JUST the skincare routine for week 1. Add mewing and water in week 2. Add exercises in week 3. Don't try to do everything from day one — build habits gradually.`,
    ],
  },
  {
    keywords: ['analysis', 'result', 'score', 'rating', 'scan', 'face scan', 'my score'],
    followUps: ['How to improve my lowest score?', 'Are face scan scores accurate?', 'What score is considered attractive?'],
    responses: [
      `Let me help you interpret your Androgenic analysis results and turn them into an action plan:\n\n**Understanding the scoring system:**\n- 80-100: Exceptional feature. Maintain what you have — focus improvement efforts elsewhere.\n- 60-79: Above average. Targeted improvements can push you into the excellent range.\n- 40-59: Average. This is where you'll see the most dramatic improvement with consistent effort.\n- Below 40: Needs attention. These are your priority areas — biggest potential for visible change.\n\n**The strategic approach:**\n\nImproving your weakest areas has MORE visual impact than optimizing your strongest. Going from a 40 to a 65 in one area changes how your whole face looks more than going from 75 to 85 in another.\n\nPriority order for improvement:\n1. Jawline score low? Focus on: body fat reduction, mastic gum chewing, mewing, posture\n2. Skin score low? Focus on: consistent skincare routine (cleanser + retinol + SPF), hydration, diet\n3. Symmetry score low? Focus on: back sleeping, even chewing, posture correction\n4. Eye area score low? Focus on: sleep quality, caffeine eye cream, hydration, iron levels\n5. Hair score low? Focus on: hairstyle change, minoxidil if needed, proper hair care\n\n**Important context for scores:**\n- Lighting dramatically affects scans. Natural, even lighting gives the most accurate results.\n- Front cameras distort proportions. Use rear camera at arm's length for accuracy.\n- Take multiple scans and average them for a more reliable baseline.\n- Real attractiveness includes expression, energy, confidence, and style — things no scan captures.\n\n**Tracking progress:**\n- Scan every 2-4 weeks in IDENTICAL conditions (same lighting, angle, distance, time of day)\n- Compare trends over time, not day-to-day fluctuations\n- Take regular photos for visual comparison alongside scores\n- Even 3-5 point improvements in key areas are noticeable in real life\n\nUse your scores as a roadmap, not a sentence. Every metric is improvable with the right approach and consistency.`,
    ],
  },
  {
    keywords: ['collagen', 'collagen supplement', 'collagen production', 'lose collagen', 'collagen boost'],
    followUps: ['Best collagen supplement type?', 'At what age do you lose collagen?', 'Foods that boost collagen'],
    responses: [
      `Collagen is the structural protein that keeps your face looking youthful, firm, and plump. Here's the complete guide:\n\n**Why it matters:**\n- Collagen makes up 75% of your skin's dry weight\n- You lose approximately 1% per year after age 20\n- Loss shows as: wrinkles, sagging, thinner skin, loss of facial volume, and hollow areas\n- UV damage and sugar are the two biggest collagen destroyers (beyond aging)\n\n**Protecting existing collagen:**\n1. SPF daily (UV is the #1 external collagen destroyer)\n2. Avoid sugar/high-glycemic foods (glycation cross-links and stiffens collagen fibers)\n3. Don't smoke (accelerates collagen breakdown dramatically)\n4. Retinol/tretinoin at night (stimulates new collagen production — most proven topical)\n5. Vitamin C serum (essential cofactor for collagen synthesis)\n6. Sleep 7-9 hours (collagen is synthesized during deep sleep via growth hormone)\n7. Manage stress (cortisol literally breaks down collagen)\n\n**Boosting collagen production:**\n\nSupplements:\n- Hydrolyzed collagen peptides (10-15g daily): Multiple studies show improved skin hydration, elasticity, and wrinkle depth at 4-8 weeks. Type I and III are most relevant for skin.\n- Vitamin C (500-1000mg): Required for your body to synthesize collagen\n- Proline-rich foods (bone broth, egg whites, gelatin)\n- Copper supplement (1-2mg) or copper-rich foods: Cofactor in collagen cross-linking\n\nTopical:\n- Retinol/tretinoin: Gold standard for stimulating fibroblasts to produce new collagen\n- Vitamin C serum: Boosts collagen synthesis when applied topically\n- Peptides (Matrixyl, copper peptides): Signal skin to produce collagen\n- Microneedling: Creates controlled wounds that trigger collagen remodeling during healing\n\nDiet:\n- Bone broth (homemade or quality brand): Natural collagen + supporting minerals\n- Fatty fish (omega-3s protect existing collagen from inflammatory breakdown)\n- Dark leafy greens (vitamin C + antioxidants)\n- Citrus fruits and berries (vitamin C for synthesis)\n- Eggs (proline and glycine — building blocks)\n\n**The stack for maximum collagen support:**\nMorning: Vitamin C serum topically + oral vitamin C + collagen peptides in coffee\nEvening: Retinol/tretinoin topically\nDaily: SPF, avoid sugar, sleep well\n\nThis combination of protecting + stimulating + supplementing gives you the best shot at maintaining youthful, firm facial skin long-term.`,
    ],
  },
  {
    keywords: ['facial exercise', 'face exercise', 'face yoga', 'facial muscle', 'facial workout'],
    followUps: ['Do facial exercises actually work?', 'Best face exercises for jawline?', 'Can face exercises cause wrinkles?'],
    responses: [
      `Facial exercises are controversial in the aesthetics community. Let me give you the balanced take on what works and what doesn't:\n\n**What the research says:**\n- A Northwestern University study showed participants who did 30 min of facial exercises daily for 20 weeks looked approximately 3 years younger (rated by dermatologists)\n- The mechanism: building facial muscle volume creates fuller cheeks and more defined features\n- However: some exercises may theoretically increase wrinkle formation by repeatedly creasing skin\n\n**Exercises that ARE worth doing (low wrinkle risk, proven benefit):**\n\n1. Masseter/Jaw:\n- Mastic gum chewing: 30-45 min daily. THE most proven facial exercise. Builds visible jaw width.\n- Jaw clench and hold: 5 seconds, 20 reps. Isometric masseter training.\n- Resistance jaw opening: Press fist under chin, open mouth against resistance. 3x15.\n\n2. Neck/Submental:\n- Chin tucks: Absolutely essential. 3x15-20 daily.\n- Neck curls/extensions: With weight for resistance. 3x15-25.\n- Tongue press: Press tongue hard to palate while tilting head back. Hold 10 sec, 10 reps.\n\n3. Cheek area:\n- Fish face holds: Suck cheeks in, hold 10 seconds, 15 reps\n- Cheek puffs: Fill cheeks with air, transfer air side to side. 30 reps.\n\n4. Eye area (GENTLE — this skin is thin):\n- Squint and hold: Gentle lower lid squeeze. 10 sec, 10 reps. Strengthens orbicularis oculi.\n\n**Exercises to AVOID:**\n- Exaggerated forehead raising (creates forehead wrinkles)\n- Extreme smile holds (deepens nasolabial folds over time)\n- Any exercise that creates deep skin creases repeatedly\n\n**The verdict:**\nThe best facial exercises are the ones that target MUSCLE MASS (jaw, neck) rather than trying to "tone" or "lift" with expressions. Gum chewing, chin tucks, and neck training have real, visible, proven results. The expression-based "face yoga" movements are more debatable.\n\n**Time investment:** 10-15 minutes daily for the recommended exercises above. Focus on jaw, neck, and submental area. These create structural changes that actually show.`,
    ],
  },
  {
    keywords: ['cold exposure', 'cold shower', 'ice face', 'cold therapy', 'ice bath'],
    followUps: ['How does cold exposure help skin?', 'Cold shower routine for beginners?', 'Ice rolling benefits?'],
    responses: [
      `Cold exposure is an underrated tool for facial aesthetics. Here's what it actually does and how to use it:\n\n**Benefits for your face and skin:**\n- Reduces facial puffiness and inflammation (cold constricts blood vessels, pushes out excess fluid)\n- Tightens pores temporarily and reduces oiliness\n- Increases blood circulation (after initial constriction, blood rushes back with nutrients)\n- Norepinephrine boost (2-3x increase from cold water) improves mood, energy, and skin appearance\n- Reduces under-eye bags and puffiness rapidly\n- May support collagen by improving circulation and reducing inflammatory damage\n- Gives skin a "flushed but healthy" appearance\n\n**Cold shower protocol:**\n- Start with your normal warm shower for washing\n- End with 30-60 seconds of cold water (as cold as it goes)\n- Build up to 2-3 minutes over several weeks\n- Focus the cold on your face and neck for facial benefits\n- BEST done in the morning (norepinephrine boost energizes you for the day)\n\n**Ice face method (targeted):**\n- Fill a bowl with ice water\n- Submerge face for 15-30 seconds. Come up to breathe. Repeat 3-5 times.\n- OR: Use ice cubes wrapped in thin cloth, massage over face for 2-3 minutes\n- OR: Keep a jade/metal roller in the freezer, roll over face each morning\n- Do this AFTER cleansing and BEFORE applying serums (cold helps products absorb)\n\n**Ice rolling routine:**\n- Forehead: Roll outward from center to hairline\n- Under-eyes: Roll from inner corner toward temple (reduces puffiness and dark circles)\n- Cheeks: Roll downward toward jaw (lymphatic drainage direction)\n- Jaw and neck: Roll downward toward collarbone\n- Total time: 3-5 minutes\n\n**When it helps most:**\n- Morning facial puffiness (especially after salty food or alcohol the night before)\n- Before photos or events (instant puffiness reduction)\n- After workouts (reduces facial redness faster)\n- As part of AM skincare routine (pore tightening before makeup/SPF)\n\n**The science:**\nCold exposure triggers the "hunting response" — initial vasoconstriction followed by vasodilation. This pumps nutrient-rich blood to the skin's surface, improving cellular health and giving that fresh, glowing appearance.\n\nMinimal time investment (2-3 min in the morning), zero cost, and noticeable same-day results. Hard to beat that ROI.`,
    ],
  },
  {
    keywords: ['fragrance', 'cologne', 'perfume', 'smell', 'scent', 'aftershave'],
    followUps: ['Best colognes for men?', 'How to apply fragrance properly?', 'Does scent affect attractiveness?'],
    responses: [
      `Fragrance is an overlooked dimension of attractiveness. Scent bypasses conscious thought and triggers emotional responses directly. Here's how to optimize:\n\n**Why it matters:**\n- Multiple studies show that pleasant scent increases perceived attractiveness by 1-2 points on average\n- Scent is the sense most strongly linked to memory and emotion\n- Women consistently rank "smell" in the top 3 most important physical attraction factors\n- A signature scent becomes part of your identity — people associate it with you\n\n**How to apply correctly:**\n- Pulse points: Sides of neck, inner wrists, behind ears (these areas radiate heat and project scent)\n- 2-3 sprays maximum for daily wear (others should only smell it within arm's reach)\n- Don't rub wrists together (breaks down fragrance molecules)\n- Apply to skin, not clothes (body heat helps scent develop)\n- Apply after showering when skin is warm and slightly moist\n- Moisturized skin holds fragrance longer\n\n**Types and when to wear:**\n- Fresh/citrus/aquatic: Daytime, office, casual. Clean and inoffensive.\n- Woody/aromatic: All-rounder, slightly more mature and masculine.\n- Spicy/oriental: Evening, dates, winter. Heavier and more sensual.\n- Don't wear heavy fragrances in the heat or enclosed spaces.\n\n**Building a basic collection:**\n\nStarter recommendations:\n- Budget daily: Nautica Voyage, Versace Pour Homme\n- Versatile all-rounder: Bleu de Chanel, Dior Sauvage, YSL Y EDP\n- Date/evening: Valentino Uomo Intense, Tom Ford Tobacco Vanille, JPG Ultra Male\n- Summer/fresh: Acqua di Gio Profondo, Dolce & Gabbana Light Blue Intense\n- Unique/signature: Le Labo Santal 33, Creed Aventus, MFK Baccarat Rouge 540\n\n**Pro tips:**\n- Don't judge a fragrance in the store. Spray it on skin and evaluate after 2-4 hours (dry down is where the magic happens).\n- Skin chemistry matters — the same fragrance smells different on different people. Sample before buying.\n- Longevity varies: EDP (eau de parfum) lasts 6-8+ hours. EDT (eau de toilette) lasts 4-6 hours.\n- Store fragrances in a cool, dark place (not your bathroom — heat and humidity degrade them).\n\nThis is genuinely one of the easiest and most immediate attractiveness boosts. One good fragrance that suits you will get compliments from day one.`,
    ],
  },
  {
    keywords: ['style', 'fashion', 'clothes', 'wardrobe', 'outfit', 'dress better', 'clothing'],
    followUps: ['How should I dress for my body type?', 'Essential wardrobe pieces?', 'How does clothing affect attractiveness?'],
    responses: [
      `Style and clothing directly impact how attractive you're perceived to be — and unlike bone structure, it's 100% within your control immediately. Here's the framework:\n\n**Why it matters for facial aesthetics specifically:**\n- Proper fitting clothes frame your body proportionally, making your face/head look more proportional too\n- Neckline and collar choice affects how your jawline and neck appear\n- Colors near your face affect skin tone perception\n- Well-dressed = perceived as more attractive even with the same face (halo effect)\n\n**The essentials every man needs:**\n- Well-fitted dark jeans (no baggy, no skinny — slim straight or tapered)\n- Solid color t-shirts that fit perfectly (shoulders seam at shoulder point, slight chest fit)\n- A quality leather jacket or denim jacket (instantly elevates any outfit)\n- Clean white sneakers (AF1s, Common Projects, or Vejas)\n- A well-fitted button-down (oxford cloth or linen)\n- Dark chinos\n- One quality pair of boots (Chelsea or minimal leather)\n\n**Fit is EVERYTHING:**\n- Too baggy = sloppy, hides physique, makes you look shapeless\n- Too tight = try-hard, unflattering on most body types\n- Ideal: Follows body contour without pulling. Shows shoulder width, hints at arm/chest size without being skin-tight\n- Get 2-3 key pieces tailored. A $20 alteration makes a $50 shirt look like $200.\n\n**Colors that enhance your appearance:**\n- Dark colors (black, navy, dark gray): Slimming, sophisticated, universally flattering\n- White: Clean, shows confidence, contrasts well with tan/healthy skin\n- Earth tones (olive, burgundy, camel): Rich and masculine\n- Avoid: Neon, overly busy patterns, graphic tees with big logos (after age 20)\n\n**Style "levels" to progress through:**\n1. Basic (start here): Everything fits well, clean and simple. No loud pieces.\n2. Intermediate: Understanding color coordination, layering, accessorizing\n3. Advanced: Developing a personal style identity, statement pieces, understanding proportions\n\n**Quick upgrades that cost almost nothing:**\n- Tuck in your shirt sometimes (defines waist, looks more intentional)\n- Cuff your jeans or chinos slightly (shows your shoes, adds detail)\n- Add one accessory: quality watch, simple chain, or good sunglasses\n- Iron or steam your clothes (wrinkled clothes = instant downgrade)\n- White t-shirt + dark jeans + clean sneakers is an effortlessly attractive default\n\nDon't overcomplicate it. 80% of looking well-dressed is simply wearing clothes that FIT properly in neutral, flattering colors. Start there and evolve.`,
    ],
  },
  {
    keywords: ['minoxidil', 'rogaine', 'minox', 'topical minoxidil'],
    followUps: ['Minoxidil side effects?', 'How long until minoxidil works?', 'Liquid vs foam minoxidil?'],
    responses: [
      `Minoxidil is the most accessible and proven treatment for both hair loss and beard growth. Here's the complete breakdown:\n\n**What it does:**\n- Increases blood flow to hair follicles\n- Extends the growth phase (anagen) of hair\n- Converts thin vellus hairs into thick terminal hairs\n- Originally a blood pressure medication — hair growth was a "side effect"\n\n**For scalp hair loss:**\n- Apply 5% minoxidil (liquid or foam) to affected areas twice daily\n- Foam: Less irritation, dries faster, no propylene glycol\n- Liquid: Better coverage, slightly cheaper, contains propylene glycol (can irritate)\n- Results: Noticeable at 3-4 months, full results at 6-12 months\n- Must continue indefinitely — stopping reverses gains over 3-6 months\n- Pairs synergistically with microneedling (1.5mm derma pen, weekly)\n\n**For beard growth:**\n- Apply 5% foam or liquid to cheek/jaw/chin area 1-2x daily\n- Works even if you've never had facial hair in those areas\n- Timeline: Vellus (thin, light) hairs appear at 2-3 months. Terminal (thick, dark) hairs at 6-12 months\n- After ~2 years of consistent use, gains become PERMANENT (hairs fully mature and self-sustaining)\n- Apply to clean, dry skin. Moisturize 2-4 hours after application.\n- Pair with 0.5mm derma roller 1-2x per week for enhanced absorption (don't apply minox same day you roll)\n\n**Side effects (realistic):**\n- Initial shedding phase (weeks 2-6): Weak hairs fall out before stronger ones grow. This is NORMAL and good.\n- Dry/flaky skin at application site (moisturize well)\n- Slightly increased body hair (forearm hair might get thicker — minor)\n- Rarely: Heart palpitations, dizziness (if systemically absorbed — extremely uncommon with topical)\n- For beard: Some facial bloating in first few weeks (water retention — temporary)\n\n**Tips for success:**\n- Consistency is everything. Missing days significantly slows progress.\n- Apply to CLEAN skin (oils and dirt block absorption)\n- Don't wash off for at least 4 hours after applying\n- Take photos monthly from the same angle to track progress\n- Give it at LEAST 6 months before judging effectiveness\n- Keep expectations realistic: it works for ~60-70% of people for hair loss, higher success rate for beard growth\n\n**Budget:** Generic minoxidil 5% (Kirkland brand from Costco) is identical to brand-name Rogaine at 1/4 the price. Same active ingredient, same results.`,
    ],
  },
  {
    keywords: ['microneedling', 'derma roller', 'derma pen', 'micro needling', 'needle'],
    followUps: ['Is microneedling safe at home?', 'Best needle depth for face?', 'How often to microneedle?'],
    responses: [
      `Microneedling is one of the most effective at-home treatments for both skin improvement and hair growth. Here's the complete guide:\n\n**What it does:**\n- Creates controlled micro-injuries in the skin\n- Triggers wound healing response: collagen production increases up to 400%\n- Improves absorption of topical products (minoxidil, serums)\n- Breaks down scar tissue and stimulates remodeling\n\n**For SKIN (acne scars, texture, anti-aging):**\n\nDepth: 0.5-1.0mm for at-home use on face\n- 0.25mm: Product absorption only (minimal collagen benefit)\n- 0.5mm: Mild collagen induction, texture improvement, product absorption\n- 1.0mm: Significant collagen production, scar treatment. Max depth for at-home safety.\n- 1.5-2.5mm: Professional only. For deep scars and significant remodeling.\n\nProtocol:\n- Once every 2-4 weeks (skin needs time to complete healing and collagen remodeling)\n- Clean device thoroughly before use (isopropyl alcohol soak)\n- Clean face thoroughly. No actives beforehand.\n- Apply numbing cream 30 min prior if using 1.0mm+ (optional but recommended)\n- Glide device in different directions: vertical, horizontal, diagonal\n- Stop when skin is evenly red (pinpoint bleeding at 1.0mm is normal)\n- After: Apply hyaluronic acid serum. NO retinol, vitamin C, or exfoliants for 24-48 hours.\n- SPF religious for the next week (skin is more vulnerable)\n\n**For HAIR GROWTH (scalp or beard):**\n\nDepth: 1.0-1.5mm\n- Weekly sessions on affected areas\n- Boosts minoxidil effectiveness by 4x (proven in studies)\n- Apply minoxidil 24 hours AFTER needling (not same day to avoid systemic absorption through open channels)\n- Or apply minoxidil on non-needling days\n\n**Derma roller vs derma pen:**\n- Roller: Cheaper, fine for large flat areas (scalp, cheeks). Needles enter at angle.\n- Pen (Dr. Pen, etc): Better for precision areas. Needles enter vertically (less trauma, more effective). Worth the investment.\n\n**Safety rules:**\n- NEVER share your device\n- Replace roller needles every 3-4 uses (they dull and cause more damage)\n- Don't microneedle over active acne, infections, or irritated skin\n- Don't use retinol or strong acids for 48 hours before or after\n- If you have darker skin, use lower depths to reduce hyperpigmentation risk\n\n**Expected results:**\n- Texture improvement: Visible at 4-6 weeks (after 2-3 sessions)\n- Acne scar improvement: 3-6 months of monthly sessions for significant change\n- Hair growth: Noticeable at 8-12 weeks when paired with minoxidil`,
    ],
  },
  {
    keywords: ['under eye', 'eye cream', 'eye bag', 'hollow eye', 'sunken eye', 'tired look'],
    followUps: ['Best eye cream for men?', 'How to reduce morning eye puffiness?', 'Are under-eye fillers safe?'],
    responses: [
      `The under-eye area is one of the most delicate and visible zones on your face. Here's a targeted protocol:\n\n**Causes of under-eye issues:**\n- Dark circles: Genetics (thin skin), sleep deprivation, allergies, dehydration, iron/B12 deficiency, aging\n- Puffiness/bags: Fluid retention (salt, alcohol), sleeping face-down, allergies, genetics, aging\n- Hollowness: Volume loss from aging, extreme leanness, or genetics\n- Tired look: Usually a combination of darkness + puffiness + dehydration\n\n**Daily protocol for better under-eyes:**\n\nMorning:\n1. Cold compress or chilled metal eye roller — 2-3 minutes (constricts blood vessels, reduces puffiness)\n2. Caffeine eye serum: The Ordinary Caffeine Solution 5% + EGCG (shrinks blood vessels, reduces darkness immediately)\n3. Lightweight eye cream: CeraVe Eye Repair Cream or Neutrogena Hydro Boost Eye\n4. Pat SPF carefully around eye area (UV worsens darkness and thinning)\n\nEvening:\n1. Gentle retinol eye cream (The Ordinary Retinol 0.2% in Squalane — just around orbital bone): Builds collagen, thickens delicate skin over time\n2. Peptide eye cream (The Inkey List Peptide Eye Cream): Supports structural proteins\n\n**Lifestyle fixes (these matter most):**\n- Sleep 7-9 hours consistently ON YOUR BACK\n- Elevate head slightly while sleeping (prevents fluid pooling)\n- Reduce sodium to under 2000mg (salt = under-eye water retention)\n- Eliminate or minimize alcohol (dehydrates + causes puffiness simultaneously)\n- Stay hydrated (3+ liters daily)\n- Check iron and B12 levels (common deficiency causing dark circles in men)\n- Address allergies if you have them (chronic histamine response = chronic under-eye swelling)\n\n**Advanced options:**\n- Under-eye filler (hyaluronic acid): Fills hollows/tear troughs instantly. Lasts 12-18 months. Very effective for genetic hollowness. $500-$1000. Go to an experienced injector — this is a technically demanding area.\n- PRP under-eye treatment: Platelet-rich plasma injected to improve skin quality and darkness. Series of 3.\n- Laser treatment: For severe pigmentation issues\n\n**Quick fix for important events:**\n- Ice cubes in cloth for 3-5 minutes\n- Hemorrhoid cream (yes, really — it constricts blood vessels temporarily. Use sparingly and not long-term)\n- Caffeine eye patches (leave on 15-20 min)\n- Color corrector (peach/orange tone neutralizes blue/purple darkness — invisible when applied correctly)\n\nConsistency wins here. The under-eye area responds to daily care better than occasional intensive treatment.`,
    ],
  },
  {
    keywords: ['forehead', 'forehead wrinkle', 'frown line', 'forehead line', 'big forehead'],
    followUps: ['How to reduce forehead wrinkles?', 'Hairstyles for big forehead?', 'Does botox work for forehead?'],
    responses: [
      `The forehead is a significant part of your facial canvas. Here's how to optimize it:\n\n**For forehead wrinkles/lines:**\n\nPrevention (start now regardless of age):\n- Retinol/tretinoin at night: Builds collagen and reduces existing fine lines\n- SPF daily: UV is the primary cause of premature forehead wrinkles\n- Stop raising your eyebrows habitually (many people do this unconsciously)\n- Wear sunglasses outdoors (prevents squinting which contributes to forehead tension)\n\nTreatment:\n- Retinol (6+ months of consistent use shows visible line reduction)\n- Botox/Dysport: The most effective treatment for forehead lines. Relaxes the frontalis muscle so it can't create wrinkles. $200-$400, lasts 3-4 months. Very common for men.\n- Microneedling: Monthly sessions stimulate collagen in the forehead area\n- Peptide serums (Argireline/acetyl hexapeptide-3): Nicknamed "Botox in a bottle" — mild but helps\n\n**For large/high forehead:**\n- Hairstyle is your best tool:\n  - Fringe/bangs (textured crop, French crop): Covers forehead partially, reduces visual proportion\n  - Side-swept styles with some hair falling on the forehead\n  - Avoid slicked-back styles or shaved sides that expose the full forehead\n- Proportion is what matters — if your forehead matches your other facial thirds, it's fine regardless of size\n\n**Facial proportions context:**\nThe "rule of thirds" says your face should divide roughly equally: hairline to brow, brow to nose tip, nose to chin. If your upper third (forehead) is disproportionately large:\n- Hairstyle adjustments (fringe)\n- Growing facial hair can lengthen the lower third as visual balance\n- Mewing can slightly improve midface/lower third projection, balancing proportions\n\n**Forehead texture/skin:**\n- The forehead is often the oiliest zone. Use BHA (salicylic acid) if you get forehead breakouts.\n- Don't skip this area when applying retinol and sunscreen\n- Hats with brims protect this area from sun damage during outdoor activities\n\nDon't obsess over forehead size — hair covers most concerns, and well-maintained skin (no wrinkles, even tone) matters more than exact proportions.`,
    ],
  },
  {
    keywords: ['body language', 'presence', 'charisma', 'aura', 'energy', 'vibe', 'masculine energy'],
    followUps: ['How to have more presence?', 'Body language tips for men?', 'How to seem more confident?'],
    responses: [
      `Body language and presence can make or break how attractive people find you, regardless of physical features. Here's the framework:\n\n**The fundamentals of masculine presence:**\n\n1. Space ownership:\n- Take up space. Feet shoulder-width apart, shoulders back and down, arms uncrossed.\n- Don't minimize yourself. Crossed arms, hunched shoulders, closed-off posture signals insecurity.\n- Move deliberately. Slow, purposeful movements read as confident. Rushed, fidgety movements read as nervous.\n\n2. Eye contact:\n- Maintain eye contact for 3-5 seconds before naturally breaking (sideways, never down)\n- During conversation: 60-70% eye contact is the sweet spot\n- Looking down = submission. Looking to the side = thinking/casual. Looking up = recall.\n- "Triangle gaze" for attraction: eyes > mouth > eyes\n\n3. Voice:\n- Speak at 70% of your natural speed. Slower = more dominant and confident.\n- Project from your chest/diaphragm, not your throat\n- Pause before responding (shows you're considering, not reacting)\n- Deep breathing naturally lowers vocal pitch\n- Good posture and neck training actually improve voice resonance\n\n4. Facial expression:\n- Neutral resting face should be relaxed, not tense. Relax your jaw and forehead.\n- Slight smile (micro-smile) is universally perceived as warm and confident\n- Don't be expressionless (robotic) or over-animated (try-hard)\n\n**Advanced presence techniques:**\n- Enter rooms with purpose — shoulders back, head up, brief scan of the room\n- When seated, lean back slightly (takes up space, signals comfort/dominance)\n- Gesture when speaking — expansive gestures signal confidence\n- Touch your own face/neck less (self-soothing signals = nervous tells)\n- Nod slightly when someone speaks to you (shows active listening)\n\n**The internal game:**\n- Presence comes from being comfortable in your own skin. External techniques only work if you're not anxious internally.\n- Physical self-improvement (looking better) naturally increases genuine comfort\n- Meditation/breathing practices reduce the anxiety that sabotages body language\n- Competence in any area of life transfers to general confidence\n\n**What others notice first (in order):**\n1. Posture (before you even open your mouth)\n2. Eye contact and facial expression\n3. How you move (speed, deliberateness)\n4. Voice quality and speaking pace\n5. Grooming and overall appearance\n\nThe good news: these are all SKILLS that improve with conscious practice. Record yourself on video having a conversation. Watch it. You'll immediately see what needs work. Most people have never actually observed their own body language.`,
    ],
  },
  {
    keywords: ['aging', 'look younger', 'anti-aging', 'youthful', 'old looking', 'age well'],
    followUps: ['Best anti-aging routine for men?', 'At what age should I start anti-aging?', 'How to age gracefully?'],
    responses: [
      `Looking younger than your age is achievable with the right approach. Here's the complete anti-aging playbook for men:\n\n**The biggest aging accelerators (avoid these):**\n1. UV exposure without SPF (causes 80-90% of visible aging — wrinkles, spots, sagging)\n2. Smoking (accelerates aging by 10+ years)\n3. Excessive alcohol (dehydrates, inflames, damages liver which shows on face)\n4. Poor sleep (prevents repair, increases cortisol, accelerates collagen breakdown)\n5. High sugar diet (glycation literally stiffens and damages collagen permanently)\n6. Chronic stress (cortisol breaks down skin structure)\n\n**The anti-aging protocol (by priority):**\n\nNon-negotiable foundation:\n- SPF 30-50 daily (prevents future damage)\n- Tretinoin 0.025-0.05% nightly (the only topical PROVEN to reverse aging signs)\n- 7-9 hours sleep on your back\n- No smoking, minimal alcohol\n\nStrong additions:\n- Vitamin C serum (AM): Antioxidant protection + collagen synthesis\n- Collagen peptides (10-15g daily): Improves skin elasticity and hydration\n- Hydration (3-4L water daily): Plump, youthful-looking skin\n- Regular exercise: Improves blood flow, reduces stress, maintains muscle (which keeps face looking full)\n\nAdvanced:\n- Microneedling monthly (stimulates collagen remodeling)\n- Peptide serums (copper peptides, Matrixyl)\n- Niacinamide (strengthens skin barrier, prevents texture changes)\n- Growth factors or EGF serums\n\n**Age-specific priorities:**\n\n20s: Prevention is everything\n- Basic skincare + SPF + tretinoin (starting now gives you a MASSIVE advantage)\n- Good habits: sleep, hydration, no smoking\n- You won't see aging yet, but what you do now determines how you look at 35+\n\n30s: Active prevention + early treatment\n- Retinol/tretinoin becomes essential (collagen loss is accelerating)\n- Add antioxidants (vitamin C), peptides\n- Maintain body composition (metabolism slowing)\n- Consider Botox for early forehead/frown lines\n\n40s+: Treatment + maintenance\n- Full active skincare stack\n- Professional treatments (peels, lasers, microneedling)\n- Potentially fillers for volume loss\n- Fitness is crucial (muscle loss accelerates, affects facial fullness)\n\n**The men who age best share these traits:**\n- They started SPF and skincare early\n- They maintain low body fat and muscle mass\n- They don't smoke or drink excessively\n- They sleep well and manage stress\n- They have consistent skincare routines\n\nThe best time to start anti-aging was 5 years ago. The second best time is today.`,
    ],
  },
  {
    keywords: ['progress', 'track', 'how long', 'timeline', 'result', 'patience', 'no result'],
    followUps: ['Why am I not seeing results?', 'How to stay motivated?', 'Best way to track face changes'],
    responses: [
      `Let's talk about realistic timelines and how to track progress properly — because unrealistic expectations are the #1 reason guys quit:\n\n**Realistic timelines for visible change:**\n\nFast results (1-4 weeks):\n- Reduced facial bloat from cutting sodium/alcohol/carbs: 3-7 days\n- Improved skin hydration from proper moisturizing + water: 1-2 weeks\n- Hair improvement from better products/style: Immediate\n- Better posture (looks different immediately, becomes natural in 4-8 weeks)\n- Grooming improvements: Same day\n\nMedium results (1-3 months):\n- Skincare routine improvements visible: 4-8 weeks\n- Masseter growth from gum chewing: 4-8 weeks\n- Noticeable fat loss in face: 4-8 weeks (depending on starting point)\n- Neck training visible growth: 4-6 weeks\n- Under-eye improvement: 4-8 weeks\n\nLong results (3-12 months):\n- Significant body fat reduction transforming face: 3-6 months\n- Tretinoin full effects: 6-12 months\n- Mewing bone changes: 6-24 months (more if older)\n- Minoxidil (beard or hair): 6-12 months for full results\n- Major postural correction: 3-6 months to be natural\n\n**How to properly track progress:**\n\n1. Take photos every 2-4 weeks:\n   - Same lighting (natural, window light from the front)\n   - Same angle (straight-on and profile)\n   - Same distance (arm's length, rear camera)\n   - Same time of day (morning is most consistent)\n   - Neutral expression\n   \n2. Use your Androgenic scans monthly (same conditions each time)\n\n3. Measure what you can:\n   - Body weight + body fat percentage weekly\n   - Neck circumference (if training neck)\n   - Photos of beard coverage (if using minoxidil)\n\n**Why you might not see results:**\n- Looking in the mirror daily makes changes invisible (you adapt). Only photos over time show progress.\n- Inconsistency: Missing days adds up. 80% compliance gives maybe 40% of potential results.\n- Impatience: Most people quit at week 3-4, right before results become visible.\n- Wrong priorities: Doing 10 things at 20% effort each. Better to do 3 things at 100%.\n\n**Staying motivated:**\n- Take "before" photos NOW that you'll be glad you have in 6 months\n- Focus on the process and daily habits, not the outcome\n- Celebrate small wins (clearer skin, fitting into smaller jeans, posture feeling natural)\n- Remember: you're already ahead of 80% of men just by putting in consistent effort\n\nTrust the process. The compound effect of daily small actions creates massive transformation over months.`,
    ],
  },
  {
    keywords: ['water retention', 'puffy face', 'bloated face', 'moon face', 'facial swelling'],
    followUps: ['How to reduce face bloat fast?', 'Why is my face puffy in the morning?', 'Foods that cause face bloat'],
    responses: [
      `Facial bloating and water retention can make you look 10-15 lbs heavier than you actually are and completely obscure your bone structure. Here's how to fix it:\n\n**Why your face is bloated:**\n\nCommon causes:\n- High sodium intake (processed foods, restaurant food, soy sauce, etc.)\n- Alcohol (even 1-2 drinks causes noticeable next-day face puffiness)\n- Dehydration (your body RETAINS water when dehydrated — counterintuitive)\n- High carb meals (each gram of glycogen stored holds 3g of water)\n- Poor sleep (cortisol spike increases water retention)\n- Sleeping face-down (gravity pulls fluid to face)\n- Allergies or food intolerances\n- Hormonal fluctuations\n- Stress (cortisol increases aldosterone which retains water)\n\n**The rapid de-bloat protocol (visible within 24-48 hours):**\n\n1. Reduce sodium to under 1500mg for 2-3 days (read ALL labels — sodium hides everywhere)\n2. Drink 4+ liters of water (flushes excess sodium and signals body to release held water)\n3. Zero alcohol\n4. Reduce carbs temporarily to under 100g (depletes glycogen water stores)\n5. Sweat: Sauna, hot bath, or cardio (excretes sodium through sweat)\n6. Sleep elevated and on your back\n7. Cold compress on face for 5 minutes each morning (pushes fluid out of tissues)\n8. Dandelion tea or natural diuretic foods (asparagus, cucumber, celery)\n\n**Long-term solution (keeping a lean face):**\n- Keep daily sodium at 2000-2500mg (most men eat 3500-5000mg daily without realizing)\n- Stay consistently hydrated (3-4L daily — makes your body stop hoarding water)\n- Limit alcohol to special occasions (even moderate regular drinking keeps face puffy)\n- Prioritize potassium-rich foods (bananas, potatoes, avocados) — potassium balances sodium\n- Sleep 7-9 hours consistently (reduces cortisol-driven retention)\n- Manage stress (high cortisol = chronic facial bloating)\n- Address any food intolerances (dairy and gluten are common culprits for facial inflammation)\n\n**Morning routine for puffy face:**\n1. Ice water face bath or ice roller (3-5 min)\n2. Lymphatic drainage massage: Press from center of face outward, then downward along jaw to neck. 2 minutes.\n3. Caffeine eye serum for under-eye puffiness\n4. Drink 500ml water with lemon immediately\n\n**Timeframe:**\n- Acute bloat (from last night's pizza and beer): Resolves in 24-48 hours with the protocol above\n- Chronic puffiness: 1-2 weeks of consistent low sodium, high water, no alcohol to see full de-bloated face\n\nMany guys think they have a "round face" when they actually have great bone structure hidden under chronic bloat. Try a strict 2-week de-bloat and you might be shocked.`,
    ],
  },
  {
    keywords: ['face shape', 'oval face', 'round face', 'square face', 'oblong face', 'diamond face', 'heart face'],
    followUps: ['How to determine my face shape?', 'Best hairstyle for my face shape?', 'Can I change my face shape?'],
    responses: [
      `Understanding your face shape is key to optimizing hairstyle, facial hair, and knowing which features to enhance. Here's the guide:\n\n**How to determine your face shape:**\n\nMeasure or visually assess:\n1. Forehead width (widest point above brows)\n2. Cheekbone width (widest point across face)\n3. Jawline width (widest point of jaw)\n4. Face length (hairline to chin)\n\n**The shapes:**\n\nOval: Length > width, cheekbones widest, jaw and forehead roughly equal\n- Considered the most versatile. Most hairstyles work.\n- Enhancement: You're already proportional. Focus on feature quality (skin, definition)\n\nRound: Cheekbones and face length roughly equal, soft jaw angles\n- Goal: Add angles and length\n- Hair: Height on top, short sides. Pompadour, textured quiff, high fade\n- Facial hair: Angular beard, longer on chin, shorter sides\n- Get lean to reveal underlying bone structure\n\nSquare: Forehead, cheekbones, and jaw all similar width, strong jaw angle\n- This is the masculine ideal. Own it.\n- Hair: Almost anything. Short sides, medium top works great.\n- Facial hair: Light stubble to show off the jaw, or neat short beard\n\nOblong/Rectangle: Face significantly longer than wide\n- Goal: Add width, reduce length\n- Hair: Side parts, fringes, avoid height on top. Medium length on sides.\n- Facial hair: Fuller beard on sides to add width. Avoid long goatees.\n\nDiamond: Cheekbones widest, narrower forehead and jaw\n- Goal: Balance with wider forehead/jaw appearance\n- Hair: Side-swept fringe, volume at temples. Medium length.\n- Facial hair: Wider style to fill out the jaw\n\nHeart/Triangle: Wider forehead, narrow chin\n- Goal: Add width to lower face\n- Hair: Medium length, side parts, avoid excessive height\n- Facial hair: Crucial — adds width and strength to lower face. Full beard recommended.\n\n**Can you change your face shape?**\n- Body fat loss: Makes round faces look more angular (huge impact)\n- Masseter development: Widens lower face (round > more square appearance)\n- Mewing: Forward growth can change proportions over time\n- Posture: Affects how jaw appears relative to the rest\n- Hairstyle: Visual illusion of different proportions (most impactful short-term tool)\n\n**Pro tip:** Take a photo, trace the outline of your face, and compare to the shapes above. Most people are a blend of two shapes (e.g., "oval-square" or "round-diamond"). Optimize for whichever is dominant.`,
    ],
  },
  {
    keywords: ['scar', 'surgical scar', 'wound', 'healing', 'cut'],
    followUps: ['How to minimize scarring?', 'Best scar treatment products?', 'Does silicone really help scars?'],
    responses: [
      `Scar management is about intervention at the right time. Here's what actually works:\n\n**For fresh wounds/new scars (0-3 months):**\n- Keep it moist. Petroleum jelly (Vaseline) or Aquaphor on the wound 24/7 under a bandage.\n- DO NOT let it dry out or form a scab if possible (moist wounds heal better and scar less)\n- Sunscreen religiously once skin is closed — UV turns scars permanently darker\n- Silicone sheets or gel once wound is fully closed: ScarAway or Mederma silicone sheets. Wear 12+ hours daily.\n- Massage the scar gently once healed (2-3 weeks post): Breaks up adhesions and flattens.\n\n**For older scars (3+ months):**\n- Silicone sheets (still effective for scars up to 2 years old)\n- Microneedling: 1.0-1.5mm depth over the scar monthly. Stimulates collagen remodeling to fill and flatten.\n- Retinol/tretinoin: Speeds skin turnover and remodeling over the scar tissue\n- Vitamin C serum: If the scar is hyperpigmented (dark)\n- Professional options: Fractional CO2 laser, TCA peels, cortisone injections (for raised scars)\n\n**Types of scars and specific treatments:**\n- Flat but dark (hyperpigmented): Vitamin C, alpha arbutin, azelaic acid + SPF. Fades in 3-12 months.\n- Raised/hypertrophic: Silicone sheets + massage. Cortisone injections from dermatologist.\n- Keloid (raised beyond wound borders): Requires dermatologist. Cortisone injections, pressure garments, or excision.\n- Indented/atrophic: Microneedling, subcision, filler, or laser resurfacing.\n\n**Prevention (if you know a wound is coming — surgery, etc.):**\n- Ask surgeon about scar placement along relaxed skin tension lines\n- Start silicone sheets immediately after suture removal\n- Avoid stretching the area for 6-8 weeks (tension = wider scars)\n- No sun exposure on the area for 6-12 months\n- Consider paper tape strips for 3 months post-surgery (maintains closure without tension)\n\n**Key principles:**\n- Early intervention gets the best results. Start treatment as soon as the wound is closed.\n- Scars continue remodeling for up to 2 years. Don't give up after a month.\n- SPF on scars is non-negotiable — a tan scar becomes permanent.\n- Consistency with silicone/massage matters more than intensity.\n\nMost scars improve dramatically with proper care. Very few require surgical revision if treated correctly from the start.`,
    ],
  },
  {
    keywords: ['skin type', 'oily skin', 'combination skin', 'sensitive skin', 'normal skin'],
    followUps: ['How to determine my skin type?', 'Best routine for oily skin?', 'How to reduce oiliness'],
    responses: [
      `Understanding your skin type is essential for choosing the right products. Here's how to figure yours out and optimize for it:\n\n**How to determine your skin type:**\nWash your face with a gentle cleanser. Wait 2 hours without applying anything. Then observe:\n\n- Oily: Entire face feels slick/shiny. Enlarged pores visible.\n- Dry: Feels tight, possibly flaky. Minimal shine anywhere.\n- Combination: T-zone (forehead, nose, chin) oily; cheeks normal or dry.\n- Normal: Balanced. No excess oil or dryness. Lucky you.\n- Sensitive: Any type + redness, stinging, or reactions to many products.\n\n**Optimized routine by type:**\n\nOILY SKIN:\n- Cleanser: Gel or foaming formula (CeraVe Foaming, La Roche-Posay Effaclar)\n- Moisturizer: Lightweight gel (Neutrogena Hydro Boost, CeraVe PM)\n- SPF: Matte-finish sunscreen (EltaMD UV Clear, Biore UV)\n- Key ingredients: Niacinamide (controls oil), BHA/salicylic acid (unclogs pores)\n- Avoid: Heavy creams, coconut oil, sleeping masks\n- Pro tip: Don't over-cleanse or skip moisturizer. Stripped skin produces MORE oil to compensate.\n\nDRY SKIN:\n- Cleanser: Cream or hydrating formula (CeraVe Hydrating, Vanicream)\n- Moisturizer: Rich cream with ceramides (CeraVe Moisturizing Cream, First Aid Beauty Ultra Repair)\n- SPF: Hydrating sunscreen formulas\n- Key ingredients: Hyaluronic acid, ceramides, squalane, shea butter\n- Avoid: Alcohol-based products, foaming cleansers, over-exfoliating\n- Pro tip: Apply moisturizer on damp skin to lock in hydration. Layer a facial oil on top at night.\n\nCOMBINATION:\n- Cleanser: Gentle, balanced (CeraVe Hydrating or Foaming depending on season)\n- Moisturizer: Lightweight lotion (CeraVe PM works perfectly)\n- Spot-treat: BHA on oily zones, richer moisturizer on dry cheeks if needed\n- This is the most common male skin type. A single balanced routine works fine.\n\nSENSITIVE:\n- Cleanser: Ultra-gentle, fragrance-free (Vanicream, La Roche-Posay Toleriane)\n- Moisturizer: Minimal ingredients, fragrance-free (Vanicream Daily, Avene Tolerance)\n- SPF: Mineral only (zinc oxide — less reactive than chemical filters)\n- Key: Introduce ONE new product at a time. Wait 2 weeks before adding another.\n- Avoid: Fragrance, essential oils, alcohol denat, high-concentration actives initially\n- Start actives at lowest concentrations and build very gradually\n\n**Universal truth regardless of type:**\nYour skin type can change with seasons, age, and products. Reassess every few months and adjust. Oily in summer might be combination in winter. Don't lock yourself into one routine forever.`,
    ],
  },
  {
    keywords: ['double chin', 'submental', 'chin fat', 'jaw neck angle', 'turkey neck'],
    followUps: ['Exercises for double chin?', 'Is a double chin always fat?', 'How to improve jaw-neck angle'],
    responses: [
      `The jaw-neck angle is crucial for an attractive profile. Here's how to fix a double chin or undefined jaw-neck line:\n\n**Why you might have a "double chin":**\n1. Excess body fat (most common — face stores fat readily)\n2. Forward head posture (pushes soft tissue downward and backward)\n3. Weak submental muscles (under the chin)\n4. Loose skin (age or significant weight loss)\n5. Recessed jaw/chin (structural — mandible sits too far back)\n\n**The protocol (address all causes):**\n\nPosture (often 50% of the problem):\n- Chin tucks: THE exercise. 3 sets of 20, 3x daily. Pull chin straight back, hold 5 sec.\n- Think "ears over shoulders." Forward head posture literally pushes your jaw backward.\n- Stretch SCM muscles (side neck stretches)\n- Fix your workspace ergonomics\n\nFat loss:\n- Get to 12-15% body fat. The submental area is one of the last places fat leaves but also one of the most noticeable.\n- Caloric deficit + high protein + resistance training\n- Reduce sodium and alcohol for less water retention in the area\n\nExercises (direct submental work):\n- Tongue press: Press tongue firmly to roof of mouth while tilting head back. Feel the contraction under your chin. Hold 10 sec, 15 reps.\n- Neck curls: Lie face up, curl chin to chest. 3x20. Strengthens the anterior neck and submental muscles.\n- Jaw forward: Push lower jaw forward past upper teeth. Hold 10 sec, 15 reps.\n- Mewing: Proper tongue posture 24/7 keeps the submental area engaged\n\nGum chewing:\n- Builds masseters which creates visual contrast with the neck area\n- The jaw-neck angle becomes more defined when the jaw appears wider\n\n**Advanced options:**\n- Kybella injections: Dissolves fat cells under the chin permanently. 2-4 sessions needed. $1200-$1800 per session. Noticeable swelling for 1-2 weeks.\n- CoolSculpting (chin applicator): Freezes fat cells. 1-2 sessions. Less downtime than Kybella.\n- Chin implant: If the issue is structural recession rather than fat. Provides permanent projection.\n- Neck lift surgery: For significant loose skin (typically after major weight loss)\n\n**Quick visual trick:**\nIn photos: Push jaw slightly forward and down, extend neck upward. Creates instant jaw definition. Models use this trick in every photo.\n\n**Timeline with exercises + posture + fat loss:**\n- 2-4 weeks: Postural improvement makes immediate visual difference\n- 4-8 weeks: Submental exercises showing toning\n- 2-3 months: Fat loss revealing the actual jaw-neck angle underneath\n\nMost "double chins" are 70% posture + 30% fat. Fix posture first — the results are immediate and free.`,
    ],
  },
  {
    keywords: ['razor', 'shav', 'shave', 'shaving', 'razor bump', 'ingrown'],
    followUps: ['How to prevent razor bumps?', 'Best shaving technique?', 'Safety razor vs cartridge?'],
    responses: [
      `Shaving properly is crucial for skin health and appearance. Most guys do it wrong and wonder why they get irritation. Here's the guide:\n\n**Preventing razor bumps and irritation:**\n\nBefore shaving:\n- Always shave AFTER a warm shower (or hold warm towel on face 2 min). This softens hair and opens pores.\n- Apply pre-shave oil for extra glide and protection\n- Use a quality shaving cream/gel (not aerosol foam — it's terrible for skin). Lather with a brush for best results.\n\nTechnique:\n- Shave WITH the grain first pass (direction hair grows). Most bumps come from going against grain.\n- Light pressure only. Let the blade do the work.\n- Short strokes, rinse blade frequently\n- If you need a closer shave: second pass across the grain (perpendicular), never against\n- Never go over the same area dry\n\nAfter:\n- Rinse with cold water (closes pores)\n- Pat dry (don't rub)\n- Apply alcohol-free aftershave balm (not splash — that just irritates)\n- Moisturize\n- SPF if going outside\n\n**For chronic razor bumps/ingrown hairs:**\n- Switch to a safety razor (single blade = less irritation than 5-blade cartridge)\n- Or use a quality electric trimmer at stubble length (Philips OneBlade)\n- BHA (salicylic acid) after shaving prevents ingrowns by keeping pores clear\n- Glycolic acid toner (The Ordinary, Tend Skin) on bump-prone areas\n- NEVER pick at ingrown hairs — use a sterile needle to gently free the hair if visible\n- Consider laser hair removal for chronic neck bumps (permanent solution)\n\n**Razor recommendations:**\n- Best cartridge: Gillette SkinGuard (designed for sensitive skin) or Harry's\n- Best safety razor: Merkur 34C or Edwin Jagger DE89 (affordable, great starters)\n- Best electric: Philips OneBlade (won't irritate), Braun Series 7 (closest electric shave)\n\n**When to shave vs. maintain stubble:**\n- Clean shave: Best if you have a strong jaw/chin you want to display\n- 1-3 day stubble: Often rated as most attractive in studies. Adds texture and shadow to the jaw.\n- Full beard: Best for weak chin/jaw, patchy areas can be covered\n\n**Skin recovery between shaves:**\n- Don't shave daily if prone to irritation (every other day is fine)\n- Apply moisturizer daily on shaved areas\n- Niacinamide helps with post-shave redness\n- If you get a cut: alum block stops bleeding instantly and is antiseptic`,
    ],
  },
  {
    keywords: ['compare', 'comparison', 'better than me', 'jealous', 'genetics', 'unfair', 'blackpill', 'doomer'],
    followUps: ['How to stop comparing to others?', 'Does genetics determine everything?', 'Is looksmaxxing cope?'],
    responses: [
      `I'm going to be straight with you — the comparison trap and blackpill mindset can genuinely ruin your life. Let me reframe this:\n\n**The reality about genetics:**\n- Yes, genetics set your baseline. That's undeniable.\n- But the RANGE between your worst and best version is MASSIVE. Most guys are operating at 40-60% of their potential.\n- A 5/10 genetic baseline, fully optimized (lean, great skin, great hair, fit, well-dressed, confident) will consistently outperform a 7/10 baseline who does nothing.\n- The guys you're comparing yourself to online? Lighting, angles, surgery, and filters. You're comparing your raw everyday face to someone's best possible frame.\n\n**Why the blackpill mindset is wrong:**\n- It cherry-picks studies about bone structure while ignoring the massive body of research showing that grooming, body composition, style, and confidence significantly affect perceived attractiveness\n- It assumes genetic ceiling is your CURRENT state. It's not. Your current state is your genetics PLUS years of habits.\n- It's defeatist by design. If you believe nothing works, you won't try, and that becomes a self-fulfilling prophecy.\n- The guys posting blackpill content are NOT living proof it doesn't work. They're living proof that giving up guarantees you stay stuck.\n\n**What's actually within your control (this is a LOT):**\n- Body composition (lean + muscular): Transforms face shape. 100% controllable.\n- Skin quality: Proper skincare + diet = dramatic improvement. Controllable.\n- Hair optimization: Right style + maintenance. Controllable.\n- Posture and jaw development: Significantly alterable.\n- Style, grooming, fragrance: Instant change. Controllable.\n- Confidence and social skills: Learnable. \n- The "vibe" you give off: Entirely your choice.\n\n**The productive comparison:**\n- Compare to YOUR past self, never to others. Take photos monthly and compare to 3-6 months ago.\n- If you must look at others: study what they DO, not what they ARE. Copy their routines and habits, not their bone structure.\n\n**Final thought:**\nEvery guy who's gone through a real transformation will tell you: the biggest change wasn't physical. It was going from "nothing works, why bother" to "I'm going to systematically become my best version." The mental shift comes first. The physical results follow.\n\nYou're here. You're asking questions. That already puts you ahead of the guys who've given up. Now do the work.`,
    ],
  },
  {
    keywords: ['derma', 'chemical peel', 'professional treatment', 'laser', 'cosmetic treatment'],
    followUps: ['Best professional skin treatments?', 'How often should I get peels?', 'Is laser worth it?'],
    responses: [
      `Professional skin treatments can accelerate results beyond what at-home care achieves. Here's the guide:\n\n**Chemical Peels:**\n- Light peels (AHA/BHA, 30% glycolic): Immediate glow, minimal downtime (slight redness 1-2 days). Good for texture and tone. Can do monthly.\n- Medium peels (TCA 15-30%): More significant results for scarring, hyperpigmentation, and wrinkles. 5-7 days peeling. Every 4-6 weeks.\n- Deep peels (TCA 50%+, phenol): Dramatic results but significant downtime (2-3 weeks). Once or twice ever.\n\n**Laser Treatments:**\n- IPL (Intense Pulsed Light): Targets sun damage, brown spots, redness. Minimal downtime. Series of 3-5 treatments.\n- Fractional CO2: Gold standard for acne scars and skin resurfacing. Creates micro-columns of damage that heal with new collagen. 5-10 days downtime. Dramatic results.\n- Non-ablative (Clear+Brilliant, Fraxel Dual): Gentler, less downtime (2-3 days), more sessions needed. Good maintenance treatment.\n- Pico laser: For pigmentation specifically. Multiple sessions, minimal downtime.\n\n**Microneedling (professional vs at-home):**\n- Professional: 1.5-2.5mm depth. Much more effective than at-home for scars. Often combined with PRP ("vampire facial").\n- Series of 4-6 treatments, monthly. Expect significant improvement in scars and texture.\n- Cost: $200-$700 per session.\n\n**PRP (Platelet-Rich Plasma):**\n- Your own blood processed and injected or applied after microneedling\n- Accelerates healing, improves skin quality, supports hair growth\n- Series of 3 treatments, then maintenance every 6-12 months\n\n**Who should consider professional treatments:**\n- Moderate-severe acne scarring (microneedling or laser)\n- Significant sun damage or hyperpigmentation (IPL or laser)\n- Fine lines not responding to retinol alone (peels, laser, or microneedling)\n- Desire for faster results than topical-only approach\n\n**Choosing a provider:**\n- Board-certified dermatologist or plastic surgeon\n- Ask about their experience with YOUR specific concern\n- Ask for before/after photos of similar patients\n- Avoid "Groupon specials" — cheap means corner-cutting\n\n**Important:**\n- Always get at-home routine dialed first (cleanser, retinol, SPF) before adding professional treatments\n- You MUST use SPF religiously after any professional treatment (skin is extremely vulnerable)\n- Hydrate heavily before and after treatments for best healing\n- Communicate your skin type and concerns clearly — some treatments aren't suitable for darker skin tones without modification\n\nProfessional treatments are an investment but can compress 12 months of at-home results into 2-3 months when done correctly.`,
    ],
  },
  {
    keywords: ['morning', 'wake up', 'morning routine', 'start day'],
    followUps: ['What should I do first when I wake up?', 'Morning skincare order?', 'Quick morning routine for busy days'],
    responses: [
      `Here's the optimized morning routine that maximizes facial aesthetics while being realistic for busy schedules:\n\n**The Full Morning Protocol (20 min):**\n\n1. Hydration (30 sec): Drink 500ml water immediately. Your body is dehydrated from 7-8 hours without water. Add lemon or electrolytes if you want.\n\n2. Cold water splash or cold compress (1 min): Reduces morning puffiness, constricts blood vessels, wakes up skin. If you're committed, end shower with 30-60 sec cold water.\n\n3. Cleanser (1 min): Gentle cleanser (CeraVe, La Roche-Posay). Remove night products and overnight sebum. Skip if skin is very dry — warm water splash is fine.\n\n4. Vitamin C serum (30 sec): 4-5 drops, pat into skin. Antioxidant protection for the day + brightening.\n\n5. Moisturizer (30 sec): Lightweight formula with niacinamide. Apply to slightly damp skin.\n\n6. SPF (1 min): Generous application of SPF 30-50. 2 finger-lengths for face. This is the step you NEVER skip.\n\n7. Eye area (30 sec): Caffeine eye serum or eye cream if you deal with puffiness/darkness.\n\n8. Lip balm with SPF (5 sec): Protect and hydrate.\n\n9. Hair styling (3-5 min): Blow dry for volume if needed, apply product.\n\n10. Posture exercises (3 min): 2 sets of 15 chin tucks + posture check before leaving.\n\n**The Minimum Viable Morning (5 min — for when you're rushed):**\n1. Splash water on face\n2. Moisturizer\n3. Sunscreen\n4. Style hair\n5. Posture check\n\nEven the 5-minute version is better than nothing. Protect your skin (SPF) at minimum.\n\n**Morning habits that affect how you look:**\n- Don't check your phone immediately (blue light + stress hormones first thing)\n- 5-minute walk outside (natural light resets circadian rhythm for better sleep tonight)\n- High-protein breakfast (eggs, Greek yogurt) over sugary cereal\n- Mastic gum during commute (jaw gains while traveling)\n- Maintain tongue posture from the moment you wake up\n\n**What NOT to do in the morning:**\n- Heavy exfoliating (save for PM)\n- Retinol application (it's a PM product — degrades in sunlight)\n- Skipping SPF because "it's cloudy" or "I'm only outside for 5 min"\n- Hot shower directly on face (causes redness and capillary damage over time)\n\nLock in this routine for 2 weeks and it becomes automatic. The compound effect of 365 mornings of proper skincare is massive.`,
    ],
  },
  {
    keywords: ['night routine', 'evening routine', 'before bed', 'pm routine', 'nighttime'],
    followUps: ['What order should I apply night products?', 'Do I need a different routine at night?', 'Best night treatments?'],
    responses: [
      `Your evening routine is where the REAL work happens — nighttime is when skin repairs and regenerates. Here's how to maximize it:\n\n**The Complete Evening Protocol (15-20 min):**\n\n1. Oil cleanser / micellar water (1 min): Removes sunscreen, pollution, and sebum from the day. Massage into DRY skin, then rinse. This step is crucial — you MUST properly remove SPF.\n\n2. Regular cleanser (1 min): Second cleanse with your gentle cleanser. This ensures everything is truly clean without residue. Double cleansing is non-negotiable if you wore SPF.\n\n3. Treatment / Active (varies):\n   - Retinol nights (3-4x/week once built up): Pea-sized amount over entire face. Wait 20 min after washing if skin is sensitive.\n   - Non-retinol nights: AHA/BHA exfoliant (1-2x/week) OR just moisturize\n   - NEVER layer retinol + acids on the same night\n\n4. Eye cream (30 sec): Retinol eye cream or peptide eye cream. Pat gently with ring finger on orbital bone. Never drag this delicate skin.\n\n5. Moisturizer (30 sec): Can use a slightly richer formula at night than morning (no SPF diluting it). Lock in your actives.\n\n6. Lip treatment (10 sec): Thick layer of Aquaphor, Vaseline, or Laneige Lip Mask. Locks in moisture overnight.\n\n7. Facial exercises (5-10 min): Mastic gum chewing, chin tucks, neck exercises. Evening is a great time since you're winding down.\n\n**Pre-sleep optimization:**\n- Mouth tape applied for nasal breathing (maintains mewing posture during sleep)\n- Sleep on back (use pillow barriers if needed)\n- No screens 30 min before bed (or blue light glasses minimum)\n- Room temperature 65-68F / 18-20C\n- Magnesium glycinate 400mg (promotes deep sleep)\n- Complete darkness (blackout curtains or sleep mask)\n\n**Weekly evening additions:**\n- Chemical peel night (1x/week, replacing retinol): The Ordinary AHA 30% + BHA 2% for 10 min\n- Sheet mask (1-2x/week): Deep hydration boost before moisturizer\n- Derma rolling (if using for skin or beard): On designated evenings, skip actives that night\n\n**Why nighttime matters more:**\n- Cell turnover is 8x faster at night\n- Blood flow to skin increases (delivers more nutrients)\n- Growth hormone peaks during sleep (collagen repair)\n- No UV interference with active ingredients\n- Retinol is photosensitive — only works properly at night\n- Less TEWL (transepidermal water loss) during sleep if you moisturize properly\n\n**The hierarchy if you can only do one PM step:**\nRetinol > moisturizer > cleanser. If you're going to use ONE active, make it retinol at night. Nothing else comes close for combined anti-aging + skin quality benefits.`,
    ],
  },
  {
    keywords: ['jawline implant', 'chin implant', 'implant', 'jaw implant', 'genioplasty', 'jaw surgery', 'orthognathic'],
    followUps: ['Are jaw implants worth it?', 'Jaw surgery vs implants?', 'Recovery time for jaw procedures?'],
    responses: [
      `Jaw/chin implants and orthognathic surgery are significant decisions. Here's the informational breakdown:\n\n**Chin Implants (genioplasty):**\n- What: Silicone implant placed over the chin bone for increased projection and/or width\n- Best for: Recessed/weak chin that doesn't respond to posture and exercises\n- Procedure: 30-60 minutes, usually under local anesthesia + sedation\n- Recovery: Swelling for 2-3 weeks, numbness for a few months, final result at 3-6 months\n- Cost: $3,000-$8,000\n- Risks: Infection (rare), implant shifting, nerve numbness, bone erosion over decades\n- Reversible: Yes (implant can be removed)\n\n**Jaw Angle Implants:**\n- What: Silicone or custom PEEK implants at the jaw angles (gonion) for increased width and angularity\n- Creates that wide, angular jaw appearance from the front\n- Often combined with chin implant for complete jaw transformation\n- Recovery: More significant swelling, 4-6 weeks to look normal, 3-6 months for final result\n- Cost: $5,000-$15,000\n- Custom (Implantech, Stryker): Most natural results but most expensive\n\n**Orthognathic (Jaw) Surgery:**\n- What: Actual bone cutting and repositioning of the mandible and/or maxilla\n- For: Functional issues (bite problems) + aesthetics. Moves entire jaw forward/back/up/down\n- MUCH more invasive than implants. General anesthesia, hospital stay, wired jaw for weeks.\n- Recovery: 6-8 weeks no solid food, 3-6 months for full healing, 12+ months for final result\n- Cost: $20,000-$50,000+ (sometimes partially covered by insurance if bite correction is involved)\n- Results: Dramatic. Can completely change facial profile.\n\n**Sliding Genioplasty (middle ground):**\n- Cuts the chin bone and moves it forward (no implant needed)\n- More natural than silicone implant, no erosion risk\n- Can adjust in all directions\n- Recovery similar to implant but slightly longer\n\n**My honest take:**\n\nBefore considering ANY surgical option:\n1. Get to 12-15% body fat (reveals natural bone structure)\n2. Fix forward head posture (projects jaw forward naturally)\n3. Mew consistently for 12+ months (especially if under 25)\n4. Build masseters with mastic gum (adds width)\n5. Train neck (frames jaw better)\n\nIf after ALL of that your jaw is still genuinely recessed or weak (not just "not model-tier"), THEN consider a consultation. Many guys who think they need surgery actually just need to lose fat and fix posture.\n\nIf you do pursue it: research surgeons obsessively. Look at 50+ before/afters. Get multiple consultations. This is your face — don't cheap out on the provider.`,
    ],
  },
  {
    keywords: ['azelaic', 'azelaic acid', 'rosacea', 'redness', 'red face', 'flushing'],
    followUps: ['Best azelaic acid products?', 'How to reduce facial redness permanently?', 'Can rosacea be cured?'],
    responses: [
      `Azelaic acid is an underrated powerhouse ingredient, especially for redness-prone skin and rosacea. Here's the complete guide:\n\n**What azelaic acid does:**\n- Anti-inflammatory (reduces redness, calms irritated skin)\n- Kills acne-causing bacteria (similar to benzoyl peroxide but gentler)\n- Inhibits melanin production (fades dark spots and post-acne marks)\n- Normalizes keratinization (prevents clogged pores)\n- Safe during pregnancy (unlike retinoids)\n- One of the few treatments PROVEN for rosacea\n\n**Who should use it:**\n- Rosacea sufferers (FDA-approved at 15% for this)\n- People with redness, flushing, or reactive skin\n- Those with acne AND hyperpigmentation (treats both)\n- Anyone who can't tolerate retinol or benzoyl peroxide\n- Can be used by ALL skin types and tones safely\n\n**How to use:**\n- 10% OTC (The Ordinary, Paula's Choice) or 15-20% prescription (Finacea, Azelex)\n- Apply morning and/or evening after cleansing\n- Can layer under moisturizer or mix with moisturizer if it pills\n- Takes 4-8 weeks for visible redness reduction\n- Can be combined with retinol (different nights) or niacinamide (same routine)\n\n**For chronic facial redness/rosacea:**\n\nComplete protocol:\n1. Gentle cleanser only (no foaming, no fragrance)\n2. Azelaic acid 15-20% as primary treatment\n3. Niacinamide 5% (strengthens barrier, reduces redness)\n4. Simple moisturizer with ceramides\n5. Mineral SPF (chemical sunscreens can trigger rosacea)\n\nAvoid:\n- Hot beverages and spicy food (triggers flushing)\n- Alcohol (major vasodilator — worsens redness)\n- Very hot showers or saunas on face\n- Harsh products (retinol can worsen rosacea initially)\n- Sun exposure without protection\n\n**Other anti-redness tools:**\n- Green-tinted primer (neutralizes red tones visually — many men use this and it's invisible)\n- Centella asiatica (CICA) products for soothing\n- La Roche-Posay Cicaplast Baume for irritation\n- V-beam or IPL laser for persistent redness/visible blood vessels (professional treatment)\n\n**Can rosacea be "cured"?**\nNot permanently, but it can be very well controlled. Many people achieve near-normal skin appearance with consistent treatment. Azelaic acid + gentle routine + trigger avoidance = manageable skin for most.`,
    ],
  },
  {
    keywords: ['acne diet', 'dairy acne', 'sugar skin', 'gut skin', 'food acne', 'diet skin'],
    followUps: ['Should I cut dairy completely?', 'Best anti-acne diet?', 'Does gut health affect skin?'],
    responses: [
      `The diet-skin connection is real and often underestimated by dermatologists. Here's what the evidence shows:\n\n**Foods that CAUSE or WORSEN acne:**\n\n1. Dairy (especially milk and whey protein):\n- Multiple studies show significant correlation with acne\n- Mechanism: Dairy contains IGF-1 and hormones that increase sebum production and inflammation\n- Skim milk is actually WORSE than whole milk (more processed, higher IGF-1 concentration)\n- Whey protein is a major acne trigger for many gym-goers\n- Try: Eliminate dairy for 4-6 weeks and observe skin. Many people see dramatic improvement.\n\n2. High-glycemic foods (sugar, white bread, pasta, rice):\n- Spike insulin which increases androgen activity and sebum production\n- Also cause glycation (damages collagen structure)\n- Studies show low-glycemic diets reduce acne by 20-50%\n\n3. Processed/fried foods:\n- High in omega-6 fatty acids which are pro-inflammatory\n- The omega-6 to omega-3 ratio matters more than total fat intake\n\n**Foods that CLEAR skin:**\n\n1. Omega-3 rich foods (salmon, sardines, walnuts, flax):\n- Anti-inflammatory, directly counteracts acne-causing inflammation\n- Aim for 2-3 servings of fatty fish per week OR supplement 2-3g fish oil daily\n\n2. Zinc-rich foods (oysters, beef, pumpkin seeds, lentils):\n- Zinc deficiency is linked to acne in multiple studies\n- 30mg zinc picolinate daily has been shown to reduce acne comparably to antibiotics\n\n3. Vitamin A foods (sweet potato, liver, carrots):\n- Regulates skin cell turnover (same mechanism as retinol, but internally)\n- Accutane is literally a mega-dose of Vitamin A derivative\n\n4. Probiotic foods (sauerkraut, kimchi, kefir, kombucha):\n- Gut health directly affects skin health ("gut-skin axis")\n- Inflammatory gut = inflammatory skin\n- Consider a probiotic supplement with Lactobacillus and Bifidobacterium strains\n\n5. Green tea:\n- Powerful antioxidant (EGCG) that's anti-inflammatory and reduces sebum production\n- 2-3 cups daily or EGCG supplement\n\n**The anti-acne diet framework:**\n- Eliminate: Dairy, whey protein, excess sugar, processed foods for 4-6 weeks\n- Emphasize: Vegetables, fatty fish, berries, eggs, lean protein, complex carbs\n- Supplement: Zinc 30mg, Omega-3 2-3g, Probiotic, Vitamin D 5000 IU\n- Hydrate: 3-4L water daily\n\n**Gut-skin axis:**\nYour gut microbiome directly communicates with your skin. Gut inflammation shows on your face. If you have digestive issues AND skin issues, fixing the gut often fixes the skin. Consider: eliminating trigger foods, taking probiotics, eating fermented foods, and adding prebiotic fiber.\n\nDiet changes take 4-8 weeks to show on skin (full cell turnover cycle). Don't give up after 1 week.`,
    ],
  },
  {
    keywords: ['product recommendation', 'what product', 'which product', 'best product', 'product for'],
    followUps: ['Budget skincare routine products?', 'Premium vs drugstore products?', 'Where to buy skincare?'],
    responses: [
      `Here's my curated product guide — organized by category so you can build the right routine for your budget:\n\n**CLEANSERS:**\n- Budget: CeraVe Hydrating Cleanser ($12) or Foaming Cleanser ($12)\n- Mid: La Roche-Posay Toleriane Hydrating ($15)\n- Sensitive: Vanicream Gentle Cleanser ($9)\n\n**VITAMIN C (AM):**\n- Budget: The Ordinary Ascorbyl Glucoside 12% ($12) — stable, gentle\n- Mid: Timeless 20% Vitamin C + E + Ferulic ($25) — best value CE Ferulic\n- Premium: Skinceuticals CE Ferulic ($170) — the gold standard\n\n**MOISTURIZER:**\n- Oily/normal: CeraVe PM Facial Lotion ($13) — has niacinamide built in\n- Dry: CeraVe Moisturizing Cream ($16) — rich, ceramide-packed\n- Lightweight: Neutrogena Hydro Boost ($16) — gel texture, great under SPF\n\n**SUNSCREEN:**\n- Budget: Neutrogena Ultra Sheer SPF 50 ($10)\n- Elegant: Biore UV Aqua Rich Watery Essence ($13, Japanese)\n- Sensitive: EltaMD UV Clear SPF 46 ($38) — has niacinamide, great for acne-prone\n- No white cast: Supergoop Unseen Sunscreen ($36)\n\n**RETINOL:**\n- Beginner: The Ordinary Retinol 0.2% in Squalane ($6)\n- Intermediate: The Ordinary Retinol 0.5% ($7)\n- Prescription: Tretinoin 0.025% (ask derm, or use Curology/Apostrophe for online prescription)\n\n**EXFOLIANTS:**\n- BHA: Paula's Choice 2% BHA Liquid ($30) — cult favorite for a reason\n- AHA: The Ordinary Glycolic Acid 7% Toning Solution ($9)\n- Strong peel: The Ordinary AHA 30% + BHA 2% ($8) — weekly use only\n\n**EYE AREA:**\n- Caffeine: The Ordinary Caffeine Solution 5% ($7)\n- Anti-aging: CeraVe Eye Repair Cream ($14)\n\n**NIACINAMIDE:**\n- The Ordinary Niacinamide 10% + Zinc 1% ($6) — hard to beat at this price\n\n**The complete budget routine (under $50 total):**\n- CeraVe Hydrating Cleanser ($12)\n- The Ordinary Vitamin C ($12)\n- CeraVe PM ($13)\n- Neutrogena SPF 50 ($10)\n- The Ordinary Retinol 0.2% ($6)\nTotal: ~$53 and covers ALL the essentials.\n\n**Where to buy:**\n- The Ordinary: Their website, Ulta, Sephora\n- CeraVe/Neutrogena: Any drugstore, Amazon, Target\n- Asian sunscreens: Amazon, YesStyle, Stylevana\n- Prescription (tretinoin): Curology, Apostrophe, or your dermatologist\n\n**Key principle:** Expensive doesn't mean better for skincare. The active ingredients are what matter, and affordable brands like CeraVe and The Ordinary use the same concentrations as luxury products. Save your money for the things that matter (good sunscreen, prescription retinoid).`,
    ],
  },
  {
    keywords: ['face mask', 'sheet mask', 'clay mask', 'mask routine'],
    followUps: ['How often should I use face masks?', 'Best masks for men?', 'Clay mask vs sheet mask?'],
    responses: [
      `Face masks are a solid supplementary step. Here's when and how to use them effectively:\n\n**Clay Masks (for oily/acne-prone skin):**\n- What they do: Draw out excess oil, unclog pores, absorb impurities\n- How often: 1-2x per week maximum (overdoing it strips and irritates skin)\n- Best products: Aztec Secret Indian Healing Clay ($10), The Ordinary Salicylic Acid Masque, Innisfree Volcanic Clay Mask\n- How to use: Apply thin layer on clean skin, leave 10-15 min (remove BEFORE fully dry to avoid over-drying), rinse with warm water, moisturize immediately\n- Best for: T-zone, enlarged pores, blackheads, oily skin\n\n**Sheet Masks (for hydration and glow):**\n- What they do: Deliver concentrated serums to skin, intense hydration boost\n- How often: 1-3x per week (these are gentler)\n- Best products: Mediheal (various types), Dr. Jart Ceramidin, COSRX Snail Essence mask\n- How to use: After cleansing, apply for 15-20 min (not longer — re-evaporation starts), pat remaining serum in, follow with moisturizer\n- Best for: Before events/photos, dehydrated skin, travel, adding glow\n\n**Overnight Masks (sleeping masks):**\n- What they do: Provide intensive overnight treatment while you sleep\n- How often: 2-3x per week or nightly\n- Best products: Laneige Water Sleeping Mask, COSRX Honey Overnight Mask\n- How to use: Apply as last step of PM routine. Wash off in the morning.\n\n**When masks make sense for men:**\n- Before a date/event: Sheet mask 1-2 hours before for instant glow and hydration\n- After a long flight: Hydrating mask to counteract airplane dehydration\n- Weekly maintenance: Clay mask for pore cleanliness if oily-skinned\n- Recovery after harsh treatments: Hydrating mask after microneedling or peels (once skin is closed)\n\n**When masks are NOT necessary:**\n- If your basic routine is solid (cleanser, actives, moisturizer, SPF), masks are bonus — not essential\n- Don't use a mask instead of daily routine. Consistency with basics beats occasional masks every time.\n\n**DIY options that actually work:**\n- Honey mask (15 min): Antibacterial, moisturizing, promotes healing\n- Oatmeal mask: Soothing for irritated/red skin\n- Green tea compress: Anti-inflammatory, reduces redness\n\nThink of masks as a "boost" to your regular routine — not a replacement for it.`,
    ],
  },
];

const FALLBACK_RESPONSES = [
  `Good question! While that's not in my primary knowledge base, I can tell you this — the fundamentals of facial aesthetics always apply:\n\n1. **Get lean** (12-15% body fat) — reveals your natural bone structure\n2. **Skincare basics** — cleanser, moisturizer, and SPF every single day\n3. **Mewing** — proper tongue posture on the palate 24/7\n4. **Sleep** — 7-9 hours on your back\n5. **Hydration** — 3+ liters of water daily\n\nTry asking me about any of these topics specifically and I'll give you a detailed breakdown! I can also help with jawline, hair, supplements, exercises, procedures, and more.`,
  `Hmm, I'm not sure I have specific advice on that exact topic, but let me point you toward what I DO know really well:\n\nI can help with: mewing, jawline exercises, skincare routines, acne treatment, hair optimization, body fat reduction, facial exercises, sleep optimization, nutrition for skin, supplements, facial ratios, professional treatments, beard growth, posture correction, confidence building, and way more.\n\nTry rephrasing your question or ask me about one of those topics — I'll give you actionable, detailed advice you can start using today.`,
  `That's an interesting one! I want to make sure I give you solid, actionable advice rather than guessing. Here are the areas where I can give you genuinely detailed protocols:\n\n- Face structure: mewing, jawline, cheekbones, symmetry, facial ratios\n- Skin: routines, retinol, acne, anti-aging, specific ingredients\n- Hair: styles, loss prevention, beard growth\n- Lifestyle: sleep, nutrition, exercise, hydration, supplements\n- Advanced: procedures, treatments, professional options\n- Mindset: confidence, body language, dating\n\nWhich area interests you? I'll go deep on whatever you need.`,
];

// ─── Smart Response Matching ────────────────────────────────────────

const getAIResponse = (userMessage) => {
  const lower = userMessage.toLowerCase().trim();

  // Score all topics by keyword match quality
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of AI_RESPONSES) {
    let matchScore = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        // Longer keywords get higher scores (more specific matches prioritized)
        matchScore += keyword.length;
      }
    }
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    // Pick a random response variation if multiple exist
    const responses = bestMatch.responses;
    const responseText = responses[Math.floor(Math.random() * responses.length)];
    const followUps = bestMatch.followUps || [];
    return { text: responseText, followUps };
  }

  // Fallback
  const fallbackText = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  return {
    text: fallbackText,
    followUps: ['How do I start looksmaxxing?', 'Best skincare routine for men', 'How to improve my jawline'],
  };
};

// ─── Components ─────────────────────────────────────────────────────

const TypingDot = ({ delay }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 }),
          withDelay(200, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + progress.value * 0.7,
    transform: [{ translateY: progress.value * -6 }],
  }));

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
};

const TypingIndicator = () => (
  <Animated.View entering={FadeInLeft.duration(200)} style={styles.typingRow}>
    <View style={styles.aiAvatarSmall}>
      <Ionicons name="sparkles" size={10} color="#fff" />
    </View>
    <View style={styles.typingBubble}>
      <TypingDot delay={0} />
      <TypingDot delay={150} />
      <TypingDot delay={300} />
    </View>
  </Animated.View>
);

const MessageReaction = ({ messageId, reactions, onReact }) => {
  const userReaction = reactions[messageId] || null;

  return (
    <View style={styles.reactionContainer}>
      <TouchableOpacity
        style={[styles.reactionButton, userReaction === 'up' && styles.reactionButtonActive]}
        onPress={() => onReact(messageId, 'up')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={userReaction === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
          size={14}
          color={userReaction === 'up' ? COLORS.accent : COLORS.textTertiary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.reactionButton, userReaction === 'down' && styles.reactionButtonActiveDown]}
        onPress={() => onReact(messageId, 'down')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={userReaction === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
          size={14}
          color={userReaction === 'down' ? COLORS.scoreLow : COLORS.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
};

const ChatBubble = ({ item, index, reactions, onReact }) => {
  const isAI = item.sender === 'ai';
  const time = item.timestamp
    ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Animated.View
      entering={isAI ? FadeInLeft.duration(350) : FadeInRight.duration(350)}
      style={[
        styles.messageRow,
        isAI ? styles.messageRowAI : styles.messageRowUser,
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
        <View style={styles.bubbleFooter}>
          {time ? <Text style={styles.timestamp}>{time}</Text> : null}
        </View>
        {isAI && item.id !== 'welcome' && (
          <MessageReaction messageId={item.id} reactions={reactions} onReact={onReact} />
        )}
      </View>
    </Animated.View>
  );
};

const FollowUpSuggestions = ({ followUps, onPress }) => {
  if (!followUps || followUps.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.followUpContainer}>
      {followUps.map((q, i) => (
        <TouchableOpacity
          key={i}
          style={styles.followUpChip}
          onPress={() => onPress(q)}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward-circle-outline" size={14} color={COLORS.accentLight} style={{ marginRight: 6 }} />
          <Text style={styles.followUpText}>{q}</Text>
        </TouchableOpacity>
      ))}
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
  const [activeCategory, setActiveCategory] = useState('popular');
  const [followUps, setFollowUps] = useState([]);
  const [reactions, setReactions] = useState({});
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history and reactions
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [stored, storedReactions] = await Promise.all([
          AsyncStorage.getItem(CHAT_STORAGE_KEY),
          AsyncStorage.getItem(REACTIONS_STORAGE_KEY),
        ]);
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
        if (storedReactions) {
          setReactions(JSON.parse(storedReactions));
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

  // Persist reactions
  const persistReactions = useCallback(async (newReactions) => {
    try {
      await AsyncStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(newReactions));
    } catch {}
  }, []);

  const handleReaction = useCallback((messageId, type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReactions((prev) => {
      const newReactions = { ...prev };
      if (newReactions[messageId] === type) {
        delete newReactions[messageId]; // Toggle off
      } else {
        newReactions[messageId] = type;
      }
      persistReactions(newReactions);
      return newReactions;
    });
  }, [persistReactions]);

  const addAIResponse = useCallback((userText, currentMessages) => {
    setIsTyping(true);
    setFollowUps([]);
    // Typing delay between 1-2 seconds
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const { text: responseText, followUps: responseFollowUps } = getAIResponse(userText);
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
      setFollowUps(responseFollowUps || []);
    }, delay);
  }, [persistMessages]);

  const handleSend = useCallback((text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed) return;

    // Check message limit for free users
    if (!isPro() && sessionCount >= FREE_MESSAGE_LIMIT) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
    setFollowUps([]);
    setSessionCount((prev) => prev + 1);

    addAIResponse(trimmed, updatedMessages);
  }, [inputText, messages, sessionCount, addAIResponse, persistMessages]);

  const handleSuggestion = useCallback((suggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSend(suggestion);
  }, [handleSend]);

  const handleCategoryChange = useCallback((categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
  }, []);

  const limitReached = !isPro() && sessionCount >= FREE_MESSAGE_LIMIT;

  const renderItem = useCallback(({ item, index }) => (
    <ChatBubble item={item} index={index} reactions={reactions} onReact={handleReaction} />
  ), [reactions, handleReaction]);

  const renderFooter = useCallback(() => {
    const components = [];

    if (showSuggestions && messages.length <= 1) {
      const activeData = SUGGESTION_CATEGORIES.find((c) => c.id === activeCategory);
      components.push(
        <Animated.View key="suggestions" entering={FadeInDown.duration(400)}>
          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsContainer}
          >
            {SUGGESTION_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, activeCategory === cat.id && styles.categoryTabActive]}
                onPress={() => handleCategoryChange(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={activeCategory === cat.id ? '#fff' : COLORS.textTertiary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeCategory === cat.id && styles.categoryTabTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Suggestion Chips */}
          <View style={styles.suggestionsContainer}>
            {activeData &&
              activeData.suggestions.map((s, i) => (
                <TouchableOpacity
                  key={`${activeCategory}-${i}`}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestion(s)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </Animated.View>,
      );
    }

    if (isTyping) {
      components.push(<TypingIndicator key="typing" />);
    }

    if (!isTyping && followUps.length > 0 && !showSuggestions) {
      components.push(
        <FollowUpSuggestions key="followups" followUps={followUps} onPress={handleSuggestion} />,
      );
    }

    return components.length > 0 ? <View>{components}</View> : null;
  }, [showSuggestions, messages.length, isTyping, handleSuggestion, activeCategory, handleCategoryChange, followUps]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack(); }} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={16} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>{AI_NAME}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSubtitle}>Online</Text>
              </View>
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
        </Animated.View>

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
            <Animated.View entering={FadeInDown.duration(400)} style={styles.upsellCard}>
              <View style={styles.upsellIconRow}>
                <Ionicons name="lock-closed" size={20} color={COLORS.accent} />
                <Text style={styles.upsellTitle}>Message Limit Reached</Text>
              </View>
              <Text style={styles.upsellText}>
                Unlock unlimited AI advice with PRO. Get personalized guidance on mewing, skincare, jawline, facial ratios, and 50+ more topics.
              </Text>
              <TouchableOpacity
                style={styles.upsellButton}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); navigation.navigate('Paywall'); }}
                activeOpacity={0.8}
              >
                <Text style={styles.upsellButtonText}>Unlock Unlimited {AI_NAME} Advice</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={limitReached ? 'Upgrade to PRO to continue...' : `Ask ${AI_NAME} anything...`}
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
    </GlassBackground>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    borderBottomColor: COLORS.borderLight,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    letterSpacing: 0.5,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.scoreHigh,
    marginRight: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.scoreHigh,
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
    marginRight: 32,
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
    maxWidth: width * 0.75,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAI: {
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    lineHeight: 22,
  },
  bubbleTextAI: {
    color: COLORS.textPrimary,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    alignSelf: 'flex-end',
  },
  reactionContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  reactionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(0,102,255,0.15)',
    borderColor: COLORS.accent,
  },
  reactionButtonActiveDown: {
    backgroundColor: 'rgba(255,82,82,0.15)',
    borderColor: COLORS.scoreLow,
  },
  categoryTabsContainer: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  categoryTabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingBottom: 8,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.accentLight,
  },
  followUpContainer: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 6,
  },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,102,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  followUpText: {
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
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  upsellCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
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
