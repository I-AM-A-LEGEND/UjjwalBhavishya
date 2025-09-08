import { storage } from "../storage";

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
      const citizenProfile = await storage.getCitizenProfile(userId);
      if (!citizenProfile) {
        throw new Error("Citizen profile not found");
      }

      const allSchemes = await storage.getAllSchemes();
      await storage.deleteRecommendationsByUserId(userId);

      const recommendations = allSchemes.map(scheme => {
        const score = this.calculateSchemeScore(citizenProfile, scheme);
        return { scheme, score };
      });

      const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score);

      const topRecommendations = sortedRecommendations.slice(0, 10);

      const storedRecommendations: RecommendationWithScheme[] = [];
      for (const rec of topRecommendations) {
        if (rec.score > 0) {
          const insertRec: InsertRecommendation = {
            userId,
            schemeId: rec.scheme.id,
            score: rec.score,
            reason: "This scheme is a good match for your profile based on our analysis.",
          };

          const storedRec = await storage.createRecommendation(insertRec);
          storedRecommendations.push({
            ...storedRec,
            scheme: rec.scheme,
            reasoning: storedRec.reason,
            eligibilityStatus: "pending",
            generatedAt: storedRec.createdAt,
          });
        }
      }

      return storedRecommendations;

    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw new Error("Failed to generate recommendations");
    }
  }

  private calculateSchemeScore(profile: CitizenProfile, scheme: Scheme): number {
    let score = 0;

    if (scheme.targetCategories && scheme.targetCategories.includes(profile.category)) {
      score += 20;
    }

    if (scheme.targetOccupations && scheme.targetOccupations.includes(profile.occupation)) {
      score += 20;
    }

    if (scheme.maxIncome && profile.annualIncome && profile.annualIncome <= scheme.maxIncome) {
      score += 15;
    }

    if (scheme.minAge && profile.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
      if (age >= scheme.minAge) {
        score += 10;
      }
    }

    if (scheme.maxAge && profile.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
      if (age <= scheme.maxAge) {
        score += 10;
      }
    }

    if (profile.hasDisability && scheme.description.toLowerCase().includes("disability")) {
      score += 25;
    }

    return score;
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
