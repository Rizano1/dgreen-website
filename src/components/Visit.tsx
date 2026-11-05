"use client";

import { useRef } from "react";
import { LogoMark } from "./brand/Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONTACT } from "@/data/site";

export function Visit() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".reveal", {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    },
    { scope: root },
  );

  return (
    <section className="visit" id="visit" ref={root}>
      <div className="visit-inner">
        <div className="visit-intro">
          <LogoMark className="visit-mark reveal" />
          <p className="eyebrow reveal">Visit us</p>
          <h2 className="reveal">
            A table is waiting
            <br />
            <em>under the leaves.</em>
          </h2>
          <p className="lede reveal">
            A new dining experience that brings you genuine happiness — savoury plates, slow coffee and fresh
            Selabintana air.
          </p>
          <div className="visit-actions reveal">
            <a className="btn btn-solid" href={CONTACT.whatsapp} target="_blank" rel="noopener">
              Reserve on WhatsApp
            </a>
            <a className="btn btn-ghost" href={CONTACT.maps} target="_blank" rel="noopener">
              Get directions
            </a>
          </div>
        </div>

        <div className="visit-cards reveal">
          <div className="card">
            <h3>Address</h3>
            <p>
              Jl. Selabintana No.54, Selabatu,
              <br />
              Kec. Cikole, Kota Sukabumi,
              <br />
              Jawa Barat 43114
            </p>
          </div>
          <div className="card">
            <h3>Hours</h3>
            <p>
              Monday – Sunday
              <br />
              11:00 – 22:00
            </p>
            <p className="muted">Last order 21:00</p>
          </div>
          <div className="card">
            <h3>Reservations</h3>
            <p>
              {CONTACT.phones.map((p, i) => (
                <span key={p.tel}>
                  {i > 0 && <br />}
                  <a href={`tel:${p.tel}`}>{p.label}</a>
                </span>
              ))}
            </p>
          </div>
          <div className="card">
            <h3>Follow</h3>
            <p>
              <a href={CONTACT.instagram} target="_blank" rel="noopener">
                {CONTACT.instagramHandle}
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <span>© 2026 D&apos;Green Resto &amp; Coffee</span>
        <span>Pause · Relax · Linger</span>
      </footer>
    </section>
  );
}
