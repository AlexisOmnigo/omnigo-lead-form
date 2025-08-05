import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { meutasFont } from "./meutas-font";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omnigo.ca - Formulaire de contact",
  description: "Formulaire de contact pour Omnigo.ca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NTVG39V2');`
        }} />
      </head>
      <body
        className={`${meutasFont.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NTVG39V2"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`
        }} />
        {children}
      </body>
    </html>
  );
}
