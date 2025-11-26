import { GoogleGenAI } from "@google/genai";
import { DataSummary, SensorDataPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDataInsights = async (
  summary: DataSummary, 
  peakData: SensorDataPoint[]
): Promise<string> => {
  // We select the top 5 detected peaks to send to the model to avoid token limits
  // while still providing specific context.
  const anomalyContext = peakData.map(p => 
    `Time: ${p.dateStr}, Vel X: ${p.velX}, Vel Y: ${p.velY}, Vel Z: ${p.velZ}, Acoustics: ${p.acoustics}`
  ).join('\n');

  const prompt = `
    Act as an expert industrial reliability engineer. Analyze the following sensor data summary from a machine health monitoring system.
    
    **Dataset Summary:**
    - Duration: ${summary.startTime} to ${summary.endTime}
    - Total Data Points: ${summary.totalPoints}
    - Max Recorded Velocity (RMS): ${summary.maxVelocity} mm/s
    - Average Ambient Temp: ${summary.avgTemp.toFixed(1)}°C
    
    **Detected High Vibration Events (Anomalies):**
    ${anomalyContext}

    **Task:**
    1. Assess the severity of the vibration levels based on ISO 10816 standards (assuming a standard medium-sized machine).
    2. Suggest potential root causes for the spikes (e.g., imbalance, misalignment, bearing looseness) considering the relationship between axes if visible.
    3. Recommend immediate maintenance actions.
    
    Keep the response concise, technical, and formatted in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights at this time. Please check your API key.";
  }
};