require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { identifySoundWords, extractSoundWords, splitIntoChunks } = require('./utils/textProcessing');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static audio files

// API endpoint
app.post('/process', async (req, res) => {
    const { story } = req.body;
    const chunks = splitIntoChunks(story, 6); // Split the story into 6-word chunks
    const enrichedStory = [];
    const allSounds = new Set();

    for (const chunk of chunks) {
        try {
            // Get sound words for the chunk (we no longer need sentiment)
            const result = await identifySoundWords(chunk);
            const { soundWords } = extractSoundWords(result);

            // Add sound-producing words to the overall tracking
            soundWords.forEach(sound => allSounds.add(sound));

            enrichedStory.push(chunk);
        } catch (error) {
            console.error('Error processing chunk:', chunk, error);
            enrichedStory.push(chunk);
        }
    }

    // Highlight the sound-producing words and add sound paths
    let highlightedStory = story;
    allSounds.forEach(sound => {
        const soundPath = `/sounds/${sound.replace(/\s+/g, '-')}.wav`; // Replace spaces with dashes in sound file name
        const regex = new RegExp(`\\b${sound}\\b`, 'gi'); // Match word boundaries
        highlightedStory = highlightedStory.replace(
            regex,
            `<span data-sound="${soundPath}" class="sound-word">${sound}</span>`
        );
    });

    // Send back the enriched story without the sentiment information
    res.json({ story: highlightedStory });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
