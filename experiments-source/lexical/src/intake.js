export const MAX_TEXT_LENGTH = 20000;
export function validateText(text, maxLength=MAX_TEXT_LENGTH) {
 if (typeof text !== 'string' || !text.trim()) return 'Add some text first.';
 if (text.length > maxLength) return 'Use up to '+maxLength.toLocaleString('en-US')+' characters. Try a shorter passage.';
 if (text.includes('\0')) return 'Choose a plain-text file.';
 if (!/[a-z]{3}/i.test(text)) return 'Add a passage with English words of three or more letters.';
 return '';
}
