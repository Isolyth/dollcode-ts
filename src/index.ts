/**
 * DollCode - A base-3 text encoder/decoder using Unicode block characters
 *
 * Encodes text by converting each character's Unicode codepoint to base-3
 * using digits {1,2,3} mapped to configurable characters.
 *
 * Reverse-engineered from the now-defunct dollcode.v01dlabs.sh website.
 *
 * @packageDocumentation
 */

/**
 * Configuration for the characters used in encoding/decoding
 */
export interface CharacterSet {
	/** Character representing digit 1 (default: ▖ U+2596) */
	char1: string;
	/** Character representing digit 2 (default: ▘ U+2598) */
	char2: string;
	/** Character representing digit 3 (default: ▌ U+258C) */
	char3: string;
	/** Separator between encoded characters (default: U+200D zero-width joiner) */
	separator: string;
}

/**
 * Result of a decode operation
 */
export interface DecodeResult {
	/** The decoded text */
	text: string;
	/** Whether any errors occurred during decoding */
	hasErrors: boolean;
	/** Number of invalid groups encountered */
	errorCount: number;
}

/**
 * Default character set using Unicode block characters
 */
export const DEFAULT_CHARSET: CharacterSet = {
	char1: '\u2596', // ▖ (bottom left)
	char2: '\u2598', // ▘ (top left)
	char3: '\u258C', // ▌ (full left)
	separator: '\u200D' // Zero-width joiner
};

/**
 * Validates that a character set has non-empty, distinct characters
 *
 * @param charSet - The character set to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * ```ts
 * validateCharSet(DEFAULT_CHARSET); // true
 * validateCharSet({ char1: 'a', char2: 'a', char3: 'b', separator: '|' }); // false (duplicate)
 * ```
 */
export function validateCharSet(charSet: CharacterSet): boolean {
	const { char1, char2, char3, separator } = charSet;

	// Check all are non-empty
	if (!char1 || !char2 || !char3 || !separator) {
		return false;
	}

	// Check digits are distinct
	if (char1 === char2 || char1 === char3 || char2 === char3) {
		return false;
	}

	// Check separator is distinct from digits
	if (separator === char1 || separator === char2 || separator === char3) {
		return false;
	}

	return true;
}

/**
 * Encodes a single number using base-3 with digits {1,2,3}
 * Returns MSB (most significant bit) first
 */
function encodeNumber(number: number, charSet: CharacterSet): string {
	if (number === 0) {
		return charSet.char1; // Edge case: encode 0 as char1
	}

	const digits: string[] = [];
	let window = number;

	while (window > 0) {
		const remainder = window % 3;
		const r = remainder === 0 ? 3 : remainder;
		window = (window - r) / 3;

		// Map: 1→char1, 2→char2, 3→char3
		const digit = r === 1 ? charSet.char1 : r === 2 ? charSet.char2 : charSet.char3;
		digits.push(digit);
	}

	// Reverse for MSB-first encoding
	return digits.reverse().join('');
}

/**
 * Decodes a single dollcode group to a codepoint
 * Reads left-to-right with MSB first
 * Returns null if the group contains invalid characters
 */
function decodeGroup(group: string, charSet: CharacterSet): number | null {
	if (!group) {
		return null;
	}

	let accumulator = 0;
	let i = 0;

	while (i < group.length) {
		let digit = -1;

		// Try to match each character from the set (check longest first if needed)
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
			return null; // Invalid character
		}

		accumulator = accumulator * 3 + digit;
	}

	return accumulator;
}

/**
 * Encodes text to dollcode using a base-3 system with digits {1,2,3}
 *
 * Each character's Unicode codepoint is encoded separately.
 * Groups are separated by the separator character.
 *
 * @param text - The text to encode
 * @param charSet - Optional custom character set (defaults to DEFAULT_CHARSET)
 * @returns The encoded dollcode string
 *
 * @example
 * ```ts
 * encode('Hello');
 * // Returns: '▘▖▘▌‍▌▖▌▘‍▌▘▘▌‍▌▘▘▌‍▌▘▌▌‍'
 *
 * // With custom characters
 * encode('Hi', { char1: '1', char2: '2', char3: '3', separator: '|' });
 * // Returns: '2123|2131|'
 * ```
 */
export function encode(text: string, charSet: CharacterSet = DEFAULT_CHARSET): string {
	if (!text) {
		return '';
	}

	const encodedChars: string[] = [];

	// Use Array.from to properly handle Unicode (including emoji/surrogate pairs)
	for (const char of Array.from(text)) {
		const codepoint = char.codePointAt(0)!;
		const encoded = encodeNumber(codepoint, charSet);
		encodedChars.push(encoded);
	}

	// Join with separator and add trailing separator
	return encodedChars.join(charSet.separator) + charSet.separator;
}

/**
 * Decodes dollcode string back to text
 *
 * @param dollcode - The dollcode string to decode
 * @param charSet - Optional custom character set (defaults to DEFAULT_CHARSET)
 * @returns Object containing decoded text and error information
 *
 * @example
 * ```ts
 * decode('▘▖▘▌‍▌▖▌▘‍▌▘▘▌‍▌▘▘▌‍▌▘▌▌‍');
 * // Returns: { text: 'Hello', hasErrors: false, errorCount: 0 }
 *
 * decode('invalid▘▖▘▌‍');
 * // Returns: { text: '�H', hasErrors: true, errorCount: 1 }
 * ```
 */
export function decode(dollcode: string, charSet: CharacterSet = DEFAULT_CHARSET): DecodeResult {
	if (!dollcode) {
		return { text: '', hasErrors: false, errorCount: 0 };
	}

	// Split by separator and filter out empty groups
	const groups = dollcode.split(charSet.separator).filter((g) => g.length > 0);

	let text = '';
	let errorCount = 0;

	for (const group of groups) {
		const codepoint = decodeGroup(group, charSet);

		if (codepoint !== null && codepoint >= 0 && codepoint <= 0x10ffff) {
			text += String.fromCodePoint(codepoint);
		} else {
			text += '\uFFFD'; // Unicode replacement character
			errorCount++;
		}
	}

	return {
		text,
		hasErrors: errorCount > 0,
		errorCount
	};
}
