import { describe, it, expect } from 'vitest';
import { encode, decode, validateCharSet, DEFAULT_CHARSET } from './index';

describe('encode', () => {
	it('encodes "Hello" correctly', () => {
		const result = encode('Hello');
		expect(result).toBe('▘▖▘▌‍▌▖▌▘‍▌▘▘▌‍▌▘▘▌‍▌▘▌▌‍');
	});

	it('returns empty string for empty input', () => {
		expect(encode('')).toBe('');
	});

	it('handles single character', () => {
		const result = encode('A');
		expect(result).toBe('▖▌▌▘‍');
	});

	it('handles emoji', () => {
		const encoded = encode('🎉');
		const decoded = decode(encoded);
		expect(decoded.text).toBe('🎉');
		expect(decoded.hasErrors).toBe(false);
	});

	it('uses custom character set', () => {
		const charSet = {
			char1: '1',
			char2: '2',
			char3: '3',
			separator: '|'
		};
		const result = encode('A', charSet);
		expect(result).toBe('1332|');
	});
});

describe('decode', () => {
	it('decodes "Hello" correctly', () => {
		const result = decode('▘▖▘▌‍▌▖▌▘‍▌▘▘▌‍▌▘▘▌‍▌▘▌▌‍');
		expect(result.text).toBe('Hello');
		expect(result.hasErrors).toBe(false);
		expect(result.errorCount).toBe(0);
	});

	it('returns empty result for empty input', () => {
		const result = decode('');
		expect(result.text).toBe('');
		expect(result.hasErrors).toBe(false);
		expect(result.errorCount).toBe(0);
	});

	it('handles invalid groups', () => {
		const result = decode('invalid‍▘▖▘▌‍');
		expect(result.hasErrors).toBe(true);
		expect(result.errorCount).toBe(1);
		expect(result.text).toContain('�');
	});

	it('uses custom character set', () => {
		const charSet = {
			char1: '1',
			char2: '2',
			char3: '3',
			separator: '|'
		};
		const result = decode('1332|', charSet);
		expect(result.text).toBe('A');
	});
});

describe('roundtrip', () => {
	it('encodes and decodes text correctly', () => {
		const original = 'Hello, World! 123';
		const encoded = encode(original);
		const decoded = decode(encoded);
		expect(decoded.text).toBe(original);
		expect(decoded.hasErrors).toBe(false);
	});

	it('handles various Unicode characters', () => {
		const testCases = ['café', '日本語', '🎉🎊🎁', 'mixed 混合 🎉'];
		for (const original of testCases) {
			const encoded = encode(original);
			const decoded = decode(encoded);
			expect(decoded.text).toBe(original);
		}
	});

	it('works with custom character set', () => {
		const charSet = {
			char1: '🌟',
			char2: '⭐',
			char3: '✨',
			separator: '|'
		};
		const original = 'Test!';
		const encoded = encode(original, charSet);
		const decoded = decode(encoded, charSet);
		expect(decoded.text).toBe(original);
	});
});

describe('validateCharSet', () => {
	it('validates default charset', () => {
		expect(validateCharSet(DEFAULT_CHARSET)).toBe(true);
	});

	it('rejects empty characters', () => {
		expect(validateCharSet({ char1: '', char2: '2', char3: '3', separator: '|' })).toBe(false);
		expect(validateCharSet({ char1: '1', char2: '', char3: '3', separator: '|' })).toBe(false);
		expect(validateCharSet({ char1: '1', char2: '2', char3: '', separator: '|' })).toBe(false);
		expect(validateCharSet({ char1: '1', char2: '2', char3: '3', separator: '' })).toBe(false);
	});

	it('rejects duplicate digits', () => {
		expect(validateCharSet({ char1: 'a', char2: 'a', char3: 'c', separator: '|' })).toBe(false);
		expect(validateCharSet({ char1: 'a', char2: 'b', char3: 'a', separator: '|' })).toBe(false);
		expect(validateCharSet({ char1: 'a', char2: 'b', char3: 'b', separator: '|' })).toBe(false);
	});

	it('rejects separator matching a digit', () => {
		expect(validateCharSet({ char1: 'a', char2: 'b', char3: 'c', separator: 'a' })).toBe(false);
		expect(validateCharSet({ char1: 'a', char2: 'b', char3: 'c', separator: 'b' })).toBe(false);
		expect(validateCharSet({ char1: 'a', char2: 'b', char3: 'c', separator: 'c' })).toBe(false);
	});

	it('accepts valid custom charset', () => {
		expect(validateCharSet({ char1: '🌟', char2: '⭐', char3: '✨', separator: '|' })).toBe(true);
	});
});
