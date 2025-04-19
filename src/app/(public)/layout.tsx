import { Metadata } from "next";
import "../index.css";


export const metadata: Metadata = {
  title: 'Most Used Languages',
  icons: {
    icon: '../favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
