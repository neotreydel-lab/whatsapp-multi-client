// 🧹 ULTRA-ROBUSTER RESOURCE MANAGER
// Verhindert Memory Leaks und verwaltet alle Ressourcen

export class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.timers = new Set();
        this.intervals = new Set();
        this.eventListeners = new Map();
        this.fileHandles = new Set();
        this.networkConnections = new Set();
        
        this.stats = {
            created: 0,
            cleaned: 0,
            leaked: 0,
            errors: 0
        };
        
        // Auto-cleanup on process exit
        this.setupProcessHandlers();
    }
    
    // Register a timer
    registerTimer(timer, metadata = {}) {
        this.timers.add({ timer, metadata, created: Date.now() });
        this.stats.created++;
        return timer;
    }
    
    // Register an interval
    registerInterval(interval, metadata = {}) {
        this.intervals.add({ interval, metadata, created: Date.now() });
        this.stats.created++;
        return interval;
    }
    
    // Register event listener
    registerEventListener(emitter, event, handler, metadata = {}) {
        const key = `${emitter.constructor.name}_${event}`;
        
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        
        this.eventListeners.get(key).push({
            emitter,
            event,
            handler,
            metadata,
            created: Date.now()
        });
        
        this.stats.created++;
    }
    
    // Register file handle
    registerFileHandle(handle, path, metadata = {}) {
        this.fileHandles.add({
            handle,
            path,
            metadata,
            created: Date.now()
        });
        this.stats.created++;
    }
    
    // Register network connection
    registerConnection(connection, metadata = {}) {
        this.networkConnections.add({
            connection,
            metadata,
            created: Date.now()
        });
        this.stats.created++;
    }
    
    // Clear all timers
    clearAllTimers() {
        let cleared = 0;
        
        this.timers.forEach(({ timer }) => {
            try {
                clearTimeout(timer);
                cleared++;
            } catch (error) {
                this.stats.errors++;
            }
        });
        
        this.timers.clear();
        this.stats.cleaned += cleared;
        
        return cleared;
    }
    
    // Clear all intervals
    clearAllIntervals() {
        let cleared = 0;
        
        this.intervals.forEach(({ interval }) => {
            try {
                clearInterval(interval);
                cleared++;
            } catch (error) {
                this.stats.errors++;
            }
        });
        
        this.intervals.clear();
        this.stats.cleaned += cleared;
        
        return cleared;
    }
    
    // Remove all event listeners
    removeAllEventListeners() {
        let removed = 0;
        
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ emitter, event, handler }) => {
                try {
                    if (emitter && typeof emitter.off === 'function') {
                        emitter.off(event, handler);
                        removed++;
                    } else if (emitter && typeof emitter.removeListener === 'function') {
                        emitter.removeListener(event, handler);
                        removed++;
                    }
                } catch (error) {
                    this.stats.errors++;
                }
            });
        });
        
        this.eventListeners.clear();
        this.stats.cleaned += removed;
        
        return removed;
    }
    
    // Close all file handles
    closeAllFileHandles() {
        let closed = 0;
        
        this.fileHandles.forEach(({ handle }) => {
            try {
                if (handle && typeof handle.close === 'function') {
                    handle.close();
                    closed++;
                }
            } catch (error) {
                this.stats.errors++;
            }
        });
        
        this.fileHandles.clear();
        this.stats.cleaned += closed;
        
        return closed;
    }
    
    // Close all network connections
    closeAllConnections() {
        let closed = 0;
        
        this.networkConnections.forEach(({ connection }) => {
            try {
                if (connection && typeof connection.end === 'function') {
                    connection.end();
                    closed++;
                } else if (connection && typeof connection.close === 'function') {
                    connection.close();
                    closed++;
                } else if (connection && typeof connection.destroy === 'function') {
                    connection.destroy();
                    closed++;
                }
            } catch (error) {
                this.stats.errors++;
            }
        });
        
        this.networkConnections.clear();
        this.stats.cleaned += closed;
        
        return closed;
    }
    
    // Cleanup all resources
    cleanupAll() {
        // Silent cleanup - keine Ausgabe mehr
        const results = {
            timers: this.clearAllTimers(),
            intervals: this.clearAllIntervals(),
            eventListeners: this.removeAllEventListeners(),
            fileHandles: this.closeAllFileHandles(),
            connections: this.closeAllConnections()
        };
        
        return results;
    }
    
    // Find resource leaks
    findLeaks(maxAge = 300000) { // 5 minutes
        const now = Date.now();
        const leaks = {
            timers: [],
            intervals: [],
            eventListeners: [],
            fileHandles: [],
            connections: []
        };
        
        this.timers.forEach(({ timer, metadata, created }) => {
            if (now - created > maxAge) {
                leaks.timers.push({ age: now - created, metadata });
            }
        });
        
        this.intervals.forEach(({ interval, metadata, created }) => {
            if (now - created > maxAge) {
                leaks.intervals.push({ age: now - created, metadata });
            }
        });
        
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ metadata, created }) => {
                if (now - created > maxAge) {
                    leaks.eventListeners.push({ key, age: now - created, metadata });
                }
            });
        });
        
        return leaks;
    }
    
    // Get resource statistics
    getStats() {
        return {
            ...this.stats,
            active: {
                timers: this.timers.size,
                intervals: this.intervals.size,
                eventListeners: Array.from(this.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0),
                fileHandles: this.fileHandles.size,
                connections: this.networkConnections.size
            }
        };
    }
    
    // Setup process handlers for cleanup
    setupProcessHandlers() {
        const cleanup = () => {
            // Minimale Cleanup-Ausgabe
            this.cleanupAll();
        };
        
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
        
        // Uncaught exception handler
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught exception:', error);
            this.cleanupAll();
            process.exit(1);
        });
        
        // Unhandled rejection handler
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled rejection:', reason);
            this.cleanupAll();
        });
    }
}

// Global resource manager instance
export const globalResourceManager = new ResourceManager();
