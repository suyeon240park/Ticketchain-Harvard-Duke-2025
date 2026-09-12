'use client';

import { useEffect, useRef, useState } from 'react';
import { readQRFromFile } from '../../../hooks/qrcodeReader';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { ethers } from 'ethers';

const TICKET_NFT_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

const TICKET_NFT_ABI = [
  "function validateTicket(uint256 tokenId) external",
  "function usedTickets(uint256 tokenId) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
];

interface TicketData {
  tokenId: number;
}

export default function OrganizerPage2() {
  const [event, setEvent] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>("");
  const [organizerAddress, setOrganizerAddress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get('eventName');
    if (eventName) {
      setEvent(decodeURIComponent(eventName));
    }

    const loadOrganizer = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
        const signer = await provider.getSigner(0);
        setOrganizerAddress(await signer.getAddress());
      } catch (error) {
        console.error("Unable to connect to local Hardhat organizer account:", error);
        setStatus("Local blockchain is not available.");
      }
    };

    loadOrganizer();
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsValid(null);
    setTicketData(null);
    setQrResult(null);
    setStatus("Reading QR code...");

    try {
      const result = await readQRFromFile(file);
      if (!result) {
        setStatus("No QR code was found in the selected image.");
        return;
      }

      setQrResult(result);

      try {
        const parsed = JSON.parse(result) as Partial<TicketData>;
        if (!Number.isInteger(parsed.tokenId) || (parsed.tokenId as number) < 0) {
          setStatus("QR code does not contain a valid blockchain token ID.");
          return;
        }

        setTicketData({ tokenId: parsed.tokenId as number });
        setStatus("QR code parsed. Ready to validate on-chain.");
      } catch {
        setStatus("QR code payload is not valid ticket JSON.");
      }
    } catch (error) {
      console.error("QR code read error:", error);
      setStatus("Failed to read the QR code.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleValidateTicket = async () => {
    // Fail closed: never show a valid state unless a parsed token is confirmed on-chain.
    if (!ticketData) {
      setIsValid(false);
      setStatus("No valid ticket data is loaded.");
      return;
    }

    try {
      setIsValid(null);
      setStatus("Checking ticket on blockchain...");

      const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
      const organizerSigner = await provider.getSigner(0);
      const contract = new ethers.Contract(
        TICKET_NFT_ADDRESS,
        TICKET_NFT_ABI,
        organizerSigner
      );

      // ownerOf verifies that the token exists. The contract itself enforces
      // organizer-only validation and rejects already-used tickets.
      await contract.ownerOf(ticketData.tokenId);
      const alreadyUsed = await contract.usedTickets(ticketData.tokenId);
      if (alreadyUsed) {
        setIsValid(false);
        setStatus("Ticket has already been used.");
        return;
      }

      setStatus("Validating ticket on blockchain...");
      const tx = await contract.validateTicket(ticketData.tokenId);
      await tx.wait();

      setIsValid(true);
      setStatus("Ticket validated successfully.");
    } catch (error: any) {
      console.error("Ticket validation error:", error);
      setIsValid(false);
      setStatus(`Ticket validation failed: ${error?.shortMessage ?? error?.message ?? "Unknown error"}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Ticket Verification</h1>
        {event ? (
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Event: {event}</h2>
        ) : (
          <p className="text-gray-600">No event selected.</p>
        )}

        <p className="text-gray-700">
          Organizer wallet: {organizerAddress ?? "Not connected"}
        </p>

        <div
          ref={dropzoneRef}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 mt-6 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-500 mb-3" />
          <p className="text-gray-600 font-medium">Click or drag a QR code image here</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>

        {qrResult && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 break-all">QR Code Data: {qrResult}</p>
            {ticketData && (
              <div className="mt-4">
                <p><strong>Token ID:</strong> {ticketData.tokenId}</p>
                <button
                  onClick={handleValidateTicket}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Validate Ticket on Blockchain
                </button>
              </div>
            )}
          </div>
        )}

        {status && (
          <div className={`mt-6 p-4 rounded-lg shadow-md flex items-center justify-center gap-3 border-2 ${
            isValid === true
              ? 'border-green-400 bg-green-50'
              : isValid === false
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-gray-50'
          }`}>
            {isValid === true ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <p className="text-lg font-medium text-green-700">{status}</p>
              </>
            ) : isValid === false ? (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <p className="text-lg font-medium text-red-700">{status}</p>
              </>
            ) : (
              <p className="text-lg font-medium text-gray-700">{status}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
