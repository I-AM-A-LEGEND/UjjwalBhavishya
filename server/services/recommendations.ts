import { storage } from "../storage";
import { openaiService } from "./openai";
import { schemeService } from "./schemes";
import { type CitizenProfile, type Scheme, type InsertRecommendation } from "@shared/schema";

export interface RecommendationWithScheme {
  id: string;
  userId: string;
  scheme: Scheme;
  score: number;
  reasoning: string;
  eligibilityStatus: string;
  generatedAt: Date;
}

export class RecommendationService {
  
  async generateRecommendations(userId: string): Promise<RecommendationWithScheme[]> {
    try {
      // Get citizen profile
      const citizenProfile = await storage.getCitizenProfile(userId);
      if (!citizenProfile) {
        throw new Error("Citizen profile not found");
      }

      // Get eligible schemes using rule-based approach
      const eligibleSchemes = await schemeService.getEligibleSchemes(citizenProfile);
      
      // Get all schemes for AI analysis
      const allSchemes = await storage.getAllSchemes();

      // Clear previous recommendations
      await storage.deleteRecommendationsByUserId(userId);

      // Use AI to enhance recommendations
      const aiRecommendations = await openaiService.generateSchemeRecommendations(
        citizenProfile,
        allSchemes
      );

      // Combine rule-based and AI recommendations
      const combinedRecommendations = this.combineRecommendations(
        eligibleSchemes,
        aiRecommendations,
        allSchemes
      );

      // Store recommendations
      const storedRecommendations: RecommendationWithScheme[] = [];
      
      for (const rec of combinedRecommendations) {
        const scheme = allSchemes.find(s => s.id === rec.schemeId);
        if (scheme) {
          const insertRec: InsertRecommendation = {
            userId,
            schemeId: rec.schemeId,
            score: rec.score.toString(),
            reasoning: rec.reasoning,
            eligibilityStatus: rec.eligibilityStatus
          };

          const storedRec = await storage.createRecommendation(insertRec);
          storedRecommendations.push({
            ...storedRec,
            scheme,
            score: parseFloat(storedRec.score)
          });
        }
      }

      // Sort by score descending
      return storedRecommendations.sort((a, b) => b.score - a.score);

    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw new Error("Failed to generate recommendations");
    }
  }

  async getUserRecommendations(userId: string): Promise<RecommendationWithScheme[]> {
    const recommendations = await storage.getRecommendationsByUserId(userId);
    const enrichedRecommendations: RecommendationWithScheme[] = [];

    for (const rec of recommendations) {
      const scheme = await storage.getSchemeById(rec.schemeId);
      if (scheme) {
        enrichedRecommendations.push({
          ...rec,
          scheme,
          score: parseFloat(rec.score)
        });
      }
    }

    return enrichedRecommendations.sort((a, b) => b.score - a.score);
  }

  private combineRecommendations(
    ruleBasedSchemes: Array<Scheme & {eligibility: any}>,
    aiRecommendations: Array<{schemeId: string; score: number; reasoning: string; eligibilityStatus: string}>,
    allSchemes: Scheme[]
  ) {
    const combinedMap = new Map<string, any>();

    // Add rule-based recommendations
    ruleBasedSchemes.forEach(schemeWithEligibility => {
      combinedMap.set(schemeWithEligibility.id, {
        schemeId: schemeWithEligibility.id,
        score: schemeWithEligibility.eligibility.score,
        reasoning: this.formatRuleBasedReasoning(schemeWithEligibility.eligibility),
        eligibilityStatus: schemeWithEligibility.eligibility.eligible ? "eligible" : "partially_eligible"
      });
    });

    // Enhance with AI recommendations
    aiRecommendations.forEach(aiRec => {
      const existing = combinedMap.get(aiRec.schemeId);
      if (existing) {
        // Combine scores (weighted average: 60% rule-based, 40% AI)
        const combinedScore = (existing.score * 0.6) + (aiRec.score * 0.4);
        combinedMap.set(aiRec.schemeId, {
          ...existing,
          score: combinedScore,
          reasoning: `${existing.reasoning}\n\nAI Analysis: ${aiRec.reasoning}`,
          eligibilityStatus: this.combineEligibilityStatus(existing.eligibilityStatus, aiRec.eligibilityStatus)
        });
      } else {
        // Add new AI recommendation
        combinedMap.set(aiRec.schemeId, {
          schemeId: aiRec.schemeId,
          score: aiRec.score * 0.8, // Slightly lower weight for AI-only recommendations
          reasoning: `AI Analysis: ${aiRec.reasoning}`,
          eligibilityStatus: aiRec.eligibilityStatus
        });
      }
    });

    return Array.from(combinedMap.values())
      .filter(rec => rec.score >= 0.3) // Only include recommendations with decent scores
      .slice(0, 20); // Limit to top 20 recommendations
  }

  private formatRuleBasedReasoning(eligibility: any): string {
    let reasoning = "Based on your profile analysis:\n";
    
    if (eligibility.reasons.length > 0) {
      reasoning += "✅ Matching criteria:\n";
      eligibility.reasons.forEach((reason: string) => {
        reasoning += `• ${reason}\n`;
      });
    }

    if (eligibility.missingCriteria.length > 0) {
      reasoning += "\n⚠️ Please note:\n";
      eligibility.missingCriteria.forEach((criteria: string) => {
        reasoning += `• ${criteria}\n`;
      });
    }

    return reasoning.trim();
  }

  private combineEligibilityStatus(status1: string, status2: string): string {
    const statusPriority = {
      "eligible": 3,
      "partially_eligible": 2,
      "not_eligible": 1
    };

    const priority1 = statusPriority[status1 as keyof typeof statusPriority] || 1;
    const priority2 = statusPriority[status2 as keyof typeof statusPriority] || 1;

    if (priority1 >= priority2) return status1;
    return status2;
  }

  async getRecommendationsByCategory(userId: string, category: string): Promise<RecommendationWithScheme[]> {
    const allRecommendations = await this.getUserRecommendations(userId);
    return allRecommendations.filter(rec => 
      rec.scheme.category.toLowerCase() === category.toLowerCase()
    );
  }

  async refreshRecommendations(userId: string): Promise<RecommendationWithScheme[]> {
    // Clear existing recommendations and generate fresh ones
    await storage.deleteRecommendationsByUserId(userId);
    return this.generateRecommendations(userId);
  }
}

export const recommendationService = new RecommendationService();
