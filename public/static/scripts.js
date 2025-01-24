document.addEventListener('DOMContentLoaded', () => {
    const storyInput = document.getElementById('story-input');
    const processBtn = document.getElementById('process-btn');
    const loading = document.getElementById('loading');

    // Event listener for button click
    processBtn.addEventListener('click', handleProcessClick);

    // Function to handle process button click
    async function handleProcessClick() {
        const story = storyInput.value.trim();
        if (!story) {
            alert('Please enter a story!');
            return;
        }

        // Show loading animation on current page
        loading.classList.remove('hidden');

        try {
            const data = await processStory(story);

            // Save the processed story in localStorage
            localStorage.setItem('processedStory', data.story);

            // Redirect to 'read.html' page
            window.location.href = 'read.html';
        } catch (error) {
            console.error('Error processing story:', error);
            alert('Something went wrong, please try again.');
        } finally {
            loading.classList.add('hidden');
        }
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
});
