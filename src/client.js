import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, isJidBroadcast } from "@whiskeysockets/baileys";
import pino from "pino";
import { generateQRCode, closeBrowser } from "./qr.js";
import { Message } from "./message.js";
import { SessionManager } from "./session-manager.js";
import { PrefixManager } from "./prefix-manager.js";
import { getStorage } from "./storage.js";
import { AIIntegration } from "./ai-integration.js";
import { HTTPClient } from "./http-client.js";
import { Scheduler } from "./scheduler.js";
import { PluginManager } from "./plugin-manager-fixed.js";
import { AdvancedGroup, AdvancedPrivacy, AdvancedAnalytics, AdvancedStatus, AdvancedBusiness, AdvancedSystem } from "./advanced-features.js";
import { ConsoleLogger } from "./console-logger.js";
import { ErrorHandler } from "./error-handler.js";
import { BusinessManager } from "./business-manager.js";
import { AnalyticsManager } from "./analytics-manager.js";
import { UIComponents } from "./ui-components.js";

export class WhatsAppClient {
    constructor(options = {}) {
        // SCHÖNE CONSOLE LOGGER - IMMER AKTIV!
        this.logger = new ConsoleLogger({
            verbose: options.verbose || false,
            silent: options.silent || false
        });
        
        // ERROR HANDLER SYSTEM - IMMER AKTIV MIT DEINER EMAIL!
        this.errorHandler = new ErrorHandler({
            supportEmail: "Liaia@outlook.de", // DEINE EMAIL - IMMER ANGEZEIGT
            supportDiscord: "https://discord.gg/waengine",
            supportGitHub: "https://github.com/neotreydel-lab/waengine/issues",
            showSupportInfo: true, // IMMER Support-Info anzeigen
            logErrors: true,       // IMMER Fehler loggen
            sendErrorReports: false,
            // User kann nur zusätzliche Kontakte hinzufügen, nicht deine ersetzen
            ...options.errorHandler
        });
        
        this.options = {
            authDir: "./auth",
            printQR: true,  // Terminal QR als Standard (einfacher)
            browser: options.browser || ["Chrome", "121.0.0", ""], // Aktueller Chrome
            logLevel: options.logLevel || "silent", // Sauber ohne Debug
            autoCleanup: options.autoCleanup !== false, // Auto-Cleanup bei Logout
            autoRestart: options.autoRestart !== false, // Auto-Restart nach Logout
            restartDelay: options.restartDelay || 5000, // 5 Sekunden Wartezeit
            
            // SINGLE DEVICE MODE - NEU! (Multi-Device nur bei expliziter Aktivierung)
            singleDeviceMode: options.singleDeviceMode !== false, // Single Device als Standard
            disableMultiDevice: options.disableMultiDevice !== false, // Multi-Device deaktiviert
            
            // QR-SPAM PREVENTION - VERBESSERT!
            qrSpamPrevention: options.qrSpamPrevention !== false, // Anti-Spam aktiviert
            qrDisplayInterval: options.qrDisplayInterval || 30000, // 30 Sekunden zwischen QR-Anzeigen
            qrMaxDisplays: options.qrMaxDisplays || 1, // NUR 1 QR-Anzeige im Terminal (Standard)
            clearTerminalOnQR: options.clearTerminalOnQR !== false, // Terminal bei QR leeren
            
            // ROBUSTE CONNECTION SETTINGS - NEU!
            maxReconnectAttempts: options.maxReconnectAttempts || 50, // Viele Versuche
            reconnectInterval: options.reconnectInterval || 3000, // 3 Sekunden zwischen Versuchen
            exponentialBackoff: options.exponentialBackoff !== false, // Exponential backoff
            maxBackoffDelay: options.maxBackoffDelay || 60000, // Max 1 Minute Wartezeit
            heartbeatInterval: options.heartbeatInterval || 30000, // 30 Sekunden Heartbeat
            connectionTimeout: options.connectionTimeout || 120000, // 2 Minuten Timeout (war 60s)
            keepAlive: options.keepAlive !== false, // Keep-Alive aktiviert
            quietHeartbeat: options.quietHeartbeat !== false, // Heartbeat-Logging deaktivieren
            ...options
        };
        
        // SCHÖNER BANNER FÜR ALLE USER!
        this.logger.showBanner();
        
        // Clean initialization
        this.socket = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
        
        // ROBUSTE CONNECTION TRACKING - NEU!
        this.reconnectAttempts = 0;
        this.lastConnectionTime = null;
        this.heartbeatTimer = null;
        this.connectionWatchdog = null;
        this.isReconnecting = false;
        this.hasShownAuthSuccess = false; // Verhindere mehrfache Success-Messages
        this.connectionHealth = {
            lastPing: null,
            pingCount: 0,
            failedPings: 0,
            avgResponseTime: 0
        };
        
        // Session Manager
        this.sessionManager = new SessionManager(this.options.authDir);
        
        // Prefix System (erweitert für gruppen-spezifische Prefixes)
        this.prefix = null; // Global fallback
        this.prefixManager = new PrefixManager('./data');
        this.commands = new Map();
        
        // Storage System
        this.storage = getStorage();
        
        // AI Integration
        this.ai = new AIIntegration(options.ai || {});
        
        // HTTP Client
        this.http = new HTTPClient(options.http || {});
        
        // Scheduler System
        this.scheduler = new Scheduler(this);
        
        // Waiting System für Messages
        this.waiting = this.scheduler.createWaiting();
        
        // Plugin System
        this.plugins = new PluginManager(this);
        
        // NEW ADVANCED SYSTEMS - v1.8.0!
        this.business = new BusinessManager(this);
        this.analyticsManager = new AnalyticsManager(this);  // Umbenennen um Konflikt zu vermeiden
        this.ui = new UIComponents(this);
        
        // Offline Message Ignore System - NEU!
        this.ignoreOfflineMessages = false;
        this.lastOnlineTimestamp = Date.now();
        this.connectionStartTime = null;
        this.ignoredMessagesCount = 0; // Counter für ignorierte Messages
        this.offlineMessageTimer = null; // Timer für finale Zusammenfassung
        
        // Load API für Plugins
        this.load = {
            Plugins: async (pluginName) => {
                if (pluginName === 'all') {
                    console.log('🔌 Lade alle Plugins...');
                    await this.plugins.loadAllPlugins();
                    console.log('✅ Alle Plugins geladen!');
                } else {
                    console.log(`🔌 Lade Plugin: ${pluginName}`);
                    await this.plugins.load(pluginName);
                }
            }
        };
        
        // Ignore API für Offline Messages - DEINE COOLE API!
        this.ignore = {
            message: {
                offline: (enabled = true) => {
                    this.ignoreOfflineMessages = enabled;
                    console.log(`📵 Offline Message Ignore: ${enabled ? 'AKTIVIERT' : 'DEAKTIVIERT'}`);
                    return this;
                }
            }
        };
        
        // Deine eigenen API-Objekte
        this.get = new GetAPI(this);
        this.add = new AddAPI(this);
        this.kick = new KickAPI(this);
        this.promote = new PromoteAPI(this);
        this.demote = new DemoteAPI(this);

        // ===== ADVANCED FEATURES INTEGRATION - NEU! =====
        this.advancedGroup = new AdvancedGroup(this);
        this.advancedPrivacy = new AdvancedPrivacy(this);
        this.advancedAnalytics = new AdvancedAnalytics(this);
        this.advancedStatus = new AdvancedStatus(this);
        this.advancedBusiness = new AdvancedBusiness(this);
        this.advancedSystem = new AdvancedSystem(this);

        // Convenience Methods für Advanced Features
        this.group = {
            setSettings: this.advancedGroup.setGroupSettings.bind(this.advancedGroup),
            setDescription: this.advancedGroup.setGroupDescription.bind(this.advancedGroup),
            setSubject: this.advancedGroup.setGroupSubject.bind(this.advancedGroup),
            getInviteLink: this.advancedGroup.getGroupInviteLink.bind(this.advancedGroup),
            revokeInviteLink: this.advancedGroup.revokeGroupInviteLink.bind(this.advancedGroup),
            join: this.advancedGroup.joinGroupViaLink.bind(this.advancedGroup),
            leave: this.advancedGroup.leaveGroup.bind(this.advancedGroup),
            updatePicture: this.advancedGroup.updateGroupPicture.bind(this.advancedGroup)
        };

        this.privacy = {
            block: this.advancedPrivacy.blockUser.bind(this.advancedPrivacy),
            unblock: this.advancedPrivacy.unblockUser.bind(this.advancedPrivacy),
            setSettings: this.advancedPrivacy.setPrivacySettings.bind(this.advancedPrivacy),
            markRead: this.advancedPrivacy.markAsRead.bind(this.advancedPrivacy),
            markUnread: this.advancedPrivacy.markAsUnread.bind(this.advancedPrivacy)
        };

        this.analytics = {
            getDeliveryStatus: this.advancedAnalytics.getDeliveryStatus.bind(this.advancedAnalytics),
            isOnline: this.advancedAnalytics.isUserOnline.bind(this.advancedAnalytics),
            getLastSeen: this.advancedAnalytics.getLastSeen.bind(this.advancedAnalytics),
            archiveChat: this.advancedAnalytics.archiveChat.bind(this.advancedAnalytics),
            unarchiveChat: this.advancedAnalytics.unarchiveChat.bind(this.advancedAnalytics),
            muteChat: this.advancedAnalytics.muteChat.bind(this.advancedAnalytics),
            unmuteChat: this.advancedAnalytics.unmuteChat.bind(this.advancedAnalytics)
        };

        this.status = {
            send: this.advancedStatus.sendStatusUpdate.bind(this.advancedStatus),
            getViews: this.advancedStatus.getStatusViews.bind(this.advancedStatus),
            getUserStatus: this.advancedStatus.getUserStatus.bind(this.advancedStatus)
        };

        this.business = {
            setProfile: this.advancedBusiness.setBusinessProfile.bind(this.advancedBusiness),
            sendProduct: this.advancedBusiness.sendProductMessage.bind(this.advancedBusiness),
            createProduct: this.advancedBusiness.createProduct.bind(this.advancedBusiness),
            requestPayment: this.advancedBusiness.sendPaymentRequest.bind(this.advancedBusiness)
        };

        this.system = {
            backup: this.advancedSystem.createBackup.bind(this.advancedSystem),
            restore: this.advancedSystem.restoreFromBackup.bind(this.advancedSystem),
            exportChat: this.advancedSystem.exportChat.bind(this.advancedSystem),
            importContacts: this.advancedSystem.importContacts.bind(this.advancedSystem),
            sync: this.advancedSystem.syncWithPhone.bind(this.advancedSystem),
            getDevices: this.advancedSystem.getLinkedDevices.bind(this.advancedSystem),
            unlinkDevice: this.advancedSystem.unlinkDevice.bind(this.advancedSystem)
        };
    }

