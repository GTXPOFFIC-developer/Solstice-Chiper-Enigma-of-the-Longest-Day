# Solstice Cipher — Enigma of the Longest Day

A browser-based Enigma machine puzzle game set on the June solstice. Decode (or encode) encrypted transmissions before the daylight runs out.

## Built By

**Sudipto** — Original developer

Feel free to fork, tinker, and include this in your own projects. Just mention the original developer's name.

## How to Play

### Objective
Configure the Enigma machine correctly to decode each level's ciphertext (or encode the plaintext) before the sun sets. Each wrong guess costs 45 minutes of daylight; correct guesses pause the timer for 30 seconds.

### Controls

| Control | What it does |
|---|---|
| **Rotor dropdowns** | Select which 3 rotors (I–V) are used |
| **▲ / ▼ buttons** | Adjust each rotor's starting position |
| **Plugboard** | Drag from one letter to another to connect them with a coloured wire (swaps those letters inside the machine) |
| **Keyboard** | Type the highlighted letter — click on-screen or use your physical keyboard |
| **Lampboard** | Lights up with the Enigma's output letter |
| **Reset Machine** | Re-initialises the Enigma to the level's default settings |
| **Skip Story** | Skip the level's intro story text |
| **How to Play** | Re-open the tutorial overlay |

### Tools

- **Bombe** — Enter a crib word (a word you expect in the message) and search nearby rotor positions for a match.
- **Frequency Analysis** — Shows letter frequency in the source text vs. normal English distribution.

### Scoring

- Correct letter: +100 points, timer pauses 30s
- Wrong letter: timer jumps 45 minutes
- Complete a level: +500 points
- Game over when daylight reaches 23:59

## Files

| File | Purpose |
|---|---|
| `index.html` | Main HTML structure |
| `style.css` | All styles and animations |
| `script.js` | Game logic, Enigma machine, audio, rendering |
| `README.md` | This file |

## Credits

- **Video reference**: Jared Owen Animations — "How the Enigma Machine works"
- All assets, code, and audio are self-contained (no external dependencies except Google Fonts)
