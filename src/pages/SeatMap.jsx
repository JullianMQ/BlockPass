import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";

const CONTRACT_ADDRESS = "0xEbD7325C20a9257be621b24f50b5BF59dBB579ad";
const SEPOLIA_CHAIN_ID = 11155111;
const ABI = [
  "function seatTaken(uint256 eventId,uint256 day,uint256 seat) view returns (bool)",
  "function buyTicket(uint256 eventId,uint256 day,uint256[] seatNumbers) payable",
  "function ticketsBoughtPerDay(uint256 eventId,uint256 day,address buyer) view returns (uint256)",
];
const DEFAULT_ROWS = 5;
const COLS = 8;
const PRICE_ETH = 0.14;
const MAX_TICKETS_PER_WALLET = 2;

function SeatMap() {
  const { eventId } = useParams();
  const location = useLocation();
  const { walletAddress } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [purchasedCount, setPurchasedCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [seatLoadError, setSeatLoadError] = useState("");
  const [seatLoading, setSeatLoading] = useState(false);
  const [takenSeats, setTakenSeats] = useState(new Set());
  const [buyLoading, setBuyLoading] = useState(false);
  const [seatRefreshKey, setSeatRefreshKey] = useState(0);
  const [purchasedCountOnChain, setPurchasedCountOnChain] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [eventDetails, setEventDetails] = useState(null);
  const [eventError, setEventError] = useState("");

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

    setEventError("Event details unavailable. Return to the catalog.");
  }, [eventId, location.state]);

  useEffect(() => {
    setSelectedDay(1);
  }, [eventId]);

  const seatCount = useMemo(() => {
    if (!eventDetails?.totalSeats) return DEFAULT_ROWS * COLS;
    return Math.max(1, Number(eventDetails.totalSeats));
  }, [eventDetails]);

  const dayCount = useMemo(() => {
    const startTs = eventDetails?.startDateTs;
    const endTs = eventDetails?.endDateTs;
    if (startTs && endTs) {
      const diff = Math.floor((endTs - startTs) / (24 * 60 * 60));
      return Math.max(1, diff + 1);
    }
    if (eventDetails?.startDate && eventDetails?.endDate) {
      const start = new Date(eventDetails.startDate);
      const end = new Date(eventDetails.endDate);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const diff = Math.floor(
          (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
        );
        return Math.max(1, diff + 1);
      }
    }
    return 1;
  }, [eventDetails]);

  const dayIndex = selectedDay;

  useEffect(() => {
    if (!walletAddress || !eventId) {
      setPurchasedCount(0);
      return;
    }
    const stored = localStorage.getItem(
      `bp_tickets_${walletAddress}_${eventId}_${dayIndex}`
    );
    setPurchasedCount(stored ? Number(stored) : 0);
  }, [dayIndex, eventId, walletAddress]);

  const seats = useMemo(() => {
    const items = [];
    const rowCount = Math.ceil(seatCount / COLS);
    let seatNumber = 1;
    const getRowLabel = (index) => {
      let label = "";
      let value = index;
      while (value >= 0) {
        label = String.fromCharCode(65 + (value % 26)) + label;
        value = Math.floor(value / 26) - 1;
      }
      return label;
    };
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const rowLabel = getRowLabel(rowIndex);
      for (let col = 1; col <= COLS; col += 1) {
        if (seatNumber > seatCount) break;
        items.push({
          id: seatNumber,
          label: `${rowLabel}${col}`,
          isTaken: takenSeats.has(seatNumber),
        });
        seatNumber += 1;
      }
    }
    return items;
  }, [seatCount, takenSeats]);

  useEffect(() => {
    const loadSeats = async () => {
      if (!eventId || !eventDetails?.totalSeats) return;
      if (!window.ethereum) {
        setSeatLoadError("MetaMask not detected.");
        return;
      }
      try {
        setSeatLoading(true);
        setSeatLoadError("");
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const network = await provider.getNetwork();
        if (network.chainId !== SEPOLIA_CHAIN_ID) {
          setSeatLoadError("Switch MetaMask to Sepolia to load seats.");
          return;
        }
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (!code || code === "0x") {
          setSeatLoadError("Contract not found on Sepolia.");
          return;
        }
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const normalizedId = Number(eventId);
        const totalSeats = Number(eventDetails.totalSeats);
        const seatStatuses = [];
        const batchSize = 40;
        for (let start = 0; start < totalSeats; start += batchSize) {
          const end = Math.min(start + batchSize, totalSeats);
          const chunk = await Promise.all(
            Array.from({ length: end - start }, (_, index) =>
              contract.seatTaken(normalizedId, dayIndex, start + index + 1)
            )
          );
          seatStatuses.push(...chunk);
        }
        setTakenSeats(
          new Set(
            seatStatuses
              .map((isTaken, index) => (isTaken ? index + 1 : null))
              .filter(Boolean)
          )
        );
      } catch (error) {
        console.error("Failed to load seats", error);
        setSeatLoadError("Failed to load seat availability.");
      } finally {
        setSeatLoading(false);
      }
    };

    loadSeats();
  }, [dayIndex, eventDetails, eventId, seatRefreshKey]);

  useEffect(() => {
    const loadPurchasedCount = async () => {
      if (!eventId || !walletAddress) {
        setPurchasedCountOnChain(null);
        return;
      }
      if (!window.ethereum) return;
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const network = await provider.getNetwork();
        if (network.chainId !== SEPOLIA_CHAIN_ID) return;
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (!code || code === "0x") return;
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const count = await contract.ticketsBoughtPerDay(
          eventId,
          dayIndex,
          walletAddress
        );
        setPurchasedCountOnChain(Number(count));
      } catch (error) {
        console.error("Failed to load purchased count", error);
      }
    };

    loadPurchasedCount();
  }, [dayIndex, eventId, walletAddress, seatRefreshKey]);

  const effectivePurchasedCount =
    purchasedCountOnChain ?? purchasedCount;
  const remainingTickets = Math.max(
    0,
    MAX_TICKETS_PER_WALLET - effectivePurchasedCount
  );

  const ticketPrice =
    eventDetails?.ticketPrice ?? eventDetails?.priceEth ?? PRICE_ETH;
  const totalPrice = ticketPrice;

  const handleSelect = (seat) => {
    if (seat.isTaken) {
      return;
    }
    setSelectedSeat(seat);
    setStatusMessage("");
  };

  const handleBuy = async () => {
    if (!walletAddress) {
      setStatusMessage("Connect your wallet to buy tickets.");
      return;
    }
    if (!selectedSeat) {
      setStatusMessage("Select a seat before buying.");
      return;
    }
    if (remainingTickets <= 0) {
      setStatusMessage("Ticket limit reached for this day.");
      return;
    }
    if (!window.ethereum) {
      setStatusMessage("MetaMask not detected.");
      return;
    }

    try {
      setBuyLoading(true);
      setStatusMessage("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setStatusMessage("Switch MetaMask to Sepolia to purchase.");
        return;
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const value = ethers.utils.parseEther(ticketPrice.toString());
      const tx = await contract.buyTicket(
        Number(eventId),
        dayIndex,
        [selectedSeat.id],
        { value }
      );
      setStatusMessage("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatusMessage("Ticket purchased successfully.");
      setSelectedSeat(null);
      setSeatRefreshKey((current) => current + 1);
      const nextCount = effectivePurchasedCount + 1;
      setPurchasedCount(nextCount);
      localStorage.setItem(
        `bp_tickets_${walletAddress}_${eventId}_${dayIndex}`,
        String(nextCount)
      );
    } catch (error) {
      console.error("Ticket purchase failed", error);
      setStatusMessage("Ticket purchase failed. Check MetaMask for details.");
    } finally {
      setBuyLoading(false);
    }
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
              {dayCount > 1 ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-fixed-dim">
                    event
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: dayCount }, (_, index) => {
                      const dayNumber = index + 1;
                      const isActive = dayNumber === selectedDay;
                      return (
                        <button
                          key={dayNumber}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                            isActive
                              ? "bg-primary-container text-on-primary-container"
                              : "border border-outline-variant/30 text-on-surface-variant"
                          }`}
                          onClick={() => {
                            setSelectedDay(dayNumber);
                            setSelectedSeat(null);
                          }}
                          type="button"
                        >
                          Day {dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim">
                  location_on
                </span>
                <span className="text-body-md">
                  {eventDetails?.location || "—"}
                </span>
              </div>
            </div>
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
            {seatLoading ? (
              <p className="text-center text-xs text-on-surface-variant">
                Loading seat availability...
              </p>
            ) : null}
            {seatLoadError ? (
              <p className="text-center text-xs text-error">{seatLoadError}</p>
            ) : null}
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
                  {dayCount > 1 ? (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Day {dayIndex}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-label-md text-outline">Base Price</p>
                  <p className="text-body-lg font-bold text-primary">
                    {ticketPrice.toFixed(2)} ETH
                  </p>
                </div>
              </div>
              <div className="space-y-3 px-2">
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
                    remaining for this day.
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary">
                  verified
                </span>
              </div>
            </div>

            <Button
              className="w-full gap-3 py-4 text-lg shadow-[0_8px_30px_rgba(128,131,255,0.3)] hover:shadow-[0_12px_40px_rgba(128,131,255,0.4)]"
              disabled={!selectedSeat || remainingTickets <= 0 || buyLoading}
              onClick={handleBuy}
            >
              {buyLoading ? "Processing..." : "Buy Ticket"}
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
