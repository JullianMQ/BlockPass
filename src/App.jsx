import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ChoosePath from "./pages/ChoosePath.jsx";
import Catalog from "./pages/Catalog.jsx";
import SeatMap from "./pages/SeatMap.jsx";
import Navbar from "./components/Navbar.jsx";
import Button from "./components/Button.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx";
import MarkUsed from "./pages/MarkUsed.jsx";
import PublicVerify from "./pages/PublicVerify.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import SupportPage from "./pages/Support.jsx";
import DocsPage from "./pages/Docs.jsx";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-background text-on-surface selection:bg-primary selection:text-on-primary">
            <Navbar />

            <main className="pt-24">
              <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden px-8 lg:px-24">
                <div className="absolute right-[-10%] top-[-20%] h-[800px] w-[800px] rounded-full bg-primary/10 blur-[120px] -z-10"></div>
                <div className="absolute bottom-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-secondary-container/20 blur-[100px] -z-10"></div>

                <div className="max-w-4xl">
                  <span className="mb-6 block font-label text-sm font-bold uppercase tracking-[0.2em] text-secondary">
                    The Ethereal Ledger Protocol
                  </span>
                  <h1 className="mb-8 font-headline text-6xl font-bold leading-[1.05] tracking-tighter md:text-8xl">
                    Ticketing is no longer{" "}
                    <span className="text-gradient">Data.</span> It's an{" "}
                    <span className="italic">Artifact.</span>
                  </h1>
                  <p className="mb-12 max-w-2xl font-body text-xl leading-relaxed text-on-surface-variant">
                    BlockPass Pro redefines event access through the Ethereal
                    Ledger—a high-fidelity blockchain architecture where
                    security meets luxury editorial design.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <Button className="px-10 py-4 text-lg">
                      Get Started
                    </Button>
                    <Button className="px-10 py-4 text-lg" variant="secondary">
                      View Marketplace
                    </Button>
                  </div>
                </div>

                <div className="absolute right-24 top-1/2 hidden w-[400px] -translate-y-1/2 xl:block">
                  <div className="rotate-3 overflow-hidden rounded-full bg-surface-container p-1 shadow-2xl transition-transform duration-700 hover:rotate-0">
                    <div className="flex flex-col gap-6 rounded-full bg-surface-container-highest p-8">
                      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary-container/30 to-background">
                        <span
                          className="material-symbols-outlined text-8xl text-primary"
                          style={{ fontVariationSettings: '"wght" 200' }}
                        >
                          token
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-headline text-2xl font-bold">
                          Genesis Pass #001
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                            Heritage Tier
                          </span>
                          <span className="font-headline text-lg text-primary">
                            2.44 ETH
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-outline-variant/20 pt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-on-secondary-container">
                            Owner
                          </span>
                          <span className="text-sm font-bold">0x882...AF12</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase text-on-secondary-container">
                            Verified
                          </span>
                          <span className="material-symbols-outlined text-sm text-primary">
                            verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="px-8 py-32 lg:px-24">
                <div className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row">
                  <div className="max-w-2xl">
                    <h2 className="mb-6 font-headline text-4xl font-bold md:text-5xl">
                      The Architecture of Certainty
                    </h2>
                    <p className="font-body text-lg text-on-surface-variant">
                      Our protocol eliminates the friction of secondary markets
                      while preserving the emotional value of the event
                      experience.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-label text-sm text-outline">
                      PROTOCOL_V2.0
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="group flex flex-col gap-8 rounded-xl bg-surface-container-low p-12 transition-colors hover:bg-surface-container">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest transition-colors group-hover:bg-primary/20">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        gavel
                      </span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-headline text-2xl font-bold">
                        Anti-Scalping
                      </h3>
                      <p className="font-body leading-relaxed text-on-surface-variant">
                        Programmable royalties and price ceilings embedded
                        directly into the ticket ledger. Fair access for true
                        fans, every single time.
                      </p>
                    </div>
                  </div>

                  <div className="group flex flex-col gap-8 rounded-xl bg-surface-container-low p-12 transition-colors hover:bg-surface-container">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest transition-colors group-hover:bg-primary/20">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        auto_awesome
                      </span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-headline text-2xl font-bold">
                        Ticket Verification
                      </h3>
                      <p className="font-body leading-relaxed text-on-surface-variant">
                        Instantly verify on-chain tickets with a public lookup
                        that confirms ownership, seat, and event details in
                        seconds.
                      </p>
                    </div>
                  </div>

                  <div className="group flex flex-col gap-8 rounded-xl bg-surface-container-low p-12 transition-colors hover:bg-surface-container">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest transition-colors group-hover:bg-primary/20">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        privacy_tip
                      </span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-headline text-2xl font-bold">
                        Zero-Knowledge Proofs
                      </h3>
                      <p className="font-body leading-relaxed text-on-surface-variant">
                        Verify your identity and ticket validity without ever
                        exposing your personal data. Professional-grade privacy
                        for the modern era.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="relative overflow-hidden bg-surface-container-lowest px-8 py-32 lg:px-24">
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
                </div>
                <div className="relative z-10 grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
                  <div className="order-2 lg:order-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4 pt-12">
                        <div className="rounded-xl bg-surface-container p-1">
                          <img
                            alt="Vibrant concert crowd with purple and blue stage lights"
                            className="aspect-[4/5] w-full rounded-xl object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfYrR83-Ya_vhNP9MGfybaUgLLSDHQRkxF-K0A-5Mdbi4ibnUQJA4fKK7UNm3wT4nHYWL1RWP1tAUga83p8Szlm2D3qHTFQwav6jvLoswma0gxg-6PEFVrmQwFXg6zELeYuIFvpp6HIc8z9LItv9NQNguioxq44IIevcfsL--f9JUY8t8I_eOpPqLW8i3meOD-yc0MA5gUrN2vVpA4Z1pnlgjONUyQMMyLl1vWzntz93D43ipOUkh6oj0H0fXF-l6C5BXp8u2eZL0_"
                          />
                        </div>
                        <div className="rounded-xl bg-surface-container p-1">
                          <div className="flex h-40 items-center justify-center rounded-xl signature-gradient">
                            <span className="material-symbols-outlined text-6xl text-on-primary">
                              qr_code_2
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-xl bg-surface-container p-1">
                          <div className="flex h-64 flex-col justify-between rounded-xl bg-surface-container-highest p-6">
                            <span className="font-label text-[10px] uppercase tracking-[0.3em] opacity-50">
                              Secure Node
                            </span>
                            <div className="flex flex-col gap-1">
                              <div className="h-1 w-full overflow-hidden rounded-full bg-primary/20">
                                <div className="h-full w-2/3 bg-primary"></div>
                              </div>
                              <span className="font-mono text-[10px] text-primary">
                                ENCRYPTING... 88%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl bg-surface-container p-1">
                          <img
                            alt="High tech server room with blue neon indicators"
                            className="aspect-square w-full rounded-xl object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYp-ZAz79NRr32OjB4abbNXGZUStnzbbyeIhrUDft489Y2WWjhylZx__Oe6OYiWEFLMiyxNgQk71VFPc3-iyJfznF8js-54mrxQOwGxuvIOcX8-dTTCgBr2OePv0Mn-vSOojrMLdgGr50J0advqm4XG2numY7xdmPGVwBB-cv400D6z_w1gZpSguASBDehpvyPV0NNdMSkddV57At9UzHciaL7Q9-zrDlQQCu9qBPOZv5G0mOEpNdP-x-Xbnr0gy1eXdUG-Qrlqbb-"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <span className="mb-4 block font-label text-sm font-bold uppercase tracking-widest text-primary">
                      The Vision
                    </span>
                    <h2 className="mb-8 font-headline text-5xl font-bold leading-tight md:text-6xl">
                      The Future of <br />Secure Ticketing
                    </h2>
                    <div className="space-y-8">
                      <div className="flex gap-6">
                        <span className="font-headline text-4xl font-light text-primary/30">
                          01
                        </span>
                        <div>
                          <h4 className="mb-2 font-headline text-xl font-bold">
                            Immutable Provenance
                          </h4>
                          <p className="font-body text-on-surface-variant">
                            Trace every hand a ticket has passed through. A
                            crystal-clear history from the organizer to the
                            front row.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <span className="font-headline text-4xl font-light text-primary/30">
                          02
                        </span>
                        <div>
                          <h4 className="mb-2 font-headline text-xl font-bold">
                            Dynamic Utility
                          </h4>
                          <p className="font-body text-on-surface-variant">
                            Tickets that change state. VIP access unlocks in
                            real-time as you approach the venue gates.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <span className="font-headline text-4xl font-light text-primary/30">
                          03
                        </span>
                        <div>
                          <h4 className="mb-2 font-headline text-xl font-bold">
                            Universal Liquidity
                          </h4>
                          <p className="font-body text-on-surface-variant">
                            Trade, fractionalize, or collateralize high-value
                            season passes across any EVM-compatible chain.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="relative px-8 py-40 text-center">
                <div className="mx-auto max-w-3xl">
                  <h2 className="mb-8 font-headline text-5xl font-bold md:text-7xl">
                    Ready to step into the ledger?
                  </h2>
                  <p className="mb-12 font-body text-xl text-on-surface-variant">
                    Join 10,000+ organizers already using BlockPass to secure
                    their event ecosystem.
                  </p>
                  <button className="signature-gradient rounded-full px-16 py-6 font-label text-xl font-bold text-on-primary transition-transform hover:scale-105">
                    Get Started
                  </button>
                </div>
              </section>
            </main>

            <footer className="border-t border-outline-variant/10 bg-surface-container-lowest px-8 py-20 lg:px-24">
              <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full signature-gradient"></div>
                    <span className="font-headline text-xl font-bold">
                      BlockPass
                    </span>
                  </div>
                  <p className="mb-8 text-sm leading-relaxed text-on-surface-variant">
                    The premium protocol for blockchain-native ticketing and
                    event heritage management. Built for the Ethereal Ledger.
                  </p>
                  <div className="flex gap-4">
                    <a
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-primary/20"
                      href="#"
                    >
                      <span className="material-symbols-outlined text-sm">
                        public
                      </span>
                    </a>
                    <a
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-primary/20"
                      href="#"
                    >
                      <span className="material-symbols-outlined text-sm">
                        share
                      </span>
                    </a>
                  </div>
                </div>
                <div>
                  <h5 className="mb-6 font-headline font-bold">Navigation</h5>
                  <ul className="space-y-4 text-sm text-on-surface-variant">
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        Events
                      </a>
                    </li>
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        Marketplace
                      </a>
                    </li>
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        Developer API
                      </a>
                    </li>
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        Network Status
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="mb-6 font-headline font-bold">Legal</h5>
                  <ul className="space-y-4 text-sm text-on-surface-variant">
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a className="transition-colors hover:text-primary" href="#">
                        Support
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="mb-6 font-headline font-bold">Stay Updated</h5>
                  <div className="flex flex-col gap-4">
                    <div className="flex rounded-full bg-surface-container p-1">
                      <input
                        className="flex-grow border-none bg-transparent px-4 text-sm focus:ring-0"
                        placeholder="Your email"
                        type="email"
                      />
                      <button className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-on-primary">
                        JOIN
                      </button>
                    </div>
                    <p className="px-4 text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Join our monthly ledger digest
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-between gap-6 border-t border-outline-variant/10 pt-12 md:flex-row">
                <span className="font-label text-xs text-on-surface-variant">
                  © 2026 BlockPass Protocol. All rights reserved.
                </span>
                <div className="flex gap-8">
                  <span className="flex items-center gap-2 font-mono text-[10px] text-primary">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
                    SYSTEM_STABLE_001
                  </span>
                  <span className="font-mono text-[10px] text-on-surface-variant">
                    LATENCY: 12MS
                  </span>
                </div>
              </div>
            </footer>
          </div>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/choose-path" element={<ChoosePath />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/seat-map/:eventId" element={<SeatMap />} />
      <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
      <Route path="/mark-used" element={<MarkUsed />} />
      <Route path="/verify" element={<PublicVerify />} />
      <Route path="/my-tickets" element={<MyTickets />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/docs" element={<DocsPage />} />
    </Routes>
  );
}

export default App;
