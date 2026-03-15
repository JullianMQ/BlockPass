import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";

const SEPOLIA_CHAIN_ID = 11155111;

function Login() {
  const navigate = useNavigate();
  const { walletAddress, chainId, setAuth, clearAuth } = useAuth();
  const [hasProvider, setHasProvider] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      setHasProvider(false);
      return;
    }

    setHasProvider(true);

    const handleAccountsChanged = (accounts) => {
      const nextWallet = accounts?.[0] ?? "";
      setAuth({ wallet: nextWallet, chain: chainId });
    };

    const handleChainChanged = (nextChainId) => {
      const normalized = Number.parseInt(nextChainId, 16);
      const nextChain = Number.isNaN(normalized) ? null : normalized;
      setAuth({ wallet: walletAddress, chain: nextChain });
    };

    ethereum.request({ method: "eth_accounts" }).then(handleAccountsChanged);
    ethereum.request({ method: "eth_chainId" }).then(handleChainChanged);

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const isConnected = Boolean(walletAddress);
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;
  const showWrongNetwork = isConnected && !isCorrectNetwork;

  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      navigate("/choose-path", { replace: true });
    }
  }, [isConnected, isCorrectNetwork, navigate]);

  const handleConnect = async () => {
    if (!window.ethereum) {
      setHasProvider(false);
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const nextWallet = accounts?.[0] ?? "";
      const nextChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const normalized = Number.parseInt(nextChainId, 16);
      const nextChain = Number.isNaN(normalized) ? null : normalized;
      setAuth({ wallet: nextWallet, chain: nextChain });
    } catch (error) {
      console.error("MetaMask connect failed", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearAuth();
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar showFloatingNav={false} showSearch={false} />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-12 pt-28">
      <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-secondary-container/20 blur-[120px]"></div>

      <div className="z-10 w-full max-w-[480px]">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest ghost-border">
            <span className="material-symbols-outlined text-3xl text-primary">
              confirmation_number
            </span>
          </div>
          <h1 className="mb-2 font-headline text-4xl font-bold tracking-tight text-on-surface">
            BlockPass
          </h1>
          <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant">
            The Ethereal Ledger
          </p>
        </div>

        <div className="glass-panel rounded-xl p-1 shadow-2xl ghost-border">
          <div className="rounded-[calc(0.75rem-4px)] bg-surface-container p-8">
            <div className="space-y-6">
              {!isConnected && hasProvider && (
                <div>
                <Button
                  className="h-16 w-full gap-4 text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleConnect}
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10">
                    <img
                      alt="MetaMask Logo"
                        className="h-5 w-5"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAynZuMqk7pR5EwFmIl0rvRDnVBwAMH5LNp83Nuq_slkKi76EAHvOyMguyA_5SKglkHT8j9_nPZ5ols4fK4XfoGDckm7IWadcBTrJ-a46BGvK7TXhpAAnnEf1MOK6WyxhAFr6slHcX7OgEflYsG7O1zhfCHDxlej44lH-vvcIPtsQC6fndWq4bD4kcTuKa7R240Qxccn_pwSgfybPjJkbk1sS8sj0GOzz6NLwcE8fDrjiMhh85YRAHJkahSEbrWHO_qEFXo8_pzzj6L"
                      />
                    </div>
                    <span>
                      {isConnecting ? "Connecting..." : "Connect with MetaMask"}
                    </span>
                </Button>
                </div>
              )}

              {isConnected && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-surface-container-low p-6 text-center ghost-border">
                    <div className="mb-1 flex items-center justify-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>
                      <span className="font-label text-[10px] font-bold uppercase tracking-widest">
                        Active Ledger
                      </span>
                    </div>
                    <p className="font-headline text-xl font-bold tracking-tight text-on-surface">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                  <Button
                    className="h-12 w-full gap-2 text-sm font-semibold"
                    onClick={handleDisconnect}
                    variant="secondary"
                  >
                    <span className="material-symbols-outlined text-lg">
                      logout
                    </span>
                    <span>Disconnect</span>
                  </Button>
                </div>
              )}

              <div className="space-y-4 pt-2">
                {showWrongNetwork && (
                  <div className="flex items-start gap-4 rounded-xl border border-error/20 bg-error-container/20 p-4">
                    <span className="material-symbols-outlined text-error">
                      error
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-label text-xs font-bold uppercase tracking-wider text-error">
                        Wrong Network
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        Please switch to{" "}
                        <span className="font-bold text-on-surface">
                          Sepolia Testnet
                        </span>{" "}
                        to access the ethereal ledger.
                      </p>
                    </div>
                  </div>
                )}

                {!hasProvider && (
                  <div className="flex items-start gap-4 rounded-xl bg-surface-container-highest p-4 ghost-border">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      download
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Extension Required
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        MetaMask is not detected.{" "}
                        <a
                          className="font-bold text-primary hover:underline"
                          href="https://metamask.io/download/"
                          rel="noreferrer"
                          target="_blank"
                        >
                          Install MetaMask
                        </a>{" "}
                        to continue.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center px-4">
          <div className="flex gap-8">
            <a className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant transition-all hover:text-on-surface" href="#">
              Privacy
            </a>
            <a className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant transition-all hover:text-on-surface" href="#">
              Terms
            </a>
            <a className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant transition-all hover:text-on-surface" href="#">
              Support
            </a>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-8 hidden items-center gap-4 lg:flex">
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.8)]"></div>
        <p className="font-label text-[10px] font-bold uppercase tracking-widest text-outline transition-colors">
          Mainnet Node Active
        </p>
      </div>
      </main>
    </div>
  );
}

export default Login;
