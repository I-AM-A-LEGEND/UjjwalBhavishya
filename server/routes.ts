import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { schemeService } from "./services/schemes";
import { recommendationService } from "./services/recommendations";
import { 
  insertUserSchema, insertCitizenProfileSchema, insertApplicationSchema,
  insertChatConversationSchema, insertChatMessageSchema, insertGrievanceSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const activeConnections = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, request) => {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      activeConnections.set(userId, ws);
      console.log(`WebSocket connected for user: ${userId}`);
    }

    ws.on('close', () => {
      if (userId) {
        activeConnections.delete(userId);
        console.log(`WebSocket disconnected for user: ${userId}`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Utility function to send real-time updates
  const sendRealtimeUpdate = (userId: string, data: any) => {
    const connection = activeConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(data));
    }
  };

  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Citizen profile endpoints
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getCitizenProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = insertCitizenProfileSchema.parse(req.body);
      const profile = await storage.createCitizenProfile(profileData);
      
      // Generate initial recommendations
      try {
        await recommendationService.generateRecommendations(profileData.userId);
      } catch (error) {
        console.error("Failed to generate initial recommendations:", error);
      }

      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const updates = insertCitizenProfileSchema.partial().parse(req.body);
      const profile = await storage.updateCitizenProfile(req.params.userId, updates);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Regenerate recommendations after profile update
      try {
        await recommendationService.refreshRecommendations(req.params.userId);
      } catch (error) {
        console.error("Failed to refresh recommendations:", error);
      }

      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Schemes endpoints
  app.get("/api/schemes", async (req, res) => {
    try {
      const { category, state, maxIncome, search } = req.query;
      
      const filters = {
        category: category as string,
        state: state as string,
        maxIncome: maxIncome ? parseInt(maxIncome as string) : undefined,
        search: search as string
      };

      const schemes = await schemeService.getSchemesByFilters(filters);
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schemes" });
    }
  });

  app.get("/api/schemes/categories", async (req, res) => {
    try {
      const categories = await schemeService.getSchemeCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/schemes/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const schemes = await schemeService.getPopularSchemes(limit);
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular schemes" });
    }
  });

  app.get("/api/schemes/:id", async (req, res) => {
    try {
      const scheme = await storage.getSchemeById(req.params.id);
      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }
      res.json(scheme);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scheme" });
    }
  });

  // Eligibility check endpoint
  app.post("/api/schemes/:id/check-eligibility", async (req, res) => {
    try {
      const { userId } = req.body;
      const scheme = await storage.getSchemeById(req.params.id);
      const profile = await storage.getCitizenProfile(userId);

      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }

      if (!profile) {
        return res.status(404).json({ message: "Citizen profile not found" });
      }

      const eligibility = await schemeService.checkEligibility(profile, scheme);
      res.json(eligibility);
    } catch (error) {
      res.status(500).json({ message: "Failed to check eligibility" });
    }
  });

  // Recommendations endpoints
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const recommendations = await recommendationService.getUserRecommendations(req.params.userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/recommendations/:userId/generate", async (req, res) => {
    try {
      const recommendations = await recommendationService.generateRecommendations(req.params.userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Applications endpoints
  app.get("/api/applications/:userId", async (req, res) => {
    try {
      const applications = await storage.getApplicationsByUserId(req.params.userId);
      
      // Enrich with scheme details
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const scheme = await storage.getSchemeById(app.schemeId);
          return { ...app, scheme };
        })
      );

      res.json(enrichedApplications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      
      // Send real-time notification
      sendRealtimeUpdate(applicationData.userId, {
        type: 'application_submitted',
        data: application
      });

      res.json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/applications/:id/status", async (req, res) => {
    try {
      const { status, remarks } = req.body;
      const application = await storage.updateApplicationStatus(req.params.id, status, remarks);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Send real-time notification
      sendRealtimeUpdate(application.userId, {
        type: 'application_status_updated',
        data: application
      });

      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Chatbot endpoints
  app.post("/api/chat/conversation", async (req, res) => {
    try {
      const conversationData = insertChatConversationSchema.parse(req.body);
      const conversation = await storage.createChatConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.get("/api/chat/conversation/:sessionId", async (req, res) => {
    try {
      const conversation = await storage.getChatConversation(req.params.sessionId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getChatMessages(conversation.id);
      res.json({ conversation, messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const userMessage = await storage.createChatMessage(messageData);
      
      // Get conversation details for context
      const conversation = await storage.getChatConversation(messageData.conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Get conversation history
      const messages = await storage.getChatMessages(messageData.conversationId);
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await openaiService.generateChatResponse(
        messageData.content,
        conversation.language || "en",
        undefined,
        conversationHistory
      );

      // Store AI response
      const aiMessage = await storage.createChatMessage({
        conversationId: messageData.conversationId,
        role: "assistant",
        content: aiResponse.content,
        contentType: "text"
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      res.status(400).json({ message: "Failed to process message", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Grievance endpoints
  app.get("/api/grievances/:userId", async (req, res) => {
    try {
      const grievances = await storage.getGrievancesByUserId(req.params.userId);
      res.json(grievances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grievances" });
    }
  });

  app.post("/api/grievances", async (req, res) => {
    try {
      const grievanceData = insertGrievanceSchema.parse(req.body);
      const grievance = await storage.createGrievance(grievanceData);
      
      // Send real-time notification
      sendRealtimeUpdate(grievanceData.userId, {
        type: 'grievance_submitted',
        data: grievance
      });

      res.json(grievance);
    } catch (error) {
      res.status(400).json({ message: "Invalid grievance data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      const translatedText = await openaiService.translateText(text, targetLanguage);
      res.json({ translatedText });
    } catch (error) {
      res.status(500).json({ message: "Translation failed" });
    }
  });

  // External API integration endpoints (mock for development)
  app.get("/api/external/myscheme", async (req, res) => {
    try {
      // Mock integration with myScheme.gov.in
      // In production, this would make actual API calls
      res.json({
        status: "success",
        message: "myScheme API integration placeholder",
        schemes: await storage.getAllSchemes()
      });
    } catch (error) {
      res.status(500).json({ message: "External API integration error" });
    }
  });

  app.get("/api/external/apisetu", async (req, res) => {
    try {
      // Mock integration with API Setu
      // In production, this would make actual API calls
      res.json({
        status: "success",
        message: "API Setu integration placeholder",
        data: "Government API data would be fetched here"
      });
    } catch (error) {
      res.status(500).json({ message: "External API integration error" });
    }
  });

  return httpServer;
}
