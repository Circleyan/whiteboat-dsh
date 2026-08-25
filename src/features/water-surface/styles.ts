export const WATER_SURFACE_STYLES = String.raw`
.wb-dsh-water,
.wb-dsh-water-entry {
  /* Foundation tokens */
  --wb-f-color-paper: #f7f9f8;
  --wb-f-color-ink: #17201d;
  --wb-f-color-muted: #66736e;
  --wb-f-color-line: rgba(23, 32, 29, 0.12);
  --wb-f-color-line-strong: rgba(23, 32, 29, 0.24);
  --wb-f-color-glass: rgba(255, 255, 255, 0.72);
  --wb-f-color-glass-strong: rgba(255, 255, 255, 0.9);
  --wb-f-color-focus: #2e7865;
  --wb-f-color-brand-primary: #0f1115;
  --wb-f-color-error: #b43b47;
  --wb-f-color-success: #28765d;
  --wb-f-color-warn: #8b641c;
  --wb-f-color-link: #286f61;
  --wb-f-space-01: 0.125rem;
  --wb-f-space-02: 0.25rem;
  --wb-f-space-03: 0.5rem;
  --wb-f-space-04: 0.75rem;
  --wb-f-space-05: 1rem;
  --wb-f-space-06: 1.5rem;
  --wb-f-space-07: 2rem;
  --wb-f-space-08: 2.5rem;
  --wb-f-font-sans: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  --wb-f-font-reading: "Inclusive Sans", "Avenir Next", var(--wb-f-font-sans);
  --wb-f-font-size-body: 1rem;
  --wb-f-font-size-label: 0.8125rem;
  --wb-f-line-body: 1.5;
  --wb-f-weight-regular: 400;
  --wb-f-weight-medium: 520;
  --wb-f-radius-sm: 0.5rem;
  --wb-f-radius-md: 0.75rem;
  --wb-f-radius-lg: 1rem;
  --wb-f-radius-pill: 999px;
  --wb-f-border: 1px;
  --wb-f-duration-fast: 120ms;
  --wb-f-duration-medium: 260ms;
  --wb-f-duration-slow: 620ms;
  --wb-f-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --wb-f-ease-state: cubic-bezier(0.65, 0, 0.35, 1);

  /* Semantic tokens */
  --wb-color-background: var(--dsw-alias-bg-base, var(--wb-f-color-paper));
  --wb-color-layer-01: color-mix(in oklch, var(--wb-color-brand-primary) 3%, var(--dsw-alias-bg-layer-1, var(--wb-f-color-glass)));
  --wb-color-layer-02: color-mix(in oklch, var(--wb-color-brand-primary) 6%, var(--dsw-alias-bg-layer-2, var(--wb-f-color-glass-strong)));
  --wb-color-layer-03: color-mix(in oklch, var(--wb-color-brand-primary) 9%, var(--dsw-alias-bg-layer-3, var(--wb-f-color-paper)));
  --wb-color-text-primary: var(--dsw-alias-label-primary, var(--wb-f-color-ink));
  --wb-color-text-secondary: var(--dsw-alias-label-tertiary, var(--wb-f-color-muted));
  --wb-color-border-subtle: var(--dsw-alias-border-l2, var(--wb-f-color-line));
  --wb-color-border-strong: var(--dsw-alias-border-l3, var(--wb-f-color-line-strong));
  --wb-color-interactive: var(--dsw-alias-brand-primary, var(--wb-f-color-focus));
  --wb-color-focus: var(--dsw-alias-brand-primary, var(--wb-f-color-focus));
  --wb-color-support-error: var(--dsw-alias-state-error-primary, var(--wb-f-color-error));
  --wb-color-support-success: var(--wb-f-color-success);
  --wb-color-support-warning: var(--wb-f-color-warn);
  --wb-color-link: var(--wb-f-color-link);
  --wb-color-brand-primary: var(--dsw-alias-brand-primary, var(--wb-f-color-brand-primary));
  --wb-color-surface-elevation: color-mix(in srgb, var(--wb-color-background) 32%, transparent);
  --wb-color-brand-wake-strong: var(--wb-color-brand-primary);
  --wb-color-brand-wake-bright: color-mix(in oklch, var(--wb-color-brand-primary) 88%, var(--wb-color-background));
  --wb-color-brand-wake-middle: color-mix(in oklch, var(--wb-color-brand-primary) 76%, var(--wb-color-background));
  --wb-color-brand-wake-soft: color-mix(in oklch, var(--wb-color-brand-primary) 64%, var(--wb-color-background));
  --wb-color-brand-wake-tail: color-mix(in oklch, var(--wb-color-brand-primary) 52%, var(--wb-color-background));
  --wb-space-inline: var(--wb-f-space-05);
  --wb-space-stack: var(--wb-f-space-04);
  --wb-type-body-size: var(--wb-f-font-size-body);
  --wb-type-body-line: var(--wb-f-line-body);
  --wb-type-label-size: var(--wb-f-font-size-label);
  --wb-touch-target: 2.75rem;

  /* Component tokens */
  --wb-surface-height: var(--wb-dsh-viewport-height, 100dvh);
  --wb-surface-pad-top: max(var(--wb-f-space-05), env(safe-area-inset-top));
  --wb-surface-pad-right: max(var(--wb-f-space-05), env(safe-area-inset-right));
  --wb-surface-pad-bottom: max(var(--wb-f-space-05), env(safe-area-inset-bottom));
  --wb-surface-pad-left: max(var(--wb-f-space-05), env(safe-area-inset-left));
  --wb-composer-width: min(25rem, calc(100vw - (var(--wb-space-inline) * 2)));
  --wb-composer-height: 14rem;
  --wb-composer-title-height: 3.5rem;
  --wb-composer-radius: var(--wb-f-radius-lg);
  --wb-composer-inner-radius: calc(var(--wb-composer-radius) - var(--wb-f-space-03));
  --wb-composer-surface-shadow: 0 0.25rem 0.5rem var(--wb-color-surface-elevation);
  --wb-composer-focus-ring: 0 0 0 0.1875rem color-mix(in srgb, var(--wb-color-focus) 34%, transparent);
  --wb-composer-duration-enter: 420ms;
  --wb-composer-duration-exit: 320ms;
  --wb-composer-ease-exit: cubic-bezier(0.7, 0, 0.84, 0);
  --wb-phone-composer-min-height: 4rem;
  --wb-phone-composer-max-height: 9rem;
  --wb-phone-composer-inline-gap: 0.75rem;
  --wb-entry-water-line-quiet: color-mix(in srgb, var(--wb-color-text-primary) 7%, transparent);
  --wb-entry-water-line: color-mix(in srgb, var(--wb-color-text-primary) 11%, transparent);
  --wb-entry-water-line-strong: color-mix(in srgb, var(--wb-color-text-primary) 17%, transparent);
  --wb-entry-wake-color-strong: var(--wb-color-brand-wake-strong);
  --wb-entry-wake-color-bright: var(--wb-color-brand-wake-bright);
  --wb-entry-wake-color-middle: var(--wb-color-brand-wake-middle);
  --wb-entry-wake-color-soft: var(--wb-color-brand-wake-soft);
  --wb-entry-wake-color-tail: var(--wb-color-brand-wake-tail);
  --wb-entry-wake-opacity-strong: 1;
  --wb-entry-wake-opacity-bright: 0.76;
  --wb-entry-wake-opacity-middle: 0.54;
  --wb-entry-wake-opacity-soft: 0.34;
  --wb-entry-wake-opacity-tail: 0.18;
  --wb-entry-water-visual-scale: 1;
  --wb-entry-water-top-inset: 0px;
  --wb-entry-water-top-ratio: 0;
  --wb-entry-boat-hit-size: 6.75rem;
  --wb-entry-boat-body-width: 1.5266rem;
  --wb-entry-boat-body-height: 4.2981rem;
  --wb-entry-boat-shadow-width: 3.4962rem;
  --wb-entry-boat-shadow-height: 6.3116rem;
  --wb-entry-boat-heading: 0rad;
  --wb-entry-celestial-projection-angle: 27deg;
  --wb-entry-celestial-projection-counter-angle: -27deg;
  --wb-entry-celestial-projection-color: color-mix(in srgb, var(--wb-color-text-primary) 34%, transparent);
  --wb-entry-boat-projection-distance: 0.6875rem;
  --wb-entry-boat-projection-opacity: 0.22;
  --wb-entry-boat-projection-blur: 0.5rem;
  --wb-entry-pointer-projection-distance: 0.25rem;
  --wb-entry-pointer-projection-opacity: 0.14;
  --wb-entry-pointer-projection-blur: 0.3125rem;
  --wb-entry-composer-projection-distance: 4.625rem;
  --wb-entry-composer-projection-opacity: 0.24;
  --wb-entry-composer-projection-blur: 1rem;
  --wb-entry-projection-color: var(--wb-entry-celestial-projection-color);
}

.wb-dsh-water {
  position: absolute;
  inset: 0;
  width: 100%;
  height: var(--wb-surface-height);
  min-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--wb-color-background);
  color: var(--wb-color-text-primary);
  font-family: var(--wb-f-font-sans);
  isolation: isolate;
  touch-action: manipulation;
  animation: wb-dsh-water-arrive var(--wb-f-duration-slow) var(--wb-f-ease-out) both;
}

.wb-dsh-water__field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wb-dsh-water__pointer-shadow {
  position: absolute;
  z-index: 1;
  display: block;
  width: 1.75rem;
  height: 0.75rem;
  border-radius: var(--wb-f-radius-pill);
  background: var(--wb-entry-projection-color);
  opacity: 0;
  pointer-events: none;
  filter: blur(var(--wb-entry-pointer-projection-blur));
  transform: translate(-50%, -50%)
    rotate(var(--wb-entry-celestial-projection-angle))
    translateY(var(--wb-entry-pointer-projection-distance))
    rotate(var(--wb-entry-celestial-projection-counter-angle));
  transition: opacity var(--wb-f-duration-fast) var(--wb-f-ease-out);
}

.wb-dsh-water__pointer-shadow[data-visible="true"] {
  opacity: var(--wb-entry-pointer-projection-opacity);
}

.wb-dsh-water button.wb-dsh-water__boat {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  display: block;
  width: var(--wb-entry-boat-hit-size);
  height: var(--wb-entry-boat-hit-size);
  padding: 0;
  border: 0;
  border-radius: 50%;
  appearance: none;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  transform-origin: center;
  will-change: transform;
}

.wb-dsh-water__boat-shadow,
.wb-dsh-water__boat-body,
.wb-dsh-water__boat-hull,
.wb-dsh-water__boat-window {
  position: absolute;
  display: block;
  pointer-events: none;
}

.wb-dsh-water__boat-shadow {
  top: 50%;
  left: 50%;
  width: var(--wb-entry-boat-shadow-width);
  height: var(--wb-entry-boat-shadow-height);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  background: var(--wb-entry-projection-color);
  opacity: var(--wb-entry-boat-projection-opacity);
  filter: blur(var(--wb-entry-boat-projection-blur));
  transform: translate(-50%, -50%)
    rotate(var(--wb-entry-celestial-projection-angle))
    translateY(var(--wb-entry-boat-projection-distance))
    rotate(var(--wb-entry-celestial-projection-counter-angle))
    rotate(var(--wb-entry-boat-heading));
}

.wb-dsh-water__boat-body {
  top: 50%;
  left: 50%;
  width: var(--wb-entry-boat-body-width);
  height: var(--wb-entry-boat-body-height);
  transform: translate(-50%, -50%) rotate(var(--wb-entry-boat-heading))
    scale(var(--wb-entry-water-visual-scale));
}

.wb-dsh-water__boat-hull {
  inset: 0;
  width: 100%;
  height: 100%;
}

.wb-dsh-water__boat-window {
  inset: 21.81% 11.87% 12.6% 13.16%;
  width: auto;
  height: auto;
}

.wb-dsh-water__close,
.wb-dsh-water__icon-button,
.wb-dsh-water__send,
.wb-dsh-water-entry {
  min-width: var(--wb-touch-target);
  min-height: var(--wb-touch-target);
  border: var(--wb-f-border) solid transparent;
  border-radius: var(--wb-f-radius-pill);
  color: var(--wb-color-text-primary);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    opacity var(--wb-f-duration-fast) var(--wb-f-ease-state),
    transform var(--wb-f-duration-fast) var(--wb-f-ease-state),
    background-color var(--wb-f-duration-fast) var(--wb-f-ease-state),
    border-color var(--wb-f-duration-fast) var(--wb-f-ease-state);
}

.wb-dsh-water__close {
  position: absolute;
  z-index: 4;
  top: var(--wb-surface-pad-top);
  right: var(--wb-surface-pad-right);
  background: color-mix(in srgb, var(--wb-color-layer-01) 72%, transparent);
  border-color: color-mix(in srgb, var(--wb-color-border-subtle) 72%, transparent);
  backdrop-filter: blur(0.9rem);
}

.wb-dsh-water__composer-wrap {
  position: absolute;
  z-index: 3;
  top: var(--wb-composer-y, 50%);
  left: var(--wb-composer-x, 50%);
  width: var(--wb-composer-width);
  height: var(--wb-composer-height);
  padding: 0;
  border: 0;
  background: transparent;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate3d(0, var(--wb-f-space-05), 0) scale(0.985);
  transform-origin: 16% 18%;
  transition:
    opacity var(--wb-composer-duration-enter) var(--wb-f-ease-out),
    transform var(--wb-composer-duration-enter) var(--wb-f-ease-out);
}

.wb-dsh-water__composer-wrap[data-open="true"] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0) scale(1);
}

.wb-dsh-water__composer-wrap[data-open="true"][data-motion-phase="exiting"] {
  opacity: 0;
  pointer-events: none;
  transform: translate3d(0, var(--wb-f-space-03), 0) scale(0.992);
  transition:
    opacity var(--wb-composer-duration-exit) var(--wb-composer-ease-exit),
    transform var(--wb-composer-duration-exit) var(--wb-composer-ease-exit);
}

.wb-dsh-water__composer-shadow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--wb-f-radius-md);
  background: var(--wb-entry-projection-color);
  opacity: var(--wb-entry-composer-projection-opacity);
  filter: blur(var(--wb-entry-composer-projection-blur));
  pointer-events: none;
  transform: rotate(var(--wb-entry-celestial-projection-angle))
    translateY(var(--wb-entry-composer-projection-distance))
    rotate(var(--wb-entry-celestial-projection-counter-angle));
}

.wb-dsh-water__composer {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: var(--wb-f-space-03);
  overflow: hidden;
  border: var(--wb-f-border) solid var(--wb-color-border-strong);
  border-radius: var(--wb-composer-radius);
  background: var(--wb-color-background);
  box-shadow: var(--wb-composer-surface-shadow);
  box-sizing: border-box;
}

.wb-dsh-water__composer,
.wb-dsh-water__composer * {
  box-sizing: border-box;
}

.wb-dsh-water__composer-wrap[data-error="true"] .wb-dsh-water__composer {
  border-color: var(--wb-color-support-error);
}

.wb-dsh-water__composer-wrap[data-submitting="true"] .wb-dsh-water__composer {
  opacity: 0.88;
}

.wb-dsh-water__composer-header {
  display: flex;
  min-height: var(--wb-composer-title-height);
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--wb-f-space-04);
  padding: var(--wb-f-space-04) var(--wb-f-space-04) var(--wb-f-space-03);
}

.wb-dsh-water__composer-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--wb-f-space-02);
  color: var(--wb-color-text-primary);
  font-family: var(--wb-f-font-reading);
  font-size: var(--wb-type-body-size);
  line-height: 1.25;
}

.wb-dsh-water__composer-title img {
  display: block;
  width: var(--wb-f-space-05);
  height: var(--wb-f-space-05);
  margin: var(--wb-f-space-02);
}

.wb-dsh-water__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--wb-f-space-02);
}

.wb-dsh-water__actions kbd,
.wb-dsh-water__actions button {
  display: grid;
  min-width: 2rem;
  min-height: 2rem;
  place-items: center;
  padding: var(--wb-f-space-02) var(--wb-f-space-03);
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  border: var(--wb-f-border) solid var(--wb-color-border-subtle);
  border-radius: var(--wb-composer-inner-radius);
  box-shadow: none;
  color: var(--wb-color-text-secondary);
  background: var(--wb-color-layer-02);
  font-family: var(--wb-f-font-reading);
  font-size: var(--wb-type-body-size);
  line-height: 1.25;
  transition:
    color var(--wb-f-duration-fast) var(--wb-f-ease-out),
    background-color var(--wb-f-duration-fast) var(--wb-f-ease-out),
    transform 100ms var(--wb-f-ease-out);
}

.wb-dsh-water__actions button {
  cursor: pointer;
}

.wb-dsh-water__composer-body {
  position: relative;
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  border-radius: var(--wb-composer-inner-radius);
  background: var(--wb-color-layer-01);
}

.wb-dsh-water .wb-dsh-water__input {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  max-height: none;
  resize: none;
  overflow: auto;
  box-sizing: border-box;
  border: 0 !important;
  border-radius: inherit;
  outline: 0 !important;
  box-shadow: none !important;
  padding: 0.625rem var(--wb-f-space-04) var(--wb-f-space-07);
  background: transparent;
  color: var(--wb-color-text-primary);
  caret-color: var(--wb-color-interactive);
  font: var(--wb-f-weight-regular) var(--wb-type-body-size) / var(--wb-type-body-line) var(--wb-f-font-reading);
}

.wb-dsh-water__input::placeholder {
  color: var(--wb-color-text-secondary);
  opacity: 1;
}

.wb-dsh-water__send {
  background: var(--wb-color-layer-02);
  color: var(--wb-color-text-secondary);
}

.wb-dsh-water__composer-wrap[data-has-value="true"] .wb-dsh-water__actions kbd,
.wb-dsh-water__composer-wrap[data-has-value="true"] .wb-dsh-water__send,
.wb-dsh-water__composer-wrap[data-submitting="true"] .wb-dsh-water__actions kbd,
.wb-dsh-water__composer-wrap[data-submitting="true"] .wb-dsh-water__send {
  color: var(--wb-color-background);
  background: var(--wb-color-interactive);
}

.wb-dsh-water__icon-button:disabled {
  cursor: default;
  opacity: 0.28;
}

.wb-dsh-water__send:disabled {
  cursor: default;
  opacity: 1;
}

.wb-dsh-water__icon-button[data-listening="true"] {
  color: var(--wb-color-interactive);
  background: color-mix(in srgb, var(--wb-color-interactive) 12%, transparent);
  border-color: color-mix(in srgb, var(--wb-color-interactive) 32%, transparent);
}

.wb-dsh-water__status {
  position: absolute;
  top: calc(100% + var(--wb-f-space-03));
  left: var(--wb-f-space-04);
  max-width: calc(100% - (var(--wb-f-space-04) * 2));
  padding: var(--wb-f-space-02) var(--wb-f-space-04);
  border-radius: var(--wb-f-radius-pill);
  background: var(--wb-color-layer-02);
  color: var(--wb-color-text-secondary);
  font-size: var(--wb-type-label-size);
  line-height: 1.35;
  opacity: 0;
  pointer-events: none;
}

.wb-dsh-water__status:not(:empty) {
  opacity: 1;
}

.wb-dsh-water__status[data-error="true"] {
  color: var(--wb-color-support-error);
}

.wb-dsh-water svg,
.wb-dsh-water-entry svg {
  width: 1.125rem;
  height: 1.125rem;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.wb-dsh-water-entry {
  width: 100%;
  justify-content: flex-start;
  gap: var(--wb-f-space-03);
  padding: 0 var(--wb-f-space-03);
  color: var(--dsw-alias-label-tertiary, var(--wb-f-color-muted));
  font-family: var(--wb-f-font-sans);
  font-size: var(--wb-type-label-size);
}

.wb-dsh-water-entry[data-wide="false"] {
  width: var(--wb-touch-target);
  padding: 0;
  justify-content: center;
}

@media (hover: hover) and (pointer: fine) {
  .wb-dsh-water {
    cursor: crosshair;
  }

  .wb-dsh-water__close:hover,
  .wb-dsh-water__icon-button:hover,
  .wb-dsh-water-entry:hover {
    background: color-mix(in srgb, var(--wb-color-text-primary) 7%, transparent);
    border-color: var(--wb-color-border-subtle);
  }

}

.wb-dsh-water__close:active,
.wb-dsh-water__icon-button:active,
.wb-dsh-water__send:not(:disabled):active,
.wb-dsh-water-entry:active {
  transform: scale(0.96);
}

.wb-dsh-water__close:focus-visible,
.wb-dsh-water__icon-button:focus-visible,
.wb-dsh-water__send:focus-visible,
.wb-dsh-water-entry:focus-visible {
  outline: 2px solid var(--wb-color-focus);
  outline-offset: 2px;
}

.wb-dsh-water .wb-dsh-water__input:focus-visible {
  outline: none !important;
  box-shadow: var(--wb-composer-focus-ring) !important;
}

@media (min-width: 48rem) {
  .wb-dsh-water,
  .wb-dsh-water-entry {
    --wb-space-inline: var(--wb-f-space-07);
    --wb-surface-pad-top: max(var(--wb-f-space-06), env(safe-area-inset-top));
    --wb-surface-pad-right: max(var(--wb-f-space-06), env(safe-area-inset-right));
    --wb-surface-pad-bottom: max(var(--wb-f-space-06), env(safe-area-inset-bottom));
    --wb-surface-pad-left: max(var(--wb-f-space-06), env(safe-area-inset-left));
  }
}

@media (orientation: landscape) and (max-height: 34rem) {
  .wb-dsh-water,
  .wb-dsh-water-entry {
    --wb-surface-pad-top: max(var(--wb-f-space-03), env(safe-area-inset-top));
    --wb-surface-pad-bottom: max(var(--wb-f-space-03), env(safe-area-inset-bottom));
    --wb-entry-water-visual-scale: 0.82;
  }

  .wb-dsh-water__composer-wrap {
    --wb-composer-height: min(12rem, calc(100dvh - (var(--wb-f-space-03) * 2)));
  }
}

@media (pointer: coarse) {
  .wb-dsh-water__close,
  .wb-dsh-water__icon-button,
  .wb-dsh-water__send,
  .wb-dsh-water-entry {
    min-width: var(--wb-touch-target);
    min-height: var(--wb-touch-target);
  }
}

.wb-dsh-water[data-device-mode="phone"] {
  --wb-entry-water-visual-scale: 0.8;
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__pointer-shadow {
  display: none;
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__composer-wrap {
  top: auto;
  bottom: max(var(--wb-phone-composer-inline-gap), env(safe-area-inset-bottom));
  left: 50%;
  width: calc(100vw - (var(--wb-phone-composer-inline-gap) * 2));
  height: auto;
  min-height: var(--wb-phone-composer-min-height);
  max-height: var(--wb-phone-composer-max-height);
  transform: translateX(-50%);
  transform-origin: 50% 100%;
}

.wb-dsh-water[data-device-mode="phone"]
  .wb-dsh-water__composer-wrap[data-open="true"] {
  transform: translateX(-50%);
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__composer {
  min-height: var(--wb-phone-composer-min-height);
  max-height: var(--wb-phone-composer-max-height);
  flex-direction: row;
  align-items: flex-end;
  gap: var(--wb-f-space-02);
  padding: var(--wb-f-space-03);
  border-radius: calc(var(--wb-phone-composer-min-height) / 2);
  background: var(--wb-color-layer-01);
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__composer-shadow {
  border-radius: var(--wb-f-radius-pill);
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__composer-header {
  display: flex;
  order: 2;
  min-height: 0;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__composer-title,
.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__actions kbd {
  display: none;
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__composer-body {
  order: 1;
  min-width: 0;
  min-height: 3rem;
  max-height: 8rem;
  flex: 1 1 auto;
  overflow: hidden;
  border-radius: 0;
  background: transparent;
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__input {
  height: 48px;
  min-height: 48px;
  max-height: 128px;
  padding: var(--wb-f-space-04) var(--wb-f-space-03);
  border-radius: 0;
  overflow-y: hidden;
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__actions button {
  width: 46px;
  min-width: 46px;
  height: 46px;
  min-height: 46px;
  padding: 0;
  border-radius: 50%;
}

.wb-dsh-water[data-device-mode="phone"] .wb-dsh-water__actions button img {
  width: var(--wb-f-space-05);
  height: var(--wb-f-space-05);
}

/* DSH-native water composer: the scene owns the anchor/projection while the
   official composer Slot owns input and configuration state. */
.wb-dsh-water__composer-wrap {
  width: min(32rem, calc(100vw - 3rem));
  height: min(14rem, calc(100dvh - 3rem));
  pointer-events: none !important;
}

.wb-dsh-water__composer-shadow {
  border-radius: 1.375rem;
}

.wb-dsh-water > .wb-dsh-water__status {
  z-index: 5;
  top: auto;
  bottom: max(1.5rem, env(safe-area-inset-bottom));
  left: 50%;
  max-width: min(32rem, calc(100vw - 3rem));
  transform: translateX(-50%);
}

.wb-dsh-water-composer-layer {
  /* Portal-local foundation motion tokens */
  --wb-native-f-duration-enter: 420ms;
  --wb-native-f-duration-exit: 320ms;
  --wb-native-f-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --wb-native-f-ease-exit: cubic-bezier(0.7, 0, 0.84, 0);
  --wb-native-f-motion-enter-distance: 0.625rem;
  --wb-native-f-motion-exit-distance: 0.375rem;
  --wb-native-f-motion-enter-scale: 0.99;
  --wb-native-f-motion-exit-scale: 0.992;

  /* Composer motion roles */
  --wb-native-motion-duration-enter: var(--wb-native-f-duration-enter);
  --wb-native-motion-duration-exit: var(--wb-native-f-duration-exit);
  --wb-native-motion-ease-enter: var(--wb-native-f-ease-enter);
  --wb-native-motion-ease-exit: var(--wb-native-f-ease-exit);
  --wb-native-motion-enter-distance: var(--wb-native-f-motion-enter-distance);
  --wb-native-motion-exit-distance: var(--wb-native-f-motion-exit-distance);
  --wb-native-motion-enter-scale: var(--wb-native-f-motion-enter-scale);
  --wb-native-motion-exit-scale: var(--wb-native-f-motion-exit-scale);
  --wb-native-bg: var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-1, #fff));
  --wb-native-selector: var(--dsw-specific-selector, var(--dsw-alias-bg-layer-2, #f4f5f6));
  --wb-native-hover: var(--dsw-alias-interactive-bg-hover, rgba(15, 17, 21, 0.06));
  --wb-native-border: var(--dsw-alias-border-l2-darkmode-thin, rgba(0, 0, 0, 0.1));
  --wb-native-label: var(--dsw-alias-label-primary, #17191d);
  --wb-native-secondary: var(--dsw-alias-label-secondary, #62666d);
  --wb-native-caption: var(--dsw-alias-label-caption, #a5a9b0);
  --wb-native-action: var(--dsw-alias-button-info-fill, var(--dsw-alias-brand-primary, #0f1115));
  --wb-native-action-hover: var(--dsw-alias-button-info-hover, #20242a);
  --wb-native-error: var(--dsw-alias-state-error-primary, #b43b47);
  --wb-native-composer-width: min(32rem, calc(100vw - 3rem));
  --wb-native-control-group-gap: 2rem;
  position: fixed;
  z-index: 30;
  top: var(--wb-native-composer-y, 50%);
  left: var(--wb-native-composer-x, 50%);
  display: flex;
  width: var(--wb-native-composer-width);
  height: min(14rem, calc(100dvh - 3rem));
  flex-direction: column;
  color: var(--wb-native-label);
  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  pointer-events: auto;
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.wb-dsh-water-composer-layer[data-motion-phase="entering"] {
  animation: wb-dsh-native-composer-enter
    var(--wb-native-motion-duration-enter)
    var(--wb-native-motion-ease-enter)
    both;
}

.wb-dsh-water-composer-layer[data-motion-phase="exiting"] {
  pointer-events: none;
  animation: wb-dsh-native-composer-exit
    var(--wb-native-motion-duration-exit)
    var(--wb-native-motion-ease-exit)
    both;
}

.wb-dsh-water-composer-layer,
.wb-dsh-water-composer-layer * {
  box-sizing: border-box;
}

.wb-dsh-native-context {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  min-height: 2.5rem;
  flex: 0 0 auto;
  padding: 0 1.25rem 0.5rem;
}

.wb-dsh-native-control {
  position: relative;
  min-width: 0;
}

.wb-dsh-native-context-trigger,
.wb-dsh-native-trigger {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
  height: 1.75rem;
  padding: 0 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--wb-native-secondary);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.25rem;
  cursor: pointer;
}

.wb-dsh-native-context-trigger {
  color: var(--wb-native-label);
  font-size: 0.9375rem;
}

.wb-dsh-native-context-trigger:hover,
.wb-dsh-native-trigger:hover:not(:disabled) {
  background: var(--wb-native-hover);
}

.wb-dsh-native-context-trigger > span,
.wb-dsh-native-trigger > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wb-dsh-native-context-trigger svg,
.wb-dsh-native-trigger svg {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.wb-dsh-native-context-trigger svg:first-child {
  width: 1.125rem;
  height: 1.125rem;
}

.wb-dsh-native-card {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.625rem;
  border: 1px solid var(--wb-native-border);
  border-radius: 1.375rem;
  background: var(--wb-native-bg);
  box-shadow: var(--dsw-shadow-lv2, 0 4px 12px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.04));
  font-size: 1rem;
  line-height: 1.5rem;
}

.wb-dsh-native-overlay {
  position: absolute;
  inset: 0 0 auto;
  height: 0;
}

.wb-dsh-native-input {
  display: block;
  width: 100%;
  min-height: 0;
  max-height: min(14rem, 34dvh);
  flex: 1 1 auto;
  resize: none;
  overflow-y: auto;
  padding: 0.25rem 1rem 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--wb-native-label);
  caret-color: var(--dsw-alias-state-business-primary, var(--wb-native-action));
  font: inherit;
  line-height: 1.5rem;
}

.wb-dsh-native-input::placeholder {
  color: var(--wb-native-caption);
  opacity: 1;
}

.wb-dsh-native-input:focus-visible {
  outline: 0;
}

.wb-dsh-native-card:focus-within {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--wb-native-action)) 42%, transparent);
}

.wb-dsh-native-row {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--wb-native-control-group-gap);
  padding: 0.125rem 0.5rem 0.375rem;
}

.wb-dsh-native-tools,
.wb-dsh-native-trailing {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.wb-dsh-native-trailing {
  flex: none;
  margin-left: auto;
}

.wb-dsh-native-plus,
.wb-dsh-native-mic,
.wb-dsh-native-send {
  display: grid;
  flex: none;
  place-items: center;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.wb-dsh-native-plus {
  width: 1.75rem;
  height: 1.75rem;
  background: var(--wb-native-selector);
  color: var(--wb-native-label);
}

.wb-dsh-native-mic {
  width: 2.125rem;
  height: 2.125rem;
  background: transparent;
  color: var(--wb-native-secondary);
}

.wb-dsh-native-send {
  width: 2.125rem;
  height: 2.125rem;
  background: var(--wb-native-action);
  color: #fff;
  transform: translateY(-0.125rem);
}

.wb-dsh-native-plus:hover:not(:disabled),
.wb-dsh-native-mic:hover:not(:disabled) {
  background: var(--wb-native-hover);
}

.wb-dsh-native-send:hover:not(:disabled) {
  background: var(--wb-native-action-hover);
}

.wb-dsh-native-plus:disabled,
.wb-dsh-native-mic:disabled,
.wb-dsh-native-send:disabled,
.wb-dsh-native-trigger:disabled,
.wb-dsh-native-context-trigger:disabled {
  cursor: default;
  opacity: 0.4;
}

.wb-dsh-native-plus svg,
.wb-dsh-native-mic svg,
.wb-dsh-native-send svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.wb-dsh-native-trigger > [data-secondary] {
  color: var(--wb-native-caption);
}

.wb-dsh-native-menu {
  position: absolute;
  z-index: 4;
  bottom: calc(100% + 0.5rem);
  left: 0;
  width: max-content;
  min-width: 12rem;
  max-width: min(24rem, calc(100vw - 2rem));
  max-height: min(25rem, 60dvh);
  overflow: auto;
  padding: 0.375rem;
  border: 1px solid var(--wb-native-border);
  border-radius: 0.75rem;
  background: var(--dsw-alias-bg-elevated, var(--wb-native-bg));
  box-shadow: var(--dsw-shadow-lv3, 0 10px 28px rgba(0, 0, 0, 0.12));
}

.wb-dsh-native-context .wb-dsh-native-menu {
  top: calc(100% + 0.25rem);
  bottom: auto;
}

.wb-dsh-native-model-menu {
  right: 0;
  left: auto;
  min-width: 18rem;
}

.wb-dsh-native-command-menu {
  min-width: min(20rem, calc(100vw - 2rem));
}

.wb-dsh-native-command-menu [data-secondary] {
  color: var(--wb-native-caption);
  font-size: 0.75rem;
}

.wb-dsh-native-menu > button,
.wb-dsh-native-menu section > button {
  display: flex;
  width: 100%;
  min-height: 2.25rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4375rem 0.625rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--wb-native-label);
  text-align: left;
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.wb-dsh-native-menu > button:hover,
.wb-dsh-native-menu section > button:hover,
.wb-dsh-native-menu button[aria-checked="true"] {
  background: var(--wb-native-hover);
}

.wb-dsh-native-menu [data-back] {
  color: var(--wb-native-secondary);
}

.wb-dsh-native-menu-heading,
.wb-dsh-native-menu-status,
.wb-dsh-native-menu-error {
  padding: 0.5rem 0.625rem 0.25rem;
  color: var(--wb-native-caption);
  font-size: 0.75rem;
}

.wb-dsh-native-menu-error {
  color: var(--wb-native-error);
}

.wb-dsh-native-confirm {
  display: grid;
  gap: 0.625rem;
  width: 18rem;
  padding: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.25rem;
}

.wb-dsh-native-confirm > span {
  color: var(--wb-native-secondary);
}

.wb-dsh-native-confirm > div {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.wb-dsh-native-confirm button {
  min-height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid var(--wb-native-border);
  border-radius: 0.5rem;
  background: var(--wb-native-bg);
  color: var(--wb-native-label);
}

.wb-dsh-native-confirm button[data-primary] {
  border-color: transparent;
  background: var(--wb-native-action);
  color: #fff;
}

.wb-dsh-native-status {
  width: fit-content;
  max-width: 100%;
  margin: 0.5rem auto 0;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: var(--dsw-alias-bg-elevated, var(--wb-native-bg));
  color: var(--wb-native-secondary);
  box-shadow: var(--dsw-shadow-lv1, 0 2px 6px rgba(0, 0, 0, 0.05));
  font-size: 0.75rem;
  line-height: 1.125rem;
}

.wb-dsh-native-status[data-error="true"] {
  color: var(--wb-native-error);
}

@media (max-width: 47.99rem), (pointer: coarse) {
  .wb-dsh-water-composer-layer {
    --wb-native-control-group-gap: 0.375rem;
    top: auto;
    right: max(0.75rem, env(safe-area-inset-right));
    bottom: max(0.75rem, env(safe-area-inset-bottom));
    left: max(0.75rem, env(safe-area-inset-left));
    width: auto;
    height: auto;
  }

  .wb-dsh-native-context {
    min-height: 2rem;
    padding: 0 0.5rem 0.375rem;
  }

  .wb-dsh-native-context-trigger {
    max-width: min(46vw, 12rem);
    font-size: 0.8125rem;
  }

  .wb-dsh-native-card {
    gap: 0.375rem;
    border-radius: 1.25rem;
  }

  .wb-dsh-native-input {
    min-height: 3rem;
    max-height: 8rem;
    padding-top: 0.5rem;
  }

  .wb-dsh-native-row {
    flex-wrap: nowrap;
    gap: 0.375rem;
  }

  .wb-dsh-native-tools,
  .wb-dsh-native-trailing {
    gap: 0.375rem;
  }

  .wb-dsh-native-trigger {
    max-width: 8.5rem;
  }

  .wb-dsh-native-plus,
  .wb-dsh-native-mic,
  .wb-dsh-native-send {
    width: 2.75rem;
    min-width: 2.75rem;
    height: 2.75rem;
    min-height: 2.75rem;
  }

  .wb-dsh-native-model .wb-dsh-native-trigger {
    max-width: min(35vw, 9rem);
  }

  .wb-dsh-native-trigger > [data-secondary],
  .wb-dsh-native-tools > .wb-dsh-native-control:not(:only-child) .wb-dsh-native-trigger svg {
    display: none;
  }

  .wb-dsh-native-menu {
    max-height: min(22rem, 48dvh);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wb-dsh-water,
  .wb-dsh-water__close,
  .wb-dsh-water__icon-button,
  .wb-dsh-water__send,
  .wb-dsh-water-entry {
    animation: none;
    transition-duration: 0.01ms;
  }

  .wb-dsh-water-composer-layer {
    --wb-native-motion-duration-enter: 0.01ms;
    --wb-native-motion-duration-exit: 0.01ms;
    --wb-native-motion-enter-distance: 0rem;
    --wb-native-motion-exit-distance: 0rem;
    --wb-native-motion-enter-scale: 1;
    --wb-native-motion-exit-scale: 1;
  }

  .wb-dsh-water__composer-wrap {
    --wb-composer-duration-enter: 0.01ms;
    --wb-composer-duration-exit: 0.01ms;
  }

  .wb-dsh-water__composer-wrap[data-open="true"][data-motion-phase="exiting"] {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes wb-dsh-water-arrive {
  from { opacity: 0; }
}

@keyframes wb-dsh-native-composer-enter {
  from {
    opacity: 0;
    transform: translate3d(0, var(--wb-native-motion-enter-distance), 0)
      scale(var(--wb-native-motion-enter-scale));
  }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes wb-dsh-native-composer-exit {
  from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  to {
    opacity: 0;
    transform: translate3d(0, var(--wb-native-motion-exit-distance), 0)
      scale(var(--wb-native-motion-exit-scale));
  }
}
`;
