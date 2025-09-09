interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class TitleService {
  private static getApiKeys(provider: string): string[] {
    // Try to get multiple keys first
    const multipleKeys = localStorage.getItem(`${provider}_api_keys`);
    if (multipleKeys) {
      const keys = JSON.parse(multipleKeys);
      return Array.isArray(keys) ? keys.filter(key => key.trim()) : [];
    }
    
    // Fallback to single key for backward compatibility
    const singleKey = localStorage.getItem(`${provider}_api_key`);
    return singleKey ? [singleKey] : [];
  }

  private static async callOpenRouter(userMessage: string): Promise<string> {
    const apiKeys = this.getApiKeys('openrouter');
    if (apiKeys.length === 0) {
      throw new Error('OpenRouter API key not found');
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a title generator. Create a short, concise title (maximum 4-6 words) for the chat based on the user\'s first message. Only return the title, nothing else. Make it descriptive but brief.'
      },
      {
        role: 'user',
        content: `Generate a short title for this message: "${userMessage}"`
      }
    ];

    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Chat Application'
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3.5-sonnet',
            messages: messages,
            max_tokens: 50,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          if (i === apiKeys.length - 1) {
            throw new Error('OpenRouter API failed');
          }
          continue;
        }

        const data = await response.json();
        const title = data.choices[0]?.message?.content?.trim() || '';
        return title.length > 50 ? title.substring(0, 50) + '...' : title;
      } catch (error) {
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All OpenRouter API keys failed');
  }

  private static async callGroq(userMessage: string): Promise<string> {
    const apiKeys = this.getApiKeys('groq');
    if (apiKeys.length === 0) {
      throw new Error('Groq API key not found');
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a title generator. Create a short, concise title (maximum 4-6 words) for the chat based on the user\'s first message. Only return the title, nothing else. Make it descriptive but brief.'
      },
      {
        role: 'user',
        content: `Generate a short title for this message: "${userMessage}"`
      }
    ];

    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: messages,
            max_tokens: 50,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          if (i === apiKeys.length - 1) {
            throw new Error('Groq API failed');
          }
          continue;
        }

        const data = await response.json();
        const title = data.choices[0]?.message?.content?.trim() || '';
        return title.length > 50 ? title.substring(0, 50) + '...' : title;
      } catch (error) {
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All Groq API keys failed');
  }

  private static async callOpenAI(userMessage: string): Promise<string> {
    const apiKeys = this.getApiKeys('openai');
    if (apiKeys.length === 0) {
      throw new Error('OpenAI API key not found');
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a title generator. Create a short, concise title (maximum 4-6 words) for the chat based on the user\'s first message. Only return the title, nothing else. Make it descriptive but brief.'
      },
      {
        role: 'user',
        content: `Generate a short title for this message: "${userMessage}"`
      }
    ];

    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 50,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          if (i === apiKeys.length - 1) {
            throw new Error('OpenAI API failed');
          }
          continue;
        }

        const data = await response.json();
        const title = data.choices[0]?.message?.content?.trim() || '';
        return title.length > 50 ? title.substring(0, 50) + '...' : title;
      } catch (error) {
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All OpenAI API keys failed');
  }

  private static async callGemini(userMessage: string): Promise<string> {
    const apiKeys = this.getApiKeys('gemini');
    if (apiKeys.length === 0) {
      throw new Error('Gemini API key not found');
    }

    const prompt = `You are a title generator. Create a short, concise title (maximum 4-6 words) for the chat based on the user's first message. Only return the title, nothing else. Make it descriptive but brief.

Generate a short title for this message: "${userMessage}"`;

    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 50,
            }
          }),
        });

        if (!response.ok) {
          if (i === apiKeys.length - 1) {
            throw new Error('Gemini API failed');
          }
          continue;
        }

        const data = await response.json();
        const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        return title.length > 50 ? title.substring(0, 50) + '...' : title;
      } catch (error) {
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All Gemini API keys failed');
  }

  public static async generateTitle(userMessage: string): Promise<string> {
    console.log('🎯 Generating AI title for message:', userMessage.substring(0, 100) + '...');
    
    // Determine which API to use based on available keys (same priority as ChatService)
    const openrouterKeys = this.getApiKeys('openrouter');
    const groqKeys = this.getApiKeys('groq');
    const openaiKeys = this.getApiKeys('openai');
    const geminiKeys = this.getApiKeys('gemini');

    try {
      if (openrouterKeys.length > 0) {
        console.log('Using OpenRouter for title generation');
        return await this.callOpenRouter(userMessage);
      } else if (groqKeys.length > 0) {
        console.log('Using Groq for title generation');
        return await this.callGroq(userMessage);
      } else if (openaiKeys.length > 0) {
        console.log('Using OpenAI for title generation');
        return await this.callOpenAI(userMessage);
      } else if (geminiKeys.length > 0) {
        console.log('Using Gemini for title generation');
        return await this.callGemini(userMessage);
      } else {
        throw new Error('No API key found');
      }
    } catch (error) {
      console.error('❌ Title generation failed:', error);
      // Fallback to truncated user message
      const fallbackTitle = userMessage.length > 50 
        ? userMessage.substring(0, 50) + '...' 
        : userMessage;
      console.log('📝 Using fallback title:', fallbackTitle);
      return fallbackTitle;
    }
  }

  public static parseRenameCommand(message: string): { isRenameCommand: boolean; newTitle?: string } {
    console.log('🔍 Checking for rename command in message:', message);
    
    // Look for patterns like "Change chat title name (NEW TITLE)" or "change chat tittle name (NEW TITLE)"
    const patterns = [
      /change\s+chat\s+tit(?:l|t)e\s+name\s*\(([^)]+)\)/i,
      /rename\s+chat\s+tit(?:l|t)e\s*\(([^)]+)\)/i,
      /change\s+tit(?:l|t)e\s*\(([^)]+)\)/i,
      /rename\s+tit(?:l|t)e\s*\(([^)]+)\)/i,
      /update\s+chat\s+tit(?:l|t)e\s*\(([^)]+)\)/i,
      /set\s+chat\s+tit(?:l|t)e\s*\(([^)]+)\)/i
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = message.match(pattern);
      console.log(`🔍 Pattern ${i + 1} (${pattern.source}):`, match ? 'MATCH' : 'NO MATCH');
      
      if (match && match[1]) {
        const newTitle = match[1].trim();
        console.log('✅ Found rename command! New title:', newTitle);
        
        if (newTitle.length > 0) {
          return {
            isRenameCommand: true,
            newTitle: newTitle.length > 50 ? newTitle.substring(0, 50) + '...' : newTitle
          };
        }
      }
    }

    console.log('❌ No rename command found');
    return { isRenameCommand: false };
  }
}