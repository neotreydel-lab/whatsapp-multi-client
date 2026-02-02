// WAEngine Storage System - Einfaches Daten-Management
import fs from 'fs';
import path from 'path';

export class WAStorage {
    constructor(baseDir = './waengine-data') {
        this.baseDir = baseDir;
        this.cache = new Map();
        this.ensureBaseDir();
        
        // Schöne Console ist jetzt Standard - keine Logs mehr hier
    }

    // ===== SETUP =====
    
    ensureBaseDir() {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
            // Stille Directory-Erstellung
        }
    }

    getFilePath(fileName) {
        // Sicherheitsvalidierung gegen Path Traversal
        if (!fileName || typeof fileName !== 'string') {
            throw new Error('❌ Ungültiger Dateiname');
        }
        
        // Entferne gefährliche Zeichen und Pfad-Traversal-Versuche
        let sanitizedFileName = fileName
            .replace(/\.\./g, '') // Entferne ../
            .replace(/[<>:"|?*]/g, '') // Entferne Windows-ungültige Zeichen
            .replace(/^\/+/, '') // Entferne führende Slashes
            .trim();
            
        if (!sanitizedFileName) {
            throw new Error('❌ Dateiname ist nach Bereinigung leer');
        }
        
        // Automatisch .json hinzufügen falls nicht vorhanden
        if (!sanitizedFileName.endsWith('.json')) {
            sanitizedFileName += '.json';
        }
        
        // Prüfe ob Dateiname zu lang ist (Windows: 255 Zeichen)
        if (sanitizedFileName.length > 200) {
            throw new Error('❌ Dateiname zu lang');
        }
        
        return path.join(this.baseDir, sanitizedFileName);
    }

    // ===== WRITE SYSTEM =====
    
    write = {
        // write.in("datei") - Schreibt Daten in Datei
        in: (fileName) => {
            return {
                // write.in("datei").data(object)
                data: (data) => {
                    return this.writeData(fileName, data);
                },
                
                // write.in("datei").append(object)
                append: (data) => {
                    return this.appendData(fileName, data);
                },
                
                // write.in("datei").set(key, value)
                set: (key, value) => {
                    return this.setKey(fileName, key, value);
                },
                
                // write.in("datei").push(item)
                push: (item) => {
                    return this.pushItem(fileName, item);
                }
            };
        }
    };

    // ===== READ SYSTEM =====
    
    read = {
        // read.from("datei") - Liest Daten aus Datei
        from: (fileName) => {
            return {
                // read.from("datei").all()
                all: () => {
                    return this.readData(fileName);
                },
                
                // read.from("datei").get(key)
                get: (key) => {
                    return this.getKey(fileName, key);
                },
                
                // read.from("datei").find(condition)
                find: (condition) => {
                    return this.findItem(fileName, condition);
                },
                
                // read.from("datei").filter(condition)
                filter: (condition) => {
                    return this.filterItems(fileName, condition);
                },
                
                // read.from("datei").count()
                count: () => {
                    const data = this.readData(fileName);
                    return Array.isArray(data) ? data.length : (data ? Object.keys(data).length : 0);
                }
            };
        }
    };
    
    delete = {
        // delete.from("datei")
        from: (fileName) => {
            return {
                // delete.from("datei").all()
                all: () => {
                    return this.deleteFile(fileName);
                },
                
                // delete.from("datei").key(key)
                key: (key) => {
                    return this.deleteKey(fileName, key);
                },
                
                // delete.from("datei").where(condition)
                where: (condition) => {
                    return this.deleteWhere(fileName, condition);
                }
            };
        }
    };

    // ===== CORE METHODS =====
    
    writeData(fileName, data) {
        try {
            const filePath = this.getFilePath(fileName);
            
            // Validiere Daten
            if (data === undefined) {
                throw new Error('Daten sind undefined');
            }
            
            // Atomare Schreibung: Erst in temporäre Datei, dann umbenennen
            const tempFilePath = `${filePath}.tmp`;
            const jsonData = JSON.stringify(data, null, 2);
            
            // Schreibe in temporäre Datei
            fs.writeFileSync(tempFilePath, jsonData);
            
            // Atomare Umbenennung (verhindert korrupte Dateien)
            fs.renameSync(tempFilePath, filePath);
            
            // Cache mit Größenlimit aktualisieren
            this.updateCache(fileName, data);
            
            return true;
        } catch (error) {
            console.error(`❌ Fehler beim Schreiben in ${fileName}:`, error);
            
            // Cleanup temporäre Datei
            try {
                const tempFilePath = `${this.getFilePath(fileName)}.tmp`;
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (cleanupError) {
                // Stille Behandlung
            }
            
            return false;
        }
    }

    readData(fileName) {
        try {
            // Cache prüfen
            if (this.cache.has(fileName)) {
                return this.cache.get(fileName);
            }
            
            const filePath = this.getFilePath(fileName);
            
            if (!fs.existsSync(filePath)) {
                return null;
            }
            
            // Robuste JSON-Lesung mit Validierung
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            // Prüfe auf leere oder zu kurze Dateien
            if (!fileContent || fileContent.trim().length < 2) {
                console.warn(`⚠️ Datei ${fileName} ist leer oder zu kurz`);
                return null;
            }
            
            // Prüfe auf unvollständige JSON
            const trimmed = fileContent.trim();
            if (!((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
                  (trimmed.startsWith('[') && trimmed.endsWith(']')))) {
                console.warn(`⚠️ Datei ${fileName} hat ungültiges JSON-Format`);
                return null;
            }
            
            const data = JSON.parse(fileContent);
            
            // Cache mit Größenlimit aktualisieren
            this.updateCache(fileName, data);
            
            return data;
        } catch (error) {
            console.error(`❌ Fehler beim Lesen von ${fileName}:`, error.message);
            
            // Versuche Backup-Recovery
            const backupData = this.tryRecoverFromBackup(fileName);
            if (backupData) {
                console.log(`✅ ${fileName} aus Backup wiederhergestellt`);
                return backupData;
            }
            
            return null;
        }
    }

    // Cache-Management mit Größenlimit
    updateCache(fileName, data) {
        // Begrenze Cache-Größe auf 100 Einträge
        if (this.cache.size >= 100) {
            // Entferne älteste Einträge (FIFO)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(fileName, data);
    }

    // Backup-Recovery für korrupte Dateien
    tryRecoverFromBackup(fileName) {
        try {
            const filePath = this.getFilePath(fileName);
            const backupPath = `${filePath}.backup`;
            
            if (fs.existsSync(backupPath)) {
                const backupContent = fs.readFileSync(backupPath, 'utf8');
                const backupData = JSON.parse(backupContent);
                
                // Backup ist gültig - stelle wieder her
                fs.copyFileSync(backupPath, filePath);
                return backupData;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    appendData(fileName, newData) {
        const existingData = this.readData(fileName) || [];
        
        if (Array.isArray(existingData)) {
            existingData.push(newData);
            return this.writeData(fileName, existingData);
        } else {
            // Für Objekte: Merge
            const merged = { ...existingData, ...newData };
            return this.writeData(fileName, merged);
        }
    }

    setKey(fileName, key, value) {
        const data = this.readData(fileName) || {};
        
        // Unterstütze nested keys mit Punkt-Notation (z.B. "user.name")
        const keys = key.split('.');
        let current = data;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return this.writeData(fileName, data);
    }

    getKey(fileName, key) {
        const data = this.readData(fileName);
        if (!data) return null;
        
        // Unterstütze nested keys mit Punkt-Notation
        const keys = key.split('.');
        let current = data;
        
        for (const k of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return null;
            }
            current = current[k];
        }
        
        return current;
    }

    pushItem(fileName, item) {
        const data = this.readData(fileName) || [];
        
        if (!Array.isArray(data)) {
            console.error(`❌ ${fileName} ist kein Array - kann nicht pushen`);
            return false;
        }
        
        data.push(item);
        return this.writeData(fileName, data);
    }

    findItem(fileName, condition) {
        const data = this.readData(fileName);
        if (!Array.isArray(data)) return null;
        
        return data.find(condition);
    }

    filterItems(fileName, condition) {
        const data = this.readData(fileName);
        if (!Array.isArray(data)) return [];
        
        return data.filter(condition);
    }

    deleteFile(fileName) {
        try {
            const filePath = this.getFilePath(fileName);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            this.cache.delete(fileName);
            return true;
        } catch (error) {
            console.error(`❌ Fehler beim Löschen von ${fileName}:`, error);
            return false;
        }
    }

    deleteKey(fileName, key) {
        const data = this.readData(fileName);
        if (!data) return false;
        
        // Unterstütze nested keys
        const keys = key.split('.');
        let current = data;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                return false; // Key existiert nicht
            }
            current = current[keys[i]];
        }
        
        delete current[keys[keys.length - 1]];
        return this.writeData(fileName, data);
    }

    deleteWhere(fileName, condition) {
        const data = this.readData(fileName);
        if (!Array.isArray(data)) return false;
        
        const filteredData = data.filter(item => !condition(item));
        return this.writeData(fileName, filteredData);
    }

    // ===== UTILITY METHODS =====
    
    exists(fileName) {
        try {
            const filePath = this.getFilePath(fileName);
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }

    size(fileName) {
        try {
            const filePath = this.getFilePath(fileName);
            if (fs.existsSync(filePath)) {
                return fs.statSync(filePath).size;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    backup(fileName) {
        try {
            const filePath = this.getFilePath(fileName);
            const backupPath = `${filePath}.backup`;
            
            if (fs.existsSync(filePath)) {
                fs.copyFileSync(filePath, backupPath);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`❌ Backup-Fehler für ${fileName}:`, error);
            return false;
        }
    }

    // Bereinige Cache
    clearCache() {
        this.cache.clear();
    }

    // Storage-Statistiken
    getStats() {
        try {
            const files = fs.readdirSync(this.baseDir);
            const jsonFiles = files.filter(f => f.endsWith('.json'));
            
            let totalSize = 0;
            for (const file of jsonFiles) {
                totalSize += this.size(file.replace('.json', ''));
            }
            
            return {
                totalFiles: jsonFiles.length,
                totalSize: totalSize,
                cacheSize: this.cache.size,
                baseDir: this.baseDir
            };
        } catch (error) {
            return {
                totalFiles: 0,
                totalSize: 0,
                cacheSize: this.cache.size,
                baseDir: this.baseDir,
                error: error.message
            };
        }
    }
}

// ===== GLOBAL STORAGE INSTANCE =====

let globalStorage = null;

export function createStorage(baseDir = './waengine-data') {
    return new WAStorage(baseDir);
}

export function getStorage(baseDir = './waengine-data') {
    if (!globalStorage) {
        globalStorage = new WAStorage(baseDir);
    }
    return globalStorage;
}

// ===== CONVENIENCE EXPORTS =====

export const write = {
    in: (fileName) => getStorage().write.in(fileName)
};

export const read = {
    from: (fileName) => getStorage().read.from(fileName)
};

export const del = {
    from: (fileName) => getStorage().delete.from(fileName)
};