/*
 * All marketing-site copy and settings in one place, taken from the
 * WordPress site at trustpointrealty.ng. Edit here to change the site.
 */

/**
 * Site images live in public/images/. The WordPress hosting was suspended
 * before its uploads could be copied, so most photos are free-licence
 * stand-ins from Pexels (see public/images/CREDITS.md). Four are the exact
 * Pexels originals the old site used.
 *
 * `wpOriginals` (bottom of this file) lists the old WordPress files. If the
 * hosting comes back, `npm run fetch-wp-assets` downloads them so the logo,
 * estate flyers and FAQ PDFs can be put back.
 */
const wp = (path: string) => `https://trustpointrealty.ng/wp-content/uploads/${path}`;
const img = (file: string) => `/images/${file}`;

export const contact = {
  topBarAddress: "68, Okediji Avenue, Beside Ibadan Business School, Bodija, Ibadan",
  officeAddress: "Gastab Filling Station, Sango-Eleyele Road, Sango, Ibadan, Oyo State",
  phones: ["07025050037", "07025050038"],
  emails: ["hello@trustpointrealty.ng", "info@trustpointrealty.ng"],
  whatsappBooking: "https://wa.me/2347025050038",
  whatsappContact: "https://wa.link/eyj73g",
  callHref: "tel:+2347025050038",
  hours: ["Mon - Sat 8:00 - 17:30,", "Sunday - CLOSED"],
  mapEmbed:
    "https://maps.google.com/maps?q=Gastab%20Filling%20Station%2C%20Sango-Eleyele%20Road%2C%20Ibadan&z=16&output=embed",
};

/** The live site's social icons all link back to the page itself; set real URLs here. */
export const socials = {
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/realtors", label: "Realtors" },
  { href: "/contact-us", label: "Contact Us" },
];

export const images = {
  /** Set to the real logo file (e.g. "/images/logo.png") once it is available; until then a text wordmark is shown. */
  logo: null as string | null,
  pageHero: img("page-hero.jpg"),
  careersHero: img("careers-hero.jpg"),
  heroSlides: [img("hero-1.jpg"), img("hero-2.jpg"), img("hero-3.jpg"), img("hero-4.jpg"), img("hero-5.jpg")],
  buildings: img("buildings.jpg"),
  worker: img("worker.jpg"),
  worldMap: img("world-map.svg"),
};

export const hero = {
  kicker: "#Welcome to TrustPoint Realty, your trusted partner for all things real estate",
  title: "Your Real Estate Vision Just Got Bigger",
  text: "At TrustPoint Realty, we redefine real estate excellence. Our seasoned team of professionals brings a wealth of experience and unwavering commitment to ensuring your property journey is seamless.",
};

export const services = [
  {
    title: "Estate Development",
    image: img("service-development.jpg"),
    text: "TrustPoint Realty, we transform visions into thriving communities. Our commitment goes beyond selling land; we specialize in crafting sustainable and vibrant estates that redefine modern living. With world-class amenities, you can be rest assured of getting value for your money in our estates.",
  },
  {
    title: "Consultation",
    image: img("hero-1.jpg"),
    text: "At TrustPoint Realty, we understand that navigating the real estate landscape can be a complex journey. Whether you're a seasoned investor or a first-time buyer, our Consultation Services are tailored to provide you with the insights and guidance you need to make informed decisions.",
  },
  {
    title: "Real Estate Investment",
    image: img("service-investment.jpg"),
    text: "Discover the power of smart investing with TrustPoint Realty's Real Estate Investment services. Whether you're a seasoned investor or exploring real estate for the first time, our expert team is here to guide you toward lucrative opportunities.",
  },
];

export type EstatePage = {
  slug: string;
  name: string;
  location: string;
  /** An illustrative stock photo, labelled as such on the site. Replace with real estate photos/flyers. */
  image: string;
  /** The estate's FAQ PDF. The old ones were lost with the WordPress hosting; until re-uploaded, "Check FAQ" goes to Contact Us. */
  faqPdf: string | null;
  paragraphs: string[];
};

