import { useState } from "react";
import ActivateFirst from "./ActivateFirst";

const ExtensionUI = () => {
  const [characterName, setCharacterName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [characterImage, setCharacterImage] = useState("");
  const [characterLevel, setCharacterLevel] = useState(0);
  const [landAPetByDefault, setLandAPetByDefault] = useState(false);

  const newChar = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(tabs[0].id, "newChar", () => {
          let lastError = chrome.runtime.lastError;
          if (lastError) {
            return true;
          }
        });
    });
  };

  const dismissAll = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url)
        chrome.tabs.sendMessage(tabs[0].id, "dismissAll", () => {
          let lastError = chrome.runtime.lastError;
          if (lastError) {
            return true;
          }
        });
    });
  };

  chrome.runtime.sendMessage("getCharacterName");
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.images && msg?.images.length > 0) {
      setCharacterName(msg.name);
      setCharacterImage(msg.images[0]);
      setCharacterLevel(msg.level);
      setLandAPetByDefault(msg.landAPetByDefault);
    }
  });

  chrome.runtime.sendMessage("getWalletAddr");
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.walletAddr) setWalletAddress(msg?.walletAddr);
  });

  return (
    <>
      {!characterName || characterName === "" ? (
        <ActivateFirst />
      ) : (
        <div
          style={{
            height: 326,
            width: 210,
            backgroundColor: "white",
            userSelect: "none",
          }}
        >
          <center
            style={{
              paddingTop: 10,
              fontFamily: "Cantarell, Arial, sans-serif",
            }}
          >
            sofamon.xyz
          </center>
          <center>
            <img
              src={characterImage}
              draggable={false}
              alt="Shimeji Browser Extension"
              style={{ width: 140, marginRight: 4, marginBottom: 4 }}
            />
            <br />
            <a
              href={`https://etherscan.io/address/${walletAddress}`}
              target="_blank"
              style={{
                marginRight: 10,
                textDecoration: "none",
                color: "unset",
              }}
            >
              {(
                walletAddress.substring(0, 6) +
                "..." +
                walletAddress.substr(-6)
              ).toUpperCase()}
            </a>
            <br />
            <p style={{ margin: "4px 12px 0 0" }}>{characterName}</p>
            <p style={{ margin: "4px 12px 0 0" }}>Level {characterLevel}</p>
          </center>
          <div
            class="hover"
            onClick={() => {
              newChar();
            }}
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              cursor: "pointer",
              alignItems: "center",
              textAlign: "center",
              marginTop: 4,
              padding: "4px 0",
              border: "1px solid rgba(0, 0, 0, 0.22)",
              borderLeft: 0,
              borderRight: 0,
            }}
          >
            <h3
              style={{
                userSelect: "none",
                fontSize: 12,
                margin: 0,
                marginRight: 12,
                color: "rgba(0, 0, 0, 0.87)",
                fontWeight: 400,
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              Summon
            </h3>
          </div>
          <a
            class="hover"
            href="http://localhost:3000/inventory"
            target="_blank"
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              textDecoration: "none",
              cursor: "pointer",
              alignItems: "center",
              textAlign: "center",
              padding: "4px 0",
              borderBottom: "1px solid rgba(0, 0, 0, 0.22)",
              borderLeft: 0,
              borderRight: 0,
            }}
          >
            <h3
              style={{
                userSelect: "none",
                fontSize: 12,
                margin: 0,
                marginRight: 12,
                color: "rgba(0, 0, 0, 0.87)",
                fontWeight: 400,
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              Change
            </h3>
          </a>
          <div
            class="hover"
            onClick={() => {
              dismissAll();
            }}
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              cursor: "pointer",
              alignItems: "center",
              textAlign: "center",
              padding: "4px 0",
              borderBottom: "1px solid rgba(0, 0, 0, 0.22)",
              borderLeft: 0,
              borderRight: 0,
            }}
          >
            <h3
              style={{
                userSelect: "none",
                fontSize: 12,
                margin: 0,
                marginRight: 12,
                color: "rgba(0, 0, 0, 0.87)",
                fontWeight: 400,
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              Dismiss
            </h3>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 3,
            }}
          >
            <input
              type="checkbox"
              id="landAPetByDefault"
              value="landAPetByDefault"
              style={{ marginRight: 10 }}
              checked={landAPetByDefault}
              onChange={(e) => {
                chrome.runtime.sendMessage({
                  landAPetByDefault: e.target.checked,
                });
                setLandAPetByDefault(e.target.checked);
              }}
            />
            <span style={{ marginRight: 16 }}>Land a pet by default</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ExtensionUI;
