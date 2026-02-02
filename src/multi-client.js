import { DeviceManager } from "./device-manager.js";
import { Message } from "./message.js";
import { ConsoleLogger } from "./console-logger.js";

export class MultiWhatsAppClient {
    constructor(options = {}) {
        // Console Logger initialisieren
        this.logger = new ConsoleLogger({
            verbose: options.verbose || false,
            silent: options.silent || false
        });
        
        this.deviceManager = new DeviceManager({
            maxDevices: options.maxDevices || 3,
            loadBalancing: options.loadBalancing || 'round-robin',
            syncEvents: options.syncEvents !== false,
            
            // ROBUSTE CONNECTION DEFAULTS - NEU!
            maxReconnectAttempts: options.maxReconnectAttempts || 100,
            reconnectInterval: options.reconnectInterval || 2000,
            exponentialBackoff: options.exponentialBackoff !== false,
            maxBackoffDelay: options.maxBackoffDelay || 30000,
            heartbeatInterval: options.heartbeatInterval || 20000,
            connectionTimeout: options.connectionTimeout || 180000,
            keepAlive: options.keepAlive !== false,
            quietHeartbeat: options.quietHeartbeat !== false, // Heartbeat-Spam deaktivieren
            ...options
        });
        
        this.eventHandlers = new Map();
        this.prefix = null;
        this.commands = new Map();
        
        // Device Manager Events weiterleiten
        this.setupDeviceManagerEvents();
        
        // Schöne Console Ausgabe statt Spam
        this.logger.showBanner();
        this.logger.info("Multi-Device Bot wird initialisiert...");
    }

    // ===== DEVICE MANAGEMENT =====
    
    async addDevice(deviceId, options = {}) {
        const client = await this.deviceManager.addDevice(deviceId, options);
        
        // Command System für jedes Device einrichten
        if (this.prefix) {
            client.setPrefix(this.prefix);
        }
        
        // Commands zu jedem Device hinzufügen
        for (const [command, handler] of this.commands) {
            client.addCommand(command, handler);
        }
        
        return client;
    }

    async removeDevice(deviceId) {
        return await this.deviceManager.removeDevice(deviceId);
    }

    // ===== CONNECTION MANAGEMENT =====
    
    async connect(deviceIds = null) {
        if (deviceIds) {
            // Spezifische Devices sequenziell verbinden
            return await this.connectDevicesSequentially(deviceIds);
        } else {
            // Alle Devices sequenziell verbinden
            const allDeviceIds = Array.from(this.deviceManager.devices.keys());
            return await this.connectDevicesSequentially(allDeviceIds);
        }
    }