    // ===== CONNECTION METHODS =====
    
    async connect() {
        if (this.socket && this.isConnected) {
            return this.socket;
        }

        // Reset Auth Success Flag für neue Verbindung
        this.hasShownAuthSuccess = false;

        // SCHNELLE SETUP ANIMATION - PARALLEL STATT SEQUENZIELL!
        const setupPromise = this.logger.animateSetup();

        // Session-Validierung und Auto-Repair mit robuster Windows-Behandlung
        await this.sessionManager.ensureAuthDir();
        const sessionValidation = await this.sessionManager.validateSession();
        
        // WICHTIGER SESSION-CHECK für QR-Code Prevention
        const hasValidSession = sessionValidation.valid && sessionValidation.userId;
        
        if (hasValidSession) {
            this.logger.success(`✅ Gültige Session gefunden (User: ${sessionValidation.userId})`);
            this.logger.info("🔄 Verbinde direkt ohne QR-Code...");
        } else {
            this.logger.info("📱 Keine gültige Session - QR-Code wird benötigt");
        }
        
        if (!sessionValidation.valid) {
            this.logger.warning(`⚠️ Session-Status: ${sessionValidation.reason}`);
            
            // Erweiterte Session-Reparatur mit besserer Fehlerbehandlung
            if (['corrupted_creds', 'empty_creds', 'incomplete_creds', 'corrupted', 'validation_error'].includes(sessionValidation.reason)) {
                this.logger.info("🔧 Repariere korrupte Session...");
                
                try {
                    const repairResult = await this.sessionManager.autoRepairSession();
                    
                    if (repairResult.repaired) {
                        this.logger.success(`✅ Session repariert: ${repairResult.action}`);
                        
                        // Nach erfolgreicher Reparatur kurz warten
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        this.logger.warning(`⚠️ Session-Reparatur fehlgeschlagen: ${repairResult.reason || 'Unbekannt'}`);
                        
                        // Fallback: Smart Cleanup
                        this.logger.info("🧹 Versuche intelligente Bereinigung...");
                        const cleanupResult = await this.sessionManager.smartCleanup();
                        
                        if (cleanupResult.cleaned) {
                            this.logger.success("✅ Session bereinigt - neuer QR-Code wird generiert");
                        }
                    }
                } catch (repairError) {
                    this.logger.error(`❌ Session-Reparatur Fehler: ${repairError.message}`);
                    this.logger.info("🔄 Fahre mit neuer Session fort...");
                }
            }
        }

        const { state, saveCreds } = await useMultiFileAuthState(this.options.authDir);
        const isLoggedIn = !!state.creds?.me?.id;

        // WICHTIG: Session-Check BEVOR QR-Code angezeigt wird
        if (isLoggedIn) {
            this.logger.success(`✅ Bestehende Session gefunden - überspringe QR-Code`);
            this.logger.info("🔄 Verbinde direkt mit bestehender Session...");
        } else {
            this.logger.info("📱 Keine Session gefunden - QR-Code wird benötigt");
        }
        
        // Session-Status für QR-Check speichern
        this.hasExistingSession = isLoggedIn;

        // Fetch latest Baileys version for compatibility
        try {
            const { version, isLatest } = await fetchLatestBaileysVersion();
            
            this.socket = makeWASocket({
                version,
                auth: state,
                logger: pino({ level: this.options.logLevel }),
                browser: this.options.browser,
                generateHighQualityLinkPreview: true,
                syncFullHistory: true, // Wichtig für Message-Empfang
                markOnlineOnConnect: true,
                getMessage: async (key) => {
                    // Wichtig für Message-Handling
                    return { conversation: "Message not found" };
                },
                shouldIgnoreJid: jid => isJidBroadcast(jid),
                // Bessere Message-Synchronisation
                emitOwnEvents: true,
                fireInitQueries: true,
                shouldSyncHistoryMessage: msg => {
                    return !!msg.message && !msg.key.fromMe;
                }
            });
        } catch (versionError) {
            this.socket = makeWASocket({
                auth: state,
                logger: pino({ level: this.options.logLevel }),
                browser: this.options.browser,
                generateHighQualityLinkPreview: true,
                syncFullHistory: true, // Wichtig für Message-Empfang
                markOnlineOnConnect: true,
                getMessage: async (key) => {
                    // Wichtig für Message-Handling
                    return { conversation: "Message not found" };
                },
                shouldIgnoreJid: jid => isJidBroadcast(jid),
                // Bessere Message-Synchronisation
                emitOwnEvents: true,
                fireInitQueries: true,
                shouldSyncHistoryMessage: msg => {
                    return !!msg.message && !msg.key.fromMe;
                }
            });
        }

        // Setup Animation abwarten (läuft parallel)
        await setupPromise;

        // QR-Code Browser NICHT automatisch öffnen - nur bei expliziter Anfrage
        // if (!this.options.printQR && !isLoggedIn) {
        //     await generateQRCode();
        // }

        return new Promise((resolve, reject) => {
            // Event-Handler SOFORT registrieren, nicht erst bei "open"
            this.setupEventHandlers();
            
            this.socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
                if (qr) {
                    // WICHTIGER CHECK: Nur QR-Code anzeigen wenn KEINE Session existiert
                    if (this.hasExistingSession) {
                        console.log("✅ Session bereits vorhanden - überspringe QR-Code");
                        return; // KEIN QR-Code bei bestehender Session!
                    }
                    
                    // SINGLE QR-CODE DISPLAY - NUR BEI NEUER SESSION!
                    console.clear();
                    console.log("\n" + "=".repeat(50));
                    console.log("📱 WAEngine QR-Code - Einmal scannen und fertig!");
                    console.log("=".repeat(50));
                    
                    // Terminal-Größe prüfen
                    const terminalWidth = process.stdout.columns || 80;
                    const terminalHeight = process.stdout.rows || 24;
                    console.log(`🖥️ Terminal: ${terminalWidth}x${terminalHeight}`);
                    
                    if (terminalWidth < 60) {
                        console.log("⚠️ Terminal zu schmal - verwende extra kleinen QR!");
                    }
                    
                    console.log("");
                    
                    // QR-Code IMMER KLEIN anzeigen (wegen "zu groß" Problem)
                    try {
                        const qrcode = await import("qrcode-terminal");
                        // IMMER small: true verwenden - auch bei großen Terminals
                        qrcode.default.generate(qr, { small: true });
                    } catch (error) {
                        console.log("❌ QR-Terminal Fehler:", error.message);
                        console.log("📱 QR-Data für externe App:");
                        console.log(qr);
                    }
                    
                    console.log("");
                    console.log("=".repeat(50));
                    console.log("📲 WhatsApp Anleitung:");
                    console.log("1. WhatsApp öffnen");
                    console.log("2. Einstellungen → Verknüpfte Geräte");
                    console.log("3. Gerät verknüpfen → QR scannen");
                    console.log("=".repeat(50));
                    console.log("⏳ Warte auf QR-Scan...");
                    console.log("");
                    
                    // Browser QR nur wenn explizit gewünscht (nicht automatisch)
                    if (!this.options.printQR && this.options.enableBrowserQR) {
                        await generateQRCode(qr, { skipBrowser: false });
                    }
                    
                    // QR Event emittieren für externe Handler
                    this.emit('qr', qr);
                }
                
                if (connection === "connecting") {
                    // Nur Status-Info, KEINE Animation bei connecting (zu früh!)
                    if (!this.hasExistingSession) {
                        console.log("🔄 Verbindung wird hergestellt...");
                    } else {
                        console.log("🔄 Verbinde mit bestehender Session...");
                    }
                }
                
                if (connection === "close") {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    // Cleanup timers
                    this.stopHeartbeat();
                    this.stopConnectionWatchdog();
                    
                    if (shouldReconnect) {
                        console.log(`🔄 Verbindung verloren (Code: ${statusCode}) - Starte robuste Wiederverbindung...`);
                        this.isConnected = false;
                        this.socket = null;
                        
                        // Robuste Wiederverbindung mit exponential backoff
                        this.startRobustReconnection(resolve, reject);
                    } else {
                        console.log("👋 Ausgeloggt - bereinige Session...");
                        this.isConnected = false;
                        this.socket = null;
                        this.reconnectAttempts = 0;
                        
                        // Auto-Cleanup bei Logout
                        if (this.options.autoCleanup) {
                            await this.sessionManager.cleanupSession();
                            console.log("🧹 Session automatisch bereinigt");
                        }
                        
                        await closeBrowser();
                        this.emit('disconnected', { reason: 'logged_out', cleaned: this.options.autoCleanup });
                        
                        // Auto-Restart Feature mit robuster Logik
                        if (this.options.autoRestart) {
                            console.log(`🔄 Auto-Restart in ${this.options.restartDelay / 1000} Sekunden...`);
                            console.log("📱 Neuer QR-Code wird generiert...");
                            
                            setTimeout(async () => {
                                await this.startRobustRestart(resolve, reject);
                            }, this.options.restartDelay);
                            
                            // Nicht rejecten bei Auto-Restart
                            resolve(this);
                        } else {
                            reject(new Error('Logged out'));
                        }
                    }
                } else if (connection === "open") {
                    // ROBUSTE SESSION-VALIDIERUNG: Prüfe ECHTE Authentifizierung!
                    const isAuthenticated = !!state.creds?.me?.id;
                    
                    if (!isAuthenticated) {
                        // Socket ist offen, aber KEINE Authentifizierung - warte auf QR-Scan
                        console.log("🔌 Socket verbunden - warte auf Authentifizierung...");
                        
                        // Prüfe ob auth-Ordner existiert
                        const authExists = this.sessionManager.hasAuthFolder();
                        if (!authExists) {
                            console.log("📁 Kein Auth-Ordner gefunden - neue Session wird erstellt");
                            console.log("📱 Bereit für QR-Code Scan...");
                        } else {
                            console.log("📁 Auth-Ordner existiert - prüfe Credentials...");
                        }
                        
                        // Zeige Socket-Status aber KEINE Success-Messages oder Animations
                        this.logger.showDeviceConnected('main-bot', false);
                        this.logger.showFinalSummary(['main-bot'], false);
                        
                        // KEINE Success-Messages bei nicht-authentifizierter Verbindung!
                        return;
                    }
                    
                    // NUR BEI ECHTER AUTHENTIFIZIERUNG: Success Messages!
                    // ABER: Animation und Summary werden jetzt im creds.update Handler gemacht
                    this.logger.success("WhatsApp erfolgreich authentifiziert!");
                    this.isConnected = true;
                    this.lastConnectionTime = Date.now();
                    this.reconnectAttempts = 0; // Reset counter bei erfolgreicher Verbindung
                    
                    // Connection Start Time für Offline Message Ignore setzen
                    this.connectionStartTime = Date.now();
                    if (this.ignoreOfflineMessages) {
                        this.logger.info(`Offline Messages werden ignoriert (seit ${new Date(this.connectionStartTime).toLocaleString()})`);
                    }
                    
                    await closeBrowser(); // QR Browser schließen
                    
                    // ROBUSTE CONNECTION FEATURES - NEU!
                    this.startHeartbeat(); // Heartbeat starten
                    this.startConnectionWatchdog(); // Connection Watchdog starten
                    
                    // Animation und Summary werden im creds.update Handler gemacht!
                    this.emit('connected');
                    
                    // 🔌 Plugins werden NICHT automatisch geladen
                    // Verwende client.load.Plugins("plugin-name") um Plugins zu laden
                    
                    resolve(this);
                }
            });

            this.socket.ev.on("creds.update", async (creds) => {
                await saveCreds();
                
                // WICHTIG: Prüfe ob User jetzt authentifiziert ist (QR-Code gescannt)
                if (creds?.me?.id && this.isConnected && !this.hasShownAuthSuccess) {
                    this.hasShownAuthSuccess = true; // Verhindere mehrfache Success-Messages
                    
                    console.log("🎉 QR-Code erfolgreich gescannt!");
                    console.log(`👤 Authentifiziert als: ${creds.me.id}`);
                    
                    // JETZT erst die Connection Animation - nach echter Authentifizierung!
                    await this.logger.animateConnection('main-bot', true);
                    
                    // Jetzt erst die echten Success-Messages zeigen
                    this.logger.success("WhatsApp erfolgreich authentifiziert!");
                    this.logger.showFinalSummary(['main-bot'], true);
                    this.emit('truly_connected', { userId: creds.me.id });
                }
            });
            
            // ROBUSTES TIMEOUT SYSTEM - NEU!
            setTimeout(() => {
                if (!this.isConnected) {
                    console.log(`⏰ Verbindungs-Timeout nach ${this.options.connectionTimeout / 1000} Sekunden`);
                    console.log("🔄 Starte robuste Wiederverbindung...");
                    
                    // Nicht sofort rejecten, sondern robuste Wiederverbindung versuchen
                    this.startRobustReconnection(resolve, reject);
                }
            }, this.options.connectionTimeout); // Längeres Timeout (2 Minuten statt 1)
        });
    }

    async disconnect() {
        console.log("🔌 Trenne Verbindung...");
        
        // Cleanup timers
        this.stopHeartbeat();
        this.stopConnectionWatchdog();
        
        if (this.socket) {
            this.socket.end();
            this.socket = null;
            this.isConnected = false;
            await closeBrowser();
            this.emit('disconnected', { reason: 'manual' });
        }
    }

    // ===== ROBUSTE CONNECTION METHODS - NEU! =====
    
    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
        
        this.heartbeatTimer = setInterval(async () => {
            if (this.isConnected && this.socket) {
                try {
                    const startTime = Date.now();
                    
                    // Ping WhatsApp Server
                    await this.socket.query({
                        tag: 'iq',
                        attrs: { type: 'get', xmlns: 'w:p', id: 'ping' + Date.now() },
                        content: [{ tag: 'ping' }]
                    });
                    
                    const responseTime = Date.now() - startTime;
                    this.connectionHealth.lastPing = Date.now();
                    this.connectionHealth.pingCount++;
                    this.connectionHealth.avgResponseTime = 
                        (this.connectionHealth.avgResponseTime + responseTime) / 2;
                    
                    // Nur bei Debug-Modus, langsamen Pings oder wenn quietHeartbeat deaktiviert ist
                    if (!this.options.quietHeartbeat || this.options.logLevel === 'debug' || responseTime > 5000) {
                        console.log(`💓 Heartbeat OK (${responseTime}ms)`);
                    }
                    
                } catch (error) {
                    this.connectionHealth.failedPings++;
                    
                    // Nur bei mehreren Fehlern, Debug-Modus oder wenn quietHeartbeat deaktiviert ist
                    if (!this.options.quietHeartbeat || this.options.logLevel === 'debug' || this.connectionHealth.failedPings >= 2) {
                        console.log(`💔 Heartbeat failed (${this.connectionHealth.failedPings} failures)`);
                    }
                    
                    // Bei 3 fehlgeschlagenen Pings Wiederverbindung
                    if (this.connectionHealth.failedPings >= 3) {
                        console.log("🚨 Verbindung instabil - starte Wiederverbindung...");
                        this.forceReconnect();
                    }
                }
            }
        }, this.options.heartbeatInterval);
    }
    
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    startConnectionWatchdog() {
        if (this.connectionWatchdog) {
            clearInterval(this.connectionWatchdog);
        }
        
        this.connectionWatchdog = setInterval(() => {
            if (this.isConnected) {
                const timeSinceLastPing = Date.now() - (this.connectionHealth.lastPing || 0);
                
                // Wenn länger als 2 Minuten kein Ping, Verbindung prüfen
                if (timeSinceLastPing > 120000) {
                    console.log("🔍 Connection Watchdog: Verbindung prüfen...");
                    this.checkConnectionHealth();
                }
            }
        }, 60000); // Jede Minute prüfen
    }
    
    stopConnectionWatchdog() {
        if (this.connectionWatchdog) {
            clearInterval(this.connectionWatchdog);
            this.connectionWatchdog = null;
        }
    }
    
    async checkConnectionHealth() {
        try {
            if (!this.socket || !this.isConnected) {
                throw new Error("Socket not connected");
            }
            
            // Test-Query senden
            await this.socket.query({
                tag: 'iq',
                attrs: { type: 'get', xmlns: 'w:p', id: 'health' + Date.now() },
                content: [{ tag: 'ping' }]
            });
            
            console.log("✅ Connection Health Check OK");
            this.connectionHealth.failedPings = 0; // Reset failures
            
        } catch (error) {
            this.errorHandler.handleConnectionError(error, this.reconnectAttempts);
            console.log("❌ Connection Health Check failed - starte Wiederverbindung...");
            this.forceReconnect();
        }
    }
    
    async forceReconnect() {
        if (this.isReconnecting) {
            console.log("🔄 Wiederverbindung bereits aktiv...");
            return;
        }
        
        console.log("🔄 Erzwinge Wiederverbindung...");
        this.isReconnecting = true;
        this.isConnected = false;
        
        // Socket schließen
        if (this.socket) {
            try {
                this.socket.end();
            } catch (error) {
                // Ignoriere Fehler beim Schließen
            }
            this.socket = null;
        }
        
        // Robuste Wiederverbindung starten
        setTimeout(async () => {
            try {
                await this.connect();
                console.log("✅ Erzwungene Wiederverbindung erfolgreich!");
            } catch (error) {
                this.errorHandler.handleConnectionError(error, this.reconnectAttempts);
                console.error("❌ Erzwungene Wiederverbindung fehlgeschlagen:", error.message);
                this.startRobustReconnection();
            } finally {
                this.isReconnecting = false;
            }
        }, 2000);
    }
    
    async startRobustReconnection(resolve = null, reject = null) {
        if (this.isReconnecting) {
            console.log("🔄 Robuste Wiederverbindung bereits aktiv...");
            return;
        }
        
        this.isReconnecting = true;
        
        const attemptReconnection = async () => {
            if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
                console.error(`❌ Maximale Wiederverbindungsversuche erreicht (${this.options.maxReconnectAttempts})`);
                this.isReconnecting = false;
                if (reject) reject(new Error('Max reconnection attempts reached'));
                return;
            }
            
            this.reconnectAttempts++;
            
            // Exponential backoff berechnen
            let delay = this.options.reconnectInterval;
            if (this.options.exponentialBackoff) {
                delay = Math.min(
                    this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
                    this.options.maxBackoffDelay
                );
            }
            
            console.log(`🔄 Wiederverbindungsversuch ${this.reconnectAttempts}/${this.options.maxReconnectAttempts} in ${delay / 1000}s...`);
            
            setTimeout(async () => {
                try {
                    await this.connect();
                    console.log(`✅ Robuste Wiederverbindung erfolgreich nach ${this.reconnectAttempts} Versuchen!`);
                    this.isReconnecting = false;
                    if (resolve) resolve(this);
                } catch (error) {
                    this.errorHandler.handleConnectionError(error, this.reconnectAttempts);
                    console.log(`❌ Wiederverbindungsversuch ${this.reconnectAttempts} fehlgeschlagen: ${error.message}`);
                    attemptReconnection(); // Nächster Versuch
                }
            }, delay);
        };
        
        attemptReconnection();
    }
    
    async startRobustRestart(resolve = null, reject = null) {
        const maxRestartAttempts = 5;
        let restartAttempts = 0;
        
        const attemptRestart = async () => {
            if (restartAttempts >= maxRestartAttempts) {
                console.error(`❌ Maximale Restart-Versuche erreicht (${maxRestartAttempts})`);
                if (reject) reject(new Error('Max restart attempts reached'));
                return;
            }
            
            restartAttempts++;
            console.log(`🚀 Restart-Versuch ${restartAttempts}/${maxRestartAttempts}...`);
            
            try {
                await this.connect();
                console.log(`✅ Robuster Restart erfolgreich nach ${restartAttempts} Versuchen!`);
                if (resolve) resolve(this);
            } catch (restartError) {
                console.error(`❌ Restart-Versuch ${restartAttempts} fehlgeschlagen:`, restartError.message);
                
                const delay = 10000 * restartAttempts; // Längere Wartezeit bei jedem Versuch
                console.log(`🔄 Nächster Restart-Versuch in ${delay / 1000} Sekunden...`);
                
                setTimeout(attemptRestart, delay);
            }
        };
        
        attemptRestart();
    }

    // ===== AUTO-RESTART SYSTEM =====
    
    enableAutoRestart(enabled = true, delay = 5000) {
        this.options.autoRestart = enabled;
        this.options.restartDelay = delay;
        console.log(`🔄 Auto-Restart ${enabled ? 'aktiviert' : 'deaktiviert'} (${delay / 1000}s Verzögerung)`);
        return this;
    }

    disableAutoRestart() {
        return this.enableAutoRestart(false);
    }

    setRestartDelay(seconds) {
        this.options.restartDelay = seconds * 1000;
        console.log(`⏰ Auto-Restart Verzögerung: ${seconds} Sekunden`);
        return this;
    }

    // ===== SESSION MANAGEMENT =====
    
    async getSessionStatus() {
        return await this.sessionManager.getSessionStatus();
    }

    async validateSession() {
        return await this.sessionManager.validateSession();
    }

    async cleanupSession() {
        console.log("🧹 Manuelle Session-Bereinigung...");
        const success = await this.sessionManager.cleanupSession();
        if (success) {
            console.log("✅ Session erfolgreich bereinigt");
        }
        return success;
    }

    async repairSession() {
        console.log("🔧 Session-Reparatur...");
        return await this.sessionManager.repairSession();
    }

    async backupSession() {
        return await this.sessionManager.backupSession();
    }

    // Logout mit automatischer Bereinigung
    async logout() {
        if (this.socket) {
            console.log("👋 Logout wird durchgeführt...");
            this.socket.logout();
            
            // Warte kurz und bereinige dann
            setTimeout(async () => {
                if (this.options.autoCleanup) {
                    await this.sessionManager.cleanupSession();
                    console.log("🧹 Session nach Logout bereinigt");
                }
            }, 1000);
        }
    }

    // ===== EVENT SYSTEM =====
    
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
                    this.errorHandler.handleError(error, {
                        action: 'event_handler',
                        event: event,
                        details: `Event '${event}' Handler Fehler`
                    });
                    console.error(`❌ Error in event handler for '${event}':`, error);
                }
            });
        }
    }

    setupEventHandlers() {
        // Messages - Saubere Message-Erkennung ohne Debug-Spam
        this.socket.ev.on("messages.upsert", ({ messages, type }) => {
            // Nur relevante Message-Types verarbeiten
            if (type !== "notify" && type !== "append") return;

            messages.forEach((msg) => {
                // Bessere Message-Validierung
                if (!msg.message || msg.key.fromMe) return;
                
                // OFFLINE MESSAGE IGNORE - DEINE NEUE FUNKTION!
                if (this.ignoreOfflineMessages && this.connectionStartTime) {
                    const messageTimestamp = msg.messageTimestamp * 1000; // Convert to milliseconds
                    
                    // Ignoriere Messages die vor der Verbindung gesendet wurden
                    if (messageTimestamp < this.connectionStartTime) {
                        this.ignoredMessagesCount++;
                        
                        // Nur alle 10 Messages oder bei der ersten Message loggen
                        if (this.ignoredMessagesCount === 1) {
                            console.log(`📵 Offline Messages werden ignoriert...`);
                        } else if (this.ignoredMessagesCount % 10 === 0) {
                            console.log(`📵 ${this.ignoredMessagesCount} Offline Messages ignoriert...`);
                        }
                        
                        // Timer für finale Zusammenfassung zurücksetzen
                        if (this.offlineMessageTimer) {
                            clearTimeout(this.offlineMessageTimer);
                        }
                        
                        // Nach 3 Sekunden ohne neue Offline Messages finale Zusammenfassung
                        this.offlineMessageTimer = setTimeout(() => {
                            if (this.ignoredMessagesCount > 0) {
                                console.log(`✅ Insgesamt ${this.ignoredMessagesCount} Offline Messages ignoriert`);
                                this.ignoredMessagesCount = 0; // Reset counter
                            }
                        }, 3000);
                        
                        return;
                    }
                }
                
                // Ignoriere System-Messages (protocolMessage, etc.)
                if (msg.message.protocolMessage || 
                    msg.message.reactionMessage || 
                    msg.message.ephemeralMessage ||
                    msg.message.viewOnceMessage) {
                    return; // Ignoriere ohne Debug-Output
                }
                
                // Ignoriere Broadcast-Messages
                if (msg.key.remoteJid && isJidBroadcast(msg.key.remoteJid)) return;

                const messageData = this.parseMessage(msg);
                
                // Nur verarbeiten wenn Text vorhanden oder unterstützte Typen
                if (!messageData.text && 
                    !['image', 'video', 'audio', 'document', 'sticker', 'location', 'contact'].includes(messageData.type)) {
                    return; // Ignoriere ohne Debug-Output
                }
                
                // Nur bei echten Nachrichten loggen
                if (messageData.text || messageData.type !== 'unknown') {
                    console.log(`📨 ${messageData.type}: "${messageData.text || '[Media]'}" von ${messageData.from}`);
                }
                
                const messageObj = new Message(this, messageData);
                
                // Prefix System - Command Check (erweitert für Chat-spezifische Prefixes)
                const chatPrefix = this.prefixManager.getPrefix(messageData.from);
                
                if (messageData.text && messageData.text.startsWith(chatPrefix)) {
                    const commandData = this.prefixManager.parseCommand(messageData.text, messageData.from);
                    
                    if (commandData) {
                        console.log(`⚡ Command in ${messageData.from}: ${commandData.prefix}${commandData.command}`);
                        
                        messageObj.isCommand = true;
                        messageObj.command = commandData.command;
                        messageObj.args = commandData.args;
                        messageObj.commandText = commandData.commandText;
                        messageObj.prefix = commandData.prefix;
                        
                        // Command Event emittieren
                        this.emit('command', messageObj);
                        
                        // Spezifischen Command Handler aufrufen falls vorhanden
                        if (this.commands.has(commandData.command)) {
                            const handler = this.commands.get(commandData.command);
                            try {
                                handler(messageObj, commandData.args);
                            } catch (error) {
                                this.errorHandler.handleCommandError(error, commandData.command, messageObj.getSender());
                                console.error(`❌ Fehler in Command '${commandData.command}':`, error);
                            }
                        }
                    }
                } else {
                    messageObj.isCommand = false;
                    messageObj.command = null;
                    messageObj.args = [];
                }
                
                this.emit('message', messageObj);
            });
        });

        // Andere Events ohne Debug-Spam
        this.socket.ev.on("messages.update", (updates) => {
            this.emit('messages.update', updates);
        });

        this.socket.ev.on("presence.update", (update) => {
            this.emit('presence.update', update);
        });

        this.socket.ev.on("group-participants.update", (update) => {
            this.emit('group.participants.update', update);
        });

        this.socket.ev.on("chats.upsert", (chats) => {
            this.emit('chats.upsert', chats);
        });

        this.socket.ev.on("contacts.upsert", (contacts) => {
            this.emit('contacts.upsert', contacts);
        });
    }

    parseMessage(msg) {
        // Erweiterte Text-Extraktion für verschiedene Message-Typen
        let text = null;
        
        if (msg.message.conversation) {
            text = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            text = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage?.caption) {
            text = msg.message.imageMessage.caption;
        } else if (msg.message.videoMessage?.caption) {
            text = msg.message.videoMessage.caption;
        } else if (msg.message.documentMessage?.caption) {
            text = msg.message.documentMessage.caption;
        } else if (msg.message.buttonsResponseMessage?.selectedButtonId) {
            text = msg.message.buttonsResponseMessage.selectedButtonId;
        } else if (msg.message.listResponseMessage?.singleSelectReply?.selectedRowId) {
            text = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
        } else if (msg.message.templateButtonReplyMessage?.selectedId) {
            text = msg.message.templateButtonReplyMessage.selectedId;
        }

        return {
            id: msg.key.id,
            from: msg.key.remoteJid,
            fromMe: msg.key.fromMe,
            text: text,
            timestamp: msg.messageTimestamp,
            type: this.getMessageType(msg.message),
            isGroup: msg.key.remoteJid?.includes("@g.us"),
            participant: msg.key.participant, // Wichtig für Gruppen
            raw: msg
        };
    }

    getMessageType(message) {
        if (message.conversation) return 'text';
        if (message.extendedTextMessage) return 'text';
        if (message.imageMessage) return 'image';
        if (message.videoMessage) return 'video';
        if (message.audioMessage) return 'audio';
        if (message.documentMessage) return 'document';
        if (message.stickerMessage) return 'sticker';
        if (message.locationMessage) return 'location';
        if (message.contactMessage) return 'contact';
        if (message.buttonsResponseMessage) return 'button_response';
        if (message.listResponseMessage) return 'list_response';
        if (message.templateButtonReplyMessage) return 'template_button_reply';
        if (message.pollCreationMessage) return 'poll';
        if (message.pollUpdateMessage) return 'poll_update';
        return 'unknown';
    }

    getConnectionState() {
        return {
            isConnected: this.isConnected,
            socket: !!this.socket
        };
    }

    // ===== PREFIX SYSTEM (ERWEITERT) =====
    
    // Global Prefix (Fallback)
    setPrefix(prefix) {
        this.prefix = prefix;
        this.prefixManager.defaultPrefix = prefix;
        console.log(`🌐 Global Prefix gesetzt: "${prefix}"`);
        return this;
    }

    getPrefix(chatId = null) {
        if (chatId) {
            return this.prefixManager.getPrefix(chatId);
        }
        return this.prefix || this.prefixManager.defaultPrefix;
    }

    // Chat-spezifische Prefixes
    setChatPrefix(chatId, prefix) {
        return this.prefixManager.setPrefix(chatId, prefix);
    }

    getChatPrefix(chatId) {
        return this.prefixManager.getPrefix(chatId);
    }

    removeChatPrefix(chatId) {
        return this.prefixManager.removePrefix(chatId);
    }

    // Prefix Statistics
    getPrefixStats() {
        return this.prefixManager.getStats();
    }

    getAllPrefixes() {
        return this.prefixManager.getAllPrefixes();
    }

    addCommand(command, handler) {
        this.commands.set(command.toLowerCase(), handler);
        return this;
    }

    removeCommand(command) {
        const removed = this.commands.delete(command.toLowerCase());
        return this;
    }

    getCommands() {
        return Array.from(this.commands.keys());
    }

    // ===== PRESENCE SYSTEM =====
    
    async setPresence(presence, chatId = null) {
        try {
            await this.socket.sendPresenceUpdate(presence, chatId);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, {
                action: 'presence_update',
                presence: presence,
                chatId: chatId,
                details: `Presence '${presence}' setzen fehlgeschlagen`
            });
            console.error(`❌ Fehler beim Setzen der Presence '${presence}':`, error);
            return false;
        }
    }

    async setOnline() {
        return await this.setPresence('available');
    }

    async setOffline() {
        return await this.setPresence('unavailable');
    }

    async setTyping(chatId) {
        return await this.setPresence('composing', chatId);
    }

    async setRecording(chatId) {
        return await this.setPresence('recording', chatId);
    }

    async setPaused(chatId) {
        return await this.setPresence('paused', chatId);
    }
}

