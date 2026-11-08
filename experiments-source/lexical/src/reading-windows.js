// Keep the reader DOM bounded while preserving every character and global offsets.
export function readingWindows(text,size=16000){const windows=[];let start=0;while(start<text.length){let end=Math.min(start+size,text.length);if(end<text.length){const space=text.lastIndexOf(' ',end-1);if(space>start)end=space+1}windows.push({start,end});start=end}return windows}
