import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Potdo — AI Copilot for Portaldot",
  description:
    "AI copilot that turns plain English into secure, visual Portaldot transactions — see the state change before you sign.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Potdo — AI Copilot for Portaldot",
    description:
      "AI copilot that turns plain English into secure, visual Portaldot transactions.",
    url: "https://potdo.vercel.app",
    siteName: "Potdo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Potdo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Potdo — AI Copilot for Portaldot",
    description:
      "AI copilot that turns plain English into secure, visual Portaldot transactions.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-slate-100 font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
