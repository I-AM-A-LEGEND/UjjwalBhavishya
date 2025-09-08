
import { describe, it, expect, vi } from 'vitest';
import { generateChatResponse } from './gemini';

vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Translated text',
    },
  });

  const mockStartChat = vi.fn().mockReturnValue({
    sendMessageStream: vi.fn().mockResolvedValue({
      stream: (async function*() {
        yield { text: () => 'Translated ' };
        yield { text: () => 'text' };
      })(),
    }),
  });

  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    generateContent: mockGenerateContent,
    startChat: mockStartChat,
  });

  const mockGoogleGenerativeAI = vi.fn().mockReturnValue({
    getGenerativeModel: mockGetGenerativeModel,
  });

  return {
    GoogleGenerativeAI: mockGoogleGenerativeAI,
  };
});

describe('Gemini Service', () => {
  it('should generate a chat response', async () => {
    const response = await generateChatResponse('Hello', 'es', []);
    expect(response).toBe('Translated text');
  });
});
