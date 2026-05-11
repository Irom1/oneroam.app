import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

const LINKS = {
  product: [
    { label: "Browse Plans", href: "/" },
    { label: "Top Up", href: "/topup" },
    { label: "Help", href: "/help" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              {APP_NAME}
            </Link>
            <p className="mt-2 text-sm text-[#8e8e93] max-w-xs">
              Instant travel eSIM. Apple Pay &amp; Google Pay. Half the price
              of the big brands.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] mb-3">
              Product
            </p>
            <ul className="space-y-2">
              {LINKS.product.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] mb-3">
              Company
            </p>
            <ul className="space-y-2">
              {LINKS.company.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#2a2a2a] text-center text-xs text-[#6e6e73]">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
