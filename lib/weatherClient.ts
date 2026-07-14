// Server-only helper for talking to WeatherAI. Never import this from a
// client component -- it reads the secret API key from process.env.

const BASE_URL = process.env.WEATHER_AI_BASE_URL ?? "https://api.weather-ai.co";

class WeatherAIError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "WeatherAIError";
    this.status = status;
    this.code = code;
  }
}

function getApiKey(): string {
  const key = process.env.WEATHER_AI_API_KEY;
  if (!key) {
    throw new WeatherAIError(
      "Server is missing WEATHER_AI_API_KEY. Set it in .env.local (see .env.example).",
      500,
      "MISSING_API_KEY"
    );
  }
  return key;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, params: QueryParams): string {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });
  return url.toString();
}

/**
 * Thin wrapper around WeatherAI's REST endpoints.
 * Handles auth headers, JSON parsing, and turns non-2xx responses into
 * a WeatherAIError carrying the upstream status + a friendly message.
 */
export async function weatherAIGet<T>(
  path: string,
  params: QueryParams
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    // Weather data is cheap to refetch and changes fast enough that we
    // don't want Next.js caching stale results across users.
    cache: "no-store",
  });

  return handleResponse<T>(res);
}

/**
 * Like `weatherAIGet`, but also hands back the raw response headers.
 * Needed for `/v1/weather-geo`, which returns the resolved location in
 * `X-City` / `X-Region` / `X-Country` headers rather than the JSON body.
 */
export async function weatherAIGetWithHeaders<T>(
  path: string,
  params: QueryParams
): Promise<{ data: T; headers: Headers }> {
  const res = await fetch(buildUrl(path, params), {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    cache: "no-store",
  });

  const headers = res.headers;
  const data = await handleResponse<T>(res);
  return { data, headers };
}

export async function weatherAIPostForm<T>(
  path: string,
  form: FormData
): Promise<T> {
  const url = new URL(path, BASE_URL);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { Authorization: `Bearer ${getApiKey()}` },
    body: form,
    cache: "no-store",
  });

  return handleResponse<T>(res);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T;
  }

  let bodyMessage: string | undefined;
  try {
    const body = await res.json();
    bodyMessage = body?.message ?? body?.error;
  } catch {
    // response wasn't JSON -- fall through to the generic message below
  }

  const friendly = friendlyErrorFor(res.status, bodyMessage);
  throw new WeatherAIError(friendly, res.status);
}

function friendlyErrorFor(status: number, upstreamMessage?: string): string {
  switch (status) {
    case 401:
      return "WeatherAI rejected the API key. Check WEATHER_AI_API_KEY in .env.local.";
    case 403:
      return (
        upstreamMessage ??
        "This endpoint needs a higher WeatherAI plan than the configured key has."
      );
    case 404:
      return (
        upstreamMessage ??
        "WeatherAI couldn't find this endpoint for your key. The Trees & Forestry API (tree analysis) requires a Pro or Scale plan — it isn't available on Free."
      );
    case 429:
      return "WeatherAI monthly quota has been used up. Try again next billing period.";
    case 400:
      return upstreamMessage ?? "WeatherAI rejected the request (missing/invalid parameters).";
    case 503:
      return "WeatherAI's service is temporarily unavailable. Try again shortly.";
    default:
      return upstreamMessage ?? `WeatherAI returned an unexpected error (${status}).`;
  }
}

export { WeatherAIError };
