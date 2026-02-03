# dollcode

A TypeScript implementation of the text-compatible dollcode encoding system, reverse-engineered from the now-defunct dollcode.v01dlabs.sh website.

## Installation

```bash
npm install dollcode
```

## Usage

```typescript
import { encode, decode } from 'dollcode';

// Encode text
const encoded = encode('Hello');
// Returns: '▘▖▘▌‍▌▖▌▘‍▌▘▘▌‍▌▘▘▌‍▌▘▌▌‍'

// Decode dollcode
const result = decode('▘▖▘▌‍▌▖▌▘‍▌▘▘▌‍▌▘▘▌‍▌▘▌▌‍');
// Returns: { text: 'Hello', hasErrors: false, errorCount: 0 }
```

### Custom Character Sets

You can use custom characters for encoding:

```typescript
import { encode, decode } from 'dollcode';

const customCharSet = {
  char1: '🌟',
  char2: '⭐',
  char3: '✨',
  separator: '|'
};

const encoded = encode('Hi', customCharSet);
// Returns: '⭐🌟⭐✨|⭐🌟✨🌟|'

const decoded = decode(encoded, customCharSet);
// Returns: { text: 'Hi', hasErrors: false, errorCount: 0 }
```

### Validation

```typescript
import { validateCharSet, DEFAULT_CHARSET } from 'dollcode';

validateCharSet(DEFAULT_CHARSET); // true
validateCharSet({ char1: 'a', char2: 'a', char3: 'b', separator: '|' }); // false (duplicates)
```

## API

### `encode(text: string, charSet?: CharacterSet): string`

Encodes text to dollcode.

### `decode(dollcode: string, charSet?: CharacterSet): DecodeResult`

Decodes dollcode back to text. Returns an object with:
- `text`: The decoded string
- `hasErrors`: Whether any invalid groups were encountered
- `errorCount`: Number of invalid groups (replaced with �)

### `validateCharSet(charSet: CharacterSet): boolean`

Validates that a character set has non-empty, distinct characters.

### `DEFAULT_CHARSET`

The default character set:
- `char1`: ▖ (U+2596)
- `char2`: ▘ (U+2598)
- `char3`: ▌ (U+258C)
- `separator`: Zero-width joiner (U+200D)

## About

Dollcode is a trinary (base-3) encoding system using Unicode block characters. This implementation was reverse-engineered using:

- The [dollcode.rs](https://codeberg.org/ember-ana/dollcode.rs) Rust crate (number encoding only)
- Information from [noe.sh/dollcode](https://noe.sh/dollcode)
- Analysis of example encoded strings

### How It Works

1. Each character is converted to its Unicode codepoint
2. The codepoint is encoded using base-3 with digits {1,2,3}
3. Digits are mapped to characters: 1→▖, 2→▘, 3→▌
4. Character groups are separated by zero-width joiners (U+200D)

### Technical Details

- **Encoding**: Base-3 system with digits {1,2,3} instead of {0,1,2}
- **Character Order**: Most significant bit first (MSB-first)
- **Unicode Support**: Full Unicode support including emoji

## License

MIT
