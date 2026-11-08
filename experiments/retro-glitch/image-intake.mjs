export const MAX_BYTES=10*1024*1024,MAX_PIXELS=24000000,MAX_EDGE=1200;
export function imageDimensions(bytes){const b=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),n=bytes.length;
 if(n>=24&&b.getUint32(0)===0x89504e47&&b.getUint32(4)===0x0d0a1a0a)return {width:b.getUint32(16),height:b.getUint32(20)};
 if(n>4&&b.getUint16(0)===0xffd8){let p=2;while(p+4<n){if(bytes[p++]!==255)throw Error('Invalid JPEG.');const marker=bytes[p++];if(marker===217||marker===218)break;const len=b.getUint16(p);if(len<2||p+len>n)throw Error('Invalid JPEG.');if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){if(len<7)break;return {height:b.getUint16(p+3),width:b.getUint16(p+5)}}p+=len}}
 throw Error('Choose a valid PNG or JPEG image.');}
export function validateImage(bytes){if(bytes.length>MAX_BYTES)throw Error('Choose an image smaller than 10 MB.');const size=imageDimensions(bytes);if(!size.width||!size.height||size.width*size.height>MAX_PIXELS)throw Error('Choose an image up to 24 megapixels.');return size;}
