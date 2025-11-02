import React, { useEffect, useRef, useState } from "react";
import "../styles/slideshow.css"; 

export default function Slideshow({ items = [], autoplayDelay = 4000 }) {
  const count = items.length;
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startAutoplay();
    function onKey(e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      stopAutoplay();
      window.removeEventListener("keydown", onKey);
    };
  }, [index, count]);

  function startAutoplay() {
    stopAutoplay();
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, autoplayDelay);
  }
  function stopAutoplay() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  function next() {
    setIndex((i) => (i + 1) % Math.max(1, count));
  }
  function prev() {
    setIndex((i) => (i - 1 + count) % Math.max(1, count));
  }
  function goTo(i) {
    setIndex(i % Math.max(1, count));
  }

  if (count === 0) {
    return (
      <div className="slideshow-wrapper">
        <div className="slideshow-empty">No items for slideshow</div>
      </div>
    );
  }

  return (
    <div
      className="slideshow-wrapper vertical-slideshow"
      onMouseEnter={() => stopAutoplay()}
      onMouseLeave={() => startAutoplay()}
      aria-roledescription="carousel"
    >
      <div className="slideshow">
        {items.map((it, i) => {
          const isVisible = i === index;
          return (
            <div
              key={i}
              className={`slide-card ${isVisible ? "visible" : ""}`}
              aria-hidden={!isVisible}
            >
              <a
                href={it.href || "#"}
                target={it.target || "_blank"}
                rel={it.target === "_blank" ? "noopener noreferrer" : undefined}
                className="resource-card slide-resource-card vertical"
              >
                <div className="resource-image">
                  <img src={it.img} alt={it.title || "Resource"} />
                </div>

                <div className="resource-body">
                  {it.title && <h3 className="resource-title">{it.title}</h3>}
                  {it.subtitle && <p className="resource-desc">{it.subtitle}</p>}
                </div>
              </a>
            </div>
          );
        })}

        <div className="controls">
          <button
            className="btn prev"
            onClick={() => {
              prev();
              startAutoplay();
            }}
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button
            className="btn next"
            onClick={() => {
              next();
              startAutoplay();
            }}
            aria-label="Next slide"
          >
            ❯
          </button>
        </div>
      </div>

      <div className="slideshow-footer">
        <div className="indicators" role="tablist" aria-label="Slide indicators">
          {items.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => {
                goTo(i);
                startAutoplay();
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="legend">
          {index + 1} / {count}
        </div>
      </div>
    </div>
  );
}
