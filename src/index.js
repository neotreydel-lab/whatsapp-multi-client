export { WhatsAppClient } from "./client.js";
export { MultiWhatsAppClient } from "./multi-client.js";
export { DeviceManager } from "./device-manager.js";
export { PrefixManager } from "./prefix-manager.js";
export { WAStorage, createStorage, getStorage, write, read, del } from "./storage.js";
export { AIIntegration } from "./ai-integration.js";
export { HTTPClient } from "./http-client.js";
export { Scheduler } from "./scheduler.js";
export { StickerCreator } from "./sticker-creator.js";
export { PluginManager } from "./plugin-manager-fixed.js";
export { EasyBot, createBot, createMultiBot, quickBot, bot, multiBot } from "./easy-bot.js";
export { generateQRCode, scheduleQRCleanup, resetQRStatus } from "./qr.js";
export { Message } from "./message.js";
export { ConsoleLogger, logger } from "./console-logger.js";
export { ErrorHandler, defaultErrorHandler } from "./error-handler.js";

// ===== ULTRA-ROBUSTE RECOVERY SYSTEME - NEU v2.0.0! =====
export { ConnectionRecovery } from "./connection-recovery.js";
export { AuthRecovery } from "./auth-recovery.js";
export { ResourceManager, globalResourceManager } from "./resource-manager.js";

// ===== ADVANCED FEATURES EXPORTS - NEU! =====
export { 
    AdvancedMessage, 
    AdvancedGroup, 
    AdvancedPrivacy, 
    AdvancedAnalytics, 
    AdvancedStatus, 
    AdvancedBusiness, 
    AdvancedSystem 
} from "./advanced-features.js";

export { EasyAdvanced, EasyAdvancedRule } from "./easy-advanced.js";

// NEUE ROBUSTE FACTORY METHODS - NEU!
export const createRobustBot = () => EasyBot.createRobust();
export const createUltraRobustBot = () => EasyBot.createRobust().enableUltraRobust();

// ===== NEUE ADVANCED MANAGER EXPORTS =====
export { BusinessManager } from "./business-manager.js";
export { AnalyticsManager } from "./analytics-manager.js";
export { UIComponents } from "./ui-components.js";
export { AIFeatures } from "./ai-features.js";
export { CrossPlatformIntegration as CrossPlatform } from "./cross-platform.js";
export { SecurityManager } from "./security-manager.js";
export { AdvancedScheduler } from "./advanced-scheduler.js";
export { GamingManager } from "./gaming-manager.js";
export { DatabaseManager } from "./database-manager.js";
export { ABTestingManager } from "./ab-testing.js";
export { ReportingManager } from "./reporting-manager.js";
