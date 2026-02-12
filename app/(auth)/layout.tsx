import { GradientBubbles } from "@/features/auth/components/shared/gradient-bubbles";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col gap-4 min-h-screen items-center justify-center overflow-hidden p-4">
      <GradientBubbles />
      {children}
    </div>
  );
}
