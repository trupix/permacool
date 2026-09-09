# BLAST 60/45 content restoration

Compared against the complete original `app/Blast60Page.jsx` at commit `a98dc9ccf2f79062ca3f706228a1c1c624808217`, including its Learning Center component and the text embedded in the original performance graphic.

| Original material | Location in refreshed page |
| --- | --- |
| Hero, 60-gallon capacity, room temperature to −40 °C in 45 minutes, 30-gallon centrifuge pairing | Hero, quick specifications, workflow, specification table |
| All three Production Fit cards | Production Fit, restored original wording |
| Tank/circulation/heat-transfer assembly, FluxBox cascade function, PLC monitoring/logic/control, two six-horsepower condensers | Four equipment cards |
| Two smaller refrigeration stages rather than one oversized unit; primary directly chills ethanol; secondary cools primary | Cascade explanation and original flow diagram |
| Lower-temperature performance, parts sourcing, easier diagnosis/repair, service costs, repairable standard components, long-term maintainability | Three field-benefit columns below the cascade diagram |
| ACP-30 history: more than 200 units, roughly 40 gallons, single-pass support | ACP-30 to BLAST 60/45 workflow history |
| 2:1 capacity ratio, mixing into cold reserve, smaller temperature rise, faster recovery to −40 °C | Workflow explanation and capacity graphic |
| Repeat extraction/re-chill until roughly 2–3 lb of material per gallon, then filtration and evaporation | Repeat-cycle workflow detail |
| Original performance graphic, including its 1.33 GPM flash-chilling figure | Full-size performance image and specification table |
| Capacity, configuration/facility-dependent target temperature, direct refrigerant, HVAC condenser integration, PLC/HMI and compressor protection | Specification table and qualification paragraph |
| Consumable replacement, electric chilling, repeat-cycle recovery, operation/ownership costs, throughput and reliability | Restored ROI / Replacement section and original illustration |
| Learning Center introduction, three article cards and destination links | Original LearningCenterSection component, with route-scoped visual styling |
| Cooling-method comparison and maintenance-guide destinations | Ownership link and Related articles |
| Old crystal-bear hero illustration | Expandable original system illustration under equipment; new clean hero remains primary |
| Four component images and original refrigerant-flow diagram | Existing uncropped equipment and cascade images |

## Editorial treatment

- No original image assets were deleted. All images referenced directly by the original BLAST page are reachable from the refreshed page.
- Repeated introductory sentences and headings are consolidated; the technical points, historical numbers, workflow explanation, and linked resources are retained.
- The informal “keep these going forever” sentence is represented as long-term maintainability, not a literal unlimited-lifetime guarantee.
- Production Fit remains verbatim following the user's explicit restoration request. Its “only” cascade-model statement and short payback claim remain legacy marketing claims requiring review; they were not independently validated by this restoration.
- The old claim that FluxBox is exclusive to the 60/45 is not reintroduced; the component's role in this system is retained.

Run `node scripts/test-blast60-content.js` for baseline image coverage and restored content checks.
