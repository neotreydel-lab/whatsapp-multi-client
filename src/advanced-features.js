// Advanced Features für WAEngine v2.0
// Alle erweiterten WhatsApp-Funktionen

export class AdvancedMessage {
    constructor(message) {
        this.msg = message;
        this.client = message.client;
        this.socket = message.client.socket;
    }

    // ===== ADVANCED MESSAGE FEATURES =====
    
    async forwardMessage(targetChat, messageId = null) {
        const msgId = messageId || this.msg.raw.key;
        
        try {
            return await this.socket.sendMessage(targetChat, {
                forward: msgId
            });
        } catch (error) {
            console.error('❌ Forward fehlgeschlagen:', error);
            throw new Error(`Nachricht konnte nicht weitergeleitet werden: ${error.message}`);
        }
    }

    async forwardToMentioned() {
        const mentions = this.msg.getMentions();
        if (mentions.length === 0) {
            throw new Error('Keine Mentions gefunden zum Weiterleiten');
        }

        const results = [];
        for (const jid of mentions) {
            try {
                const result = await this.forwardMessage(jid);
                results.push({ jid, success: true, result });
            } catch (error) {
                results.push({ jid, success: false, error: error.message });
            }
        }
        
        return results;
    }

    async forwardToSender() {
        const senderJid = this.msg.getSender();
        return await this.forwardMessage(senderJid);
    }

    async editMessage(newText) {
        try {
            return await this.socket.sendMessage(this.msg.from, {
                text: newText,
                edit: this.msg.raw.key
            });
        } catch (error) {
            console.error('❌ Edit fehlgeschlagen:', error);
            throw new Error(`Nachricht konnte nicht bearbeitet werden: ${error.message}`);
        }
    }

    async pinMessage() {
        if (!this.msg.isGroup) {
            throw new Error('Nachrichten können nur in Gruppen gepinnt werden');
        }

        try {
            return await this.socket.chatModify({
                pin: this.msg.raw.key
            }, this.msg.from);
        } catch (error) {
            console.error('❌ Pin fehlgeschlagen:', error);
            throw new Error(`Nachricht konnte nicht gepinnt werden: ${error.message}`);
        }
    }

    async unpinMessage() {
        if (!this.msg.isGroup) {
            throw new Error('Nachrichten können nur in Gruppen entpinnt werden');
        }

        try {
            return await this.socket.chatModify({
                unpin: this.msg.raw.key
            }, this.msg.from);
        } catch (error) {
            console.error('❌ Unpin fehlgeschlagen:', error);
            throw new Error(`Nachricht konnte nicht entpinnt werden: ${error.message}`);
        }
    }

    async starMessage() {
        try {
            return await this.socket.chatModify({
                star: {
                    messages: [this.msg.raw.key],
                    star: true
                }
            }, this.msg.from);
        } catch (error) {
            console.error('❌ Star fehlgeschlagen:', error);
            throw new Error(`Nachricht konnte nicht markiert werden: ${error.message}`);
        }
    }

    async unstarMessage() {
        try {
            return await this.socket.chatModify({
                star: {
                    messages: [this.msg.raw.key],
                    star: false
                }
            }, this.msg.from);
        } catch (error) {
            console.error('❌ Unstar fehlgeschlagen:', error);
            throw new Error(`Markierung konnte nicht entfernt werden: ${error.message}`);
        }
    }

