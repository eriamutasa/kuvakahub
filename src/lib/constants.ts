// Neutral Branding & Application Constants
export const APP_NAME = "KuvakaHub";
export const APP_TAGLINE = "Build in Zimbabwe with greater confidence — even when you're thousands of miles away.";
export const APP_SUBTITLE = "Connect with local professionals, compare quotations, track project milestones, and independently verify progress.";

export const LAUNCH_CITY = "Chinhoyi";

export const CHINHOYI_SUBURBS = [
  "Alaska",
  "Avelon",
  "Brundish",
  "Caves Area",
  "Cherima",
  "Chikonohono",
  "Chinhoyi Central",
  "Chitambo",
  "Cold Stream",
  "Gadzema",
  "Gunhill",
  "Hunyani",
  "Katanda",
  "Mapako",
  "Mupfure",
  "Mzari",
  "Orange Groove",
  "Rujeko",
  "Rusununguko",
  "Shackleton",
  "Sinoia Hill",
  "St Ives 1",
  "St Ives 2",
  "Whitecity",
  "Zvimba Park"
];

export const ZIMBABWE_CITIES = [
  "Chinhoyi",
  "Harare",
  "Bulawayo",
  "Mutare",
  "Gweru",
  "Kwekwe",
  "Masvingo",
  "Kadoma"
];

export const SERVICE_CATEGORIES = [
  {
    id: "cat-building",
    name: "Builders & Masonry",
    slug: "building",
    description: "Bricklaying, foundations, slab casting, and structural walling.",
    icon: "Hammer",
    popular: true
  },
  {
    id: "cat-plumbing",
    name: "Plumbers",
    slug: "plumbing",
    description: "Piping, drainage, borehole connections, septic tanks, and bathroom fitting.",
    icon: "Wrench",
    popular: true
  },
  {
    id: "cat-electrical",
    name: "Electricians",
    slug: "electrical",
    description: "Tubing, wiring, solar installation, distribution boards, and DB testing.",
    icon: "Zap",
    popular: true
  },
  {
    id: "cat-painting",
    name: "Painters",
    slug: "painting",
    description: "Interior/exterior painting, damp proofing, primer, and finishing coats.",
    icon: "Paintbrush",
    popular: false
  },
  {
    id: "cat-carpentry",
    name: "Carpenters",
    slug: "carpentry",
    description: "Roof trusses, door fitting, fitted kitchens, and built-in cupboards.",
    icon: "Axe",
    popular: false
  },
  {
    id: "cat-tiling",
    name: "Tilers",
    slug: "tiling",
    description: "Floor/wall tiling, porcelain, ceramic, coping, and paving.",
    icon: "LayoutGrid",
    popular: false
  },
  {
    id: "cat-roofing",
    name: "Roofers",
    slug: "roofing",
    description: "Roof sheeting, tiling, waterproofing, gutters, and fascia boards.",
    icon: "Home",
    popular: true
  },
  {
    id: "cat-welding",
    name: "Welders & Steelwork",
    slug: "welding",
    description: "Security gates, window frames, tank stands, and perimeter fencing.",
    icon: "Flame",
    popular: false
  }
];

export type UserRole = "CLIENT" | "PROVIDER" | "INSPECTOR" | "ADMIN";

export const USER_ROLES: { key: UserRole; label: string; description: string }[] = [
  {
    key: "CLIENT",
    label: "Diaspora / Property Owner",
    description: "I want to post construction projects, receive quotes, and monitor progress remotely."
  },
  {
    key: "PROVIDER",
    label: "Service Provider / Builder",
    description: "I am a local tradesperson or contractor looking for work in Chinhoyi."
  },
  {
    key: "INSPECTOR",
    label: "Independent Site Inspector",
    description: "I conduct physical site visits and verify milestone completion objectively."
  },
  {
    key: "ADMIN",
    label: "Platform Admin",
    description: "Manage verification, inspect portfolios, assign site inspectors, and audit disputes."
  }
];
