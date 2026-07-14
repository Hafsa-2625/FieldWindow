import { NextResponse } from "next/server";
import { weatherAIGet, WeatherAIError } from "@/lib/weatherClient";

// Shape is normalized client-side (field names in the docs are loose), so we
// just pass the raw payload straight through here.
export async function GET() {
  try {
    const data = await weatherAIGet<Record<string, unknown>>("/v1/usage", {});
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof WeatherAIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Unexpected /api/usage error:", err);
    return NextResponse.json(
      { error: "Could not load usage stats." },
      { status: 500 }
    );
  }
}
