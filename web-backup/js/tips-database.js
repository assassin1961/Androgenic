/**
 * Androgenic - Comprehensive Looksmaxxing Tips Database
 * Tips organized by category and score range (low/mid/high)
 */

const TIPS_DATABASE = {
    masculinity: {
        emoji: '💪',
        name: 'Masculinity',
        description: 'Overall masculine facial features including brow ridge, jaw, and facial structure',
        tips: {
            low: [
                {
                    title: 'Start mewing consistently',
                    text: 'Mewing (proper tongue posture) involves pressing the entire tongue flat against the roof of your mouth. This can gradually improve jawline definition and facial forward growth over time. Keep your lips sealed and teeth gently touching.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Lean bulk with compound lifts',
                    text: 'Increasing testosterone through heavy compound exercises (squats, deadlifts, bench press, overhead press) can enhance masculine features. Higher testosterone is associated with more prominent brow ridges and stronger jawlines.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Reduce body fat to 10-15%',
                    text: 'Lowering your body fat percentage reveals the underlying bone structure of your face. The masculine features of your skull become far more visible when facial fat is reduced. Aim for a caloric deficit with high protein intake.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Consider growing facial hair strategically',
                    text: 'A well-groomed beard can add the appearance of a wider jaw, stronger chin, and overall more masculine look. Use minoxidil (consult a doctor) if beard growth is patchy. Shape the beard to enhance jawline angles.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Neck training for thickness',
                    text: 'A thick neck is one of the strongest indicators of masculinity. Do neck curls, extensions, and lateral raises 3x per week. Start light and progress slowly to avoid injury. A thick neck dramatically changes facial appearance.',
                    source: 'looksmax.org'
                }
            ],
            mid: [
                {
                    title: 'Optimize testosterone naturally',
                    text: 'Ensure adequate vitamin D, zinc, and magnesium intake. Sleep 7-9 hours per night, minimize alcohol, and manage stress. These factors significantly impact testosterone levels and masculine feature development.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Advanced mewing with hard chewing',
                    text: 'Combine mewing with chewing tough foods or falim gum to hypertrophy the masseter muscles, creating a wider and more angular jaw appearance. Chew evenly on both sides for 30-60 minutes daily.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Develop traps and shoulders',
                    text: 'Well-developed trapezius muscles and broad shoulders frame the face and enhance the masculine silhouette. Focus on shrugs, face pulls, and lateral raises alongside your main compound lifts.',
                    source: 'looksmax.org'
                }
            ],
            high: [
                {
                    title: 'Maintain your masculine edge',
                    text: 'You already have strong masculine features. Maintain your current routines - keep body fat low, continue resistance training, and practice proper tongue posture. Consistency is key to preserving what you have.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Refine with grooming',
                    text: 'With strong masculine features, focus on grooming refinements - maintain clean eyebrow shape (without over-plucking), keep skin clear, and choose hairstyles that complement your strong bone structure.',
                    source: 'looksmax.org'
                }
            ]
        }
    },

    jawline: {
        emoji: '🦴',
        name: 'Jawline',
        description: 'Jaw definition, gonial angle, chin projection, and mandibular structure',
        tips: {
            low: [
                {
                    title: 'Practice proper mewing technique',
                    text: 'Rest your entire tongue against the palate with the back third engaged. This is the most important part. Keep your mouth closed and breathe through your nose 24/7. Consistent mewing can improve jaw posture and definition over months.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Chew falim gum daily',
                    text: 'Falim gum is a tough Turkish gum that builds masseter muscles when chewed regularly. Start with 30 minutes daily and gradually increase. This creates visible jaw widening and definition. Chew evenly on both sides.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Reduce facial bloat',
                    text: 'Cut sodium intake to reduce water retention in the face. Drink more water (seems counterintuitive but it helps), limit alcohol, reduce carb intake, and sleep elevated. Facial bloat hides jawline definition.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Lower body fat percentage',
                    text: 'The jawline is one of the first places to show improvement when you lose body fat. Even a 3-5% reduction in body fat can dramatically reveal jawline structure. Focus on a sustainable caloric deficit.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Fix forward head posture',
                    text: 'Forward head posture compresses the neck and hides the jawline. Practice chin tucks, strengthen your deep neck flexors, and be mindful of your posture throughout the day. This alone can dramatically improve jaw visibility.',
                    source: 'looksmax.org'
                }
            ],
            mid: [
                {
                    title: 'Intensify masseter training',
                    text: 'Graduate to harder chewing exercises - mastic gum or jawline exercisers. Train your masseters like any other muscle: progressive overload with adequate rest. This builds the muscle that defines the jaw angle.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Sleep on your back',
                    text: 'Side and stomach sleeping can asymmetrically compress your jaw over time. Train yourself to sleep on your back with a supportive pillow to maintain jaw symmetry and prevent flattening.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Strategic beard grooming',
                    text: 'If you can grow facial hair, use it strategically. A clean jawline beard with sharp lines can create the illusion of a more defined jaw. Use a straight razor for precision edges.',
                    source: 'looksmax.org'
                }
            ],
            high: [
                {
                    title: 'Maintain jaw definition',
                    text: 'Your jawline is already well-defined. Keep body fat low, continue mewing as a habit, and maintain masseter development. Avoid habits that could worsen it like mouth breathing or poor posture.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Enhance with lighting awareness',
                    text: 'With a strong jawline, you benefit greatly from overhead and side lighting. In photos, position yourself where light hits from above to maximize shadow definition along your jaw.',
                    source: 'looksmax.org'
                }
            ]
        }
    },

    cheekbones: {
        emoji: '🧬',
        name: 'Cheek Bones',
        description: 'Zygomatic bone prominence, cheek hollows, and midface structure',
        tips: {
            low: [
                {
                    title: 'Mewing targets cheekbones too',
                    text: 'Proper tongue posture pushes the maxilla upward and forward, which can make cheekbones appear more prominent over time. The suture between the maxilla and zygomatic bone can remodel with consistent force.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Reduce facial fat for hollow cheeks',
                    text: 'Lower body fat reveals buccal fat reduction naturally, creating the coveted hollow cheek look. Combined with prominent cheekbones, this creates the male model look. Target 10-12% body fat.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Stay hydrated and reduce bloat',
                    text: 'Facial water retention hides cheekbone structure. Drink 3+ liters of water daily, minimize sodium, limit alcohol, and consider natural diuretics like dandelion tea. Your bone structure will become more visible.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Facial exercises for buccinator',
                    text: 'Avoid sucking motions and cheek puffing which build the buccinator muscle (making cheeks rounder). Instead, chewing hard foods works the masseters while naturally slimming the cheek area.',
                    source: 'looksmax.org'
                }
            ],
            mid: [
                {
                    title: 'Sunken cheek techniques',
                    text: 'To enhance cheek hollows: chew tough gum (builds masseter contrast), maintain low body fat, and practice mewing to push up the zygomatic area. The combination creates visible cheekbone prominence.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Collagen and skin tightening',
                    text: 'Tight skin over cheekbones makes them pop more. Use retinol, vitamin C serum, and stay hydrated. Cold water face washes can temporarily tighten skin and make cheekbones more visible.',
                    source: 'looksmax.org'
                }
            ],
            high: [
                {
                    title: 'Highlight your best feature',
                    text: 'Prominent cheekbones are one of the most attractive facial features. Keep body fat low to maintain definition. In photos, angling your face slightly can cast shadows that emphasize this feature.',
                    source: 'looksmax.org'
                }
            ]
        }
    },

    eyes: {
        emoji: '👀',
        name: 'Eyes',
        description: 'Eye area including canthal tilt, eye shape, orbital structure, and under-eye area',
        tips: {
            low: [
                {
                    title: 'Fix dark circles and under-eye bags',
                    text: 'Get 7-9 hours of quality sleep. Use caffeine eye cream to reduce puffiness. Apply cold compresses in the morning. Vitamin K cream can help with dark circles. Stay hydrated and limit sodium before bed.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Improve eye area with sleep quality',
                    text: 'Sleep on your back with your head slightly elevated to prevent fluid accumulation under the eyes. Use blackout curtains and maintain a consistent sleep schedule. Poor sleep is the #1 destroyer of the eye area.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Reduce upper eyelid exposure',
                    text: 'If you have excessive upper eyelid exposure, practice squinting slightly to engage the lower lid. Some people benefit from brow bone development through mewing and overall bone remodeling. Glasses frames can also help frame the eyes.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Eye area skincare routine',
                    text: 'Use sunscreen daily around the eye area (physical sunscreen is less irritating). Apply retinol at night (start with low concentration). Use a dedicated eye cream with peptides. Never rub your eyes as this damages delicate skin.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Address allergies and sinus issues',
                    text: 'Allergic shiners (dark circles from allergies) are common. Use antihistamines, nasal rinses, and address any chronic sinus inflammation. Nasal breathing improvements from mewing also help clear sinus passages.',
                    source: 'looksmax.org'
                }
            ],
            mid: [
                {
                    title: 'Hunter eyes squinting technique',
                    text: 'Practice the "squinch" - a slight squint engaging the lower eyelid. This creates the hunter eye look in photos and can train the muscles over time. Think of it as smiling with your eyes.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Eyebrow grooming for eye area',
                    text: 'Well-shaped eyebrows dramatically improve the eye area. Clean up stray hairs underneath the brow but maintain natural thickness on top. Slightly angled brows with good arch enhance the eye area for men.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Reduce screen strain',
                    text: 'Blue light and screen strain cause squinting, eye redness, and accelerated aging around the eyes. Use blue light filters, follow the 20-20-20 rule, and use lubricating eye drops if needed.',
                    source: 'looksmax.org'
                }
            ],
            high: [
                {
                    title: 'Protect your eye area',
                    text: 'Strong eye area is a top-tier feature. Protect it with daily sunscreen, quality sleep, and minimal eye rubbing. Wear sunglasses outdoors to prevent squinting damage. Maintain the under-eye area with proper hydration.',
                    source: 'looksmax.org'
                }
            ]
        }
    },

    hair: {
        emoji: '💇',
        name: 'Hair',
        description: 'Hair quality, density, hairline, and styling potential',
        tips: {
            low: [
                {
                    title: 'Use shampoo only 2-3x a week',
                    text: 'Washing your hair with shampoo every day strips it of natural oils, making it look thinner. Use shampoo 2-3x per week and use leave-in conditioner to keep your hair hydrated and full-looking.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Avoid paraben & sulfate products',
                    text: 'Opting for paraben and sulfate-free conditioners can promote healthier, stronger hair by maintaining its natural moisture balance and protecting it from unnecessary chemical exposure.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Incorporate scalp massages',
                    text: 'Scalp massages stimulate blood flow to the hair follicles, promoting growth and thickness. Spend 5-10 minutes daily massaging your scalp with fingertips in circular motions. Use rosemary oil for added benefit.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Consider finasteride/minoxidil',
                    text: 'If you are experiencing hair loss, consult a dermatologist about finasteride (blocks DHT) and minoxidil (stimulates growth). Early intervention is key - these treatments work best when started at the first signs of thinning.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Optimize nutrition for hair',
                    text: 'Take biotin (5000mcg daily), ensure adequate iron and zinc levels, eat enough protein (hair is made of keratin). Deficiencies in these nutrients are common causes of poor hair quality and loss.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Dermarolling for hair growth',
                    text: 'Use a 1.5mm dermaroller on your scalp once per week. This creates micro-injuries that stimulate healing and hair growth factors. Combined with minoxidil, results can be significantly enhanced.',
                    source: 'looksmax.org'
                }
            ],
            mid: [
                {
                    title: 'Get a professional haircut',
                    text: 'Find a skilled barber who understands face shapes. The right haircut can dramatically improve your overall appearance. Get cuts every 3-4 weeks. Communicate what you want with reference photos.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Use quality styling products',
                    text: 'Invest in good clay, pomade, or sea salt spray depending on your hair type. Avoid cheap gels that look wet and crusty. Learn to style your hair properly - YouTube tutorials for your specific hair type.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Cold water rinse',
                    text: 'End showers with a cold water rinse on your hair. This closes the hair cuticle, adds shine, and reduces frizz. It also stimulates blood flow to the scalp which promotes growth.',
                    source: 'looksmax.org'
                }
            ],
            high: [
                {
                    title: 'Maintain your great hair',
                    text: 'Your hair is a strong asset. Maintain it by avoiding heat damage, using quality products, and getting regular trims. Consider your hairstyle as a frame for your face - experiment with styles that complement your features.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Experiment with new styles',
                    text: 'Good hair gives you versatility. Try different lengths and styles to find what best frames your face. The right hairstyle can boost your overall score by 1-2 points.',
                    source: 'looksmax.org'
                }
            ]
        }
    },

    skin: {
        emoji: '✨',
        name: 'Skin',
        description: 'Skin clarity, texture, tone evenness, and overall complexion',
        tips: {
            low: [
                {
                    title: 'Start a basic skincare routine',
                    text: 'Morning: gentle cleanser, moisturizer, SPF 30+ sunscreen. Night: cleanser, treatment (retinol or niacinamide), moisturizer. Consistency is more important than expensive products. Start simple and build up.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Use tretinoin (retinol)',
                    text: 'Tretinoin is the gold standard for skin improvement. It increases cell turnover, reduces acne, fades scars, and improves skin texture. Start with 0.025% and work up. Consult a dermatologist for a prescription.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Sunscreen is non-negotiable',
                    text: 'UV damage is the #1 cause of premature skin aging. Use SPF 30-50 daily, even on cloudy days. Reapply every 2 hours when outdoors. This single habit will outperform any other skincare product.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Fix your diet for clear skin',
                    text: 'Reduce dairy and high-glycemic foods which trigger acne. Eat more omega-3 rich foods (salmon, walnuts), vegetables, and fruits. Drink plenty of water. Your skin reflects your nutrition.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Change pillowcases frequently',
                    text: 'Dirty pillowcases harbor bacteria that cause breakouts. Change them every 2-3 days or use silk/satin pillowcases which are less porous and gentler on skin. Also, never touch your face with dirty hands.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Address acne properly',
                    text: 'Use benzoyl peroxide (2.5%) for active acne, salicylic acid for blackheads, and niacinamide for overall clarity. For stubborn acne, see a dermatologist about prescription treatments. Never pick at or pop pimples.',
                    source: 'looksmax.org'
                }
            ],
            mid: [
                {
                    title: 'Add active ingredients',
                    text: 'Incorporate vitamin C serum in the morning (antioxidant protection and brightening), niacinamide (pore minimizing), and hyaluronic acid (hydration). These ingredients take your skin from average to glowing.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Exfoliate 1-2x per week',
                    text: 'Use a chemical exfoliant (AHA/BHA) rather than physical scrubs. This removes dead skin cells, unclogs pores, and improves texture. Start with lower concentrations and increase gradually.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Optimize hydration',
                    text: 'Dehydrated skin looks dull and aged. Drink 3+ liters of water daily, use a humidifier in dry environments, and layer hydrating products (toner, serum, moisturizer) for plump, healthy-looking skin.',
                    source: 'looksmax.org'
                }
            ],
            high: [
                {
                    title: 'Maintain your skin quality',
                    text: 'Great skin is one of the strongest halo effects in attractiveness. Continue your current routine, never skip sunscreen, and stay hydrated. Focus on anti-aging prevention - the earlier you start, the better you age.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Advanced anti-aging',
                    text: 'With good skin as a base, consider preventive measures: retinol for collagen production, vitamin C for brightness, and peptides for firmness. Professional treatments like microneedling can maintain youthful skin.',
                    source: 'looksmax.org'
                }
            ]
        }
    },

    symmetry: {
        emoji: '📐',
        name: 'Symmetry',
        description: 'Facial symmetry and proportional balance between left and right sides',
        tips: {
            low: [
                {
                    title: 'Sleep on your back',
                    text: 'Consistent side sleeping can compress one side of the face more than the other over years. Transition to back sleeping with a supportive pillow. This is one of the most impactful changes for symmetry.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Chew evenly on both sides',
                    text: 'Most people have a dominant chewing side, which creates asymmetric masseter development. Consciously alternate chewing sides. When using gum exercises, ensure equal time on each side.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Fix postural asymmetries',
                    text: 'Scoliosis, uneven shoulders, and head tilt all contribute to facial asymmetry. See a chiropractor or physical therapist. Corrective exercises for posture can gradually improve facial balance.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Mewing with even tongue pressure',
                    text: 'When mewing, ensure your tongue applies equal pressure on both sides of the palate. Uneven pressure can worsen asymmetry. Be conscious of this especially when starting out.',
                    source: 'looksmax.org'
                }
            ],
            mid: [
                {
                    title: 'Targeted masseter work',
                    text: 'If one side of your jaw is less developed, do extra chewing reps on that side to build up the masseter. Check your symmetry in the mirror regularly and adjust your training accordingly.',
                    source: 'looksmax.org'
                },
                {
                    title: 'Strategic hairstyling',
                    text: 'A good hairstyle can visually balance facial asymmetry. Part your hair to create visual weight on the less prominent side. Consult a barber who understands facial structure.',
                    source: 'looksmax.org'
                }
            ],
            high: [
                {
                    title: 'Symmetry is your advantage',
                    text: 'Facial symmetry is one of the most universally attractive features across all cultures. Maintain it by continuing good posture habits, even chewing, and back sleeping.',
                    source: 'looksmax.org'
                }
            ]
        }
    }
};

