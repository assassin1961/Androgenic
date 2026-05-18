import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Data ──────────────────────────────────────────────────────────────────────

const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];

const SKIN_TONES = [
  { id: 'fair', label: 'Fair', hex: '#FDEBD0' },
  { id: 'light', label: 'Light', hex: '#F5CBA7' },
  { id: 'medium', label: 'Medium', hex: '#E0B888' },
  { id: 'olive', label: 'Olive', hex: '#C49A6C' },
  { id: 'tan', label: 'Tan', hex: '#A0785A' },
  { id: 'dark', label: 'Dark', hex: '#6B4C3B' },
];

const BODY_TYPES = [
  { id: 'slim', label: 'Slim', icon: 'body-outline' },
  { id: 'athletic', label: 'Athletic', icon: 'fitness-outline' },
  { id: 'average', label: 'Average', icon: 'person-outline' },
  { id: 'broad', label: 'Broad', icon: 'shield-outline' },
  { id: 'heavy', label: 'Heavy', icon: 'resize-outline' },
];

const COLOR_RECOMMENDATIONS = {
  fair: {
    best: [
      { name: 'Navy', hex: '#1B2A4A' },
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Forest Green', hex: '#228B22' },
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Dusty Rose', hex: '#DCAE96' },
      { name: 'Camel', hex: '#C19A6B' },
      { name: 'Lavender', hex: '#B57EDC' },
      { name: 'Ivory', hex: '#FFFFF0' },
    ],
    avoid: [
      { name: 'Orange', hex: '#FF8C00' },
      { name: 'Bright Yellow', hex: '#FFD700' },
      { name: 'Neon Green', hex: '#39FF14' },
      { name: 'Khaki', hex: '#C3B091' },
    ],
    warmth: 'cool',
  },
  light: {
    best: [
      { name: 'Royal Blue', hex: '#4169E1' },
      { name: 'Emerald', hex: '#50C878' },
      { name: 'Plum', hex: '#8E4585' },
      { name: 'Rust', hex: '#B7410E' },
      { name: 'Cream', hex: '#FFFDD0' },
      { name: 'Sage', hex: '#9DC183' },
      { name: 'Coral', hex: '#FF7F50' },
      { name: 'Stone', hex: '#928E85' },
    ],
    avoid: [
      { name: 'Washed Pastels', hex: '#E8D5D5' },
      { name: 'Beige', hex: '#D2B48C' },
      { name: 'Light Gray', hex: '#C0C0C0' },
      { name: 'Pale Pink', hex: '#FFD1DC' },
    ],
    warmth: 'cool',
  },
  medium: {
    best: [
      { name: 'Teal', hex: '#008080' },
      { name: 'Maroon', hex: '#800000' },
      { name: 'Mustard', hex: '#E1AD01' },
      { name: 'Olive', hex: '#808000' },
      { name: 'Cobalt', hex: '#0047AB' },
      { name: 'Terracotta', hex: '#E2725B' },
      { name: 'Wine', hex: '#722F37' },
      { name: 'Cream', hex: '#FFFDD0' },
    ],
    avoid: [
      { name: 'Neon Pink', hex: '#FF6EC7' },
      { name: 'Neon Green', hex: '#39FF14' },
      { name: 'Pale Lavender', hex: '#DCD0FF' },
      { name: 'Pale Mint', hex: '#C0F0DB' },
    ],
    warmth: 'warm',
  },
  olive: {
    best: [
      { name: 'Earth Brown', hex: '#7B5B3A' },
      { name: 'Rust', hex: '#B7410E' },
      { name: 'Burnt Orange', hex: '#CC5500' },
      { name: 'Deep Green', hex: '#006400' },
      { name: 'Warm Brown', hex: '#964B00' },
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Coral', hex: '#FF7F50' },
      { name: 'Off-White', hex: '#FAF9F6' },
    ],
    avoid: [
      { name: 'Bright Pink', hex: '#FF69B4' },
      { name: 'Baby Blue', hex: '#89CFF0' },
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'Hot Pink', hex: '#FF1493' },
    ],
    warmth: 'warm',
  },
  tan: {
    best: [
      { name: 'Royal Purple', hex: '#7851A9' },
      { name: 'Deep Red', hex: '#8B0000' },
      { name: 'Emerald', hex: '#50C878' },
      { name: 'Turquoise', hex: '#40E0D0' },
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Chocolate', hex: '#7B3F00' },
      { name: 'Cream', hex: '#FFFDD0' },
      { name: 'Sapphire', hex: '#0F52BA' },
    ],
    avoid: [
      { name: 'Pastel Pink', hex: '#FFD1DC' },
      { name: 'Pastel Yellow', hex: '#FDFD96' },
      { name: 'Washed Blue', hex: '#B0C4DE' },
      { name: 'Pale Green', hex: '#C0F0DB' },
    ],
    warmth: 'warm',
  },
  dark: {
    best: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Cobalt', hex: '#0047AB' },
      { name: 'Red', hex: '#E60000' },
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Emerald', hex: '#50C878' },
      { name: 'Orange', hex: '#FF8C00' },
      { name: 'Fuchsia', hex: '#FF00FF' },
      { name: 'Royal Blue', hex: '#4169E1' },
    ],
    avoid: [
      { name: 'Brown', hex: '#6B4226' },
      { name: 'Dark Navy', hex: '#0A0A2E' },
      { name: 'Muted Olive', hex: '#6B6B37' },
      { name: 'Charcoal', hex: '#36454F' },
    ],
    warmth: 'warm',
  },
};

