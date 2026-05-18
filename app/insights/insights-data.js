import {
  Activity,
  BadgeDollarSign,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Factory,
  Funnel,
  Gauge,
  GitBranch,
  Infinity,
  MonitorCog,
  Network,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Timer,
  TrendingUp,
  Wrench,
  Zap
} from "lucide-react";

export const insightArticles = [
  {
    slug: "minus-40-celsius-fahrenheit",
    category: "Temperature Science",
    title: "−40°: The Coldest Handshake in Science",
    shortTitle: "Why -40°C Equals -40°F",
    summary: "The rare point where Celsius and Fahrenheit meet, and why that matters in cold ethanol extraction.",
    description:
      "Learn why -40°C equals -40°F, why the Celsius and Fahrenheit scales meet at that exact point, and why -40 is a memorable target in ethanol chilling.",
    image: "/images/generated/insights-minus-40-meeting.svg",
    heroClass: "minus-40-hero",
    href: "/minus-40-celsius-fahrenheit",
    intro:
      "There is one temperature where Fahrenheit and Celsius finally agree: −40°. No conversion. No debate. Just one brutally cold number where two different scales meet in perfect alignment. It feels like a scientific anomaly, but it’s really the beautiful math of temperature measurement.",
    goalTicket:
      "The reader will clearly understand that −40° is the same temperature in Celsius and Fahrenheit.",
    related: [
      ["Workflow", "/workflow"],
      ["Explore Ethanol Chillers", "/ethanol-chilling-systems"],
      ["Direct Refrigerant vs LN2", "/direct-refrigerant-vs-ln2"]
    ],
    cta: {
      eyebrow: "Need reliable -40 performance?",
      title: "Build your extraction process around a temperature target operators remember and equipment can repeat.",
      primary: ["Talk to Perma Cool", "/contact-us"],
      secondary: ["Explore Ethanol Chillers", "/ethanol-chilling-systems"]
    }
  },
  {
    slug: "owning-an-extraction-lab-means-owning-the-process",
    category: "Process Ownership",
    title: "Owning an Extraction Lab Means Owning the Process",
    shortTitle: "Owning the Process",
    summary: "Why extraction lab success comes from disciplined process ownership, not equipment alone.",
    description:
      "Learn why owning an extraction lab means mastering yield, quality, workflow, recovery, and repeatable process discipline.",
    image: "/images/generated/insights-process-ownership.svg",
    heroClass: "process-ownership-hero",
    href: "/owning-an-extraction-lab-means-owning-the-process",
    intro:
      "Owning an extraction lab means mastering the discipline behind the equipment: material prep, temperature control, recovery, SOPs, data, maintenance, and continuous improvement.",
    related: [
      ["Workflow", "/workflow"],
      ["More Output Per Gallon", "/more-output-per-gallon"],
      ["Explore Ethanol Chillers", "/ethanol-chilling-systems"]
    ],
    cta: {
      eyebrow: "Building a stronger extraction operation?",
      title: "Design the chilling workflow around the process discipline that makes the lab scale.",
      primary: ["Talk to PermaCool", "/contact-us"],
      secondary: ["Explore Ethanol Chillers", "/ethanol-chilling-systems"]
    }
  },
  {
    slug: "more-output-per-gallon",
    category: "Workflow Efficiency",
    title: "More Output Per Gallon: Extract, Re-Chill, and Re-Run Ethanol",
    shortTitle: "More Output Per Gallon",
    summary: "How repeated ethanol reuse can move more extracted value through the recovery bottleneck.",
    description:
      "Learn how extract, re-chill, and re-run ethanol workflows help processors increase biomass processed per gallon of ethanol.",
    image: "/images/generated/insights-more-output-per-gallon.svg",
    href: "/more-output-per-gallon",
    intro:
      "Solvent recovery is often the slowest part of cold ethanol extraction. This workflow helps each gallon of ethanol do more work before it reaches recovery.",
    related: [
      ["Workflow Breakdown", "/workflow"],
      ["Explore Ethanol Chillers", "/ethanol-chilling-systems"],
      ["Reduce LN2 Dependence", "/how-to-reduce-ln2-dependence"]
    ],
    cta: {
      eyebrow: "Want to increase output per gallon?",
      title: "Build an extract, re-chill, and re-run workflow around reliable ethanol chilling.",
      primary: ["Talk to Perma Cool", "/contact-us"],
      secondary: ["Read Workflow Article", "/workflow"]
    }
  },
  {
    slug: "how-to-reduce-ln2-dependence",
    category: "LN2 Transition",
    title: "How to Reduce LN2 Dependence in Extraction Facilities",
    shortTitle: "How to Reduce LN2 Dependence",
    summary: "Steps to shift from consumable-heavy cooling to scalable operations.",
    description:
      "A practical guide to reducing LN2 dependence in extraction with direct refrigerant ethanol chilling and better process control.",
    image: "/images/generated/insights-ln2-dependence.png",
    href: "/how-to-reduce-ln2-dependence",
    intro:
      "Teams reducing LN2 usage usually improve in three areas: recurring cost control, process stability, and throughput predictability.",
    sections: [
      {
        icon: Search,
        title: "1) Audit current LN2 cost and process load",
        body: "Track monthly spend, chill times, and temperature variance by batch. This gives a baseline for evaluating alternatives."
      },
      {
        icon: Snowflake,
        title: "2) Move core chilling duty to direct refrigerant",
        body: "Direct refrigerant ethanol chillers can handle daily process loads while reducing consumable dependency."
      },
      {
        icon: Activity,
        title: "3) Standardize control and monitoring",
        body: "PLC/HMI visibility helps operators maintain repeatable temperature performance and reduce downtime events."
      }
    ],
    related: [
      ["Direct Refrigerant vs LN2", "/direct-refrigerant-vs-ln2"],
      ["Design Checklist", "/extraction-cooling-system-design-checklist"]
    ],
    cta: {
      eyebrow: "Cutting LN2 spend this quarter?",
      title: "Request a transition plan built around your current process load.",
      primary: ["Request a Transition Plan", "/contact-us"],
      secondary: ["Explore Ethanol Chillers", "/ethanol-chilling-systems"]
    }
  },
  {
    slug: "workflow",
    category: "Process Story",
    title: "Workflow",
    shortTitle: "Workflow",
    summary:
      "Learn how the Perma Cool pre-ethanol chillers workflow can drastically increase your extraction throughput.",
    description:
      "See how the PermaCool pre-ethanol chilling workflow supports extraction throughput, re-chill cycles, and lower LN2 dependence.",
    image: "/images/generated/insights-workflow.png",
    href: "/workflow",
    intro:
      "Learn how the Perma Cool pre-ethanol chiller workflow can drastically increase extraction throughput while improving consistency, safety, and operating efficiency.",
    kicker: "Perma Cool Ethanol Pre-Chiller",
    deck: "Step-by-Step Process & The Electric Advantage",
    steps: [
      {
        icon: Snowflake,
        title: "1. Chill Ethanol",
        body: "Ethanol is chilled to -40°C/F."
      },
      {
        icon: Gauge,
        title: "2. Pump Ethanol",
        body: "The chilled ethanol is pumped by the Perma Cool pump to fill the centrifuge."
      },
      {
        icon: Activity,
        title: "3. Process Biomass",
        body: "The centrifuge processes the biomass using the chilled ethanol."
      },
      {
        icon: Zap,
        title: "4. Extract Tincture Solution",
        body: 'The ethanol, now called the "tincture solution," is spun out of the centrifuge.'
      },
      {
        icon: GitBranch,
        title: "5. Pump Tincture Solution",
        body: "A diaphragm pump moves the tincture solution out of the centrifuge."
      },
      {
        icon: Funnel,
        title: "6. Filter Biomass",
        body:
          "The tincture solution passes through a biomass strainer to filter out any biomass particles. Filtering the tincture solution helps protect the Perma Cool chiller from biomass contamination."
      },
      {
        icon: Activity,
        title: "7. Return and Rechill",
        body:
          "The tincture solution, now typically around -30°F (10 degrees warmer due to the extraction, pumping, and filtering stages), returns to the Perma Cool chiller."
      },
      {
        icon: Infinity,
        title: "8. Repeat",
        body:
          "The tincture solution is re-chilled to -40°C/F to continue extraction. Repeat these steps until you reach at least a 2 lbs of material to 1 gallon of ethanol ratio, processing up to 440 lbs of biomass in your 270 gallon ethanol chilling tank."
      }
    ],
    callout:
      "Pro Tip: By following these steps, you ensure efficient and consistent extraction using the Perma Cool Ethanol Pre-Chiller.",
    advantageIntro:
      "Switching from liquid nitrogen (LN2) to electricity with the Perma Cool Ethanol Pre-Chiller delivers major benefits in cost, efficiency, safety, and reliability.",
    groups: [
      {
        title: "Cost Savings",
        bullets: [
          "Electricity is significantly more economical than LN2, eliminating ongoing consumable costs.",
          "The Perma Cool units often pay for themselves within the first one to two months through LN2 savings alone-before factoring in the cost of LN2 chillers themselves."
        ]
      },
      {
        title: "Workflow Efficiency",
        bullets: [
          "Extraction Efficiency: Each gallon of ethanol can be used to extract at least two pounds of material. Ethanol that has already gone through extraction can be reused, maximizing efficiency.",
          "Optimized Ethanol Usage: Re-washing material with previously extracted ethanol maintains the proper ethanol-to-material ratio for centrifuge operation, while also allowing larger ethanol batches to be chilled at once. This speeds up overall throughput.",
          "Consistent Temperature Control: The system quickly rechills ethanol back to -40°C/°F after extraction. Because the ethanol only needs to be cooled from a small temperature rise, chilling is faster, and overall productivity is higher."
        ]
      },
      {
        title: "Reduced Labor and Hassle",
        bullets: [
          "LN2 requires constant deliveries, tank handling, and storage management. A missed delivery or supply shortage can halt production.",
          "Electricity removes these issues, reducing labor hours and eliminating supply chain risks."
        ]
      },
      {
        title: "Safety",
        bullets: [
          "LN2 is one of the leading causes of laboratory accidents in the United States.",
          "By removing LN2 from the large-scale chilling process, the Perma Cool system minimizes safety risks for staff and reduces environmental hazards."
        ]
      },
      {
        title: "Additional Advantage: Concentrated Tincture",
        bullets: [
          "A higher-saturation ethanol tincture also improves downstream efficiency.",
          "With less ethanol per pound of material, evaporation requires less energy and time, further streamlining production."
        ]
      },
      {
        title: "Summary",
        body:
          "Using electricity with the Perma Cool Ethanol Pre-Chiller lowers costs, increases workflow efficiency, enhances safety, and simplifies operations. The result is faster processing, higher productivity, and a safer, more reliable extraction environment."
      }
    ],
    cta: {
      eyebrow: "Want help matching a workflow to your extraction process?",
      title: "Map your extraction rhythm to the right chilling architecture.",
      primary: ["Talk to PermaCool", "/contact-us"],
      secondary: ["See BLAST lineup", "/ethanol-chilling-systems"]
    }
  },
  {
    slug: "industrial-process-chiller-maintenance",
    category: "Uptime",
    title: "Industrial Process Chiller Maintenance for Extraction",
    shortTitle: "Industrial Chiller Maintenance",
    summary: "Practical upkeep guidance to protect uptime and process consistency.",
    description: "Industrial chiller maintenance guidance for uptime, warning signs, and service planning.",
    image: "/images/generated/insights-maintenance.png",
    href: "/industrial-process-chiller-maintenance",
    intro:
      "Consistent maintenance protects throughput and reduces emergency downtime in extraction operations.",
    sections: [
      {
        icon: CalendarDays,
        title: "Weekly checks",
        body: "Inspect temperatures, pressure trends, alarms, and visible leaks; verify pumps and circulation behavior."
      },
      {
        icon: CalendarRange,
        title: "Monthly checks",
        body: "Review condenser cleanliness, electrical terminations, control logs, and alarm history for early warnings."
      },
      {
        icon: ShieldCheck,
        title: "Quarterly checks",
        body: "Validate sensor calibration, inspect safety controls, and confirm performance under peak process load."
      }
    ],
    related: [
      ["BLAST 150", "/ethanol-chiller-blast-150"],
      ["Learning Center", "/learning-center"]
    ],
    cta: {
      eyebrow: "Protecting uptime on a high-duty system?",
      title: "Use service clarity to make the equipment feel trustworthy before purchase.",
      primary: ["Request Service Guidance", "/contact-us"],
      secondary: ["See Chiller Systems", "/ethanol-chilling-systems"]
    }
  },
  {
    slug: "extraction-cooling-system-design-checklist",
    category: "Pre-Quote Planning",
    title: "Extraction Cooling System Design Checklist",
    shortTitle: "Cooling System Design Checklist",
    summary: "Define temp, throughput, controls, and utility constraints before buying.",
    description:
      "Cooling system design checklist covering temperature targets, throughput, utilities, controls, and installation constraints.",
    image: "/images/generated/insights-design-checklist.png",
    href: "/extraction-cooling-system-design-checklist",
    intro:
      "Before selecting equipment, define process requirements so your system matches real production demand.",
    sections: [
      {
        icon: Snowflake,
        title: "Target process temperature",
        body: "Target process temperature, for example around -40°C."
      },
      {
        icon: Timer,
        title: "Required pull-down time and batch cadence",
        body: "Clarify how fast the system must recover and how often the batch cycle repeats."
      },
      {
        icon: Building2,
        title: "Facility utilities and condenser placement constraints",
        body: "Power, ventilation, condenser placement, and service access shape what can be recommended honestly."
      },
      {
        icon: MonitorCog,
        title: "Control requirements",
        body: "Define PLC/HMI, alarm, visibility, and operator-interface expectations before equipment is selected."
      },
      {
        icon: TrendingUp,
        title: "Future scale plan for added throughput",
        body: "Make sure the cooling architecture can support the next production target, not just the current pain."
      }
    ],
    related: [
      ["Reduce LN2 Dependence", "/how-to-reduce-ln2-dependence"],
      ["Direct Refrigerant vs LN2", "/direct-refrigerant-vs-ln2"]
    ],
    cta: {
      eyebrow: "Need help sizing your cooling architecture?",
      title: "Turn intake answers into a better equipment recommendation.",
      primary: ["Book a Design Call", "/contact-us"],
      secondary: ["Compare Cooling Approaches", "/direct-refrigerant-vs-ln2"]
    }
  },
  {
    slug: "direct-refrigerant-vs-ln2",
    category: "Cooling Economics",
    title: "Direct Refrigerant Ethanol Chillers vs. LN2",
    shortTitle: "Direct Refrigerant vs LN2",
    summary: "Compare cost profile, control, and scale readiness.",
    description:
      "Compare direct refrigerant ethanol chillers with LN2 for recurring cost, control visibility, and production readiness.",
    image: "/images/generated/insights-direct-refrigerant-vs-ln2.png",
    href: "/direct-refrigerant-vs-ln2",
    intro:
      "For many extraction teams, the core decision is no longer whether to chill, but how to chill efficiently at scale. Direct refrigerant systems are increasingly preferred where long-term operating costs and process control matter.",
    kicker: "Key comparison factors",
    sections: [
      {
        icon: BadgeDollarSign,
        title: "Recurring cost profile",
        body: "LN2 can carry continuous consumable spend. Direct refrigerant systems shift costs toward power + maintenance."
      },
      {
        icon: SlidersHorizontal,
        title: "Operational control",
        body: "PLC/HMI-based control can provide clearer visibility and more repeatable process behavior."
      },
      {
        icon: Factory,
        title: "Scale readiness",
        body: "Commercial facilities often prioritize systems that support stable throughput over ad-hoc cooling inputs."
      },
      {
        icon: Network,
        title: "System integration",
        body: "HVAC condenser integration supports streamlined process chilling architecture."
      }
    ],
    noteTitle: "When LN2 still makes sense",
    note:
      "LN2 may still be useful in specific short-term, niche, or legacy workflows. But for sustained production, many operators evaluate total annual cost and control consistency before committing.",
    related: [
      ["How to Reduce LN2 Dependence", "/how-to-reduce-ln2-dependence"],
      ["Learning Center", "/learning-center"]
    ],
    cta: {
      eyebrow: "Need help modeling LN2 replacement economics?",
      title: "Compare annual cost, control, and install fit against your current process.",
      primary: ["Get a Cost Comparison Call", "/contact-us"],
      secondary: ["See BLAST 150", "/ethanol-chiller-blast-150"]
    }
  }
];

export const articlesBySlug = Object.fromEntries(insightArticles.map((article) => [article.slug, article]));

export const insightIndexStats = [
  ["8", "active knowledge pages"],
  ["3", "buyer objections covered"],
  ["1", "clear path to a recommendation"]
];

export const insightHeroImage = "/images/generated/insights-hero.png";

export const navItems = [
  ["Ethanol Chillers", "/ethanol-chilling-systems"],
  ["Butane Recovery", "/butane-recovery-system"],
  ["Learning Center", "/learning-center"],
  ["Contact", "/contact-us"]
];

export const indexTopics = [
  "-40 Celsius and Fahrenheit temperature science",
  "Process ownership as the core extraction lab discipline",
  "Extract, re-chill, and re-run ethanol efficiency",
  "LN2 dependence and operating cost",
  "Extraction workflow and repeat-cycle chilling",
  "Industrial maintenance and uptime planning",
  "Cooling system design and pre-quote discovery",
  "Direct refrigerant vs consumable-heavy chilling"
];

export { ClipboardCheck, Wrench };
