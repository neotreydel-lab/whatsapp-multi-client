// 💰 Economy System Plugin
export default class EconomyPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'economy-system';
        this.version = '1.0.0';
        this.description = 'Vollständiges Wirtschaftssystem mit Coins, Shop und Daily Rewards';
    }

    // Coins System
    async getBalance(userId) {
        return this.client.storage.read.from('economy').get(`${userId}.coins`) || 0;
    }

    async addCoins(userId, amount) {
        this.client.storage.write.in('economy').increment(`${userId}.coins`, amount);
        return await this.getBalance(userId);
    }

    async removeCoins(userId, amount) {
        const balance = await this.getBalance(userId);
        if (balance < amount) return false;
        
        this.client.storage.write.in('economy').increment(`${userId}.coins`, -amount);
        return true;
    }

    async transfer(fromId, toId, amount) {
        if (await this.removeCoins(fromId, amount)) {
            await this.addCoins(toId, amount);
            return true;
        }
        return false;
    }

    // Daily System
    async claimDaily(userId) {
        const lastDaily = this.client.storage.read.from('economy').get(`${userId}.lastDaily`) || 0;
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        
        if (now - lastDaily < dayMs) {
            const timeLeft = dayMs - (now - lastDaily);
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            return { success: false, timeLeft: `${hours}h ${minutes}m` };
        }
        
        const reward = Math.floor(Math.random() * 500) + 100; // 100-600 Coins
        await this.addCoins(userId, reward);
        this.client.storage.write.in('economy').set(`${userId}.lastDaily`, now);
        
        return { success: true, reward };
    }

    // Shop System
    getShopItems() {
        return [
            { id: 'vip', name: '👑 VIP Status', price: 5000, description: 'VIP Rang für 30 Tage' },
            { id: 'boost', name: '⚡ XP Boost', price: 1000, description: '2x XP für 24h' },
            { id: 'title', name: '🏆 Custom Title', price: 2500, description: 'Eigener Titel' },
            { id: 'color', name: '🎨 Name Color', price: 1500, description: 'Farbiger Name' }
        ];
    }

    async buyItem(userId, itemId) {
        const items = this.getShopItems();
        const item = items.find(i => i.id === itemId);
        
        if (!item) return { success: false, error: 'Item nicht gefunden' };
        
        if (await this.removeCoins(userId, item.price)) {
            this.client.storage.write.in('economy').push(`${userId}.inventory`, {
                id: item.id,
                name: item.name,
                boughtAt: Date.now()
            });
            
            return { success: true, item };
        }
        
        return { success: false, error: 'Nicht genug Coins' };
    }
    getCommands() {
        return {
            'balance': this.handleBalance.bind(this),
            'daily': this.handleDaily.bind(this),
            'transfer': this.handleTransfer.bind(this),
            'shop': this.handleShop.bind(this),
            'buy': this.handleBuy.bind(this),
            'inventory': this.handleInventory.bind(this),
            'leaderboard': this.handleLeaderboard.bind(this),
            'work': this.handleWork.bind(this)
        };
    }

    // Command Handlers
    async handleBalance(msg, args) {
        const userId = msg.getSender();
        const balance = await this.getBalance(userId);
        
        await msg.reply(`💰 **Dein Kontostand:**\n\n💎 ${balance.toLocaleString()} Coins`);
    }

    async handleDaily(msg, args) {
        const userId = msg.getSender();
        const result = await this.claimDaily(userId);
        
        if (result.success) {
            await msg.reply(`🎁 **Daily Reward erhalten!**\n\n💎 +${result.reward} Coins\n💰 Neuer Kontostand: ${(await this.getBalance(userId)).toLocaleString()}`);
        } else {
            await msg.reply(`⏰ **Daily bereits abgeholt!**\n\n⏳ Nächste Daily in: ${result.timeLeft}`);
        }
    }

    async handleTransfer(msg, args) {
        if (!msg.isGroup) return msg.reply('❌ Transfer nur in Gruppen möglich!');
        
        const mentions = msg.getMentions();
        if (mentions.length === 0 || args.length < 2) {
            return msg.reply('❌ Verwendung: !transfer @user <amount>');
        }
        
        const fromId = msg.getSender();
        const toId = mentions[0];
        const amount = parseInt(args[1]);
        
        if (isNaN(amount) || amount <= 0) {
            return msg.reply('❌ Ungültiger Betrag!');
        }
        
        if (fromId === toId) {
            return msg.reply('❌ Du kannst dir nicht selbst Coins senden!');
        }
        
        if (await this.transfer(fromId, toId, amount)) {
            await msg.reply(`✅ **Transfer erfolgreich!**\n\n💸 ${amount} Coins an @${toId.split('@')[0]} gesendet`, [toId]);
        } else {
            await msg.reply('❌ Nicht genug Coins für den Transfer!');
        }
    }

    async handleShop(msg, args) {
        const items = this.getShopItems();
        let shopText = '🛒 **Economy Shop**\n\n';
        
        items.forEach((item, index) => {
            shopText += `${index + 1}. ${item.name}\n💎 ${item.price.toLocaleString()} Coins\n📝 ${item.description}\n\n`;
        });
        
        shopText += '💡 Kaufe mit: !buy <item-id>';
        await msg.reply(shopText);
    }

    async handleBuy(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !buy <item-id>\n\n💡 Siehe !shop für verfügbare Items');
        }
        
        const userId = msg.getSender();
        const itemId = args[0].toLowerCase();
        const result = await this.buyItem(userId, itemId);
        
        if (result.success) {
            await msg.reply(`✅ **Kauf erfolgreich!**\n\n🛍️ ${result.item.name} gekauft\n💎 -${result.item.price} Coins`);
        } else {
            await msg.reply(`❌ **Kauf fehlgeschlagen!**\n\n⚠️ ${result.error}`);
        }
    }

    async handleInventory(msg, args) {
        const userId = msg.getSender();
        const inventory = this.client.storage.read.from('economy').get(`${userId}.inventory`) || [];
        
        if (inventory.length === 0) {
            return msg.reply('📦 **Dein Inventar ist leer!**\n\n🛒 Besuche den !shop um Items zu kaufen');
        }
        
        let invText = '📦 **Dein Inventar:**\n\n';
        inventory.forEach((item, index) => {
            invText += `${index + 1}. ${item.name}\n📅 Gekauft: ${new Date(item.boughtAt).toLocaleDateString()}\n\n`;
        });
        
        await msg.reply(invText);
    }

    async handleLeaderboard(msg, args) {
        const economyData = this.client.storage.read.from('economy').all() || {};
        const leaderboard = [];
        
        Object.entries(economyData).forEach(([userId, data]) => {
            if (data.coins && data.coins > 0) {
                leaderboard.push({ userId, coins: data.coins });
            }
        });
        
        leaderboard.sort((a, b) => b.coins - a.coins);
        const top10 = leaderboard.slice(0, 10);
        
        let lbText = '🏆 **Coins Leaderboard**\n\n';
        top10.forEach((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            lbText += `${medal} @${entry.userId.split('@')[0]}\n💎 ${entry.coins.toLocaleString()} Coins\n\n`;
        });
        
        await msg.reply(lbText);
    }

    async handleWork(msg, args) {
        const userId = msg.getSender();
        const lastWork = this.client.storage.read.from('economy').get(`${userId}.lastWork`) || 0;
        const now = Date.now();
        const cooldown = 60 * 60 * 1000; // 1 Stunde
        
        if (now - lastWork < cooldown) {
            const timeLeft = cooldown - (now - lastWork);
            const minutes = Math.floor(timeLeft / (60 * 1000));
            return msg.reply(`⏰ **Arbeit Cooldown!**\n\n⏳ Noch ${minutes} Minuten warten`);
        }
        
        const jobs = [
            { name: '🍕 Pizza liefern', min: 50, max: 150 },
            { name: '🚗 Taxi fahren', min: 80, max: 200 },
            { name: '💻 Programmieren', min: 100, max: 300 },
            { name: '🎨 Design erstellen', min: 75, max: 250 },
            { name: '📦 Pakete sortieren', min: 40, max: 120 }
        ];
        
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const earnings = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
        
        await this.addCoins(userId, earnings);
        this.client.storage.write.in('economy').set(`${userId}.lastWork`, now);
        
        await msg.reply(`💼 **Arbeit erledigt!**\n\n${job.name}\n💎 +${earnings} Coins verdient\n💰 Neuer Kontostand: ${(await this.getBalance(userId)).toLocaleString()}`);
    }
}