import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oneroam.app"),
  title: {
    default: "oneroam — Buy a Travel eSIM Instantly with Apple Pay",
    template: `%s | oneroam`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "travel eSIM", "buy eSIM", "Apple Pay eSIM", "international data",
    "eSIM plans", "instant eSIM", "no signup eSIM", "travel data",
    "Google Pay eSIM", "digital SIM", "eSIM worldwide",
  ],
  authors: [{ name: "oneroam" }],
  creator: "oneroam",
  publisher: "oneroam",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    url: "https://oneroam.app",
    title: "oneroam — Buy a Travel eSIM Instantly with Apple Pay",
    description: APP_DESCRIPTION,
    siteName: "oneroam",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "oneroam — Buy a Travel eSIM Instantly with Apple Pay",
    description: APP_DESCRIPTION,
  },
  alternates: { canonical: "https://oneroam.app" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "oneroam",
              url: "https://oneroam.app",
              description: APP_DESCRIPTION,
              offers: {
                "@type": "AggregateOffer",
                offerCount: "400+",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
