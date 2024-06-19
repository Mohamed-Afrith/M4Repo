
async function Voiceconvertion(voicecontent, voiceId,langCode,gameId) {
  try {
    
  const send = {
    text: voicecontent,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      similarity_boost: 0.4,
      stability: 0.7,
      style: 0.1,
      use_speaker_boost: true,
    }
  };
  const options = {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLAPS_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(send),
  };



const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  options);
  console.log('response.ok', response.ok);

  if (!response.ok) {
    throw new Error(`Failed to fetch audio for voiceId ${voiceId}`);
}

const contentType = response.headers.get('content-type');
console.log('contentType', contentType)
if (!contentType || !contentType.startsWith('audio/')) {
  console.log('!contentType || !contentType.startsWith(audio/')
  
    throw new Error(`Invalid response or missing audio content for voiceId ${voiceId}`);
}

const timestamp = Date.now();
const filename = `${langCode}_${voiceId}_${timestamp}.mp3`;
const directory = path.join(__dirname, "../../uploads", "tta", gameId, langCode);
const filePath =  path.join("uploads","tta", gameId, langCode, filename);
const audioUrl =  `/uploads/tta/${gameId}/${langCode}/${filename}`;

        // Ensure the directory exists, create it if it doesn't
        await fs.promises.mkdir(directory, { recursive: true });
        // Convert the response to an ArrayBuffer
        const buffer = await response.arrayBuffer();

        // Write the buffer to a file
        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        fileArray.push({ filename: filename, path: audioUrl, voiceId: voiceId, error: "" });
return audioUrl;






  } catch (error) {
    // console.error("Translation Error:", error);
    // return error;
    return res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