export const estates: EstatePage[] = [
  {
    slug: "coconutview",
    name: "Coconutview Estate",
    location: "Ibadan, Nigeria",
    image: img("estate-3.jpg"),
    faqPdf: null,
    paragraphs: [
      "Welcome to Coconutview Estate, a luxurious haven nestled in a breathtaking tropical setting. Perfect for those seeking tranquility and exclusivity.",
    ],
  },
  {
    slug: "avocado-crest",
    name: "Avocado Crest Estate",
    location: "Ibadan, Nigeria",
    image: img("estate-1.jpg"),
    faqPdf: null,
    paragraphs: [
      "Welcome to Avocado Crest Estate, a luxurious haven nestled in a breathtaking tropical setting. Perfect for those seeking tranquility and exclusivity.",
    ],
  },
  {
    slug: "palm-oasis",
    name: "Palm Oasis Farm Resort",
    location: "Ibadan, Nigeria",
    image: img("estate-palm.jpg"),
    faqPdf: null,
    paragraphs: [
      "Welcome to Palm Oasis Farm Resort, a super-luxurious estate perfect for those seeking tranquility and exclusivity.",
      "Palm Oasis is a farm resort which is designed to include a golf course, a ranch, a residential area, shopping mall, etc. All these are expected to increase the value of land in that location rapidly asides the fact that it is located in a developing area with proximity to the circular road. It is designed to be a vacation destination. Subscribers into Palm Oasis now are subscribing to the residential area of the resort",
    ],
  },
  {
    slug: "maple-nexus",
    name: "Maple Nexus Estate",
    location: "Ibadan, Nigeria",
    image: img("estate-2.jpg"),
    faqPdf: null,
    paragraphs: [
      "Welcome to Maple Nexus Estate, a super-luxurious estate with breathtaking terrace duplexes. Perfect for those seeking tranquility and exclusivity.",
      "Adjoined by Maple Nexus Estate Extension of high value plots of land for sale.",
    ],
  },
];

/** Options in the "Packages" checkbox group of the quote form (the live site lists only this one). */
export const quotePackages = ["Palm Oasis Farm Resort"];

export const stats = [
  { value: "700+", label: "Plots of Land Secured", icon: "dollar" },
  { value: "100+", label: "Clients & Counting", icon: "users" },
  { value: "6", label: "Successful Phases", icon: "network" },
  { value: "6", label: "Year of experience", icon: "award" },
] as const;

export const estateFeatures = [
  { title: "Road Network", icon: "road", text: "A well-planned road network ensures easy accessibility, convenience, and safety for residents and visitors." },
  { title: "Drainage System", icon: "recycle", text: "An efficient drainage system prevents flooding, reduces erosion, and maintains a clean environment." },
  { title: "Street Lights", icon: "lightbulb", text: "Strategically placed streetlights provide illumination, enhance safety, and deter crime." },
  { title: "Prime Location", icon: "route", text: "Prime location comes with easy access to amenities enhancing quality of life and property value." },
  { title: "Central Water Supply", icon: "waves", text: "A reliable central water supply system ensures a consistent and clean water source for residents." },
  { title: "Serene Environment", icon: "leaf", text: "A peaceful and calming atmosphere with lush greenery and a tranquil ambiance, promoting relaxation and well-being." },
] as const;

export const whyChoose = [
  { title: "Expertise", icon: "medal", text: "Benefit from the knowledge and guidance of our seasoned real estate professionals." },
  { title: "Innovation", icon: "lightbulb", text: "With innovative technologies and strategies, we stay ahead in the real estate market." },
  { title: "Trust & Integrity", icon: "shield", text: "We prioritize honesty and transparency in every transaction." },
] as const;

export const testimonials = [
  { quote: "You can tell once you see a corporate real estate agency that knows the drill. Thank you for your service, you made the process so easy.", name: "Mr. Atikami", role: "Investor" },
  { quote: "I was blown away by the level of dedication and passion you guys showed. From information to site inspection. Well-done.", name: "Mr. Mubarak", role: "Land Owner" },
  { quote: "Thank you for your good service. I can now fully trust a real estate company. Let's see what the future holds again. We will do more business soon.", name: "Ms. Wuraola", role: "Investor" },
];

