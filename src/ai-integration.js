// AI Integration für WAEngine
import axios from 'axios';

export class AIIntegration {
    constructor(options = {}) {
        this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        this.baseURL = options.baseURL || 'https://api.openai.com/v1';
        this.model = options.model || 'gpt-3.5-turbo';
        this.enabled = !!this.apiKey;
        
        if (!this.enabled) {
            // Stille Deaktivierung - keine Console-Spam
        } else {
            // Nur bei Aktivierung loggen
            console.log('🤖 AI Integration aktiviert');
        }
    }

    // ===== CHAT COMPLETION =====
    
    async chat(prompt, options = {}) {
        if (!this.enabled) {
            throw new Error('❌ AI Integration nicht konfiguriert! Setze OPENAI_API_KEY');
        }

        try {
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: options.model || this.model,
                messages: [
                    {
                        role: 'system',
                        content: options.systemPrompt || 'Du bist ein hilfreicher WhatsApp Bot Assistent. Antworte kurz und freundlich auf Deutsch.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error('❌ AI Chat Fehler:', error.response?.data || error.message);
            throw new Error(`AI Fehler: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    // ===== SMART RESPONSES =====
    
    async smartReply(message, context = {}) {
        const prompt = `
Kontext: WhatsApp Bot Nachricht
User schrieb: "${message}"
Chat-Type: ${context.isGroup ? 'Gruppe' : 'Privat'}
${context.userName ? `User: ${context.userName}` : ''}

Antworte natürlich und hilfreich. Maximal 2 Sätze.
        `.trim();

        return await this.chat(prompt, {
            systemPrompt: 'Du bist ein freundlicher WhatsApp Bot. Antworte natürlich und kurz.',
            maxTokens: 200
        });
    }

    // ===== TEXT ANALYSIS =====
    
    async analyzeMessage(text) {
        const prompt = `
Analysiere diese Nachricht:
"${text}"

Gib zurück als JSON:
{
  "sentiment": "positive/negative/neutral",
  "language": "de/en/es/fr/etc",
  "category": "question/command/greeting/complaint/other",
  "toxicity": "low/medium/high",
  "confidence": 0.0-1.0
}
        `.trim();

        try {
            const response = await this.chat(prompt, {
                systemPrompt: 'Du bist ein Text-Analyse-Experte. Antworte nur mit gültigem JSON.',
                maxTokens: 150
            });
            
            return JSON.parse(response);
        } catch (error) {
            return {
                sentiment: 'neutral',
                language: 'unknown',
                category: 'other',
                toxicity: 'low',
                confidence: 0.5
            };
        }
    }

    // ===== MODERATION =====
    
    async moderateContent(text) {
        try {
            const response = await axios.post(`${this.baseURL}/moderations`, {
                input: text
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = response.data.results[0];
            
            return {
                flagged: result.flagged,
                categories: result.categories,
                scores: result.category_scores,
                safe: !result.flagged
            };
        } catch (error) {
            console.error('❌ Moderation Fehler:', error.message);
            return { flagged: false, safe: true };
        }
    }

    // ===== TRANSLATION =====
    
    async translate(text, targetLang = 'de') {
        const prompt = `Übersetze folgenden Text nach ${targetLang}. Antworte nur mit der Übersetzung:\n\n"${text}"`;
        
        return await this.chat(prompt, {
            systemPrompt: 'Du bist ein professioneller Übersetzer. Antworte nur mit der Übersetzung.',
            maxTokens: 300
        });
    }

    // ===== SUMMARIZATION =====
    
    async summarize(text, maxLength = 100) {
        const prompt = `Fasse folgenden Text in maximal ${maxLength} Zeichen zusammen:\n\n"${text}"`;
        
        return await this.chat(prompt, {
            systemPrompt: 'Du bist ein Experte für Textzusammenfassungen. Sei präzise und kurz.',
            maxTokens: Math.ceil(maxLength / 2)
        });
    }

    // ===== QUESTION ANSWERING =====
    
    async answerQuestion(question, context = '') {
        const prompt = context ? 
            `Kontext: ${context}\n\nFrage: ${question}` : 
            question;
            
        return await this.chat(prompt, {
            systemPrompt: 'Du bist ein hilfreicher Assistent. Beantworte Fragen präzise und verständlich.',
            maxTokens: 400
        });
    }

    // ===== CREATIVE WRITING =====
    
    async generateText(prompt, style = 'normal') {
        const stylePrompts = {
            funny: 'Schreibe lustig und humorvoll',
            formal: 'Schreibe formal und professionell',
            casual: 'Schreibe locker und umgangssprachlich',
            creative: 'Schreibe kreativ und fantasievoll',
            normal: 'Schreibe natürlich und verständlich'
        };

        return await this.chat(prompt, {
            systemPrompt: `Du bist ein kreativer Schreiber. ${stylePrompts[style] || stylePrompts.normal}.`,
            maxTokens: 600
        });
    }
}