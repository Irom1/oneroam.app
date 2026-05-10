// D1 client — works in Cloudflare Workers (env.DB binding) and
// local dev (REST API with CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID).

const DB_ID = "43cca1a7-6fd4-4471-b356-2748052fcd53";
const ACCOUNT_ID = "eb4087cec8ac5f5b3e8a8e6560160dcc";

function getD1Binding(): Record<string, unknown> | null {
  // Cloudflare Workers: bindings are in env param. OpenNext stores
  // the context in AsyncLocalStorage accessible via this symbol.
  try {
    const key = Symbol.for("__cloudflare-context__");
    const ctx = (globalThis as unknown as Record<symbol, { env: Record<string, unknown> } | undefined>)[key];
    if (ctx?.env?.DB) {
      return ctx.env.DB as Record<string, unknown>;
    }
  } catch {
    // Not in Cloudflare Workers runtime
  }

  // Fallback: check process.env (for other runtimes)
  if (typeof process !== "undefined" && (process.env as Record<string, unknown>)?.DB) {
    return (process.env as Record<string, unknown>).DB as Record<string, unknown>;
  }
  return null;
}

function getRestConfig() {
  const token =
    process.env.CLOUDFLARE_API_TOKEN ||
    process.env.CLOUDFLARE_API_KEY;
  if (!token) return null;
  return { token, accountId: ACCOUNT_ID, dbId: DB_ID };
}

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  error?: string;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<D1Result<T>> {
  // Production: use D1 binding
  const binding = getD1Binding();
  if (binding && typeof (binding as Record<string, unknown>).prepare === "function") {
    const stmt = (binding as Record<string, Function>).prepare.call(binding, sql);
    if (params?.length) stmt.bind(...params);
    const result = await (stmt.all() as Promise<{ results: T[] }>);
    return { results: result.results, success: true };
  }

  // Local dev: use REST API
  const config = getRestConfig();
  if (!config) {
    return {
      results: [],
      success: false,
      error: "No D1 binding or CLOUDFLARE_API_TOKEN set",
    };
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.dbId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  const json = await res.json();
  if (!json.success) {
    return {
      results: [],
      success: false,
      error: json.errors?.[0]?.message || "D1 query failed",
    };
  }

  return {
    results: (json.result?.[0]?.results || []) as T[],
    success: true,
  };
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.results[0] || null;
}

export function generateId(): string {
  return crypto.randomUUID();
}
