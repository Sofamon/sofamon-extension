const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");

const settings = {
  apiKey: "1a8kyQNAq67i9DPkdO-aQ0r8ljRDrizd",
  network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(settings);

const triggerActionOnChainActivity = (from, to, action) => {
  alchemy.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      addresses: [
        {
          from: from,
          to: to,
        },
      ],
      includeRemoved: true,
      hashesOnly: false,
    },
    (_tx) => {
      if (
        action !== "sendTransaction" ||
        (action === "sendTransaction" && _tx?.transaction?.input === "0x")
      )
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url)
            chrome.tabs.sendMessage(
              tabs[0].id,
              { info: action, data: _tx },
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

const makeWSConnection = (addr) => {
  alchemy.ws.removeAllListeners();
  triggerActionOnChainActivity(
    addr,
    "0x00000000000001ad428e4906ae43d8f9852d0dd6",
    "buyNFT"
  );
  triggerActionOnChainActivity(addr, "", "sendTransaction");
  triggerActionOnChainActivity(
    "0x9d97fbc55fc28022e1df7617c9fd447f30b51369",
    addr,
    "getAirdrop"
  );
};

//----------------------------------------------------------------------------------------------------------------

let characterInfo;
let landAPetByDefault = true;
let sofaMode = false;
let petAlreadyLanded = false;

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
            resolve({
              name: res?.name,
              characterId: id,
              images: imageData,
              config: res,
              level: 0,
            });
        }
      );
    }
  });
};

const mintNFT = async (id) => {
  const res = await cacheAllImages(id);
  characterInfo = JSON.stringify(res);
  chrome.storage.local.set({ characterInfo });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url)
      chrome.tabs.sendMessage(tabs[0].id, { info: "mintNFT", ...res }, () => {
        let lastError = chrome.runtime.lastError;
        if (lastError) {
          return true;
        }
      });
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
      msg?.characterId !== JSON.parse(characterInfo).characterId)
  ) {
    const { images, config } = await cacheAllImages(msg?.characterId);
    characterInfo = JSON.stringify({
      name: msg?.characterName,
      characterId: msg?.characterId,
      images,
      config,
      level: 0,
    });
    sofaMode = false;
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
                characterId: undefined,
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
            characterId: undefined,
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
let walletAddr = "";

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

chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (sender.url?.includes("http://localhost:3000/")) {
    console.log("listen from http://localhost:3000/");
    if (msg?.info === "levelUp") {
      characterInfo = JSON.stringify({
        ...JSON.parse(characterInfo),
        level: JSON.parse(characterInfo).level + 1,
      });
      chrome.storage.local.set({ characterInfo });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url)
          chrome.tabs.sendMessage(tabs[0].id, msg, () => {
            let lastError = chrome.runtime.lastError;
            if (lastError) {
              return true;
            }
          });
      });
    } else if (msg?.info === "mintNFT") mintNFT(msg?.character);
    else if (msg?.info === "getLevelInfo" && characterInfo) {
      sendResponse({
        info: "levelInfo",
        level: JSON.parse(characterInfo).level,
      });
    } else if (msg.connected) {
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

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg === "getSofaModeStatus") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(tabs[0].id, {
          info: "sofaMode",
          sofaMode,
        });
    });
  } else if (msg === "sofaMode") sofaMode = true;
  else if (msg === "sofaModeOff") sofaMode = false;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "getWalletStatus")
    chrome.runtime.sendMessage({ walletConnected });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "getWalletAddr") chrome.runtime.sendMessage({ walletAddr });
});

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg === "getETHPrice") {
    let res = await fetch("https://core-api.prod.blur.io/v1/prices");
    res = await res.json();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(tabs[0].id, {
          info: "ethPrice",
          price: res.ethereum.usd,
        });
    });
  }
});

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg === "getDailyRevenue") {
    let res = await fetch(
      "https://gateway.thegraph.com/api/519810ccbcc0e07b822948af4e7d5e5e/deployments/id/QmcPHxcC2ZN7m79XfYZ77YmF4t9UCErv87a9NFKrSLWKtJ",
      {
        headers: {
          "Content-Type": "application/json",
        },
        body: '{"query":"query fin {\\n  financialsDailySnapshot(id: \\"18752\\") {\\n    dailyTotalRevenueUSD\\n  }\\n}","operationName":"fin"}',
        method: "POST",
      }
    );
    res = await res.json();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(tabs[0].id, {
          info: "dailyRevenue",
          price: Number(
            res.data.financialsDailySnapshot.dailyTotalRevenueUSD
          ).toFixed(2),
        });
    });
  }
});

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg === "isPetAlreadyLanded") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(tabs[0].id, {
          info: "petAlreadyLanded",
          petAlreadyLanded,
        });
    });
  } else if (msg === "petLanded") petAlreadyLanded = true;
});
