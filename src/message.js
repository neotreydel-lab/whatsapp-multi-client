// Message-Klasse mit deinen eigenen Funktionen

export class Message {
    constructor(client, data) {
        this.client = client;
        this.id = data.id;
        this.from = data.from;
        this.fromMe = data.fromMe;
        this.text = data.text;
        this.timestamp = data.timestamp;
        this.type = data.type;
        this.isGroup = data.isGroup;
        this.raw = data.raw;
        
        // Command Properties (werden vom Client gesetzt)
        this.isCommand = false;
        this.command = null;
        this.args = [];
        this.commandText = null;
    }

    // ===== REPLY FUNCTIONS =====
    
    async reply(text, mentions = []) {
        if (mentions.length > 0) {
            return await this.client.socket.sendMessage(this.from, {
                text: text,
                mentions: mentions
            });
        }
        
        return await this.client.socket.sendMessage(this.from, {
            text: text
        });
    }

    async sendImage(imagePath, caption = "", mentions = []) {
        const message = {
            image: { url: imagePath },
            caption: caption
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.client.socket.sendMessage(this.from, message);
    }

    async sendSticker(stickerPath) {
        return await this.client.socket.sendMessage(this.from, {
            sticker: { url: stickerPath }
        });
    }

    async sendAudio(audioPath) {
        return await this.client.socket.sendMessage(this.from, {
            audio: { url: audioPath },
            mimetype: 'audio/mp4'
        });
    }

    async sendVideo(videoPath, caption = "", mentions = []) {
        const message = {
            video: { url: videoPath },
            caption: caption
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.client.socket.sendMessage(this.from, message);
    }

    async sendDocument(documentPath, fileName, mentions = []) {
        const message = {
            document: { url: documentPath },
            fileName: fileName,
            mimetype: 'application/octet-stream'
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.client.socket.sendMessage(this.from, message);
    }

    async sendLocation(latitude, longitude) {
        return await this.client.socket.sendMessage(this.from, {
            location: {
                degreesLatitude: latitude,
                degreesLongitude: longitude
            }
        });
    }

    async sendContact(vcard, displayName) {
        return await this.client.socket.sendMessage(this.from, {
            contacts: {
                displayName: displayName,
                contacts: [{ vcard }]
            }
        });
    }

    async sendPoll(question, options) {
        if (!Array.isArray(options) || options.length < 2 || options.length > 12) {
            throw new Error('Poll muss zwischen 2 und 12 Optionen haben');
        }

        try {
            console.log('📊 Sende Poll:', question, options);
            
            // Baileys V3 Poll Format (korrekte Syntax)
            const pollMessage = {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1
                }
            };
            
            // Alternative V3 Syntax versuchen
            const pollMessageV3 = {
                pollCreationMessage: {
                    name: question,
                    options: options.map(option => ({ optionName: option })),
                    selectableOptionsCount: 1
                }
            };
            
            console.log('📊 Versuche Standard Poll Format...');
            
            try {
                const result = await this.client.socket.sendMessage(this.from, pollMessage);
                console.log('✅ Standard Poll gesendet:', result);
                return result;
            } catch (standardError) {
                console.log('⚠️ Standard Format fehlgeschlagen, versuche V3 Format...');
                
                const resultV3 = await this.client.socket.sendMessage(this.from, pollMessageV3);
                console.log('✅ V3 Poll gesendet:', resultV3);
                return resultV3;
            }
            
        } catch (error) {
            console.error('❌ Alle Poll Formate fehlgeschlagen:', error);
            console.log('🔄 Verwende Fallback...');
            
            // Fallback: Als interaktive Nachricht mit Emojis
            let fallbackText = `📊 **${question}**\n\n`;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            
            options.forEach((option, index) => {
                const emoji = emojis[index] || `${index + 1}️⃣`;
                fallbackText += `${emoji} ${option}\n`;
            });
            
            fallbackText += `\n_Reagiere mit dem entsprechenden Emoji zum Abstimmen!_`;
            
            const fallbackResult = await this.reply(fallbackText);
            
            // Auto-Reactions hinzufügen für bessere UX
            setTimeout(async () => {
                try {
                    for (let i = 0; i < Math.min(options.length, emojis.length); i++) {
                        await new Promise(resolve => setTimeout(resolve, 500)); // Delay zwischen Reactions
                        await this.client.socket.sendMessage(this.from, {
                            react: {
                                text: emojis[i],
                                key: fallbackResult.key
                            }
                        });
                    }
                } catch (reactError) {
                    console.log('⚠️ Konnte keine Auto-Reactions hinzufügen:', reactError.message);
                }
            }, 1000);
            
            return fallbackResult;
        }
    }

    async sendMultiPoll(question, options, maxSelections = 1) {
        if (!Array.isArray(options) || options.length < 2 || options.length > 12) {
            throw new Error('Poll muss zwischen 2 und 12 Optionen haben');
        }

        try {
            return await this.client.socket.sendMessage(this.from, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: maxSelections
                }
            });
        } catch (error) {
            console.error('❌ Multi-Poll Fehler:', error);
            
            // Fallback: Als normale Nachricht
            let fallbackText = `📊 **${question}**\n_(Max. ${maxSelections} Auswahlen)_\n\n`;
            options.forEach((option, index) => {
                fallbackText += `${index + 1}. ${option}\n`;
            });
            fallbackText += `\n_Reagiere mit den entsprechenden Zahlen!_`;
            
            return await this.reply(fallbackText);
        }
    }

