import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/30">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight hover:opacity-70 transition-opacity"
        >
          {APP_NAME}
        </Link>
      </div>
    </header>
  );
}
