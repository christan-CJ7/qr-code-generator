
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import "./App.css";

const HISTORY_KEY = "qr-generator-history";
const MAX_HISTORY = 10;

const defaultSettings = {
  text: "",
  foreground: "#111827",
  background: "#ffffff",
  size: 300,
  margin: 4,
  errorCorrection: "H",
};

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function makeQrImage(text, settings, logo) {
  const options = {
    width: Number(settings.size),
    margin: Number(settings.margin),
    errorCorrectionLevel: settings.errorCorrection,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
  };

  const qrDataUrl = await QRCode.toDataURL(text, options);

  if (!logo) return qrDataUrl;

  const qrImage = await loadImage(qrDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = qrImage.naturalWidth;
  canvas.height = qrImage.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(qrImage, 0, 0);

  const logoImage = await loadImage(logo);
  const logoSize = canvas.width * 0.19;
  const padding = canvas.width * 0.025;
  const cardSize = logoSize + padding * 2;
  const x = (canvas.width - cardSize) / 2;
  const y = (canvas.height - cardSize) / 2;

  // White backing helps separate the logo from QR modules.
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x, y, cardSize, cardSize, canvas.width * 0.025);
  ctx.fill();

  const scale = Math.min(
    logoSize / logoImage.naturalWidth,
    logoSize / logoImage.naturalHeight
  );
  const width = logoImage.naturalWidth * scale;
  const height = logoImage.naturalHeight * scale;

  ctx.drawImage(
    logoImage,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height
  );

  return canvas.toDataURL("image/png");
}


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

