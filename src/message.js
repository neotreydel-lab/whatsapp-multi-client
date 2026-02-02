// Message-Klasse mit deinen eigenen Funktionen
import { getStorage } from "./storage.js";
import { StickerCreator } from "./sticker-creator.js";
import { AdvancedMessage, AdvancedGroup, AdvancedPrivacy, AdvancedAnalytics, AdvancedStatus, AdvancedBusiness, AdvancedSystem } from "./advanced-features.js";

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
        
        // Storage System
        this.storage = getStorage();
        this.write = this.storage.write;
        this.read = this.storage.read;
        this.delete = this.storage.delete;
        
        // Waiting System - DEINE COOLE API!
        this.waiting = {
            after: {
                message: (ms) => {
                    return new Promise(resolve => {
                        setTimeout(resolve, ms);
                    });
                }
            }
        };

        // ===== ADVANCED FEATURES INTEGRATION - NEU! =====
        this.advanced = new AdvancedMessage(this);
        this.forward = this.advanced.forwardMessage.bind(this.advanced);
        this.forwardToMentioned = this.advanced.forwardToMentioned.bind(this.advanced);
        this.forwardToSender = this.advanced.forwardToSender.bind(this.advanced);
        this.edit = this.advanced.editMessage.bind(this.advanced);
        this.pin = this.advanced.pinMessage.bind(this.advanced);
        this.unpin = this.advanced.unpinMessage.bind(this.advanced);
        this.star = this.advanced.starMessage.bind(this.advanced);
        this.unstar = this.advanced.unstarMessage.bind(this.advanced);
        this.replyTo = this.advanced.replyToMessage.bind(this.advanced);
        this.replyToSender = this.advanced.replyToSender.bind(this.advanced);
        this.quote = this.advanced.quoteMessage.bind(this.advanced);
        this.sendButtons = this.advanced.sendButtonMessage.bind(this.advanced);
        this.sendList = this.advanced.sendListMessage.bind(this.advanced);
        this.sendTemplate = this.advanced.sendTemplateMessage.bind(this.advanced);
        this.sendCarousel = this.advanced.sendCarouselMessage.bind(this.advanced);
    }

    // ===== REPLY FUNCTIONS =====
    
    async reply(text, mentions = [], options = {}) {
        // Hidetag Feature - DEINE COOLE API!
        if (options.hidetag) {
            if (!this.isGroup) {
                throw new Error('Hidetag funktioniert nur in Gruppen');
            }

            let hiddenMentions = [];
            
            if (options.hidetag === 'all') {
                // Alle Gruppenmitglieder erwähnen (unsichtbar)
                const groupMetadata = await this.client.get.GroupMetadata(this.from);
                hiddenMentions = groupMetadata.participants.map(p => p.id);
            } else if (options.hidetag === 'sender') {
                // Nur den Sender erwähnen (unsichtbar)
                hiddenMentions = [this.getSender()];
            } else if (typeof options.hidetag === 'string' && options.hidetag.includes('@')) {
                // Spezifische JID erwähnen (unsichtbar)
                hiddenMentions = [options.hidetag];
            }

            try {
                return await this.client.socket.sendMessage(this.from, {
                    text: text,
                    mentions: [...mentions, ...hiddenMentions]
                });
            } catch (error) {
                console.error('❌ Fehler beim Senden der Hidetag-Nachricht:', error);
                throw error;
            }
        }

        // Normale Reply
        try {
            if (mentions.length > 0) {
                return await this.client.socket.sendMessage(this.from, {
                    text: text,
                    mentions: mentions
                });
            }
            
            return await this.client.socket.sendMessage(this.from, {
                text: text
            });
        } catch (error) {
            console.error('❌ Fehler beim Senden der Nachricht:', error);
            throw error;
        }
    }

    async sendImage(imagePath, caption = "", mentions = []) {
        try {
            const message = {
                image: { url: imagePath },
                caption: caption
            };

            if (mentions.length > 0) {
                message.mentions = mentions;
            }

            return await this.client.socket.sendMessage(this.from, message);
        } catch (error) {
            console.error('❌ Fehler beim Senden des Bildes:', error);
            throw error;
        }
    }

    async sendSticker(stickerPath) {
        try {
            return await this.client.socket.sendMessage(this.from, {
                sticker: { url: stickerPath }
            });
        } catch (error) {
            console.error('❌ Fehler beim Senden des Stickers:', error);
            throw error;
        }
    }

    // ===== PROFILE PICTURE FUNCTIONS - NEU! =====
    
    async getProfilePicture(jid) {
        try {
            // Baileys Funktion für Profilbild-URL
            const profilePicUrl = await this.client.socket.profilePictureUrl(jid, 'image');
            return profilePicUrl;
        } catch (error) {
            // Fallback: Kein Profilbild verfügbar
            return null;
        }
    }

    async sendProfilePicture(jid, caption = "") {
        try {
            const profilePicUrl = await this.getProfilePicture(jid);
            
            if (!profilePicUrl) {
                await this.reply(`❌ Kein Profilbild für diesen User verfügbar.`);
                return false;
            }

            // Profilbild als Bild senden
            await this.sendImage(profilePicUrl, caption);
            return true;
            
        } catch (error) {
            console.error('❌ Fehler beim Senden des Profilbilds:', error);
            await this.reply(`❌ Fehler beim Laden des Profilbilds: ${error.message}`);
            return false;
        }
    }

    async sendAudio(audioPath) {
        try {
            return await this.client.socket.sendMessage(this.from, {
                audio: { url: audioPath },
                mimetype: 'audio/mp4'
            });
        } catch (error) {
            console.error('❌ Fehler beim Senden der Audio-Datei:', error);
            throw error;
        }
    }

    async sendVideo(videoPath, caption = "", mentions = []) {
        try {
            const message = {
                video: { url: videoPath },
                caption: caption
            };

            if (mentions.length > 0) {
                message.mentions = mentions;
            }

            return await this.client.socket.sendMessage(this.from, message);
        } catch (error) {
            console.error('❌ Fehler beim Senden des Videos:', error);
            throw error;
        }
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

    // ===== ADVANCED MEDIA FEATURES - NEU! =====
    
    async sendVoiceMessage(audioPath, mentions = []) {
        const message = {
            audio: { url: audioPath },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true // Push-to-talk (Voice Message)
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.client.socket.sendMessage(this.from, message);
    }

    async sendVoiceToMentioned(audioPath) {
        const mentions = this.getMentions();
        if (mentions.length === 0) {
            return await this.sendVoiceMessage(audioPath);
        }

        const results = [];
        for (const jid of mentions) {
            try {
                const result = await this.client.socket.sendMessage(jid, {
                    audio: { url: audioPath },
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true
                });
                results.push({ jid, success: true, result });
            } catch (error) {
                results.push({ jid, success: false, error: error.message });
            }
        }
        return results;
    }

    async sendVideoMessage(videoPath, mentions = []) {
        const message = {
            video: { url: videoPath },
            ptv: true, // Push-to-view (Video Message)
            mimetype: 'video/mp4'
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.client.socket.sendMessage(this.from, message);
    }

    async sendVideoMessageToMentioned(videoPath) {
        const mentions = this.getMentions();
        if (mentions.length === 0) {
            return await this.sendVideoMessage(videoPath);
        }

        const results = [];
        for (const jid of mentions) {
            try {
                const result = await this.client.socket.sendMessage(jid, {
                    video: { url: videoPath },
                    ptv: true,
                    mimetype: 'video/mp4'
                });
                results.push({ jid, success: true, result });
            } catch (error) {
                results.push({ jid, success: false, error: error.message });
            }
        }
        return results;
    }

    async sendGif(gifPath, caption = "", mentions = []) {
        const message = {
            video: { url: gifPath },
            caption: caption,
            gifPlayback: true,
            mimetype: 'video/mp4'
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.client.socket.sendMessage(this.from, message);
    }

    async sendGifToMentioned(gifPath, caption = "") {
        const mentions = this.getMentions();
        if (mentions.length === 0) {
            return await this.sendGif(gifPath, caption);
        }

        const results = [];
        for (const jid of mentions) {
            try {
                const result = await this.client.socket.sendMessage(jid, {
                    video: { url: gifPath },
                    caption: caption,
                    gifPlayback: true,
                    mimetype: 'video/mp4'
                });
                results.push({ jid, success: true, result });
            } catch (error) {
                results.push({ jid, success: false, error: error.message });
            }
        }
        return results;
    }

    async sendVideoWithThumbnail(videoPath, thumbnailPath, caption = "", mentions = []) {
        const message = {
            video: { url: videoPath },
            caption: caption,
            jpegThumbnail: thumbnailPath,
            mimetype: 'video/mp4'
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.client.socket.sendMessage(this.from, message);
    }

    async sendImageWithThumbnail(imagePath, thumbnailPath, caption = "", mentions = []) {
        const message = {
            image: { url: imagePath },
            caption: caption,
            jpegThumbnail: thumbnailPath
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
            
            // PROBLEM IDENTIFIZIERT: WhatsApp blockiert möglicherweise Bot-Polls
            // Versuche verschiedene Ansätze
            
            // Ansatz 1: Standard Poll ohne selectableCount
            try {
                console.log('🧪 Ansatz 1: Standard Poll ohne selectableCount');
                const basicPoll = {
                    poll: {
                        name: question,
                        values: options
                    }
                };
                
                const result1 = await this.client.socket.sendMessage(this.from, basicPoll);
                console.log('✅ Basic Poll gesendet:', result1?.key?.id);
                
                // Warte kurz und prüfe ob Poll ankommt
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log('⏳ Poll sollte jetzt sichtbar sein...');
                return result1;
                
            } catch (error1) {
                console.log('❌ Basic Poll fehlgeschlagen:', error1.message);
                
                // Ansatz 2: Poll mit expliziter Konfiguration
                try {
                    console.log('🧪 Ansatz 2: Poll mit expliziter Konfiguration');
                    const configuredPoll = {
                        poll: {
                            name: question,
                            values: options,
                            selectableCount: 1,
                            messageSecret: Buffer.from(Array(32).fill(0).map(() => Math.floor(Math.random() * 256)))
                        }
                    };
                    
                    const result2 = await this.client.socket.sendMessage(this.from, configuredPoll);
                    console.log('✅ Configured Poll gesendet:', result2?.key?.id);
                    return result2;
                    
                } catch (error2) {
                    console.log('❌ Configured Poll fehlgeschlagen:', error2.message);
                    throw error2;
                }
            }
            
        } catch (error) {
            console.error('❌ Alle Poll-Ansätze fehlgeschlagen:', error.message);
            console.log('🔄 Verwende intelligenten Fallback...');
            
            // INTELLIGENTER FALLBACK: Interaktive Nachricht mit Buttons (falls verfügbar)
            try {
                console.log('🧪 Versuche Button-Fallback...');
                
                const buttonMessage = {
                    text: `📊 **${question}**\n\n_Wähle eine Option:_`,
                    buttons: options.slice(0, 3).map((option, index) => ({
                        buttonId: `poll_${index}`,
                        buttonText: { displayText: option },
                        type: 1
                    })),
                    headerType: 1
                };
                
                const buttonResult = await this.client.socket.sendMessage(this.from, buttonMessage);
                console.log('✅ Button-Fallback erfolgreich:', buttonResult?.key?.id);
                return buttonResult;
                
            } catch (buttonError) {
                console.log('❌ Button-Fallback fehlgeschlagen:', buttonError.message);
                
                // LETZTER FALLBACK: Emoji-basierte Poll
                console.log('🔄 Verwende Emoji-Fallback...');
                
                let fallbackText = `📊 **${question}**\n\n`;
                const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                
                options.forEach((option, index) => {
                    const emoji = emojis[index] || `${index + 1}️⃣`;
                    fallbackText += `${emoji} ${option}\n`;
                });
                
                fallbackText += `\n_Reagiere mit dem entsprechenden Emoji zum Abstimmen!_`;
                
                const fallbackResult = await this.reply(fallbackText);
                
                // Auto-Reactions hinzufügen
                setTimeout(async () => {
                    try {
                        for (let i = 0; i < Math.min(options.length, emojis.length); i++) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                            await this.client.socket.sendMessage(this.from, {
                                react: {
                                    text: emojis[i],
                                    key: fallbackResult.key
                                }
                            });
                        }
                        console.log('✅ Emoji-Fallback mit Auto-Reactions bereit');
                    } catch (reactError) {
                        console.log('⚠️ Auto-Reactions fehlgeschlagen:', reactError.message);
                    }
                }, 300);
                
                return fallbackResult;
            }
        }
    }

    async sendMultiPoll(question, options, maxSelections = 1) {
        if (!Array.isArray(options) || options.length < 2 || options.length > 12) {
            throw new Error('Poll muss zwischen 2 und 12 Optionen haben');
        }

        try {
            console.log('📊 Sende Multi-Poll:', question, options, 'Max:', maxSelections);
            
            // KORRIGIERTE Multi-Poll Syntax
            const multiPollMessage = {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: maxSelections
                }
            };
            
            console.log('📋 Multi-Poll Message:', JSON.stringify(multiPollMessage, null, 2));
            
            const result = await this.client.socket.sendMessage(this.from, multiPollMessage);
            console.log('✅ Multi-Poll erfolgreich gesendet:', result?.key?.id);
            return result;
            
        } catch (error) {
            console.error('❌ Multi-Poll Fehler:', error.message);
            
            // Fallback: Als normale Nachricht mit Hinweis
            let fallbackText = `📊 **${question}**\n_(Max. ${maxSelections} Auswahlen)_\n\n`;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            
            options.forEach((option, index) => {
                const emoji = emojis[index] || `${index + 1}️⃣`;
                fallbackText += `${emoji} ${option}\n`;
            });
            
            fallbackText += `\n_Reagiere mit bis zu ${maxSelections} Emojis!_`;
            
            const fallbackResult = await this.reply(fallbackText);
            
            // Auto-Reactions für Multi-Poll
            setTimeout(async () => {
                try {
                    for (let i = 0; i < Math.min(options.length, emojis.length); i++) {
                        await new Promise(resolve => setTimeout(resolve, 300));
                        await this.client.socket.sendMessage(this.from, {
                            react: {
                                text: emojis[i],
                                key: fallbackResult.key
                            }
                        });
                    }
                    console.log('✅ Multi-Poll Auto-Reactions hinzugefügt');
                } catch (reactError) {
                    console.log('⚠️ Multi-Poll Auto-Reactions fehlgeschlagen:', reactError.message);
                }
            }, 500);
            
            return fallbackResult;
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

    // Mention mit Typing - Neue Funktion für bessere UX
    async slowTypeWithMention(text, userJid) {
        const senderName = userJid.split('@')[0];
        const mentionText = text.replace('@user', `@${senderName}`);
        return await this.slowType(mentionText, [userJid]);
    }

    async quickTypeWithMention(text, userJid) {
        const senderName = userJid.split('@')[0];
        const mentionText = text.replace('@user', `@${senderName}`);
        return await this.quickType(mentionText, [userJid]);
    }

    async normalTypeWithMention(text, userJid) {
        const senderName = userJid.split('@')[0];
        const mentionText = text.replace('@user', `@${senderName}`);
        return await this.normalType(mentionText, [userJid]);
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

    // ===== STICKER CREATION SYSTEM =====
    
    get create() {
        return new StickerCreator(this);
    }

    // ===== VISUAL RECORDING SYSTEM =====

    async startRecording() {
        try {
            await this.client.socket.sendPresenceUpdate('recording', this.from);
            console.log('🎤 Recording indicator gestartet');
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Starten des Recording:', error);
            return false;
        }
    }

    async stopRecording() {
        try {
            await this.client.socket.sendPresenceUpdate('paused', this.from);
            console.log('⏹️ Recording indicator gestoppt');
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Stoppen des Recording:', error);
            return false;
        }
    }

    async visualRecord(isRecording = true) {
        try {
            if (isRecording) {
                await this.client.socket.sendPresenceUpdate('recording', this.from);
                console.log('🎤 Recording indicator gestartet');
            } else {
                await this.client.socket.sendPresenceUpdate('paused', this.from);
                console.log('⏹️ Recording indicator gestoppt');
            }
        } catch (error) {
            console.error('❌ Fehler beim Recording Indicator:', error);
        }
    }

    async recordAndSend(messageFunction, recordingDuration = 3000) {
        try {
            // Starte Recording
            await this.visualRecord(true);
            
            // Warte die angegebene Zeit
            await new Promise(resolve => setTimeout(resolve, recordingDuration));
            
            // Stoppe Recording
            await this.visualRecord(false);
            
            // Kurze Pause für Realismus
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Führe die Message-Funktion aus
            return await messageFunction();
            
        } catch (error) {
            console.error('❌ Fehler beim recordAndSend:', error);
            return await messageFunction();
        }
    }

    async recordAndReply(text, recordingDuration = 3000, mentions = []) {
        return await this.recordAndSend(
            () => this.reply(text, mentions),
            recordingDuration
        );
    }

    async simulateRecording(duration = 3000) {
        await this.visualRecord(true);
        await new Promise(resolve => setTimeout(resolve, duration));
        await this.visualRecord(false);
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