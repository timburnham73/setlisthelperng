import { LyricFormatSongPart } from "./lyric-format-songpart"

export const lyricParts = [
    { name: "Title", value: 'title' }, 
    { name: "Subtitle", value: 'subtitle' }, 
    { name: "Chords", value: 'chord' }, 
    { name: "Lyrics", value: 'lyric' },
    { name: "Song Part", value: 'song-part' }
];

export const fonts = [
    { name: "Courier New", value: 'Courier New' }, 
    { name: "Times New Roman", value: 'Times New Roman' }, 
    { name: "Arial", value: 'Arial' }, 
    { name: "Georgia", value: 'Georgia' }, 
    { name: "Trebuchet", value: 'Trebuchet' }, 
    { name: "Verdana", value: 'Verdana' }
];

export const fontSizes = [
    {name: "1 (8px)", value: "xx-small"}, 
    {name: "2 (10px)", value: "x-small"}, 
    {name: "3 (12px)", value: "small"}, 
    {name: "4 (14px)", value: "medium"}, 
    {name: "5 (18px)", value: "large"},
    {name: "6 (24px)", value:  "x-large"},
    {name: "7 (26px)", value:  "xx-large"}
];


export interface LyricFormat {
    font: string;
    lyricPartFormat: LyricFormatSongPart[];
}

export class LyricFormatHelper {
    static getDefaultFormat(): LyricFormat {
        const lyricFormat = {
            font: "Arial",
            lyricPartFormat: []
        } as LyricFormat;

        lyricFormat.lyricPartFormat.push({
            lyricPart: "title",
            fontSize: "x-large",
            isBold: true,
            isItalic: false,
            isUnderlined: false,
            show: true
        });

        lyricFormat.lyricPartFormat.push({
            lyricPart: "subtitle",
            fontSize: "large",
            isBold: true,
            isItalic: false,
            isUnderlined: false,
            show: true
        });

        lyricFormat.lyricPartFormat.push({
            lyricPart: "lyric",
            fontSize: "medium",
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            show: true
        });
        lyricFormat.lyricPartFormat.push({
            lyricPart: "chord",
            fontSize: "medium",
            isBold: true,
            isItalic: false,
            isUnderlined: false,
            show: true
        });

        lyricFormat.lyricPartFormat.push({
            lyricPart: "song-part",
            fontSize: "medium",
            isBold: true,
            isItalic: false,
            isUnderlined: false,
            show: true
        });

        lyricFormat.lyricPartFormat.push({
            lyricPart: "comment",
            fontSize: "small",
            isBold: false,
            isItalic: true,
            isUnderlined: true,
            show: true
        });

        return lyricFormat;
    }
}