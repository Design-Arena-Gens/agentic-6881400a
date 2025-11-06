import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Result Management",
  description: "Manage student semester results, CGPA and backlogs"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
