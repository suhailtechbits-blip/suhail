
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ConstituencyData, AnalysisResult, NewsItem, EdvinBulletin, RadioAnalyticsEvent, RadioAnalyticsSummary } from "../types";

// State management for audio playback to prevent overlapping
let activeSource: AudioBufferSourceNode | null = null;
let audioContext: AudioContext | null = null;

/**
 * Manually decodes a base64 string to a Uint8Array.
 */
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer safely.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const length = Math.floor(data.byteLength / 2);
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, length);
  const frameCount = dataInt16.length / numChannels;
  
  if (frameCount <= 0) throw new Error("Empty audio buffer generated");

  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const ensureAudioContext = async () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    return audioContext;
};

export const stopSpeech = () => {
  if (activeSource) {
    try { activeSource.stop(); } catch (e) {}
    activeSource = null;
  }
};

/**
 * Updates the playback speed of the currently active audio source.
 */
export const updatePlaybackRate = (speed: number) => {
  if (activeSource) {
    try {
      activeSource.playbackRate.value = speed;
    } catch (e) {}
  }
};

/**
 * Generates and plays audio. Resolves when playback is finished.
 */
export const generateSpeech = async (text: string, playbackSpeed: number = 1.0): Promise<void> => {
  stopSpeech();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash-preview-tts";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    let base64Audio = "";
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
            base64Audio = part.inlineData.data;
            break;
        }
    }

    if (base64Audio) {
      const ctx = await ensureAudioContext();
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      return new Promise((resolve) => {
        activeSource = ctx.createBufferSource();
        activeSource.buffer = audioBuffer;
        activeSource.playbackRate.value = playbackSpeed;
        activeSource.connect(ctx.destination);
        activeSource.onended = () => { 
          activeSource = null; 
          resolve(); 
        };
        activeSource.start(0);
      });
    }
  } catch (error: any) {
    if (error?.message?.includes('429')) throw new Error("QUOTA_EXHAUSTED");
    throw error;
  }
};

/**
 * Fetches a structured radio bulletin using Google Search grounding.
 */
export const fetchRadioBulletin = async (query: string): Promise<Partial<EdvinBulletin>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a 60-second professional radio broadcast script in Malayalam about: ${query}. 
            Structure it with: 
            1. Headline News
            2. Strategic insight for UDF workers
            3. Closing victory slogan.
            Focus on UDF 2026 election preparation.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        
        return {
            id: `bulletin-${Date.now()}`,
            title: `Morning Briefing: ${new Date().toLocaleDateString()}`,
            script: response.text || "വാർത്തകൾ ലഭ്യമായിട്ടില്ല.",
            timestamp: new Date(),
            duration_est: "1m 15s",
            category: "Election Update"
        };
    } catch (e) {
        throw new Error("Failed to generate bulletin.");
    }
};

/**
 * Specialized report for a constituency/county
 */
export const fetchConstituencyLiveReport = async (seat: ConstituencyData): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a 30-second radio news script in Malayalam for UDF RADIO about the constituency "${seat.name}" in "${seat.district}" district. 
            Facts: Last winner was ${seat.lastElectionWinner} with margin ${seat.winningMargin}. 
            Target for 2026 is ${seat.targetVotes2026} votes. 
            Tone: High energy, professional, encouraging for UDF workers. 
            End with: "യു.ഡി.എഫിനൊപ്പം നിൽക്കൂ, നാടിനെ മുന്നോട്ട് നയിക്കൂ."`,
            config: { tools: [{ googleSearch: {} }] }
        });
        return response.text || "റിപ്പോർട്ട് ലഭ്യമായിട്ടില്ല.";
    } catch (e) {
        return `${seat.name} മണ്ഡലത്തിലെ വാർത്തകൾ ഇപ്പോൾ ലഭ്യമല്ല.`;
    }
};

export const fetchAIGroundedNews = async (query: string = "Latest Kerala politics UDF vs LDF news 2026"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for absolute latest: ${query}. Create a broadcast-ready Malayalam script for "UDF RADIO". Start with "ഇതാ ഏറ്റവും പുതിയ യു.ഡി.എഫ് വാർത്തകൾ". Max 3 points.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "വാർത്തകൾ ലഭ്യമായിട്ടില്ല.";
  } catch (error: any) {
    if (error?.message?.includes('429')) throw new Error("QUOTA_EXHAUSTED");
    return "വാർത്തകൾ ശേഖരിക്കുന്നതിൽ തടസ്സം നേരിട്ടു.";
  }
};

export const analyzeElectionData = async (data: ConstituencyData[]): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this election data for anomalies: ${JSON.stringify(data.slice(0, 50))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            udfAdvantageScore: { type: Type.NUMBER },
            anomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  constituencyId: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                },
                required: ["constituencyId", "severity", "description", "suggestedAction"],
              },
            },
          },
          required: ["summary", "riskScore", "udfAdvantageScore", "anomalies"],
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    if (error?.message?.includes('429')) throw new Error("QUOTA_EXHAUSTED");
    throw error;
  }
};

export const fetchSpeechBlob = async (text: string): Promise<Blob> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: { responseModalities: [Modality.AUDIO] },
    });
    const base64 = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    if (!base64) throw new Error("No audio data");
    return new Blob([decodeBase64(base64)], { type: 'audio/pcm' });
  } catch (e) { throw e; }
};

export const downloadAudio = (blob: Blob, filename: string = "broadcast.wav") => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const suggestColumnMapping = async (headers: string[]): Promise<Record<string, string>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Map CSV headers to voter list fields: ${headers.join(", ")}`,
    config: { responseMimeType: "application/json" },
  });
  return JSON.parse(response.text || "{}");
};

