// eSIM Access API client
// Auth: RT-AccessCode header only (no HMAC signing needed)
// Base: https://api.esimaccess.com/api/v1/open

const BASE = "https://api.esimaccess.com/api/v1/open";
const ACCESS_CODE = "a952f8cdeb894245a9712a6819785e03";

export async function apiCall<T = unknown>(
  path: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-AccessCode": ACCESS_CODE,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.errorMsg || `API error: ${path}`);
  }

  return json.obj as T;
}

// ---------- types ----------

export interface PackageLocation {
  locationName: string;
  locationLogo: string;
  locationCode: string;
  operatorList: { operatorName: string; networkType: string }[];
}

export interface EsimPackage {
  packageCode: string;
  slug: string;
  name: string;
  price: number; // micro-units (÷10000 = USD)
  currencyCode: string;
  volume: number; // bytes
  duration: number;
  durationUnit: string;
  location: string;
  locationCode: string;
  description: string;
  retailPrice: number;
  speed: string;
  supportTopUpType: number;
  locationNetworkList: PackageLocation[];
}

export interface EsimOrder {
  orderNo: string;
  packageCode: string;
  iccid: string;
  ac?: string; // activation code
  qrCodeUrl?: string;
  smdpStatus?: string;
  totalVolume?: number;
  usedVolume?: number;
}

export interface Balance {
  balance: number; // micro-units
  currencyCode: string;
}
