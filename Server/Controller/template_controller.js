/**
 * Server/Controller/template_controller.js
 * Inoviq — Templates Controller (Part C: Templates & Ready-made Presets API)
 */

const TEMPLATES_DB = [
  {
    id: "tpl_ledger",
    name: "Ledger",
    category: "Business & IT",
    tagline: "Studio & Management Consulting",
    palette: "moss",
    themeColor: "#697C70",
    textColor: "#F2EFE2",
    bgStyle: "solid",
    initials: "LD",
    popular: true,
    description: "Minimal, clean paper ledger style for executives and consultants."
  },
  {
    id: "tpl_midnight",
    name: "Midnight Desk",
    category: "Science & Technology",
    tagline: "Tech Founders & Engineers",
    palette: "soot",
    themeColor: "#2D3536",
    textColor: "#B3C9D6",
    bgStyle: "dark-gradient",
    initials: "MN",
    popular: true,
    description: "High contrast dark charcoal theme engineered for software architects."
  },
  {
    id: "tpl_stamped",
    name: "Stamped Postfolio",
    category: "Culture",
    tagline: "Creative Agency & Studio",
    palette: "espresso",
    themeColor: "#52352D",
    textColor: "#B1D4D0",
    bgStyle: "textured-stamp",
    initials: "ST",
    popular: false,
    description: "Tactile postmark stamped card with espresso and baby blue accents."
  },
  {
    id: "tpl_brass",
    name: "Brass Rule",
    category: "Business & IT",
    tagline: "Finance, Legal & Architecture",
    palette: "eucalyptus",
    themeColor: "#98AA9D",
    textColor: "#2D3536",
    bgStyle: "serif-border",
    initials: "BR",
    popular: true,
    description: "Classic serif typography with eucalyptus border framing."
  },
  {
    id: "tpl_sport",
    name: "Velocity Sport",
    category: "Sport",
    tagline: "Athletes & Fitness Clubs",
    palette: "babyBlue",
    themeColor: "#7BA4E8",
    textColor: "#FFFFFF",
    bgStyle: "vibrant-badge",
    initials: "VS",
    popular: false,
    description: "Dynamic sport category folder with cutout pop-out elements."
  },
  {
    id: "tpl_cinema",
    name: "Silver Screen",
    category: "Art & Cinema",
    tagline: "Filmmakers & Directors",
    palette: "espresso",
    themeColor: "#E979AC",
    textColor: "#FFFFFF",
    bgStyle: "cinema-dark",
    initials: "SS",
    popular: false,
    description: "Bold cinematic card preset for media creators."
  }
];

// GET /api/templates
exports.getTemplates = (req, res) => {
  const { category, search } = req.query || {};
  let results = [...TEMPLATES_DB];

  if (category) {
    results = results.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  return res.status(200).json({ success: true, count: results.length, data: results });
};

// GET /api/templates/:id
exports.getTemplateById = (req, res) => {
  const template = TEMPLATES_DB.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  return res.status(200).json({ success: true, data: template });
};
