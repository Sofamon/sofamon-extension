const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");

const settings = {
  apiKey: "1a8kyQNAq67i9DPkdO-aQ0r8ljRDrizd",
  network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(settings);

const makeWSConnection = (addr) => {
  alchemy.ws.removeAllListeners();
  alchemy.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      addresses: [
        {
          from: addr,
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
};

//----------------------------------------------------------------------------------------------------------------

let characterInfo;
let landAPetByDefault = true;

const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

const cacheAllImages = async (id = "bunny") => {
  let res = await fetch(`http://localhost:3000/images/${id}/config.json`);
  res = await res.json();
  images = [];
  for (let position in res.positions) {
    for (let i = 1; i <= res.positions[position].frames; i++) {
      if (i < 10) images.push(`${res.positions[position].id}0${i}`);
      else images.push(`${res.positions[position].id}${i}`);
    }
  }
  return new Promise((resolve) => {
    const imageData = {};
    for (let image of images) {
      getBase64FromUrl(`http://localhost:3000/images/${id}/${image}.png`).then(
        (base64Images) => {
          imageData[image] = base64Images;
          if (Object.keys(imageData).length === images.length)
            resolve({ images: imageData, config: res });
        }
      );
    }
  });
};

chrome.storage.local.get(["landAPetByDefault"]).then(async (result) => {
  if (result?.landAPetByDefault !== undefined)
    landAPetByDefault = result.landAPetByDefault;
  else chrome.storage.local.set({ landAPetByDefault });
});

chrome.storage.local.get(["characterInfo"]).then(async (result) => {
  if (result.characterInfo) characterInfo = result.characterInfo;
});

chrome.runtime.onMessageExternal.addListener(async (msg, sender) => {
  if (
    sender.url?.includes("http://localhost:3000/") &&
    msg?.info === "changeCharacter" &&
    (characterInfo === undefined ||
      msg?.characterName !== JSON.parse(characterInfo).name)
  ) {
    const { images, config } = await cacheAllImages(msg?.characterId);
    characterInfo = JSON.stringify({
      name: msg?.characterName,
      images,
      config,
      level: 0,
    });
    chrome.storage.local.set({ characterInfo });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.landAPetByDefault !== undefined) {
    landAPetByDefault = msg.landAPetByDefault;
    chrome.storage.local.set({ landAPetByDefault });
  } else if (msg === "getCharacterInfo") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(
          tabs[0].id,
          characterInfo === undefined
            ? {
                name: undefined,
                images: {},
                config: {},
                level: NaN,
                landAPetByDefault: false,
              }
            : {
                ...JSON.parse(characterInfo),
                landAPetByDefault,
              },
          () => {
            let lastError = chrome.runtime.lastError;
            if (lastError) {
              return true;
            }
          }
        );
    });
  } else if (msg === "getCharacterName")
    chrome.runtime.sendMessage(
      characterInfo === undefined
        ? {
            name: undefined,
            images: {},
            config: {},
            level: NaN,
            landAPetByDefault: false,
          }
        : {
            ...JSON.parse(characterInfo),
            landAPetByDefault,
          }
    );
});

//----------------------------------------------------------------------------------------------------------------

let walletConnected = false;
let walletAddr = "0x1D05dE4A9EB00A930529B783C2D682715fB250F0";

chrome.storage.local.get(["walletConnected"]).then(async (result) => {
  if (result?.walletConnected !== undefined) {
    walletConnected = result.walletConnected;
  } else chrome.storage.local.set({ walletConnected });
});

chrome.storage.local.get(["walletAddr"]).then(async (result) => {
  if (result?.walletAddr !== undefined) {
    walletAddr = result.walletAddr;
    makeWSConnection(walletAddr);
  }
});

chrome.runtime.onMessageExternal.addListener((msg, sender) => {
  if (sender.url?.includes("http://localhost:3000/")) {
    console.log("listen from http://localhost:3000/");
    if (msg.connected) {
      if (walletAddr !== msg.addr) {
        characterInfo = undefined;
        chrome.storage.local.remove("characterInfo");
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs[0]?.url) chrome.tabs.sendMessage(tabs[0].id, "dismissAll");
          }
        );
      }
      walletAddr = msg.addr;
      makeWSConnection(walletAddr);
      walletConnected = true;
      chrome.storage.local.set({ walletConnected });
      chrome.storage.local.set({ walletAddr: msg.addr });
    } else if (msg?.connected === false) {
      alchemy.ws.removeAllListeners();
      walletConnected = false;
      characterInfo = undefined;
      chrome.storage.local.remove("characterInfo");
      chrome.storage.local.remove("walletAddr");
      chrome.storage.local.set({ walletConnected });
    }
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "getWalletStatus")
    chrome.runtime.sendMessage({ walletConnected });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "getWalletAddr") chrome.runtime.sendMessage({ walletAddr });
});
