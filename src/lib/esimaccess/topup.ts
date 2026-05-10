import { apiCall, type EsimPackage } from "./client";

// List available topup packages for an eSIM
export async function listTopupPackages(
  iccid: string
): Promise<EsimPackage[]> {
  const data = await apiCall<{ packageList: EsimPackage[] }>("/package/list", {
    iccid,
  });
  return data.packageList || [];
}

// Purchase a topup for an eSIM
export async function purchaseTopup(
  iccid: string,
  packageCode: string,
  transactionId: string
): Promise<{ orderNo: string }> {
  return apiCall<{ orderNo: string }>("/esim/topup", {
    iccid,
    packageCode,
    transactionId,
  });
}
