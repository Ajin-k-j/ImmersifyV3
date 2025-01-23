document.addEventListener('DOMContentLoaded', () => {
    const storyInput = document.getElementById('story-input');
    const processBtn = document.getElementById('process-btn');
    const loading = document.getElementById('loading');
    const outputSection = document.getElementById('output-section');
    const storyOutput = document.getElementById('story-output');

    // Event listener for button click
    processBtn.addEventListener('click', handleProcessClick);

    // Function to handle process button click
    async function handleProcessClick() {
        const story = storyInput.value.trim();
        if (!story) {
            alert('Please enter a story!');
            return;
        }

        showLoading(true);
        outputSection.classList.add('hidden');

        try {
            const data = await processStory(story);
            updateStoryOutput(data);
        } catch (error) {
            console.error('Error processing story:', error);
            alert('Something went wrong, please try again.');
        }

        showLoading(false);
        outputSection.classList.remove('hidden');
    }

    // Function to show or hide the loading indicator
    function showLoading(isLoading) {
        loading.classList.toggle('hidden', !isLoading);
    }

    // Function to fetch processed story data
    async function processStory(story) {
        const response = await fetch('/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ story }),
        });

        if (!response.ok) {
            throw new Error('Failed to process the story');
        }

        return response.json();
    }

    // Function to update the story output with highlighted sound words
    function updateStoryOutput(data) {
        storyOutput.innerHTML = '';

        // Since data.story is a string, we'll split it into paragraphs
        const paragraphs = data.story.split('\n'); // Split by newline or another delimiter if needed

        paragraphs.forEach((paragraphText) => {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = `${paragraphText} <span class="sentiment">(${data.overallSentiment})</span>`;
            storyOutput.appendChild(paragraph);
        });

        // Attach click handlers for sound words
        document.querySelectorAll('.sound-word').forEach((element) => {
            element.addEventListener('click', handleSoundWordClick);
        });
    }

    // Function to handle sound word click (play sound)
    function handleSoundWordClick(event) {
        const soundPath = event.target.getAttribute('data-sound');
        const audio = new Audio(soundPath);
        audio.play();
    }
});
