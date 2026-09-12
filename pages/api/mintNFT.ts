import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

const TICKET_NFT_ABI = [
  "function mintTicket(address to, string tokenURI, uint256 maxResalePrice) external returns (uint256)",
  "event TicketMinted(address indexed owner, uint256 tokenId, string tokenURI)",
];

const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    return res.status(500).json({ error: "CONTRACT_ADDRESS is not configured." });
  }

  try {
    const { customerAddress, tokenURI, maxResalePrice } = req.body;
    if (!customerAddress || !tokenURI || maxResalePrice === undefined) {
      return res.status(400).json({
        error: "customerAddress, tokenURI, and maxResalePrice are required.",
      });
    }

    // Local-development only: Hardhat exposes unlocked accounts. Using the
    // signer supplied by the node avoids putting a private key in application code.
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    const organizerSigner = await provider.getSigner(0);
    const contract = new ethers.Contract(
      contractAddress,
      TICKET_NFT_ABI,
      organizerSigner
    );

    const tx = await contract.mintTicket(customerAddress, tokenURI, maxResalePrice);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Mint transaction was not confirmed.");
    }

    const ticketMintedLog = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((log) => log?.name === "TicketMinted");

    if (!ticketMintedLog) {
      throw new Error("TicketMinted event was not found.");
    }

    return res.status(200).json({
      success: true,
      tokenId: ticketMintedLog.args.tokenId.toString(),
    });
  } catch (error) {
    console.error("Minting error:", error);
    return res.status(500).json({ error: "Failed to mint NFT." });
  }
}