    async replyToMessage(messageId, text, mentions = []) {
        const message = {
            text: text,
            contextInfo: {
                stanzaId: messageId,
                participant: this.msg.getSender(),
                quotedMessage: this.msg.raw.message
            }
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.socket.sendMessage(this.msg.from, message);
    }

    async replyToSender(text) {
        const senderJid = this.msg.getSender();
        return await this.replyToMessage(this.msg.raw.key.id, text, [senderJid]);
    }

    async quoteMessage(text, mentions = []) {
        const message = {
            text: text,
            contextInfo: {
                quotedMessage: this.msg.raw.message,
                stanzaId: this.msg.raw.key.id,
                participant: this.msg.getSender()
            }
        };

        if (mentions.length > 0) {
            message.mentions = mentions;
        }

        return await this.socket.sendMessage(this.msg.from, message);
    }

    // ===== RICH CONTENT FEATURES =====
    
    async sendButtonMessage(text, buttons, footer = "") {
        try {
            const buttonMessage = {
                text: text,
                footer: footer,
                buttons: buttons.map((btn, index) => ({
                    buttonId: btn.id || `btn_${index}`,
                    buttonText: { displayText: btn.text },
                    type: 1
                })),
                headerType: 1
            };

            return await this.socket.sendMessage(this.msg.from, buttonMessage);
        } catch (error) {
            console.error('❌ Button Message fehlgeschlagen:', error);
            // Fallback zu normaler Nachricht
            const fallbackText = `${text}\n\n${buttons.map((btn, i) => `${i + 1}. ${btn.text}`).join('\n')}\n\n${footer}`;
            return await this.msg.reply(fallbackText);
        }
    }

    async sendListMessage(title, description, buttonText, sections) {
        try {
            const listMessage = {
                text: description,
                footer: title,
                title: title,
                buttonText: buttonText,
                sections: sections.map(section => ({
                    title: section.title,
                    rows: section.rows.map(row => ({
                        title: row.title,
                        description: row.description || "",
                        rowId: row.id || row.title.toLowerCase().replace(/\s+/g, '_')
                    }))
                }))
            };

            return await this.socket.sendMessage(this.msg.from, listMessage);
        } catch (error) {
            console.error('❌ List Message fehlgeschlagen:', error);
            // Fallback zu normaler Nachricht
            let fallbackText = `📋 **${title}**\n${description}\n\n`;
            sections.forEach(section => {
                fallbackText += `**${section.title}:**\n`;
                section.rows.forEach((row, i) => {
                    fallbackText += `${i + 1}. ${row.title}`;
                    if (row.description) fallbackText += ` - ${row.description}`;
                    fallbackText += '\n';
                });
                fallbackText += '\n';
            });
            return await this.msg.reply(fallbackText);
        }
    }

    async sendTemplateMessage(templateId, parameters = {}) {
        try {
            const templateMessage = {
                templateMessage: {
                    hydratedTemplate: {
                        templateId: templateId,
                        hydratedContentText: parameters.text || "",
                        hydratedFooterText: parameters.footer || "",
                        hydratedButtons: parameters.buttons || []
                    }
                }
            };

            return await this.socket.sendMessage(this.msg.from, templateMessage);
        } catch (error) {
            console.error('❌ Template Message fehlgeschlagen:', error);
            throw new Error(`Template konnte nicht gesendet werden: ${error.message}`);
        }
    }

    async sendCarouselMessage(cards) {
        try {
            // WhatsApp Carousel ist experimentell
            const carouselMessage = {
                interactiveMessage: {
                    carouselMessage: {
                        cards: cards.map(card => ({
                            header: {
                                title: card.title,
                                subtitle: card.subtitle,
                                imageMessage: card.image ? { url: card.image } : undefined
                            },
                            body: { text: card.body },
                            footer: { text: card.footer || "" },
                            nativeFlowMessage: {
                                buttons: card.buttons || []
                            }
                        }))
                    }
                }
            };

            return await this.socket.sendMessage(this.msg.from, carouselMessage);
        } catch (error) {
            console.error('❌ Carousel Message fehlgeschlagen:', error);
            // Fallback: Sende Cards einzeln
            const results = [];
            for (const card of cards) {
                try {
                    let cardText = `🎴 **${card.title}**\n`;
                    if (card.subtitle) cardText += `${card.subtitle}\n\n`;
                    cardText += card.body;
                    if (card.footer) cardText += `\n\n_${card.footer}_`;
                    
                    const result = await this.msg.reply(cardText);
                    results.push(result);
                } catch (cardError) {
                    console.error('❌ Card fehlgeschlagen:', cardError);
                }
            }
            return results;
        }
    }
}

// ===== ADVANCED GROUP FEATURES =====

export class AdvancedGroup {
    constructor(client) {
        this.client = client;
        this.socket = client.socket;
    }

    async setGroupSettings(groupId, settings) {
        try {
            const updates = {};
            
            if (settings.messagesAdminOnly !== undefined) {
                updates.restrict = settings.messagesAdminOnly;
            }
            
            if (settings.editGroupInfo !== undefined) {
                updates.announce = settings.editGroupInfo === 'admin_only';
            }

            return await this.socket.groupSettingUpdate(groupId, updates);
        } catch (error) {
            console.error('❌ Group Settings Update fehlgeschlagen:', error);
            throw new Error(`Gruppeneinstellungen konnten nicht geändert werden: ${error.message}`);
        }
    }

