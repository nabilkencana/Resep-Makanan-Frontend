import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Dapur Nusantara – Resep Masakan Indonesia",
  description: "Temukan resep masakan Indonesia autentik dengan bahan-bahan segar pilihan. Nikmati cita rasa nusantara yang kaya dan menggugah selera.",
  keywords: ["resep masakan", "masakan indonesia", "ayam geprek", "resep nusantara"],
  openGraph: {
    title: "Dapur Nusantara – Resep Masakan Indonesia",
    description: "Temukan resep masakan Indonesia autentik dengan bahan-bahan segar pilihan.",
    type: "website",
  },
  icons: {
    icon: '/logo-dapur.png'
  },
};

import { AuthProvider } from "../lib/auth-context";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable} data-scroll-behavior="smooth">
      <head>
      </head>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
