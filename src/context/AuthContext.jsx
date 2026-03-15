import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_WALLET = "bp_wallet";
const STORAGE_CHAIN = "bp_chain";

export function AuthProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(
    () => localStorage.getItem(STORAGE_WALLET) || ""
  );
  const [chainId, setChainId] = useState(() => {
    const stored = localStorage.getItem(STORAGE_CHAIN);
    return stored ? Number(stored) : null;
  });

  const setAuth = ({ wallet, chain }) => {
    const nextWallet = wallet || "";
    const nextChain = Number.isFinite(chain) ? chain : null;

    setWalletAddress(nextWallet);
    setChainId(nextChain);

    if (nextWallet) {
      localStorage.setItem(STORAGE_WALLET, nextWallet);
    } else {
      localStorage.removeItem(STORAGE_WALLET);
    }

    if (nextChain !== null) {
      localStorage.setItem(STORAGE_CHAIN, String(nextChain));
    } else {
      localStorage.removeItem(STORAGE_CHAIN);
    }
  };

  const clearAuth = () => {
    setWalletAddress("");
    setChainId(null);
    localStorage.removeItem(STORAGE_WALLET);
    localStorage.removeItem(STORAGE_CHAIN);
  };

  const value = useMemo(
    () => ({
      walletAddress,
      chainId,
      isAuthenticated: Boolean(walletAddress),
      setAuth,
      clearAuth,
    }),
    [walletAddress, chainId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
