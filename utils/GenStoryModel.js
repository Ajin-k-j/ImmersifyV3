const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
    region: 'us-west-2', // Ensure this is the correct region for your setup
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN, // Optional: only if you're using temporary credentials
    },
});

// Function to generate a story based on the provided context
const generateStory = async (context, soundWords) => {
    // Define the prompt based on whether the context is provided
    const prompt = context && context.trim()
        ? `Generate a short story of around 100 words based on the following context: "${context}". Use sound-producing words like ${soundWords.join(", ")} in the story where applicable. The story should be structured as follows:\n\nTitle: [A catchy title]\nStory: [The main story content]\nSoundProducingWords: [List the sound-producing words used in the story, separated by commas. Exact word used in the story must be returned as sound producing word.]`
        : `Generate a short story of around 100 words. Use sound-producing words like ${soundWords.join(", ")} in the story where applicable. The story should be structured as follows:\n\nTitle: [A catchy title]\nStory: [The main story content]\nSoundProducingWords: [List the sound-producing words used in the story, separated by commas.Exact word used in the story must be returned as sound producing word.]`;

    // Payload to be sent to the model
    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        top_k: 250,
        temperature: 0.7,
        top_p: 0.9,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt
                    }
                ]
            }
        ]
    };

    const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-5-haiku-20241022-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
    });

    try {
        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));

        // Check if the result contains valid content
        if (result?.content && result.content[0]?.text) {
            const storyText = result.content[0].text.trim();

            // Assuming the model response is structured like this:
            // Title: [Title]
            // Story: [Story Content]
            // SoundProducingWords: [Comma separated list of sound words]


            // Extract title, story, and sound-producing words
            const titleMatch = storyText.match(/Title:\s*(.*)/);
            const storyMatch = storyText.match(/Story:\s*(.*)/);
            const soundWordsMatch = storyText.match(/SoundProducingWords:\s*(.*)/);

            const title = titleMatch ? titleMatch[1].trim() : '';
            const story = storyMatch ? storyMatch[1].trim() : '';
            const soundProducingWords = soundWordsMatch
                ? soundWordsMatch[1].split(',').map(word => word.trim())
                : [];
                console.log("sound producing word");
                console.log(soundProducingWords)

            return {
                title,
                story,
                soundProducingWords
            };
        }

        throw new Error('Invalid or empty response from model');
    } catch (error) {
        console.error('Error invoking the model:', error);
        throw error;
    }
};

module.exports = { generateStory };