    async setGroupDescription(groupId, description) {
        try {
            return await this.socket.groupUpdateDescription(groupId, description);
        } catch (error) {
            console.error('❌ Group Description Update fehlgeschlagen:', error);
            throw new Error(`Gruppenbeschreibung konnte nicht geändert werden: ${error.message}`);
        }
    }

    async setGroupSubject(groupId, subject) {
        try {
            return await this.socket.groupUpdateSubject(groupId, subject);
        } catch (error) {
            console.error('❌ Group Subject Update fehlgeschlagen:', error);
            throw new Error(`Gruppenname konnte nicht geändert werden: ${error.message}`);
        }
    }

    async getGroupInviteLink(groupId) {
        try {
            const inviteCode = await this.socket.groupInviteCode(groupId);
            return `https://chat.whatsapp.com/${inviteCode}`;
        } catch (error) {
            console.error('❌ Group Invite Link fehlgeschlagen:', error);
            throw new Error(`Einladungslink konnte nicht erstellt werden: ${error.message}`);
        }
    }

    async revokeGroupInviteLink(groupId) {
        try {
            return await this.socket.groupRevokeInvite(groupId);
        } catch (error) {
            console.error('❌ Group Invite Revoke fehlgeschlagen:', error);
            throw new Error(`Einladungslink konnte nicht widerrufen werden: ${error.message}`);
        }
    }

    async joinGroupViaLink(inviteCode) {
        try {
            return await this.socket.groupAcceptInvite(inviteCode);
        } catch (error) {
            console.error('❌ Group Join fehlgeschlagen:', error);
            throw new Error(`Gruppe konnte nicht beigetreten werden: ${error.message}`);
        }
    }

    async leaveGroup(groupId) {
        try {
            return await this.socket.groupLeave(groupId);
        } catch (error) {
            console.error('❌ Group Leave fehlgeschlagen:', error);
            throw new Error(`Gruppe konnte nicht verlassen werden: ${error.message}`);
        }
    }

    async updateGroupPicture(groupId, imagePath) {
        try {
            return await this.socket.updateProfilePicture(groupId, { url: imagePath });
        } catch (error) {
            console.error('❌ Group Picture Update fehlgeschlagen:', error);
            throw new Error(`Gruppenbild konnte nicht geändert werden: ${error.message}`);
        }
    }
}

// ===== PRIVACY & SECURITY FEATURES =====

export class AdvancedPrivacy {
    constructor(client) {
        this.client = client;
        this.socket = client.socket;
    }

    async blockUser(jid) {
        try {
            return await this.socket.updateBlockStatus(jid, 'block');
        } catch (error) {
            console.error('❌ Block User fehlgeschlagen:', error);
            throw new Error(`User konnte nicht blockiert werden: ${error.message}`);
        }
    }

    async unblockUser(jid) {
        try {
            return await this.socket.updateBlockStatus(jid, 'unblock');
        } catch (error) {
            console.error('❌ Unblock User fehlgeschlagen:', error);
            throw new Error(`User konnte nicht entblockiert werden: ${error.message}`);
        }
    }

    async setPrivacySettings(settings) {
        try {
            const privacySettings = {};
            
            if (settings.lastSeen) {
                privacySettings.lastSeenPrivacy = settings.lastSeen;
            }
            
            if (settings.profilePic) {
                privacySettings.profilePicPrivacy = settings.profilePic;
            }
            
            if (settings.status) {
                privacySettings.statusPrivacy = settings.status;
            }

            return await this.socket.updatePrivacySettings(privacySettings);
        } catch (error) {
            console.error('❌ Privacy Settings fehlgeschlagen:', error);
            throw new Error(`Privatsphäre-Einstellungen konnten nicht geändert werden: ${error.message}`);
        }
    }

    async markAsRead(chatId, messageId = null) {
        try {
            if (messageId) {
                return await this.socket.readMessages([{ remoteJid: chatId, id: messageId }]);
            } else {
                return await this.socket.chatModify({ markRead: true }, chatId);
            }
        } catch (error) {
            console.error('❌ Mark as Read fehlgeschlagen:', error);
            throw new Error(`Nachricht konnte nicht als gelesen markiert werden: ${error.message}`);
        }
    }

