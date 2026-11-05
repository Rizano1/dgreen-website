export const MENU_PAGES = 42;
// prefixed with the GitHub Pages sub-path when built for Pages (see next.config.ts)
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const menuPageSrc = (n: number) => `${BASE}/menu/p-${String(n).padStart(2, "0")}.jpg`;

// First page of each chapter in the printed 2025 menu
export const CHAPTERS: [name: string, page: number][] = [
  ["Cover", 1],
  ["Appetizer", 2],
  ["Salad", 4],
  ["All Day Brunch", 6],
  ["Smoothie Bowl", 9],
  ["Asian Selection", 10],
  ["Soup", 22],
  ["Pasta", 23],
  ["On the Grill", 26],
  ["Western", 27],
  ["Dessert", 32],
  ["Beverage", 34],
];

export const CONTACT = {
  whatsapp: "https://wa.me/6282112093485",
  maps: "https://maps.google.com/?cid=16384022236019004967",
  instagram: "https://instagram.com/dgreenrestoandcoffee",
  instagramHandle: "@dgreenrestoandcoffee",
  phones: [
    { label: "(0266) 6250 889", tel: "+622666250889" },
    { label: "+62 821 1209 3485", tel: "+6282112093485" },
  ],
};