    // ===== UTILITY FUNCTIONS =====
    
    async react(emoji) {
        return await this.client.socket.sendMessage(this.from, {
            react: {
                text: emoji,
                key: this.raw.key
            }
        });
    }

    async delete() {
        return await this.client.socket.sendMessage(this.from, {
            delete: this.raw.key
        });
    }

    // ===== MENTION HELPERS =====
    
    getMentions() {
        return this.raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    }

    isMentioned(jid) {
        const mentions = this.getMentions();
        return mentions.includes(jid);
    }

    async replyWithMention(text, userJid) {
        const mentionText = text.replace('@user', `@${userJid.split('@')[0]}`);
        return await this.reply(mentionText, [userJid]);
    }

    async mentionAll(text) {
        if (!this.isGroup) {
            throw new Error('Mention @all funktioniert nur in Gruppen');
        }

        const groupMetadata = await this.client.get.GroupMetadata(this.from);
        const allMembers = groupMetadata.participants.map(p => p.id);
        const mentionText = text + ' ' + allMembers.map(id => `@${id.split('@')[0]}`).join(' ');
        
        return await this.reply(mentionText, allMembers);
    }

    // ===== PERMISSION SYSTEM =====

    async isAdmin() {
        if (!this.isGroup) return false;
        
        try {
            const groupMetadata = await this.client.get.GroupMetadata(this.from);
            const senderJid = this.getSender();
            
            console.log('🔍 Admin-Check für:', senderJid);
            
            // Sender Nummer extrahieren
            const senderNumber = senderJid.split('@')[0].split(':')[0];
            
            console.log('👤 Sender Nummer:', senderNumber);
            
            // Durch alle Teilnehmer suchen und Nummern vergleichen
            for (const participant of groupMetadata.participants) {
                const participantNumber = participant.id.split('@')[0].split(':')[0];
                
                if (participantNumber === senderNumber) {
                    console.log(`✅ User gefunden! Participant: ${participant.id}, Admin: ${participant.admin}`);
                    return participant.admin === 'admin' || participant.admin === 'superadmin';
                }
            }
            
            console.log('❌ User nicht in Teilnehmerliste gefunden');
            return false;
            
        } catch (error) {
            console.error('❌ Fehler beim Admin-Check:', error);
            return false;
        }
    }

    async isBotAdmin() {
        if (!this.isGroup) return false;
        
        try {
            const groupMetadata = await this.client.get.GroupMetadata(this.from);
            
            // Bot JID richtig ermitteln
            let botJid = this.client.socket.user?.id;
            if (!botJid) {
                console.log('⚠️ Bot JID nicht verfügbar');
                return false;
            }
            
            console.log('🔍 Suche Bot in Gruppe...');
            console.log('🤖 Bot Original JID:', botJid);
            
            // Alle möglichen JID Varianten für den Bot
            const botNumber = botJid.split('@')[0].split(':')[0]; // Nur die Nummer
            console.log('🤖 Bot Nummer extrahiert:', botNumber);
            
            console.log('👥 Alle Teilnehmer in der Gruppe:');
            groupMetadata.participants.forEach((p, index) => {
                const participantNumber = p.id.split('@')[0].split(':')[0];
                console.log(`   ${index + 1}. ${p.id} (Nummer: ${participantNumber}) - Admin: ${p.admin || 'false'}`);
            });
            
            // Durch alle Teilnehmer suchen
            for (const participant of groupMetadata.participants) {
                const participantNumber = participant.id.split('@')[0].split(':')[0];
                
                console.log(`🔍 Vergleiche: Bot "${botNumber}" vs Participant "${participantNumber}"`);
                
                // Nummern vergleichen (wichtigster Check)
                if (participantNumber === botNumber) {
                    console.log(`✅ Bot gefunden! Participant: ${participant.id}, Admin: ${participant.admin}`);
                    return participant.admin === 'admin' || participant.admin === 'superadmin';
                }
            }
            
            console.log('❌ Bot nicht in Teilnehmerliste gefunden');
            console.log('💡 Mögliche Ursachen:');
            console.log('   1. Bot ist nicht in der Gruppe');
            console.log('   2. Bot hat eine andere Telefonnummer');
            console.log('   3. JID Format ist anders als erwartet');
            
            return false;
            
        } catch (error) {
            console.error('❌ Fehler beim Bot-Admin-Check:', error);
            return false;
        }
    }

