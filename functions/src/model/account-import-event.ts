import { Timestamp } from "firebase-admin/firestore";

export interface AccountImportEvent {
  eventType: string;
  message: string;
  eventTime: Timestamp;
}

