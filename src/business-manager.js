import { getStorage } from "./storage.js";

export class BusinessManager {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.profile = null;
        this.products = new Map();
        this.orders = new Map();
        
        // Load existing data
        this.loadBusinessData();
    }
    
    // ===== BUSINESS PROFILE MANAGEMENT =====
    
    /**
     * Set business profile information
     */
    async setProfile(profileData) {
        // Parameter-Validierung
        if (!profileData || typeof profileData !== 'object') {
            throw new Error('profileData muss ein Objekt sein');
        }
        
        const profile = {
            name: profileData.name || "My Business",
            category: profileData.category || "Technology",
            description: profileData.description || "WhatsApp Bot Service",
            website: profileData.website || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            hours: profileData.hours || "24/7",
            logo: profileData.logo || "",
            verified: profileData.verified || false,
            created: new Date(),
            updated: new Date()
        };
        
        this.profile = profile;
        this.storage.write.in("business").set("profile", profile);
        
        return profile;
    }
    
    /**
     * Get business profile
     */
    getProfile() {
        return this.profile || this.storage.read.from("business").get("profile");
    }
    
    /**
     * Update business profile
     */
    async updateProfile(updates) {
        const currentProfile = this.getProfile() || {};
        const updatedProfile = {
            ...currentProfile,
            ...updates,
            updated: new Date()
        };
        
        return await this.setProfile(updatedProfile);
    }
    
    // ===== PRODUCT CATALOG MANAGEMENT =====
    
    /**
     * Create a new product
     */
    async createProduct(productData) {
        const product = {
            id: productData.id || `prod_${Date.now()}`,
            name: productData.name,
            description: productData.description || "",
            price: productData.price || 0,
            currency: productData.currency || "EUR",
            category: productData.category || "General",
            images: productData.images || [],
            inStock: productData.inStock !== false,
            stockCount: productData.stockCount || 0,
            sku: productData.sku || "",
            tags: productData.tags || [],
            created: new Date(),
            updated: new Date()
        };
        
        this.products.set(product.id, product);
        this.storage.write.in("business").set(`products.${product.id}`, product);
        
        return product;
    }
    
    /**
     * Get product by ID
     */
    getProduct(productId) {
        return this.products.get(productId) || 
               this.storage.read.from("business").get(`products.${productId}`);
    }
    
    /**
     * Get all products
     */
    getAllProducts() {
        const storedProducts = this.storage.read.from("business").get("products") || {};
        return Object.values(storedProducts);
    }
    
    /**
     * Update product
     */
    async updateProduct(productId, updates) {
        const product = this.getProduct(productId);
        if (!product) throw new Error(`Product ${productId} not found`);
        
        const updatedProduct = {
            ...product,
            ...updates,
            updated: new Date()
        };
        
        this.products.set(productId, updatedProduct);
        this.storage.write.in("business").set(`products.${productId}`, updatedProduct);
        
        return updatedProduct;
    }
    
    /**
     * Delete product
     */
    async deleteProduct(productId) {
        this.products.delete(productId);
        this.storage.delete.from("business").key(`products.${productId}`);
        return true;
    }
    
    /**
     * Search products
     */
    searchProducts(query, filters = {}) {
        const products = this.getAllProducts();
        
        return products.filter(product => {
            // Text search
            if (query) {
                const searchText = query.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(searchText);
                const matchesDescription = product.description.toLowerCase().includes(searchText);
                const matchesTags = product.tags.some(tag => tag.toLowerCase().includes(searchText));
                
                if (!matchesName && !matchesDescription && !matchesTags) {
                    return false;
                }
            }
            
            // Category filter
            if (filters.category && product.category !== filters.category) {
                return false;
            }
            
            // Price range filter
            if (filters.minPrice && product.price < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice && product.price > filters.maxPrice) {
                return false;
            }
            
            // In stock filter
            if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
                return false;
            }
            
            return true;
        });
    }
    
    // ===== PAYMENT INTEGRATION =====
    
    /**
     * Send payment request
     */
    async sendPaymentRequest(chatId, amount, currency = "EUR", description = "", productId = null) {
        const paymentRequest = {
            id: `pay_${Date.now()}`,
            chatId: chatId,
            amount: amount,
            currency: currency,
            description: description,
            productId: productId,
            status: "pending",
            created: new Date()
        };
        
        // Store payment request
        this.storage.write.in("business").set(`payments.${paymentRequest.id}`, paymentRequest);
        
        // Send payment message (simplified - in real implementation would use WhatsApp Pay)
        const message = `💳 **Zahlungsanfrage**\n\n` +
                       `💰 Betrag: ${amount} ${currency}\n` +
                       `📝 Beschreibung: ${description}\n` +
                       `🆔 Payment ID: ${paymentRequest.id}\n\n` +
                       `Bitte kontaktieren Sie uns für die Zahlung.`;
        
        await this.client.socket.sendMessage(chatId, { text: message });
        
        return paymentRequest;
    }
    
    /**
     * Process payment (webhook simulation)
     */
    async processPayment(paymentId, status = "completed") {
        const payment = this.storage.read.from("business").get(`payments.${paymentId}`);
        if (!payment) throw new Error(`Payment ${paymentId} not found`);
        
        payment.status = status;
        payment.processed = new Date();
        
        this.storage.write.in("business").set(`payments.${paymentId}`, payment);
        
        // Notify customer
        const message = status === "completed" 
            ? `✅ Zahlung erfolgreich! Payment ID: ${paymentId}`
            : `❌ Zahlung fehlgeschlagen. Payment ID: ${paymentId}`;
            
        await this.client.socket.sendMessage(payment.chatId, { text: message });
        
        return payment;
    }
    
    // ===== ORDER MANAGEMENT =====
    
    /**
     * Create order
     */
    async createOrder(chatId, items, customerInfo = {}) {
        const order = {
            id: `order_${Date.now()}`,
            chatId: chatId,
            items: items, // [{ productId, quantity, price }]
            customerInfo: customerInfo,
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: "pending",
            created: new Date(),
            updated: new Date()
        };
        
        this.orders.set(order.id, order);
        this.storage.write.in("business").set(`orders.${order.id}`, order);
        
        return order;
    }
    
    /**
     * Get order
     */
    getOrder(orderId) {
        return this.orders.get(orderId) || 
               this.storage.read.from("business").get(`orders.${orderId}`);
    }
    
    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status) {
        const order = this.getOrder(orderId);
        if (!order) throw new Error(`Order ${orderId} not found`);
        
        order.status = status;
        order.updated = new Date();
        
        this.orders.set(orderId, order);
        this.storage.write.in("business").set(`orders.${orderId}`, order);
        
        // Notify customer
        const statusMessages = {
            confirmed: "✅ Bestellung bestätigt",
            processing: "⚙️ Bestellung wird bearbeitet",
            shipped: "🚚 Bestellung versendet",
            delivered: "📦 Bestellung zugestellt",
            cancelled: "❌ Bestellung storniert"
        };
        
        const message = `📋 **Bestellstatus Update**\n\n` +
                       `🆔 Bestellung: ${orderId}\n` +
                       `📊 Status: ${statusMessages[status] || status}`;
        
        await this.client.socket.sendMessage(order.chatId, { text: message });
        
        return order;
    }
    
    // ===== BUSINESS ANALYTICS =====
    
    /**
     * Get business statistics
     */
    getBusinessStats() {
        const products = this.getAllProducts();
        const orders = Object.values(this.storage.read.from("business").get("orders") || {});
        const payments = Object.values(this.storage.read.from("business").get("payments") || {});
        
        return {
            products: {
                total: products.length,
                inStock: products.filter(p => p.inStock).length,
                categories: [...new Set(products.map(p => p.category))].length
            },
            orders: {
                total: orders.length,
                pending: orders.filter(o => o.status === "pending").length,
                completed: orders.filter(o => o.status === "delivered").length,
                totalRevenue: orders
                    .filter(o => o.status === "delivered")
                    .reduce((sum, o) => sum + o.total, 0)
            },
            payments: {
                total: payments.length,
                completed: payments.filter(p => p.status === "completed").length,
                pending: payments.filter(p => p.status === "pending").length,
                totalAmount: payments
                    .filter(p => p.status === "completed")
                    .reduce((sum, p) => sum + p.amount, 0)
            }
        };
    }
    
    // ===== HELPER METHODS =====
    
    /**
     * Load business data from storage
     */
    loadBusinessData() {
        this.profile = this.storage.read.from("business").get("profile");
        
        const products = this.storage.read.from("business").get("products") || {};
        Object.entries(products).forEach(([id, product]) => {
            this.products.set(id, product);
        });
        
        const orders = this.storage.read.from("business").get("orders") || {};
        Object.entries(orders).forEach(([id, order]) => {
            this.orders.set(id, order);
        });
    }
    
    /**
     * Export business data
     */
    exportData() {
        return {
            profile: this.profile,
            products: Object.fromEntries(this.products),
            orders: Object.fromEntries(this.orders),
            stats: this.getBusinessStats()
        };
    }
}