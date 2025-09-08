import { randomUUID } from "crypto";
import type { User, CitizenProfile, Scheme, Application, Recommendation, ChatConversation, ChatMessage, Grievance } from "@shared/schema";
import type {
  InsertUser, InsertCitizenProfile, InsertScheme, InsertApplication, 
  InsertRecommendation, InsertChatConversation, InsertChatMessage, InsertGrievance
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Citizen profiles
  getCitizenProfile(userId: string): Promise<CitizenProfile | undefined>;
  createCitizenProfile(profile: InsertCitizenProfile): Promise<CitizenProfile>;
  updateCitizenProfile(userId: string, updates: Partial<InsertCitizenProfile>): Promise<CitizenProfile | undefined>;
  
  // Schemes
  getAllSchemes(): Promise<Scheme[]>;
  getSchemeById(id: string): Promise<Scheme | undefined>;
  getSchemesByCategory(category: string): Promise<Scheme[]>;
  getSchemesByState(state: string): Promise<Scheme[]>;
  createScheme(scheme: InsertScheme): Promise<Scheme>;
  searchSchemes(query: string): Promise<Scheme[]>;
  
  // Applications
  getApplicationsByUserId(userId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationById(id: string): Promise<Application | undefined>;
  
  // Recommendations
  getRecommendationsByUserId(userId: string): Promise<Recommendation[]>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  deleteRecommendationsByUserId(userId: string): Promise<void>;
  
  // Chat
  getChatConversation(sessionId: string): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatMessages(conversationId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Grievances
  getGrievancesByUserId(userId: string): Promise<Grievance[]>;
  createGrievance(grievance: InsertGrievance): Promise<Grievance>;
  updateGrievanceStatus(id: string, status: string, resolution?: string): Promise<Grievance | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private citizenProfiles: Map<string, CitizenProfile> = new Map();
  private schemes: Map<string, Scheme> = new Map();
  private applications: Map<string, Application> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private chatConversations: Map<string, ChatConversation> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private grievances: Map<string, Grievance> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize with comprehensive government schemes
    const sampleSchemes: InsertScheme[] = [
      {
        name: "PM Kisan Samman Nidhi",
        description: "Direct financial assistance of ₹6,000 per year to small and marginal farmers",
        category: "Agriculture",
        ministry: "Ministry of Agriculture and Farmers Welfare",
        state: null,
        eligibilityCriteria: {
          landHolding: "Up to 2 hectares",
          farmerType: "Small and marginal farmers",
          citizenship: "Indian citizen"
        },
        benefits: "₹6,000 per year in three equal installments of ₹2,000 each",
        applicationProcess: "Apply online through PM Kisan portal with land records",
        documents: ["Aadhaar Card", "Bank Account Details", "Land Records"],
        applicationUrl: "https://pmkisan.gov.in/",
        isActive: true,
        maxIncome: 200000,
        minAge: 18,
        maxAge: null,
        targetCategories: ["General", "OBC", "SC", "ST"],
        targetOccupations: ["Farmer"]
      },
      {
        name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
        description: "Health insurance scheme providing coverage up to ₹5 lakh per family per year",
        category: "Healthcare",
        ministry: "Ministry of Health and Family Welfare",
        state: null,
        eligibilityCriteria: {
          economicStatus: "Below poverty line or as per SECC database",
          familyIncome: "Annual family income below ₹5 lakh"
        },
        benefits: "Free treatment up to ₹5 lakh per family per year at empaneled hospitals",
        applicationProcess: "Automatic enrollment based on SECC database or apply at Common Service Centers",
        documents: ["Aadhaar Card", "Income Certificate", "SECC verification"],
        applicationUrl: "https://pmjay.gov.in/",
        isActive: true,
        maxIncome: 500000,
        minAge: null,
        maxAge: null,
        targetCategories: ["General", "OBC", "SC", "ST"],
        targetOccupations: null
      },
      {
        name: "Pradhan Mantri Awas Yojana (Urban)",
        description: "Affordable housing scheme for urban poor with financial assistance for house construction",
        category: "Housing",
        ministry: "Ministry of Housing and Urban Affairs",
        state: null,
        eligibilityCriteria: {
          housing: "Should not own a pucca house",
          income: "Annual household income as per category",
          urban: "Must be urban resident"
        },
        benefits: "Financial assistance ranging from ₹1.5 lakh to ₹2.67 lakh",
        applicationProcess: "Apply online through official PMAY portal with required documents",
        documents: ["Aadhaar Card", "Income Certificate", "Property Documents", "Bank Account Details"],
        applicationUrl: "https://pmaymis.gov.in/",
        isActive: true,
        maxIncome: 1800000,
        minAge: 18,
        maxAge: null,
        targetCategories: ["General", "OBC", "SC", "ST"],
        targetOccupations: null
      },
      {
        name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
        description: "National Mission for Financial Inclusion to ensure access to financial services including Banking, Savings, Remittance, Credit, Insurance, and Pension",
        category: "Banking",
        ministry: "Ministry of Finance",
        state: null,
        eligibilityCriteria: {
          age: "Minimum 10 years",
          documents: "Any officially valid document (OVD)",
          citizenship: "Indian citizen or eligible person"
        },
        benefits: "Zero balance account, RuPay Debit Card, ₹1 lakh accident insurance, ₹30,000 life cover, Overdraft facility up to ₹10,000",
        applicationProcess: "Visit any bank branch or Business Correspondent outlet with valid documents",
        documents: ["Aadhaar Card", "Voter ID", "Driving License", "PAN Card", "Passport"],
        applicationUrl: "https://www.pmjdy.gov.in/",
        isActive: true,
        maxIncome: null,
        minAge: 10,
        maxAge: null,
        targetCategories: ["General", "OBC", "SC", "ST", "EWS"],
        targetOccupations: null
      },
      {
        name: "PM Vishwakarma",
        description: "End-to-end support to artisans and craftspeople working with their hands and tools",
        category: "Employment",
        ministry: "Ministry of Micro, Small & Medium Enterprises",
        state: null,
        eligibilityCriteria: {
          occupation: "Artisans and craftspeople in 18 traditional trades",
          age: "18 years or above",
          engagement: "Must be engaged in relevant trade"
        },
        benefits: "Skill training, toolkit incentive, credit support up to ₹3 lakh, digital payments promotion, marketing support",
        applicationProcess: "Register through Common Service Centers or online portal with biometric verification",
        documents: ["Aadhaar Card", "Mobile Number", "Bank Account Details"],
        applicationUrl: "https://pmvishwakarma.gov.in/",
        isActive: true,
        maxIncome: null,
        minAge: 18,
        maxAge: null,
        targetCategories: ["General", "OBC", "SC", "ST"],
        targetOccupations: ["Carpenter", "Blacksmith", "Goldsmith", "Potter", "Sculptor", "Other Artisan"]
      },
      {
        name: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        description: "One year cover renewable life insurance scheme providing death coverage",
        category: "Insurance",
        ministry: "Ministry of Finance",
        state: null,
        eligibilityCriteria: {
          age: "18 to 50 years for joining",
          account: "Savings bank account holder",
          premium: "Auto-debit consent for premium"
        },
        benefits: "₹2 lakh death coverage for any reason, renewable every year till age 55",
        applicationProcess: "Apply through participating banks with auto-debit mandate",
        documents: ["Aadhaar Card", "Bank Account Details", "Consent Form"],
        applicationUrl: "https://www.jansuraksha.gov.in/",
        isActive: true,
        maxIncome: null,
        minAge: 18,
        maxAge: 50,
        targetCategories: ["General", "OBC", "SC", "ST", "EWS"],
        targetOccupations: null
      },
      {
        name: "Pradhan Mantri Matritva Vandana Yojana",
        description: "Conditional cash transfer scheme for pregnant and lactating mothers",
        category: "Women & Child",
        ministry: "Ministry of Women and Child Development",
        state: null,
        eligibilityCriteria: {
          pregnancy: "First living child",
          age: "19 years or above",
          registration: "Registered at Anganwadi Centre"
        },
        benefits: "₹5,000 in three installments during pregnancy and lactation period",
        applicationProcess: "Register at nearest Anganwadi Centre or health facility",
        documents: ["Mother and Child Protection Card", "Aadhaar Card", "Bank Account Details"],
        applicationUrl: "https://wcd.nic.in/",
        isActive: true,
        maxIncome: null,
        minAge: 19,
        maxAge: null,
        targetCategories: ["General", "OBC", "SC", "ST", "EWS"],
        targetOccupations: null
      },
      {
        name: "Atmanirbhar Bharat Rozgar Yojana",
        description: "Employment generation scheme to boost employment in formal sector and support employees and employers",
        category: "Employment",
        ministry: "Ministry of Labour and Employment",
        state: null,
        eligibilityCriteria: {
          employment: "New employees earning up to ₹15,000 monthly",
          establishment: "Registered establishments with EPFO",
          period: "Employment from October 1, 2020"
        },
        benefits: "Government contribution to EPF for eligible employees and employers",
        applicationProcess: "Automatic enrollment through EPFO for eligible establishments",
        documents: ["EPF Registration", "Employee Details", "Salary Records"],
        applicationUrl: "https://www.epfindia.gov.in/",
        isActive: true,
        maxIncome: 180000,
        minAge: 18,
        maxAge: null,
        targetCategories: ["General", "OBC", "SC", "ST", "EWS"],
        targetOccupations: ["Private Employee", "Skilled Worker"]
      }
    ];

    sampleSchemes.forEach(scheme => {
      const id = randomUUID();
      this.schemes.set(id, {
        ...scheme,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        state: scheme.state || null,
        documents: scheme.documents || null,
        applicationUrl: scheme.applicationUrl || null,
        isActive: scheme.isActive || true,
        maxIncome: scheme.maxIncome || null,
        minAge: scheme.minAge || null,
        maxAge: scheme.maxAge || null,
        targetCategories: scheme.targetCategories || null,
        targetOccupations: scheme.targetOccupations || null
      });
    });
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      phone: insertUser.phone || null,
      preferredLanguage: insertUser.preferredLanguage || "en"
    };
    this.users.set(id, user);
    return user;
  }

  // Citizen profiles
  async getCitizenProfile(userId: string): Promise<CitizenProfile | undefined> {
    return Array.from(this.citizenProfiles.values()).find(profile => profile.userId === userId);
  }

  async createCitizenProfile(insertProfile: InsertCitizenProfile): Promise<CitizenProfile> {
    const id = randomUUID();
    const profile: CitizenProfile = {
      ...insertProfile,
      id,
      updatedAt: new Date(),
      aadhaarNumber: insertProfile.aadhaarNumber || null,
      dateOfBirth: insertProfile.dateOfBirth || null,
      gender: insertProfile.gender || null,
      district: insertProfile.district || null,
      pincode: insertProfile.pincode || null,
      annualIncome: insertProfile.annualIncome || null,
      category: insertProfile.category || null,
      occupation: insertProfile.occupation || null,
      education: insertProfile.education || null,
      familySize: insertProfile.familySize || null,
      hasDisability: insertProfile.hasDisability || false,
      disabilityType: insertProfile.disabilityType || null,
      bankAccount: insertProfile.bankAccount || null,
      languagePreference: insertProfile.languagePreference || "en",
      additionalDetails: insertProfile.additionalDetails || null
    };
    this.citizenProfiles.set(id, profile);
    return profile;
  }

  async updateCitizenProfile(userId: string, updates: Partial<InsertCitizenProfile>): Promise<CitizenProfile | undefined> {
    const existing = await this.getCitizenProfile(userId);
    if (!existing) return undefined;
    
    const updated: CitizenProfile = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.citizenProfiles.set(existing.id, updated);
    return updated;
  }

  // Schemes
  async getAllSchemes(): Promise<Scheme[]> {
    return Array.from(this.schemes.values()).filter(scheme => scheme.isActive);
  }

  async getSchemeById(id: string): Promise<Scheme | undefined> {
    return this.schemes.get(id);
  }

  async getSchemesByCategory(category: string): Promise<Scheme[]> {
    return Array.from(this.schemes.values()).filter(
      scheme => scheme.isActive && scheme.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getSchemesByState(state: string): Promise<Scheme[]> {
    return Array.from(this.schemes.values()).filter(
      scheme => scheme.isActive && (scheme.state === null || scheme.state === state)
    );
  }

  async createScheme(insertScheme: InsertScheme): Promise<Scheme> {
    const id = randomUUID();
    const scheme: Scheme = {
      ...insertScheme,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      state: insertScheme.state || null,
      documents: insertScheme.documents || null,
      applicationUrl: insertScheme.applicationUrl || null,
      isActive: insertScheme.isActive || true,
      maxIncome: insertScheme.maxIncome || null,
      minAge: insertScheme.minAge || null,
      maxAge: insertScheme.maxAge || null,
      targetCategories: insertScheme.targetCategories || null,
      targetOccupations: insertScheme.targetOccupations || null
    };
    this.schemes.set(id, scheme);
    return scheme;
  }

  async searchSchemes(query: string): Promise<Scheme[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.schemes.values()).filter(
      scheme => scheme.isActive && (
        scheme.name.toLowerCase().includes(lowercaseQuery) ||
        scheme.description.toLowerCase().includes(lowercaseQuery) ||
        scheme.category.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Applications
  async getApplicationsByUserId(userId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.userId === userId);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const application: Application = {
      ...insertApplication,
      id,
      appliedAt: new Date(),
      lastUpdated: new Date(),
      statusHistory: [],
      status: insertApplication.status || "submitted"
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplicationById(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  // Recommendations
  async getRecommendationsByUserId(userId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(rec => rec.userId === userId);
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const recommendation: Recommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date(),
      reason: insertRecommendation.reason || null
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async deleteRecommendationsByUserId(userId: string): Promise<void> {
    Array.from(this.recommendations.entries())
      .filter(([_, rec]) => rec.userId === userId)
      .forEach(([id]) => this.recommendations.delete(id));
  }

  // Chat
  async getChatConversation(sessionId: string): Promise<ChatConversation | undefined> {
    return Array.from(this.chatConversations.values()).find(conv => conv.sessionId === sessionId);
  }

  async createChatConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const id = randomUUID();
    const conversation: ChatConversation = {
      ...insertConversation,
      id,
      startedAt: new Date(),
      lastActiveAt: new Date()
    };
    this.chatConversations.set(id, conversation);
    return conversation;
  }

  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      contentType: insertMessage.contentType || null
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Grievances
  async getGrievancesByUserId(userId: string): Promise<Grievance[]> {
    return Array.from(this.grievances.values()).filter(grievance => grievance.userId === userId);
  }

  async createGrievance(insertGrievance: InsertGrievance): Promise<Grievance> {
    const id = randomUUID();
    const grievance: Grievance = {
      ...insertGrievance,
      id,
      createdAt: new Date(),
      status: insertGrievance.status || "open"
    };
    this.grievances.set(id, grievance);
    return grievance;
  }

  async updateGrievanceStatus(id: string, status: string, resolution?: string): Promise<Grievance | undefined> {
    const existing = this.grievances.get(id);
    if (!existing) return undefined;
    
    const updated: Grievance = {
      ...existing,
      status,
      resolution: resolution || existing.resolution
    };
    this.grievances.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();