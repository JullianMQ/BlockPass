import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";

function ChoosePath() {
  const { walletAddress } = useAuth();
  const navigate = useNavigate();
  const shortenedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "0x...4f2a";

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar showFloatingNav />

      <main className="relative flex flex-grow flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28">
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-primary opacity-5 blur-[120px]"></div>
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-secondary-container opacity-10 blur-[100px]"></div>

        <div className="relative z-10 mb-16 w-full max-w-4xl text-center">
          <p className="mb-4 font-label text-xs font-bold tracking-widest text-primary">
            THE ETHEREAL LEDGER
          </p>
          <h2 className="mb-6 font-headline text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Secure your digital <br />
            <span className="text-glow">identity &amp; assets.</span>
          </h2>
          <p className="mx-auto max-w-2xl font-body text-lg text-on-surface-variant">
            Welcome to the future of event management and digital ticketing on
            the blockchain. Select your journey to begin.
          </p>
        </div>

        <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-low p-10 transition-all duration-500 hover:border-primary/30">
            <div className="absolute right-0 top-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-9xl">
                dashboard
              </span>
            </div>
            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl signature-gradient shadow-lg shadow-primary/20">
              <span
                className="material-symbols-outlined text-3xl text-on-primary"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                add_circle
              </span>
            </div>
            <h3 className="mb-4 font-headline text-3xl font-semibold text-on-surface">
              Organize an Event
            </h3>
            <p className="mb-10 font-body text-lg leading-relaxed text-on-surface-variant">
              Host seamless events with smart-contract tickets. Manage sales,
              verify attendees, and control secondary market royalties
              effortlessly.
            </p>
            <div className="mt-auto">
              <Button className="h-14 w-full gap-2" variant="primary">
                <span>Get Started</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Button>
            </div>
          </div>

          <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-low p-10 transition-all duration-500 hover:border-primary/30">
            <div className="absolute right-0 top-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-9xl">
                confirmation_number
              </span>
            </div>
            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-highest">
              <span
                className="material-symbols-outlined text-3xl text-primary"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                local_activity
              </span>
            </div>
            <h3 className="mb-4 font-headline text-3xl font-semibold text-on-surface">
              Buy an Event Ticket
            </h3>
            <p className="mb-10 font-body text-lg leading-relaxed text-on-surface-variant">
              Discover exclusive events. Buy, trade, and store your tickets as
              unique digital collectibles in your secure personal vault.
            </p>
            <div className="mt-auto">
              <Button
                className="h-14 w-full gap-2"
                onClick={() => navigate("/catalog")}
                variant="outline"
              >
                <span>Browse Catalog</span>
                <span className="material-symbols-outlined">search</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-center gap-8 font-label text-xs uppercase tracking-widest text-on-surface-variant/40">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
            Mainnet Active
          </div>
          <div className="h-4 w-px bg-outline-variant/20"></div>
          <div>Decentralized Ledger v2.4</div>
          <div className="h-4 w-px bg-outline-variant/20"></div>
          <div>Fully Verified Contracts</div>
        </div>
      </main>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-1 w-1 rounded-full bg-primary/20"></div>
        <div className="absolute right-1/3 top-3/4 h-2 w-2 rounded-full bg-secondary/10"></div>
        <div className="absolute left-2/3 top-1/2 h-1.5 w-1.5 rounded-full bg-primary/10"></div>
      </div>
    </div>
  );
}

export default ChoosePath;
