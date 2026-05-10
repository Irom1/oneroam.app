import { apiCall, type EsimPackage } from "./client";

export async function purchaseEsim(
  packageCode: string,
  transactionId: string,
  count = 1
): Promise<{ orderNo: string }> {
  const data = await apiCall<{ packageList: EsimPackage[] }>("/package/list");
  const pkg = data.packageList?.find((p) => p.packageCode === packageCode);
  const price = pkg?.price || 0;

  return apiCall<{ orderNo: string }>("/esim/order", {
    transactionId,
    amount: price * count,
    packageInfoList: [{ packageCode, count, price }],
  });
}

export interface EsimDetails {
  orderNo: string;
  iccid: string;
  ac: string;
  qrCodeUrl: string;
  shortUrl: string;
  smdpStatus: string;
  esimStatus: string;
  totalVolume: number;
  totalDuration: number;
  durationUnit: string;
  apn: string;
  pin: string;
  puk: string;
}

export async function queryEsim(orderNo: string): Promise<EsimDetails | null> {
  const data = await apiCall<{
    esimList: EsimDetails[];
  }>("/esim/query", {
    orderNo,
    iccid: "",
    pager: { pageNum: 1, pageSize: 5 },
  });

  return data?.esimList?.[0] || null;
}
