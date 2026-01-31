import { WhatsAppClient } from "./client.js";
import fs from "fs";
import path from "path";

export class DeviceManager {
    constructor(options = {}) {
        this.devices = new Map();
        this.activeDevices = new Set();
        this.config = {
            maxDevices: options.maxDevices || 3,
            loadBalancing: options.loadBalancing || 'round-robin', // round-robin, random, failover
            syncEvents: options.syncEvents !== false, // Default: true
            ...options
        };
        
        this.currentDeviceIndex = 0;
        this.eventHandlers = new Map();
        
        console.log(`🔧 DeviceManager initialisiert (Max: ${this.config.maxDevices} Devices)`);
    }

    // ===== DEVICE MANAGEMENT =====
    
    async addDevice(deviceId, options = {}) {
        if (this.devices.has(deviceId)) {
            throw new Error(`❌ Device '${deviceId}' existiert bereits!`);
        }
        
        if (this.devices.size >= this.config.maxDevices) {
            throw new Error(`❌ Maximum von ${this.config.maxDevices} Devices erreicht!`);
        }

        // Device-spezifische Auth-Directory
        const authDir = `./auth/${deviceId}`;
        this.ensureAuthDir(authDir);

        // Device-spezifische Browser-Konfiguration
        const deviceOptions = {
            authDir: authDir,
            browser: [`Bot-${deviceId}`, "1.0.0", ""],
            logLevel: "silent",
            deviceId: deviceId,
            ...options
        };

        const client = new WhatsAppClient(deviceOptions);
        
        // Event-Forwarding einrichten
        this.setupDeviceEvents(client, deviceId);
        
        this.devices.set(deviceId, {
            client: client,
            id: deviceId,
            status: 'disconnected',
            lastUsed: null,
            messageCount: 0,
            errors: 0,
            options: deviceOptions
        });

        console.log(`✅ Device '${deviceId}' hinzugefügt`);
        return client;
    }

    async removeDevice(deviceId) {
        if (!this.devices.has(deviceId)) {
            throw new Error(`❌ Device '${deviceId}' nicht gefunden!`);
        }

        const device = this.devices.get(deviceId);
        
        // Device disconnecten falls verbunden
        if (device.status === 'connected') {
            await device.client.disconnect();
        }
        
        this.devices.delete(deviceId);
        this.activeDevices.delete(deviceId);
        
        console.log(`🗑️ Device '${deviceId}' entfernt`);
    }

    // ===== CONNECTION MANAGEMENT =====
    
    async connectDevice(deviceId) {
        if (!this.devices.has(deviceId)) {
            throw new Error(`❌ Device '${deviceId}' nicht gefunden!`);
        }

        const device = this.devices.get(deviceId);
        
        if (device.status === 'connected') {
            console.log(`✅ Device '${deviceId}' bereits verbunden`);
            return device.client;
        }

        try {
            console.log(`🔄 Verbinde Device '${deviceId}'...`);
            device.status = 'connecting';
            
            await device.client.connect();
            
            device.status = 'connected';
            this.activeDevices.add(deviceId);
            
            console.log(`✅ Device '${deviceId}' erfolgreich verbunden!`);
            this.emit('device.connected', { deviceId, device });
            
            return device.client;
        } catch (error) {
            device.status = 'error';
            device.errors++;
            console.error(`❌ Fehler beim Verbinden von Device '${deviceId}':`, error.message);
            this.emit('device.error', { deviceId, error });
            throw error;
        }
    }