// General looksmaxxing tips for the overall rating
const GENERAL_TIPS = {
    low: [
        {
            title: 'Start your looksmaxxing journey',
            text: 'Everyone has potential for improvement. Focus on the basics first: fix posture, start skincare, reduce body fat, and begin mewing. These fundamentals can create dramatic changes over 6-12 months.',
            source: 'looksmax.org'
        },
        {
            title: 'Body composition is king',
            text: 'Reducing body fat to 10-15% will reveal your underlying bone structure and improve nearly every facial metric. Combine a caloric deficit with resistance training. This is the single highest-ROI change you can make.',
            source: 'looksmax.org'
        },
        {
            title: 'Hygiene and grooming basics',
            text: 'Keep facial hair well-groomed or clean-shaven, maintain a good haircut, trim nose/ear hair, shape eyebrows slightly, whiten teeth, and keep nails clean. These basics compound into significant improvement.',
            source: 'looksmax.org'
        }
    ],
    mid: [
        {
            title: 'Focus on your weak points',
            text: 'At your level, the biggest gains come from improving your lowest-scoring categories. Check the detailed analysis above and prioritize the areas with the most room for improvement.',
            source: 'looksmax.org'
        },
        {
            title: 'Soft maxxing essentials',
            text: 'Upgrade your fashion, get a hairstyle that suits your face shape, whiten your teeth, and develop good posture. These "soft" improvements can add 1-2 points to your overall appearance.',
            source: 'looksmax.org'
        }
    ],
    high: [
        {
            title: 'Maintain and protect',
            text: 'You are in the top tier. Focus on maintenance: consistent skincare, fitness routine, quality sleep, and stress management. At this level, preventing regression is as important as seeking improvement.',
            source: 'looksmax.org'
        },
        {
            title: 'Status and confidence maxxing',
            text: 'With strong looks, focus on complementary improvements: build an impressive physique, develop confident body language, improve fashion sense, and cultivate social skills. These compound with your physical advantages.',
            source: 'looksmax.org'
        }
    ]
};

