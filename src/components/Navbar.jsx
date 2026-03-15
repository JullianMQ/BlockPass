import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";
import Dropdown from "./Dropdown.jsx";

function Navbar({
  showSearch = true,
  showFloatingNav = true,
  showDesktopNav = true,
  networkLabel,
}) {
  const { isAuthenticated, walletAddress } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shortenedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const resourceItems = [
    { label: "Public Verify", onClick: () => navigate("/verify") },
    { label: "Docs", onClick: () => navigate("/docs") },
    { label: "Support", onClick: () => navigate("/support") },
  ];
  const organizerItems = [
    { label: "Create Event", onClick: () => navigate("/organizer-dashboard") },
    { label: "Mark Used", onClick: () => navigate("/mark-used") },
  ];

  const mobileMenuItems = [
    { label: "Events", onClick: () => navigate("/catalog") },
    { label: "Portal", onClick: () => navigate("/choose-path") },
    { label: "My Tickets", onClick: () => navigate("/my-tickets") },
    { label: "Create Event", onClick: () => navigate("/organizer-dashboard") },
    { label: "Mark Used", onClick: () => navigate("/mark-used") },
    { label: "Public Verify", onClick: () => navigate("/verify") },
    { label: "Docs", onClick: () => navigate("/docs") },
    { label: "Support", onClick: () => navigate("/support") },
  ];

  const handleMobileNavigate = (handler) => {
    handler();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {showDesktopNav ? (
        <nav className="fixed top-0 z-50 hidden w-full items-center justify-between border-b border-outline-variant/10 px-8 py-4 glass md:flex">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full signature-gradient">
                <span
                  className="material-symbols-outlined text-on-primary"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  confirmation_number
                </span>
              </div>
              <Link
                className="font-headline text-2xl font-bold tracking-tight"
                to="/"
              >
                BlockPass
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link
                className="font-label text-sm font-medium transition-colors hover:text-primary"
                to="/catalog"
              >
                Events
              </Link>
              <Link
                className="font-label text-sm font-medium transition-colors hover:text-primary"
                to="/choose-path"
              >
                Portal
              </Link>
              <Link
                className="font-label text-sm font-medium transition-colors hover:text-primary"
                to="/my-tickets"
              >
                My Tickets
              </Link>
              <Dropdown label="Organizer" items={organizerItems} />
              <Dropdown label="Resources" items={resourceItems} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {showSearch ? (
              <div className="mr-4 hidden items-center gap-3 rounded-full bg-surface-container-highest/50 px-4 py-2 lg:flex">
                <span className="material-symbols-outlined text-sm text-primary-fixed-dim">
                  search
                </span>
                <span className="font-label text-xs text-on-surface-variant">
                  Search events or assets...
                </span>
              </div>
            ) : null}
            <button className="relative rounded-full p-2 transition-colors hover:bg-surface-container-highest">
              <span className="material-symbols-outlined text-on-surface-variant">
                notifications
              </span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"></span>
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3 rounded-full border border-outline-variant/20 bg-surface-container-high px-4 py-1.5">
                <div className="flex flex-col items-end">
                  {networkLabel ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-secondary-container">
                      {networkLabel}
                    </span>
                  ) : null}
                  <span className="font-label text-xs font-bold text-primary">
                    {shortenedWallet}
                  </span>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-highest">
                  <span
                    className="material-symbols-outlined text-[14px] text-primary-fixed-dim"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    account_balance_wallet
                  </span>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <Button className="px-5 py-2 text-xs" variant="secondary">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>
      ) : null}

      {showFloatingNav ? (
        <>
          <nav className="fixed bottom-6 left-1/2 z-50 flex h-16 w-[90%] max-w-md -translate-x-1/2 items-center justify-around rounded-full glass-nav px-4 shadow-2xl md:hidden">
            <Link
              className="flex flex-col items-center gap-0.5 text-primary"
              to="/catalog"
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                search
              </span>
              <span className="text-[10px] font-bold">Events</span>
            </Link>
            <Link
              className="flex flex-col items-center gap-0.5 text-on-surface-variant transition-colors hover:text-on-surface"
              to="/choose-path"
            >
              <span className="material-symbols-outlined text-[24px]">
                confirmation_number
              </span>
              <span className="text-[10px] font-bold">Portal</span>
            </Link>
            <Link
              className="flex flex-col items-center gap-0.5 text-on-surface-variant transition-colors hover:text-on-surface"
              to="/my-tickets"
            >
              <span className="material-symbols-outlined text-[24px]">
                confirmation_number
              </span>
              <span className="text-[10px] font-bold">Tickets</span>
            </Link>
            <Link
              className="flex flex-col items-center gap-0.5 text-on-surface-variant transition-colors hover:text-on-surface"
              to="/verify"
            >
              <span className="material-symbols-outlined text-[24px]">
                verified
              </span>
              <span className="text-[10px] font-bold">Verify</span>
            </Link>
            <button
              className="flex flex-col items-center gap-0.5 text-on-surface-variant transition-colors hover:text-on-surface"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
              <span className="text-[10px] font-bold">Menu</span>
            </button>
          </nav>
          {isMobileMenuOpen ? (
            <div className="fixed bottom-24 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-outline-variant/20 bg-surface-container-highest p-4 shadow-2xl md:hidden">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Navigation
                </span>
                <button
                  className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container"
                  onClick={() => setIsMobileMenuOpen(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mobileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-left text-xs text-on-surface-variant transition-colors hover:text-on-surface"
                    onClick={() => handleMobileNavigate(item.onClick)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}

export default Navbar;
