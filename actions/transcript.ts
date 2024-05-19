"use server";

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function transcript(prevState: any, formData: FormData) {
  "use server";

  const id = Math.random().toString(36);

  console.log("PREVIOUS STATE:", prevState);
  if (
    process.env.ANTHROPIC_API_KEY === undefined ||
    process.env.ANTHROPIC_API_URL === undefined
  ) {
    console.error("Anthropic credentials not set");
    return {
      sender: "",
      response: "Anthropic credentials not set",
    };
  }

  const file = formData.get("audio") as File;
  if (file.size === 0) {
    return {
      sender: "",
      response: "No audio file provided",
    };
  }

  console.log(">>", file);

  const arrayBuffer = await file.arrayBuffer();
  const audio = new Uint8Array(arrayBuffer);

  // ---   get audio transcription from Anthropic ----

  console.log("== Transcribe Audio Sample ==");

  const transcriptResponse = await fetch(`${process.env.ANTHROPIC_API_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audio: Array.from(audio),
      format: 'wav'
    })
  });

  if (!transcriptResponse.ok) {
    console.error("Error transcribing audio:", transcriptResponse.statusText);
    return {
      sender: "",
      response: "Error transcribing audio",
    };
  }

  const transcriptData = await transcriptResponse.json();
  console.log(`Transcription: ${transcriptData.text}`);

  // ---   get chat completion from Anthropic ----

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant. You will answer questions and reply I cannot answer that if you don't know the answer.",
    },
    { role: "user", content: transcriptData.text },
  ];

  console.log(`Messages: ${messages.map((m) => m.content).join("\n")}`);

  const chatResponse = await fetch(`${process.env.ANTHROPIC_API_URL}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: messages.map((m) => m.content).join('\n'),
      max_tokens: 128
    })
  });

  if (!chatResponse.ok) {
    console.error("Error getting chat completion:", chatResponse.statusText);
    return {
      sender: "",
      response: "Error getting chat completion",
    };
  }

  const completionData = await chatResponse.json();
  console.log("chatbot: ", completionData.choices[0].text);

  const response = completionData.choices[0].text;

  console.log(prevState.sender, "+++", transcriptData.text);
  return {
    sender: transcriptData.text,
    response: response,
    id: id,
  };
}

export default transcript;
