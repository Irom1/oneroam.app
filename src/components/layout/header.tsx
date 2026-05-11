"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { CreditCard } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-[#e8e4de]/60 dark:bg-[#1a1a1a]/90 dark:border-[#333]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className={`inline-flex items-center px-3.5 h-10 rounded-[20px] transition-all duration-300 text-[#1a1a1a] dark:text-white ${
            scrolled
              ? "bg-white dark:bg-[#252525] shadow-sm"
              : "bg-white/50 dark:bg-white/10 backdrop-blur-sm shadow-sm"
          }`}
        >
          <span className="text-base font-extrabold tracking-tight">
            oneroam<span className="text-[#f84f5a]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/topup"
            className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium transition-all ${
              scrolled
                ? "text-[#8e8b84] hover:text-[#1a1a1a] hover:bg-[#f2efe9] dark:text-[#8e8e93] dark:hover:text-white dark:hover:bg-[#2a2a2a]"
                : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-black/5 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Top Up</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
