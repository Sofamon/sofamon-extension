const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");

const settings = {
  apiKey: "1a8kyQNAq67i9DPkdO-aQ0r8ljRDrizd",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

alchemy.ws.on(
  {
    method: AlchemySubscription.MINED_TRANSACTIONS,
    addresses: [
      {
        to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
    ],
    includeRemoved: true,
    hashesOnly: false,
  },
  (_tx) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log(_tx);
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(
          tabs[0].id,
          { info: "newTxn", data: _tx },
          () => {
            let lastError = chrome.runtime.lastError;
            if (lastError) {
              return true;
            }
          }
        );
    });
  }
);