    async isOwner() {
        if (!this.isGroup) return false;
        
        try {
            const groupMetadata = await this.client.get.GroupMetadata(this.from);
            const senderJid = this.raw.key.participant || this.raw.key.remoteJid;
            const participant = groupMetadata.participants.find(p => p.id === senderJid);
            
            return participant && participant.admin === 'superadmin';
        } catch (error) {
            console.error('❌ Fehler beim Owner-Check:', error);
            return false;
        }
    }

    isPrivate() {
        return !this.isGroup;
    }

    getSender() {
        return this.raw.key.participant || this.raw.key.remoteJid;
    }

    // ===== STATISTICS SYSTEM =====

    get stats() {
        return new MessageStats(this);
    }

    // ===== TYPING INDICATOR SYSTEM =====

    async startTyping() {
        try {
            await this.client.socket.sendPresenceUpdate('composing', this.from);
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Starten des Typing:', error);
            return false;
        }
    }

    async stopTyping() {
        try {
            await this.client.socket.sendPresenceUpdate('paused', this.from);
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Stoppen des Typing:', error);
            return false;
        }
    }

    async visualWrite(enabled, duration = null) {
        if (enabled) {
            await this.startTyping();
            
            // Wenn Dauer angegeben, automatisch stoppen
            if (duration) {
                setTimeout(async () => {
                    await this.stopTyping();
                }, duration);
            }
        } else {
            await this.stopTyping();
        }
        
        return this; // Für Method Chaining
    }

    async typeAndReply(text, typingDuration = 2000, mentions = []) {
        // Starte Typing
        await this.startTyping();
        
        // Warte die angegebene Zeit
        await new Promise(resolve => setTimeout(resolve, typingDuration));
        
        // Stoppe Typing und sende Nachricht
        await this.stopTyping();
        
        // Kurze Pause für Realismus
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return await this.reply(text, mentions);
    }

    async typeAndSend(messageFunction, typingDuration = 2000) {
        // Starte Typing
        await this.startTyping();
        
        // Warte die angegebene Zeit
        await new Promise(resolve => setTimeout(resolve, typingDuration));
        
        // Stoppe Typing
        await this.stopTyping();
        
        // Kurze Pause für Realismus
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Führe die Message-Funktion aus
        return await messageFunction();
    }

    // Convenience Methods für verschiedene Typing-Zeiten
    async quickType(text, mentions = []) {
        return await this.typeAndReply(text, 1000, mentions);
    }

    async normalType(text, mentions = []) {
        return await this.typeAndReply(text, 2000, mentions);
    }

    async slowType(text, mentions = []) {
        return await this.typeAndReply(text, 4000, mentions);
    }

    // Simuliere realistisches Typing basierend auf Textlänge
    async realisticType(text, mentions = []) {
        // Berechne Typing-Zeit basierend auf Textlänge (ca. 50 WPM)
        const wordsPerMinute = 50;
        const words = text.split(' ').length;
        const typingTime = Math.max(1000, (words / wordsPerMinute) * 60 * 1000);
        
        return await this.typeAndReply(text, typingTime, mentions);
    }

    // ===== TYPING INDICATOR SYSTEM =====

    async visualWrite(isTyping = true) {
        try {
            if (isTyping) {
                // Starte "typing" Status
                await this.client.socket.sendPresenceUpdate('composing', this.from);
                console.log('⌨️ Typing indicator gestartet');
            } else {
                // Stoppe "typing" Status
                await this.client.socket.sendPresenceUpdate('paused', this.from);
                console.log('⏸️ Typing indicator gestoppt');
            }
        } catch (error) {
            console.error('❌ Fehler beim Typing Indicator:', error);
        }
    }

