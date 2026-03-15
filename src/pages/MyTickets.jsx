import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";

const tickets = [
  {
    id: "BP-7XK4-92QF",
    eventName: "Neo-Tokyo Symphony Hall",
    date: "Oct 24, 2024",
    time: "20:00 JST",
    category: "Standard Admission",
    seat: "Row B, Seat 4",
    entrance: "North Wing Entrance",
    status: "valid",
    tokenId: "#8821",
  },
  {
    id: "BP-2M9L-44TT",
    eventName: "Digital Echoes Expo",
    date: "Nov 12, 2024",
    time: "10:00 GMT",
    category: "VIP All-Access Pass",
    seat: "Lounge Access included",
    entrance: "Floor G",
    status: "valid",
    tokenId: "#1290",
  },
  {
    id: "BP-19VZ-001X",
    eventName: "Ether Summit 2024",
    date: "Aug 15, 2024",
    time: "08:00 UTC",
    category: "Delegate Pass",
    seat: "General Admission",
    entrance: "Archived",
    status: "used",
    tokenId: "#0442",
  },
];

function MyTickets() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar showFloatingNav />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-28">
        <header className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="mb-4 block font-label text-sm uppercase tracking-[0.2em] text-on-secondary-container">
              Dashboard
            </span>
            <h1 className="font-headline text-5xl font-bold tracking-tight text-on-surface">
              My Collection
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button className="px-6 py-2 text-sm" variant="primary">
              All
            </Button>
            <Button className="px-6 py-2 text-sm" variant="outline">
              Unused
            </Button>
            <Button className="px-6 py-2 text-sm" variant="outline">
              Used
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {tickets.map((ticket) => {
            const isUsed = ticket.status === "used";
            return (
              <article
                key={ticket.id}
                className={`flex flex-col overflow-hidden rounded-full bg-surface-container transition-all duration-300 md:flex-row ${
                  isUsed
                    ? "opacity-80 grayscale hover:grayscale-0 hover:opacity-100"
                    : "hover:bg-surface-container-high"
                }`}
              >
                <div className="relative h-48 w-full bg-surface-container-highest md:h-auto md:w-64">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        isUsed
                          ? "border border-outline-variant/30 bg-surface-variant/80 text-on-surface-variant"
                          : "border border-primary/30 bg-primary/20 text-primary"
                      }`}
                    >
                      {isUsed ? "Used" : "Valid"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div>
                    <div className="mb-2 flex items-start justify-between">
                      <h3
                        className={`font-headline text-2xl font-bold leading-tight ${
                          isUsed ? "text-on-surface/60 line-through" : ""
                        }`}
                      >
                        {ticket.eventName}
                      </h3>
                      <span
                        className={`font-label text-xs ${
                          isUsed
                            ? "text-on-surface-variant/40"
                            : "text-on-surface-variant/60"
                        }`}
                      >
                        {ticket.tokenId}
                      </span>
                    </div>
                    <div
                      className={`mb-4 flex flex-wrap items-center gap-4 text-sm ${
                        isUsed
                          ? "text-on-surface-variant/40"
                          : "text-on-surface-variant"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">
                          calendar_today
                        </span>
                        <span>{ticket.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">
                          schedule
                        </span>
                        <span>{ticket.time}</span>
                      </div>
                    </div>
                    <p
                      className={`mb-1 text-sm font-medium ${
                        isUsed
                          ? "text-on-surface-variant/40"
                          : "text-on-secondary-container"
                      }`}
                    >
                      {ticket.category}
                    </p>
                    <p
                      className={`text-xs ${
                        isUsed
                          ? "text-on-surface-variant/40"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {ticket.seat} • {ticket.entrance}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-outline-variant/10 pt-6">
                    <div>
                      <p
                        className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${
                          isUsed
                            ? "text-on-surface-variant/30"
                            : "text-on-surface-variant/50"
                        }`}
                      >
                        Reference Code
                      </p>
                      <p
                        className={`font-mono text-xs font-semibold ${
                          isUsed
                            ? "text-on-surface-variant/30"
                            : "text-on-surface"
                        }`}
                      >
                        {ticket.id}
                      </p>
                    </div>
                    {isUsed ? (
                      <button className="cursor-default rounded-full border border-outline-variant/20 px-6 py-2.5 text-sm font-bold text-on-surface-variant/60">
                        Archive
                      </button>
                    ) : (
                      <Button className="px-6 py-2.5 text-sm" variant="ghost">
                        View Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          <article className="flex items-center justify-center rounded-full border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-12 text-center transition-all hover:border-primary/40">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl text-primary">
                  add_circle
                </span>
              </div>
              <h3 className="mb-2 font-headline text-xl font-bold text-on-surface">
                Add New Experience
              </h3>
              <p className="max-w-[240px] text-sm text-on-surface-variant">
                Browse the marketplace and claim your next digital artifact.
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default MyTickets;
