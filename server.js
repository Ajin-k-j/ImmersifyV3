require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { generateStory } = require('./utils/GenStoryModel');
const { identifySoundWords, extractSoundWords, splitIntoChunks } = require('./utils/textProcessing');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static audio files

// Function to highlight sound-producing words and embed sound file paths
const highlightSoundWords = (story, soundWords) => {
    let highlightedStory = story;
    soundWords.forEach(sound => {
        const soundPath = `/sounds/${sound.replace(/\s+/g, '-')}.wav`; // Replace spaces with dashes in sound file name
        const regex = new RegExp(`\\b${sound}\\b`, 'gi'); // Match word boundaries
        highlightedStory = highlightedStory.replace(
            regex,
            `<span data-sound="${soundPath}" class="sound-word">${sound}</span>`
        );
    });
    return highlightedStory;
};

// API endpoint
app.post('/process', async (req, res) => {
    const { story } = req.body;
    const chunks = splitIntoChunks(story, 12); // Split the story into 6-word chunks
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

// API endpoint to generate a story
app.post('/genStory', async (req, res) => {
    const { context } = req.body;
    const soundWords = ["lion", "thunder", "baby crying", "rain"]; // List of sound-producing words

    try {
        // Call the model to generate the story
        const generatedStory = await generateStory(context, soundWords);

        // Highlight the sound-producing words in the story
        const highlightedTitle = `<h2>${generatedStory.title}</h2>`;
        const highlightedStory = highlightSoundWords(generatedStory.story, generatedStory.soundProducingWords);

        // Send back the story with title and highlighted sound words
        const fullStory = `${highlightedTitle}${highlightedStory}`;

        res.json({ story: fullStory });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).send('Error generating story');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
