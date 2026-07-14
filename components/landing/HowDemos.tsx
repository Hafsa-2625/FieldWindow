/** Decorative mini-demos for the landing "how it works" section. */

export function SprayDemo() {
  const hours = [
    { t: "6a", kind: "good" as const },
    { t: "9a", kind: "good" as const },
    { t: "12", kind: "caution" as const },
    { t: "3p", kind: "good" as const },
    { t: "5p", kind: "avoid" as const },
    { t: "6p", kind: "avoid" as const },
    { t: "8p", kind: "good" as const },
    { t: "9p", kind: "good" as const },
  ];

  return (
    <div className="how-panel how-panel-spray" aria-hidden>
      <div className="how-panel-shine" />
      <div className="how-panel-top">
        <span className="how-chip how-chip-ok">Safe</span>
        <span className="how-chip how-chip-mid">Maybe</span>
        <span className="how-chip how-chip-no">Wait</span>
      </div>
      <div className="how-spray-row">
        {hours.map((h) => (
          <div key={h.t} className={`how-hour how-hour-${h.kind}`}>
            <div className="how-hour-face">
              {h.kind === "good" && <SunIcon />}
              {h.kind === "caution" && <BreezeIcon />}
              {h.kind === "avoid" && <DropIcon />}
            </div>
            <span className="how-hour-label">{h.t}</span>
          </div>
        ))}
      </div>
      <p className="how-caption">
        <span className="how-caption-arrow" />
        sweetest window sits in the soft greens
      </p>
    </div>
  );
}

export function HarvestDemo() {
  const days = [
    { d: "Mon", kind: "wet" as const },
    { d: "Tue", kind: "dry" as const },
    { d: "Wed", kind: "best" as const },
    { d: "Thu", kind: "best" as const },
    { d: "Fri", kind: "best" as const },
    { d: "Sat", kind: "wet" as const },
    { d: "Sun", kind: "dry" as const },
  ];

  return (
    <div className="how-panel how-panel-harvest" aria-hidden>
      <div className="how-panel-shine" />
      <div className="how-harvest-row">
        {days.map((day) => (
          <div key={day.d} className={`how-day how-day-${day.kind}`}>
            <span className="how-day-name">{day.d}</span>
            <div className="how-day-face">
              {day.kind === "wet" && <CloudIcon />}
              {day.kind === "dry" && <SunIcon />}
              {day.kind === "best" && <LeafIcon />}
            </div>
            {day.kind === "best" && <span className="how-day-tag">pick</span>}
          </div>
        ))}
      </div>
      <p className="how-caption how-caption-center">
        three golden days for baskets
      </p>
    </div>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="how-ico" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4.5" fill="currentColor" opacity="0.9" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M5.8 18.2l1.5-1.5M16.7 7.3l1.5-1.5" />
      </g>
    </svg>
  );
}

function DropIcon() {
  return (
    <svg viewBox="0 0 24 24" className="how-ico" fill="none" aria-hidden>
      <path
        d="M12 4c0 0 6 7.2 6 11a6 6 0 1 1-12 0c0-3.8 6-11 6-11z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function BreezeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="how-ico" fill="none" aria-hidden>
      <path
        d="M4 9h11a2.5 2.5 0 1 0-2.5-2.5M4 13h14a2.5 2.5 0 1 1-2.5 2.5M4 17h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="how-ico" fill="none" aria-hidden>
      <path
        d="M7.5 17h10a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.4A3.5 3.5 0 0 0 7.5 17z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="how-ico" fill="none" aria-hidden>
      <path
        d="M19 5c-8 1-12 6-13 13 7-1 12-5 13-13z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M6.5 17.5c3-3 7-6 11.5-8"
        stroke="#F3F6F0"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
