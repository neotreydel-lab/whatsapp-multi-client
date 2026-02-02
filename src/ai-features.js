import { getStorage } from "./storage.js";

export class AIFeatures {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.intentClassifier = new IntentClassifier();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.memoryManager = new MemoryManager(this.storage);
        this.conversationContext = new Map();
    }
    
    // ===== INTENT RECOGNITION =====
    
    /**
     * Analyze user intent from message
     */
    async analyzeIntent(message) {
        const text = message.text || '';
        const intent = await this.intentClassifier.classify(text);
        
        // Store intent for analytics
        this.storage.write.in("ai").increment(`intents.${intent.name}`, 1);
        this.storage.write.in("ai").set(`users.${message.from}.lastIntent`, {
            intent: intent.name,
            confidence: intent.confidence,
            timestamp: Date.now()
        });
        
        return intent;
    }
    
    /**
     * Get user's intent history
     */
    getUserIntentHistory(userId, limit = 10) {
        const history = this.storage.read.from("ai").get(`users.${userId}.intentHistory`) || [];
        return history.slice(-limit);
    }
    
    // ===== SENTIMENT ANALYSIS =====
    
    /**
     * Analyze message sentiment
     */
    async analyzeSentiment(message) {
        const text = message.text || '';
        const sentiment = await this.sentimentAnalyzer.analyze(text);
        
        // Store sentiment for analytics
        this.storage.write.in("ai").increment(`sentiment.${sentiment.label}`, 1);
        this.storage.write.in("ai").set(`users.${message.from}.lastSentiment`, {
            sentiment: sentiment.label,
            score: sentiment.score,
            timestamp: Date.now()
        });
        
        return sentiment;
    }
    
    /**
     * Get user's sentiment trend
     */
    getUserSentimentTrend(userId, days = 7) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        const sentiments = this.storage.read.from("ai").get(`users.${userId}.sentimentHistory`) || [];
        
        return sentiments
            .filter(s => s.timestamp > cutoff)
            .map(s => ({
                sentiment: s.sentiment,
                score: s.score,
                date: new Date(s.timestamp).toISOString().split('T')[0]
            }));
    }
    
    // ===== CONVERSATION MEMORY =====
    
    /**
     * Store conversation context
     */
    storeContext(userId, context) {
        const existing = this.conversationContext.get(userId) || [];
        existing.push({
            ...context,
            timestamp: Date.now()
        });
        
        // Keep only last 50 context entries
        if (existing.length > 50) {
            existing.shift();
        }
        
        this.conversationContext.set(userId, existing);
        this.storage.write.in("ai").set(`context.${userId}`, existing);
        
        return context;
    }
    
    /**
     * Get conversation context
     */
    getContext(userId, limit = 10) {
        const context = this.conversationContext.get(userId) || 
                       this.storage.read.from("ai").get(`context.${userId}`) || [];
        
        return context.slice(-limit);
    }
    
    /**
     * Clear conversation context
     */
    clearContext(userId) {
        this.conversationContext.delete(userId);
        this.storage.delete.from("ai").key(`context.${userId}`);
        return true;
    }
    
    // ===== SMART RESPONSES =====
    
    /**
     * Generate contextual response
     */
    async generateResponse(message, options = {}) {
        const intent = await this.analyzeIntent(message);
        const sentiment = await this.analyzeSentiment(message);
        const context = this.getContext(message.from, 5);
        
        // Store current message in context
        this.storeContext(message.from, {
            text: message.text,
            intent: intent.name,
            sentiment: sentiment.label,
            type: 'user_message'
        });
        
        // Generate response based on intent and sentiment
        let response = await this.generateIntentBasedResponse(intent, sentiment, context, options);
        
        // Store bot response in context
        this.storeContext(message.from, {
            text: response,
            type: 'bot_response'
        });
        
        return response;
    }
    
    /**
     * Generate response based on intent
     */
    async generateIntentBasedResponse(intent, sentiment, context, options) {
        const responses = {
            greeting: this.getGreetingResponse(sentiment),
            question: this.getQuestionResponse(context),
            complaint: this.getComplaintResponse(sentiment),
            compliment: this.getComplimentResponse(),
            goodbye: this.getGoodbyeResponse(),
            help: this.getHelpResponse(),
            unknown: this.getUnknownResponse()
        };
        
        return responses[intent.name] || responses.unknown;
    }
    
    // ===== RESPONSE GENERATORS =====
    
    getGreetingResponse(sentiment) {
        const positive = [
            "Hallo! 😊 Schön dich zu sehen!",
            "Hi! 👋 Wie kann ich dir helfen?",
            "Hey! 🌟 Was kann ich für dich tun?"
        ];
        
        const neutral = [
            "Hallo! Wie geht es dir?",
            "Hi! Was gibt's?",
            "Hey! Wie kann ich helfen?"
        ];
        
        const responses = sentiment.score > 0.1 ? positive : neutral;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getQuestionResponse(context) {
        const hasRecentQuestions = context.some(c => c.intent === 'question');
        
        if (hasRecentQuestions) {
            return "Ich sehe, du hast noch mehr Fragen! 🤔 Lass mich dir helfen.";
        }
        
        return "Das ist eine interessante Frage! 💭 Lass mich nachdenken...";
    }
    
    getComplaintResponse(sentiment) {
        if (sentiment.score < -0.3) {
            return "Es tut mir wirklich leid, dass du unzufrieden bist. 😔 Wie kann ich das Problem lösen?";
        }
        
        return "Ich verstehe deine Bedenken. 🤝 Lass uns das gemeinsam klären.";
    }
    
    getComplimentResponse() {
        const responses = [
            "Vielen Dank! 😊 Das freut mich sehr!",
            "Das ist sehr nett von dir! 🌟",
            "Danke für die freundlichen Worte! 💖"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getGoodbyeResponse() {
        const responses = [
            "Tschüss! 👋 Bis bald!",
            "Auf Wiedersehen! 🌟 Hab einen schönen Tag!",
            "Bye! 😊 Melde dich gerne wieder!"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getHelpResponse() {
        return "Gerne helfe ich dir! 🤖 Was genau brauchst du?";
    }
    
    getUnknownResponse() {
        const responses = [
            "Hmm, das verstehe ich nicht ganz. 🤔 Kannst du das anders formulieren?",
            "Entschuldigung, ich bin mir nicht sicher was du meinst. 💭 Kannst du mir mehr Details geben?",
            "Das ist interessant! 🧐 Erzähl mir mehr darüber."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // ===== AI STATISTICS =====
    
    /**
     * Get AI analytics
     */
    getAIStats() {
        const intents = this.storage.read.from("ai").get("intents") || {};
        const sentiments = this.storage.read.from("ai").get("sentiment") || {};
        const users = this.storage.read.from("ai").get("users") || {};
        
        return {
            intents: {
                total: Object.values(intents).reduce((sum, count) => sum + count, 0),
                distribution: intents,
                mostCommon: Object.entries(intents).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
            },
            sentiment: {
                total: Object.values(sentiments).reduce((sum, count) => sum + count, 0),
                distribution: sentiments,
                positiveRatio: (sentiments.positive || 0) / Object.values(sentiments).reduce((sum, count) => sum + count, 1)
            },
            users: {
                total: Object.keys(users).length,
                activeContexts: this.conversationContext.size
            }
        };
    }
}

// ===== INTENT CLASSIFIER =====

class IntentClassifier {
    constructor() {
        this.patterns = {
            greeting: [
                /\b(hallo|hi|hey|guten\s+(tag|morgen|abend)|servus|moin)\b/i,
                /\b(wie\s+geht.s|was\s+machst\s+du)\b/i
            ],
            question: [
                /\b(was|wie|wann|wo|warum|wieso|weshalb|wer)\b/i,
                /\?$/,
                /\b(kannst\s+du|könntest\s+du|hilf\s+mir)\b/i
            ],
            complaint: [
                /\b(problem|fehler|bug|kaputt|funktioniert\s+nicht|geht\s+nicht)\b/i,
                /\b(schlecht|schrecklich|furchtbar|ärgerlich|nervig)\b/i
            ],
            compliment: [
                /\b(toll|super|großartig|fantastisch|perfekt|danke|dankeschön)\b/i,
                /\b(gut\s+gemacht|sehr\s+gut|ausgezeichnet)\b/i
            ],
            goodbye: [
                /\b(tschüss|bye|auf\s+wiedersehen|bis\s+bald|ciao|adieu)\b/i,
                /\b(gute\s+nacht|schlaf\s+gut)\b/i
            ],
            help: [
                /\b(hilfe|help|unterstützung|support)\b/i,
                /\b(was\s+kannst\s+du|befehle|commands)\b/i
            ]
        };
    }
    
    async classify(text) {
        const normalizedText = text.toLowerCase();
        let bestMatch = { name: 'unknown', confidence: 0 };
        
        for (const [intent, patterns] of Object.entries(this.patterns)) {
            let matches = 0;
            
            for (const pattern of patterns) {
                if (pattern.test(normalizedText)) {
                    matches++;
                }
            }
            
            const confidence = matches / patterns.length;
            
            if (confidence > bestMatch.confidence) {
                bestMatch = { name: intent, confidence };
            }
        }
        
        return bestMatch;
    }
}

// ===== SENTIMENT ANALYZER =====

class SentimentAnalyzer {
    constructor() {
        this.positiveWords = [
            'gut', 'toll', 'super', 'fantastisch', 'großartig', 'perfekt', 'wunderbar',
            'ausgezeichnet', 'brilliant', 'amazing', 'love', 'liebe', 'freue', 'glücklich',
            'zufrieden', 'dankbar', 'begeistert', 'erfreut'
        ];
        
        this.negativeWords = [
            'schlecht', 'schrecklich', 'furchtbar', 'ärgerlich', 'nervig', 'problem',
            'fehler', 'kaputt', 'hate', 'hasse', 'traurig', 'wütend', 'enttäuscht',
            'frustriert', 'langweilig', 'dumm'
        ];
        
        this.intensifiers = [
            'sehr', 'extrem', 'total', 'komplett', 'absolut', 'wirklich', 'richtig'
        ];
    }
    
    async analyze(text) {
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let multiplier = 1;
            
            // Check for intensifiers
            if (i > 0 && this.intensifiers.includes(words[i - 1])) {
                multiplier = 1.5;
            }
            
            if (this.positiveWords.includes(word)) {
                score += 1 * multiplier;
                positiveCount++;
            } else if (this.negativeWords.includes(word)) {
                score -= 1 * multiplier;
                negativeCount++;
            }
        }
        
        // Normalize score
        const totalWords = positiveCount + negativeCount;
        if (totalWords > 0) {
            score = score / totalWords;
        }
        
        // Determine label
        let label = 'neutral';
        if (score > 0.1) label = 'positive';
        else if (score < -0.1) label = 'negative';
        
        return {
            score: Math.max(-1, Math.min(1, score)), // Clamp between -1 and 1
            label,
            confidence: Math.abs(score),
            details: {
                positiveWords: positiveCount,
                negativeWords: negativeCount,
                totalWords: words.length
            }
        };
    }
}

// ===== MEMORY MANAGER =====

class MemoryManager {
    constructor(storage) {
        this.storage = storage;
    }
    
    /**
     * Store user preference
     */
    storePreference(userId, key, value) {
        this.storage.write.in("ai").set(`preferences.${userId}.${key}`, {
            value,
            timestamp: Date.now()
        });
    }
    
    /**
     * Get user preference
     */
    getPreference(userId, key) {
        const pref = this.storage.read.from("ai").get(`preferences.${userId}.${key}`);
        return pref ? pref.value : null;
    }
    
    /**
     * Store user fact
     */
    storeFact(userId, fact) {
        const facts = this.storage.read.from("ai").get(`facts.${userId}`) || [];
        facts.push({
            fact,
            timestamp: Date.now()
        });
        
        // Keep only last 100 facts
        if (facts.length > 100) {
            facts.shift();
        }
        
        this.storage.write.in("ai").set(`facts.${userId}`, facts);
    }
    
    /**
     * Get user facts
     */
    getFacts(userId) {
        return this.storage.read.from("ai").get(`facts.${userId}`) || [];
    }
    
    /**
     * Get user profile
     */
    getUserProfile(userId) {
        const preferences = this.storage.read.from("ai").get(`preferences.${userId}`) || {};
        const facts = this.getFacts(userId);
        const context = this.storage.read.from("ai").get(`context.${userId}`) || [];
        
        return {
            preferences: Object.fromEntries(
                Object.entries(preferences).map(([key, data]) => [key, data.value])
            ),
            facts: facts.map(f => f.fact),
            lastInteraction: context.length > 0 ? context[context.length - 1].timestamp : null,
            totalInteractions: context.length
        };
    }
}