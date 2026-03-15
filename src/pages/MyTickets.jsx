import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CONTRACT_ADDRESS = "0xEbD7325C20a9257be621b24f50b5BF59dBB579ad";
const SEPOLIA_CHAIN_ID = 11155111;
const ABI = [
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "function tickets(uint256 tokenId) view returns (uint256 eventId,uint256 day,uint256 seatNumber,bool used)",
  "function events(uint256 eventId) view returns (uint256 id,address organizer,string name,string location,uint256 startDate,uint256 endDate,uint256 totalSeats,uint256 ticketPrice,uint256 ticketsSold,uint256 revenue,bool active)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

function MyTickets() {
  const { walletAddress } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [networkWarning, setNetworkWarning] = useState("");

  const loadTickets = useCallback(async () => {
    if (!walletAddress) {
      setTickets([]);
      return;
    }
    if (!window.ethereum) {
      setLoadError("MetaMask not detected. Install MetaMask to load tickets.");
      return;
    }

    try {
      setIsLoading(true);
      setLoadError("");
      setNetworkWarning("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setNetworkWarning("Switch MetaMask to Sepolia to load your tickets.");
        setTickets([]);
        return;
      }
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (!code || code === "0x") {
        setLoadError("Contract not found on Sepolia.");
        setTickets([]);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const transferTopic = contract.interface.getEventTopic("Transfer");
      const toTopic = ethers.utils.hexZeroPad(walletAddress, 32);
      const nullTopic = ethers.utils.hexZeroPad("0x0", 32);
      const latestBlock = await provider.getBlockNumber();
      const startBlock = Math.max(0, latestBlock - 250000);
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: startBlock,
        toBlock: "latest",
        topics: [transferTopic, nullTopic, toTopic],
      });

      const tokenIds = Array.from(
        new Set(
          logs
            .map((log) => contract.interface.parseLog(log))
            .map((parsed) => parsed.args.tokenId.toString())
        )
      );

      const ownedTokenIds = [];
      for (const tokenId of tokenIds) {
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            ownedTokenIds.push(tokenId);
          }
        } catch (error) {
          console.error("Failed to verify owner", error);
        }
      }

      const detailedTickets = await Promise.all(
        ownedTokenIds.map(async (tokenId) => {
          const ticket = await contract.tickets(tokenId);
          const eventDetails = await contract.events(ticket.eventId);
          const start = new Date(Number(eventDetails.startDate) * 1000);
          const ticketDate = new Date(start);
          ticketDate.setDate(ticketDate.getDate() + Number(ticket.day) - 1);
          return {
            id: `BPT-${tokenId}`,
            tokenId: `#${tokenId}`,
            eventName: eventDetails.name,
            date: ticketDate.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            seat: `Seat ${ticket.seatNumber.toString()}`,
            dayLabel: `Day ${ticket.day.toString()}`,
            status: ticket.used ? "used" : "valid",
            eventId: ticket.eventId.toString(),
          };
        })
      );

      setTickets(detailedTickets);
    } catch (error) {
      console.error("Failed to load tickets", error);
      setLoadError("Failed to load your tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    if (filter === "unused") {
      return tickets.filter((ticket) => ticket.status !== "used");
    }
    if (filter === "used") {
      return tickets.filter((ticket) => ticket.status === "used");
    }
    return tickets;
  }, [filter, tickets]);

  const handleConnect = async () => {
    if (!window.ethereum) {
      setLoadError("MetaMask not detected. Install MetaMask to load tickets.");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await loadTickets();
    } catch (error) {
      console.error("MetaMask connect failed", error);
    }
  };
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
            <Button
              className="px-6 py-2 text-sm"
              onClick={() => setFilter("all")}
              variant={filter === "all" ? "primary" : "outline"}
            >
              All
            </Button>
            <Button
              className="px-6 py-2 text-sm"
              onClick={() => setFilter("unused")}
              variant={filter === "unused" ? "primary" : "outline"}
            >
              Unused
            </Button>
            <Button
              className="px-6 py-2 text-sm"
              onClick={() => setFilter("used")}
              variant={filter === "used" ? "primary" : "outline"}
            >
              Used
            </Button>
          </div>
        </header>

        {networkWarning ? (
          <div className="mb-6 rounded-xl border border-outline-variant/20 bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
            {networkWarning}
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-error/30 bg-error-container/20 px-6 py-4 text-sm text-error">
            <span>{loadError}</span>
            <Button className="w-fit px-4 py-2 text-xs" onClick={handleConnect}>
              Connect Wallet
            </Button>
          </div>
        ) : null}
        {isLoading ? (
          <div className="mb-6 rounded-xl border border-outline-variant/20 bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
            Loading tickets...
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {filteredTickets.map((ticket) => {
            const isUsed = ticket.status === "used";
            return (
              <article
                key={ticket.id}
                className={`flex flex-1 flex-col justify-between overflow-hidden rounded-full bg-surface-container p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(192,193,255,0.35)] ${
                  isUsed
                    ? "opacity-80 grayscale hover:grayscale-0 hover:opacity-100"
                    : "hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      isUsed
                        ? "border border-outline-variant/30 bg-surface-variant/80 text-on-surface-variant"
                        : "border border-primary/30 bg-primary/20 text-primary"
                    }`}
                  >
                    {isUsed ? "Used" : "Valid"}
                  </span>
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
                <div className="mt-6 flex flex-1 flex-col justify-between">
                  <div>
                    <h3
                      className={`mb-2 font-headline text-2xl font-bold leading-tight ${
                        isUsed ? "text-on-surface/60 line-through" : ""
                      }`}
                    >
                      {ticket.eventName}
                    </h3>
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
                          event
                        </span>
                        <span>{ticket.dayLabel}</span>
                      </div>
                    </div>
                    <p
                      className={`mb-1 text-sm font-medium ${
                        isUsed
                          ? "text-on-surface-variant/40"
                          : "text-on-secondary-container"
                      }`}
                    >
                      On-chain Ticket
                    </p>
                    <p
                      className={`text-xs ${
                        isUsed
                          ? "text-on-surface-variant/40"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {ticket.seat}
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
                        Token ID
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
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${ticket.tokenId.replace("#", "")}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Button className="px-6 py-2.5 text-sm" variant="ghost">
                            View Ticket
                          </Button>
                        </a>
                        <Button
                          className="px-6 py-2.5 text-sm"
                          onClick={() =>
                            window.open(`/seat-map/${ticket.eventId}`, "_self")
                          }
                          variant="outline"
                        >
                          View Event
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {!isLoading && filteredTickets.length === 0 ? (
            <article className="flex items-center justify-center rounded-full border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-12 text-center transition-all hover:border-primary/40">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    add_circle
                  </span>
                </div>
                <h3 className="mb-2 font-headline text-xl font-bold text-on-surface">
                  No tickets yet
                </h3>
                <p className="mb-6 max-w-[240px] text-sm text-on-surface-variant">
                  Head to the catalog to claim your first on-chain ticket.
                </p>
                <Button
                  className="px-6 py-2.5 text-sm"
                  onClick={() => window.open("/catalog", "_self")}
                  variant="primary"
                >
                  Browse Catalog
                </Button>
              </div>
            </article>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default MyTickets;
