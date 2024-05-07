import { AccountImport } from "../model/account-import";

export default async (accountImportSnap, context) => {
    const accountId = context.params.accountId;
    const accountImport = accountImportSnap.data() as AccountImport;
    accountImport.id = accountImport.id;

    

}