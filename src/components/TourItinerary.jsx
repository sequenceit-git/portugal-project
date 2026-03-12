const TourItinerary = ({
  tourId,
  defaultTitle = "Itinerary",
  defaultSteps = [],
  itineraryByTourId = {},
}) => {
  const resolvedContent = itineraryByTourId[String(tourId)] || {};
  const sectionTitle = resolvedContent.title || defaultTitle;
  const steps =
    Array.isArray(resolvedContent.steps) && resolvedContent.steps.length
      ? resolvedContent.steps
      : defaultSteps;

  if (!steps.length) return null;

  const scrollToMap = () => {
    const allMapElements = document.querySelectorAll("#tour-meeting-location");
    // Use getComputedStyle to correctly detect Tailwind media-query visibility
    const mapElement = Array.from(allMapElements).find(
      (el) => window.getComputedStyle(el).display !== "none",
    );
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const itineraryColumns = 3;
  // Independent desktop controls: move icons/cards and path separately.
  const itineraryIconXPositions = [120, 460, 870];
  const itineraryLineXPositions = [120, 460, 960];
  const itineraryStartY = 56;
  const itineraryRowGap = 205;
  const itineraryIconRadius = 28;

  const itineraryDesktopPositions = steps.map((_, idx) => {
    const row = Math.floor(idx / itineraryColumns);
    const positionInRow = idx % itineraryColumns;
    const isReverseRow = row % 2 === 1;
    const col = isReverseRow
      ? itineraryColumns - 1 - positionInRow
      : positionInRow;
    const x = itineraryIconXPositions[col];
    const y = itineraryStartY + row * itineraryRowGap;

    return {
      left: `${(x / 1000) * 100}%`,
      top: `${y - itineraryIconRadius}px`,
      x,
      y,
    };
  });

  const itineraryLinePoints = steps.map((_, idx) => {
    const row = Math.floor(idx / itineraryColumns);
    const positionInRow = idx % itineraryColumns;
    const isReverseRow = row % 2 === 1;
    const col = isReverseRow
      ? itineraryColumns - 1 - positionInRow
      : positionInRow;
    const x = itineraryLineXPositions[col];
    const y = itineraryStartY + row * itineraryRowGap;

    return { x, y };
  });

  const itineraryLastY =
    itineraryDesktopPositions[itineraryDesktopPositions.length - 1]?.y ||
    itineraryStartY;
  const itinerarySvgHeight = itineraryLastY + 120;

  const buildRoundedPath = (points, radius = 44) => {
    if (!points.length) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];

      const prevDx = current.x - prev.x;
      const prevDy = current.y - prev.y;
      const nextDx = next.x - current.x;
      const nextDy = next.y - current.y;

      const prevLen = Math.hypot(prevDx, prevDy);
      const nextLen = Math.hypot(nextDx, nextDy);
      const cornerRadius = Math.min(radius, prevLen / 2, nextLen / 2);

      const entryX = current.x - (prevDx / prevLen) * cornerRadius;
      const entryY = current.y - (prevDy / prevLen) * cornerRadius;
      const exitX = current.x + (nextDx / nextLen) * cornerRadius;
      const exitY = current.y + (nextDy / nextLen) * cornerRadius;

      d += ` L ${entryX} ${entryY}`;
      d += ` Q ${current.x} ${current.y} ${exitX} ${exitY}`;
    }

    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  };

  const itineraryPathD = buildRoundedPath(itineraryLinePoints);

  return (
    <section className="relative">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight break-words">
            {sectionTitle}
          </h2>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] sm:text-sm text-primary font-semibold uppercase tracking-wide whitespace-nowrap w-fit">
            {steps.length} {steps.length === 1 ? "Location" : "Locations"}
          </span>
        </div>
        <button
          onClick={scrollToMap}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs sm:text-sm rounded-lg transition-colors w-fit"
        >
          <span className="material-icons text-base">location_on</span>
          Check Meeting Location below
        </button>
      </div>

      <div className="rounded-2xl border border-primary/10 p-4 sm:p-6">
        <div className="md:hidden relative">
          <span
            aria-hidden="true"
            className="absolute left-9 top-9 bottom-9 w-1 rounded-full bg-primary/70"
          ></span>

          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.title} className="relative z-10">
                <div className="flex items-center gap-3 bg-surface-light rounded-xl border border-slate-100 p-3.5">
                  <span className="w-11 h-11 rounded-full bg-background-light text-primary border border-primary/20 flex items-center justify-center shadow-sm">
                    <span className="material-icons text-base">
                      {step.icon}
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="hidden md:block relative"
          style={{ height: `${itinerarySvgHeight}px` }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 1000 ${itinerarySvgHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={itineraryPathD}
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {steps.map((step, idx) => {
            const pos = itineraryDesktopPositions[idx];
            return (
              <div
                key={step.title}
                className="absolute -translate-x-1/2 flex flex-col items-center text-center w-36"
                style={{ left: pos.left, top: pos.top }}
              >
                <span className="w-14 h-14 rounded-full bg-background-light text-primary border-2 border-primary/20 flex items-center justify-center shadow-md">
                  <span className="material-icons text-xl">{step.icon}</span>
                </span>
                <p className="mt-1.5 text-[11px] font-bold text-slate-900 leading-tight">
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TourItinerary;
