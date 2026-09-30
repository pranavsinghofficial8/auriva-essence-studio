import prodJasmine from "@/assets/prod-jasmine.jpg";
import prodNagchampa from "@/assets/prod-nagchampa.jpg";
import prodPaloSanto from "@/assets/prod-palo-santo.jpg";
import prodSandalwood from "@/assets/prod-sandalwood.jpg";
import prodOudh from "@/assets/prod-oudh.jpg";
import prodRoseAmber from "@/assets/prod-rose-amber.jpg";
import prodVanillaAmber from "@/assets/prod-vanilla-amber.jpg";
import prodCoconutCinnamon from "@/assets/prod-coconut-cinnamon.jpg";
import prodLemongrass from "@/assets/prod-lemongrass-citronella.jpg";
import prodCamphorTulsi from "@/assets/prod-camphor-tulsi.jpg";

import bannerSticks from "@/assets/banner-sticks.jpg";
import bannerCones from "@/assets/banner-cones.jpg";
import bannerDhoop from "@/assets/banner-dhoop.jpg";

import ritualClarity from "@/assets/ritual-clarity.jpg";
import ritualComfort from "@/assets/ritual-comfort.jpg";
import ritualGrounding from "@/assets/ritual-grounding.jpg";
import ritualStillness from "@/assets/ritual-stillness.jpg";
import gridPetals from "@/assets/grid-petals.jpg";

export type AuraName =
  | "softness"
  | "grounding"
  | "intimacy"
  | "balance"
  | "stillness"
  | "depth"
  | "comfort"
  | "purity"
  | "clarity";

export type CategorySlug = "incense-sticks" | "incense-cones" | "bambooless-sticks";

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  aura: AuraName;
  auraLabel: string;
  quality: string;
  oneLiner: string;
  poem: string;
  notes: string;
  bestFor: string;
  price: number;
  contents: string;
  burn: string;
  image: string;
  /** Invitation to the fragrance's ritual, shown in the product page's aura band. */
  ritual: string;
  /** Background photo for the aura band; falls back to the category banner. */
  ritualImage?: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  banner: string;
  burn: string;
};

export const categories: Category[] = [
  {
    slug: "incense-sticks",
    name: "Incense Sticks",
    eyebrow: "The Everyday Ritual",
    headline: "Four fragrances. One quiet hour.",
    intro:
      "Hand-rolled on a base of renewed flowers, charcoal-free and infused with essential oils. A thin thread of smoke that marks the beginning of something slower.",
    banner: bannerSticks,
    burn: "30–35 min ritual",
  },
  {
    slug: "incense-cones",
    name: "Incense Cones",
    eyebrow: "For Slower Moments",
    headline: "A denser drift, a deeper pause.",
    intro:
      "Compact, unhurried and richly resinous. Cones burn closer to the earth — a fuller fragrance for evenings that ask you to stay a little longer.",
    banner: bannerCones,
    burn: "25–30 min ritual",
  },
  {
    slug: "bambooless-sticks",
    name: "Bambooless Sticks",
    eyebrow: "A Deeper Ritual",
    headline: "No core. Only fragrance.",
    intro:
      "Solid, bamboo-less and slow-burning. Without a bamboo spine there is nothing between you and the blend — a cleaner, rounder, longer ritual.",
    banner: bannerDhoop,
    burn: "40–45 min ritual",
  },
];

