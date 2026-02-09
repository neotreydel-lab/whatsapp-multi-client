import { getStorage } from "./storage.js";
import { ErrorHandler } from "./error-handler.js";
import fs from 'fs';
import os from 'os';

export class MobileSupport {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.errorHandler = new ErrorHandler();
        this.mobileFeatures = new Map();
        this.termuxFeatures = new Map();
        this.iosFeatures = new Map();
        
        this.initializeMobileSupport();
    }
    
    // ===== INITIALIZATION =====
    
    initializeMobileSupport() {
        this.detectMobileEnvironment();
        this.setupMobileOptimizations();
        this.enableMobileFeatures();
    }
    
    detectMobileEnvironment() {
        try {
            this.environment = {
                isTermux: this.safeCheck(() => this.isTermux()),
                isAndroid: this.safeCheck(() => this.isAndroid()),
                isIOS: this.safeCheck(() => this.isIOS()),
                isISH: this.safeCheck(() => this.isISH()),
                isAcode: this.safeCheck(() => this.isAcode()),
                isMobile: false,
                detectionErrors: []
            };
            
            this.environment.isMobile = this.environment.isTermux || 
                                       this.environment.isAndroid || 
                                       this.environment.isIOS || 
                                       this.environment.isISH;
            
            if (this.environment.isMobile) {
                console.log(`📱 Mobile environment detected: ${this.getMobileType()}`);
            }
        } catch (error) {
            console.error('❌ Mobile detection error:', error.message);
            this.environment = {
                isTermux: false,
                isAndroid: false,
                isIOS: false,
                isISH: false,
                isAcode: false,
                isMobile: false,
                detectionErrors: [error.message]
            };
        }
    }
    
    // Safe check wrapper with error handling
    safeCheck(checkFn) {
        try {
            return checkFn();
        } catch (error) {
            if (this.environment && this.environment.detectionErrors) {
                this.environment.detectionErrors.push(error.message);
            }
            return false;
        }
    }
    
    // ===== ENVIRONMENT DETECTION =====
    
    isTermux() {
        try {
            return (process.env.PREFIX?.includes('com.termux')) || 
                   (fs.existsSync('/data/data/com.termux')) ||
                   (process.env.TERMUX_VERSION !== undefined) ||
                   (process.env.ANDROID_ROOT?.includes('termux'));
        } catch (error) {
            return false;
        }
    }
    
    isAndroid() {
        try {
            return (process.env.ANDROID_ROOT !== undefined) ||
                   (process.env.ANDROID_DATA !== undefined) ||
                   (fs.existsSync('/system/build.prop')) ||
                   (os.platform() === 'android');
        } catch (error) {
            return false;
        }
    }
    
    isIOS() {
        try {
            return (process.env.IPHONEOS_DEPLOYMENT_TARGET !== undefined) ||
                   (process.platform === 'darwin' && process.env.SIMULATOR_DEVICE_NAME !== undefined) ||
                   (fs.existsSync('/Applications') && process.arch === 'arm64');
        } catch (error) {
            return false;
        }
    }
    
    isISH() {
        try {
            return (process.env.ISH_VERSION !== undefined) ||
                   (fs.existsSync('/ish')) ||
                   (process.env.SHELL?.includes('ish'));
        } catch (error) {
            return false;
        }
    }
    
    isAcode() {
        try {
            return (process.env.ACODE_VERSION !== undefined) ||
                   (process.env.ACODE_APP !== undefined);
        } catch (error) {
            return false;
        }
    }
    
    getMobileType() {
        if (this.environment.isTermux) return 'Termux (Android)';
        if (this.environment.isISH) return 'iSH (iOS)';
        if (this.environment.isAcode) return 'Acode (Android)';
        if (this.environment.isAndroid) return 'Android';
        if (this.environment.isIOS) return 'iOS';
        return 'Unknown Mobile';
    }
    
    // ===== MOBILE OPTIMIZATIONS =====
    
    setupMobileOptimizations() {
        if (!this.environment.isMobile) return;
        
        // General mobile optimizations
        this.setupGeneralMobileOptimizations();
        
        // Platform-specific optimizations
        if (this.environment.isTermux) {
            this.setupTermuxOptimizations();
        }
        
        if (this.environment.isIOS || this.environment.isISH) {
            this.setupIOSOptimizations();
        }
        
        if (this.environment.isAndroid) {
            this.setupAndroidOptimizations();
        }
    }
    
    setupGeneralMobileOptimizations() {
        // Reduce memory usage
        process.env.NODE_OPTIONS = '--max-old-space-size=512';
        
        // Optimize for mobile networks
        this.networkOptimizations = {
            timeout: 30000, // Longer timeouts for mobile networks
            retries: 3,
            compression: true,
            keepAlive: false // Save battery
        };
        
        // Battery optimizations
        this.batteryOptimizations = {
            reducedPolling: true,
            sleepMode: true,
            backgroundSync: false
        };
        
        console.log('📱 General mobile optimizations applied');
    }
    
    setupTermuxOptimizations() {
        // Termux-specific paths
        this.termuxPaths = {
            home: process.env.HOME || '/data/data/com.termux/files/home',
            storage: '/data/data/com.termux/files/home/storage',
            shared: '/storage/emulated/0',
            downloads: '/storage/emulated/0/Download'
        };
        
        // Termux package management
        this.termuxPackages = {
            required: ['nodejs', 'git', 'python'],
            optional: ['ffmpeg', 'imagemagick', 'curl']
        };
        
        // Setup Termux-specific features
        this.setupTermuxStorage();
        this.setupTermuxPermissions();
        
        console.log('📱 Termux optimizations applied');
    }
    
    setupIOSOptimizations() {
        // iOS/iSH specific optimizations
        this.iosOptimizations = {
            memoryLimit: 256, // MB
            backgroundMode: false,
            pushNotifications: false,
            fileAccess: 'limited'
        };
        
        // iSH specific paths
        if (this.environment.isISH) {
            this.ishPaths = {
                home: process.env.HOME || '/root',
                documents: '/root/Documents',
                downloads: '/root/Downloads'
            };
        }
        
        console.log('📱 iOS/iSH optimizations applied');
    }
    
    setupAndroidOptimizations() {
        // Android-specific optimizations
        this.androidOptimizations = {
            wakeLock: false,
            backgroundSync: false,
            dataUsage: 'minimal',
            batteryOptimization: true
        };
        
        // Android paths
        this.androidPaths = {
            internal: '/storage/emulated/0',
            external: '/storage/sdcard1',
            downloads: '/storage/emulated/0/Download',
            documents: '/storage/emulated/0/Documents'
        };
        
        console.log('📱 Android optimizations applied');
    }
    
    // ===== MOBILE FEATURES =====
    
    enableMobileFeatures() {
        if (!this.environment.isMobile) return;
        
        this.enableTouchOptimizations();
        this.enableMobileQR();
        this.enableMobileNotifications();
        this.enableMobileStorage();
        this.enableMobileNetworking();
        
        console.log('📱 Mobile features enabled');
    }
    
    enableTouchOptimizations() {
        this.mobileFeatures.set('touch', {
            enabled: true,
            swipeGestures: true,
            tapToSelect: true,
            longPressMenu: true
        });
    }
    
    enableMobileQR() {
        this.mobileFeatures.set('qr', {
            enabled: true,
            size: 'small', // Smaller QR codes for mobile screens
            terminal: true,
            browser: false, // Prefer terminal QR on mobile
            autoRefresh: true
        });
    }
    
    enableMobileNotifications() {
        this.mobileFeatures.set('notifications', {
            enabled: true,
            sound: false, // Save battery
            vibration: this.environment.isAndroid,
            badge: true
        });
    }
    
    enableMobileStorage() {
        this.mobileFeatures.set('storage', {
            enabled: true,
            compression: true,
            cleanup: true,
            maxSize: '100MB'
        });
    }
    
    enableMobileNetworking() {
        this.mobileFeatures.set('networking', {
            enabled: true,
            compression: true,
            timeout: 30000,
            retries: 3,
            offline: true
        });
    }
    
    // ===== TERMUX SPECIFIC =====
    
    setupTermuxStorage() {
        if (!this.environment.isTermux) return;
        
        try {
            // Setup storage access with robust checks
            const storageConfig = {
                internal: false,
                external: false,
                shared: false,
                errors: []
            };
            
            try {
                storageConfig.internal = fs.existsSync('/data/data/com.termux/files/home/storage');
            } catch (e) {
                storageConfig.errors.push('internal check failed');
            }
            
            try {
                storageConfig.external = fs.existsSync('/storage/emulated/0');
            } catch (e) {
                storageConfig.errors.push('external check failed');
            }
            
            try {
                storageConfig.shared = fs.existsSync('/storage/emulated/0/shared');
            } catch (e) {
                storageConfig.errors.push('shared check failed');
            }
            
            this.termuxFeatures.set('storage', storageConfig);
            
            if (storageConfig.errors.length > 0) {
                console.log('⚠️ Termux storage checks had errors:', storageConfig.errors.join(', '));
            }
        } catch (error) {
            console.error('❌ Termux storage setup failed:', error.message);
            this.errorHandler.handleError(error, 'setupTermuxStorage');
        }
    }
    
    setupTermuxPermissions() {
        if (!this.environment.isTermux) return;
        
        this.termuxFeatures.set('permissions', {
            storage: this.checkTermuxStoragePermission(),
            camera: this.checkTermuxCameraPermission(),
            microphone: this.checkTermuxMicrophonePermission()
        });
    }
    
    checkTermuxStoragePermission() {
        try {
            return fs.existsSync('/data/data/com.termux/files/home/storage');
        } catch {
            return false;
        }
    }
    
    checkTermuxCameraPermission() {
        try {
            return fs.existsSync('/dev/video0') || process.env.TERMUX_CAMERA === 'true';
        } catch {
            return false;
        }
    }
    
    checkTermuxMicrophonePermission() {
        try {
            return fs.existsSync('/dev/snd') || process.env.TERMUX_MICROPHONE === 'true';
        } catch {
            return false;
        }
    }
    
    // ===== MOBILE QR HANDLING =====
    
    getMobileQRConfig() {
        if (!this.environment.isMobile) return null;
        
        return {
            size: 'small',
            errorCorrectionLevel: 'M',
            type: 'terminal',
            width: this.getMobileQRWidth(),
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        };
    }
    
    getMobileQRWidth() {
        if (this.environment.isTermux) return 25;
        if (this.environment.isISH) return 20;
        return 30;
    }
    
    // ===== MOBILE FILE HANDLING =====
    
    getMobileStoragePath() {
        if (this.environment.isTermux) {
            return this.termuxPaths.home;
        }
        
        if (this.environment.isISH) {
            return this.ishPaths.home;
        }
        
        if (this.environment.isAndroid) {
            return this.androidPaths.internal;
        }
        
        return process.cwd();
    }
    
    getMobileDownloadPath() {
        if (this.environment.isTermux) {
            return this.termuxPaths.downloads;
        }
        
        if (this.environment.isISH) {
            return this.ishPaths.downloads;
        }
        
        if (this.environment.isAndroid) {
            return this.androidPaths.downloads;
        }
        
        return process.cwd();
    }
    
    // ===== MOBILE PERFORMANCE =====
    
    optimizeForMobile() {
        if (!this.environment.isMobile) return;
        
        // Memory optimization
        this.optimizeMemoryUsage();
        
        // CPU optimization
        this.optimizeCPUUsage();
        
        // Battery optimization
        this.optimizeBatteryUsage();
        
        // Network optimization
        this.optimizeNetworkUsage();
    }
    
    optimizeMemoryUsage() {
        // Reduce memory footprint
        global.gc && global.gc();
        
        // Set memory limits
        if (this.environment.isTermux || this.environment.isISH) {
            process.env.NODE_OPTIONS = '--max-old-space-size=256';
        }
    }
    
    optimizeCPUUsage() {
        // Reduce CPU intensive operations
        this.cpuOptimizations = {
            reducedPolling: true,
            lazyLoading: true,
            backgroundProcessing: false
        };
    }
    
    optimizeBatteryUsage() {
        // Battery saving features
        this.batteryOptimizations = {
            reducedAnimations: true,
            sleepMode: true,
            backgroundSync: false,
            pushNotifications: false
        };
    }
    
    optimizeNetworkUsage() {
        // Network optimization for mobile data
        this.networkOptimizations = {
            compression: true,
            caching: true,
            offlineMode: true,
            dataUsageLimit: '50MB'
        };
    }
    
    // ===== MOBILE UTILITIES =====
    
    isMobileEnvironment() {
        return this.environment.isMobile;
    }
    
    getMobileInfo() {
        return {
            type: this.getMobileType(),
            environment: this.environment,
            features: Object.fromEntries(this.mobileFeatures),
            optimizations: {
                network: this.networkOptimizations,
                battery: this.batteryOptimizations,
                cpu: this.cpuOptimizations
            }
        };
    }
    
    getMobileCapabilities() {
        const capabilities = {
            qr: this.mobileFeatures.get('qr')?.enabled || false,
            notifications: this.mobileFeatures.get('notifications')?.enabled || false,
            storage: this.mobileFeatures.get('storage')?.enabled || false,
            networking: this.mobileFeatures.get('networking')?.enabled || false,
            touch: this.mobileFeatures.get('touch')?.enabled || false
        };
        
        if (this.environment.isTermux) {
            capabilities.termux = Object.fromEntries(this.termuxFeatures);
        }
        
        if (this.environment.isIOS) {
            capabilities.ios = Object.fromEntries(this.iosFeatures);
        }
        
        return capabilities;
    }
    
    // ===== MOBILE COMMANDS =====
    
    async installMobileDependencies() {
        if (!this.environment.isMobile) return false;
        
        try {
            if (this.environment.isTermux) {
                return await this.installTermuxDependencies();
            }
            
            if (this.environment.isISH) {
                return await this.installISHDependencies();
            }
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'installMobileDependencies');
            return false;
        }
    }
    
    async installTermuxDependencies() {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
            // Update package list
            await execAsync('pkg update -y');
            
            // Install required packages
            for (const pkg of this.termuxPackages.required) {
                await execAsync(`pkg install -y ${pkg}`);
            }
            
            console.log('📱 Termux dependencies installed');
            return true;
        } catch (error) {
            console.error('❌ Failed to install Termux dependencies:', error.message);
            return false;
        }
    }
    
    async installISHDependencies() {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
            // Update package list
            await execAsync('apk update');
            
            // Install Node.js and npm
            await execAsync('apk add nodejs npm');
            
            console.log('📱 iSH dependencies installed');
            return true;
        } catch (error) {
            console.error('❌ Failed to install iSH dependencies:', error.message);
            return false;
        }
    }
    
    // ===== MOBILE SESSION MANAGEMENT =====
    
    getMobileSessionConfig() {
        return {
            sessionPath: this.getMobileStoragePath(),
            compression: true,
            encryption: false, // Disabled for performance on mobile
            backup: false, // Disabled to save storage
            cleanup: true
        };
    }
    
    // ===== MOBILE ERROR HANDLING =====
    
    handleMobileError(error, context) {
        const mobileError = {
            ...error,
            mobile: true,
            environment: this.getMobileType(),
            context: context,
            timestamp: new Date().toISOString()
        };
        
        this.errorHandler.handleError(mobileError, `mobile-${context}`);
    }
}