/**
 * Generates a strategic plan for a specific election seat.
 */
export const generateSeatStrategy = async (seatName: string, margin: number, winner: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a detailed 2026 election strategy for the constituency "${seatName}". 
      Current status: Last won by ${winner} with a margin of ${margin} votes.
      Provide actionable points for UDF to win or strengthen this seat. Tone: Professional and strategic.`,
    });
    return response.text || "Strategy generation failed.";
  } catch (error) {
    console.error(error);
    return "Error generating strategy.";
  }
};

/**
 * Formats content for sharing on social platforms.
 */
export const formatShareContent = (title: string, content: string, category: string): string => {
  return `📢 *UDF OFFICIAL ${category.toUpperCase()}*\n\n*${title}*\n\n${content}\n\n#UDF2026 #Kerala`;
};

/**
 * Chat agent for UDF strategy.
 */
export const chatWithUdfAgent = async (history: string, input: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `History: ${history}\nUser: ${input}`,
      config: {
        systemInstruction: "You are UDF Sahay, a strategic assistant for the United Democratic Front in Kerala for the 2026 elections. Answer queries about election strategy, booth management, and voter engagement."
      }
    });
    return response.text || "I am unable to answer right now.";
  } catch (error) {
    return "Error communicating with agent.";
  }
};

/**
 * Analyzes vote trends for feasibility.
 */
export const analyzeVoteTrends = async (seatName: string, votes2021: number, targetVotes2026: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze feasibility for ${seatName}: 2021 Votes: ${votes2021}, 2026 Target: ${targetVotes2026}. Brief insight in 1 sentence.`,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    return "Error analyzing trends.";
  }
};

/**
 * Analyzes radio telemetry events to produce a summary.
 */
export const analyzeRadioEvents = async (events: RadioAnalyticsEvent[]): Promise<RadioAnalyticsSummary> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these radio telemetry events and provide a summary: ${JSON.stringify(events)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          range: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING },
              to: { type: Type.STRING },
            },
            required: ["from", "to"],
          },
          total_listens: { type: Type.NUMBER },
          unique_listeners: { type: Type.NUMBER },
          total_play_time_seconds: { type: Type.NUMBER },
          avg_listen_time_seconds: { type: Type.NUMBER },
          live_now: { type: Type.NUMBER },
          top_countries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                country: { type: Type.STRING },
                listens: { type: Type.NUMBER },
              },
              required: ["country", "listens"],
            },
          },
          top_devices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                device: { type: Type.STRING },
                listens: { type: Type.NUMBER },
              },
              required: ["device", "listens"],
            },
          },
          bulletins: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                bulletin_id: { type: Type.STRING },
                listens: { type: Type.NUMBER },
                unique_listeners: { type: Type.NUMBER },
                play_time_seconds: { type: Type.NUMBER },
              },
              required: ["bulletin_id", "listens", "unique_listeners", "play_time_seconds"],
            },
          },
          notes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "range", "total_listens", "unique_listeners", "total_play_time_seconds",
          "avg_listen_time_seconds", "live_now", "top_countries", "top_devices",
          "bulletins", "notes"
        ],
      },
    },
  });
  return JSON.parse(response.text || "{}");
};
