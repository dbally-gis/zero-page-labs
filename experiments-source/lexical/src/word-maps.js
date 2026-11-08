// User words must never inherit JavaScript object properties.
export function countWords(nodes){const map=Object.create(null);for(const {word} of nodes)map[word]=(map[word]||0)+1;return map}
export function indexWords(nodes){const map=Object.create(null);for(const {word,index} of nodes){if(!map[word])map[word]=[];map[word].push(index)}return map}
