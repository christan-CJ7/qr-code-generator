
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import "./App.css";

const DEFAULT_SETTINGS = {
  foreground: "#000000",
  background: "#FFFFFF",
  size: 300,
  margin: 2,
  errorCorrection: "H",
};


function getColorName(hex) {
  const colors = {
    "#111827": "Dark Navy",
    "#FFFFFF": "White",
    "#000000": "Black",
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#800080": "Purple",
  };

  return colors[hex.toUpperCase()] || hex.toUpperCase();
}

function App() {
  const [text, setText] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("qrHistory") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("qrHistory", JSON.stringify(history));
  }, [history]);

  const updateSetting = (name, value) => {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const generateQR = async (
    value = text,
    customSettings = settings
  ) => {
    const cleanText = value.trim();

    if (!cleanText) {
      setError("Please enter text or a URL first.");
      setQrImage("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const image = await QRCode.toDataURL(cleanText, {
        width: Number(customSettings.size),
        margin: Number(customSettings.margin),
        errorCorrectionLevel: customSettings.errorCorrection,
        color: {
          dark: customSettings.foreground,
          light: customSettings.background,
        },
      });

      setQrImage(image);

      setHistory((previous) => {
        const newEntry = {
          id: Date.now(),
          text: cleanText,
          image,
          settings: { ...customSettings },
          createdAt: new Date().toLocaleString(),
        };

        return [
          newEntry,
          ...previous.filter((item) => item.text !== cleanText),
        ].slice(0, 10);
      });
    } catch (err) {
      console.error(err);
      setError(
        "Could not generate the QR code. Please check your input and settings."
      );
      setQrImage("");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrImage) {
      setError("Generate a QR code before downloading.");
      return;
    }

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = "my-qr-code.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const loadHistoryItem = (item) => {
    setText(item.text);
    setSettings(item.settings || DEFAULT_SETTINGS);
    setQrImage(item.image);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteHistoryItem = (id) => {
    setHistory((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your QR history?")) {
      setHistory([]);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">CJ</div>
          <span>CJ7</span>
        </div>
        <span className="header-label">Free QR Code Generator</span>
      </header>

      <main className="main">
        <section className="hero">
          <span className="eyebrow">SIMPLE · FAST · FREE</span>

          <h1>
            Create your own
            <span> QR code.</span>
          </h1>

          <p>
            Turn links, text, and other information into a QR code
            you can download and share.
          </p>
        </section>

        <section className="workspace">
          <div className="panel input-panel">
            <div className="panel-heading">
              <div>
                <span className="step">STEP 01</span>
                <h2>Enter your content</h2>
              </div>
              <span className="heading-icon">✎</span>
            </div>

            <label htmlFor="qrText">Text or URL</label>

            <textarea
              id="qrText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com or enter any text..."
              rows={4}
            />

            <div className="settings-heading">
              <span className="step">STEP 02</span>
              <h2>Customize your QR code</h2>
            </div>

            <div className="settings-grid">
              <div className="setting">
                <label htmlFor="foreground">QR color</label>
                <div className="color-control">
                  <input
                    id="foreground"
                    type="color"
                    value={settings.foreground}
                    onChange={(e) =>
                      updateSetting("foreground", e.target.value)
                    }
                  />
                  <span>{getColorName(settings.foreground)}</span>
                </div>
              </div>

              <div className="setting">
                <label htmlFor="background">Background color</label>
                <div className="color-control">
                  <input
                    id="background"
                    type="color"
                    value={settings.background}
                    onChange={(e) =>
                      updateSetting("background", e.target.value)
                    }
                  />
                  <span>{getColorName(settings.background)}</span>
                </div>
              </div>

              <div className="setting full-width">
                <div className="label-row">
                  <label htmlFor="size">QR code size</label>
                  <span>{settings.size}px</span>
                </div>

                <input
                  id="size"
                  className="range-input"
                  type="range"
                  min="150"
                  max="500"
                  step="50"
                  value={settings.size}
                  onChange={(e) =>
                    updateSetting("size", Number(e.target.value))
                  }
                />
              </div>

              <div className="setting">
                <label htmlFor="margin">Quiet zone</label>
                <select
                  id="margin"
                  value={settings.margin}
                  onChange={(e) =>
                    updateSetting("margin", Number(e.target.value))
                  }
                >
                  <option value={0}>None</option>
                  <option value={1}>Small</option>
                  <option value={2}>Medium</option>
                  <option value={4}>Large</option>
                  <option value={6}>Extra large</option>
                </select>
              </div>

              <div className="setting">
                <label htmlFor="errorCorrection">
                  Error correction
                </label>
                <select
                  id="errorCorrection"
                  value={settings.errorCorrection}
                  onChange={(e) =>
                    updateSetting("errorCorrection", e.target.value)
                  }
                >
                  <option value="L">Low — 7%</option>
                  <option value="M">Medium — 15%</option>
                  <option value="Q">Quartile — 25%</option>
                  <option value="H">High — 30%</option>
                </select>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              className="primary-button"
              onClick={() => generateQR()}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate QR Code"}
              {!loading && <span>↗</span>}
            </button>
          </div>

          <div className="panel preview-panel">
            <div className="panel-heading">
              <div>
                <span className="step">STEP 03</span>
                <h2>Your QR code</h2>
              </div>
              <span className="status-dot">
                {qrImage ? "Ready" : "Waiting"}
              </span>
            </div>

            <div className="qr-preview">
              {qrImage ? (
                <img
                  className="qr-image"
                  src={qrImage}
                  alt="Generated QR code"
                />
              ) : (
                <div className="empty-preview">
                  <div className="empty-qr">▦</div>
                  <h3>Your QR code appears here</h3>
                  <p>Enter your content and click Generate QR Code.</p>
                </div>
              )}
            </div>

            <div className="preview-info">
              <span>FORMAT</span>
              <strong>PNG Image</strong>
              <span>SIZE</span>
              <strong>{settings.size} × {settings.size}px</strong>
            </div>

            <button
              className="download-button"
              onClick={downloadQR}
              disabled={!qrImage}
            >
              <span>↓</span> Download PNG
            </button>

            <p className="privacy-note">
              Your QR history is saved in this browser.
            </p>
          </div>
        </section>

        
        <div className="location-section">
          <h2>Generate Location QR</h2>
          <p>
            Enter a place name to create a QR code that opens Google Maps.
          </p>

          <input
            className="location-input"
            type="text"
            placeholder="Enter a location, e.g. Coimbatore Railway Station"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button
            className="primary-button"
            onClick={() => {
            const place = location.trim();

      if (!place) {
        setError("Please enter a location.");
        return;
      }

      const mapsUrl =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(place);

      setText(mapsUrl);
      generateQR(mapsUrl);
    }}
    >
    Generate Location QR
    </button>
  </div>

        <section className="history-section">
          <div className="history-heading">
            <div>
              <span className="step">YOUR RECENT CODES</span>
              <h2>QR history</h2>
            </div>

            {history.length > 0 && (
              <button className="clear-button" onClick={clearHistory}>
                Clear history
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="history-empty">
              Your generated QR codes will appear here.
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-item" key={item.id}>
                  <img
                    className="history-image"
                    src={item.image}
                    alt="QR code thumbnail"
                  />

                  <div className="history-details">
                    <strong>{item.text}</strong>
                    <span>{item.createdAt}</span>
                  </div>

                  <button
                    className="history-action"
                    onClick={() => loadHistoryItem(item)}
                  >
                    View
                  </button>

                  <button
                    className="history-delete"
                    onClick={() => deleteHistoryItem(item.id)}
                    aria-label="Delete QR code from history"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>CJ7</span>
        <span>QR Generator.Powered by VACK Technologies.</span>
      </footer>
    </div>
  );
}

export default App;