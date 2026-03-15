import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";

function OrganizerDashboard() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar showFloatingNav={false} showSearch />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-8 pb-24 pt-28">
        <nav className="flex items-center gap-3 text-sm">
          <span className="text-on-surface-variant">Organizer</span>
          <span className="material-symbols-outlined text-xs text-outline">
            chevron_right
          </span>
          <span className="text-on-surface-variant">Events</span>
          <span className="material-symbols-outlined text-xs text-outline">
            chevron_right
          </span>
          <span className="text-primary underline underline-offset-4">
            Create New Event
          </span>
        </nav>

        <div className="flex flex-col gap-12">
          <header>
            <h1 className="mb-4 font-headline text-5xl font-bold tracking-tight">
              Create New Event
            </h1>
            <p className="text-lg text-on-surface-variant">
              Deploy your luxury experience directly to the Ethereal Ledger.
            </p>
          </header>

          <section className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Event Name
                </label>
                <input
                  className="rounded-md border-none bg-surface-container-highest px-5 py-4 text-lg focus:ring-1 focus:ring-primary/40"
                  placeholder="e.g. Neo-Tokyo Jazz Night"
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Category
                </label>
                <select className="appearance-none rounded-md border-none bg-surface-container-highest px-5 py-4 focus:ring-1 focus:ring-primary/40">
                  <option>Music</option>
                  <option>Art</option>
                  <option>Tech</option>
                  <option>Luxury</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Base Price (ETH)
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-md border-none bg-surface-container-highest px-5 py-4 focus:ring-1 focus:ring-primary/40"
                    placeholder="0.05"
                    step="0.01"
                    type="number"
                  />
                  <span className="absolute right-5 top-4 font-mono text-outline">
                    ETH
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Start Date &amp; Time
                </label>
                <input
                  className="rounded-md border-none bg-surface-container-highest px-5 py-4 focus:ring-1 focus:ring-primary/40"
                  type="datetime-local"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  End Date &amp; Time
                </label>
                <input
                  className="rounded-md border-none bg-surface-container-highest px-5 py-4 focus:ring-1 focus:ring-primary/40"
                  type="datetime-local"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Venue
                </label>
                <input
                  className="rounded-md border-none bg-surface-container-highest px-5 py-4 focus:ring-1 focus:ring-primary/40"
                  placeholder="Digital Arena or Physical Address"
                  type="text"
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Description
                </label>
                <textarea
                  className="resize-none rounded-md border-none bg-surface-container-highest px-5 py-4 focus:ring-1 focus:ring-primary/40"
                  placeholder="Describe the immersive experience..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">
                    event_seat
                  </span>
                  <div>
                    <h3 className="font-headline font-bold">Assigned Seating</h3>
                    <p className="text-sm text-on-surface-variant">
                      Enable for structured venue layouts
                    </p>
                  </div>
                </div>
                <button className="relative h-6 w-12 rounded-full bg-primary">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-on-primary"></div>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                    Total Rows
                  </label>
                  <input
                    className="rounded-md border-none bg-surface-container-highest px-5 py-3 focus:ring-1 focus:ring-primary/40"
                    placeholder="20"
                    type="number"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                    Seats per Row
                  </label>
                  <input
                    className="rounded-md border-none bg-surface-container-highest px-5 py-3 focus:ring-1 focus:ring-primary/40"
                    placeholder="15"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-8">
              <Button className="px-8 py-3" variant="outline">
                Save Draft
              </Button>
              <Button className="gap-2 px-12 py-3">
                <span className="material-symbols-outlined">rocket_launch</span>
                Deploy to Ledger
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default OrganizerDashboard;
