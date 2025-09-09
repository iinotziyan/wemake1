interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface FileAttachment {
  name: string;
  type: string;
  content: string; // base64 for images, text content for text files
}

export class ChatService {
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

  private static async callOpenAI(messages: ChatMessage[], files?: FileAttachment[]): Promise<string> {
    const apiKeys = this.getApiKeys('openai');
    if (apiKeys.length === 0) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }

    // Convert messages to OpenAI format with vision support
    let openAIMessages = [...messages];
    
    if (files && files.length > 0) {
      const lastMessageIndex = openAIMessages.length - 1;
      const lastMessage = openAIMessages[lastMessageIndex];
      
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
      
      const textContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
      if (textContent) {
        content.push({ type: 'text', text: textContent });
      }
      
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const imageUrl = file.content.startsWith('data:') ? file.content : `data:${file.type};base64,${file.content}`;
          content.push({
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          });
          console.log(`Added image to OpenAI request: ${file.name}`);
        } else if (file.type === 'text/plain') {
          const existingText = content[0]?.text || '';
          content[0] = {
            type: 'text',
            text: `${existingText}\n\nFile: ${file.name}\nContent: ${file.content}`
          };
          console.log(`Added text file to OpenAI request: ${file.name}`);
        }
      });
      
      openAIMessages[lastMessageIndex] = {
        ...lastMessage,
        content: content
      };
      
      console.log('OpenAI message with files:', JSON.stringify(openAIMessages[lastMessageIndex], null, 2));
    }

    // Try each API key until one works
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`Trying OpenAI API key ${i + 1}/${apiKeys.length}`);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: openAIMessages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`OpenAI API key ${i + 1} failed:`, error);
          
          // If this is the last key, throw the error
          if (i === apiKeys.length - 1) {
            throw new Error(error.error?.message || 'All OpenAI API keys failed');
          }
          
          // Otherwise, continue to next key
          continue;
        }

        const data = await response.json();
        console.log(`OpenAI API key ${i + 1} succeeded`);
        return data.choices[0]?.message?.content || 'No response received';
      } catch (error) {
        console.error(`OpenAI API key ${i + 1} error:`, error);
        
        // If this is the last key, throw the error
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All OpenAI API keys failed');
  }

  private static async callGemini(messages: ChatMessage[], files?: FileAttachment[]): Promise<string> {
    const apiKeys = this.getApiKeys('gemini');
    if (apiKeys.length === 0) {
      throw new Error('Gemini API key not found. Please add your API key in settings.');
    }

    // Convert messages to Gemini format with vision support
    const parts: any[] = [];
    
    const conversationText = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        const content = typeof msg.content === 'string' 
          ? msg.content 
          : msg.content.find(c => c.type === 'text')?.text || '';
        return `${msg.role === 'user' ? 'User' : 'Assistant'}: ${content}`;
      })
      .join('\n\n');
    
    parts.push({
      text: conversationText
    });
    
    if (files && files.length > 0) {
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          let base64Data = file.content;
          let mimeType = file.type;
          
          if (file.content.startsWith('data:')) {
            const parts = file.content.split(',');
            base64Data = parts[1];
            mimeType = file.content.split(';')[0].split(':')[1];
          }
          
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
          console.log(`Added image to Gemini request: ${file.name}`);
        } else if (file.type === 'text/plain') {
          parts.push({
            text: `\n\nFile: ${file.name}\nContent: ${file.content}`
          });
          console.log(`Added text file to Gemini request: ${file.name}`);
        }
      });
    }

    console.log('Gemini request parts:', parts.length);

    // Try each API key until one works
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`Trying Gemini API key ${i + 1}/${apiKeys.length}`);

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: parts
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`Gemini API key ${i + 1} failed:`, error);
          
          // If this is the last key, throw the error
          if (i === apiKeys.length - 1) {
            throw new Error(error.error?.message || 'All Gemini API keys failed');
          }
          
          // Otherwise, continue to next key
          continue;
        }

        const data = await response.json();
        console.log(`Gemini API key ${i + 1} succeeded`);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
      } catch (error) {
        console.error(`Gemini API key ${i + 1} error:`, error);
        
        // If this is the last key, throw the error
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All Gemini API keys failed');
  }

  private static async callOpenRouter(messages: ChatMessage[], files?: FileAttachment[]): Promise<string> {
    const apiKeys = this.getApiKeys('openrouter');
    if (apiKeys.length === 0) {
      throw new Error('OpenRouter API key not found. Please add your API key in settings.');
    }

    // Convert messages to OpenAI format with vision support (OpenRouter is OpenAI-compatible)
    let openRouterMessages = [...messages];
    
    if (files && files.length > 0) {
      const lastMessageIndex = openRouterMessages.length - 1;
      const lastMessage = openRouterMessages[lastMessageIndex];
      
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
      
      const textContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
      if (textContent) {
        content.push({ type: 'text', text: textContent });
      }
      
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const imageUrl = file.content.startsWith('data:') ? file.content : `data:${file.type};base64,${file.content}`;
          content.push({
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          });
          console.log(`Added image to OpenRouter request: ${file.name}`);
        } else if (file.type === 'text/plain') {
          const existingText = content[0]?.text || '';
          content[0] = {
            type: 'text',
            text: `${existingText}\n\nFile: ${file.name}\nContent: ${file.content}`
          };
          console.log(`Added text file to OpenRouter request: ${file.name}`);
        }
      });
      
      openRouterMessages[lastMessageIndex] = {
        ...lastMessage,
        content: content
      };
      
      console.log('OpenRouter message with files:', JSON.stringify(openRouterMessages[lastMessageIndex], null, 2));
    }

    // Try each API key until one works
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`Trying OpenRouter API key ${i + 1}/${apiKeys.length}`);

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
            model: 'anthropic/claude-3.5-sonnet', // Default to Claude 3.5 Sonnet for best quality
            messages: openRouterMessages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`OpenRouter API key ${i + 1} failed:`, error);
          
          // If this is the last key, throw the error
          if (i === apiKeys.length - 1) {
            throw new Error(error.error?.message || 'All OpenRouter API keys failed');
          }
          
          // Otherwise, continue to next key
          continue;
        }

        const data = await response.json();
        console.log(`OpenRouter API key ${i + 1} succeeded`);
        return data.choices[0]?.message?.content || 'No response received';
      } catch (error) {
        console.error(`OpenRouter API key ${i + 1} error:`, error);
        
        // If this is the last key, throw the error
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All OpenRouter API keys failed');
  }

  private static async callGroq(messages: ChatMessage[], files?: FileAttachment[]): Promise<string> {
    const apiKeys = this.getApiKeys('groq');
    if (apiKeys.length === 0) {
      throw new Error('Groq API key not found. Please add your API key in settings.');
    }

    // Convert messages to Groq format (similar to OpenAI)
    let groqMessages = [...messages];
    
    if (files && files.length > 0) {
      const lastMessageIndex = groqMessages.length - 1;
      const lastMessage = groqMessages[lastMessageIndex];
      
      let textContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
      let hasUnsupportedFiles = false;
      
      files.forEach(file => {
        if (file.type === 'text/plain') {
          textContent += `\n\nFile: ${file.name}\nContent: ${file.content}`;
          console.log(`Added text file to Groq request: ${file.name}`);
        } else if (file.type.startsWith('image/')) {
          // Groq doesn't support images, so we'll mention this limitation
          hasUnsupportedFiles = true;
          console.log(`Skipped image file for Groq (not supported): ${file.name}`);
        } else {
          // Other file types are also not supported
          hasUnsupportedFiles = true;
          console.log(`Skipped file for Groq (not supported): ${file.name}`);
        }
      });
      
      // If there are unsupported files, add a note about it
      if (hasUnsupportedFiles) {
        textContent += '\n\nNote: Some files (images or other non-text files) could not be processed as Groq only supports text content. Please consider using OpenAI or Gemini for image analysis.';
      }
      
      groqMessages[lastMessageIndex] = {
        ...lastMessage,
        content: textContent
      };
    }

    // Try each API key until one works
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`Trying Groq API key ${i + 1}/${apiKeys.length}`);

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: groqMessages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`Groq API key ${i + 1} failed:`, error);
          
          // If this is the last key, throw the error
          if (i === apiKeys.length - 1) {
            throw new Error(error.error?.message || 'All Groq API keys failed');
          }
          
          // Otherwise, continue to next key
          continue;
        }

        const data = await response.json();
        console.log(`Groq API key ${i + 1} succeeded`);
        return data.choices[0]?.message?.content || 'No response received';
      } catch (error) {
        console.error(`Groq API key ${i + 1} error:`, error);
        
        // If this is the last key, throw the error
        if (i === apiKeys.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All Groq API keys failed');
  }

  public static hasApiKeys(): boolean {
    const openrouterKeys = this.getApiKeys('openrouter');
    const groqKeys = this.getApiKeys('groq');
    const openaiKeys = this.getApiKeys('openai');
    const geminiKeys = this.getApiKeys('gemini');
    
    return openrouterKeys.length > 0 || groqKeys.length > 0 || openaiKeys.length > 0 || geminiKeys.length > 0;
  }

  public static async sendMessage(messages: ChatMessage[], files?: FileAttachment[]): Promise<string> {
    console.log('Sending message with files:', files?.length || 0);
    
    // Determine which API to use based on available keys (prioritize OpenRouter)
    const openrouterKeys = this.getApiKeys('openrouter');
    const groqKeys = this.getApiKeys('groq');
    const openaiKeys = this.getApiKeys('openai');
    const geminiKeys = this.getApiKeys('gemini');

    try {
      if (openrouterKeys.length > 0) {
        console.log(`Using OpenRouter API with ${openrouterKeys.length} keys`);
        return await this.callOpenRouter(messages, files);
      } else if (groqKeys.length > 0) {
        console.log(`Using Groq API with ${groqKeys.length} keys`);
        return await this.callGroq(messages, files);
      } else if (openaiKeys.length > 0) {
        console.log(`Using OpenAI API with ${openaiKeys.length} keys`);
        return await this.callOpenAI(messages, files);
      } else if (geminiKeys.length > 0) {
        console.log(`Using Gemini API with ${geminiKeys.length} keys`);
        return await this.callGemini(messages, files);
      } else {
        throw new Error('No API key found. Please add an API key in settings.');
      }
    } catch (error) {
      console.error('Primary API failed:', error);
      
      // Try fallback APIs
      try {
        if (openrouterKeys.length > 0) {
          // If OpenRouter failed, try Groq
          if (groqKeys.length > 0) {
            console.log('OpenRouter failed, trying Groq fallback');
            return await this.callGroq(messages, files);
          }
          // If Groq not available, try OpenAI
          if (openaiKeys.length > 0) {
            console.log('OpenRouter failed, trying OpenAI fallback');
            return await this.callOpenAI(messages, files);
          }
          // If OpenAI not available, try Gemini
          if (geminiKeys.length > 0) {
            console.log('OpenRouter failed, trying Gemini fallback');
            return await this.callGemini(messages, files);
          }
        } else if (groqKeys.length > 0) {
          // If Groq failed, try OpenAI
          if (openaiKeys.length > 0) {
            console.log('Groq failed, trying OpenAI fallback');
            return await this.callOpenAI(messages, files);
          }
          // If OpenAI not available, try Gemini
          if (geminiKeys.length > 0) {
            console.log('Groq failed, trying Gemini fallback');
            return await this.callGemini(messages, files);
          }
        } else if (openaiKeys.length > 0) {
          // If OpenAI failed, try Gemini or Groq
          if (geminiKeys.length > 0) {
            console.log('OpenAI failed, trying Gemini fallback');
            return await this.callGemini(messages, files);
          }
          if (groqKeys.length > 0) {
            console.log('OpenAI failed, trying Groq fallback');
            return await this.callGroq(messages, files);
          }
        } else if (geminiKeys.length > 0) {
          // If Gemini failed, try OpenAI or Groq
          if (openaiKeys.length > 0) {
            console.log('Gemini failed, trying OpenAI fallback');
            return await this.callOpenAI(messages, files);
          }
          if (groqKeys.length > 0) {
            console.log('Gemini failed, trying Groq fallback');
            return await this.callGroq(messages, files);
          }
        }
        
        throw error; // Re-throw if no fallback available
      } catch (fallbackError) {
        console.error('All APIs failed:', error, fallbackError);
        throw new Error(`AI service failed. Please check your API keys in settings.`);
      }
    }
  }
}