const getWardrobeEssentials = (skinTone, faceShape) => {
  const colors = COLOR_RECOMMENDATIONS[skinTone];
  const warmth = colors?.warmth || 'warm';
  const bestColors = colors?.best || [];
  const chinoColor = warmth === 'warm' ? 'Khaki or Olive' : 'Stone or Slate';
  const watchMetal = warmth === 'warm' ? 'Gold' : 'Silver';
  const tshirtColor = bestColors[0]?.name || 'Navy';

  const sunglassesMap = {
    Oval: 'Aviator or Wayfarer',
    Round: 'Angular Wayfarers or Square',
    Square: 'Round or Aviator',
    Heart: 'Aviator or Bottom-heavy frames',
    Oblong: 'Oversized or Wraparound',
    Diamond: 'Oval or Rimless',
  };

  return [
    {
      name: 'White Dress Shirt',
      why: 'The ultimate foundational piece. Works for every occasion from casual to formal.',
      tip: 'Get it tailored at the waist for a slim, clean silhouette.',
      color: '#FFFFFF',
      colorName: 'White',
    },
    {
      name: 'Navy Blazer',
      why: 'Instantly elevates any outfit. Pairs with jeans or dress pants.',
      tip: 'Unstructured blazers work for casual; structured for formal events.',
      color: '#1B2A4A',
      colorName: 'Navy',
    },
    {
      name: 'Dark Denim Jeans',
      why: 'Versatile, slimming, and works across all body types.',
      tip: 'Slim-straight fit is universally flattering. No distressing for a clean look.',
      color: '#1A1A2E',
      colorName: 'Dark Indigo',
    },
    {
      name: 'Black Leather Belt',
      why: 'A quality belt is noticed more than you think.',
      tip: 'Match belt color to shoe color always.',
      color: '#1A1A1A',
      colorName: 'Black',
    },
    {
      name: 'White Minimalist Sneakers',
      why: 'Clean, modern, and pairs with everything from shorts to suits.',
      tip: 'Keep them immaculate. Dirty white sneakers ruin an outfit.',
      color: '#F5F5F5',
      colorName: 'White',
    },
    {
      name: 'Gray Crewneck Sweater',
      why: 'Effortlessly stylish layering piece that works year-round.',
      tip: 'Merino wool or high-quality cotton. Avoid pilling fabrics.',
      color: '#808080',
      colorName: 'Heather Gray',
    },
    {
      name: 'Chinos',
      why: `${chinoColor} chinos bridge the gap between casual and smart.`,
      tip: 'Tapered leg, no break at the ankle for a modern fit.',
      color: warmth === 'warm' ? '#BDB76B' : '#708090',
      colorName: chinoColor,
    },
    {
      name: 'Leather Jacket',
      why: 'Timeless edge piece. A well-fitted leather jacket never goes out of style.',
      tip: 'Black or dark brown. Biker or bomber style based on your body type.',
      color: '#2C2C2C',
      colorName: 'Black',
    },
    {
      name: 'Watch',
      why: `${watchMetal} tones complement your skin undertone perfectly.`,
      tip: `Invest in a quality ${watchMetal.toLowerCase()} watch. It says a lot about you.`,
      color: warmth === 'warm' ? '#D4AF37' : '#C0C0C0',
      colorName: watchMetal,
    },
    {
      name: 'Sunglasses',
      why: `${sunglassesMap[faceShape] || 'Classic'} frames balance your ${faceShape || 'face'} shape.`,
      tip: `Go for ${sunglassesMap[faceShape] || 'classic'} styles to complement your face geometry.`,
      color: '#2C2C2C',
      colorName: 'Black/Tortoise',
    },
    {
      name: 'Dress Shoes',
      why: 'Oxford or Derby shoes are non-negotiable for a polished look.',
      tip: 'Brown for versatility, black for formal. Always keep them polished.',
      color: '#3D2B1F',
      colorName: 'Dark Brown',
    },
    {
      name: 'Fitted T-Shirts',
      why: `${tshirtColor} complements your skin tone and works as a go-to daily piece.`,
      tip: 'Crew neck for oval/round faces, V-neck for square/diamond faces.',
      color: bestColors[0]?.hex || '#1B2A4A',
      colorName: tshirtColor,
    },
  ];
};

