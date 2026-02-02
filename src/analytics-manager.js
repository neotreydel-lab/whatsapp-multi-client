import { getStorage } from "./storage.js";

export class AnalyticsManager {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.metrics = new Map();
        this.alerts = [];
        this.monitoring = {
            cpu: 0,
            memory: 0,
            responseTime: 0,
            uptime: Date.now()
        };
        
        // Start monitoring
        this.startMonitoring();
    }
    
    // ===== MESSAGE ANALYTICS =====
    
    /**
     * Track message event
     */
    trackMessage(messageData) {
        const timestamp = Date.now();
        const date = new Date().toISOString().split('T')[0];
        const hour = new Date().getHours();
        
        // Daily stats
        this.storage.write.in("analytics").increment(`daily.${date}.messages`, 1);
        this.storage.write.in("analytics").increment(`hourly.${date}.${hour}`, 1);
        
        // Message type stats
        this.storage.write.in("analytics").increment(`messageTypes.${messageData.type}`, 1);
        
        // User stats
        if (messageData.from) {
            this.storage.write.in("analytics").increment(`users.${messageData.from}.messages`, 1);
            this.storage.write.in("analytics").set(`users.${messageData.from}.lastSeen`, timestamp);
        }
        
        // Group stats
        if (messageData.isGroup) {
            this.storage.write.in("analytics").increment(`groups.${messageData.chatId}.messages`, 1);
        }
        
        // Geographic data (if available)
        if (messageData.location) {
            this.storage.write.in("analytics").increment(`geographic.${messageData.location.country}`, 1);
        }
    }
    
    /**
     * Track command usage
     */
    trackCommand(command, userId, success = true) {
        const date = new Date().toISOString().split('T')[0];
        
        this.storage.write.in("analytics").increment(`commands.${command}.total`, 1);
        this.storage.write.in("analytics").increment(`commands.${command}.daily.${date}`, 1);
        
        if (success) {
            this.storage.write.in("analytics").increment(`commands.${command}.success`, 1);
        } else {
            this.storage.write.in("analytics").increment(`commands.${command}.errors`, 1);
        }
        
        // User command stats
        this.storage.write.in("analytics").increment(`users.${userId}.commands.${command}`, 1);
    }
    
    /**
     * Track response time
     */
    trackResponseTime(duration) {
        const date = new Date().toISOString().split('T')[0];
        
        // Store response times for averaging
        const responseTimes = this.storage.read.from("analytics").get(`responseTimes.${date}`) || [];
        responseTimes.push(duration);
        
        // Keep only last 1000 response times per day
        if (responseTimes.length > 1000) {
            responseTimes.shift();
        }
        
        this.storage.write.in("analytics").set(`responseTimes.${date}`, responseTimes);
        
        // Update current monitoring
        this.monitoring.responseTime = duration;
    }
    
    // ===== USER ANALYTICS =====
    
    /**
     * Get user engagement metrics
     */
    getUserEngagement(userId) {
        const userData = this.storage.read.from("analytics").get(`users.${userId}`) || {};
        
        return {
            totalMessages: userData.messages || 0,
            lastSeen: userData.lastSeen ? new Date(userData.lastSeen) : null,
            commands: userData.commands || {},
            isActive: userData.lastSeen && (Date.now() - userData.lastSeen) < 24 * 60 * 60 * 1000,
            engagementScore: this.calculateEngagementScore(userData)
        };
    }
    
    /**
     * Calculate user engagement score
     */
    calculateEngagementScore(userData) {
        const messages = userData.messages || 0;
        const commands = Object.values(userData.commands || {}).reduce((sum, count) => sum + count, 0);
        const lastSeen = userData.lastSeen || 0;
        const daysSinceLastSeen = (Date.now() - lastSeen) / (24 * 60 * 60 * 1000);
        
        let score = 0;
        
        // Message activity (0-40 points)
        score += Math.min(messages * 0.1, 40);
        
        // Command usage (0-30 points)
        score += Math.min(commands * 0.5, 30);
        
        // Recency (0-30 points)
        if (daysSinceLastSeen < 1) score += 30;
        else if (daysSinceLastSeen < 7) score += 20;
        else if (daysSinceLastSeen < 30) score += 10;
        
        return Math.round(score);
    }
    
    /**
     * Get most active users
     */
    getMostActiveUsers(limit = 10) {
        const users = this.storage.read.from("analytics").get("users") || {};
        
        return Object.entries(users)
            .map(([userId, data]) => ({
                userId,
                messages: data.messages || 0,
                commands: Object.values(data.commands || {}).reduce((sum, count) => sum + count, 0),
                lastSeen: data.lastSeen ? new Date(data.lastSeen) : null,
                engagementScore: this.calculateEngagementScore(data)
            }))
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, limit);
    }
    
    // ===== PERFORMANCE MONITORING =====
    
    /**
     * Start system monitoring
     */
    startMonitoring() {
        setInterval(() => {
            this.updateSystemMetrics();
            this.checkAlerts();
        }, 30000); // Every 30 seconds
    }
    
    /**
     * Update system metrics
     */
    updateSystemMetrics() {
        const memUsage = process.memoryUsage();
        
        this.monitoring = {
            cpu: process.cpuUsage(),
            memory: {
                used: memUsage.heapUsed,
                total: memUsage.heapTotal,
                percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
            },
            uptime: Date.now() - this.monitoring.uptime,
            timestamp: Date.now()
        };
        
        // Store metrics
        const date = new Date().toISOString().split('T')[0];
        const hour = new Date().getHours();
        
        this.storage.write.in("analytics").set(`performance.${date}.${hour}`, {
            memory: this.monitoring.memory.percentage,
            responseTime: this.monitoring.responseTime,
            timestamp: Date.now()
        });
    }
    
    /**
     * Check for performance alerts
     */
    checkAlerts() {
        const alerts = [];
        
        // Memory usage alert
        if (this.monitoring.memory.percentage > 80) {
            alerts.push({
                type: 'memory',
                level: 'warning',
                message: `High memory usage: ${this.monitoring.memory.percentage.toFixed(1)}%`,
                timestamp: Date.now()
            });
        }
        
        // Response time alert
        if (this.monitoring.responseTime > 5000) {
            alerts.push({
                type: 'response_time',
                level: 'warning',
                message: `Slow response time: ${this.monitoring.responseTime}ms`,
                timestamp: Date.now()
            });
        }
        
        // Store alerts
        if (alerts.length > 0) {
            this.alerts.push(...alerts);
            this.storage.write.in("analytics").push("alerts", alerts);
            
            // Emit alert events
            alerts.forEach(alert => {
                this.client.emit('performance_alert', alert);
            });
        }
    }
    
    // ===== DETAILED STATISTICS =====
    
    /**
     * Get comprehensive analytics report
     */
    getDetailedStats(days = 7) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
        
        const stats = {
            overview: this.getOverviewStats(),
            messages: this.getMessageStats(days),
            users: this.getUserStats(days),
            commands: this.getCommandStats(days),
            performance: this.getPerformanceStats(days),
            geographic: this.getGeographicStats(),
            timeDistribution: this.getTimeDistribution(days)
        };
        
        return stats;
    }
    
    /**
     * Get overview statistics
     */
    getOverviewStats() {
        const users = this.storage.read.from("analytics").get("users") || {};
        const messageTypes = this.storage.read.from("analytics").get("messageTypes") || {};
        
        return {
            totalUsers: Object.keys(users).length,
            activeUsers: Object.values(users).filter(user => 
                user.lastSeen && (Date.now() - user.lastSeen) < 24 * 60 * 60 * 1000
            ).length,
            totalMessages: Object.values(messageTypes).reduce((sum, count) => sum + count, 0),
            uptime: Date.now() - this.monitoring.uptime,
            currentMemoryUsage: this.monitoring.memory.percentage,
            averageResponseTime: this.monitoring.responseTime
        };
    }
    
    /**
     * Get message statistics
     */
    getMessageStats(days) {
        const messageTypes = this.storage.read.from("analytics").get("messageTypes") || {};
        const dailyStats = [];
        
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
                .toISOString().split('T')[0];
            const dayMessages = this.storage.read.from("analytics").get(`daily.${date}.messages`) || 0;
            
            dailyStats.push({
                date,
                messages: dayMessages
            });
        }
        
        return {
            byType: messageTypes,
            daily: dailyStats.reverse(),
            totalMessages: Object.values(messageTypes).reduce((sum, count) => sum + count, 0)
        };
    }
    
    /**
     * Get user statistics
     */
    getUserStats(days) {
        const users = this.storage.read.from("analytics").get("users") || {};
        const activeUsers = Object.values(users).filter(user => 
            user.lastSeen && (Date.now() - user.lastSeen) < days * 24 * 60 * 60 * 1000
        );
        
        return {
            total: Object.keys(users).length,
            active: activeUsers.length,
            newUsers: this.getNewUsersCount(days),
            topUsers: this.getMostActiveUsers(10),
            engagementDistribution: this.getEngagementDistribution()
        };
    }
    
    /**
     * Get command statistics
     */
    getCommandStats(days) {
        const commands = this.storage.read.from("analytics").get("commands") || {};
        
        return Object.entries(commands).map(([command, data]) => ({
            command,
            total: data.total || 0,
            success: data.success || 0,
            errors: data.errors || 0,
            successRate: data.total ? ((data.success || 0) / data.total * 100).toFixed(1) : 0
        })).sort((a, b) => b.total - a.total);
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats(days) {
        const performanceData = [];
        
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
                .toISOString().split('T')[0];
            
            for (let hour = 0; hour < 24; hour++) {
                const hourData = this.storage.read.from("analytics").get(`performance.${date}.${hour}`);
                if (hourData) {
                    performanceData.push({
                        date,
                        hour,
                        memory: hourData.memory,
                        responseTime: hourData.responseTime
                    });
                }
            }
        }
        
        return {
            data: performanceData.reverse(),
            alerts: this.alerts.slice(-50), // Last 50 alerts
            averageMemory: performanceData.reduce((sum, d) => sum + d.memory, 0) / performanceData.length || 0,
            averageResponseTime: performanceData.reduce((sum, d) => sum + d.responseTime, 0) / performanceData.length || 0
        };
    }
    
    /**
     * Get geographic distribution
     */
    getGeographicStats() {
        return this.storage.read.from("analytics").get("geographic") || {};
    }
    
    /**
     * Get time distribution
     */
    getTimeDistribution(days) {
        const hourlyData = {};
        
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
                .toISOString().split('T')[0];
            
            for (let hour = 0; hour < 24; hour++) {
                const messages = this.storage.read.from("analytics").get(`hourly.${date}.${hour}`) || 0;
                hourlyData[hour] = (hourlyData[hour] || 0) + messages;
            }
        }
        
        return hourlyData;
    }
    
    // ===== HELPER METHODS =====
    
    /**
     * Get new users count
     */
    getNewUsersCount(days) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        const users = this.storage.read.from("analytics").get("users") || {};
        
        return Object.values(users).filter(user => 
            user.firstSeen && user.firstSeen > cutoff
        ).length;
    }
    
    /**
     * Get engagement distribution
     */
    getEngagementDistribution() {
        const users = this.storage.read.from("analytics").get("users") || {};
        const distribution = { low: 0, medium: 0, high: 0 };
        
        Object.values(users).forEach(userData => {
            const score = this.calculateEngagementScore(userData);
            if (score < 30) distribution.low++;
            else if (score < 70) distribution.medium++;
            else distribution.high++;
        });
        
        return distribution;
    }
    
    /**
     * Export analytics data
     */
    exportAnalytics(format = 'json') {
        const data = this.getDetailedStats(30); // 30 days
        
        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return data;
    }
    
    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        // Simplified CSV conversion
        const csv = [];
        
        // Daily messages CSV
        csv.push('Date,Messages');
        data.messages.daily.forEach(day => {
            csv.push(`${day.date},${day.messages}`);
        });
        
        return csv.join('\n');
    }
    
    /**
     * Reset analytics data
     */
    resetAnalytics() {
        this.storage.delete.from("analytics").all();
        this.metrics.clear();
        this.alerts = [];
        
        return true;
    }
}