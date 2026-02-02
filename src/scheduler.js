// Scheduler System für WAEngine
import cron from 'node-cron';

export class Scheduler {
    constructor(client) {
        this.client = client;
        this.jobs = new Map();
        this.storage = client.storage;
        
        // Gespeicherte Jobs beim Start laden
        this.loadScheduledJobs();
        
        // Stille Initialisierung - keine Console-Spam
    }

    // ===== CRON SCHEDULING =====
    
    schedule(cronExpression, chatId, message, options = {}) {
        // Input-Validierung
        if (!cronExpression || typeof cronExpression !== 'string') {
            throw new Error('❌ Cron-Ausdruck ist erforderlich');
        }
        
        if (!chatId || typeof chatId !== 'string') {
            throw new Error('❌ Chat-ID ist erforderlich');
        }
        
        if (!message || typeof message !== 'string') {
            throw new Error('❌ Nachricht ist erforderlich');
        }
        
        const jobId = options.id || `job_${Date.now()}`;
        
        if (!cron.validate(cronExpression)) {
            throw new Error(`❌ Ungültiger Cron-Ausdruck: ${cronExpression}`);
        }

        const job = cron.schedule(cronExpression, async () => {
            try {
                await this.executeJob(chatId, message, options);
            } catch (error) {
                console.error(`❌ Scheduled Job Fehler (${jobId}):`, error);
            }
        }, {
            scheduled: false,
            timezone: options.timezone || 'Europe/Berlin'
        });

        // Job speichern
        const jobData = {
            id: jobId,
            type: 'cron',
            cronExpression,
            chatId,
            message,
            options,
            createdAt: new Date().toISOString(),
            active: true
        };

        this.jobs.set(jobId, { job, data: jobData });
        this.saveJob(jobData);
        
        // Job starten
        job.start();
        
        console.log(`📅 Cron Job erstellt: ${jobId} (${cronExpression})`);
        return jobId;
    }

    // ===== ONE-TIME SCHEDULING =====
    
    scheduleOnce(date, chatId, message, options = {}) {
        const jobId = options.id || `once_${Date.now()}`;
        const targetDate = new Date(date);
        const now = new Date();
        
        if (targetDate <= now) {
            throw new Error('❌ Datum muss in der Zukunft liegen!');
        }

        const delay = targetDate - now;
        
        const timeout = setTimeout(async () => {
            try {
                await this.executeJob(chatId, message, options);
                this.removeJob(jobId); // Job nach Ausführung entfernen
            } catch (error) {
                console.error(`❌ Scheduled Job Fehler (${jobId}):`, error);
            }
        }, delay);

        // Job speichern
        const jobData = {
            id: jobId,
            type: 'once',
            scheduledFor: targetDate.toISOString(),
            chatId,
            message,
            options,
            createdAt: new Date().toISOString(),
            active: true
        };

        this.jobs.set(jobId, { timeout, data: jobData });
        this.saveJob(jobData);
        
        console.log(`📅 One-time Job erstellt: ${jobId} (${targetDate})`);
        return jobId;
    }

    // ===== CONVENIENCE METHODS =====
    
    daily(time, chatId, message, options = {}) {
        const [hour, minute] = time.split(':');
        const cronExpression = `${minute || 0} ${hour} * * *`;
        return this.schedule(cronExpression, chatId, message, { ...options, type: 'daily' });
    }

    weekly(day, time, chatId, message, options = {}) {
        const [hour, minute] = time.split(':');
        const dayMap = {
            'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
            'friday': 5, 'saturday': 6, 'sunday': 0
        };
        const dayNum = dayMap[day.toLowerCase()] ?? day;
        const cronExpression = `${minute || 0} ${hour} * * ${dayNum}`;
        return this.schedule(cronExpression, chatId, message, { ...options, type: 'weekly' });
    }

    monthly(day, time, chatId, message, options = {}) {
        const [hour, minute] = time.split(':');
        const cronExpression = `${minute || 0} ${hour} ${day} * *`;
        return this.schedule(cronExpression, chatId, message, { ...options, type: 'monthly' });
    }

    // ===== WAITING SYSTEM =====
    
    createWaiting() {
        return {
            after: {
                message: (ms) => {
                    return new Promise(resolve => {
                        setTimeout(resolve, ms);
                    });
                }
            }
        };
    }

    // ===== JOB EXECUTION =====
    
    async executeJob(chatId, message, options = {}) {
        try {
            // Message kann String oder Function sein
            let finalMessage = message;
            
            if (typeof message === 'function') {
                finalMessage = await message();
            }
            
            // Template-Variablen ersetzen
            if (typeof finalMessage === 'string') {
                finalMessage = this.processTemplate(finalMessage);
            }

            // Nachricht senden
            await this.client.socket.sendMessage(chatId, { text: finalMessage });
            
            console.log(`📅 Scheduled message sent to ${chatId}: ${finalMessage.substring(0, 50)}...`);
            
            // Statistik speichern
            this.storage.write.in("scheduler-stats").increment("totalExecuted", 1);
            
        } catch (error) {
            console.error('❌ Job Execution Fehler:', error);
            throw error;
        }
    }

