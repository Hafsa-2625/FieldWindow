import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planner",
  description:
    "Spray windows and harvest dry stretches — one forecast load for your plot.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
