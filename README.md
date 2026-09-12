Note: This project was submitted to the 2025 Harvard & Duke LIVE AI Ivy Plus Hackathon.

Devpost: https://devpost.com/software/ticketchain-op65ls

# 🎟️ Ticketchain

Ticketchain is a hackathon prototype exploring blockchain-backed ticket ownership and resale constraints. The project uses NFT tickets and smart contracts to demonstrate ways to reduce common ticketing problems such as counterfeit tickets, opaque ownership, and excessive resale prices.

## Key Features

1. **Resale Controls** – Smart contracts can enforce resale-price rules and verify on-chain ownership.
2. **Verifiable Ticket Ownership** – Tickets are represented as NFTs, providing transparent ownership records.
3. **One-Time QR Entry Validation** – Ticket QR codes carry the on-chain token ID. The organizer validates the token against the contract, and a successful validation permanently marks the ticket as used.
4. **Direct Transactions** – Explores reducing reliance on ticketing intermediaries through smart-contract-based transfers.

The prototype is built with Solidity, Ethers.js, OpenZeppelin, Next.js, MongoDB, Hardhat, and Docker.

> **Prototype scope:** Ticketchain demonstrates a technical approach; it does not claim to eliminate all ticket fraud or scalping. Production ticketing systems would also need identity/account security, anti-abuse controls, secure wallet UX, smart-contract audits, operational monitoring, and protections against off-platform transactions.

## Security Model in This Prototype

The included development flow is intentionally local-only:

- Hardhat provides unlocked development accounts on `127.0.0.1:8545`.
- The application asks the local Hardhat node for its organizer and customer signers instead of embedding private keys in frontend or backend source code.
- Only the contract owner (the organizer in the local deployment) may call `validateTicket`.
- Validation is one-time: the contract marks `usedTickets[tokenId] = true`, and used tickets cannot be validated again or resold.
- QR validation fails closed. A ticket is never displayed as valid unless a structured token ID is parsed and the on-chain validation transaction succeeds.

These choices are appropriate for a local hackathon prototype, not a production custody model. A production implementation should use authenticated organizer infrastructure and user-controlled wallets rather than unlocked development accounts.

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
cd ticket-contracts
npm install
cd ..
```

### 2. Start a local Hardhat node

```bash
cd ticket-contracts
npx hardhat node
```

Keep that terminal running.

### 3. Deploy the ticket contract

In another terminal:

```bash
cd ticket-contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address.

### 4. Configure environment variables

Create a `.env` file in the application root:

```env
MONGODB_URI=<your_mongodb_connection_string>
CONTRACT_ADDRESS=<deployed_contract_address>
```

No wallet private keys are required by the local prototype.

### 5. Run the application

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Contract Tests

The Hardhat tests cover the core ticket-entry invariants:

- only the organizer can validate a ticket;
- successful validation marks the ticket as used;
- a ticket cannot be validated twice;
- a validated ticket cannot be resold.

Run them with:

```bash
cd ticket-contracts
npm test
```

## 🐳 Docker

The frontend/backend prototype also includes Docker configuration for local experimentation:

```bash
docker-compose down
docker-compose up --build
```

## Production Considerations

Before a system like this could be used for real events, it would require at minimum:

- client-side wallet signing and secure wallet recovery;
- audited and upgrade-safe smart contracts;
- authenticated organizer/admin workflows;
- secure QR-code lifecycle and replay protection beyond a static token ID;
- monitoring, rate limiting, and abuse prevention;
- explicit policies for refunds, transfers, disputes, and off-chain identity.
