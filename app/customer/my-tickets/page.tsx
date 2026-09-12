"use client";

import { useEffect, useState } from "react";
import TicketCard from "../../components/TicketCard";
import { Event } from "../../types";
import { useTickets } from "../../../hooks/useTickets";
import useEvents from "../../../hooks/useEvents";

interface Ticket {
  tokenId: number;
  tokenURI: string;
  event: Event;
  ticketId: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { showTickets } = useTickets();
  const { getEventById } = useEvents();

  useEffect(() => {
    const fetchTickets = async () => {
      const userId = "67b6c218325907d43b7210d5"; // Hackathon demo user.
      const fetchedTickets = await showTickets(userId);

      if (!fetchedTickets) return;

      const ticketsWithEvents = await Promise.all(
        fetchedTickets.map(async (ticket) => {
          if (!Number.isInteger(ticket.tokenId) || ticket.tokenId < 0) {
            console.warn("Skipping legacy ticket without a blockchain tokenId", ticket);
            return null;
          }

          const event = await getEventById(ticket.eventId);
          if (!event) return null;

          return {
            tokenId: ticket.tokenId,
            tokenURI: ticket.tokenURI,
            event,
            ticketId: `TICKET-${ticket.tokenId}`,
          };
        })
      );

      setTickets(ticketsWithEvents.filter((ticket): ticket is Ticket => ticket !== null));
    };

    fetchTickets();
  }, [showTickets, getEventById]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Tickets</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.tokenId}
            event={ticket.event}
            ticketId={ticket.ticketId}
            qr_message={JSON.stringify({ tokenId: ticket.tokenId })}
          />
        ))}
      </div>
    </main>
  );
}
