import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./lab.css";
export const metadata: Metadata = {
  title: "Lab equipment | Perma Cool",
  description: "Private laboratory equipment and service catalog.",
  robots: { index: false, follow: false, nocache: true },
};
export default function LabLayout({ children }: { children: ReactNode }) {
  return children;
}
