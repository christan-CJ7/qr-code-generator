
import { useEffect, useState } from 'react';
import './intro.css';

const slides = [
  {
    number: '01',
    icon: '✦',
    title: 'Welcome to CJ7',
    description: 'Create QR codes in seconds. Simple, fast and smart.',
  },
  {
    number: '02',
    icon: '↗',
    title: 'Enter Your Text or URL',
    description: 'Add a website link, text, or any information you want to share.',
  },
  {
    number: '03',
    icon: '◈',
    title: 'Customize Your QR',
    description: 'Choose your colors, adjust the size and customize your QR code.',
  },
  {
    number: '04',
    icon: '▦',
    title: 'Generate and Download',
    description: 'Create your QR code and download it as a PNG image.',
  },
  {
    number: '05',
    icon: '⌖',
    title: 'Share a Location',
    description: 'Enter a place name and create a QR code that opens Google Maps.',
  },
  {
    number: '06',
    icon: '✓',
    title: 'Ready to Get Started?',
    description: 'Your QR codes and recent history are just a few clicks away.',
  },
];

export default function Intro() {
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('cj7-intro-completed') === 'true') {
      return;
    }

    setVisible(true);

    const startTime = Date.now();

    const slideTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setSlide(Math.min(Math.floor(elapsed / 5000), 5));
    }, 200);

    const finishTimer = setTimeout(() => {
      localStorage.setItem('cj7-intro-completed', 'true');
      setVisible(false);
    }, 30000);

    return () => {
      clearInterval(slideTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  function skipIntro() {
    localStorage.setItem('cj7-intro-completed', 'true');
    setVisible(false);
  }

  if (!visible) return null;

  const current = slides[slide];

  return (
    <div className="intro-overlay">
      <div className="intro-card">
        <div className="intro-top">
          <div className="intro-brand">
            <span className="intro-logo">CJ7</span>
            <span>QR Code Generator</span>
          </div>

          <button
            className="intro-skip"
            onClick={skipIntro}
          >
            Skip intro →
          </button>
        </div>

        <div className="intro-content" key={slide}>
          <div className="intro-symbol">{current.icon}</div>

          <div className="intro-counter">
            STEP {current.number} / 06
          </div>

          <h1>{current.title}</h1>
          <p>{current.description}</p>

          <div className="intro-qr" aria-hidden="true">
            <div className="intro-qr-inner">
              <span>▦</span>
              <span>▧</span>
              <span>▦</span>
              <span>▧</span>
              <span>▦</span>
              <span>▧</span>
              <span>▦</span>
              <span>▦</span>
              <span>▧</span>
            </div>
          </div>
        </div>

        <div className="intro-bottom">
          <div className="intro-dots">
            {slides.map((item, index) => (
              <span
                key={item.number}
                className={index === slide ? 'active' : ''}
              />
            ))}
          </div>

          <span className="intro-duration">
            {Math.max(0, 30 - Math.floor((slide * 5)))}s intro
          </span>
        </div>

        <div
          className="intro-progress"
          key="progress"
        >
          <div className="intro-progress-bar" />
        </div>
      </div>
    </div>
  );
}