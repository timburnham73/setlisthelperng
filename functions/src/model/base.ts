import { Timestamp } from "firebase-admin/firestore";

export interface Base {
    id?: string,
    documentPath?: string;
    createdByUser: any;
    dateCreated: Timestamp;
    lastEdit: Timestamp;
    lastUpdatedByUser: any;
}