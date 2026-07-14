import { NextRequest, NextResponse } from "next/server";
import { weatherAIGet, WeatherAIError } from "@/lib/weatherClient";

interface HourlyResponse {
  hourly?: Array<Record<string, unknown>>;
  forecast?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Both 'lat' and 'lon' query parameters are required." },
      { status: 400 }
    );
  }

  try {
    // ai=false: the spray timeline is pure numbers, so we skip the Gemini
    // summary here to preserve AI quota.
    const data = await weatherAIGet<HourlyResponse>("/v1/hourly", {
      lat,
      lon,
      days: 3,
      ai: "false",
      units: "metric",
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof WeatherAIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Unexpected /api/hourly error:", err);
    return NextResponse.json(
      { error: "Could not load the hourly forecast." },
      { status: 500 }
    );
  }
}
