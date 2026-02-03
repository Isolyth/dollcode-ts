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
interface CharacterSet {
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
interface DecodeResult {
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
declare const DEFAULT_CHARSET: CharacterSet;
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
declare function validateCharSet(charSet: CharacterSet): boolean;
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
declare function encode(text: string, charSet?: CharacterSet): string;
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
declare function decode(dollcode: string, charSet?: CharacterSet): DecodeResult;

export { type CharacterSet, DEFAULT_CHARSET, type DecodeResult, decode, encode, validateCharSet };
