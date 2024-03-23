import { Timestamp } from "firebase/firestore";

export interface AccountImportEvent {
  id: string;
  eventType: string;
  message: string;
  eventTime: Timestamp;
}

