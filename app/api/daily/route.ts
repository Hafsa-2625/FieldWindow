import { NextRequest, NextResponse } from "next/server";
import { weatherAIGet, WeatherAIError } from "@/lib/weatherClient";

interface DailyResponse {
  daily?: Array<Record<string, unknown>>;
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
    // ai=false: harvest outlook only needs the daily numbers (7 = Free cap).
    const data = await weatherAIGet<DailyResponse>("/v1/daily", {
      lat,
      lon,
      days: 7,
      ai: "false",
      units: "metric",
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof WeatherAIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Unexpected /api/daily error:", err);
    return NextResponse.json(
      { error: "Could not load the daily forecast." },
      { status: 500 }
    );
  }
}
