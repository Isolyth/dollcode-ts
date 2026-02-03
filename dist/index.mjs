// src/index.ts
var DEFAULT_CHARSET = {
  char1: "\u2596",
  // ▖ (bottom left)
  char2: "\u2598",
  // ▘ (top left)
  char3: "\u258C",
  // ▌ (full left)
  separator: "\u200D"
  // Zero-width joiner
};
function validateCharSet(charSet) {
  const { char1, char2, char3, separator } = charSet;
  if (!char1 || !char2 || !char3 || !separator) {
    return false;
  }
  if (char1 === char2 || char1 === char3 || char2 === char3) {
    return false;
  }
  if (separator === char1 || separator === char2 || separator === char3) {
    return false;
  }
  return true;
}
function encodeNumber(number, charSet) {
  if (number === 0) {
    return charSet.char1;
  }
  const digits = [];
  let window = number;
  while (window > 0) {
    const remainder = window % 3;
    const r = remainder === 0 ? 3 : remainder;
    window = (window - r) / 3;
    const digit = r === 1 ? charSet.char1 : r === 2 ? charSet.char2 : charSet.char3;
    digits.push(digit);
  }
  return digits.reverse().join("");
}
function decodeGroup(group, charSet) {
  if (!group) {
    return null;
  }
  let accumulator = 0;
  let i = 0;
  while (i < group.length) {
    let digit = -1;
    if (group.substring(i).startsWith(charSet.char3)) {
      digit = 3;
      i += charSet.char3.length;
    } else if (group.substring(i).startsWith(charSet.char2)) {
      digit = 2;
      i += charSet.char2.length;
    } else if (group.substring(i).startsWith(charSet.char1)) {
      digit = 1;
      i += charSet.char1.length;
    } else {
      return null;
    }
    accumulator = accumulator * 3 + digit;
  }
  return accumulator;
}
function encode(text, charSet = DEFAULT_CHARSET) {
  if (!text) {
    return "";
  }
  const encodedChars = [];
  for (const char of Array.from(text)) {
    const codepoint = char.codePointAt(0);
    const encoded = encodeNumber(codepoint, charSet);
    encodedChars.push(encoded);
  }
  return encodedChars.join(charSet.separator) + charSet.separator;
}
function decode(dollcode, charSet = DEFAULT_CHARSET) {
  if (!dollcode) {
    return { text: "", hasErrors: false, errorCount: 0 };
  }
  const groups = dollcode.split(charSet.separator).filter((g) => g.length > 0);
  let text = "";
  let errorCount = 0;
  for (const group of groups) {
    const codepoint = decodeGroup(group, charSet);
    if (codepoint !== null && codepoint >= 0 && codepoint <= 1114111) {
      text += String.fromCodePoint(codepoint);
    } else {
      text += "\uFFFD";
      errorCount++;
    }
  }
  return {
    text,
    hasErrors: errorCount > 0,
    errorCount
  };
}
export {
  DEFAULT_CHARSET,
  decode,
  encode,
  validateCharSet
};
