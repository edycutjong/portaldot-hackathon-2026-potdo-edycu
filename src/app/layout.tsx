import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { WalletProvider } from "@/context/WalletContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://potdo.edycu.dev"),
  title: "Potdo — AI Copilot for Portaldot",
  description:
    "AI copilot that turns plain English into secure, visual Portaldot transactions — see the state change before you sign.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Potdo — AI Copilot for Portaldot",
    description:
      "AI copilot that turns plain English into secure, visual Portaldot transactions.",
    url: "https://potdo.edycu.dev",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-slate-100 font-[family-name:var(--font-inter)]">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
