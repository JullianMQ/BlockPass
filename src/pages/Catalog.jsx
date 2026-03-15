import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";
import Dropdown from "../components/Dropdown.jsx";
import EventCard from "../components/EventCard.jsx";
import events from "../data/events.json";

function Catalog() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("any");
  const [availabilityFilter, setAvailabilityFilter] = useState("any");
  const [searchValue, setSearchValue] = useState("");

  const filteredEvents = useMemo(() => {
    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const now = new Date();

    const matchesThisMonth = (eventDate) => {
      if (!eventDate) return false;
      const lower = eventDate.toLowerCase();
      if (lower.includes("tonight")) {
        return true;
      }
      const parts = lower.split(" ");
      const monthKey = parts[0]?.replace(/[^a-z]/g, "");
      const monthIndex = monthMap[monthKey];
      if (monthIndex === undefined) return false;
      const yearMatch = lower.match(/\b(20\d{2})\b/);
      const yearValue = yearMatch ? Number(yearMatch[1]) : now.getFullYear();
      return (
        monthIndex === now.getMonth() && yearValue === now.getFullYear()
      );
    };

    return events.filter((event) => {
      if (dateFilter === "this-month" && !matchesThisMonth(event.date)) {
        return false;
      }
      if (availabilityFilter !== "any" && event.availability !== availabilityFilter) {
        return false;
      }
      if (priceFilter === "under-0-2" && event.priceEth >= 0.2) {
        return false;
      }
      if (priceFilter === "0-2-0-6" && (event.priceEth < 0.2 || event.priceEth > 0.6)) {
        return false;
      }
      if (priceFilter === "above-0-6" && event.priceEth <= 0.6) {
        return false;
      }
      if (searchValue) {
        const query = searchValue.toLowerCase();
        const haystack = `${event.name} ${event.location}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [availabilityFilter, dateFilter, priceFilter, searchValue]);

  const priceItems = [
    { label: "Any Price", onClick: () => setPriceFilter("any") },
    { label: "Under 0.2 ETH", onClick: () => setPriceFilter("under-0-2") },
    { label: "0.2 - 0.6 ETH", onClick: () => setPriceFilter("0-2-0-6") },
    { label: "Above 0.6 ETH", onClick: () => setPriceFilter("above-0-6") },
  ];

  const availabilityItems = [
    { label: "Any Availability", onClick: () => setAvailabilityFilter("any") },
    { label: "Available", onClick: () => setAvailabilityFilter("available") },
    { label: "Limited", onClick: () => setAvailabilityFilter("limited") },
    { label: "Invite Only", onClick: () => setAvailabilityFilter("invite") },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-on-surface">
      <Navbar showFloatingNav />

      <main className="mx-auto max-w-7xl px-6 pt-28">
        <section className="mb-20">
          <div className="mb-12 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div className="max-w-2xl">
              <span className="mb-4 block font-label text-xs font-bold uppercase tracking-widest text-on-secondary-container">
                Curated Ledger
              </span>
              <h1 className="font-headline text-5xl font-bold leading-tight text-on-surface md:text-7xl">
                Catalog
              </h1>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative group">
                <input
                  className="w-full rounded-xl border-none bg-surface-container-highest py-4 pl-12 pr-6 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary/40 md:w-80"
                  placeholder="Search digital artifacts..."
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 py-6">
            <button
              className={`flex items-center gap-2 rounded-full px-5 py-3 font-semibold transition-colors ${
                dateFilter === "all"
                  ? "bg-primary-container text-on-primary-container"
                  : "border border-outline-variant/15 bg-surface-container-low text-on-surface-variant"
              }`}
              onClick={() => setDateFilter("all")}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                calendar_today
              </span>
              <span className="text-sm">All Dates</span>
            </button>
            <button
              className={`flex items-center gap-2 rounded-full px-5 py-3 font-semibold transition-colors ${
                dateFilter === "this-month"
                  ? "bg-primary-container text-on-primary-container"
                  : "border border-outline-variant/15 bg-surface-container-low text-on-surface-variant"
              }`}
              onClick={() => setDateFilter("this-month")}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                calendar_today
              </span>
              <span className="text-sm">This Month</span>
            </button>
            <Dropdown
              align="left"
              buttonClassName="flex items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container-low px-5 py-3 text-on-surface-variant"
              label={
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    payments
                  </span>
                  <span className="text-sm">
                    {priceFilter === "any"
                      ? "Price Range"
                      : priceFilter === "under-0-2"
                      ? "Under 0.2 ETH"
                      : priceFilter === "0-2-0-6"
                      ? "0.2 - 0.6 ETH"
                      : "Above 0.6 ETH"}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
                </>
              }
              items={priceItems.map((item) => ({
                label: item.label,
                onClick: item.onClick,
              }))}
            />
            <Dropdown
              align="left"
              buttonClassName="flex items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container-low px-5 py-3 text-on-surface-variant"
              label={
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    event_available
                  </span>
                  <span className="text-sm">
                    {availabilityFilter === "any"
                      ? "Availability"
                      : availabilityFilter === "available"
                      ? "Available"
                      : availabilityFilter === "limited"
                      ? "Limited"
                      : "Invite Only"}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
                </>
              }
              items={availabilityItems.map((item) => ({
                label: item.label,
                onClick: item.onClick,
              }))}
            />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-on-surface-variant">
                Showing {filteredEvents.length} events
              </span>
              <Button className="h-12 w-12" variant="outline">
                <span className="material-symbols-outlined">tune</span>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onView={() => navigate("/seat-map")}
            />
          ))}
        </div>
      </main>

    </div>
  );
}

export default Catalog;
