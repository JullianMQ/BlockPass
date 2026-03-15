import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";
import Dropdown from "../components/Dropdown.jsx";
import EventCard from "../components/EventCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CONTRACT_ADDRESS = "0xEbD7325C20a9257be621b24f50b5BF59dBB579ad";
const SEPOLIA_CHAIN_ID = 11155111;
const ABI = [
  "function getEvents() view returns (tuple(uint256 id,address organizer,string name,string location,uint256 startDate,uint256 endDate,uint256 totalSeats,uint256 ticketPrice,uint256 ticketsSold,uint256 revenue,bool active)[])",
  "function withdrawEventRevenue(uint256 eventId)",
];

function Catalog() {
  const { walletAddress } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [networkWarning, setNetworkWarning] = useState("");
  const [hasProvider, setHasProvider] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("any");
  const [availabilityFilter, setAvailabilityFilter] = useState("any");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [loadedAt, setLoadedAt] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [withdrawMessage, setWithdrawMessage] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const loadEvents = useCallback(async () => {
      setLoadError("");
      setNetworkWarning("");

      if (!window.ethereum) {
        setHasProvider(false);
        setLoadError("MetaMask not detected. Install MetaMask to load events.");
        return;
      }
      setHasProvider(true);

      try {
        setIsLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const network = await provider.getNetwork();
        if (network.chainId !== SEPOLIA_CHAIN_ID) {
          setNetworkWarning("Switch MetaMask to Sepolia to load on-chain events.");
          setEvents([]);
          return;
        }
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (!code || code === "0x") {
          setLoadError("Contract not found on Sepolia.");
          setEvents([]);
          return;
        }
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const onChainEvents = await contract.getEvents();
        const mappedEvents = onChainEvents.map((event) => {
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
          const daySpan = Math.max(
            1,
            Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          );

          return {
            id: String(event.id),
            organizer: event.organizer,
            name: event.name,
            location: event.location,
            date: startDateLabel,
            startDate: startDateLabel,
            endDate: endDateLabel,
            startDateTs: Number(event.startDate),
            endDateTs: Number(event.endDate),
            priceEth,
            ticketPrice: priceEth,
            totalSeats: event.totalSeats.toNumber(),
            ticketsSold: event.ticketsSold.toNumber(),
            availability:
              event.active &&
              event.ticketsSold.toNumber() < event.totalSeats.toNumber()
                ? "available"
                : "limited",
            tags: daySpan > 1 ? ["assigned"] : [],
            creatorWallet: event.organizer,
          };
        });
        setEvents(mappedEvents);
        sessionStorage.setItem("bp_events", JSON.stringify(mappedEvents));
        setLoadedAt(Date.now());
      } catch (error) {
        console.error("Failed to load events", error);
        setLoadError("Failed to load on-chain events.");
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return undefined;

    const handleChainChanged = () => loadEvents();
    const handleAccountsChanged = () => loadEvents();

    ethereum.on("chainChanged", handleChainChanged);
    ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("chainChanged", handleChainChanged);
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [loadEvents]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadEvents();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  const handleConnect = async () => {
    if (!window.ethereum) {
      setHasProvider(false);
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      loadEvents();
    } catch (error) {
      console.error("MetaMask connect failed", error);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedEvent) return;
    if (!walletAddress) {
      setWithdrawError("Connect your wallet to withdraw.");
      return;
    }
    if (!window.ethereum) {
      setWithdrawError("MetaMask not detected.");
      return;
    }

    try {
      setIsWithdrawing(true);
      setWithdrawError("");
      setWithdrawMessage("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setWithdrawError("Switch MetaMask to Sepolia to withdraw.");
        return;
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.withdrawEventRevenue(selectedEvent.id);
      setWithdrawMessage("Withdrawal sent. Waiting for confirmation...");
      await tx.wait();
      setWithdrawMessage("Revenue withdrawn to organizer wallet.");
    } catch (error) {
      console.error("Withdraw failed", error);
      setWithdrawError("Unable to withdraw revenue.");
    } finally {
      setIsWithdrawing(false);
    }
  };

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
      if (creatorFilter === "me") {
        if (!walletAddress) {
          return false;
        }
        if (!event.creatorWallet) {
          return false;
        }
        if (event.creatorWallet.toLowerCase() !== walletAddress.toLowerCase()) {
          return false;
        }
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
  }, [
    availabilityFilter,
    creatorFilter,
    dateFilter,
    priceFilter,
    searchValue,
    walletAddress,
    loadedAt,
  ]);

  const selectedEventDetails = useMemo(() => {
    if (!selectedEvent) return null;
    return events.find((event) => String(event.id) === String(selectedEvent.id));
  }, [events, selectedEvent]);

  const isOrganizer = useMemo(() => {
    if (!selectedEventDetails || !walletAddress) return false;
    return (
      selectedEventDetails.organizer?.toLowerCase() ===
      walletAddress.toLowerCase()
    );
  }, [selectedEventDetails, walletAddress]);

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

  const creatorItems = [
    { label: "All Creators", onClick: () => setCreatorFilter("all") },
    { label: "Created by Me", onClick: () => setCreatorFilter("me") },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-on-surface">
      <Navbar showFloatingNav />

      <main className="mx-auto max-w-7xl px-6 pt-28">
        <section className="mb-12">
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
            <Dropdown
              align="left"
              buttonClassName="flex items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container-low px-5 py-3 text-on-surface-variant"
              label={
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    account_balance_wallet
                  </span>
                  <span className="text-sm">
                    {creatorFilter === "me" ? "Created by Me" : "All Creators"}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
                </>
              }
              items={creatorItems.map((item) => ({
                label: item.label,
                onClick: item.onClick,
              }))}
            />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-on-surface-variant">
                {isLoading
                  ? "Loading events..."
                  : `Showing ${filteredEvents.length} events`}
              </span>
              <Button
                className="h-12 w-12"
                onClick={loadEvents}
                variant="outline"
              >
                <span className="material-symbols-outlined">tune</span>
              </Button>
            </div>
          </div>
        </section>

        {networkWarning ? (
          <div className="mb-6 rounded-xl border border-outline-variant/20 bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
            {networkWarning}
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-error/30 bg-error-container/20 px-6 py-4 text-sm text-error">
            <span>{loadError}</span>
            {hasProvider ? (
              <Button className="w-fit px-4 py-2 text-xs" onClick={handleConnect}>
                Connect Wallet
              </Button>
            ) : (
              <a
                className="text-xs font-bold text-primary hover:underline"
                href="https://metamask.io/download/"
                rel="noreferrer"
                target="_blank"
              >
                Install MetaMask
              </a>
            )}
          </div>
        ) : null}


        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="space-y-3">
              <EventCard
                event={event}
                onView={() => {
                  setSelectedEvent(event);
                }}
              />
              {selectedEventDetails &&
              String(selectedEventDetails.id) === String(event.id) ? (
                <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-outline">
                        Tickets Sold
                      </p>
                      <p className="text-lg font-bold text-on-surface">
                        {selectedEventDetails.ticketsSold}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="px-4 py-2 text-xs"
                        onClick={() =>
                          navigate(`/seat-map/${event.id}`, { state: { event } })
                        }
                        variant="secondary"
                      >
                        Open Seat Map
                      </Button>
                      {isOrganizer ? (
                        <Button
                          className="px-4 py-2 text-xs"
                          disabled={isWithdrawing}
                          onClick={handleWithdraw}
                          variant="outline"
                        >
                          {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {withdrawMessage ? (
                    <p className="mt-3 text-xs text-primary">
                      {withdrawMessage}
                    </p>
                  ) : null}
                  {withdrawError ? (
                    <p className="mt-3 text-xs text-error">{withdrawError}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}

export default Catalog;
