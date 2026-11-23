/*
 * All marketing-site copy and settings in one place, taken from the
 * WordPress site at trustpointrealty.ng. Edit here to change the site.
 */

/**
 * Images and PDFs still live on the WordPress server. Run
 * `npm run fetch-wp-assets` (on a machine that can reach the site) to copy
 * them into public/, then set NEXT_PUBLIC_ASSET_BASE="" so they are served
 * from this app. Do this BEFORE WordPress is switched off.
 */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? "https://trustpointrealty.ng";
export const wp = (path: string) => `${ASSET_BASE}/wp-content/uploads/${path}`;

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
  logo: wp("2023/12/cropped-TrustPoint-Web-Logo-2.png"),
  pageHero: wp("2021/11/about-us-min.jpg"),
  careersHero: wp("2025/02/pexels-edmond-dantes-8555769-scaled.jpg"),
  heroSlides: [
    wp("2023/12/pexels-kindel-media-8487338-scaled.jpg"),
    wp("2023/12/pexels-david-mcbee-392031.jpg"),
    wp("2024/09/image_fx_-7.png"),
    wp("2024/09/image_fx_-9.png"),
    wp("2024/09/image_fx_-8.png"),
  ],
  cityscape: wp("2025/04/Cityscape-1-1536x500.png"),
  buildings: wp("2021/11/image-1-min.jpg"),
  worker: wp("2021/11/image-2-min.jpg"),
  featuresStrip: wp("2023/12/Features-2-scaled.jpg"),
  worldMap: wp("2023/12/pngwing.com_.png"),
};

export const hero = {
  kicker: "#Welcome to TrustPoint Realty, your trusted partner for all things real estate",
  title: "Your Real Estate Vision Just Got Bigger",
  text: "At TrustPoint Realty, we redefine real estate excellence. Our seasoned team of professionals brings a wealth of experience and unwavering commitment to ensuring your property journey is seamless.",
};

export const services = [
  {
    title: "Estate Development",
    image: wp("2021/11/service-1.jpg"),
    text: "TrustPoint Realty, we transform visions into thriving communities. Our commitment goes beyond selling land; we specialize in crafting sustainable and vibrant estates that redefine modern living. With world-class amenities, you can be rest assured of getting value for your money in our estates.",
  },
  {
    title: "Consultation",
    image: wp("elementor/thumbs/pexels-kindel-media-8487338-scaled-qgyenb0nh5zdevrguk7yj7rg3qtftx6mcrnsyi9io4.jpg"),
    text: "At TrustPoint Realty, we understand that navigating the real estate landscape can be a complex journey. Whether you're a seasoned investor or a first-time buyer, our Consultation Services are tailored to provide you with the insights and guidance you need to make informed decisions.",
  },
  {
    title: "Real Estate Investment",
    image: wp("elementor/thumbs/pexels-athena-2323080-qgyepqfn4rb1em8ho409h3pbckukprtnosbyl8nwlg.jpg"),
    text: "Discover the power of smart investing with TrustPoint Realty's Real Estate Investment services. Whether you're a seasoned investor or exploring real estate for the first time, our expert team is here to guide you toward lucrative opportunities.",
  },
];

export type EstatePage = {
  slug: string;
  name: string;
  location: string;
  cardImage: string;
  flyer: string;
  faqPdf: string | null;
  paragraphs: string[];
};

export const estates: EstatePage[] = [
  {
    slug: "coconutview",
    name: "Coconutview Estate",
    location: "Ibadan, Nigeria",
    cardImage: wp("2025/02/WhatsApp-Image-2025-02-27-at-10.36.25_bd265950.jpg"),
    flyer: wp("2025/02/WhatsApp-Image-2025-02-27-at-10.36.25_bd265950.jpg"),
    faqPdf: wp("2025/02/COCONUT-VIEW-ESTATE-FAQ.pdf-3.pdf"),
    paragraphs: [
      "Welcome to Coconutview Estate, a luxurious haven nestled in a breathtaking tropical setting. Perfect for those seeking tranquility and exclusivity.",
    ],
  },
  {
    slug: "avocado-crest",
    name: "Avocado Crest Estate",
    location: "Ibadan, Nigeria",
    cardImage: wp("elementor/thumbs/Avocado-Crest-Estate-Flyer-2-r26fjrjfvi2x0hgrif3namn44w0p7xwrgzxvddku1g.jpg"),
    flyer: wp("2025/02/WhatsApp-Image-2025-02-27-at-10.31.42_2116dd53.jpg"),
    faqPdf: wp("2025/02/Avocado-Crest-Estate.pdf"),
    paragraphs: [
      "Welcome to Avocado Crest Estate, a luxurious haven nestled in a breathtaking tropical setting. Perfect for those seeking tranquility and exclusivity.",
    ],
  },
  {
    slug: "palm-oasis",
    name: "Palm Oasis Farm Resort",
    location: "Ibadan, Nigeria",
    cardImage: wp("2025/02/WhatsApp-Image-2025-02-27-at-10.31.42_982a9225.jpg"),
    flyer: wp("2025/08/Palm-Oasis.jpg"),
    faqPdf: wp("2025/08/Palm-Oasis-Farm-Resort-6.pdf"),
    paragraphs: [
      "Welcome to Palm Oasis Farm Resort, a super-luxurious estate perfect for those seeking tranquility and exclusivity.",
      "Palm Oasis is a farm resort which is designed to include a golf course, a ranch, a residential area, shopping mall, etc. All these are expected to increase the value of land in that location rapidly asides the fact that it is located in a developing area with proximity to the circular road. It is designed to be a vacation destination. Subscribers into Palm Oasis now are subscribing to the residential area of the resort",
    ],
  },
  {
    slug: "maple-nexus",
    name: "Maple Nexus Estate",
    location: "Ibadan, Nigeria",
    cardImage: wp("2025/02/WhatsApp-Image-2025-02-27-at-10.31.42_96f6e198.jpg"),
    flyer: wp("2025/02/WhatsApp-Image-2025-02-27-at-10.31.42_96f6e198.jpg"),
    faqPdf: null, // the live site's "Check FAQ" button has no PDF yet
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
