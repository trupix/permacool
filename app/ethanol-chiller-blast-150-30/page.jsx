import StructuredData from "../components/StructuredData";
import { InsightsHeader } from "../insights/InsightsShell";
import { buildProductStructuredData, buildPublicPageMetadata } from "../../lib/site";
import { buildContactHref } from "../../lib/contact";
import Blast15030Experience from "./Blast15030Experience";
import "./blast15030.css";

const path = "/ethanol-chiller-blast-150-30";
const description =
  "Perma Cool BLAST 150/30 flash-chills 150 gallons of ethanol to −40 °C in 30 minutes with 5 GPM performance, a 22 HP + 6 HP cascade architecture, regenerative chilling, and Mirage 1.0 controls.";

export const metadata = buildPublicPageMetadata({
  path,
  title: "BLAST™ 150/30 Ethanol Chiller | 150 Gallons to −40 °C in 30 Minutes | Perma Cool",
  description,
  image: "/images/generated/blast15030/blast15030-social.png"
});

const productData = buildProductStructuredData({
  path,
  name: "BLAST 150/30 Ethanol Chiller",
  model: "BLAST 150/30",
  description,
  image: "/images/generated/blast15030/blast15030-social.png",
  properties: [
    ["Ethanol capacity", "150 gallons"],
    ["Pull-down target", "Room temperature to −40 °C in 30 minutes"],
    ["Flash chilling rate", "5 gallons per minute"],
    ["Refrigeration architecture", "22 HP primary stage plus 6 HP cascade subcooling stage"],
    ["Control system", "Mirage 1.0 by Agenticly Cool"]
  ]
});

const pricingHref = buildContactHref({
  interest: "Ethanol Chillers",
  requestType: "Product Pricing",
  product: "BLAST 150/30",
  source: "ethanol-chiller-blast-150-30"
});

export default function Blast15030Page() {
  return (
    <main className="site-shell blast15030-page">
      <StructuredData data={productData} />
      <InsightsHeader />
      <Blast15030Experience pricingHref={pricingHref} />
    </main>
  );
}
