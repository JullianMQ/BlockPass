import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Navbar from "../components/Navbar.jsx";
import EventCard from "../components/EventCard.jsx";

const CONTRACT_ADDRESS = "0xEbD7325C20a9257be621b24f50b5BF59dBB579ad";
const SEPOLIA_CHAIN_ID = 11155111;
const ABI = [
  "function verifyTicket(uint256 tokenId) view returns (address ownerAddr,uint256 eventId,uint256 day,uint256 seatNumber,bool used)",
  "function events(uint256 eventId) view returns (uint256 id,address organizer,string name,string location,uint256 startDate,uint256 endDate,uint256 totalSeats,uint256 ticketPrice,uint256 ticketsSold,uint256 revenue,bool active)",
  "function getEvents() view returns (tuple(uint256 id,address organizer,string name,string location,uint256 startDate,uint256 endDate,uint256 totalSeats,uint256 ticketPrice,uint256 ticketsSold,uint256 revenue,bool active)[])",
];

function PublicVerify() {
  const navigate = useNavigate();
  const [tokenId, setTokenId] = useState("");
  const [ticketDetails, setTicketDetails] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const normalizedTokenId = useMemo(() => {
    if (!tokenId) return null;
    const parsed = Number(tokenId);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [tokenId]);

  const handleVerify = async () => {
    if (!normalizedTokenId) {
      setErrorMessage("Enter a valid token ID.");
      setTicketDetails(null);
      return;
    }
    if (!window.ethereum) {
      setErrorMessage("MetaMask not detected.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setStatusMessage("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setErrorMessage("Switch MetaMask to Sepolia to verify tickets.");
        return;
      }
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (!code || code === "0x") {
        setErrorMessage("Contract not found on Sepolia.");
        return;
      }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const ticket = await contract.verifyTicket(normalizedTokenId);
      const eventDetails = await contract.events(ticket.eventId);
      const start = new Date(Number(eventDetails.startDate) * 1000);
      const ticketDate = new Date(start);
      ticketDate.setDate(ticketDate.getDate() + Number(ticket.day) - 1);

      setTicketDetails({
        tokenId: normalizedTokenId,
        eventName: eventDetails.name,
        location: eventDetails.location,
        owner: ticket.ownerAddr,
        seatNumber: Number(ticket.seatNumber),
        day: Number(ticket.day),
        used: Boolean(ticket.used),
        verifiedAt: new Date(),
        dateLabel: ticketDate.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      });
      setStatusMessage("Ticket verified on-chain.");
    } catch (error) {
      console.error("Verification failed", error);
      setErrorMessage("Unable to verify ticket. Check the token ID.");
      setTicketDetails(null);
    } finally {
      setIsLoading(false);
    }
  };


  const loadEvents = useCallback(async () => {
    if (!window.ethereum) {
      setEventsError("MetaMask not detected.");
      setEvents([]);
      return;
    }
    try {
      setEventsLoading(true);
      setEventsError("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setEventsError("Switch MetaMask to Sepolia to load events.");
        setEvents([]);
        return;
      }
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (!code || code === "0x") {
        setEventsError("Contract not found on Sepolia.");
        setEvents([]);
        return;
      }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const onChainEvents = await contract.getEvents();
      const mapped = onChainEvents.map((event) => {
        const priceEth = Number(ethers.utils.formatEther(event.ticketPrice));
        const start = new Date(Number(event.startDate) * 1000);
        const end = new Date(Number(event.endDate) * 1000);
        const startDateLabel = start.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        const endDateLabel = end.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        return {
          id: String(event.id),
          name: event.name,
          location: event.location,
          date: startDateLabel,
          startDate: startDateLabel,
          endDate: endDateLabel,
          priceEth,
          ticketPrice: priceEth,
          totalSeats: event.totalSeats.toNumber(),
          availability:
            event.active &&
            event.ticketsSold.toNumber() < event.totalSeats.toNumber()
              ? "available"
              : "limited",
          creatorWallet: event.organizer,
          startDateTs: Number(event.startDate),
          endDateTs: Number(event.endDate),
        };
      });
      setEvents(mapped);
    } catch (error) {
      console.error("Failed to load events", error);
      setEventsError("Unable to load events.");
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar showSearch={false} />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-32">
        <section className="mb-16 w-full text-center">
          <h1 className="font-headline text-5xl font-light tracking-tighter md:text-7xl">
            Public <span className="italic text-primary">Verify</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant opacity-80">
            Enter the digital asset signature or the token credentials to
            authenticate the ledger entry. Immutable. Trustless. Instant.
          </p>
        </section>

        <div className="grid w-full grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <div className="glass-card rounded-xl border border-outline-variant/20 p-8 shadow-xl shadow-primary/5">
              <h2 className="mb-8 font-headline text-2xl font-medium">
                Verify Entry
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-label uppercase tracking-widest text-on-secondary-container">
                    Token ID
                  </label>
                  <input
                    className="w-full rounded-md border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/40"
                    placeholder="e.g. 8821"
                    type="number"
                    value={tokenId}
                    onChange={(event) => setTokenId(event.target.value)}
                  />
                </div>
                <button
                  className="signature-gradient mt-4 h-14 w-full rounded-full text-lg font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-[0.98]"
                  onClick={handleVerify}
                  type="button"
                >
                  {isLoading ? "Verifying..." : "Verify Ticket"}
                </button>
              </div>
            </div>
            {statusMessage ? (
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                {statusMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
                {errorMessage}
              </div>
            ) : null}
            <div className="flex items-start gap-4 p-4 text-sm italic text-on-surface-variant/60">
              <span className="material-symbols-outlined scale-75">
                verified_user
              </span>
              <p>
                Verification is performed directly against the Sepolia smart
                contract. No login required for public lookup.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <div className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container shadow-[0_40px_60px_-5px_rgba(218,226,253,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_80px_-30px_rgba(192,193,255,0.35)] md:flex-row">
                <div className="flex flex-1 flex-col justify-between p-10">
                  <div>
                    {ticketDetails ? (
                      <div className="mb-8 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                            Valid
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-primary-container"></span>
                          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary-container">
                            {ticketDetails.used ? "Used" : "Unused"}
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <h3 className="mb-2 font-headline text-4xl font-bold">
                      {ticketDetails?.eventName || "—"}
                    </h3>
                    <p className="mb-10 text-sm font-label uppercase tracking-widest text-primary-fixed-dim">
                      {ticketDetails?.location || "—"}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-widest text-outline">
                          Owner Address
                        </p>
                        <p className="max-w-[150px] truncate font-body font-semibold">
                          {ticketDetails?.owner
                            ? `${ticketDetails.owner.slice(0, 6)}...${ticketDetails.owner.slice(-4)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-widest text-outline">
                          Seat Assignment
                        </p>
                        <p className="font-body font-semibold">
                          {ticketDetails
                            ? `Seat ${ticketDetails.seatNumber} • Day ${ticketDetails.day}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-widest text-outline">
                          Gate / Entry
                        </p>
                        <p className="font-body font-semibold">
                          {ticketDetails?.dateLabel || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-widest text-outline">
                          Blockchain Hash
                        </p>
                        <p className="truncate font-body text-xs text-on-surface-variant">
                          {ticketDetails?.tokenId
                            ? `Token #${ticketDetails.tokenId}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex items-center justify-between border-t border-outline-variant/10 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
                        <span
                          className="material-symbols-outlined text-primary"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          verified
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-outline">
                          Verification Date
                        </p>
                        <p className="text-xs font-semibold">
                          {ticketDetails?.verifiedAt
                            ? `${ticketDetails.verifiedAt.toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })} • ${ticketDetails.verifiedAt.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZoneName: "short",
                              })}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant">
                      share
                    </span>
                  </div>
                </div>
                <div className="relative flex flex-col items-center justify-center border-dashed border-outline-variant/30 bg-surface-container-highest/50 p-8 md:w-32 md:border-l md:border-t-0 md:p-8">
                  <div className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full border border-outline-variant/10 bg-background md:block"></div>
                  <div className="origin-center whitespace-nowrap md:rotate-90">
                    <span className="font-headline text-lg font-bold tracking-[0.4em] opacity-20">
                      BKPASS-V99210-918
                    </span>
                  </div>
                  <div className="mt-8 h-16 w-16 rounded-lg bg-on-surface/20 md:mt-24"></div>
                </div>
              </div>
              <div className="absolute -right-12 -top-12 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-[80px]"></div>
            </div>
          </div>
        </div>

        <section className="mt-32 w-full">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                You might like
              </p>
              <h2 className="font-headline text-4xl font-light">
                Other Events
              </h2>
            </div>
            <button
              className="border-b border-primary/40 pb-1 text-sm font-label uppercase tracking-widest text-on-surface transition-colors hover:text-primary"
              onClick={() => navigate("/catalog")}
              type="button"
            >
              View Catalog
            </button>
          </div>
          {eventsLoading ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
              Loading events...
            </div>
          ) : null}
          {eventsError ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
              {eventsError}
            </div>
          ) : null}
          {events.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={() => navigate(`/seat-map/${event.id}`, { state: { event } })}
                />
              ))}
            </div>
          ) : null}
          {!eventsLoading && !eventsError && !events.length ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-6 py-6 text-sm text-on-surface-variant">
              No events available yet.
            </div>
          ) : null}
        </section>
      </main>

      <div className="pointer-events-none fixed left-0 top-0 -z-50 h-screen w-full opacity-40">
        <div className="absolute right-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-secondary-container/10 blur-[100px]"></div>
      </div>
    </div>
  );
}

export default PublicVerify;
