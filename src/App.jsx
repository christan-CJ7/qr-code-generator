
import { useState } from "react";
import QRCode from "qrcode";
import "./App.css";

export default function App() {
  const [text, setText] = useState("");
  const [qr, setQr] = useState("");
  const [foreground, setForeground] = useState("#171717");
  const [background, setBackground] = useState("#ffffff");
  const [size, setSize] = useState(300);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateQR(event) {
    event.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Please enter some text or a URL.");
      setQr("");
      return;
    }

    setLoading(true);

    try {
      const image = await QRCode.toDataURL(text.trim(), {
        width: Number(size),
        margin: 3,
        color: {
          dark: foreground,
          light: background,
        },
        errorCorrectionLevel: "H",
      });

      setQr(image);
    } catch {
      setError("Could not generate QR code. Try shorter text.");
      setQr("");
    } finally {
      setLoading(false);
    }
  }

  function downloadQR() {
    if (!qr) return;

    const link = document.createElement("a");
    link.href = qr;
    link.download = "my-qr-code.png";
    link.click();
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand-icon">▦</div>
        <span>QuickQR</span>
      </header>

      <section className="hero">
        <p className="eyebrow">SIMPLE. FAST. FREE.</p>
        <h1>Create your own QR code.</h1>
        <p className="subtitle">
          Turn any text or link into a QR code in seconds.
          Customize it and download it instantly.
        </p>
      </section>

      <section className="workspace">
        <form className="panel" onSubmit={generateQR}>
          <h2>Create QR code</h2>
          <label htmlFor="qr-text">Text or URL</label>

          <textarea
            id="qr-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="https://example.com"
            rows={4}
            maxLength={2000}
          />

          <div className="character-count">
            {text.length}/2000 characters
          </div>

          <label htmlFor="qr-size">Image size</label>
          <select
            id="qr-size"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          >
            <option value={200}>Small — 200px</option>
            <option value={300}>Medium — 300px</option>
            <option value={500}>Large — 500px</option>
          </select>

          <div className="color-row">
            <div>
              <label htmlFor="foreground">QR color</label>
              <input
                id="foreground"
                type="color"
                value={foreground}
                onChange={(event) => setForeground(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="background">Background</label>
              <input
                id="background"
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
              />
            </div>
          </div>

          <button className="generate-btn" type="submit"
            disabled={loading}>
            {loading ? "Generating..." : "Generate QR code →"}
          </button>

          {error && <p className="error" role="alert">{error}</p>}
        </form>

        <section className="preview-panel">
          <h2>Your QR code</h2>

          <div className="qr-preview">
            {qr ? (
              <img src={qr} alt="Generated QR code" />
            ) : (
              <div className="placeholder">
                <span className="placeholder-icon">▦</span>
                <p>Your QR code will appear here</p>
                <small>Enter your text and click Generate.</small>
              </div>
            )}
          </div>

          {qr && (
            <>
              <p className="success">✓ QR code generated successfully</p>
              <button className="download-btn" onClick={downloadQR}>
                ↓ Download PNG
              </button>
            </>
          )}
        </section>
      </section>

      <footer>
        <p>QuickQR · Create and share with ease.</p>
      </footer>
    </main>
  );
}