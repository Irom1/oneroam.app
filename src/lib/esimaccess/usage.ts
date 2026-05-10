import { apiCall } from "./client";

export interface UsageInfo {
  totalVolume?: number; // bytes
  usedVolume?: number;  // bytes
  remaining?: number;   // bytes
  status?: string;
}

export async function queryUsage(
  iccid: string
): Promise<UsageInfo> {
  return apiCall<UsageInfo>("/esim/usage/query", { iccid });
}

export function formatUsageBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export function usagePercent(used: number, total: number): number {
  if (!total) return 0;
  return Math.round((used / total) * 100);
}
