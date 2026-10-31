// Stores the extension knows about. `url` is the page the run happens on;
// `host` finds an already-open tab for that store. `adapter` names the file
// in content/ that handles it. `comingSoon` stores show in the popup but
// never run.

const albertsonsFamily = [
  ["albertsons", "Albertsons", "albertsons.com"],
  ["tomthumb", "Tom Thumb", "tomthumb.com"],
  ["safeway", "Safeway", "safeway.com"],
  ["vons", "Vons", "vons.com"],
  ["randalls", "Randalls", "randalls.com"],
  ["jewelosco", "Jewel-Osco", "jewelosco.com"],
  ["acmemarkets", "Acme", "acmemarkets.com"],
  ["shaws", "Shaw's", "shaws.com"],
  ["starmarket", "Star Market", "starmarket.com"],
  ["pavilions", "Pavilions", "pavilions.com"],
  ["andronicos", "Andronico's", "andronicos.com"],
  ["carrsqc", "Carrs", "carrsqc.com"],
  ["haggen", "Haggen", "haggen.com"],
  ["kingsfoodmarkets", "Kings", "kingsfoodmarkets.com"],
  ["balduccis", "Balducci's", "balduccis.com"],
].map(([id, name, domain]) => ({
  id, name, adapter: "albertsons", host: `www.${domain}`, url: `https://www.${domain}/loyalty/coupons-deals`,
}));

const krogerFamily = [
  ["kroger", "Kroger", "kroger.com"],
  ["ralphs", "Ralphs", "ralphs.com"],
  ["frysfood", "Fry's", "frysfood.com"],
  ["kingsoopers", "King Soopers", "kingsoopers.com"],
  ["fredmeyer", "Fred Meyer", "fredmeyer.com"],
  ["smithsfoodanddrug", "Smith's", "smithsfoodanddrug.com"],
  ["qfc", "QFC", "qfc.com"],
  ["dillons", "Dillons", "dillons.com"],
  ["citymarket", "City Market", "citymarket.com"],
  ["bakersplus", "Baker's", "bakersplus.com"],
  ["gerbes", "Gerbes", "gerbes.com"],
  ["jaycfoods", "Jay C", "jaycfoods.com"],
  ["pay-less", "Pay Less", "pay-less.com"],
  ["marianos", "Mariano's", "marianos.com"],
  ["picknsave", "Pick 'n Save", "picknsave.com"],
  ["metromarket", "Metro Market", "metromarket.net"],
  ["foodsco", "Foods Co", "foodsco.net"],
  ["food4less", "Food 4 Less", "food4less.com"],
].map(([id, name, domain]) => ({
  id, name, adapter: "kroger", host: `www.${domain}`, url: `https://www.${domain}/savings/cl/coupons/`,
}));

export const STORES = [
  { id: "heb", name: "H-E-B", adapter: "heb", host: "www.heb.com", url: "https://www.heb.com/digital-coupon/coupon-selection/all-coupons" },
  { id: "target", name: "Target Circle", adapter: "target", host: "www.target.com", url: "https://www.target.com/deals/all?facet=tap_to_apply" },
  ...krogerFamily,
  ...albertsonsFamily,
  { id: "walmart", name: "Walmart Cash", adapter: "walmart", host: "www.walmart.com", url: "https://www.walmart.com/offer/all-offers" },
];

export const runnable = (s) => !s.comingSoon;

// Pinned stores first, then the user's dragged order, then list order.
export function sortStores(stores, settings) {
  const order = settings?.order || [];
  const rank = (s) => {
    const i = order.indexOf(s.id);
    return i === -1 ? order.length + stores.indexOf(s) : i;
  };
  const pinned = (s) => (settings?.pinned?.[s.id] ? 1 : 0);
  return [...stores].sort((a, b) => pinned(b) - pinned(a) || rank(a) - rank(b));
}