const getFaceAccessories = (faceShape) => {
  const data = {
    Oval: {
      sunglasses: {
        rec: 'Aviator, Wayfarer, or Round frames',
        why: 'Your balanced proportions work with almost any frame style. Aviators and Wayfarers are your sweet spot.',
      },
      eyewear: {
        rec: 'Browline or Rectangular frames',
        why: 'Subtle angular frames highlight your natural symmetry without competing with it.',
      },
      facialHair: {
        rec: 'Any style -- stubble, full beard, or goatee',
        why: 'Oval faces are the most versatile. Experiment freely with length and shape.',
      },
      jewelry: {
        rec: 'Medium-length chains, stud earrings',
        why: 'Keep accessories proportional. Medium chains draw the eye without overwhelming.',
      },
    },
    Round: {
      sunglasses: {
        rec: 'Angular Wayfarers, Square, or Rectangular frames',
        why: 'Sharp angles create contrast with soft, round features and add visual structure.',
      },
      eyewear: {
        rec: 'Rectangular or Angular frames',
        why: 'Straight lines and defined corners elongate your face and add definition.',
      },
      facialHair: {
        rec: 'Goatee or pointed beard styles',
        why: 'Angular facial hair creates a sharper jawline illusion and lengthens the face.',
      },
      jewelry: {
        rec: 'Longer pendant chains, angular earrings',
        why: 'Vertical elements elongate, making your face appear slimmer.',
      },
    },
    Square: {
      sunglasses: {
        rec: 'Round, Aviator, or Oval frames',
        why: 'Curved frames soften strong angular features and create balance.',
      },
      eyewear: {
        rec: 'Round or Oval frames with thin rims',
        why: 'Soft curves contrast your strong jawline beautifully.',
      },
      facialHair: {
        rec: 'Short stubble or rounded full beard',
        why: 'Rounded beard shapes soften the sharp jaw. Avoid blocky, angular beards.',
      },
      jewelry: {
        rec: 'Curved chains, round pendant earrings',
        why: 'Rounded jewelry complements rather than competes with your angular features.',
      },
    },
    Heart: {
      sunglasses: {
        rec: 'Aviator or Bottom-heavy frames',
        why: 'Wider bottoms balance the narrower chin and broader forehead.',
      },
      eyewear: {
        rec: 'Light, rimless, or low-set frames',
        why: 'Minimal frames up top avoid drawing attention to the wider forehead.',
      },
      facialHair: {
        rec: 'Full beard or wide jawline beard',
        why: 'Facial hair adds width at the chin, balancing the wider forehead.',
      },
      jewelry: {
        rec: 'Choker chains, wider earrings',
        why: 'Width at the neck and jaw area creates proportion with the forehead.',
      },
    },
    Oblong: {
      sunglasses: {
        rec: 'Oversized, Wraparound, or Wide frames',
        why: 'Wide frames add horizontal width, making your face appear more proportional.',
      },
      eyewear: {
        rec: 'Wide, bold frames or Browline',
        why: 'Horizontal emphasis breaks up the length and adds visual width.',
      },
      facialHair: {
        rec: 'Short, trimmed beard or sideburns',
        why: 'Side volume adds width. Avoid long goatees that elongate further.',
      },
      jewelry: {
        rec: 'Chokers, wide-set earrings, thick chains',
        why: 'Horizontal elements at the neck create the illusion of width.',
      },
    },
    Diamond: {
      sunglasses: {
        rec: 'Oval, Cat-eye, or Rimless frames',
        why: 'Gentle curves complement your angular cheekbones without adding more width.',
      },
      eyewear: {
        rec: 'Frames with detailing at the top',
        why: 'Top-heavy frames balance narrow forehead with prominent cheekbones.',
      },
      facialHair: {
        rec: 'Light stubble or chinstrap',
        why: 'Subtle facial hair softens the narrow chin without adding bulk at the cheeks.',
      },
      jewelry: {
        rec: 'Delicate chains, small studs',
        why: 'Understated pieces let your striking bone structure speak for itself.',
      },
    },
  };

  return data[faceShape] || data.Oval;
};

