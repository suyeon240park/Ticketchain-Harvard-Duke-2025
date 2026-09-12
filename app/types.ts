import { ObjectId } from "mongodb";

export interface Event {
  id: string;
  name: string;
  date: string;
  price: number;
  maxResaleCap: number;
  location: string;
}

export interface Ticket {
  tokenId: number;
  tokenURI: string;
  event: Event;
}

export interface User {
  _id: ObjectId | string;
  tickets: Ticket[];
}

export interface UserTickets {
  _id: ObjectId;
  tickets: MongoTicket[];
}

export interface MongoTicket {
  tokenId: number;
  tokenURI: string;
  eventId: string;
}
