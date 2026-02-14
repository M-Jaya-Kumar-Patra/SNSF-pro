import axios from "axios";

export const translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: targetLanguage,
      }
    );

    res.json({
      translatedText: response.data.data.translations[0].translatedText,
    });
  } catch (error) {
    res.status(500).json({ message: "Translation failed" });
  }
};
