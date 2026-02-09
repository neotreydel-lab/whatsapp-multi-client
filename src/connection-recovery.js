// 🛡️ ULTRA-ROBUSTES CONNECTION RECOVERY SYSTEM
// Automatische Wiederherstellung bei allen Verbindungsproblemen

export class ConnectionRecovery {
    constructor(client, options = {}) {
        this.client = client;
        this.options = {
            maxRetries: options.maxRetries || 10,
            baseDelay: options.baseDelay || 2000,
            maxDelay: options.maxDelay || 60000,
            exponentialBackoff: options.exponentialBackoff !== false,
            jitterFactor: options.jitterFactor || 0.1,
            healthCheckInterval: options.healthCheckInterval || 30000,
            ...options
        };
        
        this.state = {
            isRecovering: false,
            retryCount: 0,
            lastError: null,
            lastSuccessTime: null,
            failureHistory: [],
            recoveryStrategies: []
        };
        
        this.timers = new Set();
        this.healthCheckTimer = null;
    }
    
    // Start automatic health monitoring
    startHealthMonitoring() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.options.healthCheckInterval);
        
        this.timers.add(this.healthCheckTimer);
    }
    
    // Stop all monitoring
    stopHealthMonitoring() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
        
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
    }
    
    // Perform connection health check
    async performHealthCheck() {
        try {
            if (!this.client.isConnected || !this.client.socket) {
                throw new Error('Not connected');
            }
            
            // Ping test
            await this.client.socket.query({
                tag: 'iq',
                attrs: { type: 'get', xmlns: 'w:p', id: 'health_' + Date.now() },
                content: [{ tag: 'ping' }]
            });
            
            this.state.lastSuccessTime = Date.now();
            this.state.retryCount = 0;
            
        } catch (error) {
            console.log('⚠️ Health check failed:', error.message);
            await this.initiateRecovery(error);
        }
    }
    
    // Initiate recovery process
    async initiateRecovery(error) {
        if (this.state.isRecovering) {
            console.log('🔄 Recovery already in progress');
            return;
        }
        
        this.state.isRecovering = true;
        this.state.lastError = error;
        this.state.failureHistory.push({
            error: error.message,
            timestamp: Date.now(),
            retryCount: this.state.retryCount
        });
        
        console.log('🛡️ Initiating connection recovery...');
        
        try {
            await this.executeRecoveryStrategies();
        } catch (recoveryError) {
            console.error('❌ Recovery failed:', recoveryError.message);
        } finally {
            this.state.isRecovering = false;
        }
    }
    
    // Execute recovery strategies in order
    async executeRecoveryStrategies() {
        const strategies = [
            { name: 'Quick Reconnect', fn: () => this.quickReconnect() },
            { name: 'Socket Reset', fn: () => this.socketReset() },
            { name: 'Session Repair', fn: () => this.sessionRepair() },
            { name: 'Full Restart', fn: () => this.fullRestart() }
        ];
        
        for (const strategy of strategies) {
            if (this.state.retryCount >= this.options.maxRetries) {
                throw new Error('Max retries exceeded');
            }
            
            try {
                console.log(`🔧 Trying strategy: ${strategy.name}`);
                await strategy.fn();
                
                // Verify connection
                if (await this.verifyConnection()) {
                    console.log(`✅ Recovery successful with: ${strategy.name}`);
                    this.state.retryCount = 0;
                    return;
                }
            } catch (error) {
                console.log(`⚠️ Strategy ${strategy.name} failed:`, error.message);
                this.state.retryCount++;
                await this.waitWithBackoff();
            }
        }
        
        throw new Error('All recovery strategies failed');
    }
    
    // Strategy 1: Quick reconnect
    async quickReconnect() {
        console.log('🔄 Quick reconnect attempt...');
        
        if (this.client.socket) {
            try {
                await this.client.socket.end();
            } catch (e) {
                // Ignore
            }
        }
        
        await this.client.connect();
    }
    
    // Strategy 2: Socket reset
    async socketReset() {
        console.log('🔌 Socket reset...');
        
        this.client.socket = null;
        this.client.isConnected = false;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.client.connect();
    }
    
    // Strategy 3: Session repair
    async sessionRepair() {
        console.log('🔧 Session repair...');
        
        const validation = await this.client.sessionManager.validateSession();
        
        if (!validation.valid) {
            await this.client.sessionManager.autoRepairSession();
        }
        
        await this.client.connect();
    }
    
    // Strategy 4: Full restart
    async fullRestart() {
        console.log('🚀 Full restart...');
        
        await this.client.sessionManager.cleanupSession();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.client.connect();
    }
    
    // Verify connection is working
    async verifyConnection() {
        try {
            if (!this.client.isConnected || !this.client.socket) {
                return false;
            }
            
            await this.client.socket.query({
                tag: 'iq',
                attrs: { type: 'get', xmlns: 'w:p', id: 'verify_' + Date.now() },
                content: [{ tag: 'ping' }]
            });
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Wait with exponential backoff and jitter
    async waitWithBackoff() {
        let delay = this.options.baseDelay;
        
        if (this.options.exponentialBackoff) {
            delay = Math.min(
                this.options.baseDelay * Math.pow(2, this.state.retryCount),
                this.options.maxDelay
            );
        }
        
        // Add jitter to prevent thundering herd
        const jitter = delay * this.options.jitterFactor * Math.random();
        delay += jitter;
        
        console.log(`⏳ Waiting ${Math.round(delay / 1000)}s before next attempt...`);
        
        await new Promise(resolve => {
            const timer = setTimeout(resolve, delay);
            this.timers.add(timer);
        });
    }
    
    // Get recovery statistics
    getStats() {
        return {
            isRecovering: this.state.isRecovering,
            retryCount: this.state.retryCount,
            lastError: this.state.lastError?.message,
            lastSuccessTime: this.state.lastSuccessTime,
            failureCount: this.state.failureHistory.length,
            recentFailures: this.state.failureHistory.slice(-5)
        };
    }
    
    // Reset recovery state
    reset() {
        this.state.retryCount = 0;
        this.state.lastError = null;
        this.state.failureHistory = [];
        console.log('🔄 Recovery state reset');
    }
    
    // Cleanup
    cleanup() {
        this.stopHealthMonitoring();
        this.state.isRecovering = false;
    }
}
