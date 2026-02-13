import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dungym",
  description: "A workout program by Taylor Prince",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Dungym",
    description: "A workout program by Taylor Prince",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dungym",
    description: "A workout program by Taylor Prince",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dungym",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#0a0a0a]`}>
        <div className="splash-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]">
          <svg
            width="48"
            height="48"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 2L14.5 16.5L16 18L17.5 16.5L16 2Z" fill="#d4d4d8" />
            <rect x="10" y="17.5" width="12" height="2" rx="1" fill="#a1a1aa" />
            <rect x="14.75" y="19.5" width="2.5" height="6" rx="0.5" fill="#71717a" />
            <circle cx="16" cy="27.5" r="2" fill="#a1a1aa" />
          </svg>
          <span className="mt-3 text-lg font-bold text-white">Dungym</span>
        </div>
        {children}
      </body>
    </html>
  );
}
