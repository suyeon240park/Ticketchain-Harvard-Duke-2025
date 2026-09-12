import { NextApiRequest, NextApiResponse } from "next";
import { Contract, JsonRpcProvider, ethers } from "ethers";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

const TICKET_NFT_ABI = [
  "function mintTicket(address to, string tokenURI, uint256 maxResalePrice) external returns (uint256)",
  "event TicketMinted(address indexed owner, uint256 tokenId, string tokenURI)",
];

const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
      return res.status(400).json({ error: "userId and eventId are required." });
    }

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      return res.status(500).json({ error: "CONTRACT_ADDRESS is not configured." });
    }

    const client = await clientPromise;
    const eventDb = client.db("eventinfo");
    const eventsCollection = eventDb.collection("events");
    const userDb = client.db("userinfo");
    const ticketsCollection = userDb.collection("tickets");

    const eventInfo = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!eventInfo) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found.` });
    }

    // This hackathon prototype runs against a local Hardhat node. The node exposes
    // unlocked development accounts, so no private keys need to be stored in the app.
    const provider = new JsonRpcProvider(HARDHAT_RPC_URL);
    const organizerSigner = await provider.getSigner(0);
    const customerSigner = await provider.getSigner(1);
    const customerAddress = await customerSigner.getAddress();
    const organizerAddress = await organizerSigner.getAddress();
    const ticketContract = new Contract(contractAddress, TICKET_NFT_ABI, organizerSigner);

    const ticketPriceInEth = ethers.parseEther((eventInfo.price / 2000).toString());
    const maxResalePriceInEth = ethers.parseEther((eventInfo.maxResaleCap / 2000).toString());
    const tokenURI = ethers.keccak256(ethers.toUtf8Bytes(eventId));

    const mintTx = await ticketContract.mintTicket(
      customerAddress,
      tokenURI,
      maxResalePriceInEth
    );
    const mintReceipt = await mintTx.wait();
    if (!mintReceipt) {
      throw new Error("NFT minting transaction was not confirmed.");
    }

    const ticketMintedLog = mintReceipt.logs
      .map((log) => {
        try {
          return ticketContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((log) => log?.name === "TicketMinted");

    if (!ticketMintedLog) {
      throw new Error("TicketMinted event was not found in the mint receipt.");
    }

    const tokenId = Number(ticketMintedLog.args.tokenId);

    const paymentTx = await customerSigner.sendTransaction({
      to: organizerAddress,
      value: ticketPriceInEth,
    });
    const paymentReceipt = await paymentTx.wait();
    if (!paymentReceipt) {
      throw new Error("Payment transaction was not confirmed.");
    }

    const userObjectId = new ObjectId(userId);
    const existingUser = await ticketsCollection.findOne({ _id: userObjectId });
    if (!existingUser) {
      return res.status(404).json({ error: `Customer with ID ${userId} was not found.` });
    }

    const mongoTicket = {
      tokenId,
      tokenURI,
      eventId,
    };

    await ticketsCollection.updateOne(
      { _id: userObjectId },
      { $push: { tickets: mongoTicket as any } }
    );

    return res.status(200).json({
      success: true,
      tokenId,
      tokenURI,
      mintTransactionHash: mintReceipt.hash,
      paymentTransactionHash: paymentReceipt.hash,
    });
  } catch (error) {
    console.error("Ticket purchase failed:", error);
    return res.status(500).json({ error: "Ticket purchase failed." });
  }
}
