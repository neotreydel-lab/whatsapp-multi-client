export class UIComponents {
    constructor(client) {
        this.client = client;
    }
    
    // ===== CAROUSEL MESSAGES =====
    
    /**
     * Send carousel message with multiple cards
     */
    async sendCarousel(chatId, cards, options = {}) {
        try {
            // WhatsApp doesn't support native carousels, so we create a rich text alternative
            let carouselText = `🎠 **${options.title || 'Carousel'}**\n\n`;
            
            cards.forEach((card, index) => {
                carouselText += `**${index + 1}. ${card.title}**\n`;
                if (card.subtitle) carouselText += `${card.subtitle}\n`;
                if (card.body) carouselText += `${card.body}\n`;
                if (card.price) carouselText += `💰 ${card.price}\n`;
                
                // Add buttons as text options
                if (card.buttons && card.buttons.length > 0) {
                    carouselText += `Options: `;
                    card.buttons.forEach((btn, btnIndex) => {
                        carouselText += `[${btnIndex + 1}] ${btn.title} `;
                    });
                    carouselText += `\n`;
                }
                
                carouselText += `\n`;
            });
            
            if (options.footer) {
                carouselText += `\n_${options.footer}_`;
            }
            
            // Send with image if provided
            if (cards[0]?.image) {
                await this.client.socket.sendMessage(chatId, {
                    image: { url: cards[0].image },
                    caption: carouselText
                });
            } else {
                await this.client.socket.sendMessage(chatId, { text: carouselText });
            }
            
            return { success: true, type: 'carousel', cards: cards.length };
            
        } catch (error) {
            // Fallback to simple text
            const fallbackText = `📋 **${options.title || 'Options'}**\n\n` +
                cards.map((card, i) => `${i + 1}. ${card.title}`).join('\n');
            
            await this.client.socket.sendMessage(chatId, { text: fallbackText });
            return { success: true, type: 'fallback', cards: cards.length };
        }
    }
    
    // ===== PERSISTENT MENU =====
    
    /**
     * Set persistent menu for user
     */
    async setPersistentMenu(userId, menuItems) {
        // Store menu in user data
        this.client.storage.write.in("ui").set(`persistentMenu.${userId}`, {
            items: menuItems,
            created: new Date(),
            active: true
        });
        
        // Send menu as message
        let menuText = `📋 **Hauptmenü**\n\n`;
        menuItems.forEach((item, index) => {
            menuText += `${item.emoji || '▫️'} **${item.title}**\n`;
            if (item.description) menuText += `   ${item.description}\n`;
            menuText += `   Befehl: \`${item.payload || item.command}\`\n\n`;
        });
        
        menuText += `_Verwende die Befehle oben oder tippe "menu" für dieses Menü._`;
        
        try {
            await this.client.socket.sendMessage(userId, { text: menuText });
        } catch (error) {
            console.error('❌ Fehler beim Senden des Menüs:', error);
            throw error;
        }
        
        return { success: true, items: menuItems.length };
    }
    
    /**
     * Get persistent menu for user
     */
    getPersistentMenu(userId) {
        return this.client.storage.read.from("ui").get(`persistentMenu.${userId}`);
    }
    
    /**
     * Show persistent menu
     */
    async showPersistentMenu(userId) {
        const menu = this.getPersistentMenu(userId);
        if (!menu || !menu.active) {
            return { success: false, error: 'No active menu found' };
        }
        
        return await this.setPersistentMenu(userId, menu.items);
    }
    
    // ===== QUICK REPLIES =====
    
    /**
     * Send message with quick reply options
     */
    async sendQuickReplies(chatId, text, replies, options = {}) {
        let message = `${text}\n\n`;
        
        // Add quick reply options
        message += `**Quick Replies:**\n`;
        replies.forEach((reply, index) => {
            const emoji = reply.emoji || `${index + 1}️⃣`;
            message += `${emoji} ${reply.title}\n`;
        });
        
        if (options.footer) {
            message += `\n_${options.footer}_`;
        }
        
        try {
            await this.client.socket.sendMessage(chatId, { text: message });
        } catch (error) {
            console.error('❌ Fehler beim Senden der Quick Replies:', error);
            throw error;
        }
        
        // Store quick replies for processing
        this.client.storage.write.in("ui").set(`quickReplies.${chatId}`, {
            replies: replies,
            timestamp: Date.now(),
            expires: Date.now() + (options.timeout || 300000) // 5 minutes default
        });
        
        return { success: true, replies: replies.length };
    }
    
    /**
     * Process quick reply response
     */
    processQuickReply(chatId, userInput) {
        const quickReplies = this.client.storage.read.from("ui").get(`quickReplies.${chatId}`);
        
        if (!quickReplies || Date.now() > quickReplies.expires) {
            return null;
        }
        
        // Find matching reply
        const reply = quickReplies.replies.find((r, index) => {
            return userInput.toLowerCase() === r.title.toLowerCase() ||
                   userInput === `${index + 1}` ||
                   userInput === r.payload;
        });
        
        if (reply) {
            // Clean up stored replies
            this.client.storage.delete.from("ui").key(`quickReplies.${chatId}`);
            return reply;
        }
        
        return null;
    }
    
    // ===== RICH MEDIA TEMPLATES =====
    
    /**
     * Send product template
     */
    async sendProductTemplate(chatId, product, options = {}) {
        const template = `🛍️ **${product.name}**\n\n` +
                        `${product.description || 'No description available'}\n\n` +
                        `💰 **Price:** ${product.price} ${product.currency || 'EUR'}\n` +
                        `📦 **Stock:** ${product.inStock ? 'Available' : 'Out of Stock'}\n` +
                        `🏷️ **Category:** ${product.category || 'General'}\n\n` +
                        `**Actions:**\n` +
                        `🛒 Buy Now - \`buy ${product.id}\`\n` +
                        `ℹ️ More Info - \`info ${product.id}\`\n` +
                        `❤️ Add to Wishlist - \`wishlist ${product.id}\``;
        
        if (product.images && product.images.length > 0) {
            await this.client.socket.sendMessage(chatId, {
                image: { url: product.images[0] },
                caption: template
            });
        } else {
            await this.client.socket.sendMessage(chatId, { text: template });
        }
        
        return { success: true, type: 'product', productId: product.id };
    }
    
    /**
     * Send service template
     */
    async sendServiceTemplate(chatId, service, options = {}) {
        const template = `⚙️ **${service.name}**\n\n` +
                        `${service.description || 'Professional service'}\n\n` +
                        `💰 **Price:** ${service.price} ${service.currency || 'EUR'}\n` +
                        `⏱️ **Duration:** ${service.duration || 'Varies'}\n` +
                        `📅 **Availability:** ${service.available ? 'Available' : 'Booked'}\n\n` +
                        `**Book Service:**\n` +
                        `📞 Book Now - \`book ${service.id}\`\n` +
                        `💬 Ask Questions - \`ask ${service.id}\`\n` +
                        `📋 View Details - \`details ${service.id}\``;
        
        await this.client.socket.sendMessage(chatId, { text: template });
        
        return { success: true, type: 'service', serviceId: service.id };
    }
    
    // ===== INTERACTIVE FORMS =====
    
    /**
     * Create interactive form
     */
    async createForm(chatId, formConfig) {
        const form = {
            id: `form_${Date.now()}`,
            chatId: chatId,
            title: formConfig.title,
            fields: formConfig.fields,
            currentField: 0,
            responses: {},
            created: Date.now(),
            status: 'active'
        };
        
        // Store form
        this.client.storage.write.in("ui").set(`forms.${form.id}`, form);
        this.client.storage.write.in("ui").set(`activeForm.${chatId}`, form.id);
        
        // Start form
        await this.sendFormField(chatId, form, 0);
        
        return { success: true, formId: form.id };
    }
    
    /**
     * Send form field
     */
    async sendFormField(chatId, form, fieldIndex) {
        if (fieldIndex >= form.fields.length) {
            return await this.completeForm(chatId, form);
        }
        
        const field = form.fields[fieldIndex];
        let message = `📝 **${form.title}** (${fieldIndex + 1}/${form.fields.length})\n\n`;
        message += `**${field.label}**\n`;
        
        if (field.description) {
            message += `${field.description}\n\n`;
        }
        
        // Add field-specific instructions
        switch (field.type) {
            case 'text':
                message += `✏️ Please enter your text:`;
                break;
            case 'number':
                message += `🔢 Please enter a number:`;
                break;
            case 'email':
                message += `📧 Please enter your email:`;
                break;
            case 'phone':
                message += `📱 Please enter your phone number:`;
                break;
            case 'choice':
                message += `**Choose one:**\n`;
                field.options.forEach((option, i) => {
                    message += `${i + 1}. ${option}\n`;
                });
                break;
            case 'multiple':
                message += `**Choose multiple (separate with commas):**\n`;
                field.options.forEach((option, i) => {
                    message += `${i + 1}. ${option}\n`;
                });
                break;
        }
        
        if (field.required) {
            message += `\n_*Required field_`;
        }
        
        await this.client.socket.sendMessage(chatId, { text: message });
        
        return { success: true, field: fieldIndex };
    }
    
    /**
     * Process form response
     */
    async processFormResponse(chatId, userInput) {
        const activeFormId = this.client.storage.read.from("ui").get(`activeForm.${chatId}`);
        if (!activeFormId) return null;
        
        const form = this.client.storage.read.from("ui").get(`forms.${activeFormId}`);
        if (!form || form.status !== 'active') return null;
        
        const currentField = form.fields[form.currentField];
        let processedValue = userInput;
        
        // Validate and process based on field type
        switch (currentField.type) {
            case 'number':
                processedValue = parseFloat(userInput);
                if (isNaN(processedValue)) {
                    await this.client.socket.sendMessage(chatId, { 
                        text: '❌ Please enter a valid number.' 
                    });
                    return { success: false, retry: true };
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(userInput)) {
                    await this.client.socket.sendMessage(chatId, { 
                        text: '❌ Please enter a valid email address.' 
                    });
                    return { success: false, retry: true };
                }
                break;
                
            case 'choice':
                const choiceIndex = parseInt(userInput) - 1;
                if (choiceIndex < 0 || choiceIndex >= currentField.options.length) {
                    await this.client.socket.sendMessage(chatId, { 
                        text: '❌ Please select a valid option number.' 
                    });
                    return { success: false, retry: true };
                }
                processedValue = currentField.options[choiceIndex];
                break;
                
            case 'multiple':
                const selectedIndices = userInput.split(',').map(s => parseInt(s.trim()) - 1);
                const validSelections = selectedIndices.filter(i => 
                    i >= 0 && i < currentField.options.length
                );
                if (validSelections.length === 0) {
                    await this.client.socket.sendMessage(chatId, { 
                        text: '❌ Please select valid option numbers.' 
                    });
                    return { success: false, retry: true };
                }
                processedValue = validSelections.map(i => currentField.options[i]);
                break;
        }
        
        // Store response
        form.responses[currentField.name] = processedValue;
        form.currentField++;
        
        // Update form
        this.client.storage.write.in("ui").set(`forms.${activeFormId}`, form);
        
        // Send next field or complete form
        if (form.currentField < form.fields.length) {
            await this.sendFormField(chatId, form, form.currentField);
            return { success: true, nextField: form.currentField };
        } else {
            return await this.completeForm(chatId, form);
        }
    }
    
    /**
     * Complete form
     */
    async completeForm(chatId, form) {
        form.status = 'completed';
        form.completed = Date.now();
        
        // Update form
        this.client.storage.write.in("ui").set(`forms.${form.id}`, form);
        this.client.storage.delete.from("ui").key(`activeForm.${chatId}`);
        
        // Send completion message
        let completionMessage = `✅ **Form Completed: ${form.title}**\n\n`;
        completionMessage += `**Your Responses:**\n`;
        
        Object.entries(form.responses).forEach(([fieldName, value]) => {
            const field = form.fields.find(f => f.name === fieldName);
            completionMessage += `**${field.label}:** ${Array.isArray(value) ? value.join(', ') : value}\n`;
        });
        
        completionMessage += `\n_Form ID: ${form.id}_\n`;
        completionMessage += `_Submitted: ${new Date().toLocaleString()}_`;
        
        await this.client.socket.sendMessage(chatId, { text: completionMessage });
        
        // Emit form completion event
        this.client.emit('form_completed', {
            formId: form.id,
            chatId: chatId,
            responses: form.responses,
            form: form
        });
        
        return { success: true, formId: form.id, responses: form.responses };
    }
    
    // ===== PROGRESS INDICATORS =====
    
    /**
     * Send progress bar
     */
    async sendProgressBar(chatId, current, total, title = "Progress") {
        const percentage = Math.round((current / total) * 100);
        const filledBars = Math.round((current / total) * 10);
        const emptyBars = 10 - filledBars;
        
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
        
        const message = `📊 **${title}**\n\n` +
                       `${progressBar} ${percentage}%\n` +
                       `${current} / ${total}`;
        
        await this.client.socket.sendMessage(chatId, { text: message });
        
        return { success: true, percentage, current, total };
    }
    
    /**
     * Send loading animation with proper cleanup
     */
    async sendLoadingAnimation(chatId, text = "Loading", duration = 3000) {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let frameIndex = 0;
        let interval = null;
        let isActive = true;
        
        try {
            const message = await this.client.socket.sendMessage(chatId, { 
                text: `${frames[frameIndex]} ${text}...` 
            });
            
            // Sichere Interval-Verwaltung mit Cleanup
            interval = setInterval(async () => {
                if (!isActive) {
                    clearInterval(interval);
                    return;
                }
                
                frameIndex = (frameIndex + 1) % frames.length;
                try {
                    await this.client.socket.sendMessage(chatId, {
                        text: `${frames[frameIndex]} ${text}...`,
                        edit: message.key
                    });
                } catch (error) {
                    // Editing not supported, send new message
                    try {
                        await this.client.socket.sendMessage(chatId, { 
                            text: `${frames[frameIndex]} ${text}...` 
                        });
                    } catch (sendError) {
                        // Stop animation on send error
                        isActive = false;
                        clearInterval(interval);
                    }
                }
            }, 200);
            
            // Garantierte Bereinigung nach Timeout
            const cleanup = () => {
                isActive = false;
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
            };
            
            // Timeout mit garantierter Bereinigung
            const timeoutId = setTimeout(cleanup, duration || 3000);
            
            // Cleanup-Funktion für externe Verwendung
            return {
                success: true,
                duration,
                stop: () => {
                    clearTimeout(timeoutId);
                    cleanup();
                }
            };
            
        } catch (error) {
            // Bereinigung bei Fehler
            isActive = false;
            if (interval) {
                clearInterval(interval);
            }
            
            console.error('❌ Loading animation error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ===== UTILITY METHODS =====
    
    /**
     * Get UI statistics
     */
    getUIStats() {
        const forms = this.client.storage.read.from("ui").get("forms") || {};
        const menus = this.client.storage.read.from("ui").get("persistentMenu") || {};
        const quickReplies = this.client.storage.read.from("ui").get("quickReplies") || {};
        
        return {
            forms: {
                total: Object.keys(forms).length,
                completed: Object.values(forms).filter(f => f.status === 'completed').length,
                active: Object.values(forms).filter(f => f.status === 'active').length
            },
            menus: {
                total: Object.keys(menus).length,
                active: Object.values(menus).filter(m => m.active).length
            },
            quickReplies: {
                active: Object.keys(quickReplies).length
            }
        };
    }
    
    /**
     * Clean up expired UI elements
     */
    cleanupExpiredElements() {
        const now = Date.now();
        
        // Clean up expired quick replies
        const quickReplies = this.client.storage.read.from("ui").get("quickReplies") || {};
        Object.entries(quickReplies).forEach(([chatId, data]) => {
            if (now > data.expires) {
                this.client.storage.delete.from("ui").key(`quickReplies.${chatId}`);
            }
        });
        
        // Clean up old forms (older than 24 hours)
        const forms = this.client.storage.read.from("ui").get("forms") || {};
        Object.entries(forms).forEach(([formId, form]) => {
            if (now - form.created > 24 * 60 * 60 * 1000) {
                this.client.storage.delete.from("ui").key(`forms.${formId}`);
            }
        });
        
        return { success: true, cleaned: true };
    }
}