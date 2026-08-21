"use client";

import React, { useState } from "react";

type Plan = {
  name: string;
  price: number;
  description: string;
  featured?: boolean;
  metrics: {
    label: string;
    value: string;
  }[];
  extraMetrics: {
    label: string;
    value: string;
  }[];
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: 29,
    description: "Simple and powerful",
    metrics: [
      { label: "Monthly Orders", value: "500" },
      { label: "Transaction Fee", value: "2.9%" },
      { label: "Staff Accounts", value: "2" },
      { label: "Storage", value: "10 GB" },
      { label: "Custom Domains", value: "1" },
    ],
    extraMetrics: [
      { label: "Support", value: "Email" },
      { label: "Analytics", value: "Basic" },
    ],
  },
  {
    name: "Professional",
    price: 79,
    description: "Built for ambitious brands",
    featured: true,
    metrics: [
      { label: "Monthly Orders", value: "5,000" },
      { label: "Transaction Fee", value: "1.9%" },
      { label: "Staff Accounts", value: "10" },
      { label: "Storage", value: "100 GB" },
      { label: "Custom Domains", value: "3" },
    ],
    extraMetrics: [
      { label: "Support", value: "Priority chat" },
      { label: "Analytics", value: "Advanced" },
    ],
  },
  {
    name: "Expert",
    price: 199,
    description: "Maximum power and flexibility",
    metrics: [
      { label: "Monthly Orders", value: "Unlimited" },
      { label: "Transaction Fee", value: "0.9%" },
      { label: "Staff Accounts", value: "Unlimited" },
      { label: "Storage", value: "1 TB" },
      { label: "Custom Domains", value: "10" },
    ],
    extraMetrics: [
      { label: "Support", value: "Dedicated manager" },
      { label: "Analytics", value: "Real-time + API" },
    ],
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="lp-arrow-icon"
    >
      <path
        d="M5 12H19M14 7L19 12L14 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`lp-chevron ${open ? "is-open" : ""}`}
    >
      <path
        d="M6.5 8L10 11.5L13.5 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PricingCard({
  plan,
  index,
  onChoose,
}: {
  plan: Plan;
  index: number;
  onChoose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`lp-card-shell ${plan.featured ? "is-featured" : ""}`}
      style={
        {
          "--card-delay": `${index * 130}ms`,
          "--orbit-delay": `${index * -1.8}s`,
        } as React.CSSProperties
      }
    >
      <div className="lp-edge-light" />

      <div className="lp-card">
        <div className="lp-card-glow" />

        {plan.featured && (
          <div className="lp-popular-label">
            <span className="lp-popular-dot" />
            Most popular
          </div>
        )}

        <header className="lp-card-header">
          <p className="lp-plan-name">{plan.name}</p>

          <div className="lp-price-row">
            <span className="lp-price">${plan.price}</span>
            <span className="lp-month">/ month</span>
          </div>

          <p className="lp-plan-description">{plan.description}</p>

          <button
            type="button"
            className={`lp-choose-button ${
              plan.featured ? "is-featured" : ""
            }`}
            onClick={onChoose}
          >
            <span>Choose {plan.name} Plan</span>
            <ArrowIcon />
          </button>
        </header>

        <div className="lp-divider" />

        <div className="lp-details">
          <p className="lp-details-title">Get started today:</p>

          <div className="lp-metrics">
            {plan.metrics.map((metric) => (
              <div className="lp-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>

          <div
            className={`lp-extra-metrics ${
              expanded ? "is-visible" : ""
            }`}
          >
            <div className="lp-extra-inner">
              {plan.extraMetrics.map((metric) => (
                <div className="lp-metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="lp-view-more"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <span>{expanded ? "View less" : "View more"}</span>
          <ChevronIcon open={expanded} />
        </button>
      </div>
    </article>
  );
}

export default function LuminousPricingSection({
  onChoosePlan,
}: {
  onChoosePlan?: (planName: string) => void;
}) {
  return (
    <section className="lp-root">
      <style>{CSS}</style>

      <video
        className="lp-background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source
          src="https://videos.pexels.com/video-files/34645139/14683903_3840_2160_30fps.mp4"
          type="video/mp4"
        />
      </video>

      <div className="lp-video-overlay" />
      <div className="lp-background-glow" />
      <div className="lp-stars" />
      <div className="lp-floor-grid" />
      <div className="lp-floor-fade" />
      <div className="lp-vignette" />

      <div className="lp-content">
        <div className="lp-cards">
          {plans.map((plan, index) => (
            <PricingCard
              plan={plan}
              index={index}
              key={plan.name}
              onChoose={() => onChoosePlan?.(plan.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

.lp-root * {
  box-sizing: border-box;
}

.lp-root {
  --background: #02020e;
  --card-background: rgba(15, 15, 36, 0.88);
  --card-border: rgba(118, 128, 255, 0.16);
  --primary: #6469ff;
  --text: #f0f1ff;
  --muted: rgba(208, 210, 236, 0.53);

  position: relative;
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 70px 34px;
  display: grid;
  place-items: center;
  overflow: hidden;
  isolation: isolate;
  color: var(--text);
  background: var(--background);
  border-radius: 0;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ─────────────────────────────────────
   BACKGROUND VIDEO
───────────────────────────────────── */

.lp-background-video {
  position: absolute;
  z-index: -10;
  inset: -5%;
  width: 110%;
  height: 110%;
  object-fit: cover;
  object-position: center;
  opacity: 0.33;
  filter:
    brightness(0.52)
    contrast(1.12)
    saturate(1.15)
    hue-rotate(8deg);
  transform: scale(1.04);
}

.lp-video-overlay {
  position: absolute;
  z-index: -9;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      rgba(2, 2, 15, 0.74) 0%,
      rgba(2, 2, 15, 0.25) 44%,
      rgba(2, 2, 15, 0.58) 100%
    ),
    linear-gradient(
      90deg,
      rgba(2, 2, 15, 0.86) 0%,
      transparent 23%,
      transparent 77%,
      rgba(2, 2, 15, 0.86) 100%
    );
}

.lp-background-glow {
  position: absolute;
  z-index: -8;
  top: 2%;
  left: 50%;
  width: min(900px, 90vw);
  height: 540px;
  pointer-events: none;
  transform: translateX(-50%);
  background:
    radial-gradient(
      ellipse at center,
      rgba(66, 70, 255, 0.14) 0%,
      rgba(58, 62, 223, 0.055) 36%,
      transparent 70%
    );
  filter: blur(18px);
}

.lp-stars {
  position: absolute;
  z-index: -7;
  inset: 0;
  opacity: 0.65;
  pointer-events: none;
  background-image:
    radial-gradient(
      circle,
      rgba(153, 190, 255, 0.95) 0,
      rgba(153, 190, 255, 0.95) 1px,
      transparent 1.7px
    ),
    radial-gradient(
      circle,
      rgba(89, 103, 255, 0.8) 0,
      rgba(89, 103, 255, 0.8) 1.2px,
      transparent 2px
    );
  background-size: 137px 137px, 211px 211px;
  background-position: 19px 14px, 83px 65px;
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 60%,
    transparent 96%
  );
  animation: lp-stars-drift 28s linear infinite;
}

.lp-floor-grid {
  position: absolute;
  z-index: -6;
  left: -20%;
  right: -20%;
  bottom: -37%;
  height: 68%;
  pointer-events: none;
  transform-origin: center top;
  transform: perspective(510px) rotateX(65deg);
  background:
    repeating-linear-gradient(
      90deg,
      rgba(94, 103, 255, 0.2) 0,
      rgba(94, 103, 255, 0.2) 1px,
      transparent 1px,
      transparent 74px
    ),
    repeating-linear-gradient(
      180deg,
      rgba(94, 103, 255, 0.2) 0,
      rgba(94, 103, 255, 0.2) 1px,
      transparent 1px,
      transparent 54px
    );
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    rgba(0, 0, 0, 0.9) 48%,
    transparent 96%
  );
  animation: lp-grid-move 9s linear infinite;
}

.lp-floor-fade {
  position: absolute;
  z-index: -5;
  left: 0;
  right: 0;
  bottom: 0;
  height: 38%;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at 50% 100%,
      rgba(75, 80, 255, 0.14),
      transparent 64%
    ),
    linear-gradient(
      to bottom,
      transparent,
      rgba(2, 2, 15, 0.8)
    );
}

.lp-vignette {
  position: absolute;
  z-index: 5;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 180px rgba(0, 0, 16, 0.88),
    inset 0 -100px 120px rgba(0, 0, 12, 0.72);
}

/* ─────────────────────────────────────
   CARDS LAYOUT
───────────────────────────────────── */

.lp-content {
  position: relative;
  z-index: 10;
  width: min(1180px, 100%);
}

.lp-cards {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 22px;
}

/* ─────────────────────────────────────
   CARD OUTER SHELL
───────────────────────────────────── */

.lp-card-shell {
  --card-radius: 19px;

  position: relative;
  min-width: 0;
  padding: 1px;
  overflow: hidden;
  border-radius: var(--card-radius);
  background: rgba(103, 111, 255, 0.18);
  box-shadow:
    0 30px 70px rgba(0, 0, 18, 0.46),
    0 0 0 1px rgba(115, 123, 255, 0.04);
  animation:
    lp-card-reveal
    900ms
    var(--card-delay)
    cubic-bezier(0.2, 0.8, 0.2, 1)
    both;
  transition:
    transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 380ms ease;
}

.lp-card-shell:hover {
  transform: translateY(-9px);
  box-shadow:
    0 38px 90px rgba(0, 0, 22, 0.62),
    0 0 35px rgba(79, 84, 255, 0.1);
}

.lp-card-shell.is-featured {
  transform: translateY(-16px);
  background: rgba(112, 120, 255, 0.34);
  box-shadow:
    0 38px 95px rgba(0, 0, 24, 0.68),
    0 0 0 1px rgba(109, 116, 255, 0.18),
    0 0 38px rgba(77, 83, 255, 0.18);
}

.lp-card-shell.is-featured:hover {
  transform: translateY(-25px);
}

.lp-edge-light {
  position: absolute;
  z-index: 0;
  left: 50%;
  top: 50%;
  width: 180%;
  aspect-ratio: 1;
  pointer-events: none;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 255deg,
    rgba(62, 67, 255, 0.08) 280deg,
    #4e55ff 304deg,
    #b9c4ff 316deg,
    #6670ff 328deg,
    transparent 352deg,
    transparent 360deg
  );
  filter:
    blur(1px)
    drop-shadow(0 0 9px rgba(76, 83, 255, 0.95))
    drop-shadow(0 0 24px rgba(76, 83, 255, 0.52));
  animation:
    lp-edge-orbit 5.8s var(--orbit-delay) linear infinite;
}

.lp-card-shell.is-featured .lp-edge-light {
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 230deg,
    rgba(70, 75, 255, 0.13) 268deg,
    #454bff 294deg,
    #eef1ff 309deg,
    #6471ff 325deg,
    transparent 354deg,
    transparent 360deg
  );
  filter:
    blur(1px)
    drop-shadow(0 0 12px rgba(86, 92, 255, 1))
    drop-shadow(0 0 34px rgba(86, 92, 255, 0.7));
  animation-duration: 4.8s;
}

/* ─────────────────────────────────────
   CARD INTERIOR
───────────────────────────────────── */

.lp-card {
  position: relative;
  z-index: 1;
  min-height: 555px;
  padding: 34px 30px 24px;
  overflow: hidden;
  border-radius: calc(var(--card-radius) - 1px);
  background:
    linear-gradient(
      145deg,
      rgba(25, 25, 53, 0.94) 0%,
      rgba(13, 13, 32, 0.95) 58%,
      rgba(9, 9, 25, 0.98) 100%
    );
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.lp-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      110deg,
      rgba(255, 255, 255, 0.05),
      transparent 30%
    ),
    radial-gradient(
      circle at 89% 8%,
      rgba(103, 109, 255, 0.09),
      transparent 28%
    );
}

.lp-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.035),
    inset 0 -1px rgba(61, 66, 185, 0.08);
}

.lp-card-glow {
  position: absolute;
  top: -90px;
  right: -70px;
  width: 230px;
  height: 230px;
  pointer-events: none;
  border-radius: 50%;
  opacity: 0.5;
  background: rgba(75, 81, 255, 0.14);
  filter: blur(55px);
}

.lp-card-shell.is-featured .lp-card-glow {
  opacity: 0.9;
  background: rgba(75, 81, 255, 0.22);
}

.lp-popular-label {
  position: absolute;
  z-index: 3;
  top: 18px;
  right: 20px;
  height: 25px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(222, 225, 255, 0.83);
  border: 1px solid rgba(103, 110, 255, 0.22);
  border-radius: 999px;
  background: rgba(76, 82, 255, 0.09);
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.lp-popular-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #7f84ff;
  box-shadow:
    0 0 7px #7f84ff,
    0 0 15px rgba(127, 132, 255, 0.8);
}

.lp-card-header {
  position: relative;
  z-index: 2;
}

.lp-plan-name {
  margin: 0;
  color: #787dff;
  font-size: 14px;
  font-weight: 500;
}

.lp-price-row {
  margin-top: 25px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.lp-price {
  color: #eef0ff;
  font-size: clamp(40px, 3.2vw, 48px);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.055em;
}

.lp-month {
  padding-bottom: 4px;
  color: rgba(202, 204, 232, 0.42);
  font-size: 12px;
}

.lp-plan-description {
  margin: 24px 0 0;
  color: rgba(220, 221, 241, 0.76);
  font-size: 13px;
  line-height: 1.5;
}

.lp-choose-button {
  position: relative;
  width: 100%;
  height: 47px;
  margin-top: 30px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  overflow: hidden;
  color: rgba(239, 240, 255, 0.9);
  border: 1px solid rgba(103, 110, 255, 0.25);
  border-radius: 12px;
  background:
    linear-gradient(
      90deg,
      rgba(42, 43, 85, 0.38),
      rgba(35, 36, 75, 0.28)
    );
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition:
    transform 280ms ease,
    border-color 280ms ease,
    background 280ms ease,
    box-shadow 280ms ease;
}

.lp-choose-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      105deg,
      transparent 18%,
      rgba(255, 255, 255, 0.12) 48%,
      transparent 75%
    );
  transform: translateX(-130%);
  transition: transform 650ms ease;
}

.lp-choose-button > * {
  position: relative;
  z-index: 1;
}

.lp-choose-button:hover {
  transform: translateY(-2px);
  border-color: rgba(117, 123, 255, 0.52);
  background: rgba(61, 64, 132, 0.34);
  box-shadow: 0 8px 25px rgba(30, 31, 105, 0.28);
}

.lp-choose-button:hover::before {
  transform: translateX(130%);
}

.lp-choose-button.is-featured {
  color: white;
  border-color: rgba(124, 130, 255, 0.74);
  background:
    linear-gradient(
      100deg,
      #5056ed 0%,
      #7075ff 50%,
      #4f55ef 100%
    );
  box-shadow:
    0 0 10px rgba(92, 98, 255, 0.75),
    0 0 28px rgba(76, 82, 255, 0.5),
    0 10px 25px rgba(34, 37, 135, 0.38),
    inset 0 1px rgba(255, 255, 255, 0.2);
}

.lp-choose-button.is-featured:hover {
  box-shadow:
    0 0 14px rgba(102, 108, 255, 0.9),
    0 0 38px rgba(79, 85, 255, 0.66),
    0 13px 32px rgba(34, 37, 135, 0.5),
    inset 0 1px rgba(255, 255, 255, 0.24);
}

.lp-arrow-icon {
  width: 20px;
  height: 20px;
  transition: transform 250ms ease;
}

.lp-choose-button:hover .lp-arrow-icon {
  transform: translateX(4px);
}

.lp-divider {
  position: relative;
  z-index: 2;
  height: 1px;
  margin: 34px -30px 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(101, 107, 207, 0.12) 15%,
    rgba(101, 107, 207, 0.12) 85%,
    transparent
  );
}

.lp-details {
  position: relative;
  z-index: 2;
  padding-top: 28px;
}

.lp-details-title {
  margin: 0 0 22px;
  color: rgba(206, 208, 235, 0.58);
  font-size: 12px;
}

.lp-metrics {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.lp-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  color: rgba(184, 186, 218, 0.46);
  font-size: 12px;
}

.lp-metric strong {
  color: rgba(241, 242, 255, 0.88);
  font-size: 13px;
  font-weight: 500;
  text-align: right;
}

.lp-extra-metrics {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 350ms ease,
    opacity 300ms ease,
    margin-top 350ms ease;
}

.lp-extra-metrics.is-visible {
  grid-template-rows: 1fr;
  margin-top: 17px;
  opacity: 1;
}

.lp-extra-inner {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 17px;
  overflow: hidden;
}

.lp-view-more {
  position: relative;
  z-index: 3;
  width: 100%;
  margin-top: 25px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(238, 239, 255, 0.84);
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.lp-view-more:hover {
  color: white;
}

.lp-chevron {
  width: 16px;
  height: 16px;
  transition: transform 250ms ease;
}

.lp-chevron.is-open {
  transform: rotate(180deg);
}

@keyframes lp-edge-orbit {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes lp-card-reveal {
  from {
    opacity: 0;
    transform: translateY(38px) scale(0.975);
    filter: blur(7px);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes lp-stars-drift {
  from {
    background-position: 19px 14px, 83px 65px;
  }

  to {
    background-position: 156px 151px, -128px 276px;
  }
}

@keyframes lp-grid-move {
  from {
    background-position: 0 0, 0 0;
  }

  to {
    background-position: 74px 0, 0 54px;
  }
}

@media (max-width: 1040px) {
  .lp-root {
    padding: 80px 28px;
  }

  .lp-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }

  .lp-card-shell.is-featured {
    transform: none;
  }

  .lp-card-shell.is-featured:hover {
    transform: translateY(-9px);
  }

  .lp-card-shell:last-child {
    grid-column: 1 / -1;
    width: min(500px, 100%);
    justify-self: center;
  }
}

@media (max-width: 720px) {
  .lp-root {
    min-height: 100vh;
    min-height: 100dvh;
    padding: 60px 18px;
  }

  .lp-cards {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .lp-card-shell,
  .lp-card-shell:last-child {
    width: min(460px, 100%);
    grid-column: auto;
    justify-self: center;
  }

  .lp-card {
    min-height: auto;
  }

  .lp-floor-grid {
    bottom: -14%;
    height: 35%;
  }
}

@media (max-width: 420px) {
  .lp-card {
    padding: 29px 22px 22px;
  }

  .lp-divider {
    margin-left: -22px;
    margin-right: -22px;
  }

  .lp-popular-label {
    display: none;
  }

  .lp-price {
    font-size: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lp-edge-light,
  .lp-stars,
  .lp-floor-grid,
  .lp-card-shell {
    animation: none !important;
  }

  .lp-card-shell,
  .lp-card-shell.is-featured {
    transform: none;
  }

  .lp-root *,
  .lp-root *::before,
  .lp-root *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
`;
