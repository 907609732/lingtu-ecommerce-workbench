<div align="center">

<img src="deploy/fnos/wuchengerp/app/ui/images/icon_256.png" width="96" alt="Lingtu E-commerce Workbench" />

# Lingtu E-commerce Workbench

**Purchasing, sales, and business overview in one native fnOS workbench.**

A browser workspace for fnOS NAS: launch it from the fnOS desktop and keep programs, ledgers, attachments, and backups separate.

[简体中文（默认）](README.md) · **English**

[![Release](https://img.shields.io/github/v/release/907609732/lingtu-ecommerce-workbench?color=0071e3&label=Release)](https://github.com/907609732/lingtu-ecommerce-workbench/releases)
[![Browser ERP checks](https://github.com/907609732/lingtu-ecommerce-workbench/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/907609732/lingtu-ecommerce-workbench/actions/workflows/ci.yml)
![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-339933)
![fnOS native](https://img.shields.io/badge/fnOS-native-0B7A5C)

**[Releases](https://github.com/907609732/lingtu-ecommerce-workbench/releases)** · [Issues](https://github.com/907609732/lingtu-ecommerce-workbench/issues) · [Operations](docs/operations.en.md)

</div>

---

[Features](#features) · [Quick start](#quick-start) · [Data and security](#data-and-security) · [Source development](#source-development) · [Documentation](#documentation) · [Version evidence](#version-and-release-evidence)

## Features

| Capability | What you can do |
| --- | --- |
| 🛒 Purchasing | Manual entry, spreadsheet import, original attachments, and mobile entry; maintain suppliers, addresses, monthly confirmation, and order logs. |
| 💰 Sales | Sales records, official bill import, freight, month-end close, historical reports, and original attachments. |
| 📊 Business overview | Business dashboard, expense bills, labor costs, payment records, monthly report snapshots, and original-file downloads. |
| 🖥️ Cainiao login | Open Chromium on the NAS from the top bar and operate it through bundled Xvfb, VNC, and noVNC. The user completes platform login and CAPTCHA/human verification. |
| 🗂️ Versions and backups | Keep program versions separate from ledgers; stop writes, create a consistent backup, and verify restoration in a copy before upgrades, preserving data and rollback material on failure. |

Version 0.15.6 keeps separate login profiles for sales and overview. Only the 0.15.7 candidate shares one Chromium login state with controlled tabs per module; the old overview profile remains untouched and cookie databases are not merged. Switching platform accounts affects both modules, so verify the current account before collection.

## Quick start

This update renames the repository and documentation. Installed apps may still display the previous name, 五成ERP. The fnOS app ID remains `wuchengerp`; existing installation, ledger, and backup paths are unchanged.

1. Open the existing ERP app from the fnOS desktop (the currently installed version is named 五成ERP). Desktop access is available to all device users; the entry still validates the trusted fnOS proxy, origin, and session, while business passwords, reviews, and month locks remain active.
2. Verify the program version and ledger identity first. An operator sets or verifies the unified administrator password; there is no default password.
3. Enter, import, or reconcile business data in purchasing, sales, and overview. Before month-end close, check the scope, amounts, record counts, and missing items, then lock the month.
4. To collect Cainiao data, open **Cainiao Login**, complete platform login and CAPTCHA/human verification yourself in the remote Chromium window, then connect from the business module. Confirm the account before collection and do not bypass a pending submission reconciliation.
5. For upgrades, validate an isolated installation and backup, then reuse installed data through App Center. Never replace an existing ledger with a newly created empty one. See [Operations](docs/operations.en.md) for the complete procedure.

> **Why no Docker?** Production is the native app installed through the fnOS App Center. It does not require Docker, and no legacy ERP container serves as a production or rollback entry. The native package bundles Node.js, Chromium, Xvfb, VNC, and noVNC; containers for other services do not start or stop with this workbench. Do not run a global Docker prune or remove ledgers, the independent warehouse app, or other services during cleanup.

## Data and security

Business ledgers remain SQLite databases, with programs, runtime files, ledgers, attachments, login profiles, and backups stored separately. The gateway validates the trusted fnOS Unix proxy, origin, session, and signed identity, and retains CSRF protection, duplicate-submission receipts, upload limits, and auditing. Business passwords, reviews, and month locks remain active.

The following never enter Git, documentation examples, CI, or release packages: production ledgers, attachments, cookies and login profiles, secrets, the password database, runtime state, and backups. GitHub Actions builds source and runs synthetic tests without production data. The development entry listens on localhost only; its default data lives in `.codex-artifacts/web-dev/data`, isolated from production ledgers.

When data version hosting is enabled, whitelisted business snapshots and required attachments enter a separate, authenticated UVCS data repository workflow. Authorization, sessions, runtime state, and historical backups are outside that export. The UI reports hosted state only after a real changeset exists, and uploads may queue; this hosting does not replace local business backups.

Backups must target a new directory and are checked with SHA-256 and SQLite `integrity_check`; restoration writes to a new directory and should be rehearsed. Copy backups to trusted external storage. Before removing old programs or test directories, verify running instances, mounts, and backup purpose. Do not remove ledgers, the independent warehouse app, or other services.

## Source development

Requires Node.js 24 or newer, npm, and Git. Distribution packages bundle their runtime; development data stays isolated from production ledgers. Run these commands in Windows PowerShell.

```powershell
git clone https://github.com/907609732/lingtu-ecommerce-workbench.git
cd lingtu-ecommerce-workbench
npm.cmd ci --ignore-scripts
npm.cmd --prefix apps/purchase ci --ignore-scripts
npm.cmd --prefix apps/sales ci --ignore-scripts
npm.cmd --prefix apps/overview ci --ignore-scripts
npm.cmd run web:dev
```

Development entry: `http://127.0.0.1:28430/`; default data: `.codex-artifacts/web-dev/data`. For port conflicts, supply an independent development configuration and data directory: `npm.cmd run web:dev -- --config <config-path>`.

```powershell
npm.cmd run web:check
npm.cmd test
npm.cmd run test:purchase
npm.cmd run test:sales
npm.cmd run test:overview
npm.cmd run check:ui
```

Modules: `apps/purchase`, `apps/sales`, `apps/overview`; host and gateway: `server/`; shared protocols: `shared/`; shared styles: `ui/`. Warehouse and buyer-order export tools have separate projects. Passing source tests does not prove real platform collection or a production ledger switch; real login, CAPTCHA, and platform page changes still require manual acceptance.

## Documentation

| Document | Contents |
| --- | --- |
| [Operations (English)](docs/operations.en.md) / [运行维护（中文）](docs/operations.md) | Production environment, access, upgrades, troubleshooting, and rollback |
| [Development (Chinese)](docs/development.md) | Local development, tests, and data isolation |
| [Architecture (Chinese)](docs/architecture.md) | Gateway, three modules, and data storage |
| [Shared UI (Chinese)](ui/README.md) | Tokens, components, period picker, and sync rules |
| [Native fnOS build workflow](.github/workflows/fnos-native.yml) | FPK build and delivery |
| [Acceptance rules (Chinese)](docs/verification.md) | Boundaries between source tests and real acceptance |
| [Data version hosting (Chinese)](docs/data-version-operations.md) | UVCS business snapshots, restoration, and limits |
| [Historical migration record (Chinese)](docs/browser-only-migration.md) | Browser-service migration background for reference only |

Historical browser-service and migration documents provide background; use the operations guide for the current environment. The repository keeps source, lockfiles, runtime resources, and documentation; build artifacts are delivered through the release process.

## Version and release evidence

The acceptance record below is dated **November 12, 2026**. It does not claim that a new live verification was performed on the day you read it, nor that the production NAS has been upgraded.

| Version | Status | Cainiao browser |
| --- | --- | --- |
| [0.15.6](https://github.com/907609732/lingtu-ecommerce-workbench/releases/tag/v0.15.6) | Last verified production installation | Separate sales and overview profiles |
| 0.15.7 | Built and archived in a private release draft; not installed on the production NAS | One shared Chromium login state with controlled tabs per module |

0.15.7 candidate runtime commit: `aa6218c2f004c98b609b7ce97b91c91b55ef4ead`. The [full build](https://github.com/907609732/lingtu-ecommerce-workbench/actions/runs/43155768567) recorded 962 passes, zero failures, and three conditional skips, including clean-runtime acceptance. The [archive job](https://github.com/907609732/lingtu-ecommerce-workbench/actions/runs/43157591549) retained the matching FPK, corresponding source, and checksums. LAN and remote entry checks after installing 0.15.7 remain pending.

CI success does not mean production has been upgraded and does not replace collection acceptance with a real platform account. This evidence belongs to the commit above; it does not mean 0.15.7 source is already on `main` or that all branches have been merged. Use the actual Git history and Releases for branch and release status.

## Licensing notice

The repository root has no `LICENSE` file, and this README does not declare the MIT license or any other open-source license. Third-party dependencies, platform names, and icons remain subject to their own licenses or rights. Confirm authorization with the rights holder before reusing code or assets.

<p align="center"><sub>Lingtu E-commerce Workbench · native fnOS app <code>wuchengerp</code></sub></p>