const GROOMING_ESSENTIALS = [
  {
    name: 'Fragrance',
    icon: 'rose-outline',
    color: '#D4AF37',
    recommendation: 'Choose based on your vibe: Fresh (citrus, aquatic) for daily wear, Woody (cedar, sandalwood) for evening sophistication, Spicy (cardamom, oud) for bold nights out.',
    tip: 'Apply to pulse points -- wrists, neck, behind ears. Never rub fragrance, let it settle.',
  },
  {
    name: 'Skincare Basics',
    icon: 'water-outline',
    color: '#4A90D9',
    recommendation: 'Cleanser, moisturizer, SPF 30+ daily. Add retinol at night for anti-aging. Keep it simple and consistent.',
    tip: 'Wash face morning and night. Moisturize on damp skin for better absorption.',
  },
  {
    name: 'Hair Products',
    icon: 'cut-outline',
    color: '#50C878',
    recommendation: 'Clay for matte texture, pomade for slick looks, sea salt spray for natural waves. Match product to your desired hold and shine.',
    tip: 'Apply to towel-dried hair. Less is more -- you can always add, never subtract.',
  },
  {
    name: 'Nail Care',
    icon: 'hand-left-outline',
    color: '#FF7F50',
    recommendation: 'Trim nails weekly, file edges smooth. Push back cuticles after showering. Clean under nails daily.',
    tip: 'Well-kept hands are one of the first things people notice up close.',
  },
  {
    name: 'Eyebrow Grooming',
    icon: 'eye-outline',
    color: '#B57EDC',
    recommendation: 'Tweeze strays between brows weekly. Brush up with a spoolie and trim any hairs above the brow line.',
    tip: 'Masculine brows are fuller -- shape subtly, never thin them out.',
  },
  {
    name: 'Lip Care',
    icon: 'happy-outline',
    color: '#FF6090',
    recommendation: 'SPF lip balm daily, exfoliate lips weekly with a sugar scrub. Hydrate from within.',
    tip: 'Avoid licking your lips -- saliva evaporates and worsens dryness.',
  },
  {
    name: 'Teeth Whitening',
    icon: 'sparkles-outline',
    color: '#FFFDD0',
    recommendation: 'Peroxide whitening strips 2x/year, electric toothbrush, tongue scraper daily. Limit coffee staining.',
    tip: 'A bright smile is the single most impactful grooming upgrade.',
  },
  {
    name: 'Cologne Layering',
    icon: 'layers-outline',
    color: '#1DE9B6',
    recommendation: 'Use matching scented body wash and deodorant as a base layer, then apply cologne. This creates depth and longevity.',
    tip: 'Unscented deodorant + cologne is better than competing scents.',
  },
];

