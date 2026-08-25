# Repository boundary

`whiteboat-dsh` is the long-lived DeepSeek Harness distribution of Whiteboat. The water surface is its first feature slice.

This repository owns DSH-specific composition:

- Workspace, Session, and Conversation entry;
- official Slot integration and composer shadowing;
- DSH theme-token mapping;
- DSH commands, permissions, models, Agent presets, and submission lifecycle;
- DSH compatibility and runtime acceptance.

Host-neutral behavior comes from the pinned `whiteboat-core` submodule and is bundled into the release artifact. This repository must not copy Obsidian Vault, Canvas, Modal, or plugin lifecycle code.

The source package can grow to contain additional DSH features. A separate repository is justified only when a capability needs independent installation, versioning, and maintenance.
