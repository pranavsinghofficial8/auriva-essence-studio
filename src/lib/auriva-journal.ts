import journalMorning from "@/assets/journal-morning.jpg";
import journalDesk from "@/assets/journal-desk.jpg";
import journalReset from "@/assets/journal-reset.jpg";
import journalDinner from "@/assets/journal-dinner.jpg";
import journalHowto from "@/assets/journal-howto.jpg";

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const journalPosts: JournalPost[] = [
  {
    slug: "which-auriva-scent-matches-your-mood",
    title: "A five-minute ritual before the day begins",
    excerpt: "A quick, personal guide to picking a fragrance based on how you want to feel.",
    category: "Morning",
    readTime: "4 min",
    image: journalMorning,
    intro:
      "Choose incense the way you would choose music for a room — not by the name of the note, but by the feeling you want to be left with.",
    sections: [
      {
        heading: "Start with the feeling, not the fragrance",
        body: [
          "Most people pick incense by ingredient. We'd suggest the opposite: decide what you want the next half hour to feel like, and let the blend follow. Every Auriva fragrance is built around an aura — a single emotional quality it is designed to support.",
          "If you want to soften, reach for Jasmine (softness) or Rose Amber (comfort). If you need to settle, Nagchampa (grounding) and Sandalwood (balance) are the steadiest in the range.",
        ],
      },
      {
        heading: "When you need to think clearly",
        body: [
          "Lemongrass & Citronella carries clarity — bright, green and citrus-led, it cuts through mental fog without becoming sharp. Camphor & Tulsi is its herbal cousin: purity, a clean reset for a room that has gone stale.",
        ],
      },
      {
        heading: "When the evening asks you to stay",
        body: [
          "Oudh brings depth: smoke, resin and a slow warmth that suits reflection. Vanilla Amber is stillness — powdery, quiet, ideal beside a book. Palo Santo sits between the two, warm and resinous, best when there is someone else in the room.",
        ],
      },
      {
        heading: "A simple rule",
        body: [
          "Match the fragrance to the intention, then let the ritual do the rest. Light it, pause, begin again.",
        ],
      },
    ],
  },
  {
    slug: "a-guide-to-aurivas-10-fragrances",
    title: "The quiet transition from work to home",
    excerpt: "The full lineup, one by one — the aura, ritual, and inspiration behind each scent.",
    category: "Evening",
    readTime: "7 min",
    image: journalDesk,
    intro:
      "Ten blends across three formats — incense sticks, cones and bambooless sticks. Each one carries an aura: the quality it is made to support.",
    sections: [
      {
        heading: "Incense sticks — the everyday ritual",
        body: [
          "Jasmine · softness. Rich and luminous, jasmine gently opens the heart and invites tenderness. Best for self-care rituals and slow evenings.",
          "Nagchampa · grounding. Earthy champa over warm sandalwood, with a faint clove edge. It anchors wandering thoughts — a meditation and breathwork blend.",
          "Palo Santo · intimacy. Sacred wood, resin and a subtle citrus sweetness. It makes room for closeness and unhurried conversation.",
          "Sandalwood · balance. Creamy, woody, deeply calming — the blend to light before prayer, journaling or centred work.",
        ],
      },
      {
        heading: "Cones — for slower moments",
        body: [
          "Oudh · depth. Aged oud, dark resin and saffron. Steady and enduring, built for evening reflection.",
          "Vanilla Amber · stillness. Creamy vanilla and golden amber, powdery and soft — mental calm in a cone.",
          "Rose Amber · comfort. Rose petals softened by amber resin. A fragrance that feels like reassurance.",
        ],
      },
      {
        heading: "Bambooless sticks — a deeper ritual",
        body: [
          "Coconut & Cinnamon · comfort. Warm, sweet and gently spiced, it wraps a room in familiarity.",
          "Lemongrass & Citronella · clarity. Bright and uplifting, for focused work and journaling.",
          "Camphor & Tulsi · purity. Fresh, herbal and cleansing — a morning reset.",
        ],
      },
    ],
  },
  {
    slug: "morning-midday-night-how-to-time-your-incense",
    title: "A midday reset for crowded thoughts",
    excerpt: "How to build incense into different moments of the day.",
    category: "Ritual",
    readTime: "5 min",
    image: journalReset,
    intro:
      "Incense is most useful when it marks a transition — the line between one part of the day and the next.",
    sections: [
      {
        heading: "Morning — the reset",
        body: [
          "Light something clean and green before the first message of the day. Camphor & Tulsi or Lemongrass & Citronella clear a room quickly and set a tone of attention rather than urgency.",
          "Give it five minutes with a window slightly open. The point is not to fill the room; it is to change it.",
        ],
      },
      {
        heading: "Midday — the pause between tasks",
        body: [
          "A thirty-minute stick is a natural timer. Sandalwood is the steadiest midday choice: it settles the nervous system without pulling you into sleep.",
        ],
      },
      {
        heading: "Night — the unwind",
        body: [
          "Cones burn closer to the earth and give a fuller fragrance for shorter time. Vanilla Amber, Rose Amber or Oudh suit an evening that has finally slowed down. Let it finish before you sleep, and never leave a lit stick unattended.",
        ],
      },
    ],
  },
  {
    slug: "japan-france-india-three-ways-the-world-burns-incense",
    title: "Setting the table for unhurried company",
    excerpt: "The mind, heart and soul cultural history behind Auriva.",
    category: "Gathering",
    readTime: "6 min",
    image: journalDinner,
    intro:
      "Fragrance has meant something different everywhere it has been practiced. Auriva was built by borrowing from three traditions — which is why it doesn't belong to just one place.",
    sections: [
      {
        heading: "Japan — the mind",
        body: [
          "Kōdō, 'the way of fragrance', treats incense as something to be listened to rather than simply smelled. Sessions are quiet, formal and attentive; the fragrance is a subject, not a backdrop.",
          "Auriva takes its restraint from here — the belief that a scent should never be louder than the moment it accompanies.",
        ],
      },
      {
        heading: "France — the heart",
        body: [
          "In Grasse, perfumers learned to build scent in layers: top, heart and base, so a fragrance unfolds over time instead of announcing itself at the door.",
          "Auriva takes its structure from here. Every blend is composed to open, settle and finish.",
        ],
      },
      {
        heading: "India — the soul",
        body: [
          "Incense has walked beside prayer and meditation for centuries, the smoke standing in for the material becoming intangible. It is where our flowers, our artisans and our hand-rolling come from.",
          "Auriva takes its purpose from here.",
        ],
      },
      {
        heading: "Mind · heart · soul",
        body: [
          "Japanese restraint, French composition, Indian ritual — Auriva is where the three meet. Not a regional incense brand, but a global one, built from what scent has meant everywhere.",
        ],
      },
    ],
  },
  {
    slug: "how-to-burn-incense-properly",
    title: "How to burn incense properly (a beginner's guide)",
    excerpt: "Practical lighting, holders, and etiquette for first-timers.",
    category: "How-to",
    readTime: "4 min",
    image: journalHowto,
    intro:
      "Incense asks very little of you, but a few small habits make the difference between smoke and a ritual.",
    sections: [
      {
        heading: "Lighting",
        body: [
          "Hold the flame to the coated tip for a few seconds until it catches, then let it burn for about ten seconds. Gently fan it out — don't blow hard. What you want is a glowing ember, not a flame.",
          "If the ember dies within a minute, relight it. Fresh sticks occasionally need a second attempt.",
        ],
      },
      {
        heading: "Holders and placement",
        body: [
          "Always use a heat-safe holder with a tray to catch ash — every Auriva box includes one. Place it on a stable, non-flammable surface away from curtains, paper and anything that moves in a draught.",
          "Cones need a flat, ash-friendly dish; bambooless sticks burn hotter and longer, so give them room.",
        ],
      },
      {
        heading: "Air and etiquette",
        body: [
          "Crack a window. A little airflow carries the fragrance through the room and keeps the smoke soft rather than dense. One stick is enough for most spaces — if you can taste it, it's too much.",
          "Never leave incense burning unattended or near sleeping people or pets, and let the ash cool completely before clearing it.",
        ],
      },
      {
        heading: "Afterwards",
        body: [
          "Store the remaining sticks in their box, away from sunlight and humidity, so the essential oils keep their character.",
        ],
      },
    ],
  },
];

export function getJournalPost(slug: string) {
  return journalPosts.find((p) => p.slug === slug);
}
