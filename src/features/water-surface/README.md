# Water surface engineering map

Product and acceptance truth stays in the sibling `whiteboat` control plane.

| Product / feature | Contract | Implementation | Proof |
| --- | --- | --- | --- |
| WB-ENTRY-007 / dsh-water-surface | WB-CONTRACT-DSH-WATER-SURFACE | `index.tsx`, `surface-store.ts`, `water-session.ts`, `dsh-composer.tsx` | `test/water-session.spec.ts`, `test/water-interaction.spec.ts`, isolated DSH runtime |
| WB-ENTRY-008 / dsh-water-soundscape | WB-CONTRACT-HOME-BOAT-WATER-SOUNDSCAPE | `audio.ts`, surface lifecycle, `settings.ts`, `settings-page.tsx`; core `boat-water-sound` / `boat-water-source` | `test/water-audio.spec.ts`, settings codec in `test/water-interaction.spec.ts`, core `test/boat-water-sound.spec.ts`, isolated audio runtime |

The sound adapter owns browser visibility, trusted gestures, and overlay cleanup.
The core owns playback state and offline source; DSH supplies Howl. The existing
Obsidian consumer has not migrated to these new core entry points. Its separate
runtime evidence cannot substitute for DSH's proof.

Release evidence: `whiteboat/90 验收/2026-09-21-DSH-0.1.1-发布准备/`.
Audio runtime checks measure nonzero Web Audio output, the 57-second boundary,
mute persistence, teardown and visibility-event suspension. Human listening,
physical-device autoplay/background behavior, and credentialed Prompt handoff
remain separate acceptance items.

2026-11-06 disc update: `whiteboat-core/disc-water` owns the accepted GPU
material, bounded settings, scheduling and fallback. DSH supplies its theme
predicate, DOM probe and live persisted `waterScale` (90%, 50%–200%). New
boat speed defaults to 60%; existing values and mute survive decoding. The
water layer is transparent above the DSH surface. Package/runtime evidence:
`whiteboat/90 验收/2026-11-06-DSH圆盘水面同步/`.
