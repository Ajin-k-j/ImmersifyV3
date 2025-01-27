document.addEventListener('DOMContentLoaded', () => {
    const storyOutput = document.getElementById('story-output');
    const startReadingBtn = document.getElementById('start-reading-btn');
    const soundWords = [];

    // Initialize the history of recognized words
    let recognizedHistory = [];

    // Get processed story from localStorage
    const processedStory = localStorage.getItem('processedStory');
    if (processedStory) {
        // Display the processed story as HTML
        storyOutput.innerHTML = processedStory;

        // Attach click event listeners for sound words
        const soundWordElements = document.querySelectorAll('.sound-word');
        soundWordElements.forEach((element) => {
            soundWords.push({
                word: element.innerText,
                soundPath: element.getAttribute('data-sound'),
                element: element,
            });
            element.addEventListener('click', handleSoundWordClick);
        });

        // Show the "Start Reading" button
        startReadingBtn.classList.remove('hidden');
    } else {
        alert('No processed story found!');
        window.location.href = 'index.html';
    }

    // Event listener for "Start Reading" button
    startReadingBtn.addEventListener('click', () => {
        alert('Starting reading...');
        startSpeechRecognition();
    });

    // Function to handle sound word click (play sound)
    function handleSoundWordClick(event) {
        const soundPath = event.target.getAttribute('data-sound');
        if (soundPath) {
            const audio = new Audio(soundPath);
            audio.play();
        }
    }

    // Start Speech Recognition (Speech-to-Text Conversion)
    function startSpeechRecognition() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('Speech recognition started...');
        };

        recognition.onresult = (event) => {
            let speechText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                speechText += event.results[i][0].transcript;
            }
            console.log('Recognized speech: ', speechText);
            processSpeech(speechText.trim());
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error: ', event.error);
        };

        recognition.onend = () => {
            console.log('Speech recognition ended...');
        };

        recognition.start();
    }

    // Process the speech text and compare it with the story
    function processSpeech(speechText) {
        const words = speechText.split(' ');

        // Filter out the duplicates
        const newWords = filterDuplicates(words);

        // Loop through the story's words and the spoken words
        let currentIndex = 0;
        let storyWords = getStoryWords();

        newWords.forEach((spokenWord) => {
            // Find the closest match from the story words
            const matchIndex = findClosestMatch(storyWords, spokenWord, currentIndex);

            if (matchIndex !== -1) {
                highlightWord(matchIndex);
                currentIndex = matchIndex + 1;

                // If it's a sound word, play the sound
                const soundWord = soundWords.find((word) => word.word === storyWords[matchIndex]);
                if (soundWord) {
                    playSound(soundWord.soundPath);
                }
            }
        });
    }

    // Get an array of words from the processed story (ignoring HTML tags)
    function getStoryWords() {
        const textContent = storyOutput.textContent || '';
        return textContent.split(/\s+/);
    }

    // Find the closest match from the story words
    function findClosestMatch(storyWords, spokenWord, startIndex) {
        // Skipping words that are not part of the story (due to noise or missed recognition)
        for (let i = startIndex; i < storyWords.length; i++) {
            if (storyWords[i].toLowerCase() === spokenWord.toLowerCase()) {
                return i;
            }
        }
        return -1;
    }

    // Filter out duplicate words by keeping track of what we've already recognized
    function filterDuplicates(newWords) {
        const filteredWords = [];
        newWords.forEach((word) => {
            if (!recognizedHistory.includes(word.toLowerCase())) {
                filteredWords.push(word);
                recognizedHistory.push(word.toLowerCase());
            }
        });
        return filteredWords;
    }

    // Highlight the word in the story by adding a class to it
    function highlightWord(index) {
        const storyWordElements = document.querySelectorAll('.sound-word');
        if (storyWordElements[index]) {
            storyWordElements[index].classList.add('highlight');
        }
    }

    // Play sound associated with the word
    function playSound(soundPath) {
        const audio = new Audio(soundPath);
        audio.play();
    }
});
