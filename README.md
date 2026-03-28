# Core Language

Core Language is a React + TypeScript single-page learning app built around reading the shape of code. It combines guidebook-style study, timed quiz modes, review and coaching, music and theme systems, and a Human vs AI arena inside one frontend-first experience.

The base learning flow works from repository-shipped content, so the app can run as a static site. Arena AI play is optional and uses browser-side provider settings entered by the player.

## What this project includes

- Thai and English UI
- Multiple app screens:
  - `landing`
  - `menu`
  - `guide`
  - `quiz`
  - `result`
  - `arena`
  - `arena-match`
  - `arena-result`
  - `settings`
- Two content tracks:
  - `core`
  - `game-dev`
- Four main learning modes:
  - `identify-language`
  - `fix-error`
  - `debug`
  - `vocab`
- Human vs AI arena built on the same question pools
- Local persistence for track, mode, difficulty, scope, length, viewed guides, music, theme, and arena settings

## Supported content scope

The app currently spans a broad mix of general programming and game-development ecosystems.

- Core topics include ecosystems such as Python, JavaScript, TypeScript, HTML, CSS, JSON, C#, C++, Dart, Flutter, Go, Kotlin, Swift, Ruby, Bash, SQL, PHP, Rust, and more.
- Game-dev topics include ecosystems such as Roblox Lua, LOVE2D Lua, Godot GDScript, Godot shaders, Unity C#, Unity ShaderLab, Unreal C++, GLSL, Phaser TypeScript, RPG Maker JS, GameMaker GML, Defold Lua, Bevy Rust, Ren'Py Python, and more.

In total, the repo covers 36 language or engine targets across the two tracks.

## UI and page map

This app is not just a quiz screen. It has a fairly large UI surface.

### Landing page sections

- `HeroSection`
  - Typewriter subtitle
  - Glitch-accent headline word
  - Track, format, and family selectors
  - Direct guide entry
- `MarqueeBand`
  - Animated feature ticker
- `ServicesSection`
  - Product-style cards that explain the learning approach
- `CoursesSection`
  - Carousel of the four main modes with quick-start buttons
- `ArenaSection`
  - Human vs AI pitch, feature highlights, and arena CTA

### Main application screens

- `Landing`
  - Overview screen with the main visual identity and quick entry points
- `Menu`
  - Main setup screen for format, track, difficulty, scope, and session length
  - Includes ready summary, intro rules, and mode metadata
- `Guide`
  - Guidebook flow with primers, comparison tools, filters, and topic drill entry points
- `Quiz`
  - Timed question screen with syntax-highlighted snippets, hints, and immediate feedback
- `Result`
  - Post-run review with stats, weak topics, coach output, and export/share tools
- `Arena`
  - Arena setup screen for provider, model, mode, scope, and fairness settings
- `Arena Match`
  - Live duel flow with timer, player answers, opponent answers, and match-state transitions
- `Arena Result`
  - Multi-metric recap for arena matches
- `Settings`
  - Music queue, playback controls, theme tuning, diagnostics, and saved preferences

## Learning and game modes

### 1. Identify Language

The classic recognition mode.

- Read a snippet and identify the correct language
- `easy` and `hard` difficulties
- `short` and `standard` lengths
- Hints, quick-spot cues, and signal-based explanations
- Uses guidebook summaries and language-family context

### 2. Fix Error

Error-location training.

- Read a snippet plus an error symptom
- Choose the line or fragment that actually breaks the run
- `easy` and `hard` difficulties
- Scope-based play for grouped or single-language drills
- Guide support for culprit lines, worked examples, and false-friend splits

### 3. Debug

Root-cause diagnosis training.

- Read a scenario, runtime context, and log output
- Choose the real root cause, not just the visible symptom
- `easy` and `hard` difficulties
- Scope-based play
- Guide support for snapshot reasoning, checklist thinking, and hard examples

### 4. Vocab Drill

Terminology and syntax-term recognition mode.

- Trains keywords, built-in functions, and syntax vocabulary
- `easy` and `hard` difficulties
- `short` and `standard` lengths
- Context-role based prompts and focused vocabulary banks
- Supports grouped and single-language drills

### 5. Human vs AI Arena

Competitive mode built on the same content system.

- Human vs AI setup from the Arena screen
- Choose format, track, difficulty or fairness mode, scope, and length where relevant
- Browser-side provider configuration
- Model discovery for supported providers
- Separate arena match and arena result screens
- Supports `easy`, `hard`, and `fair-for-human` balancing
- Can trigger archived ghost replay encounters

## Guide system

The guide flow is a major part of the product, not a small tutorial.

- Track-aware guidebook for both `core` and `game-dev`
- Guide progress tracking per format
- Family filters such as `web`, `app`, `backend`, `data`, `system`, `gameplay`, `lifecycle`, and `shader`
- Compare system for close-looking languages and false friends
- Easy and hard guide layers where supported
- Topic cards with quick-spot cues, summaries, signatures, and examples
- Mode-specific deep guides for Identify, Fix Error, Debug, and Vocab
- Topic-level drill entry points directly from the guide screen
- Primer sections that teach how to read each mode before entering the timer

