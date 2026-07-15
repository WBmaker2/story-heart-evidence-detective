import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이야기 마음 근거 수사대",
  description: "이야기 속 말과 행동, 표정을 단서로 인물의 마음을 짐작해 보는 읽기 활동입니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