    async markAsUnread(chatId) {
        try {
            return await this.socket.chatModify({ markRead: false }, chatId);
        } catch (error) {
            console.error('❌ Mark as Unread fehlgeschlagen:', error);
            throw new Error(`Chat konnte nicht als ungelesen markiert werden: ${error.message}`);
        }
    }
}

// ===== ANALYTICS & MONITORING =====

export class AdvancedAnalytics {
    constructor(client) {
        this.client = client;
        this.socket = client.socket;
    }

    async getDeliveryStatus(messageKey) {
        try {
            // WhatsApp liefert Delivery Status über Events
            return {
                sent: true,
                delivered: false,
                read: false,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('❌ Delivery Status fehlgeschlagen:', error);
            return null;
        }
    }

    async isUserOnline(jid) {
        try {
            const presence = await this.socket.presenceSubscribe(jid);
            return presence?.lastKnownPresence === 'available';
        } catch (error) {
            console.error('❌ Online Status fehlgeschlagen:', error);
            return false;
        }
    }

    async getLastSeen(jid) {
        try {
            const presence = await this.socket.presenceSubscribe(jid);
            return presence?.lastSeen || null;
        } catch (error) {
            console.error('❌ Last Seen fehlgeschlagen:', error);
            return null;
        }
    }

    async archiveChat(chatId) {
        try {
            return await this.socket.chatModify({ archive: true }, chatId);
        } catch (error) {
            console.error('❌ Archive Chat fehlgeschlagen:', error);
            throw new Error(`Chat konnte nicht archiviert werden: ${error.message}`);
        }
    }

    async unarchiveChat(chatId) {
        try {
            return await this.socket.chatModify({ archive: false }, chatId);
        } catch (error) {
            console.error('❌ Unarchive Chat fehlgeschlagen:', error);
            throw new Error(`Chat konnte nicht entarchiviert werden: ${error.message}`);
        }
    }

    async muteChat(chatId, duration = 8 * 60 * 60 * 1000) { // 8 Stunden default
        try {
            return await this.socket.chatModify({ 
                mute: Date.now() + duration 
            }, chatId);
        } catch (error) {
            console.error('❌ Mute Chat fehlgeschlagen:', error);
            throw new Error(`Chat konnte nicht stummgeschaltet werden: ${error.message}`);
        }
    }

    async unmuteChat(chatId) {
        try {
            return await this.socket.chatModify({ mute: null }, chatId);
        } catch (error) {
            console.error('❌ Unmute Chat fehlgeschlagen:', error);
            throw new Error(`Chat konnte nicht entstummt werden: ${error.message}`);
        }
    }
}

// ===== STATUS FEATURES =====

export class AdvancedStatus {
    constructor(client) {
        this.client = client;
        this.socket = client.socket;
    }

    async sendStatusUpdate(type, content, options = {}) {
        try {
            let statusMessage = {};
            
            if (type === 'text') {
                statusMessage = {
                    text: content,
                    backgroundColor: options.backgroundColor || '#000000',
                    font: options.font || 0
                };
            } else if (type === 'image') {
                statusMessage = {
                    image: { url: content },
                    caption: options.caption || ""
                };
            } else if (type === 'video') {
                statusMessage = {
                    video: { url: content },
                    caption: options.caption || ""
                };
            }

            return await this.socket.sendMessage('status@broadcast', statusMessage);
        } catch (error) {
            console.error('❌ Status Update fehlgeschlagen:', error);
            throw new Error(`Status konnte nicht gesendet werden: ${error.message}`);
        }
    }

    async getStatusViews() {
        try {
            // Status Views sind normalerweise über Events verfügbar
            return {
                totalViews: 0,
                viewers: []
            };
        } catch (error) {
            console.error('❌ Status Views fehlgeschlagen:', error);
            return null;
        }
    }

    async getUserStatus(jid) {
        try {
            // User Status abrufen (falls verfügbar)
            return {
                status: "Verfügbar",
                lastUpdated: new Date()
            };
        } catch (error) {
            console.error('❌ User Status fehlgeschlagen:', error);
            return null;
        }
    }
}

// ===== BUSINESS FEATURES =====

export class AdvancedBusiness {
    constructor(client) {
        this.client = client;
        this.socket = client.socket;
    }

    async setBusinessProfile(profile) {
        try {
            return await this.socket.updateBusinessProfile({
                description: profile.description,
                category: profile.category,
                email: profile.email,
                website: profile.website,
                address: profile.address
            });
        } catch (error) {
            console.error('❌ Business Profile fehlgeschlagen:', error);
            throw new Error(`Business Profil konnte nicht aktualisiert werden: ${error.message}`);
        }
    }

