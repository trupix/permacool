export const chillerModels = [
  { label: "BLAST 60/45", href: "/ethanol-chiller-blast-60" },
  { label: "BLAST 150/45", href: "/ethanol-chiller-blast-150" },
  { label: "BLAST 150/30", href: "/ethanol-chiller-blast-150-30" },
  { label: "BLAST 240/45", href: "/ethanol-chiller-blast-240" }
];

export const chillerOverview = "/ethanol-chilling-systems";

export function getChillerNavigation(pathname) {
  const model = chillerModels.find((item) => item.href === pathname);
  if (!model && pathname !== chillerOverview && pathname !== "/ethanol-chiller-comparison") return null;
  return {
    selectedHref: model?.href || (pathname === chillerOverview ? chillerOverview : ""),
    contact: {
      interest: "Ethanol Chillers",
      requestType: "Product Pricing",
      ...(model ? { product: model.label } : {}),
      source: pathname.slice(1)
    }
  };
}
