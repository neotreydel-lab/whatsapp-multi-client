// Prefix Manager für gruppen-spezifische Prefixes
import fs from 'fs';
import path from 'path';

export class PrefixManager {
    constructor(dataDir = './data') {
        this.dataDir = dataDir;
        this.prefixFile = path.join(dataDir, 'prefixes.json');
        this.defaultPrefix = '!';
        this.prefixes = new Map();
        
        this.ensureDataDir();
        this.loadPrefixes();
    }

    // ===== SETUP =====
    
    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            console.log(`📁 Prefix Data Directory erstellt: ${this.dataDir}`);
        }
    }

    // ===== LOAD/SAVE =====
    
    loadPrefixes() {
        try {
            if (fs.existsSync(this.prefixFile)) {
                const data = JSON.parse(fs.readFileSync(this.prefixFile, 'utf8'));
                this.prefixes = new Map(Object.entries(data));
                console.log(`📋 ${this.prefixes.size} Prefixes geladen`);
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der Prefixes:', error);
            this.prefixes = new Map();
        }
    }

    savePrefixes() {
        try {
            const data = Object.fromEntries(this.prefixes);
            fs.writeFileSync(this.prefixFile, JSON.stringify(data, null, 2));
            console.log(`💾 Prefixes gespeichert (${this.prefixes.size} Einträge)`);
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Speichern der Prefixes:', error);
            return false;
        }
    }

    // ===== PREFIX MANAGEMENT =====
    
    setPrefix(chatId, prefix) {
        if (!chatId) {
            throw new Error('❌ Chat ID ist erforderlich!');
        }
        
        if (!prefix || prefix.length === 0) {
            throw new Error('❌ Prefix darf nicht leer sein!');
        }
        
        // Validierung: Prefix sollte nicht zu lang sein
        if (prefix.length > 5) {
            throw new Error('❌ Prefix darf maximal 5 Zeichen lang sein!');
        }
        
        this.prefixes.set(chatId, prefix);
        this.savePrefixes();
        
        console.log(`🎯 Prefix für ${chatId} gesetzt: "${prefix}"`);
        return true;
    }

    getPrefix(chatId) {
        if (!chatId) return this.defaultPrefix;
        
        return this.prefixes.get(chatId) || this.defaultPrefix;
    }

    removePrefix(chatId) {
        if (!chatId) return false;
        
        const removed = this.prefixes.delete(chatId);
        if (removed) {
            this.savePrefixes();
            console.log(`🗑️ Prefix für ${chatId} entfernt`);
        }
        return removed;
    }

    // ===== UTILITY =====
    
    getAllPrefixes() {
        return Object.fromEntries(this.prefixes);
    }

    getPrefixCount() {
        return this.prefixes.size;
    }

    // Prüft ob Text mit dem Chat-spezifischen Prefix beginnt
    isCommand(text, chatId) {
        if (!text) return false;
        
        const prefix = this.getPrefix(chatId);
        return text.startsWith(prefix);
    }

    // Extrahiert Command und Args basierend auf Chat-spezifischem Prefix
    parseCommand(text, chatId) {
        if (!this.isCommand(text, chatId)) {
            return null;
        }
        
        const prefix = this.getPrefix(chatId);
        const commandText = text.slice(prefix.length).trim();
        const [command, ...rawArgs] = commandText.split(' ');
        
        // INTELLIGENTES ARGUMENT-PARSING für Anführungszeichen
        const args = this.parseQuotedArguments(rawArgs.join(' '));
        
        return {
            prefix,
            command: command.toLowerCase(),
            args,
            commandText,
            fullText: text
        };
    }

    // Parst Argumente mit Anführungszeichen-Unterstützung
    parseQuotedArguments(argsString) {
        if (!argsString.trim()) return [];
        
        const args = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < argsString.length; i++) {
            const char = argsString[i];
            
            if ((char === '"' || char === "'") && !inQuotes) {
                // Start einer Anführungszeichen-Gruppe
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                // Ende einer Anführungszeichen-Gruppe
                inQuotes = false;
                quoteChar = '';
                if (current.trim()) {
                    args.push(current.trim());
                    current = '';
                }
            } else if (char === ' ' && !inQuotes) {
                // Leerzeichen außerhalb von Anführungszeichen
                if (current.trim()) {
                    args.push(current.trim());
                    current = '';
                }
            } else {
                // Normales Zeichen
                current += char;
            }
        }
        
        // Letztes Argument hinzufügen
        if (current.trim()) {
            args.push(current.trim());
        }
        
        return args;
    }

    // ===== STATISTICS =====
    
    getStats() {
        const prefixCounts = {};
        
        for (const prefix of this.prefixes.values()) {
            prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
        }
        
        return {
            totalChats: this.prefixes.size,
            defaultPrefix: this.defaultPrefix,
            prefixDistribution: prefixCounts,
            mostUsedPrefix: Object.keys(prefixCounts).reduce((a, b) => 
                prefixCounts[a] > prefixCounts[b] ? a : b, this.defaultPrefix)
        };
    }

    // ===== RESET =====
    
    resetAllPrefixes() {
        this.prefixes.clear();
        this.savePrefixes();
        console.log('🔄 Alle Prefixes zurückgesetzt');
    }

    resetToDefault(chatId) {
        return this.removePrefix(chatId);
    }
}