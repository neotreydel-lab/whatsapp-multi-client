import { getStorage } from "./storage.js";
import crypto from 'crypto';
import os from 'os';
import fs from 'fs';
import path from 'path';

export class CrossPlatformIntegration {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.platforms = new Map();
        this.webhooks = new Map();
        this.apiEndpoints = new Map();
        this.syncQueue = [];
        this.deviceInfo = null;
        this.environmentInfo = null;
        
        this.initializePlatforms();
        this.detectEnvironment();
    }
    
    // ===== ENVIRONMENT DETECTION =====
    
    detectEnvironment() {
        const platform = os.platform();
        const arch = os.arch();
        const release = os.release();
        const userAgent = process.env.USER_AGENT || '';
        const terminalApp = process.env.TERM_PROGRAM || process.env.TERMINAL_EMULATOR || '';
        
        this.environmentInfo = {
            platform,
            arch,
            release,
            userAgent,
            terminalApp,
            isTermux: this.isTermux(),
            isAndroid: this.isAndroid(),
            isIOS: this.isIOS(),
            isMobile: this.isMobile(),
            isDocker: this.isDocker(),
            isWSL: this.isWSL(),
            isReplit: this.isReplit(),
            isGitpod: this.isGitpod(),
            isCodespaces: this.isCodespaces(),
            isHeroku: this.isHeroku(),
            isVercel: this.isVercel(),
            isNetlify: this.isNetlify(),
            isRailway: this.isRailway(),
            isRender: this.isRender(),
            capabilities: this.detectCapabilities()
        };
        
        this.deviceInfo = {
            type: this.getDeviceType(),
            os: this.getOSInfo(),
            runtime: this.getRuntimeInfo(),
            network: this.getNetworkInfo(),
            storage: this.getStorageInfo(),
            display: this.getDisplayInfo()
        };
        
        console.log(`🌍 WAEngine detected: ${this.environmentInfo.platform} on ${this.deviceInfo.type}`);
        this.optimizeForEnvironment();
    }
    
    // ===== ENVIRONMENT DETECTION METHODS =====
    
    isTermux() {
        return process.env.PREFIX?.includes('com.termux') || 
               fs.existsSync('/data/data/com.termux') ||
               process.env.TERMUX_VERSION !== undefined;
    }
    
    isAndroid() {
        return this.isTermux() || 
               process.env.ANDROID_ROOT !== undefined ||
               process.env.ANDROID_DATA !== undefined ||
               os.platform() === 'android';
    }
    
    isIOS() {
        return process.env.IPHONEOS_DEPLOYMENT_TARGET !== undefined ||
               process.platform === 'darwin' && process.env.SIMULATOR_DEVICE_NAME !== undefined;
    }
    
    isMobile() {
        return this.isAndroid() || this.isIOS();
    }
    
    isDocker() {
        return fs.existsSync('/.dockerenv') || 
               process.env.DOCKER_CONTAINER === 'true';
    }
    
    isWSL() {
        return process.env.WSL_DISTRO_NAME !== undefined ||
               os.release().toLowerCase().includes('microsoft');
    }
    
    isReplit() {
        return process.env.REPL_ID !== undefined ||
               process.env.REPLIT_DB_URL !== undefined;
    }
    
    isGitpod() {
        return process.env.GITPOD_WORKSPACE_ID !== undefined;
    }
    
    isCodespaces() {
        return process.env.CODESPACES === 'true';
    }
    
    isHeroku() {
        return process.env.DYNO !== undefined;
    }
    
    isVercel() {
        return process.env.VERCEL === '1';
    }
    
    isNetlify() {
        return process.env.NETLIFY === 'true';
    }
    
    isRailway() {
        return process.env.RAILWAY_ENVIRONMENT !== undefined;
    }
    
    isRender() {
        return process.env.RENDER === 'true';
    }
    
    // ===== DEVICE TYPE DETECTION =====
    
    getDeviceType() {
        if (this.isTermux()) return 'termux';
        if (this.isAndroid()) return 'android';
        if (this.isIOS()) return 'ios';
        if (this.isDocker()) return 'docker';
        if (this.isWSL()) return 'wsl';
        if (this.isReplit()) return 'replit';
        if (this.isGitpod()) return 'gitpod';
        if (this.isCodespaces()) return 'codespaces';
        if (this.isHeroku()) return 'heroku';
        if (this.isVercel()) return 'vercel';
        if (this.isNetlify()) return 'netlify';
        if (this.isRailway()) return 'railway';
        if (this.isRender()) return 'render';
        
        const platform = os.platform();
        switch (platform) {
            case 'win32': return 'windows';
            case 'darwin': return 'macos';
            case 'linux': return 'linux';
            case 'freebsd': return 'freebsd';
            case 'openbsd': return 'openbsd';
            case 'sunos': return 'solaris';
            default: return 'unknown';
        }
    }
    
    getOSInfo() {
        return {
            platform: os.platform(),
            arch: os.arch(),
            release: os.release(),
            version: os.version?.() || 'unknown',
            hostname: os.hostname(),
            uptime: os.uptime(),
            loadavg: os.loadavg(),
            totalmem: os.totalmem(),
            freemem: os.freemem(),
            cpus: os.cpus().length
        };
    }
    
    getRuntimeInfo() {
        return {
            node: process.version,
            v8: process.versions.v8,
            platform: process.platform,
            arch: process.arch,
            pid: process.pid,
            ppid: process.ppid,
            cwd: process.cwd(),
            execPath: process.execPath,
            argv: process.argv,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                PATH: process.env.PATH?.split(path.delimiter).length || 0,
                SHELL: process.env.SHELL,
                TERM: process.env.TERM,
                USER: process.env.USER || process.env.USERNAME
            }
        };
    }
    
    getNetworkInfo() {
        const interfaces = os.networkInterfaces();
        const networks = [];
        
        Object.entries(interfaces).forEach(([name, addrs]) => {
            addrs?.forEach(addr => {
                if (!addr.internal) {
                    networks.push({
                        interface: name,
                        family: addr.family,
                        address: addr.address,
                        netmask: addr.netmask,
                        mac: addr.mac
                    });
                }
            });
        });
        
        return {
            interfaces: Object.keys(interfaces),
            networks,
            hasInternet: networks.length > 0
        };
    }
    
    getStorageInfo() {
        try {
            const stats = fs.statSync(process.cwd());
            return {
                cwd: process.cwd(),
                writable: true, // Simplified check
                available: true,
                type: 'filesystem'
            };
        } catch (error) {
            return {
                cwd: process.cwd(),
                writable: false,
                available: false,
                type: 'unknown',
                error: error.message
            };
        }
    }
    
    getDisplayInfo() {
        const columns = process.stdout.columns || 80;
        const rows = process.stdout.rows || 24;
        
        return {
            terminal: {
                columns,
                rows,
                colorDepth: process.stdout.getColorDepth?.() || 1,
                isTTY: process.stdout.isTTY,
                hasColors: process.stdout.hasColors?.() || false
            },
            environment: {
                DISPLAY: process.env.DISPLAY,
                TERM: process.env.TERM,
                COLORTERM: process.env.COLORTERM,
                TERM_PROGRAM: process.env.TERM_PROGRAM
            }
        };
    }
    
    // ===== CAPABILITY DETECTION =====
    
    detectCapabilities() {
        const caps = {
            // Basic capabilities
            filesystem: true,
            network: true,
            crypto: true,
            
            // Display capabilities
            terminal: process.stdout.isTTY,
            colors: process.stdout.hasColors?.() || false,
            unicode: this.supportsUnicode(),
            
            // QR Code capabilities
            qrTerminal: this.supportsTerminalQR(),
            qrBrowser: this.supportsBrowserQR(),
            qrFile: true,
            
            // Media capabilities
            sharp: this.supportsSharp(),
            canvas: this.supportsCanvas(),
            
            // Platform-specific
            notifications: this.supportsNotifications(),
            clipboard: this.supportsClipboard(),
            
            // Network capabilities
            http: true,
            websockets: true,
            
            // Storage capabilities
            localStorage: true,
            sessionStorage: false,
            
            // Mobile-specific
            vibration: this.isMobile(),
            orientation: this.isMobile(),
            
            // Cloud platform capabilities
            serverless: this.isServerless(),
            persistent: this.isPersistent()
        };
        
        return caps;
    }
    
    supportsUnicode() {
        const term = process.env.TERM || '';
        const lang = process.env.LANG || '';
        
        return term.includes('256') || 
               term.includes('color') || 
               lang.includes('UTF-8') ||
               this.isTermux();
    }
    
    supportsTerminalQR() {
        return process.stdout.isTTY && 
               (process.stdout.columns || 80) >= 40 &&
               (process.stdout.rows || 24) >= 20;
    }
    
    supportsBrowserQR() {
        // Check if we can open browsers
        if (this.isTermux()) return true; // Termux can open browsers
        if (this.isWSL()) return true; // WSL can open Windows browsers
        if (this.isReplit() || this.isGitpod() || this.isCodespaces()) return true; // Cloud IDEs
        
        const platform = os.platform();
        return platform === 'win32' || platform === 'darwin' || platform === 'linux';
    }
    
    supportsSharp() {
        try {
            require.resolve('sharp');
            return true;
        } catch {
            return false;
        }
    }
    
    supportsCanvas() {
        try {
            require.resolve('canvas');
            return true;
        } catch {
            return false;
        }
    }
    
    supportsNotifications() {
        return !this.isServerless() && 
               (os.platform() === 'win32' || os.platform() === 'darwin' || os.platform() === 'linux');
    }
    
    supportsClipboard() {
        return !this.isServerless() && this.supportsNotifications();
    }
    
    isServerless() {
        return this.isVercel() || this.isNetlify() || 
               process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
               process.env.FUNCTION_NAME !== undefined;
    }
    
    isPersistent() {
        return !this.isServerless() && 
               !this.isReplit() && 
               !this.isGitpod() && 
               !this.isCodespaces();
    }
    
    // ===== ENVIRONMENT OPTIMIZATION =====
    
    optimizeForEnvironment() {
        const deviceType = this.deviceInfo.type;
        const caps = this.environmentInfo.capabilities;
        
        // Termux-specific optimizations
        if (deviceType === 'termux') {
            this.optimizeForTermux();
        }
        
        // Android-specific optimizations
        if (this.isAndroid()) {
            this.optimizeForAndroid();
        }
        
        // iOS-specific optimizations
        if (this.isIOS()) {
            this.optimizeForIOS();
        }
        
        // Cloud platform optimizations
        if (this.isServerless()) {
            this.optimizeForServerless();
        }
        
        // Container optimizations
        if (this.isDocker()) {
            this.optimizeForDocker();
        }
        
        // Low-resource optimizations
        if (this.isLowResource()) {
            this.optimizeForLowResource();
        }
        
        console.log(`⚡ Optimized for ${deviceType} environment`);
    }
    
    optimizeForTermux() {
        // Termux-specific settings
        process.env.TERMUX_OPTIMIZED = 'true';
        
        // Use Termux-specific paths
        const termuxPaths = {
            storage: '/data/data/com.termux/files/home/storage',
            shared: '/storage/emulated/0',
            downloads: '/storage/emulated/0/Download'
        };
        
        // Set QR mode to terminal (browsers work but terminal is faster)
        this.setQRMode('terminal');
        
        // Enable Android-specific features
        this.enableAndroidFeatures();
        
        console.log('🤖 Termux optimizations applied');
    }
    
    optimizeForAndroid() {
        // Android-specific settings
        process.env.ANDROID_OPTIMIZED = 'true';
        
        // Use Android paths
        const androidPaths = {
            external: '/sdcard',
            downloads: '/sdcard/Download',
            documents: '/sdcard/Documents'
        };
        
        // Enable mobile features
        this.enableMobileFeatures();
        
        console.log('📱 Android optimizations applied');
    }
    
    optimizeForIOS() {
        // iOS-specific settings
        process.env.IOS_OPTIMIZED = 'true';
        
        // Enable mobile features
        this.enableMobileFeatures();
        
        console.log('🍎 iOS optimizations applied');
    }
    
    optimizeForServerless() {
        // Serverless optimizations
        process.env.SERVERLESS_OPTIMIZED = 'true';
        
        // Disable persistent features
        this.disablePersistentFeatures();
        
        // Use memory storage
        this.useMemoryStorage();
        
        console.log('☁️ Serverless optimizations applied');
    }
    
    optimizeForDocker() {
        // Docker optimizations
        process.env.DOCKER_OPTIMIZED = 'true';
        
        // Use container-friendly settings
        this.setQRMode('terminal');
        
        console.log('🐳 Docker optimizations applied');
    }
    
    optimizeForLowResource() {
        // Low resource optimizations
        process.env.LOW_RESOURCE = 'true';
        
        // Reduce memory usage
        this.reduceMemoryUsage();
        
        // Disable heavy features
        this.disableHeavyFeatures();
        
        console.log('💾 Low resource optimizations applied');
    }
    
    // ===== FEATURE ENABLERS =====
    
    enableAndroidFeatures() {
        // Enable Android-specific features
        this.androidFeatures = {
            intentSupport: true,
            notificationSupport: true,
            fileSystemAccess: true,
            cameraAccess: false, // Requires permissions
            locationAccess: false // Requires permissions
        };
    }
    
    enableMobileFeatures() {
        // Enable mobile-specific features
        this.mobileFeatures = {
            touchOptimized: true,
            batteryAware: true,
            networkAware: true,
            orientationSupport: true
        };
    }
    
    disablePersistentFeatures() {
        // Disable features that require persistence
        this.persistentFeatures = {
            fileStorage: false,
            sessionPersistence: false,
            cachePersistence: false
        };
    }
    
    useMemoryStorage() {
        // Use in-memory storage for serverless
        this.storageMode = 'memory';
    }
    
    reduceMemoryUsage() {
        // Reduce memory usage
        this.memoryOptimizations = {
            smallCache: true,
            lazyLoading: true,
            garbageCollection: true
        };
    }
    
    disableHeavyFeatures() {
        // Disable resource-intensive features
        this.heavyFeatures = {
            imageProcessing: false,
            videoProcessing: false,
            largeFileSupport: false
        };
    }
    
    // ===== QR CODE OPTIMIZATION =====
    
    setQRMode(mode) {
        this.qrMode = mode;
        process.env.QR_MODE = mode;
    }
    
    getOptimalQRMode() {
        const caps = this.environmentInfo.capabilities;
        
        if (this.isTermux()) return 'terminal';
        if (this.isDocker()) return 'terminal';
        if (this.isServerless()) return 'file';
        if (caps.qrBrowser) return 'browser';
        if (caps.qrTerminal) return 'terminal';
        return 'file';
    }
    
    // ===== RESOURCE DETECTION =====
    
    isLowResource() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const cpus = os.cpus().length;
        
        // Consider low resource if:
        // - Less than 1GB total memory
        // - Less than 512MB free memory
        // - Single core CPU
        return totalMem < 1024 * 1024 * 1024 || 
               freeMem < 512 * 1024 * 1024 || 
               cpus === 1;
    }
    
    // ===== PLATFORM INITIALIZATION =====
    
    initializePlatforms() {
        // Supported platforms - MASSIVELY EXPANDED
        this.supportedPlatforms = [
            // Messaging platforms
            'telegram', 'discord', 'slack', 'teams', 'facebook', 
            'instagram', 'twitter', 'email', 'sms', 'web',
            
            // Mobile platforms
            'android', 'ios', 'termux', 'ish', 'acode',
            
            // Cloud platforms
            'replit', 'gitpod', 'codespaces', 'codesandbox',
            'heroku', 'vercel', 'netlify', 'railway', 'render',
            
            // Container platforms
            'docker', 'kubernetes', 'podman',
            
            // Desktop platforms
            'windows', 'macos', 'linux', 'freebsd',
            
            // Development platforms
            'vscode', 'atom', 'sublime', 'vim', 'emacs',
            
            // Terminal platforms
            'bash', 'zsh', 'fish', 'powershell', 'cmd',
            
            // Web platforms
            'chrome', 'firefox', 'safari', 'edge', 'opera',
            
            // IoT platforms
            'raspberry-pi', 'arduino', 'esp32',
            
            // Gaming platforms
            'steam', 'epic', 'origin', 'uplay',
            
            // Streaming platforms
            'twitch', 'youtube', 'obs'
        ];
        
        // Load existing platform configurations
        this.loadPlatformConfigs();
        
        // Auto-detect available platforms
        this.autoDetectPlatforms();
    }
    
    autoDetectPlatforms() {
        const detected = [];
        
        // Detect current environment
        const deviceType = this.getDeviceType();
        if (this.supportedPlatforms.includes(deviceType)) {
            detected.push(deviceType);
        }
        
        // Detect available browsers
        const browsers = this.detectBrowsers();
        detected.push(...browsers);
        
        // Detect terminal
        const terminal = this.detectTerminal();
        if (terminal) detected.push(terminal);
        
        // Detect development environment
        const devEnv = this.detectDevelopmentEnvironment();
        if (devEnv) detected.push(devEnv);
        
        console.log(`🔍 Auto-detected platforms: ${detected.join(', ')}`);
        return detected;
    }
    
    detectBrowsers() {
        const browsers = [];
        const userAgent = process.env.USER_AGENT || '';
        
        if (userAgent.includes('Chrome')) browsers.push('chrome');
        if (userAgent.includes('Firefox')) browsers.push('firefox');
        if (userAgent.includes('Safari')) browsers.push('safari');
        if (userAgent.includes('Edge')) browsers.push('edge');
        
        return browsers;
    }
    
    detectTerminal() {
        const term = process.env.TERM_PROGRAM || process.env.TERMINAL_EMULATOR || '';
        
        if (term.includes('bash')) return 'bash';
        if (term.includes('zsh')) return 'zsh';
        if (term.includes('fish')) return 'fish';
        if (process.env.PSModulePath) return 'powershell';
        if (process.platform === 'win32') return 'cmd';
        
        return null;
    }
    
    detectDevelopmentEnvironment() {
        if (process.env.VSCODE_PID) return 'vscode';
        if (process.env.ATOM_HOME) return 'atom';
        if (process.env.SUBLIME_TEXT) return 'sublime';
        if (process.env.VIM) return 'vim';
        if (process.env.EMACS) return 'emacs';
        
        return null;
    }
    
    loadPlatformConfigs() {
        const configs = this.storage.read.from("crossplatform").get("platforms") || {};
        
        Object.entries(configs).forEach(([platform, config]) => {
            this.platforms.set(platform, {
                ...config,
                status: 'disconnected',
                lastSync: null
            });
        });
    }
    
    // ===== PLATFORM MANAGEMENT =====
    
    /**
     * Add platform integration
     */
    async addPlatform(platform, config) {
        if (!this.supportedPlatforms.includes(platform)) {
            throw new Error(`Platform ${platform} not supported`);
        }
        
        const platformConfig = {
            platform,
            ...config,
            status: 'connected',
            addedAt: Date.now(),
            lastSync: null
        };
        
        this.platforms.set(platform, platformConfig);
        this.storage.write.in("crossplatform").set(`platforms.${platform}`, platformConfig);
        
        // Initialize platform-specific handlers
        await this.initializePlatformHandlers(platform, config);
        
        return platformConfig;
    }
    
    /**
     * Remove platform integration
     */
    async removePlatform(platform) {
        this.platforms.delete(platform);
        this.storage.delete.from("crossplatform").key(`platforms.${platform}`);
        
        // Clean up webhooks and endpoints
        this.webhooks.delete(platform);
        this.apiEndpoints.delete(platform);
        
        return true;
    }
    
    /**
     * Get platform status
     */
    getPlatformStatus(platform) {
        return this.platforms.get(platform) || null;
    }
    
    /**
     * List all platforms
     */
    listPlatforms() {
        return Array.from(this.platforms.entries()).map(([name, config]) => ({
            name,
            status: config.status,
            lastSync: config.lastSync,
            addedAt: config.addedAt
        }));
    }
    
    // ===== MESSAGE SYNCHRONIZATION =====
    
    /**
     * Sync message to all platforms
     */
    async syncMessage(message, options = {}) {
        const activePlatforms = Array.from(this.platforms.entries())
            .filter(([, config]) => config.status === 'connected');
        
        const syncPromises = activePlatforms.map(([platform, config]) => 
            this.syncToPlatform(platform, message, options)
        );
        
        const results = await Promise.allSettled(syncPromises);
        
        // Log sync results
        results.forEach((result, index) => {
            const [platform] = activePlatforms[index];
            if (result.status === 'fulfilled') {
                this.updateLastSync(platform);
            } else {
                console.error(`❌ Sync to ${platform} failed:`, result.reason);
            }
        });
        
        return results;
    }
    
    /**
     * Sync to specific platform
     */
    async syncToPlatform(platform, message, options) {
        const config = this.platforms.get(platform);
        if (!config) throw new Error(`Platform ${platform} not configured`);
        
        switch (platform) {
            case 'telegram':
                return await this.syncToTelegram(message, config, options);
            case 'discord':
                return await this.syncToDiscord(message, config, options);
            case 'slack':
                return await this.syncToSlack(message, config, options);
            case 'email':
                return await this.syncToEmail(message, config, options);
            case 'web':
                return await this.syncToWeb(message, config, options);
            default:
                return await this.syncViaWebhook(platform, message, config, options);
        }
    }
    
    // ===== PLATFORM-SPECIFIC SYNC METHODS =====
    
    async syncToTelegram(message, config, options) {
        const telegramMessage = this.formatForTelegram(message);
        
        const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.chatId,
                text: telegramMessage.text,
                parse_mode: 'Markdown'
            })
        });
        
        return await response.json();
    }
    
    async syncToDiscord(message, config, options) {
        const discordMessage = this.formatForDiscord(message);
        
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: discordMessage.text,
                username: config.username || 'WAEngine Bot'
            })
        });
        
        return response.ok;
    }
    
    async syncToSlack(message, config, options) {
        const slackMessage = this.formatForSlack(message);
        
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: slackMessage.text,
                channel: config.channel,
                username: config.username || 'WAEngine Bot'
            })
        });
        
        return response.ok;
    }
    
    async syncToEmail(message, config, options) {
        // Simplified email sync (would need proper email service integration)
        const emailData = {
            to: config.recipients,
            subject: `WhatsApp Message from ${message.sender}`,
            body: this.formatForEmail(message),
            timestamp: Date.now()
        };
        
        // Store for email service to process
        this.storage.write.in("crossplatform").push("emailQueue", emailData);
        
        return { queued: true, emailData };
    }
    
    async syncToWeb(message, config, options) {
        const webMessage = this.formatForWeb(message);
        
        // Store for web dashboard
        this.storage.write.in("crossplatform").push(`web.${config.dashboardId}.messages`, {
            ...webMessage,
            timestamp: Date.now()
        });
        
        // Emit to websocket if configured
        if (config.websocketUrl) {
            // Would emit to websocket here
        }
        
        return { stored: true, webMessage };
    }
    
    async syncViaWebhook(platform, message, config, options) {
        if (!config.webhookUrl) {
            throw new Error(`No webhook URL configured for ${platform}`);
        }
        
        const formattedMessage = this.formatForGeneric(message);
        
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'WAEngine-CrossPlatform/1.0'
            },
            body: JSON.stringify({
                platform: 'whatsapp',
                message: formattedMessage,
                timestamp: Date.now()
            })
        });
        
        return await response.json();
    }
    
    // ===== MESSAGE FORMATTING =====
    
    formatForTelegram(message) {
        return {
            text: `*WhatsApp Message*\n\n` +
                  `From: ${message.sender}\n` +
                  `Message: ${message.text}\n` +
                  `Time: ${new Date().toLocaleString()}`
        };
    }
    
    formatForDiscord(message) {
        return {
            text: `**WhatsApp Message**\n\n` +
                  `**From:** ${message.sender}\n` +
                  `**Message:** ${message.text}\n` +
                  `**Time:** ${new Date().toLocaleString()}`
        };
    }
    
    formatForSlack(message) {
        return {
            text: `*WhatsApp Message*\n\n` +
                  `*From:* ${message.sender}\n` +
                  `*Message:* ${message.text}\n` +
                  `*Time:* ${new Date().toLocaleString()}`
        };
    }
    
    formatForEmail(message) {
        return `
            <h2>WhatsApp Message</h2>
            <p><strong>From:</strong> ${message.sender}</p>
            <p><strong>Message:</strong> ${message.text}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Chat:</strong> ${message.isGroup ? 'Group' : 'Private'}</p>
        `;
    }
    
    formatForWeb(message) {
        return {
            id: `msg_${Date.now()}`,
            sender: message.sender,
            text: message.text,
            isGroup: message.isGroup,
            chatId: message.chatId,
            timestamp: Date.now(),
            platform: 'whatsapp'
        };
    }
    
    formatForGeneric(message) {
        return {
            sender: message.sender,
            text: message.text,
            isGroup: message.isGroup,
            chatId: message.chatId,
            timestamp: Date.now(),
            type: message.type || 'text'
        };
    }
    
    // ===== WEBHOOK MANAGEMENT =====
    
    /**
     * Register webhook for platform
     */
    registerWebhook(platform, url, secret = null) {
        this.webhooks.set(platform, {
            url,
            secret,
            registeredAt: Date.now()
        });
        
        this.storage.write.in("crossplatform").set(`webhooks.${platform}`, {
            url,
            secret,
            registeredAt: Date.now()
        });
        
        return true;
    }
    
    /**
     * Handle incoming webhook
     */
    async handleWebhook(platform, data, signature = null) {
        const webhook = this.webhooks.get(platform);
        if (!webhook) {
            throw new Error(`No webhook registered for ${platform}`);
        }
        
        // Verify signature if secret is set
        if (webhook.secret && signature) {
            const isValid = this.verifyWebhookSignature(data, signature, webhook.secret);
            if (!isValid) {
                throw new Error('Invalid webhook signature');
            }
        }
        
        // Process webhook data
        const processedMessage = this.processWebhookData(platform, data);
        
        // Emit to WhatsApp if configured
        if (processedMessage && this.client) {
            await this.forwardToWhatsApp(processedMessage);
        }
        
        return processedMessage;
    }
    
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(data, signature, secret) {
        // Simplified signature verification
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(data))
            .digest('hex');
        
        return signature === expectedSignature;
    }
    
    /**
     * Process webhook data
     */
    processWebhookData(platform, data) {
        // Platform-specific data processing
        switch (platform) {
            case 'telegram':
                return this.processTelegramWebhook(data);
            case 'discord':
                return this.processDiscordWebhook(data);
            case 'slack':
                return this.processSlackWebhook(data);
            default:
                return this.processGenericWebhook(data);
        }
    }
    
    processTelegramWebhook(data) {
        if (data.message) {
            return {
                platform: 'telegram',
                sender: data.message.from.username || data.message.from.first_name,
                text: data.message.text,
                timestamp: data.message.date * 1000,
                originalData: data
            };
        }
        return null;
    }
    
    processDiscordWebhook(data) {
        return {
            platform: 'discord',
            sender: data.author?.username || 'Unknown',
            text: data.content,
            timestamp: Date.now(),
            originalData: data
        };
    }
    
    processSlackWebhook(data) {
        return {
            platform: 'slack',
            sender: data.user_name || 'Unknown',
            text: data.text,
            timestamp: Date.now(),
            originalData: data
        };
    }
    
    processGenericWebhook(data) {
        return {
            platform: 'generic',
            sender: data.sender || 'Unknown',
            text: data.message || data.text || '',
            timestamp: data.timestamp || Date.now(),
            originalData: data
        };
    }
    
    // ===== WHATSAPP FORWARDING =====
    
    /**
     * Forward message to WhatsApp
     */
    async forwardToWhatsApp(message) {
        const config = this.storage.read.from("crossplatform").get("whatsappForwarding");
        if (!config || !config.enabled) return;
        
        const targetChat = config.targetChat;
        if (!targetChat) return;
        
        const forwardText = `📱 **${message.platform.toUpperCase()} Message**\n\n` +
                           `👤 From: ${message.sender}\n` +
                           `💬 Message: ${message.text}\n` +
                           `🕐 Time: ${new Date(message.timestamp).toLocaleString()}`;
        
        await this.client.socket.sendMessage(targetChat, { text: forwardText });
    }
    
    // ===== UTILITY METHODS =====
    
    updateLastSync(platform) {
        const config = this.platforms.get(platform);
        if (config) {
            config.lastSync = Date.now();
            this.platforms.set(platform, config);
            this.storage.write.in("crossplatform").set(`platforms.${platform}.lastSync`, config.lastSync);
        }
    }
    
    /**
     * Get cross-platform statistics
     */
    getCrossPlatformStats() {
        const platforms = this.listPlatforms();
        const webhooks = Array.from(this.webhooks.keys());
        const emailQueue = this.storage.read.from("crossplatform").get("emailQueue") || [];
        
        return {
            platforms: {
                total: platforms.length,
                connected: platforms.filter(p => p.status === 'connected').length,
                list: platforms
            },
            webhooks: {
                total: webhooks.length,
                list: webhooks
            },
            sync: {
                queueSize: this.syncQueue.length,
                emailQueue: emailQueue.length,
                lastSync: Math.max(...platforms.map(p => p.lastSync || 0))
            }
        };
    }
    
    /**
     * Test platform connection
     */
    async testPlatformConnection(platform) {
        const config = this.platforms.get(platform);
        if (!config) {
            throw new Error(`Platform ${platform} not configured`);
        }
        
        try {
            const testMessage = {
                sender: 'WAEngine Test',
                text: 'Connection test message',
                isGroup: false,
                chatId: 'test'
            };
            
            await this.syncToPlatform(platform, testMessage, { test: true });
            
            config.status = 'connected';
            this.platforms.set(platform, config);
            
            return { success: true, platform, status: 'connected' };
        } catch (error) {
            config.status = 'error';
            this.platforms.set(platform, config);
            
            return { success: false, platform, status: 'error', error: error.message };
        }
    }
    
    /**
     * Export cross-platform data
     */
    exportData() {
        return {
            platforms: Object.fromEntries(this.platforms),
            webhooks: Object.fromEntries(this.webhooks),
            stats: this.getCrossPlatformStats()
        };
    }
}