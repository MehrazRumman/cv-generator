import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/components/theme/theme-script";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "CV Generator — CV, Biodata & Academic CV",
  description: "Build a professional CV, South Asian biodata or academic CV with live preview and PDF download.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // "dark" is the server default; the inline script switches to light before paint if the user chose it.
    <html lang="en" className={`dark ${inter.variable} ${hindSiliguri.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
