import { storage } from "../storage";

import { schemeService, EligibilityResult } from "./schemes";
import { type CitizenProfile, type Scheme, type InsertRecommendation } from "@shared/schema";

export interface RecommendationWithScheme {
  id: string;
  userId: string;
  scheme: Scheme;
  score: number;
  reasoning: string;
  eligibilityStatus: string;
  eligibilityDetails: EligibilityResult;
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

      const recommendationsWithEligibility = await Promise.all(allSchemes.map(async (scheme) => {
        const eligibility = await schemeService.checkEligibility(citizenProfile, scheme);
        // Use eligibility score as the primary score for recommendation
        return { scheme, score: eligibility.score, eligibilityDetails: eligibility };
      }));

      const sortedRecommendations = recommendationsWithEligibility.sort((a, b) => b.score - a.score);

      const topRecommendations = sortedRecommendations.slice(0, 10); // Get top 10 recommendations

      const storedRecommendations: RecommendationWithScheme[] = [];
      for (const rec of topRecommendations) {
        // Only store recommendations with a score > 0 (meaning some criteria matched)
        if (rec.score > 0) {
          const insertRec: InsertRecommendation = {
            userId,
            schemeId: rec.scheme.id,
            score: rec.score,
            reason: rec.eligibilityDetails.eligible ? "You are eligible for this scheme." : "You are partially eligible for this scheme.",
          };

          const storedRec = await storage.createRecommendation(insertRec);
          storedRecommendations.push({
            ...storedRec,
            scheme: rec.scheme,
            reasoning: storedRec.reason || "", // Ensure reasoning is not null
            eligibilityStatus: rec.eligibilityDetails.eligible ? "eligible" : "partially_eligible",
            eligibilityDetails: rec.eligibilityDetails,
            generatedAt: storedRec.createdAt as Date, // Assert as Date
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

    if (Array.isArray(scheme.targetCategories) && scheme.targetCategories.includes(profile.category)) {
      score += 20;
    }

    if (Array.isArray(scheme.targetOccupations) && scheme.targetOccupations.includes(profile.occupation)) {
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
        // Re-check eligibility to get fresh details, or retrieve if stored
        const citizenProfile = await storage.getCitizenProfile(userId);
        let eligibilityDetails: EligibilityResult = { eligible: false, score: 0, reasons: [], missingCriteria: [] };
        if (citizenProfile) {
          eligibilityDetails = await schemeService.checkEligibility(citizenProfile, scheme);
        }

        enrichedRecommendations.push({
          ...rec,
          scheme,
          score: rec.score, // Changed from parseFloat(rec.score)
          reasoning: rec.reason || "", // Ensure reasoning is not null
          eligibilityStatus: eligibilityDetails.eligible ? "eligible" : "partially_eligible",
          eligibilityDetails: eligibilityDetails,
          generatedAt: rec.createdAt as Date, // Assert as Date
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
