import { 
  type User, type InsertUser, type CitizenProfile, type InsertCitizenProfile,
  type Scheme, type InsertScheme, type Application, type InsertApplication,
  type Recommendation, type InsertRecommendation, type ChatConversation, 
  type InsertChatConversation, type ChatMessage, type InsertChatMessage,
  type Grievance, type InsertGrievance
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Citizen profiles
  getCitizenProfile(userId: string): Promise<CitizenProfile | undefined>;
  createCitizenProfile(profile: InsertCitizenProfile): Promise<CitizenProfile>;
  updateCitizenProfile(userId: string, profile: Partial<InsertCitizenProfile>): Promise<CitizenProfile | undefined>;
  
  // Schemes
  getAllSchemes(): Promise<Scheme[]>;
  getSchemeById(id: string): Promise<Scheme | undefined>;
  getSchemesByCategory(category: string): Promise<Scheme[]>;
  getSchemesByState(state: string): Promise<Scheme[]>;
  createScheme(scheme: InsertScheme): Promise<Scheme>;
  searchSchemes(query: string): Promise<Scheme[]>;
  
  // Applications
  getApplicationsByUserId(userId: string): Promise<Application[]>;
  getApplicationById(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string, remarks?: string): Promise<Application | undefined>;
  
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
    // Initialize with some sample government schemes
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
      }
    ];

    sampleSchemes.forEach(scheme => {
      const id = randomUUID();
      this.schemes.set(id, { ...scheme, id, createdAt: new Date(), updatedAt: new Date() });
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
      createdAt: new Date() 
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
      updatedAt: new Date() 
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
      updatedAt: new Date() 
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

  async getApplicationById(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const application: Application = { 
      ...insertApplication, 
      id, 
      appliedAt: new Date(), 
      lastUpdated: new Date(),
      statusHistory: [{ status: insertApplication.status || "submitted", timestamp: new Date() }]
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplicationStatus(id: string, status: string, remarks?: string): Promise<Application | undefined> {
    const existing = this.applications.get(id);
    if (!existing) return undefined;
    
    const statusHistory = existing.statusHistory as any[] || [];
    statusHistory.push({ status, timestamp: new Date(), remarks });
    
    const updated: Application = { 
      ...existing, 
      status, 
      remarks: remarks || existing.remarks,
      lastUpdated: new Date(),
      statusHistory 
    };
    this.applications.set(id, updated);
    return updated;
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
      createdAt: new Date() 
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async deleteRecommendationsByUserId(userId: string): Promise<void> {
    const userRecommendations = await this.getRecommendationsByUserId(userId);
    userRecommendations.forEach(rec => this.recommendations.delete(rec.id));
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
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.chatMessages.set(id, message);
    
    // Update conversation last active time
    const conversation = this.chatConversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.lastActiveAt = new Date();
      this.chatConversations.set(conversation.id, conversation);
    }
    
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
      createdAt: new Date() 
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
      resolution: resolution || existing.resolution,
      resolvedAt: status === "resolved" ? new Date() : existing.resolvedAt
    };
    this.grievances.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
