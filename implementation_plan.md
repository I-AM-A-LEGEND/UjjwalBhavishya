# Implementation Plan

[Overview]
This document outlines the plan to enhance the UjjwalBhavishya application by integrating an AI-powered scheme recommendation engine, a multilingual citizen chatbot using the Gemini API, and real-time updates for grievance and application tracking. This implementation will significantly improve user engagement and provide more personalized and accessible services to citizens.

[Types]
This section describes the necessary modifications to the data structures and types to support the new features.

```typescript
// shared/schema.ts

// Add language preference to user profile
export const insertCitizenProfileSchema = z.object({
  // ... existing fields
  languagePreference: z.string().default('en'),
});

// New table for AI recommendations
export const recommendations = pgTable('recommendations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id),
  schemeId: text('scheme_id').notNull().references(() => schemes.id),
  score: real('score').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add language to chat conversation
export const insertChatConversationSchema = z.object({
  // ... existing fields
  language: z.string().default('en'),
});
```

[Files]
This section details the file modifications required for the implementation.

- **New Files:**
  - `server/services/gemini.ts`: To encapsulate all interactions with the Gemini API.
  - `client/src/components/chatbot/language-selector.tsx`: A new UI component to allow users to select their preferred language for the chatbot.

- **Modified Files:**
  - `shared/schema.ts`: Add new `recommendations` table and update `citizen_profiles` and `chat_conversations` schemas.
  - `server/storage.ts`: Add methods to interact with the new `recommendations` table.
  - `server/routes.ts`:
    - Modify the `/api/chat/message` endpoint to use the Gemini service instead of OpenAI.
    - Add a new endpoint `/api/profile/:userId/language` to update the user's language preference.
  - `server/services/recommendations.ts`: Update the recommendation logic to use a more sophisticated model and store results in the `recommendations` table.
  - `client/src/components/chatbot/chatbot.tsx`: Integrate the `language-selector.tsx` component and modify the chat functionality to handle multilingual conversations.
  - `client/src/components/applications/application-tracker.tsx`: Implement WebSocket logic to receive and display real-time status updates.
  - `client/src/pages/profile.tsx`: Add an option for the user to set their preferred language.

[Functions]
This section describes the function modifications.

- **New Functions:**
  - `server/services/gemini.ts`:
    - `generateChatResponse(prompt: string, language: string, history: any[]): Promise<string>`: Generates a chat response using the Gemini API.
    - `translateText(text: string, targetLanguage: string): Promise<string>`: Translates text using the Gemini API.
  - `server/storage.ts`:
    - `createRecommendation(recommendation: NewRecommendation): Promise<Recommendation>`
    - `getRecommendationsByUserId(userId: string): Promise<Recommendation[]>`
    - `deleteRecommendationsByUserId(userId: string): Promise<void>`
  - `client/src/components/chatbot/language-selector.tsx`:
    - `LanguageSelector({ onSelect, currentLanguage })`: A React component for language selection.

- **Modified Functions:**
  - `server/routes.ts`:
    - The function handling `POST /api/chat/message` will be updated to call `geminiService.generateChatResponse`.
  - `server/services/recommendations.ts`:
    - `generateRecommendations(userId: string)`: Will be updated to implement a decision-tree or a simple ML model logic for recommendations.
  - `client/src/components/chatbot/chatbot.tsx`:
    - The main component function will be updated to manage language state and pass it to the API.

[Classes]
No new classes are expected to be created. The existing classless, functional component-based architecture will be maintained.

[Dependencies]
This section describes the dependency modifications.

- **New Dependencies:**
  - `@google/generative-ai`: The official Node.js client for the Gemini API.

- **Removed Dependencies:**
  - `openai`: This will be replaced by the Gemini client.

[Testing]
This section describes the testing approach.

- **Unit Tests:**
  - New unit tests will be added for the `gemini.ts` service to mock API calls and verify responses.
  - Unit tests for the `recommendations.ts` service will be updated to reflect the new logic.
- **Integration Tests:**
  - The chatbot and recommendation endpoints will be tested to ensure they work with the new services.
- **End-to-End Tests:**
  - The user flows for changing language, using the chatbot in different languages, and viewing recommendations will be tested manually.

[Implementation Order]
This section describes the implementation sequence.

1. **Backend Setup:**
   - Add the `@google/generative-ai` dependency and remove `openai`.
   - Update the `shared/schema.ts` with the new table and field additions.
   - Run `drizzle-kit push` to apply schema changes to the database.
   - Implement the new functions in `server/storage.ts`.
2. **Gemini Service:**
   - Create the `server/services/gemini.ts` file and implement the chat and translation functions.
   - Update the environment variable handling to use `GEMINI_API_KEY`.
3. **Backend Logic:**
   - Update `server/routes.ts` to integrate the Gemini service into the chat endpoint.
   - Update the `server/services/recommendations.ts` with the new recommendation logic.
4. **Frontend Language Selection:**
   - Create the `language-selector.tsx` component.
   - Integrate the language selector into `profile.tsx` and `chatbot.tsx`.
5. **Frontend Chatbot:**
   - Update the `chatbot.tsx` component to handle multilingual support and interact with the updated backend.
6. **Real-Time Updates:**
   - Implement the WebSocket client-side logic in `application-tracker.tsx` to handle real-time updates.
7. **Testing:**
   - Write unit tests for the new backend services.
   - Perform integration and end-to-end testing for all new features.