    async connectAll() {
        console.log(`🚀 Verbinde alle ${this.devices.size} Devices...`);
        
        const promises = Array.from(this.devices.keys()).map(deviceId => 
            this.connectDevice(deviceId).catch(error => {
                console.error(`❌ Device '${deviceId}' Verbindung fehlgeschlagen:`, error.message);
                return null;
            })
        );

        const results = await Promise.allSettled(promises);
        const connected = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ ${connected}/${this.devices.size} Devices erfolgreich verbunden`);
        
        if (connected === 0) {
            throw new Error("❌ Keine Devices konnten verbunden werden!");
        }
        
        return connected;
    }

    async disconnectDevice(deviceId) {
        if (!this.devices.has(deviceId)) return;

        const device = this.devices.get(deviceId);
        
        if (device.status === 'connected') {
            await device.client.disconnect();
        }
        
        device.status = 'disconnected';
        this.activeDevices.delete(deviceId);
        
        console.log(`🔴 Device '${deviceId}' getrennt`);
        this.emit('device.disconnected', { deviceId });
    }

    async disconnectAll() {
        console.log("🔴 Trenne alle Devices...");
        
        const promises = Array.from(this.activeDevices).map(deviceId => 
            this.disconnectDevice(deviceId)
        );
        
        await Promise.all(promises);
        console.log("✅ Alle Devices getrennt");
    }

    // ===== LOAD BALANCING =====
    
    getNextDevice() {
        const activeDeviceIds = Array.from(this.activeDevices);
        
        if (activeDeviceIds.length === 0) {
            throw new Error("❌ Keine aktiven Devices verfügbar!");
        }

        let selectedDeviceId;
        
        switch (this.config.loadBalancing) {
            case 'round-robin':
                selectedDeviceId = activeDeviceIds[this.currentDeviceIndex % activeDeviceIds.length];
                this.currentDeviceIndex++;
                break;
                
            case 'random':
                selectedDeviceId = activeDeviceIds[Math.floor(Math.random() * activeDeviceIds.length)];
                break;
                
            case 'least-used':
                selectedDeviceId = activeDeviceIds.reduce((least, current) => {
                    const leastDevice = this.devices.get(least);
                    const currentDevice = this.devices.get(current);
                    return currentDevice.messageCount < leastDevice.messageCount ? current : least;
                });
                break;
                
            default:
                selectedDeviceId = activeDeviceIds[0];
        }

        const device = this.devices.get(selectedDeviceId);
        device.lastUsed = Date.now();
        device.messageCount++;
        
        return device.client;
    }

    getDevice(deviceId) {
        if (!this.devices.has(deviceId)) {
            throw new Error(`❌ Device '${deviceId}' nicht gefunden!`);
        }
        
        const device = this.devices.get(deviceId);
        
        if (device.status !== 'connected') {
            throw new Error(`❌ Device '${deviceId}' ist nicht verbunden!`);
        }
        
        return device.client;
    }

    // ===== BROADCAST SYSTEM =====
    
    get broadcast() {
        return {
            // Message an alle aktiven Devices senden
            sendMessage: async (chatId, content, options = {}) => {
                const results = [];
                
                for (const deviceId of this.activeDevices) {
                    try {
                        const client = this.getDevice(deviceId);
                        const result = await client.socket.sendMessage(chatId, content, options);
                        results.push({ deviceId, success: true, result });
                    } catch (error) {
                        results.push({ deviceId, success: false, error: error.message });
                        console.error(`❌ Broadcast Fehler Device '${deviceId}':`, error.message);
                    }
                }
                
                return results;
            },

            // Command an alle Devices weiterleiten
            executeCommand: async (command, ...args) => {
                const results = [];
                
                for (const deviceId of this.activeDevices) {
                    try {
                        const client = this.getDevice(deviceId);
                        if (typeof client[command] === 'function') {
                            const result = await client[command](...args);
                            results.push({ deviceId, success: true, result });
                        }
                    } catch (error) {
                        results.push({ deviceId, success: false, error: error.message });
                    }
                }
                
                return results;
            }
        };
    }

    // ===== SMART ROUTING =====
    
    async smartSend(chatId, content, options = {}) {
        const strategy = options.strategy || 'load-balance';
        
        switch (strategy) {
            case 'load-balance':
                const client = this.getNextDevice();
                return await client.socket.sendMessage(chatId, content, options);
                
            case 'broadcast':
                return await this.broadcast.sendMessage(chatId, content, options);
                
            case 'failover':
                return await this.sendWithFailover(chatId, content, options);
                
            default:
                throw new Error(`❌ Unbekannte Strategy: ${strategy}`);
        }
    }

    async sendWithFailover(chatId, content, options = {}) {
        const deviceIds = Array.from(this.activeDevices);
        
        for (const deviceId of deviceIds) {
            try {
                const client = this.getDevice(deviceId);
                return await client.socket.sendMessage(chatId, content, options);
            } catch (error) {
                console.warn(`⚠️ Failover: Device '${deviceId}' fehlgeschlagen, versuche nächstes...`);
                
                // Device als fehlerhaft markieren
                const device = this.devices.get(deviceId);
                device.errors++;
                
                if (device.errors >= 3) {
                    console.warn(`🚨 Device '${deviceId}' hat zu viele Fehler, entferne aus aktiven Devices`);
                    this.activeDevices.delete(deviceId);
                    device.status = 'error';
                }
            }
        }
        
        throw new Error("❌ Alle Devices fehlgeschlagen!");
    }

    // ===== EVENT SYSTEM =====
    
    setupDeviceEvents(client, deviceId) {
        // Message Events weiterleiten
        client.on('message', (msg) => {
            if (this.config.syncEvents) {
                this.emit('message', { ...msg, deviceId });
            }
        });

        // Connection Events
        client.on('connected', () => {
            this.emit('device.connected', { deviceId });
        });

        client.on('disconnected', (data) => {
            this.activeDevices.delete(deviceId);
            const device = this.devices.get(deviceId);
            if (device) device.status = 'disconnected';
            
            this.emit('device.disconnected', { deviceId, ...data });
        });
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
        return this;
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`❌ Event Handler Fehler '${event}':`, error);
                }
            });
        }
    }

    // ===== STATUS & STATISTICS =====
    
    getStatus() {
        const devices = Array.from(this.devices.entries()).map(([id, device]) => ({
            id,
            status: device.status,
            messageCount: device.messageCount,
            errors: device.errors,
            lastUsed: device.lastUsed
        }));

        return {
            totalDevices: this.devices.size,
            activeDevices: this.activeDevices.size,
            loadBalancing: this.config.loadBalancing,
            devices
        };
    }

    getHealthCheck() {
        const status = this.getStatus();
        const healthyDevices = status.devices.filter(d => d.status === 'connected').length;
        
        return {
            healthy: healthyDevices > 0,
            healthyDevices,
            totalDevices: status.totalDevices,
            healthPercentage: Math.round((healthyDevices / status.totalDevices) * 100),
            recommendation: healthyDevices === 0 ? 'Alle Devices reconnecten' : 
                           healthyDevices < status.totalDevices ? 'Einige Devices prüfen' : 'Alles OK'
        };
    }

    // ===== UTILITY =====
    
    ensureAuthDir(authDir) {
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
            console.log(`📁 Auth-Directory erstellt: ${authDir}`);
        }
    }

    async cleanup() {
        console.log("🧹 DeviceManager Cleanup...");
        await this.disconnectAll();
        this.devices.clear();
        this.activeDevices.clear();
        this.eventHandlers.clear();
    }
}