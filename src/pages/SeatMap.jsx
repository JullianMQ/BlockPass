import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";

const CONTRACT_ADDRESS = "0x4eBCe290d6A89a5E1A25f6b603f0Ee73F90b23f7";
const SEPOLIA_CHAIN_ID = 11155111;
const ABI = [
  "function getEvents() view returns (tuple(uint256 id,string name,string location,uint256 startDate,uint256 endDate,uint256 totalSeats,uint256 ticketPrice,uint256 ticketsSold,bool active)[])",
];
const ROWS = ["A", "B", "C", "D", "E"];
const COLS = 8;
const TAKEN_SEATS = new Set([3, 14, 16, 26, 27]);
const PRICE_ETH = 0.14;
const SERVICE_FEE = 0.002;
const GAS_ESTIMATE = 0.0008;
const MAX_TICKETS_PER_WALLET = 2;

function SeatMap() {
  const { eventId } = useParams();
  const location = useLocation();
  const { walletAddress } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [purchasedCount, setPurchasedCount] = useState(() => {
    if (!walletAddress) return 0;
    const stored = localStorage.getItem(`bp_tickets_${walletAddress}`);
    return stored ? Number(stored) : 0;
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [eventDetails, setEventDetails] = useState(null);
  const [eventError, setEventError] = useState("");
  const [eventLoading, setEventLoading] = useState(false);

  const normalizeEventDetails = (details) => {
    if (!details) return null;
    if (!details.endDate && details.date) {
      return { ...details, startDate: details.date, endDate: details.date };
    }
    return details;
  };

  useEffect(() => {
    const normalizedId = Number(eventId);
    if (!eventId || Number.isNaN(normalizedId)) {
      setEventError("Missing event details.");
      return;
    }

    const fromState = location.state?.event;
    if (fromState) {
      setEventDetails(normalizeEventDetails(fromState));
      return;
    }

    const cached = sessionStorage.getItem("bp_events");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const cachedEvent = parsed.find((item) => Number(item.id) === normalizedId);
        if (cachedEvent) {
          setEventDetails(normalizeEventDetails(cachedEvent));
          return;
        }
      } catch (error) {
        console.error("Failed to read cached events", error);
      }
    }

    const loadEvent = async () => {
      if (!window.ethereum) {
        setEventError("MetaMask not detected.");
        return;
      }
      try {
        setEventLoading(true);
        setEventError("");
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const network = await provider.getNetwork();
        if (network.chainId !== SEPOLIA_CHAIN_ID) {
          setEventError("Switch MetaMask to Sepolia to load event details.");
          return;
        }
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (!code || code === "0x") {
          setEventError("Contract not found on Sepolia.");
          return;
        }
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const events = await contract.getEvents();
        const event = events.find((item) => item.id.toNumber() === normalizedId);
        if (!event) {
          setEventError("Event not found on-chain.");
          return;
        }
        const start = new Date(Number(event.startDate) * 1000);
        const end = new Date(Number(event.endDate) * 1000);
        setEventDetails({
          name: event.name,
          location: event.location,
          startDate: start.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          endDate: end.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          ticketPrice: Number(ethers.utils.formatEther(event.ticketPrice)),
          totalSeats: event.totalSeats.toNumber(),
        });
      } catch (error) {
        console.error("Failed to load event", error);
        setEventError("Failed to load event details.");
      } finally {
        setEventLoading(false);
      }
    };

    loadEvent();
  }, [eventId, location.state]);

  const seats = useMemo(() => {
    const items = [];
    let seatNumber = 1;
    for (const row of ROWS) {
      for (let col = 1; col <= COLS; col += 1) {
        items.push({
          id: seatNumber,
          label: `${row}${col}`,
          isTaken: TAKEN_SEATS.has(seatNumber),
        });
        seatNumber += 1;
      }
    }
    return items;
  }, []);

  const remainingTickets = Math.max(
    0,
    MAX_TICKETS_PER_WALLET - purchasedCount
  );

  const ticketPrice =
    eventDetails?.ticketPrice ?? eventDetails?.priceEth ?? PRICE_ETH;
  const totalPrice = ticketPrice + SERVICE_FEE + GAS_ESTIMATE;

  const handleSelect = (seat) => {
    if (seat.isTaken) {
      return;
    }
    setSelectedSeat(seat);
    setStatusMessage("");
  };

  const handleBuy = () => {
    if (!walletAddress) {
      setStatusMessage("Connect your wallet to buy tickets.");
      return;
    }
    if (!selectedSeat) {
      setStatusMessage("Select a seat before buying.");
      return;
    }
    if (remainingTickets <= 0) {
      setStatusMessage("Ticket limit reached for this wallet.");
      return;
    }

    const nextCount = purchasedCount + 1;
    setPurchasedCount(nextCount);
    localStorage.setItem(`bp_tickets_${walletAddress}`, String(nextCount));
    setStatusMessage("Ticket reserved. Awaiting on-chain confirmation.");
    setSelectedSeat(null);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar showFloatingNav networkLabel="Sepolia Testnet" showSearch={false} />

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-8 pb-12 pt-28 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <header>
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-secondary-container">
                Live on Ledger
              </span>
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <span className="material-symbols-outlined text-sm">
                  verified_user
                </span>
                Blockchain Identity Verified
              </div>
            </div>
            <h1 className="mb-4 font-headline text-5xl font-bold tracking-tighter text-on-surface">
              {eventDetails?.name || "Loading Event"}
            </h1>
            <div className="flex flex-wrap gap-6 text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim">
                  calendar_today
                </span>
                <span className="text-body-md">
                  {eventDetails
                    ? `${eventDetails.startDate} - ${eventDetails.endDate}`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim">
                  location_on
                </span>
                <span className="text-body-md">
                  {eventDetails?.location || "—"}
                </span>
              </div>
            </div>
            {eventLoading ? (
              <p className="mt-4 text-sm text-on-surface-variant">
                Loading event details...
              </p>
            ) : null}
            {eventError ? (
              <p className="mt-4 text-sm text-error">{eventError}</p>
            ) : null}
          </header>

          <section className="relative overflow-hidden rounded-xl bg-surface-container-low p-10">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <div className="mb-12 text-center">
              <div className="mb-4 inline-block h-2 w-64 rounded-full bg-surface-container-highest shadow-[0_0_20px_rgba(192,193,255,0.1)]"></div>
              <p className="text-label-md uppercase tracking-[0.2em] text-outline">
                Stage Front
              </p>
            </div>
            <div className="mb-10 flex justify-center">
              <div className="grid grid-cols-8 gap-3">
                {seats.map((seat) => {
                  const isSelected = selectedSeat?.id === seat.id;
                  const baseClasses =
                    "flex h-10 w-10 items-center justify-center rounded-lg text-[10px]";
                  if (seat.isTaken) {
                    return (
                      <button
                        key={seat.id}
                        className={`${baseClasses} cursor-not-allowed text-on-surface/20`}
                        style={{ backgroundColor: "#A83939" }}
                        type="button"
                      >
                        {seat.label}
                      </button>
                    );
                  }
                  if (isSelected) {
                    return (
                      <button
                        key={seat.id}
                        className={`${baseClasses} font-bold text-on-primary shadow-[0_0_15px_rgba(70,73,255,0.4)]`}
                        style={{ backgroundColor: "#4649FF" }}
                        onClick={() => handleSelect(seat)}
                        type="button"
                      >
                        {seat.label}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={seat.id}
                      className={`${baseClasses} bg-surface-container-highest text-outline hover:ring-2 hover:ring-primary`}
                      onClick={() => handleSelect(seat)}
                      type="button"
                    >
                      {seat.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center gap-8 border-t border-outline-variant/20 pt-8">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-sm bg-surface-container-highest"></div>
                <span className="text-label-md text-on-surface-variant">
                  Available
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-sm"
                  style={{ backgroundColor: "#A83939" }}
                ></div>
                <span className="text-label-md text-on-surface-variant">
                  Taken
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-sm"
                  style={{ backgroundColor: "#4649FF" }}
                ></div>
                <span className="text-label-md text-on-surface">
                  Selected
                </span>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="sticky top-28 rounded-xl bg-surface-container p-8 shadow-2xl">
            <h3 className="mb-6 font-headline text-xl font-bold text-on-surface">
              Ticket Summary
            </h3>
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-surface-container-highest p-4">
                <div>
                  <p className="text-label-md text-outline">Selected Seat</p>
                  <p className="text-body-lg font-bold text-on-surface">
                    {selectedSeat ? selectedSeat.label : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-label-md text-outline">Base Price</p>
                  <p className="text-body-lg font-bold text-primary">
                    {ticketPrice.toFixed(2)} ETH
                  </p>
                </div>
              </div>
              <div className="space-y-3 px-2">
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Service Fee</span>
                  <span>{SERVICE_FEE.toFixed(3)} ETH</span>
                </div>
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Gas Estimate</span>
                  <span>{GAS_ESTIMATE.toFixed(4)} ETH</span>
                </div>
                <div className="my-4 h-[1px] bg-outline-variant/20"></div>
                <div className="flex justify-between font-bold text-on-surface">
                  <span>Total</span>
                  <span className="text-primary">
                    {totalPrice.toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-lg border border-primary/20 bg-surface-container-low p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-sm mb-1 font-bold uppercase tracking-wider text-on-surface">
                    Mint Limit
                  </p>
                  <p className="text-body-xs text-on-surface-variant">
                    {remainingTickets} of {MAX_TICKETS_PER_WALLET} tickets
                    remaining for this wallet.
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary">
                  verified
                </span>
              </div>
            </div>

            <Button
              className="w-full gap-3 py-4 text-lg shadow-[0_8px_30px_rgba(128,131,255,0.3)] hover:shadow-[0_12px_40px_rgba(128,131,255,0.4)]"
              disabled={!selectedSeat || remainingTickets <= 0}
              onClick={handleBuy}
            >
              Buy Ticket
              <span className="material-symbols-outlined">double_arrow</span>
            </Button>
            <p className="mt-4 text-center text-[10px] leading-relaxed text-outline">
              Tickets are non-transferable and cannot be resold.
            </p>
            {statusMessage ? (
              <p className="mt-4 text-center text-xs text-on-surface-variant">
                {statusMessage}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 px-4">
            <div className="flex items-center gap-3 text-on-surface-variant/60">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-body-xs">Secure Ledger Protocol v2.4</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant/60">
              <span className="material-symbols-outlined text-sm">database</span>
              <span className="text-body-xs">Immutable Metadata Storage</span>
            </div>
          </div>
        </aside>
      </main>

      <section className="border-t border-outline-variant/10 px-8 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-headline text-4xl font-bold tracking-tight text-on-surface">
            Stay in the loop
          </h2>
          <p className="mb-10 text-body-lg text-on-surface-variant">
            Subscribe to our newsletter for the latest NFT drops and event
            updates.
          </p>
          <div className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row">
            <input
              className="flex-grow rounded-xl border-none bg-surface-container-highest px-6 py-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40"
              placeholder="Email address"
              type="email"
            />
            <Button className="px-10 py-4" variant="primary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-lowest px-8 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg signature-gradient"></div>
            <span className="font-headline font-bold text-on-surface">
              BlockPass
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <span className="text-label-md text-on-surface-variant">
              Terms of Service
            </span>
            <span className="text-label-md text-on-surface-variant">
              Privacy Policy
            </span>
            <span className="text-label-md text-on-surface-variant">
              Help Center
            </span>
            <span className="text-label-md text-on-surface-variant">
              Contact Us
            </span>
          </div>
          <span className="text-label-md text-outline">
            © 2024 BlockPass. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default SeatMap;
