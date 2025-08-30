import OpenAI from "openai"
import fs from "fs"
import dotenv from "dotenv"

// Load environment variables from a `.env` file if present.  This allows the
// API key and model name to be configured without modifying the code.  The
// `dotenv.config()` call is safe to invoke multiple times.
dotenv.config()

export class LLMHelper {
  private openai: OpenAI
  private readonly systemPrompt = `Tu es Lucide, un assistant IA français. Réponds de façon claire, détaillée et naturelle. Sois informatif et conversationnel. IMPORTANT: Ne jamais utiliser de hashtags (#), d'astérisques (*) ou d'autres symboles de formatage dans tes réponses. Réponds en texte simple et naturel.`

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required")
    }
    this.openai = new OpenAI({ apiKey })
  }

  private async fileToBase64(filePath: string): Promise<string> {
    const fileBuffer = await fs.promises.readFile(filePath)
    return fileBuffer.toString('base64')
  }

  public async analyzeText(text: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `${this.systemPrompt}\n\n${text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      });

      let result = response.choices[0].message.content || "Unable to analyze text"
      
      // Nettoyer le texte des hashtags et astérisques
      result = result
        .replace(/#/g, '') // Supprimer les hashtags
        .replace(/\*/g, '') // Supprimer les astérisques
        .replace(/\n\s*#/g, '\n') // Supprimer les hashtags en début de ligne
        .replace(/\*\*/g, '') // Supprimer les doubles astérisques
        .trim()
      
      return { text: result, timestamp: Date.now() }
    } catch (error) {
      console.error("Error analyzing text:", error)
      throw error
    }
  }

  public async analyzeAudioFile(audioPath: string) {
    try {
      const audioFile = await fs.promises.readFile(audioPath)
      
      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "text"
      })

      const transcription = response as string
      
      // Now analyze the transcription with GPT
      const analysisResponse = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `${this.systemPrompt}\n\nTranscription: ${transcription}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })

      let text = analysisResponse.choices[0].message.content || transcription
      
      // Nettoyer le texte des hashtags et astérisques
      text = text
        .replace(/#/g, '') // Supprimer les hashtags
        .replace(/\*/g, '') // Supprimer les astérisques
        .replace(/\n\s*#/g, '\n') // Supprimer les hashtags en début de ligne
        .replace(/\*\*/g, '') // Supprimer les doubles astérisques
        .trim()
      
      return { text, timestamp: Date.now() }
    } catch (error) {
      console.error("Error analyzing audio file:", error)
      throw error
    }
  }

  public async analyzeAudioFromBase64(data: string, mimeType: string) {
    let tempFilePath: string | null = null
    
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(data, 'base64')
      
      // Create a temporary file for the audio data
      const os = require('os')
      const path = require('path')
      tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.webm`)
      
      // Write the buffer to the temporary file
      await fs.promises.writeFile(tempFilePath, buffer)
      
      // Create a File object from the buffer
      const audioFile = new File([buffer], 'audio.webm', { type: mimeType })
      
      // Optimized Whisper parameters for French transcription
      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "fr", // Specify French language
        prompt: "Ceci est une conversation en français. Les noms propres comme Napoléon, Louis XIV, etc. doivent être transcrits correctement.",
        response_format: "text",
        temperature: 0.2 // Lower temperature for more accurate transcription
      })

      const transcription = response as string
      
      // Clean up transcription if it contains repetitive patterns
      let cleanedTranscription = transcription
        .replace(/(\.\.\.\s*){3,}/g, '...') // Remove excessive ellipses
        .replace(/(je ne sais pas,?\s*){2,}/gi, 'je ne sais pas') // Remove repetitive "je ne sais pas"
        .replace(/(bye\.?\s*){2,}/gi, 'bye') // Remove repetitive "bye"
        .trim()
      
      // Now analyze the transcription with GPT
      const analysisResponse = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `${this.systemPrompt}\n\nTranscription: ${cleanedTranscription}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })

      let text = analysisResponse.choices[0].message.content || cleanedTranscription
      
      // Nettoyer le texte des hashtags et astérisques
      text = text
        .replace(/#/g, '') // Supprimer les hashtags
        .replace(/\*/g, '') // Supprimer les astérisques
        .replace(/\n\s*#/g, '\n') // Supprimer les hashtags en début de ligne
        .replace(/\*\*/g, '') // Supprimer les doubles astérisques
        .trim()
      
      return { text, timestamp: Date.now() }
    } catch (error) {
      console.error("❌ Error analyzing audio from base64:", error)
      throw error
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        try {
          await fs.promises.unlink(tempFilePath)
        } catch (cleanupError) {
          console.warn('⚠️ Erreur lors de la suppression du fichier temporaire:', cleanupError)
        }
      }
    }
  }

  public async analyzeImageFile(imagePath: string) {
    try {
      const base64 = await this.fileToBase64(imagePath)
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${this.systemPrompt}\n\nDécris le contenu de cette image.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })

      let text = response.choices[0].message.content || "Unable to analyze image"
      
      // Nettoyer le texte des hashtags et astérisques
      text = text
        .replace(/#/g, '') // Supprimer les hashtags
        .replace(/\*/g, '') // Supprimer les astérisques
        .replace(/\n\s*#/g, '\n') // Supprimer les hashtags en début de ligne
        .replace(/\*\*/g, '') // Supprimer les doubles astérisques
        .trim()
      return { text, timestamp: Date.now() }
    } catch (error) {
      console.error("Error analyzing image:", error)
      throw error
    }
  }

  public async analyzeScreenshot(screenshotPath: string) {
    try {
      const base64 = await this.fileToBase64(screenshotPath)
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${this.systemPrompt}\n\nAnalyse cette capture d'écran et décris ce que tu vois.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })

      let text = response.choices[0].message.content || "Unable to analyze screenshot"
      
      // Nettoyer le texte des hashtags et astérisques
      text = text
        .replace(/#/g, '') // Supprimer les hashtags
        .replace(/\*/g, '') // Supprimer les astérisques
        .replace(/\n\s*#/g, '\n') // Supprimer les hashtags en début de ligne
        .replace(/\*\*/g, '') // Supprimer les doubles astérisques
        .trim()
      return { text, timestamp: Date.now() }
    } catch (error) {
      console.error("Error analyzing screenshot:", error)
      throw error
    }
  }

  public async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]) {
    try {
      const imageContents = await Promise.all(
        debugImagePaths.map(async (path) => {
          const base64 = await this.fileToBase64(path)
          return {
            type: "image_url" as const,
            image_url: {
              url: `data:image/png;base64,${base64}`
            }
          }
        })
      )
      
      const prompt = `${this.systemPrompt}\n\nProblème: ${JSON.stringify(problemInfo, null, 2)}\nCode actuel: ${currentCode}\n\nAnalyse les informations de debug dans les images.`
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              ...imageContents
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })

      const text = response.choices[0].message.content || "Unable to analyze debug information"
      return { text, timestamp: Date.now() }
    } catch (error) {
      console.error("Error analyzing debug solution:", error)
      throw error
    }
  }
}