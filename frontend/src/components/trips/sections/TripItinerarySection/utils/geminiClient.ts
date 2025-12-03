import { GoogleGenAI } from '@google/genai'

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-3.5-flash'

export const geminiClient = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null