export default function App() {
  const [settings, setSettings] = useState(defaultSettings);
  const [logo, setLogo] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [history, setHistory] = useState(readHistory);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      setError("Browser storage is full. Clear some QR history and try again.");
    }
  }, [history]);

  function updateSetting(name, value) {
    setSettings((current) => ({ ...current, [name]: value }));
  }

  async function generateQr(text = settings.text, restoreSettings = null) {
    const cleanText = text.trim();

    if (!cleanText) {
      setError("Enter some text or a URL first.");
      return;
    }

    setError("");
    setGenerating(true);

    const activeSettings = restoreSettings || settings;

    try {
      const image = await makeQrImage(cleanText, activeSettings, logo);
      setQrImage(image);

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: cleanText,
        foreground: activeSettings.foreground,
        background: activeSettings.background,
        size: Number(activeSettings.size),
        margin: Number(activeSettings.margin),
        errorCorrection: activeSettings.errorCorrection,
        createdAt: new Date().toISOString(),
      };

      setHistory((current) =>
        [entry, ...current.filter((item) => item.text !== cleanText)]
          .slice(0, MAX_HISTORY)
      );
    } catch {
      setError("Couldn't generate the QR code. Try different settings or a smaller logo.");
    } finally {
      setGenerating(false);
    }
  }

  function handleLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose a logo smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogo(String(reader.result));
      setError("");
    };
    reader.onerror = () => setError("Unable to read that image.");
    reader.readAsDataURL(file);
  }

  function restoreEntry(entry) {
    const restored = {
      text: entry.text,
      foreground: entry.foreground,
      background: entry.background,
      size: entry.size,
      margin: entry.margin,
      errorCorrection: entry.errorCorrection,
    };

    setSettings(restored);
    generateQr(entry.text, restored);
  }

  function downloadQr() {
    if (!qrImage) return;

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = "my-qr-code.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // The in-memory history is still cleared.
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="QR Studio home">
          <span className="brand-icon">▦</span>
          <span>QR Studio</span>
        </a>
        <span className="topbar-label">Free QR Code Generator</span>
      </header>

      <section className="hero">
        <span className="eyebrow">CREATE · CUSTOMIZE · SHARE</span>
        <h1>Your ideas, one scan away.</h1>
        <p>
          Create custom QR codes for links, text, and more.
          Add your brand and download in seconds.
        </p>
      </section>

      <section className="workspace">
        <div className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <h2>Create your QR code</h2>
              <p>Enter your content and make it yours.</p>
            </div>
            <span className="step-number">01</span>
          </div>

          <label className="field-label" htmlFor="qr-text">
            Text or website URL
          </label>
          <textarea
            id="qr-text"
            value={settings.text}
            onChange={(event) => updateSetting("text", event.target.value)}
            placeholder="https://yourwebsite.com"
            rows={3}
          />

          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="foreground">
                QR color
              </label>
              <div className="color-control">
                <input
                  id="foreground"
                  type="color"
                  value={settings.foreground}
                  onChange={(event) =>
                    updateSetting("foreground", event.target.value)
                  }
                />
                <span>{getColorName(settings.foreground)}</span>
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="background">
                Background
              </label>
              <div className="color-control">
                <input
                  id="background"
                  type="color"
                  value={settings.background}
                  onChange={(event) =>
                    updateSetting("background", event.target.value)
                  }
                />
                <span>{getColorName(settings.background)}</span>
              </div>
            </div>
          </div>

          <div className="field">
            <div className="range-heading">
              <label className="field-label" htmlFor="size">
                QR code size
              </label>
              <span>{settings.size} px</span>
            </div>
            <input
              id="size"
              className="range-input"
              type="range"
              min="200"
              max="800"
              step="50"
              value={settings.size}
              onChange={(event) =>
                updateSetting("size", Number(event.target.value))
              }
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="margin">
                Quiet-zone margin
              </label>
              <select
                id="margin"
                value={settings.margin}
                onChange={(event) =>
                  updateSetting("margin", Number(event.target.value))
                }
              >
                <option value="1">Small</option>
                <option value="2">Medium</option>
                <option value="4">Standard</option>
                <option value="6">Large</option>
                <option value="8">Extra large</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="correction">
                Error correction
              </label>
              <select
                id="correction"
                value={settings.errorCorrection}
                onChange={(event) =>
                  updateSetting("errorCorrection", event.target.value)
                }
              >
                <option value="L">Low — 7%</option>
                <option value="M">Medium — 15%</option>
                <option value="Q">Quartile — 25%</option>
                <option value="H">High — 30%</option>
              </select>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Add a logo (optional)</span>
            <div className="logo-upload">
              {logo ? (
                <img className="logo-thumbnail" src={logo} alt="Uploaded logo" />
              ) : (
                <span className="upload-icon">＋</span>
              )}
              <div className="upload-copy">
                <strong>{logo ? "Logo selected" : "Upload your logo"}</strong>
                <span>PNG, JPG, or other image · up to 2 MB</span>
              </div>
              <button
                className="secondary-button"
                type="button"
                onClick={() => fileRef.current?.click()}
              >
                Browse
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogo}
              />
            </div>
            {logo && (
              <button
                className="text-button"
                type="button"
                onClick={() => setLogo("")}
              >
                Remove logo
              </button>
            )}
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}

          <button
            className="primary-button"
            type="button"
            onClick={() => generateQr()}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate QR code"} <span>↗</span>
          </button>
          <p className="privacy-note">Your QR content is processed in your browser.</p>
        </div>

        <aside className="panel preview-panel">
          <div className="panel-heading">
            <div>
              <h2>Your QR code</h2>
              <p>Preview and download your creation.</p>
            </div>
            <span className="step-number">02</span>
          </div>

          <div className="qr-preview">
            {qrImage ? (
              <img src={qrImage} alt="Generated QR code" />
            ) : (
              <div className="empty-qr">
                <span className="empty-qr-icon">▦</span>
                <strong>Your QR code goes here</strong>
                <span>Enter content and click Generate.</span>
              </div>
            )}
          </div>

          <div className="preview-meta">
            <span className={`status-dot ${qrImage ? "ready" : ""}`} />
            {qrImage ? "QR code ready" : "Waiting for content"}
          </div>

          <button
            className="primary-button download-button"
            type="button"
            onClick={downloadQr}
            disabled={!qrImage}
          >
            Download PNG <span>↓</span>
          </button>

          <p className="scan-tip">
            <span>✦</span> Tip: Test your QR code with your phone before sharing.
          </p>
        </aside>
      </section>

      <section className="history-section">
        <div className="history-heading">
          <div>
            <span className="eyebrow">YOUR RECENT CREATIONS</span>
            <h2>QR code history</h2>
            <p>Your last {MAX_HISTORY} QR codes are saved in this browser.</p>
          </div>
          {history.length > 0 && (
            <button className="text-button clear-button" onClick={clearHistory}>
              Clear history
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="history-empty">
            <span>◷</span>
            <p>Your generated QR codes will appear here.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <article className="history-item" key={entry.id}>
                <div className="history-symbol">▦</div>
                <div className="history-content">
                  <strong title={entry.text}>{entry.text}</strong>
                  <span>
                    {entry.size}px · {entry.errorCorrection} correction ·{" "}
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => restoreEntry(entry)}
                >
                  Restore
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>QR Studio</span>
        <span>Made for sharing ideas.</span>
      </footer>
    </main>
  );
}