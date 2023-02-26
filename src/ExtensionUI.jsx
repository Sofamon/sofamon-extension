import { useState } from "react";

const nounImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsSAAALEgHS3X78AAAAG3RFWHRTb2Z0d2FyZQBDZWxzeXMgU3R1ZGlvIFRvb2zBp+F8AAAE9ElEQVR4nO3dv44bVRTA4SwNoaCipqBEShPxT3TQU/EGPAQlVaRIwEMg6pWo0ocOQZDSICHRUFFSpYhoWKp1LpZ9fOfOeGZ9zvdVXst7ZzQ+v5W8Gs9c3dzc3IOqrgRAZQKgNAFQmgAoTQCUJgBKEwClCYDSBEBpAqA0AVCaAChNAJQmAEoTAKUJgNIEQGkCoDQBUJoAKE0AlCYAShMApQmA0gRAaQKgNAFQmgAoTQCUJgBKEwClCYDSBEBpAqA0AVCaAChNAJQmAEoTAKUJgNIEQGkCoDQBUJoAKE0AlCYAShMApQmA0gRAaQKgNAFs7P2HH+zegF+fP7vacl8qEsDGBLAtAWxMANsSwMYEsC0BbKAd+pYA1ieADQjg7hDABgRwdwhgJceGviWA9QlgJQK4mwSwEgHcTQI4k56B3yeA9QngTARwGQRwJgK4DAJY0MjQtwSwPgEsSACXRwALEsDlEcCCBHB5BDDT3KFvCWB9AphJAJdNADMJ4LIJILDkcM8ljvMQQEAA+QkgIID8BLDnLg19D2HMI4A9AqhFAHsEUEv5AC5t4E8RxDQCEEBpAhBAaQIIAnj5+dPFtvPGD5+efd19PTH0/gHIGpYABCCAygQggK33YXW9b3o7qH88evvga168/Ovg8+89/vd/Px8L4Ni6vWtHAbTaAXaJllcEEBBAfgIICCA/AQSWDOCYuQH06g3llgASE8BpAkhMAKcJILEqnwHa7fQEUGXoWwIICCA/AQQEkJ8AAgLIr0wAI2d9VgugVSUGAQQEkJ8AAgLITwCBSz8btOVUiMMEEBBAfgIICCC/MgG0sn0PuMexgfaFGAGUIIDDBFCEAA4TQBECOKxkAK3r6+vVD8DXj79ZZTtTh7ZiDAIQwI4AChLAKwJg9SCWjiHTcK5BAHsEUIsA9gigFgEELiEGAz+PAAICyE8AAQHkJ4DAO48enDw4v3/y9+7xuz++tej2R9b+86vfBDGBAAICyE8AAQHkJ4CAAPITQKAngNbcGNrfH11DANMIICCA/AQQEEB+AghMDaDVO8xLf4YQwDQCCAggPwEEBJCfAAJzAti3H8Stpf91KoBpBBAQQH4CCAggPwEE2gD++fnF7vnXP3rz4Ouff/nZott/+O2T3eN2sKMwBTCNAAICyE8AAQHkJ4DAkgHcf/b95O23nw8EcB4CCAggPwEEBJCfAAICyE8AAQHkJ4CAAPITQGBqAOckgPMQQEAA+QkgIID8BBAQQH4CCAggPwEEBJCfAAICyE8AAQHkJ4CAAPITQEAA+QkgIID8BBAQQH4CCAggPwEEjt05/bX7D9belXu//PTdbrCjO7q7Z9g0AggIID8BBASQnwACAshPAAEB5CeAgADyE0BAAPkJYMCHH3+x+kFrA2A5AhgggDwEMEAAeQhgQE8AvQPbG5MAzkMAAwSQhwAGCCAPAQwQQB4CGCCAPAQwQAB5CGCAAPIQwAAB5CGAAQLIQwADBJCHAAYIIA8BDBBAHgIYIIA8BDBAAHkIYIAA8hDAAAHkIYABAshDAAMEkIcABgggDwEMEEAeAhgggDwEMEAAeQhggADyEMAAAeQhgAECyEMAA6KL097qvUhtz1pT1mMaAQwQQB4CGCCAPATQqXdQb0UDO3WtU+sxTgCdBJCTADoJICcBdBJATgLoJICcBNBJADkJoJMAcvoPMZqP6kFKAucAAAAASUVORK5CYII=`;
const ExtensionUI = () => {
  const [characterName, setCharacterName] = useState("Noun");
  const [walletAddress, setWalletAddress] = useState("");
  const [characterImage, setCharacterImage] = useState(nounImage);
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
    if (msg?.name) {
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
        hikari.xyz
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
          style={{ marginRight: 10, textDecoration: "none", color: "unset" }}
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
            chrome.runtime.sendMessage({ landAPetByDefault: e.target.checked });
            setLandAPetByDefault(e.target.checked);
          }}
        />
        <span style={{ marginRight: 16 }}>Land a pet by default</span>
      </div>
    </div>
  );
};

export default ExtensionUI;
