import { NextRequest, NextResponse } from "next/server";
import { weatherAIGetWithHeaders, WeatherAIError } from "@/lib/weatherClient";

// This is the ONE call in the app that spends an AI-summary credit (ai=true).
// Everything else (hourly/daily) runs ai=false to conserve the 200/mo quota.
export interface GeoWeather {
  location: {
    lat?: number;
    lon?: number;
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
  };
  current?: Record<string, unknown>;
  ai_summary?: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") ?? undefined;
  const lon = searchParams.get("lon") ?? undefined;
  // With explicit coordinates we override; otherwise auto-detect from IP.
  const ip = lat && lon ? undefined : "auto";

  try {
    const { data, headers } = await weatherAIGetWithHeaders<Record<string, any>>(
      "/v1/weather-geo",
      { ip, lat, lon, ai: "true", days: 1, units: "metric" }
    );

    // The resolved location lives in a `geo` object (and/or top-level lat/lon);
    // the city/region/country are also echoed in X-* response headers.
    const geo = (data.geo ?? {}) as Record<string, any>;
    const merged: GeoWeather = {
      ...data,
      location: {
        lat: geo.lat ?? data.lat ?? (lat ? Number(lat) : undefined),
        lon: geo.lon ?? data.lon ?? (lon ? Number(lon) : undefined),
        city: geo.city ?? headers.get("x-city") ?? undefined,
        region: geo.region ?? headers.get("x-region") ?? undefined,
        country: geo.country ?? headers.get("x-country") ?? undefined,
        timezone: geo.timezone ?? undefined,
      },
    };

    return NextResponse.json(merged);
  } catch (err) {
    if (err instanceof WeatherAIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Unexpected /api/weather-geo error:", err);
    return NextResponse.json(
      { error: "Could not detect your location and weather." },
      { status: 500 }
    );
  }
}
