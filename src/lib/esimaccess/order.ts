import { apiCall, type EsimPackage, type EsimOrder } from "./client";

export async function purchaseEsim(
  packageCode: string,
  transactionId: string,
  count = 1
): Promise<{ orderNo: string }> {
  // Fetch the package to get the wholesale price (micro-units)
  const data = await apiCall<{ packageList: EsimPackage[] }>("/package/list");
  const pkg = data.packageList?.find((p) => p.packageCode === packageCode);
  const price = pkg?.price || 0;

  return apiCall<{ orderNo: string }>("/esim/order", {
    transactionId,
    amount: price * count,
    packageInfoList: [
      {
        packageCode,
        count,
        price,
      },
    ],
  });
}

export async function queryEsim(
  orderNo: string
): Promise<EsimOrder> {
  return apiCall<EsimOrder>("/esim/query", {
    orderNo,
  });
}
