import { getStorage } from "./storage.js";
import cron from "node-cron";

export class AdvancedScheduler {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.scheduledTasks = new Map();
        this.cronJobs = new Map();
        this.recurringTasks = new Map();
        this.taskQueue = [];
        this.isProcessing = false;
        
        this.initializeScheduler();
    }
    
    // ===== INITIALIZATION =====
    
    initializeScheduler() {
        this.loadScheduledTasks();
        this.startTaskProcessor();
        this.startMaintenanceJob();
    }
    
    loadScheduledTasks() {
        const tasks = this.storage.read.from("scheduler").get("tasks") || {};
        const cronTasks = this.storage.read.from("scheduler").get("cronTasks") || {};
        
        // Restore scheduled tasks
        Object.entries(tasks).forEach(([id, task]) => {
            if (task.executeAt > Date.now()) {
                this.scheduledTasks.set(id, task);
            }
        });
        
        // Restore cron jobs
        Object.entries(cronTasks).forEach(([id, task]) => {
            this.createCronJob(id, task.pattern, task.action, task.data);
        });
    }
    
    startTaskProcessor() {
        setInterval(() => {
            if (!this.isProcessing && this.taskQueue.length > 0) {
                this.processTaskQueue();
            }
        }, 1000);
    }
    
    startMaintenanceJob() {
        // Clean up expired tasks every hour
        cron.schedule('0 * * * *', () => {
            this.cleanupExpiredTasks();
        });
    }
    
    // ===== SCHEDULING METHODS =====
    
    scheduleMessage(chatId, message, executeAt, options = {}) {
        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            type: 'message',
            chatId,
            message,
            executeAt: new Date(executeAt).getTime(),
            options,
            status: 'scheduled',
            createdAt: Date.now()
        };
        
        this.scheduledTasks.set(taskId, task);
        this.saveTask(taskId, task);
        
        return taskId;
    }
    
    scheduleRecurringMessage(chatId, message, pattern, options = {}) {
        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            type: 'recurring_message',
            chatId,
            message,
            pattern,
            options,
            status: 'active',
            createdAt: Date.now()
        };
        
        this.createCronJob(taskId, pattern, 'sendMessage', { chatId, message, options });
        this.recurringTasks.set(taskId, task);
        this.saveCronTask(taskId, task);
        
        return taskId;
    }
    
    scheduleCustomAction(actionName, data, executeAt, options = {}) {
        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            type: 'custom_action',
            actionName,
            data,
            executeAt: new Date(executeAt).getTime(),
            options,
            status: 'scheduled',
            createdAt: Date.now()
        };
        
        this.scheduledTasks.set(taskId, task);
        this.saveTask(taskId, task);
        
        return taskId;
    }
    
    scheduleRecurringAction(actionName, data, pattern, options = {}) {
        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            type: 'recurring_action',
            actionName,
            data,
            pattern,
            options,
            status: 'active',
            createdAt: Date.now()
        };
        
        this.createCronJob(taskId, pattern, actionName, data);
        this.recurringTasks.set(taskId, task);
        this.saveCronTask(taskId, task);
        
        return taskId;
    }
    
    // ===== BULK SCHEDULING =====
    
    scheduleBulkMessages(messages, executeAt, options = {}) {
        const taskIds = [];
        const delay = options.delay || 1000; // 1 second delay between messages
        
        messages.forEach((msg, index) => {
            const adjustedTime = new Date(executeAt).getTime() + (index * delay);
            const taskId = this.scheduleMessage(msg.chatId, msg.message, adjustedTime, msg.options);
            taskIds.push(taskId);
        });
        
        return taskIds;
    }
    
    scheduleMessageChain(chatId, messages, startTime, options = {}) {
        const taskIds = [];
        const delay = options.delay || 2000; // 2 seconds delay between chain messages
        
        messages.forEach((message, index) => {
            const executeTime = new Date(startTime).getTime() + (index * delay);
            const taskId = this.scheduleMessage(chatId, message, executeTime, options);
            taskIds.push(taskId);
        });
        
        return taskIds;
    }
    
    // ===== CONDITIONAL SCHEDULING =====
    
    scheduleConditionalMessage(chatId, message, condition, checkInterval = 60000) {
        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            type: 'conditional_message',
            chatId,
            message,
            condition,
            checkInterval,
            status: 'waiting',
            createdAt: Date.now(),
            lastCheck: Date.now()
        };
        
        this.scheduledTasks.set(taskId, task);
        this.saveTask(taskId, task);
        
        // Start checking condition
        this.startConditionalCheck(taskId);
        
        return taskId;
    }
    
    startConditionalCheck(taskId) {
        const task = this.scheduledTasks.get(taskId);
        if (!task) return;
        
        const checkCondition = async () => {
            try {
                const conditionMet = await this.evaluateCondition(task.condition);
                if (conditionMet) {
                    await this.executeTask(task);
                    this.cancelTask(taskId);
                } else {
                    task.lastCheck = Date.now();
                    setTimeout(checkCondition, task.checkInterval);
                }
            } catch (error) {
                console.error(`Condition check failed for task ${taskId}:`, error);
                this.cancelTask(taskId);
            }
        };
        
        setTimeout(checkCondition, task.checkInterval);
    }
    
    // ===== SMART SCHEDULING =====
    
    scheduleSmartMessage(chatId, message, options = {}) {
        const smartOptions = {
            timezone: options.timezone || 'UTC',
            preferredHours: options.preferredHours || [9, 10, 11, 14, 15, 16, 17],
            avoidWeekends: options.avoidWeekends || false,
            userActivity: options.considerUserActivity || false,
            ...options
        };
        
        const optimalTime = this.calculateOptimalTime(chatId, smartOptions);
        return this.scheduleMessage(chatId, message, optimalTime, smartOptions);
    }
    
    calculateOptimalTime(chatId, options) {
        const now = new Date();
        let optimalTime = new Date(now);
        
        // Add base delay
        optimalTime.setMinutes(optimalTime.getMinutes() + (options.minDelay || 5));
        
        // Adjust for preferred hours
        if (options.preferredHours && options.preferredHours.length > 0) {
            const currentHour = optimalTime.getHours();
            if (!options.preferredHours.includes(currentHour)) {
                const nextPreferredHour = options.preferredHours.find(h => h > currentHour) || options.preferredHours[0];
                if (nextPreferredHour > currentHour) {
                    optimalTime.setHours(nextPreferredHour, 0, 0, 0);
                } else {
                    optimalTime.setDate(optimalTime.getDate() + 1);
                    optimalTime.setHours(nextPreferredHour, 0, 0, 0);
                }
            }
        }
        
        // Avoid weekends if specified
        if (options.avoidWeekends) {
            const dayOfWeek = optimalTime.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                const daysToAdd = dayOfWeek === 0 ? 1 : (7 - dayOfWeek + 1);
                optimalTime.setDate(optimalTime.getDate() + daysToAdd);
                optimalTime.setHours(options.preferredHours[0] || 9, 0, 0, 0);
            }
        }
        
        return optimalTime;
    }
    
    // ===== TASK MANAGEMENT =====
    
    cancelTask(taskId) {
        const task = this.scheduledTasks.get(taskId) || this.recurringTasks.get(taskId);
        if (!task) return false;
        
        // Cancel cron job if it exists
        if (this.cronJobs.has(taskId)) {
            this.cronJobs.get(taskId).destroy();
            this.cronJobs.delete(taskId);
        }
        
        // Remove from maps
        this.scheduledTasks.delete(taskId);
        this.recurringTasks.delete(taskId);
        
        // Remove from storage
        this.removeTask(taskId);
        
        return true;
    }
    
    pauseTask(taskId) {
        const task = this.scheduledTasks.get(taskId) || this.recurringTasks.get(taskId);
        if (!task) return false;
        
        task.status = 'paused';
        
        if (this.cronJobs.has(taskId)) {
            this.cronJobs.get(taskId).stop();
        }
        
        this.saveTask(taskId, task);
        return true;
    }
    
    resumeTask(taskId) {
        const task = this.scheduledTasks.get(taskId) || this.recurringTasks.get(taskId);
        if (!task) return false;
        
        task.status = task.type.includes('recurring') ? 'active' : 'scheduled';
        
        if (this.cronJobs.has(taskId)) {
            this.cronJobs.get(taskId).start();
        }
        
        this.saveTask(taskId, task);
        return true;
    }
    
    updateTask(taskId, updates) {
        const task = this.scheduledTasks.get(taskId) || this.recurringTasks.get(taskId);
        if (!task) return false;
        
        Object.assign(task, updates);
        
        // If it's a recurring task and pattern changed, recreate cron job
        if (task.type.includes('recurring') && updates.pattern) {
            if (this.cronJobs.has(taskId)) {
                this.cronJobs.get(taskId).destroy();
            }
            this.createCronJob(taskId, updates.pattern, task.actionName || 'sendMessage', task.data || { chatId: task.chatId, message: task.message });
        }
        
        this.saveTask(taskId, task);
        return true;
    }
    
    // ===== TASK EXECUTION =====
    
    async processTaskQueue() {
        this.isProcessing = true;
        
        try {
            const now = Date.now();
            const tasksToExecute = [];
            
            // Find tasks ready for execution
            for (const [taskId, task] of this.scheduledTasks) {
                if (task.status === 'scheduled' && task.executeAt <= now) {
                    tasksToExecute.push(task);
                }
            }
            
            // Execute tasks
            for (const task of tasksToExecute) {
                try {
                    await this.executeTask(task);
                    this.scheduledTasks.delete(task.id);
                    this.removeTask(task.id);
                } catch (error) {
                    console.error(`Task execution failed for ${task.id}:`, error);
                    task.status = 'failed';
                    task.error = error.message;
                    this.saveTask(task.id, task);
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }
    
    async executeTask(task) {
        switch (task.type) {
            case 'message':
            case 'conditional_message':
                await this.client.sendMessage(task.chatId, task.message, task.options);
                break;
                
            case 'custom_action':
                await this.executeCustomAction(task.actionName, task.data);
                break;
                
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
        
        // Log execution
        console.log(`✅ Task executed: ${task.id} (${task.type})`);
    }
    
    async executeCustomAction(actionName, data) {
        // This method can be extended to handle custom actions
        if (typeof this.client[actionName] === 'function') {
            await this.client[actionName](data);
        } else {
            throw new Error(`Custom action not found: ${actionName}`);
        }
    }
    
    // ===== CRON JOB MANAGEMENT =====
    
    createCronJob(taskId, pattern, action, data) {
        try {
            const job = cron.schedule(pattern, async () => {
                try {
                    if (action === 'sendMessage') {
                        await this.client.sendMessage(data.chatId, data.message, data.options);
                    } else {
                        await this.executeCustomAction(action, data);
                    }
                    console.log(`🔄 Recurring task executed: ${taskId}`);
                } catch (error) {
                    console.error(`Recurring task failed: ${taskId}`, error);
                }
            }, {
                scheduled: true
            });
            
            this.cronJobs.set(taskId, job);
            return job;
        } catch (error) {
            console.error(`Failed to create cron job: ${taskId}`, error);
            throw error;
        }
    }
    
    // ===== CONDITION EVALUATION =====
    
    async evaluateCondition(condition) {
        try {
            if (typeof condition === 'function') {
                return await condition();
            }
            
            if (typeof condition === 'object') {
                return await this.evaluateObjectCondition(condition);
            }
            
            return Boolean(condition);
        } catch (error) {
            console.error('Condition evaluation failed:', error);
            return false;
        }
    }
    
    async evaluateObjectCondition(condition) {
        const { type, ...params } = condition;
        
        switch (type) {
            case 'time':
                return this.checkTimeCondition(params);
            case 'user_online':
                return await this.checkUserOnlineCondition(params);
            case 'message_count':
                return await this.checkMessageCountCondition(params);
            default:
                return false;
        }
    }
    
    checkTimeCondition(params) {
        const now = new Date();
        const { hour, minute = 0, dayOfWeek } = params;
        
        if (dayOfWeek !== undefined && now.getDay() !== dayOfWeek) {
            return false;
        }
        
        return now.getHours() === hour && now.getMinutes() >= minute;
    }
    
    async checkUserOnlineCondition(params) {
        // This would need to be implemented based on your WhatsApp client's capabilities
        // For now, return true as a placeholder
        return true;
    }
    
    async checkMessageCountCondition(params) {
        // This would check message count in a chat
        // Implementation depends on your storage system
        return true;
    }
    
    // ===== UTILITY METHODS =====
    
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    saveTask(taskId, task) {
        const tasks = this.storage.read.from("scheduler").get("tasks") || {};
        tasks[taskId] = task;
        this.storage.write.to("scheduler").set("tasks", tasks);
    }
    
    saveCronTask(taskId, task) {
        const cronTasks = this.storage.read.from("scheduler").get("cronTasks") || {};
        cronTasks[taskId] = task;
        this.storage.write.to("scheduler").set("cronTasks", cronTasks);
    }
    
    removeTask(taskId) {
        const tasks = this.storage.read.from("scheduler").get("tasks") || {};
        const cronTasks = this.storage.read.from("scheduler").get("cronTasks") || {};
        
        delete tasks[taskId];
        delete cronTasks[taskId];
        
        this.storage.write.to("scheduler").set("tasks", tasks);
        this.storage.write.to("scheduler").set("cronTasks", cronTasks);
    }
    
    cleanupExpiredTasks() {
        const now = Date.now();
        const expiredTasks = [];
        
        for (const [taskId, task] of this.scheduledTasks) {
            if (task.status === 'failed' || (task.executeAt && task.executeAt < now - 86400000)) { // 24 hours old
                expiredTasks.push(taskId);
            }
        }
        
        expiredTasks.forEach(taskId => {
            this.scheduledTasks.delete(taskId);
            this.removeTask(taskId);
        });
        
        console.log(`🧹 Cleaned up ${expiredTasks.length} expired tasks`);
    }
    
    // ===== QUERY METHODS =====
    
    getAllTasks() {
        return {
            scheduled: Array.from(this.scheduledTasks.values()),
            recurring: Array.from(this.recurringTasks.values())
        };
    }
    
    getTask(taskId) {
        return this.scheduledTasks.get(taskId) || this.recurringTasks.get(taskId);
    }
    
    getTasksByChat(chatId) {
        const scheduled = Array.from(this.scheduledTasks.values()).filter(task => task.chatId === chatId);
        const recurring = Array.from(this.recurringTasks.values()).filter(task => task.chatId === chatId);
        
        return { scheduled, recurring };
    }
    
    getTasksByStatus(status) {
        const scheduled = Array.from(this.scheduledTasks.values()).filter(task => task.status === status);
        const recurring = Array.from(this.recurringTasks.values()).filter(task => task.status === status);
        
        return { scheduled, recurring };
    }
    
    getUpcomingTasks(limit = 10) {
        return Array.from(this.scheduledTasks.values())
            .filter(task => task.status === 'scheduled')
            .sort((a, b) => a.executeAt - b.executeAt)
            .slice(0, limit);
    }
    
    // ===== STATISTICS =====
    
    getSchedulerStats() {
        const scheduled = this.scheduledTasks.size;
        const recurring = this.recurringTasks.size;
        const cronJobs = this.cronJobs.size;
        
        const statusCounts = {};
        for (const task of [...this.scheduledTasks.values(), ...this.recurringTasks.values()]) {
            statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
        }
        
        return {
            totalTasks: scheduled + recurring,
            scheduledTasks: scheduled,
            recurringTasks: recurring,
            activeCronJobs: cronJobs,
            statusBreakdown: statusCounts
        };
    }
}