export const products: Product[] = [
  {
    slug: "jasmine",
    name: "Jasmine",
    category: "incense-sticks",
    aura: "softness",
    auraLabel: "Softness",
    quality: "Emotional Openness",
    oneLiner: "Rich and sensual with a luminous sweetness.",
    poem: "Jasmine gently opens the heart and invites tenderness.",
    notes: "Floral, soft musk, faint honey",
    bestFor: "Self-care rituals, romantic evenings",
    price: 195,
    contents: "40 sticks and 1 holder",
    burn: "30–35 min ritual",
    image: prodJasmine,
    ritual:
      "Light it when the day has asked too much of you. Let the first thread of smoke rise, unclench your jaw, and offer yourself the tenderness you give everyone else. Stay until the room feels gentle again.",
  },
  {
    slug: "nagchampa",
    name: "Nagchampa",
    category: "incense-sticks",
    aura: "grounding",
    auraLabel: "Grounding",
    quality: "Stability",
    oneLiner: "Earthy and floral with a quiet strength.",
    poem: "Nagchampa anchors wandering thoughts and brings the body back to stillness.",
    notes: "Floral champa, warm sandalwood, soft resin, faint clove",
    bestFor: "Meditation, breathwork, slow mornings",
    price: 195,
    contents: "40 sticks and 1 holder",
    burn: "30–35 min ritual",
    image: prodNagchampa,
    ritual:
      "Light it when your thoughts are racing ahead of you. Sit with your feet on the floor, follow the smoke down to your breath, and let its earthiness draw you back into your body, one slow exhale at a time.",
    ritualImage: ritualGrounding,
  },
  {
    slug: "palo-santo",
    name: "Palo Santo",
    category: "incense-sticks",
    aura: "intimacy",
    auraLabel: "Intimacy",
    quality: "Warm Presence",
    oneLiner: "A sacred wood known for its cleansing warmth.",
    poem: "Soft, resinous and subtly sweet — it creates space for closeness and deeper connection.",
    notes: "Warm wood, resin, subtle citrus sweetness",
    bestFor: "Evening conversations, reflective solitude",
    price: 195,
    contents: "40 sticks and 1 holder",
    burn: "30–35 min ritual",
    image: prodPaloSanto,
    ritual:
      "Light it before someone you love walks in, or before an evening kept just for yourself. Put the phone away, pour something warm, and let the sweet, woody smoke draw you closer.",
  },
  {
    slug: "sandalwood",
    name: "Sandalwood",
    category: "incense-sticks",
    aura: "balance",
    auraLabel: "Balance",
    quality: "Harmony",
    oneLiner: "Creamy, woody and deeply calming.",
    poem: "Sandalwood restores emotional equilibrium and softens inner noise.",
    notes: "Smooth sandalwood, warm milkiness, light earth",
    bestFor: "Prayer, journaling, centered work sessions",
    price: 195,
    contents: "40 sticks and 1 holder",
    burn: "30–35 min ritual",
    image: prodSandalwood,
    ritual:
      "Light it between one part of the day and the next. Close your eyes for a few long breaths and let the creamy woods quiet the noise. Return when you feel level again.",
  },
  {
    slug: "oudh",
    name: "Oudh",
    category: "incense-cones",
    aura: "depth",
    auraLabel: "Depth",
    quality: "Inner Strength",
    oneLiner: "Smoky richness layered with resinous warmth.",
    poem: "A fragrance that feels steady and enduring.",
    notes: "Aged oud, dark resin, subtle saffron, warm wood, leather",
    bestFor: "Evening rituals, deep reflection",
    price: 185,
    contents: "40 cones and 1 holder",
    burn: "25–30 min ritual",
    image: prodOudh,
    ritual:
      "Light a cone when you need to steady yourself. Let the dark, resinous smoke settle around you and sit with it a while. There is strength in staying still.",
  },
  {
    slug: "vanilla-amber",
    name: "Vanilla Amber",
    category: "incense-cones",
    aura: "stillness",
    auraLabel: "Stillness",
    quality: "Quiet Mind",
    oneLiner: "Soft, powdery warmth with subtle sweetness.",
    poem: "Encourages mental calm and gentle introspection.",
    notes: "Creamy vanilla, golden amber, soft resin, warm sweetness",
    bestFor: "Reading rituals, silent reflection",
    price: 185,
    contents: "40 cones and 1 holder",
    burn: "25–30 min ritual",
    image: prodVanillaAmber,
    ritual:
      "Light a cone at dusk, dim the lamps and let the room go quiet. Nothing needs answering now. Watch the smoke curl, breathe with it, and let your mind come to rest.",
    ritualImage: ritualStillness,
  },
  {
    slug: "rose-amber",
    name: "Rose Amber",
    category: "incense-cones",
    aura: "comfort",
    auraLabel: "Comfort",
    quality: "Emotional Warmth",
    oneLiner: "Floral depth softened by amber resin.",
    poem: "A fragrance that feels like reassurance.",
    notes: "Rose petals, amber resin, soft sweetness",
    bestFor: "Night rituals, emotional grounding",
    price: 185,
    contents: "40 cones and 1 holder",
    burn: "25–30 min ritual",
    image: prodRoseAmber,
    ritual:
      "Light a cone when you need a little reassurance. Wrap yourself in something soft, let rose and warm amber fill the room, and remember that you are allowed to rest.",
    ritualImage: gridPetals,
  },
  {
    slug: "coconut-cinnamon",
    name: "Coconut & Cinnamon",
    category: "bambooless-sticks",
    aura: "comfort",
    auraLabel: "Comfort",
    quality: "Restored Ease",
    oneLiner: "Warm, sweet and gently spiced.",
    poem: "This blend wraps your space in familiarity and emotional warmth.",
    notes: "Cinnamon spice, creamy coconut, soft vanilla warmth",
    bestFor: "Night rituals, cozy evenings",
    price: 225,
    contents: "30 sticks and 1 holder",
    burn: "40–45 min ritual",
    image: prodCoconutCinnamon,
    ritual:
      "Light it on a slow evening at home. Let the warm spice and coconut fill the room, and settle into the ease of being exactly where you are.",
    ritualImage: ritualComfort,
  },
  {
    slug: "lemongrass-citronella",
    name: "Lemongrass & Citronella",
    category: "bambooless-sticks",
    aura: "clarity",
    auraLabel: "Clarity",
    quality: "Focus",
    oneLiner: "Bright, citrusy and uplifting.",
    poem: "Cuts through mental fog and invites sharpness of thought.",
    notes: "Lemongrass, citronella, green citrus, soft woods",
    bestFor: "Focused journaling, work sessions",
    price: 225,
    contents: "30 sticks and 1 holder",
    burn: "40–45 min ritual",
    image: prodLemongrass,
    ritual:
      "Light it before you begin: a page, a plan, a hard conversation. Open a window, take three bright breaths, and let the citrus clear the way for one clear thought.",
    ritualImage: ritualClarity,
  },
  {
    slug: "camphor-tulsi",
    name: "Camphor & Tulsi",
    category: "bambooless-sticks",
    aura: "purity",
    auraLabel: "Purity",
    quality: "Ease",
    oneLiner: "Fresh, herbal and purifying.",
    poem: "A cleansing blend that refreshes energy and clears stagnant spaces.",
    notes: "Camphor, tulsi leaves, green herbs, soft earth",
    bestFor: "Morning reset, spiritual cleansing",
    price: 225,
    contents: "30 sticks and 1 holder",
    burn: "40–45 min ritual",
    image: prodCamphorTulsi,
    ritual:
      "Light it to begin again, after a long week, a heavy day, or a room that feels stale. Open the windows and let the cool, clean smoke carry the old air out.",
  },
];

export const promises = [
  "100% charcoal-free",
  "Recycled flower base",
  "Long-lasting burn",
  "Handcrafted sustainably",
  "Essential oil infused",
  "Low-irritation smoke",
  "Eco-friendly packaging",
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function productsIn(slug: CategorySlug) {
  return products.filter((p) => p.category === slug);
}
