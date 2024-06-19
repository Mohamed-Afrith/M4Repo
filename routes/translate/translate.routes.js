const express = require('express');
const router = express.Router();
//import OpenAI from "openai";
const {OpenAI} =require('openai');
//------------------------------------------------------------------------------------------------------

//const router = express();

//const PORT = 3001; // Choose the port for your server

//router.use(express.json());
 // text: text,
   //     target_language: targetLanguage,
router.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  const OPENAI_API_KEY = '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'; // Replace with your actual OpenAI API key

  try {
    const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      "role": "system",
      "content": "You will be provided with a sentence in English, and your task is to translate it into French."
    },
    {
      "role": "user",
      "content": text
    }
  ],
  temperature: 0.7,
  max_tokens: 64,
  top_p: 1,
});

    const data = await response.choices[0].message.content;
console.log(data);
    res.json(data);

  } catch (error) {
    console.error('Translation Error:', error);
    res.status(500).json({ error: 'Translation Error' });
  }
});

//router.listen(PORT, () => {
  //console.log(`Server running on port ${PORT}`);
//});
//------------------------------------------------------------------------------------------------------


module.exports = router;