// ===== DEINE API-KLASSEN =====

class GetAPI {
    constructor(client) {
        this.client = client;
    }

    async GroupMetadata(groupId) {
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

    // ===== PROFILE PICTURE API - NEU! =====
    
    async ProfilePicture(jid) {
        try {
            return await this.client.socket.profilePictureUrl(jid, 'image');
        } catch (error) {
            return null; // Kein Profilbild verfügbar
        }
    }
}

class AddAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'add');
        
        if (mentions.length > 0) {
            const welcomeText = `Willkommen! ${mentions.map(id => `@${id.split('@')[0]}`).join(' ')}`;
            await this.client.socket.sendMessage(groupId, {
                text: welcomeText,
                mentions: mentions
            });
        }

        return result;
    }
}

class KickAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'remove');
        
        if (mentions.length > 0) {
            const kickText = `${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} wurde entfernt.`;
            await this.client.socket.sendMessage(groupId, {
                text: kickText,
                mentions: mentions
            });
        }

        return result;
    }
}

class PromoteAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'promote');
        
        if (mentions.length > 0) {
            const promoteText = `🎉 ${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} ist jetzt Admin!`;
            await this.client.socket.sendMessage(groupId, {
                text: promoteText,
                mentions: mentions
            });
        }

        return result;
    }
}

class DemoteAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'demote');
        
        if (mentions.length > 0) {
            const demoteText = `${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} ist nicht mehr Admin.`;
            await this.client.socket.sendMessage(groupId, {
                text: demoteText,
                mentions: mentions
            });
        }

        return result;
    }

    // ===== HEARTBEAT SYSTEM =====
    
    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
        
        this.heartbeatTimer = setInterval(async () => {
            try {
                if (this.socket && this.socket.ws && this.socket.ws.readyState === 1) {
                    // Sende Ping
                    await this.socket.query({
                        tag: 'iq',
                        attrs: { type: 'get', to: 's.whatsapp.net' },
                        content: [{ tag: 'ping', attrs: {} }]
                    });
                }
            } catch (error) {
                console.log('⚠️ Heartbeat fehlgeschlagen:', error.message);
                if (this.options.autoReconnect) {
                    this.startRobustReconnection();
                }
            }
        }, this.options.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // ===== CLEANUP METHODS =====
    
    async cleanup() {
        try {
            console.log('🧹 Bereinige Client-Ressourcen...');
            
            // Timer stoppen
            this.stopHeartbeat();
            
            // Socket schließen
            if (this.socket) {
                try {
                    await this.socket.logout();
                } catch (logoutError) {
                    // Stille Behandlung
                }
                this.socket = null;
            }
            
            // Event-Listener entfernen
            this.removeAllListeners();
            
            // Flags zurücksetzen
            this.isConnected = false;
            this.isReconnecting = false;
            this.reconnectAttempts = 0;
            
            console.log('✅ Client-Ressourcen bereinigt');
        } catch (error) {
            console.error('❌ Fehler beim Bereinigen:', error);
        }
    }

    // ===== UTILITY METHODS =====
    
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            reconnecting: this.isReconnecting,
            attempts: this.reconnectAttempts,
            userId: this.userId,
            uptime: this.startTime ? Date.now() - this.startTime : 0
        };
    }

    async waitForConnection(timeout = 30000) {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve(this);
                return;
            }
            
            const timeoutId = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, timeout);
            
            const checkConnection = () => {
                if (this.isConnected) {
                    clearTimeout(timeoutId);
                    resolve(this);
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            
            checkConnection();
        });
    }

    // ===== ERROR RECOVERY =====
    
    async recoverFromError(error) {
        console.log('🔧 Versuche Fehler-Recovery...');
        
        try {
            // Session-Probleme
            if (error.message.includes('creds') || error.message.includes('session')) {
                console.log('🔄 Session-Recovery...');
                const repairResult = await this.sessionManager.autoRepairSession();
                if (repairResult.repaired) {
                    return await this.connect();
                }
            }
            
            // Verbindungsprobleme
            if (error.message.includes('connection') || error.message.includes('socket')) {
                console.log('🔄 Verbindungs-Recovery...');
                if (this.options.autoReconnect) {
                    return this.startRobustReconnection();
                }
            }
            
            // QR-Code-Probleme
            if (error.message.includes('qr') || error.message.includes('QR')) {
                console.log('🔄 QR-Code-Recovery...');
                await this.sessionManager.cleanupSession();
                return await this.connect();
            }
            
            throw error; // Unbekannter Fehler
            
        } catch (recoveryError) {
            console.error('❌ Fehler-Recovery fehlgeschlagen:', recoveryError);
            throw recoveryError;
        }
    }

    // ===== GRACEFUL SHUTDOWN =====
    
    async gracefulShutdown() {
        console.log('🛑 Starte graceful shutdown...');
        
        try {
            // Stoppe neue Verbindungen
            this.options.autoReconnect = false;
            this.options.autoRestart = false;
            
            // Bereinige Ressourcen
            await this.cleanup();
            
            console.log('✅ Graceful shutdown abgeschlossen');
        } catch (error) {
            console.error('❌ Fehler beim graceful shutdown:', error);
        }
    }
}

