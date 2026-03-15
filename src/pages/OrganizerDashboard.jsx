import { useMemo, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CONTRACT_ADDRESS = "0xEbD7325C20a9257be621b24f50b5BF59dBB579ad";
const SEPOLIA_CHAIN_ID = 11155111;
const ABI = [
  "function createEvent(string name,string location,uint256 startDate,uint256 endDate,uint256 totalSeats,uint256 ticketPrice)",
];

function OrganizerDashboard() {
  const { walletAddress } = useAuth();
  const [eventName, setEventName] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [totalRows, setTotalRows] = useState("");
  const [seatsPerRow, setSeatsPerRow] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSeats = useMemo(() => {
    const rows = Number(totalRows);
    const seats = Number(seatsPerRow);
    if (!rows || !seats) return 0;
    return rows * seats;
  }, [seatsPerRow, totalRows]);

  const handleCreateEvent = async () => {
    if (!eventName.trim() || !venue.trim() || !priceEth) {
      setErrorMessage("Fill out the event name, venue, and ticket price.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMessage("Select start and end dates.");
      return;
    }
    if (!totalSeats) {
      setErrorMessage("Enter total rows and seats per row.");
      return;
    }
    if (!window.ethereum) {
      setErrorMessage("MetaMask not detected.");
      return;
    }

    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) {
      setErrorMessage("Invalid start or end date.");
      return;
    }
    if (endTimestamp < startTimestamp) {
      setErrorMessage("End date must be after start date.");
      return;
    }
    if (startTimestamp <= Math.floor(Date.now() / 1000)) {
      setErrorMessage("Start date must be in the future.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setStatusMessage("");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        setErrorMessage("Switch MetaMask to Sepolia to create events.");
        return;
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const priceWei = ethers.utils.parseEther(priceEth.toString());
      const tx = await contract.createEvent(
        eventName.trim(),
        venue.trim(),
        startTimestamp,
        endTimestamp,
        totalSeats,
        priceWei
      );
      setStatusMessage("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatusMessage("Event deployed to the ledger.");
      setEventName("");
      setPriceEth("");
      setStartDate("");
      setEndDate("");
      setVenue("");
      setTotalRows("");
      setSeatsPerRow("");
    } catch (error) {
      console.error("Create event failed", error);
      setErrorMessage("Failed to create event. Check MetaMask for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
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
                    min="0"
                    value={priceEth}
                    onChange={(event) => setPriceEth(event.target.value)}
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
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
                  End Date &amp; Time
                </label>
                <input
                  className="rounded-md border-none bg-surface-container-highest px-5 py-4 focus:ring-1 focus:ring-primary/40"
                  type="datetime-local"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
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
                  value={venue}
                  onChange={(event) => setVenue(event.target.value)}
                />
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
                    min="1"
                    value={totalRows}
                    onChange={(event) => setTotalRows(event.target.value)}
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
                    min="1"
                    value={seatsPerRow}
                    onChange={(event) => setSeatsPerRow(event.target.value)}
                  />
                </div>
              </div>
              <div className="text-xs text-on-surface-variant">
                Total seats: {totalSeats || "—"}
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-8">
              <Button className="px-8 py-3" variant="outline">
                Save Draft
              </Button>
              <Button
                className="gap-2 px-12 py-3"
                disabled={isSubmitting}
                onClick={handleCreateEvent}
              >
                <span className="material-symbols-outlined">rocket_launch</span>
                {isSubmitting ? "Deploying..." : "Deploy to Ledger"}
              </Button>
            </div>
            {statusMessage ? (
              <p className="text-sm text-primary">{statusMessage}</p>
            ) : null}
            {errorMessage ? (
              <p className="text-sm text-error">{errorMessage}</p>
            ) : null}
            {walletAddress ? (
              <p className="text-xs text-outline">Connected: {walletAddress}</p>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

export default OrganizerDashboard;
