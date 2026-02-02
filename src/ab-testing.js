import { getStorage } from "./storage.js";
import { ErrorHandler } from "./error-handler.js";

export class ABTestingManager {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.errorHandler = new ErrorHandler();
        this.experiments = new Map();
        this.userAssignments = new Map();
        this.results = new Map();
        this.metrics = new Map();
        
        this.initializeABTesting();
    }
    
    // ===== INITIALIZATION =====
    
    initializeABTesting() {
        this.loadExperiments();
        this.startMetricsCollection();
    }
    
    loadExperiments() {
        try {
            const abData = this.storage.read.from("ab_testing").get("data") || {};
            this.experiments = new Map(Object.entries(abData.experiments || {}));
            this.userAssignments = new Map(Object.entries(abData.userAssignments || {}));
            this.results = new Map(Object.entries(abData.results || {}));
            this.metrics = new Map(Object.entries(abData.metrics || {}));
        } catch (error) {
            this.errorHandler.handle(error, 'ABTestingManager.loadExperiments');
        }
    }
    
    startMetricsCollection() {
        setInterval(() => {
            this.calculateExperimentMetrics();
            this.checkExperimentCompletion();
        }, 60000); // Every minute
    }
    
    // ===== EXPERIMENT MANAGEMENT =====
    
    createExperiment(config) {
        try {
            const experimentId = this.generateExperimentId();
            const experiment = {
                id: experimentId,
                name: config.name,
                description: config.description || '',
                type: config.type || 'message', // message, feature, ui
                status: 'draft',
                variants: config.variants || [],
                trafficAllocation: config.trafficAllocation || 100,
                targetAudience: config.targetAudience || {},
                startDate: config.startDate ? new Date(config.startDate) : null,
                endDate: config.endDate ? new Date(config.endDate) : null,
                duration: config.duration || null, // in milliseconds
                successMetrics: config.successMetrics || [],
                hypothesis: config.hypothesis || '',
                createdAt: new Date(),
                createdBy: config.createdBy,
                settings: {
                    minSampleSize: config.minSampleSize || 100,
                    confidenceLevel: config.confidenceLevel || 0.95,
                    statisticalPower: config.statisticalPower || 0.8,
                    ...config.settings
                }
            };
            
            // Validate experiment
            this.validateExperiment(experiment);
            
            this.experiments.set(experimentId, experiment);
            this.saveABTestingData();
            
            console.log(`🧪 A/B Test created: ${experiment.name} (${experimentId})`);
            return experimentId;
        } catch (error) {
            this.errorHandler.handle(error, 'ABTestingManager.createExperiment');
            throw error;
        }
    }
    
    validateExperiment(experiment) {
        if (!experiment.name) {
            throw new Error('Experiment name is required');
        }
        
        if (!experiment.variants || experiment.variants.length < 2) {
            throw new Error('At least 2 variants are required');
        }
        
        // Validate traffic allocation
        const totalAllocation = experiment.variants.reduce((sum, variant) => sum + (variant.allocation || 0), 0);
        if (totalAllocation !== 100) {
            throw new Error('Variant allocations must sum to 100%');
        }
        
        // Validate success metrics
        if (!experiment.successMetrics || experiment.successMetrics.length === 0) {
            throw new Error('At least one success metric is required');
        }
    }
    
    startExperiment(experimentId) {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) {
                throw new Error(`Experiment not found: ${experimentId}`);
            }
            
            if (experiment.status !== 'draft') {
                throw new Error(`Cannot start experiment in status: ${experiment.status}`);
            }
            
            experiment.status = 'running';
            experiment.actualStartDate = new Date();
            
            // Set end date if duration is specified
            if (experiment.duration && !experiment.endDate) {
                experiment.actualEndDate = new Date(Date.now() + experiment.duration);
            } else if (experiment.endDate) {
                experiment.actualEndDate = experiment.endDate;
            }
            
            // Initialize results tracking
            this.initializeExperimentResults(experimentId);
            
            this.saveABTestingData();
            
            console.log(`🚀 A/B Test started: ${experiment.name}`);
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'ABTestingManager.startExperiment');
            return false;
        }
    }
    
    stopExperiment(experimentId, reason = 'manual') {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) {
                throw new Error(`Experiment not found: ${experimentId}`);
            }
            
            experiment.status = 'stopped';
            experiment.stoppedAt = new Date();
            experiment.stopReason = reason;
            
            // Calculate final results
            this.calculateFinalResults(experimentId);
            
            this.saveABTestingData();
            
            console.log(`⏹️ A/B Test stopped: ${experiment.name} (${reason})`);
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'ABTestingManager.stopExperiment');
            return false;
        }
    }
    
    // ===== USER ASSIGNMENT =====
    
    assignUserToVariant(experimentId, userId, userAttributes = {}) {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment || experiment.status !== 'running') {
                return null;
            }
            
            // Check if user already assigned
            const assignmentKey = `${experimentId}:${userId}`;
            if (this.userAssignments.has(assignmentKey)) {
                return this.userAssignments.get(assignmentKey);
            }
            
            // Check target audience
            if (!this.matchesTargetAudience(userAttributes, experiment.targetAudience)) {
                return null;
            }
            
            // Check traffic allocation
            if (!this.shouldIncludeInExperiment(userId, experiment.trafficAllocation)) {
                return null;
            }
            
            // Assign to variant
            const variant = this.selectVariant(userId, experiment.variants);
            
            const assignment = {
                experimentId,
                userId,
                variantId: variant.id,
                variantName: variant.name,
                assignedAt: new Date(),
                userAttributes
            };
            
            this.userAssignments.set(assignmentKey, assignment);
            
            // Update experiment metrics
            this.updateExperimentMetrics(experimentId, 'assignment', { variantId: variant.id });
            
            this.saveABTestingData();
            
            return assignment;
        } catch (error) {
            this.errorHandler.handle(error, 'ABTestingManager.assignUserToVariant');
            return null;
        }
    }
    
    getUserVariant(experimentId, userId) {
        const assignmentKey = `${experimentId}:${userId}`;
        return this.userAssignments.get(assignmentKey);
    }
    
    matchesTargetAudience(userAttributes, targetAudience) {
        if (!targetAudience || Object.keys(targetAudience).length === 0) {
            return true;
        }
        
        return Object.entries(targetAudience).every(([key, criteria]) => {
            const userValue = userAttributes[key];
            
            if (typeof criteria === 'object') {
                if (criteria.in && Array.isArray(criteria.in)) {
                    return criteria.in.includes(userValue);
                }
                if (criteria.not && Array.isArray(criteria.not)) {
                    return !criteria.not.includes(userValue);
                }
                if (criteria.min !== undefined && userValue < criteria.min) {
                    return false;
                }
                if (criteria.max !== undefined && userValue > criteria.max) {
                    return false;
                }
            } else {
                return userValue === criteria;
            }
            
            return true;
        });
    }
    
    shouldIncludeInExperiment(userId, trafficAllocation) {
        if (trafficAllocation >= 100) return true;
        
        // Use consistent hashing based on user ID
        const hash = this.hashUserId(userId);
        return (hash % 100) < trafficAllocation;
    }
    
    selectVariant(userId, variants) {
        const hash = this.hashUserId(userId);
        let cumulativeAllocation = 0;
        
        for (const variant of variants) {
            cumulativeAllocation += variant.allocation;
            if ((hash % 100) < cumulativeAllocation) {
                return variant;
            }
        }
        
        // Fallback to first variant
        return variants[0];
    }
    
    hashUserId(userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    // ===== EVENT TRACKING =====
    
    trackEvent(experimentId, userId, eventName, eventData = {}) {
        try {
            const assignment = this.getUserVariant(experimentId, userId);
            if (!assignment) return false;
            
            const experiment = this.experiments.get(experimentId);
            if (!experiment || experiment.status !== 'running') return false;
            
            const event = {
                experimentId,
                userId,
                variantId: assignment.variantId,
                eventName,
                eventData,
                timestamp: new Date()
            };
            
            // Store event
            const eventsKey = `${experimentId}:events`;
            const events = this.results.get(eventsKey) || [];
            events.push(event);
            this.results.set(eventsKey, events);
            
            // Update metrics
            this.updateExperimentMetrics(experimentId, eventName, {
                variantId: assignment.variantId,
                eventData
            });
            
            this.saveABTestingData();
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'ABTestingManager.trackEvent');
            return false;
        }
    }
    
    trackConversion(experimentId, userId, conversionValue = 1, conversionData = {}) {
        return this.trackEvent(experimentId, userId, 'conversion', {
            value: conversionValue,
            ...conversionData
        });
    }
    
    trackClick(experimentId, userId, element, clickData = {}) {
        return this.trackEvent(experimentId, userId, 'click', {
            element,
            ...clickData
        });
    }
    
    trackView(experimentId, userId, viewData = {}) {
        return this.trackEvent(experimentId, userId, 'view', viewData);
    }
    
    // ===== METRICS CALCULATION =====
    
    initializeExperimentResults(experimentId) {
        const experiment = this.experiments.get(experimentId);
        if (!experiment) return;
        
        const results = {
            experimentId,
            variants: {},
            overall: {
                totalUsers: 0,
                totalEvents: 0,
                startDate: new Date(),
                lastUpdated: new Date()
            }
        };
        
        // Initialize variant results
        experiment.variants.forEach(variant => {
            results.variants[variant.id] = {
                id: variant.id,
                name: variant.name,
                users: 0,
                events: {},
                conversions: 0,
                conversionRate: 0,
                totalValue: 0,
                averageValue: 0
            };
        });
        
        this.results.set(experimentId, results);
    }
    
    updateExperimentMetrics(experimentId, eventType, data) {
        const results = this.results.get(experimentId);
        if (!results) return;
        
        const variantResults = results.variants[data.variantId];
        if (!variantResults) return;
        
        switch (eventType) {
            case 'assignment':
                variantResults.users++;
                results.overall.totalUsers++;
                break;
                
            case 'conversion':
                variantResults.conversions++;
                variantResults.totalValue += data.eventData?.value || 1;
                variantResults.conversionRate = variantResults.conversions / variantResults.users;
                variantResults.averageValue = variantResults.totalValue / variantResults.conversions;
                break;
                
            default:
                if (!variantResults.events[eventType]) {
                    variantResults.events[eventType] = 0;
                }
                variantResults.events[eventType]++;
                results.overall.totalEvents++;
                break;
        }
        
        results.overall.lastUpdated = new Date();
    }
    
    calculateExperimentMetrics() {
        for (const [experimentId, experiment] of this.experiments) {
            if (experiment.status !== 'running') continue;
            
            const results = this.results.get(experimentId);
            if (!results) continue;
            
            // Calculate statistical significance
            this.calculateStatisticalSignificance(experimentId);
            
            // Update confidence intervals
            this.calculateConfidenceIntervals(experimentId);
        }
    }
    
    calculateStatisticalSignificance(experimentId) {
        const experiment = this.experiments.get(experimentId);
        const results = this.results.get(experimentId);
        
        if (!experiment || !results) return;
        
        const variants = Object.values(results.variants);
        if (variants.length < 2) return;
        
        // Use control variant (first one) as baseline
        const control = variants[0];
        
        for (let i = 1; i < variants.length; i++) {
            const variant = variants[i];
            
            // Calculate z-score for conversion rate difference
            const pControl = control.conversionRate;
            const pVariant = variant.conversionRate;
            const nControl = control.users;
            const nVariant = variant.users;
            
            if (nControl === 0 || nVariant === 0) continue;
            
            const pPooled = (control.conversions + variant.conversions) / (nControl + nVariant);
            const se = Math.sqrt(pPooled * (1 - pPooled) * (1/nControl + 1/nVariant));
            
            if (se === 0) continue;
            
            const zScore = (pVariant - pControl) / se;
            const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
            
            variant.statisticalSignificance = {
                zScore,
                pValue,
                isSignificant: pValue < (1 - experiment.settings.confidenceLevel),
                confidenceLevel: experiment.settings.confidenceLevel
            };
        }
    }
    
    calculateConfidenceIntervals(experimentId) {
        const experiment = this.experiments.get(experimentId);
        const results = this.results.get(experimentId);
        
        if (!experiment || !results) return;
        
        const zScore = this.getZScoreForConfidence(experiment.settings.confidenceLevel);
        
        Object.values(results.variants).forEach(variant => {
            if (variant.users === 0) return;
            
            const p = variant.conversionRate;
            const n = variant.users;
            const se = Math.sqrt((p * (1 - p)) / n);
            
            variant.confidenceInterval = {
                lower: Math.max(0, p - zScore * se),
                upper: Math.min(1, p + zScore * se),
                confidenceLevel: experiment.settings.confidenceLevel
            };
        });
    }
    
    normalCDF(x) {
        // Approximation of normal cumulative distribution function
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        
        return x > 0 ? 1 - prob : prob;
    }
    
    getZScoreForConfidence(confidenceLevel) {
        // Common z-scores for confidence levels
        const zScores = {
            0.90: 1.645,
            0.95: 1.96,
            0.99: 2.576
        };
        
        return zScores[confidenceLevel] || 1.96;
    }
    
    // ===== EXPERIMENT COMPLETION =====
    
    checkExperimentCompletion() {
        for (const [experimentId, experiment] of this.experiments) {
            if (experiment.status !== 'running') continue;
            
            // Check if experiment should end
            const shouldEnd = this.shouldEndExperiment(experimentId);
            
            if (shouldEnd.should) {
                this.stopExperiment(experimentId, shouldEnd.reason);
            }
        }
    }
    
    shouldEndExperiment(experimentId) {
        const experiment = this.experiments.get(experimentId);
        const results = this.results.get(experimentId);
        
        if (!experiment || !results) {
            return { should: false };
        }
        
        // Check end date
        if (experiment.actualEndDate && new Date() >= experiment.actualEndDate) {
            return { should: true, reason: 'end_date_reached' };
        }
        
        // Check minimum sample size
        const totalUsers = results.overall.totalUsers;
        if (totalUsers < experiment.settings.minSampleSize) {
            return { should: false };
        }
        
        // Check statistical significance
        const variants = Object.values(results.variants);
        const hasSignificantResult = variants.some(variant => 
            variant.statisticalSignificance?.isSignificant
        );
        
        if (hasSignificantResult && totalUsers >= experiment.settings.minSampleSize * 2) {
            return { should: true, reason: 'statistical_significance_reached' };
        }
        
        return { should: false };
    }
    
    calculateFinalResults(experimentId) {
        const experiment = this.experiments.get(experimentId);
        const results = this.results.get(experimentId);
        
        if (!experiment || !results) return;
        
        // Calculate final metrics
        this.calculateStatisticalSignificance(experimentId);
        this.calculateConfidenceIntervals(experimentId);
        
        // Determine winner
        const variants = Object.values(results.variants);
        const winner = variants.reduce((best, current) => {
            if (!best) return current;
            
            // Compare conversion rates
            if (current.conversionRate > best.conversionRate) {
                // Check if difference is statistically significant
                if (current.statisticalSignificance?.isSignificant) {
                    return current;
                }
            }
            
            return best;
        }, null);
        
        results.winner = winner;
        results.finalizedAt = new Date();
        
        console.log(`🏆 A/B Test completed: ${experiment.name}, Winner: ${winner?.name || 'No clear winner'}`);
    }
    
    // ===== REPORTING =====
    
    getExperimentReport(experimentId) {
        const experiment = this.experiments.get(experimentId);
        const results = this.results.get(experimentId);
        
        if (!experiment || !results) return null;
        
        return {
            experiment: {
                id: experiment.id,
                name: experiment.name,
                description: experiment.description,
                status: experiment.status,
                hypothesis: experiment.hypothesis,
                startDate: experiment.actualStartDate,
                endDate: experiment.actualEndDate,
                duration: experiment.actualEndDate ? 
                    experiment.actualEndDate - experiment.actualStartDate : 
                    Date.now() - experiment.actualStartDate
            },
            results: {
                ...results,
                variants: Object.values(results.variants).map(variant => ({
                    ...variant,
                    improvement: this.calculateImprovement(variant, results.variants[experiment.variants[0].id])
                }))
            },
            summary: this.generateExperimentSummary(experiment, results)
        };
    }
    
    calculateImprovement(variant, control) {
        if (!control || control.conversionRate === 0) return null;
        
        const improvement = ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
        
        return {
            percentage: improvement,
            absolute: variant.conversionRate - control.conversionRate,
            isPositive: improvement > 0
        };
    }
    
    generateExperimentSummary(experiment, results) {
        const variants = Object.values(results.variants);
        const totalUsers = results.overall.totalUsers;
        const winner = results.winner;
        
        return {
            totalParticipants: totalUsers,
            duration: experiment.actualEndDate ? 
                Math.floor((experiment.actualEndDate - experiment.actualStartDate) / (1000 * 60 * 60 * 24)) : 
                Math.floor((Date.now() - experiment.actualStartDate) / (1000 * 60 * 60 * 24)),
            hasWinner: !!winner,
            winnerName: winner?.name,
            winnerImprovement: winner ? this.calculateImprovement(winner, variants[0]) : null,
            isStatisticallySignificant: winner?.statisticalSignificance?.isSignificant || false,
            confidenceLevel: experiment.settings.confidenceLevel
        };
    }
    
    // ===== UTILITY METHODS =====
    
    generateExperimentId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    saveABTestingData() {
        try {
            const abData = {
                experiments: Object.fromEntries(this.experiments),
                userAssignments: Object.fromEntries(this.userAssignments),
                results: Object.fromEntries(this.results),
                metrics: Object.fromEntries(this.metrics)
            };
            
            this.storage.write.to("ab_testing").set("data", abData);
        } catch (error) {
            this.errorHandler.handle(error, 'ABTestingManager.saveABTestingData');
        }
    }
    
    // ===== PUBLIC API =====
    
    getAllExperiments() {
        return Array.from(this.experiments.values());
    }
    
    getActiveExperiments() {
        return Array.from(this.experiments.values()).filter(exp => exp.status === 'running');
    }
    
    getExperiment(experimentId) {
        return this.experiments.get(experimentId);
    }
    
    getUserExperiments(userId) {
        const userExperiments = [];
        
        for (const [key, assignment] of this.userAssignments) {
            if (assignment.userId === userId) {
                const experiment = this.experiments.get(assignment.experimentId);
                if (experiment) {
                    userExperiments.push({
                        experiment,
                        assignment
                    });
                }
            }
        }
        
        return userExperiments;
    }
}