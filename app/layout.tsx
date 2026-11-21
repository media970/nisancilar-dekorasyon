import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nişancılar Dekorasyon | Modern Yaşam Alanları",
    template: "%s | Nişancılar Dekorasyon",
  },
  description:
    "Nişancılar Dekorasyon. Modern tasarım, dekorasyon, tadilat ve yaşam alanlarına özel uygulamalar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
