import Button from "./Button.jsx";

function EventCard({ event, onView }) {
  const {
    name,
    priceEth,
    date,
    location,
    tags = [],
    availability,
    priceRange,
  } = event;

  const tagMap = {
    live: { label: "Live Now", className: "text-primary" },
    featured: { label: "Featured", className: "text-on-surface" },
    "limited-series": { label: "Limited Series", className: "text-primary" },
    "late-night": { label: "Late Night", className: "text-on-surface" },
  };

  const availabilityLabel =
    availability === "limited"
      ? "Limited"
      : availability === "invite"
      ? "Invite Only"
      : "Available";

  const priceLabel =
    typeof priceRange === "string"
      ? `${priceRange} ETH`
      : `${priceEth.toFixed(2)} ETH`;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-surface-container transition-all hover:-translate-y-1 hover:bg-surface-container-high hover:shadow-[0_20px_40px_-20px_rgba(192,193,255,0.35)]">
      <div className="p-6">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-headline text-2xl font-bold text-on-surface">
            {name}
          </h3>
          <span className="font-bold text-primary">{priceLabel}</span>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-outline-variant/30 bg-surface-dim/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {availabilityLabel}
          </span>
          {tags.map((tag) => {
            const tagInfo = tagMap[tag] || { label: tag, className: "text-primary" };
            const base =
              "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest";
            if (tagInfo.className.includes("bg-")) {
              return (
                <span key={tag} className={`${base} ${tagInfo.className}`}>
                  {tagInfo.label}
                </span>
              );
            }
            return (
              <span
                key={tag}
                className={`${base} border border-outline-variant/30 bg-surface-dim/80 ${tagInfo.className}`}
              >
                {tagInfo.label}
              </span>
            );
          })}
        </div>
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">
              calendar_month
            </span>
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">
              location_on
            </span>
            <span className="text-sm">{location}</span>
          </div>
        </div>
        <Button className="w-full py-4 text-sm tracking-wide" onClick={onView}>
          View Event
        </Button>
      </div>
    </div>
  );
}

export default EventCard;
