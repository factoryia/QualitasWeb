import Image from "next/image";

export function Logo() {
  return (
    <div>
      <Image
        src="/logo.svg"
        alt="Qualitas logo"
        width={60}
        height={60}
        className="object-cover size-10 shrink-0 mx-auto mb-2 pointer-events-none select-none"
      />
    </div>
  );
}
