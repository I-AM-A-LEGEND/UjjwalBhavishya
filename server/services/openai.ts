import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" });

export interface ChatResponse {
  content: string;
  conversationId?: string;
}

export interface SchemeRecommendation {
  schemeId: string;
  score: number;
  reasoning: string;
  eligibilityStatus: "eligible" | "partially_eligible" | "not_eligible";
}

export class OpenAIService {
  
  async generateChatResponse(
    message: string, 
    language: string = "en", 
    context?: string,
    conversationHistory?: Array<{role: string, content: string}>
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(language);
      const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
        { role: "system", content: systemPrompt }
      ];

      // Add conversation history
      if (conversationHistory) {
        conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content
          });
        });
      }

      // Add context if provided
      if (context) {
        messages.push({
          role: "system",
          content: `Additional context: ${context}`
        });
      }

      messages.push({ role: "user", content: message });

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        content: response.choices[0].message.content || "I apologize, but I couldn't process your request. Please try again."
      };
    } catch (error) {
      console.error("OpenAI chat error:", error);
      return {
        content: language === "hi" 
          ? "क्षमा करें, मैं इस समय आपकी सहायता नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।"
          : "I apologize, but I'm having technical difficulties. Please try again later."
      };
    }
  }

  async generateSchemeRecommendations(
    citizenProfile: any,
    availableSchemes: any[]
  ): Promise<SchemeRecommendation[]> {
    try {
      const prompt = `
      As an AI expert in Indian government schemes, analyze the citizen profile and recommend suitable schemes.
      
      Citizen Profile:
      - Annual Income: ₹${citizenProfile.annualIncome || 'Not specified'}
      - Category: ${citizenProfile.category || 'General'}
      - State: ${citizenProfile.state}
      - Occupation: ${citizenProfile.occupation || 'Not specified'}
      - Age: ${citizenProfile.age || 'Not specified'}
      - Has Disability: ${citizenProfile.hasDisability ? 'Yes' : 'No'}
      - Family Size: ${citizenProfile.familySize || 'Not specified'}
      - Education: ${citizenProfile.education || 'Not specified'}

      Available Schemes:
      ${availableSchemes.map((scheme, index) => `
      ${index + 1}. ${scheme.name}
      Category: ${scheme.category}
      Max Income: ₹${scheme.maxIncome || 'No limit'}
      Target Categories: ${JSON.stringify(scheme.targetCategories)}
      Target Occupations: ${JSON.stringify(scheme.targetOccupations)}
      Min Age: ${scheme.minAge || 'No limit'}
      Max Age: ${scheme.maxAge || 'No limit'}
      State: ${scheme.state || 'All India'}
      `).join('\n')}

      For each scheme, provide a JSON response with:
      1. Eligibility assessment (eligible/partially_eligible/not_eligible)
      2. Score (0.0 to 1.0) based on how well the citizen matches
      3. Clear reasoning in simple language

      Response format:
      {
        "recommendations": [
          {
            "schemeIndex": 0,
            "score": 0.85,
            "eligibilityStatus": "eligible",
            "reasoning": "You are eligible because..."
          }
        ]
      }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      
      return result.recommendations.map((rec: any) => ({
        schemeId: availableSchemes[rec.schemeIndex]?.id || '',
        score: Math.max(0, Math.min(1, rec.score)),
        reasoning: rec.reasoning,
        eligibilityStatus: rec.eligibilityStatus
      })).filter((rec: any) => rec.schemeId);

    } catch (error) {
      console.error("OpenAI recommendation error:", error);
      return [];
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${this.getLanguageName(targetLanguage)} while maintaining the meaning and context. For government and technical terms, provide both translation and the original term in brackets.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.2,
      });

      return response.choices[0].message.content || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }

  private getSystemPrompt(language: string): string {
    const prompts = {
      en: `You are SarkarBot, an AI assistant for the Indian Government's citizen portal. You help citizens find and understand government schemes, track applications, and provide guidance on government services. 

      Key capabilities:
      - Explain government schemes in simple language
      - Help with eligibility criteria
      - Guide through application processes
      - Provide status updates
      - Answer questions about benefits and documents required
      
      Guidelines:
      - Be helpful, accurate, and empathetic
      - Use simple, clear language
      - Provide specific actionable guidance
      - Reference official government portals when appropriate
      - If unsure about something, direct users to official sources
      - Be culturally sensitive and inclusive`,
      
      hi: `आप सरकारबॉट हैं, भारत सरकार के नागरिक पोर्टल के लिए एक AI सहायक हैं। आप नागरिकों को सरकारी योजनाएं खोजने और समझने, आवेदनों को ट्रैक करने, और सरकारी सेवाओं पर मार्गदर्शन प्रदान करने में मदद करते हैं।

      मुख्य क्षमताएं:
      - सरकारी योजनाओं को सरल भाषा में समझाना
      - पात्रता मानदंड में सहायता
      - आवेदन प्रक्रियाओं में मार्गदर्शन
      - स्थिति अपडेट प्रदान करना
      - लाभ और आवश्यक दस्तावेजों के बारे में प्रश्नों का उत्तर देना
      
      दिशानिर्देश:
      - सहायक, सटीक और सहानुभूतिपूर्ण बनें
      - सरल, स्पष्ट भाषा का उपयोग करें
      - विशिष्ट कार्यशील मार्गदर्शन प्रदान करें
      - उपयुक्त होने पर आधिकारिक सरकारी पोर्टल का संदर्भ दें
      - यदि किसी बात के बारे में अनिश्चित हैं, तो उपयोगकर्ताओं को आधिकारिक स्रोतों की ओर निर्देशित करें`
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
  }

  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      bn: "Bengali",
      ta: "Tamil",
      te: "Telugu",
      mr: "Marathi",
      gu: "Gujarati",
      kn: "Kannada",
      ml: "Malayalam",
      pa: "Punjabi",
      or: "Odia",
      as: "Assamese"
    };
    return languages[code] || "English";
  }
}

export const openaiService = new OpenAIService();