// Percentile descriptions
const PERCENTILE_MAP = {
    1: 'Bottom 10%', 2: 'Bottom 10%',
    3: 'Below Average', 4: 'Below Average',
    5: 'Average', 6: 'Average',
    7: 'Above Average', 8: 'Above Average',
    9: 'Top 10%', 10: 'Top 1%'
};

function getScoreLevel(score) {
    if (score <= 40) return 'low';
    if (score <= 65) return 'mid';
    return 'high';
}

function getScoreLabel(score) {
    if (score <= 30) return { text: 'Low', class: 'score-low' };
    if (score <= 45) return { text: 'Below Avg', class: 'score-low' };
    if (score <= 55) return { text: 'Average', class: 'score-mid' };
    if (score <= 70) return { text: 'Above Avg', class: 'score-mid' };
    if (score <= 85) return { text: 'High', class: 'score-high' };
    return { text: 'Top 1%', class: 'score-high' };
}

function getBarClass(score) {
    if (score <= 40) return 'bar-low';
    if (score <= 65) return 'bar-mid';
    return 'bar-high';
}

function getTipsForCategory(category, score) {
    const level = getScoreLevel(score);
    const categoryData = TIPS_DATABASE[category];
    if (!categoryData) return [];
    return categoryData.tips[level] || [];
}

function getOverallTips(overallScore) {
    if (overallScore <= 4) return GENERAL_TIPS.low;
    if (overallScore <= 7) return GENERAL_TIPS.mid;
    return GENERAL_TIPS.high;
}