export const faqs = [
  {
    q: "1. What types of land does TrustPoint Realty offer for sale?",
    a: "TrustPoint Realty specializes in various types of land, including residential, commercial, and agricultural properties. Whether you’re looking to build your dream home or make a strategic investment, we have a range of options to suit your needs.",
  },
  {
    q: "2. How can I be sure that the land is legitimate and has proper documentation?",
    a: "TrustPoint Realty takes pride in transparency and legal compliance. All our land listings come with clear and verified documentation. We facilitate due diligence processes to ensure that you can confidently invest in a property with a secure title.",
  },
  {
    q: "3. What makes TrustPoint Realty stand out from other real estate agencies?",
    a: "TrustPoint Realty stands out for its commitment to integrity, customer satisfaction, and professionalism. Our team comprises seasoned real estate experts who prioritize your needs.",
  },
];

export const about = {
  title: "We Are Your Leading Real Estate Agency in Nigeria",
  text: "At TrustPoint Realty, we redefine real estate excellence. Our seasoned team of professionals brings a wealth of experience and unwavering commitment to ensuring your property journey is seamless. Learn about our mission, values, and the dedication that sets us apart in the real estate industry.",
  vision:
    "To be the trusted partner in real estate, empowering dreams and building lasting real estates through excellence, integrity, and innovation.",
  mission: [
    "- To set new standards in real estate excellence.",
    "- To build lasting relationships with our clients based on trust, transparency, and personalized service.",
    "- To simplify the real estate journey for our clients by combining expertise with commitment to integrity and innovation.",
  ],
  featureList: ["Road Network", "Drainage System", "Streetlights", "Central Water Supply", "Sport Complex"],
};

export const jobs = [
  {
    title: "Sales Marketer",
    intro:
      "Are you a passionate and results-driven sales professional? Trustpoint Realty Investment Ltd is looking for Sales Marketers to join our dynamic team!",
    location: "Sango/Poly road",
    note: "NB: Applicants must leave around U. I, Agbowo, Mokola, Bodija, Ikolaba, Eleyele environs.",
    type: "Full-Time",
    responsibilities: [
      "Identify and engage potential real estate buyers and investors",
      "Develop and implement sales strategies to drive property sales",
      "Build and maintain strong client relationships",
      "Conduct market research and stay updated on real estate trends",
      "Meet and exceed sales targets",
    ],
    requirements: [
      "Proven experience in sales/marketing (real estate experience is a plus)",
      "Strong communication and negotiation skills",
      "Ability to work independently and as part of a team",
      "Goal-oriented with a passion for sales",
      "Minimum of [Specify Education Requirement]",
    ],
    benefits: [
      "Attractive commission structure",
      "Career growth opportunities",
      "Flexible working conditions",
      "Training and mentorship",
    ],
    closing: "Join a winning team and build a successful career in real estate!",
    applyEmail: "recruitment.trustpointrealty@gmail.com",
    applyPhone: "08162940188",
    tags: "#TrustpointRealty #Hiring #SalesMarketer #RealEstateJobs",
  },
];

export const recruitmentEmail = "recruitment.trustpointrealty@gmail.com";

/**
 * The old site's own files (logo, estate flyers, FAQ PDFs), lost when the
 * WordPress hosting was suspended. `npm run fetch-wp-assets` downloads these
 * into public/wp-content/uploads/ if the hosting is ever restored.
 */
export const wpOriginals = {
  logo: wp("2023/12/cropped-TrustPoint-Web-Logo-2.png"),
  flyers: {
    coconutview: wp("2025/02/WhatsApp-Image-2025-02-27-at-10.36.25_bd265950.jpg"),
    "avocado-crest": wp("2025/02/WhatsApp-Image-2025-02-27-at-10.31.42_2116dd53.jpg"),
    "palm-oasis": wp("2025/08/Palm-Oasis.jpg"),
    "maple-nexus": wp("2025/02/WhatsApp-Image-2025-02-27-at-10.31.42_96f6e198.jpg"),
  },
  faqPdfs: {
    coconutview: wp("2025/02/COCONUT-VIEW-ESTATE-FAQ.pdf-3.pdf"),
    "avocado-crest": wp("2025/02/Avocado-Crest-Estate.pdf"),
    "palm-oasis": wp("2025/08/Palm-Oasis-Farm-Resort-6.pdf"),
  },
};
