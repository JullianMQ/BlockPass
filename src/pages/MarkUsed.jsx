import { useCallback, useMemo, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CONTRACT_ADDRESS = "0xEbD7325C20a9257be621b24f50b5BF59dBB579ad";
const SEPOLIA_CHAIN_ID = 11155111;
const ABI = [
  "function verifyTicket(uint256 tokenId) view returns (address ownerAddr,uint256 eventId,uint256 day,uint256 seatNumber,bool used)",
  "function events(uint256 eventId) view returns (uint256 id,address organizer,string name,string location,uint256 startDate,uint256 endDate,uint256 totalSeats,uint256 ticketPrice,uint256 ticketsSold,uint256 revenue,bool active)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function markUsed(uint256 tokenId)",
];

function MarkUsed() {
  const { walletAddress } = useAuth();
  const [tokenId, setTokenId] = useState("");
  const [ticketDetails, setTicketDetails] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(null);

  const normalizedTokenId = useMemo(() => {
    if (!tokenId) return null;
    const parsed = Number(tokenId);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [tokenId]);

  const fetchTicketDetails = useCallback(async () => {
    if (!normalizedTokenId) {
      setTicketDetails(null);
      setErrorMessage("Enter a valid token ID.");
      return null;
    }
    if (!window.ethereum) {
      setErrorMessage("MetaMask not detected.");
      return null;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setStatusMessage("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setErrorMessage("Switch MetaMask to Sepolia to verify tickets.");
        return null;
      }
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (!code || code === "0x") {
        setErrorMessage("Contract not found on Sepolia.");
        return null;
      }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const ticket = await contract.verifyTicket(normalizedTokenId);
      const eventDetails = await contract.events(ticket.eventId);
      const ownerAddress = await contract.ownerOf(normalizedTokenId);
      const details = {
        tokenId: normalizedTokenId,
        eventId: Number(ticket.eventId),
        day: Number(ticket.day),
        seatNumber: Number(ticket.seatNumber),
        used: Boolean(ticket.used),
        owner: ownerAddress,
        organizer: eventDetails.organizer,
        eventName: eventDetails.name,
      };
      setTicketDetails(details);
      setLastVerifiedAt(new Date());
      return details;
    } catch (error) {
      console.error("Failed to verify ticket", error);
      setErrorMessage("Unable to verify ticket. Check the token ID.");
      setTicketDetails(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [normalizedTokenId]);

  const handleMarkUsed = async () => {
    const details = ticketDetails || (await fetchTicketDetails());
    if (!details) return;
    if (!window.ethereum) {
      setErrorMessage("MetaMask not detected.");
      return;
    }
    if (details.used) {
      setErrorMessage("Ticket already marked as used.");
      return;
    }
    if (walletAddress) {
      if (details.organizer.toLowerCase() !== walletAddress.toLowerCase()) {
        setErrorMessage("Only the event organizer can mark tickets used.");
        return;
      }
    }

    try {
      setIsMarking(true);
      setErrorMessage("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setErrorMessage("Switch MetaMask to Sepolia to mark used.");
        return;
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.markUsed(details.tokenId);
      setStatusMessage("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatusMessage("Ticket marked as used.");
      setTicketDetails({ ...details, used: true });
      setLastVerifiedAt(new Date());
    } catch (error) {
      console.error("Mark used failed", error);
      setErrorMessage("Failed to mark ticket. Check MetaMask for details.");
    } finally {
      setIsMarking(false);
    }
  };
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar showSearch />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 pb-24 pt-28 lg:grid-cols-12">
        <div className="flex flex-col gap-12 lg:col-span-7">
          <header className="space-y-4">
            <div className="inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              Ledger Authorization
            </div>
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-on-surface md:text-6xl">
              Staff Portal: Validate &amp; Mark Used
            </h1>
            <p className="max-w-xl text-lg text-on-surface-variant">
              Enter ticket credentials to officially record entry in the
              blockchain ledger. This action is irreversible once committed.
            </p>
          </header>

          <section className="rounded-full border border-outline-variant/10 bg-surface-container-low p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-4 block text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Token ID
                </label>
                <input
                  className="w-full rounded-full border-none bg-surface-container-highest px-6 py-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/40"
                  placeholder="e.g., 8821"
                  type="text"
                  value={tokenId}
                  onChange={(event) => setTokenId(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="ml-4 block text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  Organizer Wallet
                </label>
                <input
                  className="w-full rounded-full border-none bg-surface-container-highest px-6 py-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/40"
                  placeholder="Connected wallet required"
                  type="text"
                  value={walletAddress || ""}
                  readOnly
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                className="gap-3 px-10 py-4"
                disabled={isMarking}
                onClick={handleMarkUsed}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  account_balance_wallet
                </span>
                {isMarking ? "Marking..." : "Mark as Used"}
              </Button>
            </div>
            {statusMessage ? (
              <p className="mt-4 text-sm text-primary">{statusMessage}</p>
            ) : null}
            {errorMessage ? (
              <p className="mt-4 text-sm text-error">{errorMessage}</p>
            ) : null}
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-32">
            <div className="rounded-full border border-outline-variant/10 bg-surface-container p-1 shadow-[0_40px_60px_-5px_rgba(218,226,253,0.06)]">
              <div className="space-y-8 rounded-full bg-surface-container-low p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-outline">
                      Current Status
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-primary/20 bg-primary/20 px-4 py-1.5 text-sm font-bold tracking-wide text-primary">
                        {ticketDetails ? "VALID" : "—"}
                      </div>
                      <div className="rounded-full border border-outline-variant/20 bg-surface-bright px-4 py-1.5 text-sm font-bold tracking-wide text-on-surface">
                        {ticketDetails
                          ? ticketDetails.used
                            ? "USED"
                            : "UNUSED"
                          : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-3xl">
                      verified
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="h-px bg-outline-variant/20"></div>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-outline">
                        Event Name
                      </span>
                      <span className="font-headline font-medium text-on-surface">
                        {ticketDetails?.eventName || "—"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-outline">
                        Seat Assignment
                      </span>
                      <span className="font-headline font-medium text-on-surface">
                        {ticketDetails
                          ? `Seat ${ticketDetails.seatNumber}`
                          : "—"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-outline">
                        Blockchain Owner
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {ticketDetails?.owner
                          ? `${ticketDetails.owner.slice(0, 6)}...${ticketDetails.owner.slice(-4)}`
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-outline-variant/20"></div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>
                      <span className="text-xs font-label">
                        Verified:{" "}
                        {lastVerifiedAt
                          ? lastVerifiedAt.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        database
                      </span>
                      <span className="text-xs font-label">Node: Sepolia</span>
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 h-32 w-full overflow-hidden rounded-xl">
                  <div className="absolute inset-0 signature-gradient opacity-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-primary/20">
                      qr_code_2
                    </span>
                  </div>
                  <img
                    alt="Abstract blockchain visual"
                    className="h-full w-full object-cover opacity-20 mix-blend-overlay"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf_q4Q7IYvNHJo9LygTT0dsVAhX_sWhNsP18dXRwNtQLkqTRk3hW6vaF2G0Nw5rP3aUDdMO48xiiEgmnnvT0CwCGxqsZfxsgEOm4ys0lAQE3v1_jfBxWs96k42FE40KrVxnr6CDxglQHQ6OfvmQUzx4dBsUdmQhhuFiLpvi6cJhEvWcV4gKhD-mme0h9gG2J-Q-18EPX6mV4KVA0Iw2aII-qnROyPI5O47T6JXVPafuBN3yUdKW6feq1XjrEBywbEZwtBQ49OUi7dl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MarkUsed;
