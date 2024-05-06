import { SetlistSong } from "../model/setlist-song";
import { updateSetlistStatistics } from "../utils";


//Main exported function.
export const updateSetlistSongStatistics = async (setlistSong: SetlistSong, accountId, setlistId) => {
    await updateSetlistStatistics(accountId, setlistId);
}
