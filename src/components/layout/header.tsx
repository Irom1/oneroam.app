"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Sun, Moon } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("oneroam-dark-mode");
    if (stored !== null) {
      const isDark = stored === "true";
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("oneroam-dark-mode", String(next));
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
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
          <button
            onClick={toggleDark}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all ${
              scrolled
                ? "text-[#8e8b84] hover:text-[#1a1a1a] hover:bg-[#f2efe9] dark:text-[#8e8e93] dark:hover:text-white dark:hover:bg-[#2a2a2a]"
                : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-black/5 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
            }`}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