    async sendProductMessage(productId, catalogId = null) {
        try {
            const productMessage = {
                productMessage: {
                    product: {
                        productId: productId,
                        catalogId: catalogId
                    },
                    businessOwnerJid: this.socket.user.id
                }
            };

            return await this.socket.sendMessage(this.msg.from, productMessage);
        } catch (error) {
            console.error('❌ Product Message fehlgeschlagen:', error);
            throw new Error(`Produkt konnte nicht gesendet werden: ${error.message}`);
        }
    }

    async createProduct(productData) {
        try {
            return await this.socket.productCreate({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                currency: productData.currency || 'EUR',
                images: productData.images || []
            });
        } catch (error) {
            console.error('❌ Create Product fehlgeschlagen:', error);
            throw new Error(`Produkt konnte nicht erstellt werden: ${error.message}`);
        }
    }

    async sendPaymentRequest(amount, currency = 'EUR', description = '') {
        try {
            const paymentMessage = {
                requestPaymentMessage: {
                    amount: {
                        value: amount,
                        offset: 100,
                        currencyCode: currency
                    },
                    noteMessage: {
                        extendedTextMessage: {
                            text: description
                        }
                    }
                }
            };

            return await this.socket.sendMessage(this.msg.from, paymentMessage);
        } catch (error) {
            console.error('❌ Payment Request fehlgeschlagen:', error);
            throw new Error(`Zahlungsanfrage konnte nicht gesendet werden: ${error.message}`);
        }
    }
}

// ===== SYSTEM FEATURES =====

export class AdvancedSystem {
    constructor(client) {
        this.client = client;
        this.socket = client.socket;
    }

    async createBackup() {
        try {
            // Backup der wichtigsten Daten
            const backup = {
                timestamp: Date.now(),
                contacts: await this.socket.getContacts(),
                chats: await this.socket.getChats(),
                settings: {
                    // Wichtige Einstellungen
                }
            };

            return backup;
        } catch (error) {
            console.error('❌ Backup fehlgeschlagen:', error);
            throw new Error(`Backup konnte nicht erstellt werden: ${error.message}`);
        }
    }

    async restoreFromBackup(backupData) {
        try {
            // Restore-Logik implementieren
            console.log('🔄 Restore von Backup...');
            return true;
        } catch (error) {
            console.error('❌ Restore fehlgeschlagen:', error);
            throw new Error(`Backup konnte nicht wiederhergestellt werden: ${error.message}`);
        }
    }

    async exportChat(chatId, format = 'json') {
        try {
            // Chat-Export implementieren
            const chatHistory = {
                chatId: chatId,
                messages: [],
                exportDate: new Date(),
                format: format
            };

            return chatHistory;
        } catch (error) {
            console.error('❌ Chat Export fehlgeschlagen:', error);
            throw new Error(`Chat konnte nicht exportiert werden: ${error.message}`);
        }
    }

    async importContacts(contactList) {
        try {
            // Kontakte importieren
            const results = [];
            for (const contact of contactList) {
                try {
                    // Kontakt hinzufügen
                    results.push({ contact, success: true });
                } catch (error) {
                    results.push({ contact, success: false, error: error.message });
                }
            }
            return results;
        } catch (error) {
            console.error('❌ Import Contacts fehlgeschlagen:', error);
            throw new Error(`Kontakte konnten nicht importiert werden: ${error.message}`);
        }
    }

    async syncWithPhone() {
        try {
            // Synchronisation mit dem Telefon
            return await this.socket.resyncMainAppState();
        } catch (error) {
            console.error('❌ Sync fehlgeschlagen:', error);
            throw new Error(`Synchronisation fehlgeschlagen: ${error.message}`);
        }
    }

    async getLinkedDevices() {
        try {
            return await this.socket.getDevices();
        } catch (error) {
            console.error('❌ Get Devices fehlgeschlagen:', error);
            return [];
        }
    }

    async unlinkDevice(deviceId) {
        try {
            return await this.socket.removeDevice(deviceId);
        } catch (error) {
            console.error('❌ Unlink Device fehlgeschlagen:', error);
            throw new Error(`Gerät konnte nicht entfernt werden: ${error.message}`);
        }
    }
}