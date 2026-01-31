// Groups-Klasse mit deinen eigenen Funktionen

export class Groups {
    constructor(client) {
        this.client = client;
    }

    // ===== GET FUNCTIONS =====
    
    async GroupMetadata(groupId) {
        if (!this.client.isConnected) {
            throw new Error('Not connected to WhatsApp');
        }

        return await this.client.socket.groupMetadata(groupId);
    }

    async GroupParticipants(groupId) {
        const metadata = await this.GroupMetadata(groupId);
        return metadata.participants;
    }

    async GroupAdmins(groupId) {
        const participants = await this.GroupParticipants(groupId);
        return participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
    }

    async GroupOwner(groupId) {
        const participants = await this.GroupParticipants(groupId);
        return participants.find(p => p.admin === 'superadmin');
    }

    // ===== ADD FUNCTIONS =====
    
    async user(groupId, users, mentions = []) {
        if (!this.client.isConnected) {
            throw new Error('Not connected to WhatsApp');
        }

        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'add');
        
        // Optional: Willkommensnachricht mit Mentions
        if (mentions.length > 0) {
            const welcomeText = `Willkommen in der Gruppe! ${mentions.map(id => `@${id.split('@')[0]}`).join(' ')}`;
            await this.client.socket.sendMessage(groupId, {
                text: welcomeText,
                mentions: mentions
            });
        }

        return result;
    }

    // ===== KICK FUNCTIONS =====
    
    async user(groupId, users, mentions = []) {
        if (!this.client.isConnected) {
            throw new Error('Not connected to WhatsApp');
        }

        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'remove');
        
        // Optional: Nachricht mit Mentions
        if (mentions.length > 0) {
            const kickText = `${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} wurde(n) aus der Gruppe entfernt.`;
            await this.client.socket.sendMessage(groupId, {
                text: kickText,
                mentions: mentions
            });
        }

        return result;
    }

    // ===== PROMOTE FUNCTIONS =====
    
    async user(groupId, users, mentions = []) {
        if (!this.client.isConnected) {
            throw new Error('Not connected to WhatsApp');
        }

        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'promote');
        
        // Optional: Nachricht mit Mentions
        if (mentions.length > 0) {
            const promoteText = `🎉 ${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} wurde(n) zum Admin befördert!`;
            await this.client.socket.sendMessage(groupId, {
                text: promoteText,
                mentions: mentions
            });
        }

        return result;
    }

    // ===== DEMOTE FUNCTIONS =====
    
    async user(groupId, users, mentions = []) {
        if (!this.client.isConnected) {
            throw new Error('Not connected to WhatsApp');
        }

        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'demote');
        
        // Optional: Nachricht mit Mentions
        if (mentions.length > 0) {
            const demoteText = `${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} ist nicht mehr Admin.`;
            await this.client.socket.sendMessage(groupId, {
                text: demoteText,
                mentions: mentions
            });
        }

        return result;
    }

    // ===== GROUP SETTINGS =====
    
    async updateName(groupId, name) {
        return await this.client.socket.groupUpdateSubject(groupId, name);
    }

    async updateDescription(groupId, description) {
        return await this.client.socket.groupUpdateDescription(groupId, description);
    }

    async updatePicture(groupId, imagePath) {
        return await this.client.socket.updateProfilePicture(groupId, { url: imagePath });
    }

    async leave(groupId) {
        return await this.client.socket.groupLeave(groupId);
    }

    // ===== UTILITY FUNCTIONS =====
    
    async isUserAdmin(groupId, userJid) {
        const admins = await this.GroupAdmins(groupId);
        return admins.some(admin => admin.id === userJid);
    }

    async isUserOwner(groupId, userJid) {
        const owner = await this.GroupOwner(groupId);
        return owner?.id === userJid;
    }

    async getUserRole(groupId, userJid) {
        const participants = await this.GroupParticipants(groupId);
        const user = participants.find(p => p.id === userJid);
        
        if (!user) return 'not_member';
        if (user.admin === 'superadmin') return 'owner';
        if (user.admin === 'admin') return 'admin';
        return 'member';
    }
}