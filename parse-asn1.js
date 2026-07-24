import fs from 'fs';

const der = fs.readFileSync('./key.der');
console.log('Total DER length:', der.length);

function parseTLV(buffer, offset, depth = 0) {
  const indent = '  '.repeat(depth);
  if (offset >= buffer.length) {
    console.log(`${indent}[End of buffer]`);
    return;
  }

  const tag = buffer[offset];
  let len = buffer[offset + 1];
  let lenBytes = 1;

  if (len & 0x80) {
    const numBytes = len & 0x7f;
    len = 0;
    for (let i = 0; i < numBytes; i++) {
      len = (len << 8) | buffer[offset + 2 + i];
    }
    lenBytes = 1 + numBytes;
  }

  const headerLen = 1 + lenBytes;
  const contentOffset = offset + headerLen;
  
  console.log(`${indent}Tag: 0x${tag.toString(16).padStart(2, '0')}, HeaderLen: ${headerLen}, Length: ${len}, ContentOffset: ${contentOffset}, Offset: ${offset}`);

  if (contentOffset + len > buffer.length) {
    console.error(`${indent}❌ ERROR: Element length (${len}) exceeds remaining buffer size (${buffer.length - contentOffset})!`);
    console.error(`${indent}Remaining buffer hex:`, buffer.subarray(offset).toString('hex').substring(0, 100));
    return;
  }

  // Constructive tags (like Sequence)
  if ((tag & 0x20) === 0x20) {
    let childOffset = contentOffset;
    const end = contentOffset + len;
    while (childOffset < end) {
      parseTLV(buffer, childOffset, depth + 1);
      // Wait, how do we advance childOffset?
      // We can inspect the child's length
      const childTag = buffer[childOffset];
      let childLen = buffer[childOffset + 1];
      let childLenBytes = 1;
      if (childLen & 0x80) {
        const numBytes = childLen & 0x7f;
        childLen = 0;
        for (let i = 0; i < numBytes; i++) {
          childLen = (childLen << 8) | buffer[childOffset + 2 + i];
        }
        childLenBytes = 1 + numBytes;
      }
      childOffset += 1 + childLenBytes + childLen;
    }
  } else {
    // Primitive tag
    console.log(`${indent}Value hex:`, buffer.subarray(contentOffset, contentOffset + Math.min(len, 20)).toString('hex') + (len > 20 ? '...' : ''));
  }
}

try {
  parseTLV(der, 0);
} catch (e) {
  console.error(e);
}
