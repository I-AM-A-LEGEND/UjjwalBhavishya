
import { describe, it, expect, vi } from 'vitest';
import { RecommendationService } from './recommendations';
import { storage } from '../storage';

vi.mock('../storage', () => {
  const mockStorage = {
    getCitizenProfile: vi.fn(),
    getAllSchemes: vi.fn(),
    deleteRecommendationsByUserId: vi.fn(),
    createRecommendation: vi.fn(),
  };
  return { storage: mockStorage };
});

describe('Recommendation Service', () => {
  it('should generate recommendations for a user', async () => {
    const recommendationService = new RecommendationService();

    const mockProfile = {
      userId: '1',
      category: 'General',
      occupation: 'Farmer',
      annualIncome: 100000,
      dateOfBirth: '1990-01-01',
      hasDisability: false,
    };

    const mockSchemes = [
      {
        id: '1',
        name: 'Scheme 1',
        targetCategories: ['General'],
        targetOccupations: ['Farmer'],
        maxIncome: 200000,
        minAge: 18,
        description: '',
      },
      {
        id: '2',
        name: 'Scheme 2',
        targetCategories: ['NonExistentCategory'],
        targetOccupations: ['NonExistentOccupation'],
        maxIncome: 10,
        minAge: 100,
        description: '',
      },
    ];

    const mockRecommendation = {
      id: '1',
      userId: '1',
      schemeId: '1',
      score: 55,
      reason: 'This scheme is a good match for your profile based on our analysis.',
      createdAt: new Date(),
    };

    // @ts-ignore
    storage.getCitizenProfile.mockResolvedValue(mockProfile);
    // @ts-ignore
    storage.getAllSchemes.mockResolvedValue(mockSchemes);
    // @ts-ignore
    storage.createRecommendation.mockResolvedValue(mockRecommendation);

    const recommendations = await recommendationService.generateRecommendations('1');

    expect(storage.getCitizenProfile).toHaveBeenCalledWith('1');
    expect(storage.getAllSchemes).toHaveBeenCalled();
    expect(storage.deleteRecommendationsByUserId).toHaveBeenCalledWith('1');
    expect(storage.createRecommendation).toHaveBeenCalled();
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].scheme.id).toBe('1');
  });
});