    // NEUE SEQUENZIELLE VERBINDUNG - Ein QR nach dem anderen!
    async connectDevicesSequentially(deviceIds) {
        // Schöne Setup Animation
        await this.logger.animateSetup();
        
        const results = [];
        let connectedCount = 0;
        
        for (let i = 0; i < deviceIds.length; i++) {
            const deviceId = deviceIds[i];
            
            try {
                // QR-Code Animation
                await this.logger.animateQRGeneration(deviceId, i + 1, deviceIds.length);
                
                // Verbinde ein Device und warte bis es fertig ist
                const client = await this.deviceManager.connectDevice(deviceId);
                
                // Connection Animation - Device sollte authentifiziert sein nach connectDevice
                await this.logger.animateConnection(deviceId, true);
                
                connectedCount++;
                results.push({ deviceId, status: 'connected', client });
                
                // Kurze Pause zwischen Devices
                if (i < deviceIds.length - 1) {
                    await this.logger.showDevicePause(3);
                }
                
            } catch (error) {
                this.logger.error(`Device '${deviceId}' Verbindung fehlgeschlagen: ${error.message}`);
                results.push({ deviceId, status: 'failed', error: error.message });
                
                // Frage ob weiter machen
                this.logger.warning("Soll mit dem nächsten Device fortgefahren werden? (Automatisch ja in 5s)");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        // Finale schöne Zusammenfassung
        const connectedDeviceNames = results
            .filter(r => r.status === 'connected')
            .map(r => r.deviceId);
            
        this.logger.showFinalSummary(connectedDeviceNames);
        
        if (connectedCount === 0) {
            throw new Error("❌ Keine Devices konnten verbunden werden!");
        }
        
        return results;
    }

    async disconnect(deviceIds = null) {
        if (deviceIds) {
            const promises = deviceIds.map(id => this.deviceManager.disconnectDevice(id));
            return await Promise.all(promises);
        } else {
            return await this.deviceManager.disconnectAll();
        }
    }

    // ===== MESSAGING SYSTEM =====
    
    async sendMessage(chatId, content, options = {}) {
        const strategy = options.strategy || 'load-balance';
        return await this.deviceManager.smartSend(chatId, content, { ...options, strategy });
    }

    async broadcast(chatId, content, options = {}) {
        return await this.deviceManager.broadcast.sendMessage(chatId, content, options);
    }

    async sendWithFailover(chatId, content, options = {}) {
        return await this.deviceManager.sendWithFailover(chatId, content, options);
    }

    // Spezifisches Device verwenden
    async sendFromDevice(deviceId, chatId, content, options = {}) {
        const client = this.deviceManager.getDevice(deviceId);
        return await client.socket.sendMessage(chatId, content, options);
    }

    // ===== COMMAND SYSTEM =====
    
    setPrefix(prefix) {
        this.prefix = prefix;
        
        // Prefix für alle existierenden Devices setzen
        for (const [deviceId, deviceData] of this.deviceManager.devices) {
            if (deviceData.client) {
                deviceData.client.setPrefix(prefix);
            }
        }
        
        console.log(`🎯 Multi-Device Prefix gesetzt: "${prefix}"`);
        return this;
    }

    addCommand(command, handler) {
        this.commands.set(command.toLowerCase(), handler);
        
        // Command für alle existierenden Devices hinzufügen
        for (const [deviceId, deviceData] of this.deviceManager.devices) {
            if (deviceData.client) {
                deviceData.client.addCommand(command, handler);
            }
        }
        
        console.log(`⚡ Multi-Device Command registriert: ${this.prefix || ''}${command}`);
        return this;
    }

    removeCommand(command) {
        this.commands.delete(command.toLowerCase());
        
        // Command von allen Devices entfernen
        for (const [deviceId, deviceData] of this.deviceManager.devices) {
            if (deviceData.client) {
                deviceData.client.removeCommand(command);
            }
        }
        
        console.log(`🗑️ Multi-Device Command entfernt: ${command}`);
        return this;
    }

    getCommands() {
        return Array.from(this.commands.keys());
    }

    // ===== EVENT SYSTEM =====
    
    setupDeviceManagerEvents() {
        // Message Events von allen Devices sammeln
        this.deviceManager.on('message', (data) => {
            const { deviceId, ...messageData } = data;
            
            // Message Object erweitern mit Device-Info
            const enhancedMessage = {
                ...messageData,
                deviceId,
                multiDevice: true,
                
                // Multi-Device Reply Funktionen
                replyFromSameDevice: async (content, options = {}) => {
                    const client = this.deviceManager.getDevice(deviceId);
                    const msg = new Message(client, messageData);
                    return await msg.reply(content, options);
                },
                
                replyFromAnyDevice: async (content, options = {}) => {
                    return await this.sendMessage(messageData.from, { text: content }, options);
                },
                
                broadcastReply: async (content, options = {}) => {
                    return await this.broadcast(messageData.from, { text: content }, options);
                }
            };
            
            this.emit('message', enhancedMessage);
        });

        // Device Events weiterleiten
        this.deviceManager.on('device.connected', (data) => {
            this.emit('device.connected', data);
        });

        this.deviceManager.on('device.disconnected', (data) => {
            this.emit('device.disconnected', data);
        });

        this.deviceManager.on('device.error', (data) => {
            this.emit('device.error', data);
        });
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
        return this;
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
        return this;
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`❌ Multi-Client Event Handler Fehler '${event}':`, error);
                }
            });
        }
    }

    // ===== PRESENCE SYSTEM =====
    
    async setPresence(presence, chatId = null, deviceId = null) {
        if (deviceId) {
            // Spezifisches Device
            const client = this.deviceManager.getDevice(deviceId);
            return await client.setPresence(presence, chatId);
        } else {
            // Alle aktiven Devices
            const results = [];
            for (const activeDeviceId of this.deviceManager.activeDevices) {
                try {
                    const client = this.deviceManager.getDevice(activeDeviceId);
                    const result = await client.setPresence(presence, chatId);
                    results.push({ deviceId: activeDeviceId, success: result });
                } catch (error) {
                    results.push({ deviceId: activeDeviceId, success: false, error: error.message });
                }
            }
            return results;
        }
    }

    async setOnline(deviceId = null) {
        return await this.setPresence('available', null, deviceId);
    }

    async setOffline(deviceId = null) {
        return await this.setPresence('unavailable', null, deviceId);
    }

    async setTyping(chatId, deviceId = null) {
        return await this.setPresence('composing', chatId, deviceId);
    }

    // ===== GROUP MANAGEMENT =====
    
    get group() {
        return {
            // Group-Aktionen mit Load Balancing
            add: async (groupId, users, mentions = [], deviceId = null) => {
                const client = deviceId ? 
                    this.deviceManager.getDevice(deviceId) : 
                    this.deviceManager.getNextDevice();
                
                return await client.add.user(groupId, users, mentions);
            },

            kick: async (groupId, users, mentions = [], deviceId = null) => {
                const client = deviceId ? 
                    this.deviceManager.getDevice(deviceId) : 
                    this.deviceManager.getNextDevice();
                
                return await client.kick.user(groupId, users, mentions);
            },

            promote: async (groupId, users, mentions = [], deviceId = null) => {
                const client = deviceId ? 
                    this.deviceManager.getDevice(deviceId) : 
                    this.deviceManager.getNextDevice();
                
                return await client.promote.user(groupId, users, mentions);
            },

            demote: async (groupId, users, mentions = [], deviceId = null) => {
                const client = deviceId ? 
                    this.deviceManager.getDevice(deviceId) : 
                    this.deviceManager.getNextDevice();
                
                return await client.demote.user(groupId, users, mentions);
            },

            getMetadata: async (groupId, deviceId = null) => {
                const client = deviceId ? 
                    this.deviceManager.getDevice(deviceId) : 
                    this.deviceManager.getNextDevice();
                
                return await client.get.GroupMetadata(groupId);
            }
        };
    }

    // ===== STATUS & MONITORING =====
    
    getStatus() {
        return this.deviceManager.getStatus();
    }

    getHealthCheck() {
        return this.deviceManager.getHealthCheck();
    }

    getDeviceStats() {
        const status = this.getStatus();
        
        return {
            ...status,
            loadBalancingStrategy: this.deviceManager.config.loadBalancing,
            totalCommands: this.commands.size,
            prefix: this.prefix,
            uptime: process.uptime()
        };
    }

    // ===== UTILITY =====
    
    getDevice(deviceId) {
        return this.deviceManager.getDevice(deviceId);
    }

    getActiveDevices() {
        return Array.from(this.deviceManager.activeDevices);
    }

    getNextDevice() {
        return this.deviceManager.getNextDevice();
    }

    async cleanup() {
        console.log("🧹 MultiWhatsAppClient Cleanup...");
        await this.deviceManager.cleanup();
        this.eventHandlers.clear();
        this.commands.clear();
    }

    // ===== ADVANCED FEATURES =====
    
    // Device-spezifische Konfiguration
    async configureDevice(deviceId, config) {
        const device = this.deviceManager.devices.get(deviceId);
        if (!device) {
            throw new Error(`❌ Device '${deviceId}' nicht gefunden!`);
        }
        
        Object.assign(device.options, config);
        console.log(`⚙️ Device '${deviceId}' konfiguriert:`, config);
    }

    // Load Balancing Strategy ändern
    setLoadBalancingStrategy(strategy) {
        this.deviceManager.config.loadBalancing = strategy;
        console.log(`⚖️ Load Balancing Strategy geändert: ${strategy}`);
    }

    // Device Rotation für gleichmäßige Nutzung
    async rotateDevices() {
        const devices = Array.from(this.deviceManager.activeDevices);
        if (devices.length < 2) return;
        
        // Erstes Device temporär deaktivieren
        const firstDevice = devices[0];
        this.deviceManager.activeDevices.delete(firstDevice);
        
        // Nach 30 Sekunden wieder aktivieren
        setTimeout(() => {
            this.deviceManager.activeDevices.add(firstDevice);
            console.log(`🔄 Device '${firstDevice}' wieder aktiviert`);
        }, 30000);
        
        console.log(`🔄 Device Rotation: '${firstDevice}' temporär deaktiviert`);
    }
}