import { apiCall, type EsimOrder } from "./client";

export async function purchaseEsim(
  packageCode: string,
  transactionId: string
): Promise<{ orderNo: string }> {
  return apiCall<{ orderNo: string }>("/esim/order", {
    packageCode,
    transactionId,
  });
}

export async function queryEsim(
  orderNo: string
): Promise<EsimOrder> {
  return apiCall<EsimOrder>("/esim/query", {
    orderNo,
  });
}
