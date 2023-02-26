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

//----------------------------------------------------------------------------------------------------------------

let characterInfo
let landAPetByDefault = true

const getBase64FromUrl = async (url) => {
  const data = await fetch(url)
  const blob = await data.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64data = reader.result
      resolve(base64data)
    }
  })
}

const cacheAllImages = async (id = 'noun') => {
  return new Promise((resolve) => {
    const imageData = []
    for (let i = 1; i < 47; i++) {
      getBase64FromUrl(`http://localhost:3000/images/${id}/shime${i}.png`).then(
        (res) => {
          imageData.push({ id: i, data: res })
          if (imageData.length === 46) resolve(imageData)
        }
      )
    }
  })
}