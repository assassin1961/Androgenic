// Product recommendations database
export const PRODUCTS = {
  skin: {
    cleanser: [
      { name: 'CeraVe Hydrating Cleanser', price: '$16', rating: 4.8, why: 'Gentle, non-stripping, contains ceramides. Best for daily use.' },
      { name: 'La Roche-Posay Toleriane', price: '$15', rating: 4.7, why: 'Minimal ingredients, perfect for sensitive skin types.' },
    ],
    moisturizer: [
      { name: 'CeraVe PM Moisturizer', price: '$19', rating: 4.8, why: 'Lightweight with niacinamide. Won\'t clog pores.' },
      { name: 'Neutrogena Hydro Boost', price: '$20', rating: 4.6, why: 'Hyaluronic acid base. Great under SPF.' },
    ],
    sunscreen: [
      { name: 'EltaMD UV Clear SPF 46', price: '$39', rating: 4.9, why: 'Gold standard. No white cast, good under makeup.' },
      { name: 'Supergoop Unseen Sunscreen', price: '$38', rating: 4.7, why: 'Invisible finish, doubles as primer.' },
    ],
    retinol: [
      { name: 'The Ordinary Retinol 0.5%', price: '$9', rating: 4.5, why: 'Budget-friendly starter retinol. Build up slowly.' },
      { name: 'Differin Adapalene Gel', price: '$15', rating: 4.7, why: 'OTC retinoid, great for acne and anti-aging.' },
    ],
    vitaminC: [
      { name: 'Timeless Vitamin C+E+Ferulic', price: '$25', rating: 4.6, why: 'Dupe for SkinCeuticals at 1/5 the price.' },
      { name: 'SkinCeuticals C E Ferulic', price: '$176', rating: 4.9, why: 'The gold standard. Worth it if budget allows.' },
    ],
  },
  jawline: {
    gum: [
      { name: 'Mastic Gum (Greek)', price: '$22', rating: 4.7, why: 'Hardest gum available. Best for masseter hypertrophy.' },
      { name: 'Falim Gum', price: '$8', rating: 4.5, why: 'Affordable, very tough. Great starter chewing gum.' },
    ],
    device: [
      { name: 'Jawzrsize Pop N Go', price: '$25', rating: 4.3, why: 'Progressive resistance. Good supplement to gum chewing.' },
    ],
  },
  eyes: {
    eyeCream: [
      { name: 'The INKEY List Caffeine Cream', price: '$10', rating: 4.5, why: 'Reduces puffiness and dark circles. Best budget pick.' },
      { name: 'The Ordinary Caffeine Solution', price: '$8', rating: 4.4, why: 'Lightweight serum for dark circles.' },
    ],
    eyeDrops: [
      { name: 'Lumify Eye Drops', price: '$12', rating: 4.8, why: 'Whitens eyes without rebound redness.' },
    ],
  },
  hair: {
    minoxidil: [
      { name: 'Kirkland Minoxidil 5%', price: '$20', rating: 4.6, why: 'Same formula as Rogaine at half the price.' },
      { name: 'Hims Minoxidil', price: '$30', rating: 4.5, why: 'Convenient dropper, subscription option.' },
    ],
    shampoo: [
      { name: 'Nizoral A-D Ketoconazole', price: '$15', rating: 4.6, why: 'Anti-DHT shampoo. Use 2-3x per week.' },
      { name: 'Biotin Shampoo (Pura D\'or)', price: '$29', rating: 4.4, why: 'DHT blocking blend with biotin.' },
    ],
    supplement: [
      { name: 'Nutrafol Men', price: '$88', rating: 4.5, why: 'Premium hair supplement. Clinically studied.' },
    ],
  },
  tools: [
    { name: 'Gua Sha Stone (Jade)', price: '$12', rating: 4.6, why: 'Facial massage tool. Improves circulation and defines jawline.' },
    { name: 'Ice Roller', price: '$10', rating: 4.5, why: 'Reduces puffiness, tightens skin. Use in the morning.' },
    { name: 'Derma Roller 0.5mm', price: '$14', rating: 4.4, why: 'Boosts collagen and product absorption on face.' },
    { name: 'Derma Roller 1.5mm', price: '$16', rating: 4.3, why: 'For scalp use with minoxidil. Use weekly.' },
    { name: 'Silk Pillowcase', price: '$25', rating: 4.7, why: 'Reduces friction on skin and hair while sleeping.' },
  ],
};

export const getProductsForCategory = (category) => {
  return PRODUCTS[category] || {};
};

export const getToolRecommendations = () => {
  return PRODUCTS.tools;
};

export const getAllProducts = () => {
  const all = [];
  Object.entries(PRODUCTS).forEach(([cat, items]) => {
    if (cat === 'tools') {
      items.forEach((item) => all.push({ ...item, category: 'tools' }));
    } else {
      Object.entries(items).forEach(([subcat, products]) => {
        products.forEach((item) => all.push({ ...item, category: cat, subcategory: subcat }));
      });
    }
  });
  return all;
};
