import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://perma.cool"),
  applicationName: "PermaCool",
  title: "BLAST 60/45 Ethanol Chiller | PermaCool",
  description:
    "Chill 60 gallons of ethanol from room temperature to -40°C in 45 minutes with the PermaCool BLAST 60/45 ethanol chiller.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "64x64" },
      { url: "/favicon-64x64.png", type: "image/png", sizes: "64x64" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://perma.cool",
    siteName: "PermaCool",
    title: "PermaCool Industrial Extraction Cooling Systems",
    description:
      "Industrial ethanol chillers and butane recovery systems built for commercial extraction production.",
    images: [
      {
        url: "/images/brand/permacool-social-card.jpg",
        width: 1200,
        height: 630,
        alt: "PermaCool industrial extraction cooling systems"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PermaCool Industrial Extraction Cooling Systems",
    description:
      "Industrial ethanol chillers and butane recovery systems built for commercial extraction production.",
    images: ["/images/brand/permacool-social-card.jpg"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
