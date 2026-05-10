import { apiCall, type EsimPackage } from "./client";

const MARKUP = 1.25; // 25% markup, tax included

export interface CountryCoverage {
  locationName: string;
  locationCode: string;
  operators: { name: string; networkType: string }[];
}

export interface DisplayPlan {
  id: string; // packageCode
  slug: string;
  name: string;
  description: string;
  locationCode: string;
  locationName: string;
  flagEmoji: string;
  dataAmountGb: number;
  validityDays: number;
  wholesaleCents: number;
  priceCents: number; // with 25% markup
  speed: string;
  ipRouting: string; // e.g. "FR/NL"
  operators: { name: string; networkType: string }[];
  isRegional: boolean;
  countryCount?: number;
  coverage: CountryCoverage[]; // full country list for regional plans
}

export interface PlansByRegion {
  region: string;
  plans: DisplayPlan[];
}

// Micro-units to USD cents
function microToCents(micro: number): number {
  return Math.round(micro / 100);
}

// Bytes to GB
function bytesToGb(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

// Country code to flag emoji
function codeToFlag(code: string): string {
  if (code.length !== 2) return "🌍";
  const a = code.toUpperCase();
  return String.fromCodePoint(
    ...[...a].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

const COUNTRY_NAMES: Record<string, string> = {
  ES: "Spain", FR: "France", DE: "Germany", IT: "Italy", GB: "United Kingdom",
  PT: "Portugal", NL: "Netherlands", CH: "Switzerland", BE: "Belgium",
  AT: "Austria", GR: "Greece", SE: "Sweden", NO: "Norway", DK: "Denmark",
  FI: "Finland", PL: "Poland", CZ: "Czech Republic", HU: "Hungary",
  RO: "Romania", BG: "Bulgaria", HR: "Croatia", EE: "Estonia", LV: "Latvia",
  LT: "Lithuania", LU: "Luxembourg", MT: "Malta", SK: "Slovakia", SI: "Slovenia",
  CY: "Cyprus", IE: "Ireland", IS: "Iceland", LI: "Liechtenstein",
  US: "United States", CA: "Canada", MX: "Mexico",
  JP: "Japan", KR: "South Korea", TH: "Thailand", AU: "Australia",
  TR: "Turkey", UA: "Ukraine", RS: "Serbia", MK: "North Macedonia",
  GG: "Guernsey", IM: "Isle of Man", JE: "Jersey", AX: "Aland Islands",
  RU: "Russia", CN: "China", HK: "Hong Kong", TW: "Taiwan", SG: "Singapore",
  MY: "Malaysia", PH: "Philippines", ID: "Indonesia", VN: "Vietnam",
  IN: "India", AE: "UAE", SA: "Saudi Arabia", QA: "Qatar", IL: "Israel",
  ZA: "South Africa", BR: "Brazil", AR: "Argentina", CL: "Chile",
};

function locationName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

let cachedPackages: EsimPackage[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchPackages(): Promise<EsimPackage[]> {
  const now = Date.now();
  if (cachedPackages && now - cacheTime < CACHE_TTL) {
    return cachedPackages;
  }
  const data = await apiCall<{ packageList: EsimPackage[] }>("/package/list");
  cachedPackages = data.packageList;
  cacheTime = now;
  return cachedPackages;
}

export function buildDisplayPlan(pkg: EsimPackage): DisplayPlan {
  const wholesaleCents = microToCents(pkg.price);
  // Apply 25% markup, then round to end in .99
  const markedUp = Math.round(wholesaleCents * MARKUP);
  const dollars = Math.floor(markedUp / 100);
  const priceCents = dollars >= 1 ? dollars * 100 + 99 : Math.max(markedUp, 99);
  const locs = pkg.location.split(",");
  const isRegional = locs.length > 1;
  const primaryLoc = pkg.locationNetworkList?.[0];

  return {
    id: pkg.packageCode,
    slug: pkg.slug,
    name: pkg.name,
    description: pkg.description,
    locationCode: pkg.locationCode,
    locationName: isRegional
      ? (pkg.locationNetworkList?.[0]?.locationName || pkg.locationCode)
      : locationName(pkg.locationCode),
    flagEmoji: isRegional ? "🌍" : codeToFlag(pkg.locationCode),
    dataAmountGb: bytesToGb(pkg.volume),
    validityDays: pkg.duration,
    wholesaleCents,
    priceCents,
    speed: pkg.speed,
    ipRouting: pkg.ipExport || "",
    operators: primaryLoc?.operatorList?.map((o) => ({
      name: o.operatorName,
      networkType: o.networkType,
    })) || [],
    isRegional,
    countryCount: isRegional ? locs.length : 1,
    coverage: (pkg.locationNetworkList || []).map((loc) => ({
      locationName: loc.locationName,
      locationCode: loc.locationCode,
      operators: (loc.operatorList || []).map((op) => ({
        name: op.operatorName,
        networkType: op.networkType,
      })),
    })),
  };
}

export async function getDisplayPlans(): Promise<DisplayPlan[]> {
  const pkgs = await fetchPackages();
  return pkgs
    .map(buildDisplayPlan)
    .sort((a, b) => a.priceCents - b.priceCents);
}

export async function getPlansByCountry(): Promise<Map<string, DisplayPlan[]>> {
  const plans = await getDisplayPlans();
  const map = new Map<string, DisplayPlan[]>();

  for (const plan of plans) {
    const key = plan.isRegional ? "Regional" : plan.locationName;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(plan);
  }

  return map;
}
