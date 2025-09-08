import { storage } from "../storage";
import { type CitizenProfile, type Scheme } from "@shared/schema";

export interface EligibilityResult {
  eligible: boolean;
  score: number;
  reasons: string[];
  missingCriteria: string[];
}

export class SchemeService {
  
  async checkEligibility(
    citizenProfile: CitizenProfile, 
    scheme: Scheme
  ): Promise<EligibilityResult> {
    const reasons: string[] = [];
    const missingCriteria: string[] = [];
    let score = 0;
    let totalChecks = 0;

    // Check income eligibility
    if (scheme.maxIncome !== null) {
      totalChecks++;
      if (citizenProfile.annualIncome !== null && citizenProfile.annualIncome <= scheme.maxIncome) {
        score++;
        reasons.push(`Annual income ₹${citizenProfile.annualIncome} is within the limit of ₹${scheme.maxIncome}`);
      } else {
        missingCriteria.push(`Annual income should be below ₹${scheme.maxIncome}`);
      }
    }

    // Check age eligibility
    if (scheme.minAge !== null || scheme.maxAge !== null) {
      totalChecks++;
      const age = this.calculateAge(citizenProfile.dateOfBirth);
      if (age !== null) {
        const ageEligible = (scheme.minAge === null || age >= scheme.minAge) && 
                           (scheme.maxAge === null || age <= scheme.maxAge);
        if (ageEligible) {
          score++;
          reasons.push(`Age ${age} meets the requirement`);
        } else {
          missingCriteria.push(`Age should be between ${scheme.minAge || 0} and ${scheme.maxAge || 'any'}`);
        }
      } else {
        missingCriteria.push("Date of birth required for age verification");
      }
    }

    // Check category eligibility
    if (scheme.targetCategories) {
      const categories = Array.isArray(scheme.targetCategories) 
        ? scheme.targetCategories 
        : JSON.parse(JSON.stringify(scheme.targetCategories));
      
      if (categories.length > 0) {
        totalChecks++;
        if (citizenProfile.category && categories.includes(citizenProfile.category)) {
          score++;
          reasons.push(`Category ${citizenProfile.category} is eligible`);
        } else {
          missingCriteria.push(`Category should be one of: ${categories.join(', ')}`);
        }
      }
    }

    // Check occupation eligibility
    if (scheme.targetOccupations) {
      const occupations = Array.isArray(scheme.targetOccupations) 
        ? scheme.targetOccupations 
        : JSON.parse(JSON.stringify(scheme.targetOccupations));
      
      if (occupations.length > 0) {
        totalChecks++;
        if (citizenProfile.occupation && occupations.includes(citizenProfile.occupation)) {
          score++;
          reasons.push(`Occupation ${citizenProfile.occupation} is eligible`);
        } else {
          missingCriteria.push(`Occupation should be one of: ${occupations.join(', ')}`);
        }
      }
    }

    // Check state eligibility
    if (scheme.state !== null) {
      totalChecks++;
      if (citizenProfile.state === scheme.state) {
        score++;
        reasons.push(`State ${citizenProfile.state} matches scheme requirement`);
      } else {
        missingCriteria.push(`Scheme is only for residents of ${scheme.state}`);
      }
    }

    // Check specific eligibility criteria from scheme
    if (scheme.eligibilityCriteria) {
      const criteria = typeof scheme.eligibilityCriteria === 'string' 
        ? JSON.parse(scheme.eligibilityCriteria)
        : scheme.eligibilityCriteria;
      
      // Add more specific checks based on scheme criteria
      if (criteria.farmerType && citizenProfile.occupation !== 'Farmer') {
        totalChecks++;
        missingCriteria.push("Must be a farmer");
      } else if (criteria.farmerType && citizenProfile.occupation === 'Farmer') {
        totalChecks++;
        score++;
        reasons.push("Occupation as farmer meets the requirement");
      }
      
      if (criteria.housing && criteria.housing.includes("not own")) {
        totalChecks++;
        reasons.push("Housing eligibility check required (to be verified during application)");
        score++; // Assume eligible for now, actual verification during application
      }
    }

    // Calculate final score and eligibility
    const finalScore = totalChecks > 0 ? score / totalChecks : 0;
    const eligible = finalScore >= 0.7; // 70% threshold for eligibility

    return {
      eligible,
      score: finalScore,
      reasons,
      missingCriteria
    };
  }

  async getEligibleSchemes(citizenProfile: CitizenProfile): Promise<Array<Scheme & {eligibility: EligibilityResult}>> {
    const allSchemes = await storage.getAllSchemes();
    const eligibleSchemes: Array<Scheme & {eligibility: EligibilityResult}> = [];

    for (const scheme of allSchemes) {
      const eligibility = await this.checkEligibility(citizenProfile, scheme);
      if (eligibility.eligible || eligibility.score >= 0.5) { // Include partially eligible schemes
        eligibleSchemes.push({
          ...scheme,
          eligibility
        });
      }
    }

    // Sort by eligibility score
    return eligibleSchemes.sort((a, b) => b.eligibility.score - a.eligibility.score);
  }

  async getSchemesByFilters(filters: {
    category?: string;
    state?: string;
    maxIncome?: number;
    search?: string;
  }): Promise<Scheme[]> {
    let schemes = await storage.getAllSchemes();

    if (filters.category) {
      schemes = schemes.filter(scheme => 
        scheme.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.state) {
      schemes = schemes.filter(scheme => 
        scheme.state === null || scheme.state === filters.state
      );
    }

    if (filters.maxIncome) {
      schemes = schemes.filter(scheme => 
        scheme.maxIncome === null || scheme.maxIncome >= filters.maxIncome!
      );
    }

    if (filters.search) {
      schemes = await storage.searchSchemes(filters.search);
    }

    return schemes;
  }

  private calculateAge(dateOfBirth: string | null): number | null {
    if (!dateOfBirth) return null;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }

  async getSchemeCategories(): Promise<string[]> {
    const schemes = await storage.getAllSchemes();
    const categories = [...new Set(schemes.map(scheme => scheme.category))];
    return categories.sort();
  }

  async getPopularSchemes(limit: number = 10): Promise<Scheme[]> {
    const schemes = await storage.getAllSchemes();
    // For now, return first few schemes as "popular"
    // In a real implementation, this would be based on application count or other metrics
    return schemes.slice(0, limit);
  }
}

export const schemeService = new SchemeService();