## Quiz runtime features

- Timed question flow with per-format time limits
- Hint system with limits that change by mode, difficulty, and session length
- Immediate feedback states for correct, wrong, and timeout outcomes
- Syntax-highlighted snippets during study and play
- Format-aware choice rendering for language labels, culprit lines, debug causes, and vocab answers
- Anti-focus / visibility penalty support during active quiz and arena play
- Persisted per-run metrics for later review

## Result and review features

- End-of-run score summary and rank bands
- Breakdown for correct, wrong, and timeout answers
- Weak-topic detection
- Coach-style post-run summary
- Compare-against-previous-run metrics when prior run data exists
- Read-next recommendations that can reopen relevant topics directly
- Share recap flow
- HTML export for result summary
- Chart area for review and visual recap
- Penalty-aware snapshot data, including anti-focus events

## AI systems

The app uses AI in more than one place.

### Arena AI

- BYOK arena flow with browser-side provider settings
- Provider-aware setup for:
  - `OpenAI`
  - `Anthropic`
  - `Google Gemini`
  - `Meta Llama`
  - `xAI`
  - `Mistral`
  - `Groq`
  - `Together`
  - `Fireworks`
  - `Perplexity`
  - `DeepSeek`
  - `SambaNova`
  - `Cerebras`
  - `Cloudflare`
  - `AI21`
  - `DeepInfra`
  - `Nebius`
  - `Moonshot`
  - `Hyperbolic`
  - `Alibaba`
- Provider tiers for verified vs beta support
- Recommended model lists per provider
- Model discovery for providers that expose model listing
- Runtime tuning for fast arena answers and capability probing

### Result coach

- Post-run coach flow with local fallback content
- AI-capable providers can also be used for coaching
- Coach output includes summary, weakness note, focus note, read-next suggestions, and compare content

### Music AI diagnostics

- Client-side worker flow in Settings
- Infers mood and dominant or base color from track metadata
- Feeds the theme system used by the music presentation layer

## Arena features

- Arena setup screen with mode-aware controls
- Provider-aware AI setup with API key, base URL, extra provider field where needed, and model controls
- Support for both preset models and discovered models
- Match flow with timer, player answer timing, AI answer timing, and state transitions
- Arena result metrics such as accuracy, average speed, streak, and commentary-style comparison
- Local run archive support

## Ghost run system

Ghost Run is an Arena-side event, not a separate page.

- Previous arena runs are archived locally
- A later arena session can trigger a ghost replay encounter
- When triggered, the opponent side replays archived human outcomes instead of using a live AI answer stream
- Ghost encounters keep the normal arena flow but change the opponent behavior
- The match still ends in the standard `arena-result` recap screen

## Music, theme, and presentation systems

The settings page includes a deeper media and visual layer than a normal quiz app.

- Queue-based music system
- Source handling for:
  - direct audio URLs
  - YouTube
  - SoundCloud
- Track metadata parsing helpers
- Playback modes:
  - `normal`
  - `loop-one`
  - `loop-all`
  - `shuffle`
- Global volume control
- Queue add, remove, play, next, previous, pause, resume, and stop flows
- Theme modes:
  - `auto`
  - `spectrum`
- Theme presets:
  - `aurora`
  - `sunset`
  - `mono`
  - `neon`
  - `mist`
  - `iris`
  - `ember`
- Spectrum speed and intensity controls
- Theme preview swatches and base-theme integration
- Diagnostics and AI-assisted mood/color analysis for music-driven theming

## Presentation and interaction details

- Landing hero with typewriter subtitle and glitch-word treatment
- Animated marquee band
- Motion-enhanced service cards
- Horizontal course carousel with quick-start entry
- Arena promo section with staged highlight cards
- Syntax-highlighted snippets in guide and quiz flows
- Ripple interactions and animated screen transitions
- Theme-aware surfaces and panel styling across screens
- Responsive layouts for desktop and mobile
- Reduced ambient motion on high-focus screens such as quiz and arena match

## Frontend stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion
- Lucide React
- React Syntax Highlighter
- Transformers.js

## Local development

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

## Production build

Create a production bundle:

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

## Quality checks

Run ESLint:

```bash
npm run lint
```

## Deployment

This project is suitable for static hosting.

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

The repository already includes workflow files under `.github/workflows/` for deployment-related automation.

## Project structure

```text
src/
  assets/        Static media and artwork
  components/    Shared UI pieces
  data/          Question banks, guide data, landing content, and mode content
  lib/           Quiz logic, arena logic, result helpers, music/theme systems, AI helpers
  pages/         Top-level application screens
  sections/      Landing page sections
tools/
  gemini-tts/    Local voice-generation workbench used by the repo
```

## Notes

- The app is frontend-heavy by design and persists most runtime preferences in local storage.
- Base learning modes work from repository-shipped content.
- Arena AI play depends on provider setup entered by the user in the browser.
