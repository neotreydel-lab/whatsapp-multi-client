import { getStorage } from "./storage.js";
import { ErrorHandler } from "./error-handler.js";

export class DatabaseManager {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.errorHandler = new ErrorHandler();
        this.databases = new Map();
        this.schemas = new Map();
        this.indexes = new Map();
        this.queryCache = new Map();
        this.transactions = new Map();
        
        this.initializeDatabase();
    }
    
    // ===== INITIALIZATION =====
    
    initializeDatabase() {
        this.loadDatabases();
        this.setupDefaultSchemas();
        this.startMaintenanceJob();
    }
    
    loadDatabases() {
        try {
            const dbData = this.storage.read.from("database").get("data") || {};
            this.databases = new Map(Object.entries(dbData.databases || {}));
            this.schemas = new Map(Object.entries(dbData.schemas || {}));
            this.indexes = new Map(Object.entries(dbData.indexes || {}));
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.loadDatabases');
        }
    }
    
    setupDefaultSchemas() {
        // User schema
        this.createSchema('users', {
            id: { type: 'string', required: true, unique: true },
            name: { type: 'string', required: true },
            phone: { type: 'string', unique: true },
            email: { type: 'string' },
            createdAt: { type: 'date', default: () => new Date() },
            updatedAt: { type: 'date', default: () => new Date() },
            isActive: { type: 'boolean', default: true },
            metadata: { type: 'object', default: {} }
        });
        
        // Messages schema
        this.createSchema('messages', {
            id: { type: 'string', required: true, unique: true },
            chatId: { type: 'string', required: true },
            senderId: { type: 'string', required: true },
            content: { type: 'string', required: true },
            type: { type: 'string', enum: ['text', 'image', 'video', 'audio', 'document'] },
            timestamp: { type: 'date', default: () => new Date() },
            isRead: { type: 'boolean', default: false },
            metadata: { type: 'object', default: {} }
        });
        
        // Groups schema
        this.createSchema('groups', {
            id: { type: 'string', required: true, unique: true },
            name: { type: 'string', required: true },
            description: { type: 'string' },
            members: { type: 'array', default: [] },
            admins: { type: 'array', default: [] },
            createdAt: { type: 'date', default: () => new Date() },
            settings: { type: 'object', default: {} }
        });
    }
    
    startMaintenanceJob() {
        setInterval(() => {
            this.cleanupCache();
            this.optimizeIndexes();
        }, 300000); // Every 5 minutes
    }
    
    // ===== SCHEMA MANAGEMENT =====
    
    createSchema(tableName, schema) {
        try {
            this.schemas.set(tableName, {
                name: tableName,
                fields: schema,
                createdAt: Date.now(),
                version: 1
            });
            
            // Create database table if it doesn't exist
            if (!this.databases.has(tableName)) {
                this.databases.set(tableName, new Map());
            }
            
            // Create indexes for unique fields
            this.createIndexesForSchema(tableName, schema);
            
            this.saveDatabaseData();
            console.log(`📊 Schema created: ${tableName}`);
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.createSchema');
            return false;
        }
    }
    
    createIndexesForSchema(tableName, schema) {
        const tableIndexes = new Map();
        
        Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
            if (fieldConfig.unique || fieldConfig.index) {
                tableIndexes.set(fieldName, new Map());
            }
        });
        
        this.indexes.set(tableName, tableIndexes);
    }
    
    updateSchema(tableName, newSchema) {
        try {
            const existingSchema = this.schemas.get(tableName);
            if (!existingSchema) {
                throw new Error(`Schema not found: ${tableName}`);
            }
            
            existingSchema.fields = { ...existingSchema.fields, ...newSchema };
            existingSchema.version++;
            existingSchema.updatedAt = Date.now();
            
            this.saveDatabaseData();
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.updateSchema');
            return false;
        }
    }
    
    // ===== CRUD OPERATIONS =====
    
    async insert(tableName, data) {
        try {
            const schema = this.schemas.get(tableName);
            if (!schema) {
                throw new Error(`Schema not found: ${tableName}`);
            }
            
            // Validate data
            const validatedData = this.validateData(data, schema.fields);
            
            // Check unique constraints
            await this.checkUniqueConstraints(tableName, validatedData);
            
            // Generate ID if not provided
            if (!validatedData.id) {
                validatedData.id = this.generateId();
            }
            
            // Get table
            const table = this.databases.get(tableName);
            
            // Insert data
            table.set(validatedData.id, validatedData);
            
            // Update indexes
            this.updateIndexes(tableName, validatedData, 'insert');
            
            this.saveDatabaseData();
            
            console.log(`✅ Inserted into ${tableName}: ${validatedData.id}`);
            return validatedData;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.insert');
            throw error;
        }
    }
    
    async findById(tableName, id) {
        try {
            const table = this.databases.get(tableName);
            if (!table) {
                throw new Error(`Table not found: ${tableName}`);
            }
            
            return table.get(id) || null;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.findById');
            return null;
        }
    }
    
    async find(tableName, query = {}, options = {}) {
        try {
            const table = this.databases.get(tableName);
            if (!table) {
                throw new Error(`Table not found: ${tableName}`);
            }
            
            // Check cache first
            const cacheKey = this.generateCacheKey(tableName, query, options);
            if (this.queryCache.has(cacheKey)) {
                return this.queryCache.get(cacheKey);
            }
            
            let results = Array.from(table.values());
            
            // Apply filters
            if (Object.keys(query).length > 0) {
                results = this.applyFilters(results, query);
            }
            
            // Apply sorting
            if (options.sort) {
                results = this.applySorting(results, options.sort);
            }
            
            // Apply pagination
            if (options.limit || options.offset) {
                results = this.applyPagination(results, options);
            }
            
            // Cache results
            this.queryCache.set(cacheKey, results);
            
            return results;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.find');
            return [];
        }
    }
    
    async update(tableName, id, updateData) {
        try {
            const table = this.databases.get(tableName);
            if (!table) {
                throw new Error(`Table not found: ${tableName}`);
            }
            
            const existingData = table.get(id);
            if (!existingData) {
                throw new Error(`Record not found: ${id}`);
            }
            
            const schema = this.schemas.get(tableName);
            const validatedData = this.validateData(updateData, schema.fields, true);
            
            // Merge with existing data
            const updatedData = { ...existingData, ...validatedData, updatedAt: new Date() };
            
            // Check unique constraints
            await this.checkUniqueConstraints(tableName, updatedData, id);
            
            // Update record
            table.set(id, updatedData);
            
            // Update indexes
            this.updateIndexes(tableName, updatedData, 'update', existingData);
            
            // Clear cache
            this.clearCacheForTable(tableName);
            
            this.saveDatabaseData();
            
            console.log(`✅ Updated ${tableName}: ${id}`);
            return updatedData;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.update');
            throw error;
        }
    }
    
    async delete(tableName, id) {
        try {
            const table = this.databases.get(tableName);
            if (!table) {
                throw new Error(`Table not found: ${tableName}`);
            }
            
            const existingData = table.get(id);
            if (!existingData) {
                return false;
            }
            
            // Remove from table
            table.delete(id);
            
            // Update indexes
            this.updateIndexes(tableName, existingData, 'delete');
            
            // Clear cache
            this.clearCacheForTable(tableName);
            
            this.saveDatabaseData();
            
            console.log(`🗑️ Deleted from ${tableName}: ${id}`);
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.delete');
            return false;
        }
    }
    
    // ===== ADVANCED QUERIES =====
    
    async aggregate(tableName, pipeline) {
        try {
            const table = this.databases.get(tableName);
            if (!table) {
                throw new Error(`Table not found: ${tableName}`);
            }
            
            let data = Array.from(table.values());
            
            for (const stage of pipeline) {
                data = this.applyAggregationStage(data, stage);
            }
            
            return data;
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.aggregate');
            return [];
        }
    }
    
    applyAggregationStage(data, stage) {
        const [operation, params] = Object.entries(stage)[0];
        
        switch (operation) {
            case '$match':
                return this.applyFilters(data, params);
                
            case '$group':
                return this.applyGrouping(data, params);
                
            case '$sort':
                return this.applySorting(data, params);
                
            case '$limit':
                return data.slice(0, params);
                
            case '$skip':
                return data.slice(params);
                
            case '$project':
                return data.map(item => this.applyProjection(item, params));
                
            default:
                return data;
        }
    }
    
    applyGrouping(data, groupParams) {
        const { _id, ...aggregations } = groupParams;
        const groups = new Map();
        
        data.forEach(item => {
            const groupKey = this.evaluateGroupKey(item, _id);
            
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            
            groups.get(groupKey).push(item);
        });
        
        return Array.from(groups.entries()).map(([key, items]) => {
            const result = { _id: key };
            
            Object.entries(aggregations).forEach(([field, operation]) => {
                result[field] = this.applyAggregationOperation(items, operation);
            });
            
            return result;
        });
    }
    
    // ===== TRANSACTIONS =====
    
    async transaction(operations) {
        const transactionId = this.generateId();
        const rollbackData = new Map();
        
        try {
            this.transactions.set(transactionId, { status: 'active', operations: [] });
            
            for (const operation of operations) {
                const { type, tableName, data, id } = operation;
                
                // Store rollback data
                if (type === 'update' || type === 'delete') {
                    const existing = await this.findById(tableName, id);
                    rollbackData.set(`${tableName}:${id}`, existing);
                }
                
                // Execute operation
                switch (type) {
                    case 'insert':
                        await this.insert(tableName, data);
                        break;
                    case 'update':
                        await this.update(tableName, id, data);
                        break;
                    case 'delete':
                        await this.delete(tableName, id);
                        break;
                }
                
                this.transactions.get(transactionId).operations.push(operation);
            }
            
            this.transactions.get(transactionId).status = 'committed';
            console.log(`✅ Transaction committed: ${transactionId}`);
            
            return { success: true, transactionId };
        } catch (error) {
            // Rollback
            await this.rollbackTransaction(transactionId, rollbackData);
            this.errorHandler.handle(error, 'DatabaseManager.transaction');
            
            return { success: false, error: error.message };
        } finally {
            this.transactions.delete(transactionId);
        }
    }
    
    async rollbackTransaction(transactionId, rollbackData) {
        try {
            const transaction = this.transactions.get(transactionId);
            if (!transaction) return;
            
            // Reverse operations
            const operations = [...transaction.operations].reverse();
            
            for (const operation of operations) {
                const { type, tableName, id } = operation;
                const rollbackKey = `${tableName}:${id}`;
                
                switch (type) {
                    case 'insert':
                        await this.delete(tableName, id);
                        break;
                    case 'update':
                        const originalData = rollbackData.get(rollbackKey);
                        if (originalData) {
                            const table = this.databases.get(tableName);
                            table.set(id, originalData);
                        }
                        break;
                    case 'delete':
                        const deletedData = rollbackData.get(rollbackKey);
                        if (deletedData) {
                            await this.insert(tableName, deletedData);
                        }
                        break;
                }
            }
            
            console.log(`🔄 Transaction rolled back: ${transactionId}`);
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.rollbackTransaction');
        }
    }
    
    // ===== VALIDATION =====
    
    validateData(data, schema, isUpdate = false) {
        const validatedData = {};
        
        Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
            const value = data[fieldName];
            
            // Check required fields
            if (fieldConfig.required && !isUpdate && (value === undefined || value === null)) {
                throw new Error(`Required field missing: ${fieldName}`);
            }
            
            // Skip validation if field not provided in update
            if (isUpdate && value === undefined) {
                return;
            }
            
            // Apply default values
            if (value === undefined && fieldConfig.default !== undefined) {
                validatedData[fieldName] = typeof fieldConfig.default === 'function' 
                    ? fieldConfig.default() 
                    : fieldConfig.default;
                return;
            }
            
            // Type validation
            if (value !== undefined && value !== null) {
                validatedData[fieldName] = this.validateFieldType(value, fieldConfig, fieldName);
            }
        });
        
        return validatedData;
    }
    
    validateFieldType(value, fieldConfig, fieldName) {
        switch (fieldConfig.type) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new Error(`Field ${fieldName} must be a string`);
                }
                if (fieldConfig.enum && !fieldConfig.enum.includes(value)) {
                    throw new Error(`Field ${fieldName} must be one of: ${fieldConfig.enum.join(', ')}`);
                }
                return value;
                
            case 'number':
                const num = Number(value);
                if (isNaN(num)) {
                    throw new Error(`Field ${fieldName} must be a number`);
                }
                return num;
                
            case 'boolean':
                return Boolean(value);
                
            case 'date':
                return value instanceof Date ? value : new Date(value);
                
            case 'array':
                return Array.isArray(value) ? value : [value];
                
            case 'object':
                return typeof value === 'object' ? value : {};
                
            default:
                return value;
        }
    }
    
    // ===== UTILITY METHODS =====
    
    applyFilters(data, query) {
        return data.filter(item => {
            return Object.entries(query).every(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return this.applyOperatorFilter(item[key], value);
                }
                return item[key] === value;
            });
        });
    }
    
    applyOperatorFilter(fieldValue, operators) {
        return Object.entries(operators).every(([operator, value]) => {
            switch (operator) {
                case '$eq': return fieldValue === value;
                case '$ne': return fieldValue !== value;
                case '$gt': return fieldValue > value;
                case '$gte': return fieldValue >= value;
                case '$lt': return fieldValue < value;
                case '$lte': return fieldValue <= value;
                case '$in': return Array.isArray(value) && value.includes(fieldValue);
                case '$nin': return Array.isArray(value) && !value.includes(fieldValue);
                case '$regex': return new RegExp(value).test(fieldValue);
                case '$exists': return value ? fieldValue !== undefined : fieldValue === undefined;
                default: return true;
            }
        });
    }
    
    applySorting(data, sortOptions) {
        return data.sort((a, b) => {
            for (const [field, direction] of Object.entries(sortOptions)) {
                const aVal = a[field];
                const bVal = b[field];
                
                if (aVal < bVal) return direction === 1 ? -1 : 1;
                if (aVal > bVal) return direction === 1 ? 1 : -1;
            }
            return 0;
        });
    }
    
    applyPagination(data, options) {
        const offset = options.offset || 0;
        const limit = options.limit;
        
        if (limit) {
            return data.slice(offset, offset + limit);
        }
        
        return data.slice(offset);
    }
    
    async checkUniqueConstraints(tableName, data, excludeId = null) {
        const schema = this.schemas.get(tableName);
        const table = this.databases.get(tableName);
        
        for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
            if (fieldConfig.unique && data[fieldName] !== undefined) {
                for (const [id, record] of table) {
                    if (id !== excludeId && record[fieldName] === data[fieldName]) {
                        throw new Error(`Duplicate value for unique field ${fieldName}: ${data[fieldName]}`);
                    }
                }
            }
        }
    }
    
    updateIndexes(tableName, data, operation, oldData = null) {
        const tableIndexes = this.indexes.get(tableName);
        if (!tableIndexes) return;
        
        for (const [fieldName, index] of tableIndexes) {
            const value = data[fieldName];
            
            switch (operation) {
                case 'insert':
                    if (value !== undefined) {
                        index.set(value, data.id);
                    }
                    break;
                    
                case 'update':
                    if (oldData && oldData[fieldName] !== undefined) {
                        index.delete(oldData[fieldName]);
                    }
                    if (value !== undefined) {
                        index.set(value, data.id);
                    }
                    break;
                    
                case 'delete':
                    if (value !== undefined) {
                        index.delete(value);
                    }
                    break;
            }
        }
    }
    
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateCacheKey(tableName, query, options) {
        return `${tableName}:${JSON.stringify(query)}:${JSON.stringify(options)}`;
    }
    
    clearCacheForTable(tableName) {
        for (const key of this.queryCache.keys()) {
            if (key.startsWith(`${tableName}:`)) {
                this.queryCache.delete(key);
            }
        }
    }
    
    cleanupCache() {
        // Remove old cache entries (older than 10 minutes)
        const maxAge = 10 * 60 * 1000;
        const now = Date.now();
        
        for (const [key, entry] of this.queryCache) {
            if (entry.timestamp && (now - entry.timestamp) > maxAge) {
                this.queryCache.delete(key);
            }
        }
    }
    
    optimizeIndexes() {
        // Rebuild indexes if needed
        for (const [tableName, tableIndexes] of this.indexes) {
            const table = this.databases.get(tableName);
            if (!table) continue;
            
            for (const [fieldName, index] of tableIndexes) {
                index.clear();
                
                for (const [id, record] of table) {
                    const value = record[fieldName];
                    if (value !== undefined) {
                        index.set(value, id);
                    }
                }
            }
        }
    }
    
    saveDatabaseData() {
        try {
            const dbData = {
                databases: Object.fromEntries(
                    Array.from(this.databases.entries()).map(([name, table]) => [
                        name, 
                        Object.fromEntries(table)
                    ])
                ),
                schemas: Object.fromEntries(this.schemas),
                indexes: Object.fromEntries(
                    Array.from(this.indexes.entries()).map(([name, tableIndexes]) => [
                        name,
                        Object.fromEntries(
                            Array.from(tableIndexes.entries()).map(([field, index]) => [
                                field,
                                Object.fromEntries(index)
                            ])
                        )
                    ])
                )
            };
            
            this.storage.write.to("database").set("data", dbData);
        } catch (error) {
            this.errorHandler.handle(error, 'DatabaseManager.saveDatabaseData');
        }
    }
    
    // ===== PUBLIC API =====
    
    getTableStats(tableName) {
        const table = this.databases.get(tableName);
        const schema = this.schemas.get(tableName);
        
        if (!table || !schema) return null;
        
        return {
            name: tableName,
            recordCount: table.size,
            schema: schema.fields,
            version: schema.version,
            createdAt: schema.createdAt,
            updatedAt: schema.updatedAt
        };
    }
    
    getAllTables() {
        return Array.from(this.databases.keys());
    }
    
    exportTable(tableName) {
        const table = this.databases.get(tableName);
        if (!table) return null;
        
        return {
            tableName,
            schema: this.schemas.get(tableName),
            data: Array.from(table.values()),
            exportedAt: new Date()
        };
    }
    
    async importTable(tableData) {
        const { tableName, schema, data } = tableData;
        
        // Create schema
        this.createSchema(tableName, schema.fields);
        
        // Import data
        const table = this.databases.get(tableName);
        table.clear();
        
        for (const record of data) {
            table.set(record.id, record);
            this.updateIndexes(tableName, record, 'insert');
        }
        
        this.saveDatabaseData();
        console.log(`📥 Imported ${data.length} records into ${tableName}`);
    }
}