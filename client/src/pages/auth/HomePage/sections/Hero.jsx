import { ArrowRight, ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    image:"https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=2000&q=85",
  },
  {
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=2000&q=85",
  },
  {
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2000&q=85",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section id="home" className="hero">
      <div
        className="hero__background"
        style={{ backgroundImage: `url(${slide.image})` }}
      />

      <button
        className="hero__arrow hero__arrow--left"
        onClick={() => setActive((active - 1 + slides.length) % slides.length)}
        aria-label="Slide trước"
      >
        <ChevronLeft />
      </button>

      <button
        className="hero__arrow hero__arrow--right"
        onClick={() => setActive((active + 1) % slides.length)}
        aria-label="Slide sau"
      >
        <ChevronRight />
      </button>
       <div className="hero__content">
        <div className="hero__dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={index === active ? "is-active" : ""}
              onClick={() => setActive(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
    
  );
}