import { Poppins } from "next/font/google";

import { GradientBubbles } from "@/feature/auth/components/shared/gradient-bubbles";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${poppins.className} relative flex min-h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden p-4`}
    >
      {/* Base wash — same soft blue as before (no solid white that hides layers below) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-slate-50 via-sky-50/50 to-blue-100/60"
        aria-hidden
      />
      {/* Dot grain — above base, below blurred blobs (z-[2] in GradientBubbles) */}
      <div
        className="pointer-events-none absolute inset-0 z-1"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <GradientBubbles />
      {children}
    </div>
  );
}
