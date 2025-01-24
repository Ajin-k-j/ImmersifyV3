document.addEventListener('DOMContentLoaded', () => {
    const storyOutput = document.getElementById('story-output');
    const startReadingBtn = document.getElementById('start-reading-btn');

    // Get processed story from localStorage
    const processedStory = localStorage.getItem('processedStory');
    if (processedStory) {
        // Display the processed story as HTML
        storyOutput.innerHTML = processedStory;

        // Attach click event listeners for sound words
        document.querySelectorAll('.sound-word').forEach((element) => {
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
        // Implement further reading functionality here (e.g., play audio, etc.)
    });

    // Function to handle sound word click (play sound)
    function handleSoundWordClick(event) {
        const soundPath = event.target.getAttribute('data-sound');
        if (soundPath) {
            const audio = new Audio(soundPath);
            audio.play();
        }
    }
});