// ===== PROCESS EVENT HANDLERS =====

// Graceful shutdown bei SIGINT/SIGTERM
process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT empfangen - starte graceful shutdown...');
    if (global.waengineClient) {
        await global.waengineClient.gracefulShutdown();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM empfangen - starte graceful shutdown...');
    if (global.waengineClient) {
        await global.waengineClient.gracefulShutdown();
    }
    process.exit(0);
});

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    if (global.waengineClient && global.waengineClient.errorHandler) {
        global.waengineClient.errorHandler.handleError(reason, { type: 'unhandledRejection' });
    }
});

// Uncaught Exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    if (global.waengineClient && global.waengineClient.errorHandler) {
        global.waengineClient.errorHandler.handleError(error, { type: 'uncaughtException' });
    }
    
    // Graceful shutdown bei kritischen Fehlern
    if (global.waengineClient) {
        global.waengineClient.gracefulShutdown().then(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});


// Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    if (global.waengineClient && global.waengineClient.errorHandler) {
        global.waengineClient.errorHandler.handleError(reason, { type: 'unhandledRejection' });
    }
});

// Uncaught Exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    if (global.waengineClient && global.waengineClient.errorHandler) {
        global.waengineClient.errorHandler.handleError(error, { type: 'uncaughtException' });
    }
    
    // Graceful shutdown bei kritischen Fehlern
    if (global.waengineClient) {
        global.waengineClient.gracefulShutdown().then(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});