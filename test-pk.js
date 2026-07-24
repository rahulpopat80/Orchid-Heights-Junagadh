import { webcrypto } from 'crypto';
import { Buffer } from 'buffer';

const crypto = (globalThis.crypto || webcrypto);

const keyBase64 = 'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdkFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLWXdnZ1NpQWdFQUFvSUJBUURBSjJJR0pDRGN5MnVQXG5tRWFNSGt3R2xIRkpKRG5QV1ZMRytPRUhuMDNSSk5JNHFWdnJxdzN6Y2U2RXo0QWZDdFVVc2t5eVJ5bWdVams4XG5pVzNXb3ZaWkFvbnk1ekJvNEJMaUl1VTB5amJUTHB6U2d2ZDFrVmlseEdJODM0U0JZdHppTkVUVU8raDU1ZjJvXG5QKy9BcWVQU0dDdlZIb2ZmMmpIQzJQTjRjNE4zZ3IyRHVEZ2Frd1BURWZiaC84R1JjOUgwOFg4emlhNnR1WkhVXG5VLzNiQ1FBd0pmTW44MXlOQ0dDenZPQ3FWVys2SklrVm4zQVdKRGdWbDBubzhpYXBNZFpGd3NmNUIraVoxSUNnXG5Xc3hiYWROVzNuSHpSbkpTY0haakw1aHZFV3BSU0pLWTRia053Z0lmYWVJSnVkN0NYTFhQWG9ucXQzTXY4Y0lwXG4rdCtFd2ZxaEFnTUJBQUVDZ2Y5ZC9vaTZqNVNhK0ltd3FLbDhzcHNneTJUOEtDVUg5MEVHdHFCMGdzb2xTaTh1XG5LMDBkSGVFR25ha2JDSlE2K0RSeDM2N1RWK1RoOEczMzNYQ0wzMEs1ZGtwS2ZDbkpVZ0ZmRVd6Mks1ZDNjSGlqXG5ETXFpdzdDOFRvNTVyTnpTK1gyMkVmS3dtUHFmWUpCTGhPLzh6c0QwRUR2c2JTWEVONzE4ek9rMDl1OWo3bndVXG5cbmMwZ1J5bVFLRDRUNVpmZGZkaHVhdkJMaWRUa2ZDV3hvNUFidENPb3ZEZ3FaV3hXOUFybUtnZWF0Z0pNdy9GMGpcbjcrQkRnMSt3YTRHSWtLd29pMS90NTRNNVlCdHF6SlpvVWszRjhpNEJLMmw0RTRJL1FPZ2N4c0hIdExHTDBFa3ZcbjBpMEJJUmhQNisxUDd3bDRFYURiam1TL3ljaTlYbXl2cmswNnRrQ2dZRUE5Ty8xVlJ1NFJaZU1ic1RMcGJpTVxudGlMVTMrTFpDRzJUY0kwS29xU3BtVjNBLzV2RTA3R2VMT2ZBRjZ6REp1dkZhRWhYbzVPOVlaYjJMSHlxdHF3ZVxubXlVRXdjWXU3N05tZjI0bkhOVXJrTzVWVUdkTllZbldFTnJpVWNUNGZrT2RmMlk1RDFyK0pwUlpIMDBBVnhyeFxua1hUL2VjUmkvUUlLS0s4eFZKV0x0SFVDZ1lFQXlOVWdGNHlCaHJ2eU9TYlhVNXFEb08rMFIwS1lXaklML243XG56WUp4TWxhdk4wR1crWGpRcllNSW5KRWtyV3Fpa2REWTBRWWMzcUUvRGhmYWU4d2dXN1JLRlZ4dFA4Sko4UG9UXG53TXpSVzdEemd1eWl5VkR3M3hIUzR0Zjc1REtMTEtoYnVjSlBVVTR0NnEvV0Rhb3FRTlBGV1Aya1NEQjJ5OUJoXG42TExOdC8wQ2dZQm95ATVucmtnU1hWYVNQRlh5T3hUWEJlZVRMM1F4Q3M4OEl0b2Q0ZHM3NU1PZDMzRkFMb2ZBXG5KaFFqREtFZmtWVU4yNFRDVVgxK3Robnh4aE14dWtnTmpyU09RTDNyaFErZ0MvdG5kam9BOGpSRkJTd3hRY24xXG53KzExbFpISVVoeWFWNXlwV1AvSVVEU2Z3U29ZR1VxbU15cm5hSUFBUkZNWEdrczhLQTF2MFFLQmdRREF4M3hIXG52cEx5LzJTVEllT1RTZ1hDTFhaUzFRVGh3RFF4Z1hnSkhJYUdPSmwycEJwRkhJakxsYlZsZlJuRThWQmVRaWh0XG45TDB2bzM3QWkzc3BUSmRmRDkveFEwaUhaSHZQdW0zTnE0M253eUxzOFRPTnBZbWh4eDAwclBqWll2OGZmZmlXXG5ob1BXMndIT2ZyMHRYc095ZU5XK0I3TnpyRG5NaVJvQzRlZ0JDUUtCZ1FDRktRQ2Fyanh1NndKbGpuR1FlTjNxXG5jcWE5SStqWlRDWWdKOUlYTWEzbE1SaXJ5RDFGdHEwTmtFZERNRHdTcFZvb2VZUUU1cUxiWHo5Q2FzUVk5T0kvXG5zaFloNVhielo3c2Y5NVNpMHpVbTdaZE5ySlRvcjFTNWZoM1VnWGZMWjE5bHZUbC9PMml2eHh5eVlMYTZROE51OEx4RUN5bE8zK1I2azV4cEZEWU9kdz09XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0t';

function base64ToArrayBuffer(b64) {
  const buf = Buffer.from(b64, 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

const decoded = Buffer.from(keyBase64, 'base64').toString('utf-8');
const replaced = decoded.replace(/\\n/g, '\n');

const pemHeader = "-----BEGIN PRIVATE KEY-----";
const pemFooter = "-----END PRIVATE KEY-----";
let pemContents = replaced.trim();
if (pemContents.startsWith(pemHeader)) {
  pemContents = pemContents.substring(pemHeader.length);
}
if (pemContents.endsWith(pemFooter)) {
  pemContents = pemContents.substring(0, pemContents.length - pemFooter.length);
}
pemContents = pemContents.replace(/\s/g, "");

async function test() {
  try {
    const derBuffer = base64ToArrayBuffer(pemContents);
    console.log('derBuffer length:', derBuffer.byteLength);

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      derBuffer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" }
      },
      false,
      ["sign"]
    );
    console.log('Successfully imported cryptoKey!', cryptoKey);
  } catch (err) {
    console.error('Error importing key:', err);
  }
}

test();