    async typeAndReply(text, typingDuration = 2000, mentions = []) {
        try {
            // Starte typing
            await this.visualWrite(true);
            
            // Warte die angegebene Zeit
            await new Promise(resolve => setTimeout(resolve, typingDuration));
            
            // Stoppe typing
            await this.visualWrite(false);
            
            // Sende Nachricht
            return await this.reply(text, mentions);
            
        } catch (error) {
            console.error('❌ Fehler beim typeAndReply:', error);
            // Fallback: Normale Reply
            return await this.reply(text, mentions);
        }
    }

    async typeFor(milliseconds) {
        await this.visualWrite(true);
        await new Promise(resolve => setTimeout(resolve, milliseconds));
        await this.visualWrite(false);
    }

    async simulateTyping(text, options = {}) {
        const {
            typingSpeed = 50,        // ms pro Zeichen
            minTypingTime = 1000,    // Minimum typing Zeit
            maxTypingTime = 5000,    // Maximum typing Zeit
            mentions = []
        } = options;

        try {
            // Berechne realistische Typing-Zeit basierend auf Text-Länge
            const calculatedTime = Math.min(
                Math.max(text.length * typingSpeed, minTypingTime),
                maxTypingTime
            );

            console.log(`⌨️ Simuliere Typing für ${calculatedTime}ms (${text.length} Zeichen)`);

            // Starte typing
            await this.visualWrite(true);
            
            // Warte realistische Zeit
            await new Promise(resolve => setTimeout(resolve, calculatedTime));
            
            // Stoppe typing
            await this.visualWrite(false);
            
            // Kurze Pause vor dem Senden (realistisch)
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Sende Nachricht
            return await this.reply(text, mentions);
            
        } catch (error) {
            console.error('❌ Fehler beim simulateTyping:', error);
            return await this.reply(text, mentions);
        }
    }
}

// ===== STATISTICS SYSTEM =====

class MessageStats {
    constructor(message) {
        this.message = message;
        this.client = message.client;
    }

    async getMessageCount(chatId = null) {
        const targetChat = chatId || this.message.from;
        
        // Hier würdest du normalerweise eine Datenbank abfragen
        // Für jetzt simulieren wir es
        return {
            total: Math.floor(Math.random() * 1000) + 100,
            today: Math.floor(Math.random() * 50) + 10,
            thisWeek: Math.floor(Math.random() * 200) + 50
        };
    }

    async getUserActivity(userId = null) {
        const targetUser = userId || this.message.getSender();
        
        return {
            userId: targetUser,
            messagesCount: Math.floor(Math.random() * 500) + 50,
            lastSeen: new Date(),
            isActive: Math.random() > 0.5,
            averagePerDay: Math.floor(Math.random() * 20) + 5
        };
    }

    async getGroupStats() {
        if (!this.message.isGroup) {
            throw new Error('Stats nur in Gruppen verfügbar');
        }

        const metadata = await this.client.get.GroupMetadata(this.message.from);
        
        return {
            groupName: metadata.subject,
            totalMembers: metadata.participants.length,
            admins: metadata.participants.filter(p => p.admin).length,
            created: new Date(metadata.creation * 1000),
            description: metadata.desc || 'Keine Beschreibung'
        };
    }

    async getMostActiveUsers(limit = 5) {
        if (!this.message.isGroup) {
            throw new Error('Stats nur in Gruppen verfügbar');
        }

        const metadata = await this.client.get.GroupMetadata(this.message.from);
        
        // Simulierte Daten - in echter App würdest du echte Stats haben
        return metadata.participants.slice(0, limit).map(p => ({
            userId: p.id,
            name: p.notify || p.id.split('@')[0],
            messageCount: Math.floor(Math.random() * 200) + 10,
            isAdmin: !!p.admin
        }));
    }

    async getMessagesByType() {
        return {
            text: Math.floor(Math.random() * 500) + 100,
            image: Math.floor(Math.random() * 100) + 20,
            video: Math.floor(Math.random() * 50) + 10,
            audio: Math.floor(Math.random() * 30) + 5,
            sticker: Math.floor(Math.random() * 80) + 15,
            document: Math.floor(Math.random() * 20) + 2
        };
    }
}