import Blast60Page from "../Blast60Page";
import StructuredData from "../components/StructuredData";
import { buildProductStructuredData, buildPublicPageMetadata } from "../../lib/site";

const blast60Description =
  "Chill 60 gallons of ethanol from room temperature to −40 °C in 45 minutes with the Perma Cool BLAST 60/45 ethanol chiller.";

export const metadata = buildPublicPageMetadata({
  path: "/ethanol-chiller-blast-60",
  title: "BLAST™ 60/45 Ethanol Chiller | Perma Cool",
  description: blast60Description,
  image: "/images/generated/blast60-hero-actual-split.png"
});

const blast60StructuredData = buildProductStructuredData({
  path: "/ethanol-chiller-blast-60",
  name: "BLAST 60/45 Ethanol Chiller",
  model: "BLAST 60/45",
  description: blast60Description,
  image: "/images/generated/blast60-hero-actual-split.png",
  properties: [
    ["Ethanol capacity", "60 gallons"],
    ["Pull-down target", "Room temperature to −40 °C in 45 minutes"],
    ["Refrigeration architecture", "Dual-stage cascade"],
    ["Workflow fit", "30-gallon centrifuge workflows"]
  ]
});

export default function Page() {
  return (
    <>
      <StructuredData data={blast60StructuredData} />
      <Blast60Page />
    </>
  );
}
