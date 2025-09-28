# Copilot Instructions for SpongeBob Action Verbs App

## Project Overview
This is a browser-based educational game for learning English action verbs, themed around SpongeBob. The app is built with vanilla HTML, CSS, and JavaScript, and is organized as a single-page application (SPA) with three main views:
- **Instructions Page**: Game rules and how-to-play steps.
- **Memorization Carousel**: Shows images and plays sounds for each verb.
- **Crossword Game (7x7 Grid)**: Interactive grid for guessing verbs, with Termo-style color feedback.

## Key Files & Structure
- `index.html`: Main HTML file, contains all app pages and links to assets.
- `script.js`: Core logic for navigation, carousel, crossword game, and audio/image handling.
- `style.css`: All styling, including responsive layout and color feedback.
- `audio/`: Contains mp3 files for each verb's sound.
- `images/`: Contains PNG images for each verb.

## Essential Patterns & Conventions
- **SPA Navigation**: Pages are shown/hidden by toggling the `.active` class on `.app-page` elements. Use `navigateTo(pageId)` to switch views.
- **Game Data**: All verbs, clues, images, and sounds are defined in the `GAME_WORDS` array in `script.js`. To add new verbs, update this array and add corresponding assets.
- **Carousel**: Dynamically generates slides for each verb. Audio playback uses the browser's `Audio` API and expects files in `audio/`.
- **Crossword Grid**: 7x7 grid is generated in JS. Letter feedback uses color classes (`green-bg`, `yellow-bg`, `gray-bg`) defined in `style.css`.
- **No Build Step**: This project runs directly in the browser. No bundler, transpiler, or test framework is present.
- **Asset Naming**: Image and audio filenames must match the `image` and `sound` fields in `GAME_WORDS` (e.g., `swim.png`, `swim.mp3`).
- **Language**: UI and comments are in Brazilian Portuguese. Keep new UI text consistent.

## Developer Workflows
- **Debugging**: Use browser dev tools. No custom debug commands.
- **Adding Verbs**: Update `GAME_WORDS`, add assets to `audio/` and `images/`.
- **Styling**: All styles in `style.css`. Use existing color and layout conventions.
- **Localization**: All user-facing text is in Portuguese. Maintain this for new features.

## Examples
- To add a new verb "JUMP":
  1. Add `{ id: 7, word: "JUMP", clue: "Ação de pular.", image: "jump.png", sound: "jump.mp3" }` to `GAME_WORDS`.
  2. Add `jump.png` to `images/` and `jump.mp3` to `audio/`.

## External Dependencies
- None. All code is vanilla JS/CSS/HTML.

## Integration Points
- All logic is in `script.js`. No external APIs or frameworks.

---
If any section is unclear or missing, please provide feedback so this guide can be improved for future AI agents.
