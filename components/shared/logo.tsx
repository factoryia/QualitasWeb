import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div>
      <Image
        src="/icon/logo.svg"
        alt="Qualitas logo"
        width={60}
        height={60}
        className={cn(
          "pointer-events-none mx-auto mb-2 size-10 shrink-0 select-none object-cover",
          className,
        )}
      />
    </div>
  );
}
