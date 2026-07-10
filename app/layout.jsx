import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://perma.cool"),
  title: "BLAST 60/45 Ethanol Chiller | PermaCool",
  description:
    "Chill 60 gallons of ethanol from room temperature to -40°C in 45 minutes with the PermaCool BLAST 60/45 ethanol chiller."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
