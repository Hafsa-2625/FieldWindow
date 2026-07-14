import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planner",
  description:
    "Spray windows, harvest dry stretches, and API quota — one forecast load for your plot.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
