import { useState, useEffect } from "react";
import ExtensionUI from "./ExtensionUI.jsx";
import ConnectWallet from "./ConnectWallet.jsx";

const App = () => {
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage("getWalletStatus");
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.walletConnected) setWalletConnected(true);
    });
  }, []);

  return <>{walletConnected ? <ExtensionUI /> : <ConnectWallet />}</>;
};

export default App;
