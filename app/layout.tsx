import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import HeaderComponent from "@/components/Layout/headerComponent";
import FooterComponent from "@/components/Layout/footerComponent";
import Providers from "@/providers";
import { Toaster } from "sonner";

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Focus Desk - Book Your Perfect Study Space",
  description:
    "Secure your spot in libraries across the city, reserve amenities, and join the perfect study environment. Find quiet study spaces, connect with mentors, and boost your productivity.",
  keywords:
    "study space, library booking, focus, productivity, students, study rooms",
  authors: [{ name: "Focus Desk Team" }],
  creator: "Focus Desk",
  openGraph: {
    title: "Focus Desk - Book Your Perfect Study Space",
    description:
      "Secure your spot in libraries across the city, reserve amenities, and join the perfect study environment.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Desk - Book Your Perfect Study Space",
    description:
      "Secure your spot in libraries across the city, reserve amenities, and join the perfect study environment.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <Providers>
          <Toaster />
          <HeaderComponent />
          {children}
          <FooterComponent />
        </Providers>
      </body>
    </html>
  );
}