    // ===== TEMPLATE PROCESSING =====
    
    processTemplate(text) {
        const now = new Date();
        
        return text
            .replace('{time}', now.toLocaleTimeString('de-DE'))
            .replace('{date}', now.toLocaleDateString('de-DE'))
            .replace('{datetime}', now.toLocaleString('de-DE'))
            .replace('{day}', now.toLocaleDateString('de-DE', { weekday: 'long' }))
            .replace('{timestamp}', now.getTime());
    }

    // ===== JOB MANAGEMENT =====
    
    removeJob(jobId) {
        const jobEntry = this.jobs.get(jobId);
        
        if (!jobEntry) {
            return false;
        }

        // Job stoppen
        if (jobEntry.job) {
            jobEntry.job.stop();
        } else if (jobEntry.timeout) {
            clearTimeout(jobEntry.timeout);
        }

        // Aus Memory und Storage entfernen
        this.jobs.delete(jobId);
        this.deleteJob(jobId);
        
        console.log(`📅 Job entfernt: ${jobId}`);
        return true;
    }

    pauseJob(jobId) {
        const jobEntry = this.jobs.get(jobId);
        
        if (jobEntry?.job) {
            jobEntry.job.stop();
            jobEntry.data.active = false;
            this.saveJob(jobEntry.data);
            return true;
        }
        
        return false;
    }

    resumeJob(jobId) {
        const jobEntry = this.jobs.get(jobId);
        
        if (jobEntry?.job) {
            jobEntry.job.start();
            jobEntry.data.active = true;
            this.saveJob(jobEntry.data);
            return true;
        }
        
        return false;
    }

    // ===== STORAGE METHODS =====
    
    saveJob(jobData) {
        const jobs = this.storage.read.from("scheduled-jobs").all() || [];
        const existingIndex = jobs.findIndex(job => job.id === jobData.id);
        
        if (existingIndex >= 0) {
            jobs[existingIndex] = jobData;
        } else {
            jobs.push(jobData);
        }
        
        this.storage.write.in("scheduled-jobs").data(jobs);
    }

    deleteJob(jobId) {
        const jobs = this.storage.read.from("scheduled-jobs").all() || [];
        const updatedJobs = jobs.filter(job => job.id !== jobId);
        this.storage.write.in("scheduled-jobs").data(updatedJobs);
    }

    loadScheduledJobs() {
        const jobs = this.storage.read.from("scheduled-jobs").all() || [];
        
        for (const jobData of jobs) {
            try {
                if (jobData.type === 'cron' && jobData.active) {
                    // Cron Jobs wieder starten
                    const job = cron.schedule(jobData.cronExpression, async () => {
                        await this.executeJob(jobData.chatId, jobData.message, jobData.options);
                    }, {
                        scheduled: true,
                        timezone: jobData.options.timezone || 'Europe/Berlin'
                    });
                    
                    this.jobs.set(jobData.id, { job, data: jobData });
                    console.log(`📅 Cron Job wiederhergestellt: ${jobData.id}`);
                    
                } else if (jobData.type === 'once') {
                    // One-time Jobs prüfen ob noch gültig
                    const targetDate = new Date(jobData.scheduledFor);
                    const now = new Date();
                    
                    if (targetDate > now) {
                        const delay = targetDate - now;
                        const timeout = setTimeout(async () => {
                            await this.executeJob(jobData.chatId, jobData.message, jobData.options);
                            this.removeJob(jobData.id);
                        }, delay);
                        
                        this.jobs.set(jobData.id, { timeout, data: jobData });
                        console.log(`📅 One-time Job wiederhergestellt: ${jobData.id}`);
                    } else {
                        // Abgelaufene Jobs entfernen
                        this.deleteJob(jobData.id);
                    }
                }
            } catch (error) {
                console.error(`❌ Fehler beim Laden von Job ${jobData.id}:`, error);
            }
        }
    }

    // ===== STATISTICS =====
    
    getStats() {
        const jobs = Array.from(this.jobs.values());
        const scheduledJobs = this.storage.read.from("scheduled-jobs").all() || [];
        const stats = this.storage.read.from("scheduler-stats").all() || {};
        
        return {
            activeJobs: jobs.length,
            totalJobs: scheduledJobs.length,
            cronJobs: jobs.filter(j => j.data.type === 'cron').length,
            onceJobs: jobs.filter(j => j.data.type === 'once').length,
            totalExecuted: stats.totalExecuted || 0,
            jobs: jobs.map(j => ({
                id: j.data.id,
                type: j.data.type,
                chatId: j.data.chatId,
                active: j.data.active,
                createdAt: j.data.createdAt
            }))
        };
    }

    // ===== JOB LISTING =====
    
    listJobs() {
        return Array.from(this.jobs.values()).map(jobEntry => jobEntry.data);
    }
}