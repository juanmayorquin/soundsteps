# SoundSteps — Context for Claude Code

## Project
Mobile app for post-cochlear implant auditory rehabilitation.
React Native with Expo (managed workflow).
No backend, no auth. All data stored locally with AsyncStorage.

## Audio Strategy
Use the ElevenLabs MCP (via Zapier) to generate ALL audio assets at the start.
Save everything to /assets/audio/ organized by module.
The app consumes static local files via Expo Audio — no runtime API calls.

## Audio Content Needed
### Module 1 – Sound Detection
- 10 distinct everyday sounds (doorbell, phone ring, clapping, dog bark, rain, etc.)

### Module 2 – Sound Discrimination
- 15 pairs of similar/different sounds for comparison exercises
- 3 background noise loops: low / medium / high (café, street, office)

### Module 3 – Word Identification
- 30 common words spoken clearly via TTS (ElevenLabs TTS, calm neutral voice)
- Words grouped in sets of 3 for each exercise round

### Feedback audio (optional but nice)
- Short positive chime for correct answers
- Soft neutral tone for incorrect answers

## Design
Follow the UI mockups from Google Stitch exactly.
Color palette: soft blue/teal primary, orange/yellow accents for progress.
Large buttons, rounded corners, minimalist, calm emotional tone.

## Architecture decisions — Claude decides
Keep it simple. Prioritize working features over perfect structure.
