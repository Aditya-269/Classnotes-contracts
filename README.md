

# README.md

# ClassNotes — On-Chain Notes Storage

**Contract Address:** `0xe3871001294eF15805C7dfF9b8F1Ef26C662fcF1`  
Explorer: https://coston2-explorer.flare.network/address/0xe3871001294eF15805C7dfF9b8F1Ef26C662fcF1

---

## Description

ClassNotes is a minimal, secure, and transparent on-chain notes storage smart contract and frontend integration. It allows users to store short textual notes on the blockchain, view the number of notes, and delete notes by index. The project aims to demonstrate a straightforward decentralized application (dApp) pattern: simple contract ABI, wallet-gated UI, transaction lifecycle handling (pending → confirmation), and basic read/write operations using wagmi/viem.

This repository contains:

- A typed ABI and contract address for client integration (`lib/contract.ts`).
- A React hook (`hooks/useContract.ts`) that wraps common read/write contract operations and manages UI state and transaction lifecycle.
- A sample UI component (`components/sample.tsx`) showing how to add and delete notes from the contract with wallet gating and user feedback.

---

## Features

- **On-chain note creation**: Submit textual notes via the `addNote(string)` contract function.
- **Note deletion**: Remove a note by index using `deleteNote(uint256)`.
- **Notes count**: Read total number of notes with `getNotesCount()` (view function).
- **Events**: Contract emits `NoteAdded` and `NoteDeleted` events for indexing and off-chain listeners.
- **Wallet gating**: UI requires wallet connection to write transactions.
- **Transaction lifecycle handling**: UI shows pending, confirming, and confirmed states with transaction hash and error messages.
- **Type-safe ABI**: ABI exported as a readonly `as const` array compatible with viem/wagmi.
- **Lightweight frontend hook**: `useNotesContract` simplifies calling add and delete functions and provides refetch capability.

---

## How It Solves the Problem

### Problem Statement
Many dApps and educational projects require a simple example that demonstrates how to persist user data on-chain while preserving an approachable UX. Developers often need a compact reference that shows how to:

- Integrate a contract ABI into a React app,
- Use wallet providers for signing transactions,
- Manage transaction state in the UI (pending, confirming, confirmed),
- Handle errors and provide feedback to users,
- Keep read and write code organized in a reusable hook.

### Solution Overview
ClassNotes addresses this by providing:

1. **A focused smart contract ABI** (no extraneous functions): The contract exposes `addNote`, `deleteNote`, `getNotesCount`, and a `notes` getter. This keeps integration points minimal and easy to reason about.

2. **A reusable React hook (`useNotesContract`)**: The hook abstracts common interaction patterns:
   - Reading the total notes count via `getNotesCount`.
   - Writing transactions for `addNote` and `deleteNote`.
   - Exposing `state` that includes `isLoading`, `isPending`, `isConfirming`, `isConfirmed`, the transaction `hash`, and any `error`.
   - A `refetch` method to refresh the count after actions.

3. **A sample UI component**: Demonstrates how to:
   - Gate actions behind wallet connection,
   - Accept input for a note and validate it,
   - Trigger contract writes and display transaction status,
   - Provide clear user messaging on success or error.

### Use Cases and Benefits
- **Educational demos**: Great for classrooms, workshops, and tutorials showing end-to-end dApp flow.
- **Prototyping**: Useful when prototyping features that require immutable or verifiable on-chain storage.
- **Event-driven indexing**: Emits events that can be consumed by subgraphs or other indexers for off-chain search and display.
- **Transparent audit trail**: Notes and deletions are recorded on-chain, offering auditability where required.

---

## Technical Notes & Recommendations

- **Contract ABI**: The ABI is exported in `lib/contract.ts` for direct compatibility with viem and wagmi.
- **Frontend hooks**: The hook uses `useReadContract`, `useWriteContract`, and `useWaitForTransactionReceipt` from wagmi to manage reads and writes. After a successful transaction confirmation, the hook triggers a refetch of the notes count so the UI reflects the latest state.
- **Fetching individual notes**: The contract exposes a `notes(uint256)` getter, which can be read by index. To avoid heavy automatic reads, the sample hook focuses on count and basic lifecycle; consumers can implement paginated/individual reads (via `useReadContract` with `functionName: "notes"` and appropriate `args`) when they need to display content.
- **Limits & caps**: For production interfaces, implement pagination or off-chain indexing (TheGraph, custom indexer) to efficiently display large numbers of notes.
- **Security**: Ensure users understand gas implications when adding/deleting notes. This project is intended for sample/demo usage and educational purposes.

---

## Quick Start

1. Ensure your environment has a wallet connector configured (e.g., MetaMask) and a wagmi/viem client in your Next.js/React app.
2. Update `lib/contract.ts` if you deploy a new contract or switch networks.
3. Use `useNotesContract()` in your React components to add/delete notes and monitor state.
4. To display note contents, call the `notes` getter for each index you want to show (use pagination or off-chain indexing for better UX).

---

## Contact & Links

- **Contract (Coston 2 / Flare testnet)**: https://coston2-explorer.flare.network/address/0xe3871001294eF15805C7dfF9b8F1Ef26C662fcF1
- For questions or improvements, open an issue or PR in the codebase.

---