const STYLE_RULES = [
  {
    rule: 'Fit is king -- clothes should hug, not hang',
    detail: 'A $30 shirt that fits perfectly will always look better than a $300 shirt that does not. Tailoring is the greatest style hack.',
    icon: 'resize-outline',
  },
  {
    rule: 'Monochrome makes you look taller',
    detail: 'Wearing one color family from head to toe creates an unbroken vertical line, adding the illusion of height.',
    icon: 'arrow-up-outline',
  },
  {
    rule: 'Invest in shoes and watches first',
    detail: 'People subconsciously judge your shoes and wrist. Quality here signals attention to detail.',
    icon: 'diamond-outline',
  },
  {
    rule: 'Less is more -- remove one accessory before leaving',
    detail: 'Over-accessorizing looks try-hard. Take off the last thing you put on and you will look effortlessly put together.',
    icon: 'remove-circle-outline',
  },
  {
    rule: 'Dress for the body you have, not the body you want',
    detail: 'Oversized clothes hide your physique. Clothes that fit your current frame will always look sharper.',
    icon: 'body-outline',
  },
];

// ─── Components ────────────────────────────────────────────────────────────────

const SectionTitle = ({ title, icon, delay = 0 }) => (
  <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={styles.sectionHeader}>
    <Ionicons name={icon} size={20} color={COLORS.accent} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </Animated.View>
);

const ColorSwatch = ({ color, size = 48 }) => (
  <View style={styles.swatchContainer}>
    <View style={[styles.swatch, { width: size, height: size, borderRadius: size / 2, backgroundColor: color.hex }]}>
      {color.hex === '#FFFFFF' || color.hex === '#FFFFF0' || color.hex === '#FFFDD0' || color.hex === '#FAF9F6' || color.hex === '#F5F5F5' ? (
        <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: 1, borderColor: COLORS.borderLight }]} />
      ) : null}
    </View>
    <Text style={styles.swatchName} numberOfLines={1}>{color.name}</Text>
    <Text style={styles.swatchHex}>{color.hex}</Text>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────

