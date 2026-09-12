Note: This project was submitted to the 2025 Harvard & Duke LIVE AI Ivy Plus Hackathon.

Devpost: https://devpost.com/software/ticketchain-op65ls

# 🎟️ Ticketchain

Ticketchain is a hackathon prototype exploring blockchain-backed ticket ownership and resale constraints. The project uses NFT tickets and smart contracts to demonstrate ways to reduce common ticketing problems such as counterfeit tickets, opaque ownership, and excessive resale prices.

## Key Features

1. **Resale Controls** – Smart contracts can enforce resale-price rules and verify on-chain ownership.
2. **Verifiable Ticket Ownership** – Tickets are represented as NFTs, providing transparent ownership records.
3. **QR-Based Entry Prototype** – Demonstrates ticket validation through QR scanning against a local blockchain environment.
4. **Direct Transactions** – Explores reducing reliance on ticketing intermediaries through smart-contract-based transfers.

The prototype is built with Solidity, Ethers.js, OpenZeppelin, Next.js, MongoDB, Hardhat, and Docker.

> **Prototype scope:** Ticketchain demonstrates a technical approach; it does not claim to eliminate all ticket fraud or scalping. Production ticketing systems would also need identity/account security, anti-abuse controls, secure wallet UX, smart-contract audits, operational monitoring, and protections against off-platform transactions.

## 🚀 Getting Started

### 📌 Initialize Hardhat Project

```bash
cd ticket-contracts
npx hardhat init
```

### 🛠️ Compile Smart Contracts

```bash
npx hardhat compile
```

### 🔗 Run a Local Blockchain Node

```bash
npx hardhat node
```

### 🚀 Deploy Contracts to the Local Blockchain

In a separate terminal:

```bash
npx hardhat run --network localhost scripts/deploy.js
```

### 🔑 Configure Environment Variables

Create a `.env` file for local development:

```env
MONGODB_URI=<your_mongodb_connection_string>
CONTRACT_ADDRESS=<deployed_contract_address>
ORGANIZER_PRIVATE_KEY=<local_test_wallet_private_key>
CUSTOMER_PRIVATE_KEY=<local_test_wallet_private_key>
```

**Security note:** `ORGANIZER_PRIVATE_KEY` and `CUSTOMER_PRIVATE_KEY` are intended only for local hackathon/test wallets. Never use production wallet private keys in application environment files or commit private keys to source control. A production implementation should use user-controlled wallets and client-side transaction signing rather than having the application custody customer private keys.

## 🖥️ Running the Development Server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## 🐳 Running with Docker

### Build the Docker Image

```bash
docker build --no-cache -t ticketchain .
```

### Run the Docker Container

```bash
docker run -p 3000:3000 ticketchain
```

Or use Docker Compose:

```bash
docker-compose down
docker-compose up --build
```

### Docker Management

```bash
docker ps
```

```bash
docker exec -it <container-id> sh
```

## Production Considerations

Before a system like this could be used for real events, it would require at minimum:

- client-side wallet signing and secure wallet recovery;
- audited and upgrade-safe smart contracts;
- authenticated organizer/admin workflows;
- secure QR-code lifecycle and replay protection;
- monitoring, rate limiting, and abuse prevention;
- explicit policies for refunds, transfers, disputes, and off-chain identity.
