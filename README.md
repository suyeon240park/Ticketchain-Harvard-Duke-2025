Note: This is a submission for the 2025 Harvard & Duke LIVE AI Ivy Plus Hackathon.
https://devpost.com/software/ticketchain-op65ls

# 🎟️ Ticketchain
Traditional ticketing systems suffer from scalping, counterfeit tickets, and excessive fees. Ticketchain is a blockchain-powered NFT ticketing system that eliminates these issues by ensuring secure, transparent, and fair transactions.
Key Features:
1. No Scalping & Fraud – Smart contracts enforce resale price limits & verify ownership
2. Blockchain-Powered Security – Tickets are NFTs, ensuring authenticity & transparency
3. Seamless Entry – Instant validation via QR code scanning & local blockchain node
4. Lower Fees – Eliminates intermediaries, reducing costs for buyers & organizers

Powered by Solidity, Ethers.js, OpenZeppelin, Next.js, and MongoDB, Ticketchain offers a trustless, efficient, and decentralized ticketing solution for the future of events.

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

### 🚀 Deploy Contracts to Local Blockchain
```bash
npx hardhat run --network localhost scripts/deploy.js
```

### 🔗 Run a Local Blockchain Node
```bash
npx hardhat node
```

### 🔑 Configure Environment Variables
Create a `.env` file and store the necessary credentials:
```env
MONGODB_URI=<your_mongodb_connection_string>
CONTRACT_ADDRESS=<deployed_contract_address>
ORGANIZER_PRIVATE_KEY=<organizer_wallet_private_key>
CUSTOMER_PRIVATE_KEY=<customer_wallet_private_key>
```

## 🖥️ Running the Development Server

```bash
npm run dev  # or yarn dev, pnpm dev, bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Running with Docker

### 🏗️ Build the Docker Image
```bash
docker build --no-cache -t ticketchain .
```

### 🚢 Run the Docker Container
```bash
docker run -p 3000:3000 ticketchain
```

Or, using **Docker Compose**:
```bash
docker-compose down
docker-compose up --build
```

### 🛠️ Docker Management

#### 🔍 View Running Containers
```bash
docker ps
```

#### 🔧 Access Container Shell
```bash
docker exec -it <container-id> sh
