import { getStorage } from "./storage.js";
import { ErrorHandler } from "./error-handler.js";

export class ReportingManager {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.errorHandler = new ErrorHandler();
        this.reports = new Map();
        this.scheduledReports = new Map();
        this.dashboards = new Map();
        this.metrics = new Map();
        this.alerts = new Map();
        
        this.initializeReporting();
    }
    
    // ===== INITIALIZATION =====
    
    initializeReporting() {
        this.loadReportingData();
        this.setupDefaultMetrics();
        this.startReportingJobs();
    }
    
    loadReportingData() {
        try {
            const reportingData = this.storage.read.from("reporting").get("data") || {};
            this.reports = new Map(Object.entries(reportingData.reports || {}));
            this.scheduledReports = new Map(Object.entries(reportingData.scheduledReports || {}));
            this.dashboards = new Map(Object.entries(reportingData.dashboards || {}));
            this.metrics = new Map(Object.entries(reportingData.metrics || {}));
            this.alerts = new Map(Object.entries(reportingData.alerts || {}));
        } catch (error) {
            this.errorHandler.handle(error, 'ReportingManager.loadReportingData');
        }
    }
    
    setupDefaultMetrics() {
        // Message metrics
        this.registerMetric('messages_sent', {
            name: 'Messages Sent',
            description: 'Total number of messages sent',
            type: 'counter',
            aggregation: 'sum',
            category: 'messaging'
        });
        
        this.registerMetric('messages_received', {
            name: 'Messages Received',
            description: 'Total number of messages received',
            type: 'counter',
            aggregation: 'sum',
            category: 'messaging'
        });
        
        // User metrics
        this.registerMetric('active_users', {
            name: 'Active Users',
            description: 'Number of active users',
            type: 'gauge',
            aggregation: 'count_distinct',
            category: 'users'
        });
        
        this.registerMetric('new_users', {
            name: 'New Users',
            description: 'Number of new users',
            type: 'counter',
            aggregation: 'sum',
            category: 'users'
        });
        
        // Performance metrics
        this.registerMetric('response_time', {
            name: 'Response Time',
            description: 'Average response time in milliseconds',
            type: 'histogram',
            aggregation: 'avg',
            category: 'performance'
        });
        
        this.registerMetric('error_rate', {
            name: 'Error Rate',
            description: 'Percentage of errors',
            type: 'gauge',
            aggregation: 'rate',
            category: 'performance'
        });
    }
    
    startReportingJobs() {
        // Generate scheduled reports
        setInterval(() => {
            this.processScheduledReports();
        }, 60000); // Every minute
        
        // Update real-time metrics
        setInterval(() => {
            this.updateRealTimeMetrics();
        }, 30000); // Every 30 seconds
        
        // Check alerts
        setInterval(() => {
            this.checkAlerts();
        }, 60000); // Every minute
    }
    
    // ===== METRIC MANAGEMENT =====
    
    registerMetric(metricId, config) {
        const metric = {
            id: metricId,
            name: config.name,
            description: config.description,
            type: config.type, // counter, gauge, histogram
            aggregation: config.aggregation, // sum, avg, count, count_distinct, rate
            category: config.category,
            unit: config.unit || '',
            tags: config.tags || [],
            createdAt: new Date(),
            isActive: true
        };
        
        this.metrics.set(metricId, metric);
        this.saveReportingData();
        
        console.log(`📊 Metric registered: ${metric.name}`);
    }
    
    recordMetric(metricId, value, tags = {}, timestamp = new Date()) {
        try {
            const metric = this.metrics.get(metricId);
            if (!metric || !metric.isActive) return false;
            
            const dataPoint = {
                metricId,
                value,
                tags,
                timestamp,
                recordedAt: new Date()
            };
            
            // Store in time series data
            const timeSeriesKey = `${metricId}:timeseries`;
            const timeSeries = this.storage.read.from("metrics").get(timeSeriesKey) || [];
            timeSeries.push(dataPoint);
            
            // Keep only last 10000 data points per metric
            if (timeSeries.length > 10000) {
                timeSeries.splice(0, timeSeries.length - 10000);
            }
            
            this.storage.write.to("metrics").set(timeSeriesKey, timeSeries);
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'ReportingManager.recordMetric');
            return false;
        }
    }
    
    incrementCounter(metricId, increment = 1, tags = {}) {
        return this.recordMetric(metricId, increment, tags);
    }
    
    setGauge(metricId, value, tags = {}) {
        return this.recordMetric(metricId, value, tags);
    }
    
    recordHistogram(metricId, value, tags = {}) {
        return this.recordMetric(metricId, value, tags);
    }
    
    // ===== REPORT GENERATION =====
    
    async generateReport(config) {
        try {
            const reportId = this.generateReportId();
            const report = {
                id: reportId,
                name: config.name,
                description: config.description || '',
                type: config.type || 'standard', // standard, dashboard, alert
                format: config.format || 'text', // text, html, json, csv
                metrics: config.metrics || [],
                filters: config.filters || {},
                timeRange: config.timeRange || { period: '24h' },
                groupBy: config.groupBy || [],
                sortBy: config.sortBy || [],
                limit: config.limit || 100,
                generatedAt: new Date(),
                generatedBy: config.generatedBy,
                status: 'generating'
            };
            
            this.reports.set(reportId, report);
            
            // Generate report data
            const reportData = await this.collectReportData(report);
            report.data = reportData;
            report.status = 'completed';
            report.completedAt = new Date();
            
            // Format report
            const formattedReport = await this.formatReport(report);
            report.formattedContent = formattedReport;
            
            this.saveReportingData();
            
            console.log(`📋 Report generated: ${report.name}`);
            return reportId;
        } catch (error) {
            this.errorHandler.handle(error, 'ReportingManager.generateReport');
            throw error;
        }
    }
    
    async collectReportData(report) {
        const data = {
            summary: {},
            metrics: {},
            timeSeries: {},
            breakdown: {}
        };
        
        const timeRange = this.parseTimeRange(report.timeRange);
        
        for (const metricId of report.metrics) {
            const metric = this.metrics.get(metricId);
            if (!metric) continue;
            
            // Get time series data
            const timeSeries = await this.getMetricTimeSeries(metricId, timeRange, report.filters);
            data.timeSeries[metricId] = timeSeries;
            
            // Calculate aggregated values
            const aggregatedValue = this.aggregateMetricData(timeSeries, metric.aggregation);
            data.metrics[metricId] = {
                name: metric.name,
                value: aggregatedValue,
                unit: metric.unit,
                change: await this.calculateMetricChange(metricId, timeRange),
                trend: this.calculateTrend(timeSeries)
            };
            
            // Generate breakdown if requested
            if (report.groupBy.length > 0) {
                data.breakdown[metricId] = await this.generateMetricBreakdown(
                    metricId, 
                    timeRange, 
                    report.groupBy, 
                    report.filters
                );
            }
        }
        
        // Generate summary
        data.summary = {
            totalMetrics: report.metrics.length,
            timeRange: timeRange,
            generatedAt: new Date(),
            dataPoints: Object.values(data.timeSeries).reduce((sum, series) => sum + series.length, 0)
        };
        
        return data;
    }
    
    async getMetricTimeSeries(metricId, timeRange, filters = {}) {
        const timeSeriesKey = `${metricId}:timeseries`;
        const allData = this.storage.read.from("metrics").get(timeSeriesKey) || [];
        
        // Filter by time range
        let filteredData = allData.filter(point => {
            const pointTime = new Date(point.timestamp);
            return pointTime >= timeRange.start && pointTime <= timeRange.end;
        });
        
        // Apply additional filters
        if (Object.keys(filters).length > 0) {
            filteredData = filteredData.filter(point => {
                return Object.entries(filters).every(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.includes(point.tags[key]);
                    }
                    return point.tags[key] === value;
                });
            });
        }
        
        return filteredData;
    }
    
    aggregateMetricData(timeSeries, aggregationType) {
        if (timeSeries.length === 0) return 0;
        
        const values = timeSeries.map(point => point.value);
        
        switch (aggregationType) {
            case 'sum':
                return values.reduce((sum, val) => sum + val, 0);
            case 'avg':
                return values.reduce((sum, val) => sum + val, 0) / values.length;
            case 'count':
                return values.length;
            case 'count_distinct':
                return new Set(values).size;
            case 'min':
                return Math.min(...values);
            case 'max':
                return Math.max(...values);
            case 'rate':
                const timeSpan = (new Date(timeSeries[timeSeries.length - 1].timestamp) - 
                               new Date(timeSeries[0].timestamp)) / 1000; // in seconds
                return timeSpan > 0 ? values.reduce((sum, val) => sum + val, 0) / timeSpan : 0;
            default:
                return values[values.length - 1] || 0;
        }
    }
    
    async calculateMetricChange(metricId, currentTimeRange) {
        // Calculate change compared to previous period
        const periodDuration = currentTimeRange.end - currentTimeRange.start;
        const previousTimeRange = {
            start: new Date(currentTimeRange.start.getTime() - periodDuration),
            end: currentTimeRange.start
        };
        
        const currentData = await this.getMetricTimeSeries(metricId, currentTimeRange);
        const previousData = await this.getMetricTimeSeries(metricId, previousTimeRange);
        
        const metric = this.metrics.get(metricId);
        const currentValue = this.aggregateMetricData(currentData, metric.aggregation);
        const previousValue = this.aggregateMetricData(previousData, metric.aggregation);
        
        if (previousValue === 0) return null;
        
        const change = ((currentValue - previousValue) / previousValue) * 100;
        
        return {
            percentage: change,
            absolute: currentValue - previousValue,
            isPositive: change > 0
        };
    }
    
    calculateTrend(timeSeries) {
        if (timeSeries.length < 2) return 'stable';
        
        const values = timeSeries.map(point => point.value);
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (changePercent > 5) return 'increasing';
        if (changePercent < -5) return 'decreasing';
        return 'stable';
    }
    
    // ===== REPORT FORMATTING =====
    
    async formatReport(report) {
        switch (report.format) {
            case 'text':
                return this.formatTextReport(report);
            case 'html':
                return this.formatHtmlReport(report);
            case 'json':
                return JSON.stringify(report.data, null, 2);
            case 'csv':
                return this.formatCsvReport(report);
            default:
                return this.formatTextReport(report);
        }
    }
    
    formatTextReport(report) {
        let content = `📊 *${report.name}*\n`;
        content += `📅 ${report.data.summary.timeRange.start.toLocaleDateString()} - ${report.data.summary.timeRange.end.toLocaleDateString()}\n\n`;
        
        // Summary
        content += `📈 *Zusammenfassung:*\n`;
        content += `• Metriken: ${report.data.summary.totalMetrics}\n`;
        content += `• Datenpunkte: ${report.data.summary.dataPoints}\n`;
        content += `• Generiert: ${report.data.summary.generatedAt.toLocaleString()}\n\n`;
        
        // Metrics
        content += `📊 *Metriken:*\n`;
        Object.entries(report.data.metrics).forEach(([metricId, metricData]) => {
            content += `\n*${metricData.name}:*\n`;
            content += `• Wert: ${this.formatNumber(metricData.value)} ${metricData.unit}\n`;
            
            if (metricData.change) {
                const changeIcon = metricData.change.isPositive ? '📈' : '📉';
                content += `• Änderung: ${changeIcon} ${metricData.change.percentage.toFixed(1)}%\n`;
            }
            
            content += `• Trend: ${this.getTrendIcon(metricData.trend)} ${metricData.trend}\n`;
        });
        
        // Breakdown
        if (Object.keys(report.data.breakdown).length > 0) {
            content += `\n📋 *Aufschlüsselung:*\n`;
            Object.entries(report.data.breakdown).forEach(([metricId, breakdown]) => {
                const metric = this.metrics.get(metricId);
                content += `\n*${metric.name} nach Kategorien:*\n`;
                
                breakdown.slice(0, 5).forEach((item, index) => {
                    content += `${index + 1}. ${item.category}: ${this.formatNumber(item.value)} ${metric.unit}\n`;
                });
            });
        }
        
        return content;
    }
    
    formatHtmlReport(report) {
        let html = `
        <html>
        <head>
            <title>${report.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
                .metric { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .value { font-size: 24px; font-weight: bold; color: #2196F3; }
                .change.positive { color: #4CAF50; }
                .change.negative { color: #f44336; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 ${report.name}</h1>
                <p>📅 ${report.data.summary.timeRange.start.toLocaleDateString()} - ${report.data.summary.timeRange.end.toLocaleDateString()}</p>
            </div>
        `;
        
        // Metrics
        html += '<h2>📊 Metriken</h2>';
        Object.entries(report.data.metrics).forEach(([metricId, metricData]) => {
            const changeClass = metricData.change?.isPositive ? 'positive' : 'negative';
            html += `
            <div class="metric">
                <h3>${metricData.name}</h3>
                <div class="value">${this.formatNumber(metricData.value)} ${metricData.unit}</div>
                ${metricData.change ? `<div class="change ${changeClass}">Änderung: ${metricData.change.percentage.toFixed(1)}%</div>` : ''}
                <div>Trend: ${this.getTrendIcon(metricData.trend)} ${metricData.trend}</div>
            </div>
            `;
        });
        
        html += '</body></html>';
        return html;
    }
    
    formatCsvReport(report) {
        let csv = 'Metric,Value,Unit,Change %,Trend\n';
        
        Object.entries(report.data.metrics).forEach(([metricId, metricData]) => {
            csv += `"${metricData.name}",${metricData.value},"${metricData.unit}",`;
            csv += `${metricData.change ? metricData.change.percentage.toFixed(2) : ''},"${metricData.trend}"\n`;
        });
        
        return csv;
    }
    
    // ===== SCHEDULED REPORTS =====
    
    scheduleReport(config) {
        try {
            const scheduleId = this.generateScheduleId();
            const schedule = {
                id: scheduleId,
                name: config.name,
                reportConfig: config.reportConfig,
                schedule: config.schedule, // cron expression
                recipients: config.recipients || [],
                isActive: true,
                createdAt: new Date(),
                lastRun: null,
                nextRun: this.calculateNextRun(config.schedule)
            };
            
            this.scheduledReports.set(scheduleId, schedule);
            this.saveReportingData();
            
            console.log(`⏰ Report scheduled: ${schedule.name}`);
            return scheduleId;
        } catch (error) {
            this.errorHandler.handle(error, 'ReportingManager.scheduleReport');
            throw error;
        }
    }
    
    async processScheduledReports() {
        const now = new Date();
        
        for (const [scheduleId, schedule] of this.scheduledReports) {
            if (!schedule.isActive) continue;
            if (schedule.nextRun > now) continue;
            
            try {
                // Generate report
                const reportId = await this.generateReport({
                    ...schedule.reportConfig,
                    generatedBy: 'scheduler'
                });
                
                const report = this.reports.get(reportId);
                
                // Send to recipients
                await this.sendReportToRecipients(report, schedule.recipients);
                
                // Update schedule
                schedule.lastRun = now;
                schedule.nextRun = this.calculateNextRun(schedule.schedule);
                
                console.log(`📧 Scheduled report sent: ${schedule.name}`);
            } catch (error) {
                this.errorHandler.handle(error, 'ReportingManager.processScheduledReports');
            }
        }
    }
    
    async sendReportToRecipients(report, recipients) {
        for (const recipient of recipients) {
            try {
                await this.client.sendMessage(recipient, report.formattedContent);
            } catch (error) {
                console.error(`Failed to send report to ${recipient}:`, error);
            }
        }
    }
    
    // ===== DASHBOARDS =====
    
    createDashboard(config) {
        try {
            const dashboardId = this.generateDashboardId();
            const dashboard = {
                id: dashboardId,
                name: config.name,
                description: config.description || '',
                widgets: config.widgets || [],
                layout: config.layout || 'grid',
                refreshInterval: config.refreshInterval || 300000, // 5 minutes
                isPublic: config.isPublic || false,
                createdAt: new Date(),
                createdBy: config.createdBy,
                lastUpdated: new Date()
            };
            
            this.dashboards.set(dashboardId, dashboard);
            this.saveReportingData();
            
            console.log(`📊 Dashboard created: ${dashboard.name}`);
            return dashboardId;
        } catch (error) {
            this.errorHandler.handle(error, 'ReportingManager.createDashboard');
            throw error;
        }
    }
    
    async updateDashboard(dashboardId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return null;
        
        const updatedWidgets = [];
        
        for (const widget of dashboard.widgets) {
            const widgetData = await this.generateWidgetData(widget);
            updatedWidgets.push({
                ...widget,
                data: widgetData,
                lastUpdated: new Date()
            });
        }
        
        dashboard.widgets = updatedWidgets;
        dashboard.lastUpdated = new Date();
        
        this.saveReportingData();
        return dashboard;
    }
    
    async generateWidgetData(widget) {
        const timeRange = this.parseTimeRange(widget.timeRange || { period: '24h' });
        
        switch (widget.type) {
            case 'metric':
                return await this.generateMetricWidget(widget, timeRange);
            case 'chart':
                return await this.generateChartWidget(widget, timeRange);
            case 'table':
                return await this.generateTableWidget(widget, timeRange);
            default:
                return null;
        }
    }
    
    // ===== ALERTS =====
    
    createAlert(config) {
        try {
            const alertId = this.generateAlertId();
            const alert = {
                id: alertId,
                name: config.name,
                description: config.description || '',
                metricId: config.metricId,
                condition: config.condition, // { operator: 'gt', value: 100 }
                threshold: config.threshold,
                severity: config.severity || 'medium', // low, medium, high, critical
                recipients: config.recipients || [],
                isActive: true,
                cooldownPeriod: config.cooldownPeriod || 300000, // 5 minutes
                lastTriggered: null,
                createdAt: new Date()
            };
            
            this.alerts.set(alertId, alert);
            this.saveReportingData();
            
            console.log(`🚨 Alert created: ${alert.name}`);
            return alertId;
        } catch (error) {
            this.errorHandler.handle(error, 'ReportingManager.createAlert');
            throw error;
        }
    }
    
    async checkAlerts() {
        const now = new Date();
        
        for (const [alertId, alert] of this.alerts) {
            if (!alert.isActive) continue;
            
            // Check cooldown period
            if (alert.lastTriggered && (now - alert.lastTriggered) < alert.cooldownPeriod) {
                continue;
            }
            
            try {
                const shouldTrigger = await this.evaluateAlertCondition(alert);
                
                if (shouldTrigger) {
                    await this.triggerAlert(alert);
                    alert.lastTriggered = now;
                }
            } catch (error) {
                this.errorHandler.handle(error, 'ReportingManager.checkAlerts');
            }
        }
    }
    
    async evaluateAlertCondition(alert) {
        const timeRange = this.parseTimeRange({ period: '5m' }); // Last 5 minutes
        const timeSeries = await this.getMetricTimeSeries(alert.metricId, timeRange);
        
        if (timeSeries.length === 0) return false;
        
        const metric = this.metrics.get(alert.metricId);
        const currentValue = this.aggregateMetricData(timeSeries, metric.aggregation);
        
        switch (alert.condition.operator) {
            case 'gt':
                return currentValue > alert.condition.value;
            case 'gte':
                return currentValue >= alert.condition.value;
            case 'lt':
                return currentValue < alert.condition.value;
            case 'lte':
                return currentValue <= alert.condition.value;
            case 'eq':
                return currentValue === alert.condition.value;
            case 'ne':
                return currentValue !== alert.condition.value;
            default:
                return false;
        }
    }
    
    async triggerAlert(alert) {
        const metric = this.metrics.get(alert.metricId);
        const severityIcon = this.getSeverityIcon(alert.severity);
        
        const message = `${severityIcon} *ALERT: ${alert.name}*\n\n` +
                       `📊 Metrik: ${metric.name}\n` +
                       `⚠️ Bedingung: ${alert.condition.operator} ${alert.condition.value}\n` +
                       `🕐 Zeit: ${new Date().toLocaleString()}\n\n` +
                       `${alert.description}`;
        
        // Send to recipients
        for (const recipient of alert.recipients) {
            try {
                await this.client.sendMessage(recipient, message);
            } catch (error) {
                console.error(`Failed to send alert to ${recipient}:`, error);
            }
        }
        
        console.log(`🚨 Alert triggered: ${alert.name}`);
    }
    
    // ===== UTILITY METHODS =====
    
    parseTimeRange(timeRange) {
        const now = new Date();
        let start, end;
        
        if (timeRange.start && timeRange.end) {
            start = new Date(timeRange.start);
            end = new Date(timeRange.end);
        } else if (timeRange.period) {
            const period = timeRange.period;
            const match = period.match(/^(\d+)([hdwmy])$/);
            
            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2];
                
                let milliseconds;
                switch (unit) {
                    case 'h': milliseconds = value * 60 * 60 * 1000; break;
                    case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
                    case 'w': milliseconds = value * 7 * 24 * 60 * 60 * 1000; break;
                    case 'm': milliseconds = value * 30 * 24 * 60 * 60 * 1000; break;
                    case 'y': milliseconds = value * 365 * 24 * 60 * 60 * 1000; break;
                    default: milliseconds = 24 * 60 * 60 * 1000; // 1 day
                }
                
                start = new Date(now.getTime() - milliseconds);
                end = now;
            } else {
                // Default to last 24 hours
                start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                end = now;
            }
        } else {
            // Default to last 24 hours
            start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            end = now;
        }
        
        return { start, end };
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toFixed(0);
    }
    
    getTrendIcon(trend) {
        switch (trend) {
            case 'increasing': return '📈';
            case 'decreasing': return '📉';
            case 'stable': return '➡️';
            default: return '📊';
        }
    }
    
    getSeverityIcon(severity) {
        switch (severity) {
            case 'low': return '🟡';
            case 'medium': return '🟠';
            case 'high': return '🔴';
            case 'critical': return '🚨';
            default: return '⚠️';
        }
    }
    
    calculateNextRun(cronExpression) {
        // Simple cron parser - in production, use a proper cron library
        const now = new Date();
        return new Date(now.getTime() + 60 * 60 * 1000); // Next hour as fallback
    }
    
    generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    generateScheduleId() {
        return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    generateDashboardId() {
        return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    updateRealTimeMetrics() {
        // Update real-time metrics like active users, response times, etc.
        // This would integrate with your actual application metrics
        
        // Example: Record current active users
        const activeUsers = this.client.getActiveUsersCount?.() || 0;
        this.setGauge('active_users', activeUsers);
        
        // Example: Record response time
        const responseTime = this.client.getAverageResponseTime?.() || 0;
        this.recordHistogram('response_time', responseTime);
    }
    
    saveReportingData() {
        try {
            const reportingData = {
                reports: Object.fromEntries(this.reports),
                scheduledReports: Object.fromEntries(this.scheduledReports),
                dashboards: Object.fromEntries(this.dashboards),
                metrics: Object.fromEntries(this.metrics),
                alerts: Object.fromEntries(this.alerts)
            };
            
            this.storage.write.to("reporting").set("data", reportingData);
        } catch (error) {
            this.errorHandler.handle(error, 'ReportingManager.saveReportingData');
        }
    }
    
    // ===== PUBLIC API =====
    
    getAllReports() {
        return Array.from(this.reports.values());
    }
    
    getReport(reportId) {
        return this.reports.get(reportId);
    }
    
    getAllDashboards() {
        return Array.from(this.dashboards.values());
    }
    
    getDashboard(dashboardId) {
        return this.dashboards.get(dashboardId);
    }
    
    getAllMetrics() {
        return Array.from(this.metrics.values());
    }
    
    getMetric(metricId) {
        return this.metrics.get(metricId);
    }
    
    getAllAlerts() {
        return Array.from(this.alerts.values());
    }
    
    getAlert(alertId) {
        return this.alerts.get(alertId);
    }
}