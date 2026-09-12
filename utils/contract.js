import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

const TICKET_NFT_ABI = [
  "function validateTicket(uint256 tokenId) external",
  "function usedTickets(uint256 tokenId) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function mintTicket(address to, string tokenURI, uint256 maxResalePrice) external returns (uint256)",
];

export async function getOrganizerContract() {
  const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
  const organizerSigner = await provider.getSigner(0);
  return new ethers.Contract(CONTRACT_ADDRESS, TICKET_NFT_ABI, organizerSigner);
}
