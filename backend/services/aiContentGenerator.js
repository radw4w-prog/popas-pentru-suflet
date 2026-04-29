// Lazy initialization - nu crapa daca lipseste key-ul
let openaiClient = null;

function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_key_here') {
      return null;
    }
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

async function generateContent(tema, stil, platform) {
  const openai = getOpenAI();
  if (!openai) {
    return {
      success: false,
      error: 'OpenAI API key nu este configurat'
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ești un creator de conținut creștin în limba română.'
        },
        {
          role: 'user',
          content: `Creează o postare ${stil} despre ${tema} pentru ${platform}.`
        }
      ],
      max_tokens: 500
    });

    return {
      success: true,
      content: completion.choices[0].message.content
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { generateContent, getOpenAI };