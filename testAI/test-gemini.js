import {dotevn} from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotevn.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
// hoặc nếu dùng Vertex AI / project config
// const ai = new GoogleGenAI({ vertexai: true, project: "YOUR_PROJECT", location: "YOUR_LOCATION" });

const result = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Xin chào từ Gemini!",
});
console.log(result.text());
