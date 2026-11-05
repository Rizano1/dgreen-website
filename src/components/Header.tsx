"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoMark, Wordmark } from "./brand/Logo";
import { CONTACT } from "@/data/site";

type Tone = "on-dark" | "on-light" | "on-dark-solid";

// Hero zoom runs for 170% of the viewport; past ~30% of it the gate has opened onto cream.
const LIGHT_AFTER = 1.7 * 0.3;

export function Header() {
  const [tone, setTone] = useState<Tone>("on-dark");

  const update = useCallback(() => {
    const visit = document.getElementById("visit");
    // the contact section is shorter than the screen, so switch once it fills most of it
    if (visit && visit.getBoundingClientRect().top < innerHeight * 0.4) setTone("on-dark-solid");
    else setTone(scrollY > innerHeight * LIGHT_AFTER ? "on-light" : "on-dark");
  }, []);

  // a restored scroll position also fires "scroll", so no initial call is needed
  useEffect(() => {
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, [update]);

  return (
    <header className={`site-header ${tone}`}>
      <a href="#top" className="brand" aria-label="D'Green home">
        <LogoMark className="brand-mark" />
        <Wordmark className="brand-name" />
      </a>
      <nav className="site-nav">
        <a href="#menu">Menu</a>
        <a href="#visit">Visit</a>
        <a className="nav-cta" href={CONTACT.whatsapp} target="_blank" rel="noopener">
          Reserve
        </a>
      </nav>
    </header>
  );
}