const StyleGuideScreen = ({ navigation }) => {
  const [faceShape, setFaceShape] = useState('Oval');
  const [skinTone, setSkinTone] = useState('medium');
  const [bodyType, setBodyType] = useState('average');

  const handleFaceShape = useCallback((shape) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFaceShape(shape);
  }, []);

  const handleSkinTone = useCallback((tone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSkinTone(tone);
  }, []);

  const handleBodyType = useCallback((type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBodyType(type);
  }, []);

  const colorData = COLOR_RECOMMENDATIONS[skinTone] || COLOR_RECOMMENDATIONS.medium;
  const wardrobeItems = getWardrobeEssentials(skinTone, faceShape);
  const accessories = getFaceAccessories(faceShape);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Style Lab</Text>
          <Text style={styles.headerSub}>Personalized Fashion Intelligence</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Profile Setup ── */}
        <SectionTitle title="Your Profile" icon="person-circle-outline" delay={100} />

        {/* Face Shape */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.profileRow}>
          <Text style={styles.profileLabel}>Face Shape</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
            {FACE_SHAPES.map((shape) => (
              <TouchableOpacity
                key={shape}
                onPress={() => handleFaceShape(shape)}
                style={[styles.pill, faceShape === shape && styles.pillActive]}
              >
                <Text style={[styles.pillText, faceShape === shape && styles.pillTextActive]}>{shape}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Skin Tone */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.profileRow}>
          <Text style={styles.profileLabel}>Skin Tone</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
            {SKIN_TONES.map((tone) => (
              <TouchableOpacity
                key={tone.id}
                onPress={() => handleSkinTone(tone.id)}
                style={[styles.toneBtn, skinTone === tone.id && styles.toneBtnActive]}
              >
                <View style={[styles.toneCircle, { backgroundColor: tone.hex }, skinTone === tone.id && styles.toneCircleActive]} />
                <Text style={[styles.toneLabel, skinTone === tone.id && styles.toneLabelActive]}>{tone.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Body Type */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)} style={styles.profileRow}>
          <Text style={styles.profileLabel}>Body Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
            {BODY_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt.id}
                onPress={() => handleBodyType(bt.id)}
                style={[styles.iconPill, bodyType === bt.id && styles.iconPillActive]}
              >
                <Ionicons
                  name={bt.icon}
                  size={18}
                  color={bodyType === bt.id ? COLORS.bgPrimary : COLORS.textSecondary}
                />
                <Text style={[styles.iconPillText, bodyType === bt.id && styles.iconPillTextActive]}>{bt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Section 2: Color Analysis ── */}
        <SectionTitle title="Color Analysis" icon="color-palette-outline" delay={300} />

        <Animated.View entering={FadeInDown.duration(400).delay(350)} style={styles.card}>
          <LinearGradient colors={GRADIENTS.glassGold} style={styles.cardGradient} />
          <Text style={styles.cardTitle}>Your Best Colors</Text>
          <Text style={styles.cardDesc}>These shades complement your skin tone beautifully.</Text>
          <View style={styles.swatchGrid}>
            {colorData.best.map((c, i) => (
              <ColorSwatch key={`best-${i}`} color={c} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={[styles.card, styles.cardAvoid]}>
          <Text style={styles.cardTitle}>Colors to Avoid</Text>
          <Text style={styles.cardDesc}>These shades may clash with your complexion.</Text>
          <View style={styles.swatchGrid}>
            {colorData.avoid.map((c, i) => (
              <ColorSwatch key={`avoid-${i}`} color={c} />
            ))}
          </View>
        </Animated.View>

        {/* ── Section 3: Wardrobe Essentials ── */}
        <SectionTitle title="Wardrobe Essentials" icon="shirt-outline" delay={450} />
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <Text style={styles.sectionDesc}>12 must-have items, personalized for your profile.</Text>
        </Animated.View>

        {wardrobeItems.map((item, idx) => (
          <Animated.View
            key={`wardrobe-${idx}`}
            entering={FadeInDown.duration(350).delay(520 + idx * 40)}
            style={styles.card}
          >
            <View style={styles.wardrobeHeader}>
              <View style={[styles.wardrobeColor, { backgroundColor: item.color }]}>
                {(item.color === '#FFFFFF' || item.color === '#F5F5F5' || item.color === '#FFFDD0') && (
                  <View style={[StyleSheet.absoluteFill, { borderRadius: 20, borderWidth: 1, borderColor: COLORS.borderLight }]} />
                )}
              </View>
              <View style={styles.wardrobeInfo}>
                <Text style={styles.wardrobeName}>{item.name}</Text>
                <Text style={styles.wardrobeColorName}>{item.colorName}</Text>
              </View>
              <View style={styles.wardrobeNumber}>
                <Text style={styles.wardrobeNumText}>{String(idx + 1).padStart(2, '0')}</Text>
              </View>
            </View>
            <Text style={styles.wardrobeWhy}>{item.why}</Text>
            <View style={styles.wardrobeTipRow}>
              <Ionicons name="bulb-outline" size={14} color={COLORS.accent} />
              <Text style={styles.wardrobeTip}>{item.tip}</Text>
            </View>
          </Animated.View>
        ))}

        {/* ── Section 4: Face Shape x Accessories ── */}
        <SectionTitle title={`${faceShape} Face Accessories`} icon="glasses-outline" delay={100} />
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Text style={styles.sectionDesc}>Accessories optimized for your {faceShape.toLowerCase()} face shape.</Text>
        </Animated.View>

        {[
          { key: 'sunglasses', icon: 'sunny-outline', label: 'Sunglasses' },
          { key: 'eyewear', icon: 'glasses-outline', label: 'Glasses / Eyewear' },
          { key: 'facialHair', icon: 'cut-outline', label: 'Facial Hair Style' },
          { key: 'jewelry', icon: 'diamond-outline', label: 'Jewelry' },
        ].map((item, idx) => (
          <Animated.View
            key={item.key}
            entering={FadeInDown.duration(350).delay(200 + idx * 60)}
            style={styles.card}
          >
            <View style={styles.accessoryHeader}>
              <View style={styles.accessoryIconWrap}>
                <Ionicons name={item.icon} size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.accessoryLabel}>{item.label}</Text>
            </View>
            <Text style={styles.accessoryRec}>{accessories[item.key].rec}</Text>
            <View style={styles.accessoryWhyRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.scoreExcellent} />
              <Text style={styles.accessoryWhy}>Best for your face: {accessories[item.key].why}</Text>
            </View>
          </Animated.View>
        ))}

        {/* ── Section 5: Grooming Essentials ── */}
        <SectionTitle title="Grooming Essentials" icon="sparkles-outline" delay={100} />

        {GROOMING_ESSENTIALS.map((item, idx) => (
          <Animated.View
            key={`groom-${idx}`}
            entering={FadeInDown.duration(350).delay(150 + idx * 50)}
            style={styles.card}
          >
            <View style={styles.groomHeader}>
              <View style={[styles.groomIconWrap, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.groomName}>{item.name}</Text>
            </View>
            <Text style={styles.groomRec}>{item.recommendation}</Text>
            <View style={styles.groomTipRow}>
              <Ionicons name="bulb-outline" size={14} color={COLORS.accent} />
              <Text style={styles.groomTip}>{item.tip}</Text>
            </View>
          </Animated.View>
        ))}

        {/* ── Section 6: Style Rules ── */}
        <SectionTitle title="5 Golden Style Rules" icon="trophy-outline" delay={100} />

        {STYLE_RULES.map((item, idx) => (
          <Animated.View
            key={`rule-${idx}`}
            entering={FadeInDown.duration(350).delay(150 + idx * 60)}
            style={styles.ruleCard}
          >
            <LinearGradient
              colors={idx === 0 ? GRADIENTS.glassGold : GRADIENTS.glass}
              style={styles.ruleGradient}
            />
            <View style={styles.ruleHeader}>
              <View style={styles.ruleNumberWrap}>
                <Text style={styles.ruleNumber}>{idx + 1}</Text>
              </View>
              <Ionicons name={item.icon} size={22} color={COLORS.accent} style={{ marginLeft: SPACING.md }} />
            </View>
            <Text style={styles.ruleText}>{item.rule}</Text>
            <Text style={styles.ruleDetail}>{item.detail}</Text>
          </Animated.View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  headerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: 2,
  },

  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  sectionDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },

  // Profile Setup
  profileRow: {
    marginBottom: SPACING.lg,
  },
  profileLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textGold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  pillScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'row',
  },

  // Face Shape Pills
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  pillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.bgPrimary,
  },

  // Skin Tone Circles
  toneBtn: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  toneBtnActive: {},
  toneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneCircleActive: {
    borderColor: COLORS.accent,
    ...SHADOWS.glow,
  },
  toneLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  toneLabelActive: {
    color: COLORS.textGold,
    fontWeight: '600',
  },

  // Body Type Icon Pills
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  iconPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  iconPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  iconPillTextActive: {
    color: COLORS.bgPrimary,
  },

  // Cards
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.md,
  },
  cardAvoid: {
    borderColor: 'rgba(255,59,48,0.2)',
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },

  // Color Swatches
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  swatchContainer: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.lg * 2 - SPACING.md * 3) / 4,
    marginBottom: SPACING.sm,
  },
  swatch: {
    ...SHADOWS.subtle,
  },
  swatchName: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  swatchHex: {
    fontSize: 9,
    color: COLORS.textTertiary,
    marginTop: 1,
    fontFamily: 'monospace',
  },

  // Wardrobe Essentials
  wardrobeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  wardrobeColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    ...SHADOWS.subtle,
  },
  wardrobeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  wardrobeName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  wardrobeColorName: {
    ...TYPOGRAPHY.small,
    color: COLORS.textGold,
    marginTop: 1,
  },
  wardrobeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardrobeNumText: {
    ...TYPOGRAPHY.small,
    color: COLORS.accent,
    fontWeight: '700',
  },
  wardrobeWhy: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  wardrobeTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212,175,55,0.06)',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  wardrobeTip: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Accessories
  accessoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  accessoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessoryLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  accessoryRec: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  accessoryWhyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  accessoryWhy: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Grooming
  groomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  groomIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groomName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  groomRec: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  groomTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212,175,55,0.06)',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  groomTip: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Style Rules
  ruleCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  ruleGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.md,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ruleNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumber: {
    ...TYPOGRAPHY.body,
    color: COLORS.bgPrimary,
    fontWeight: '800',
  },
  ruleText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
  ruleDetail: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});

export default StyleGuideScreen;
