// Session Manager für WAEngine - Windows-kompatibel
import fs from 'fs';
import path from 'path';

export class SessionManager {
    constructor(authDir) {
        this.authDir = authDir;
    }

    // Einfache Prüfung ob Auth-Ordner existiert
    hasAuthFolder() {
        return fs.existsSync(this.authDir);
    }

    // Prüft ob Session existiert und gültig ist
    async validateSession() {
        try {
            if (!fs.existsSync(this.authDir)) {
                return { valid: false, reason: 'no_auth_dir' };
            }

            const credsPath = path.join(this.authDir, 'creds.json');
            if (!fs.existsSync(credsPath)) {
                return { valid: false, reason: 'no_creds' };
            }

            // Robuste JSON-Validierung mit mehreren Fallbacks
            let creds;
            let fileContent;
            
            try {
                fileContent = fs.readFileSync(credsPath, 'utf8');
                
                // Prüfe ob Datei leer oder zu kurz ist
                if (!fileContent || fileContent.trim().length < 10) {
                    console.error('❌ creds.json ist leer oder zu kurz');
                    return { valid: false, reason: 'empty_creds' };
                }
                
                // Prüfe auf unvollständige JSON (häufiger Fehler)
                if (!fileContent.trim().endsWith('}') && !fileContent.trim().endsWith(']')) {
                    console.error('❌ creds.json ist unvollständig (fehlendes Ende)');
                    return { valid: false, reason: 'incomplete_creds' };
                }
                
                // Versuche JSON zu parsen
                creds = JSON.parse(fileContent);
                
            } catch (jsonError) {
                console.error('❌ Fehler beim Lesen der creds.json:', jsonError.message);
                
                // Versuche Backup-Recovery
                const backupRecovered = await this.tryRecoverFromBackup();
                if (backupRecovered) {
                    console.log('✅ Session aus Backup wiederhergestellt');
                    return await this.validateSession(); // Rekursiv nach Recovery
                }
                
                // Erstelle Backup der korrupten Datei für Debugging
                await this.backupCorruptedFile(credsPath, fileContent);
                
                return { valid: false, reason: 'corrupted_creds', error: jsonError.message };
            }
            
            // Prüfe ob User-ID vorhanden (eingeloggt)
            if (!creds || typeof creds !== 'object') {
                return { valid: false, reason: 'invalid_creds_format' };
            }
            
            if (!creds.me?.id) {
                return { valid: false, reason: 'not_logged_in' };
            }

            // Prüfe ob Session nicht zu alt ist (optional)
            const stats = fs.statSync(credsPath);
            const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            
            if (ageInDays > 30) { // Session älter als 30 Tage
                return { valid: false, reason: 'session_too_old' };
            }

            return { 
                valid: true, 
                userId: creds.me.id,
                lastModified: stats.mtime,
                ageInDays: Math.round(ageInDays)
            };

        } catch (error) {
            console.error('❌ Session-Validierung Fehler:', error);
            return { valid: false, reason: 'validation_error', error: error.message };
        }
    }

    // Windows-kompatible Session-Bereinigung
    async cleanupSession() {
        try {
            if (!fs.existsSync(this.authDir)) {
                return true;
            }

            console.log("🧹 Bereinige Session (Windows-kompatibel)...");
            
            // Spezielle Behandlung für Windows EPERM Fehler
            await this.forceDeleteDirectory(this.authDir);
            
            console.log("✅ Session bereinigt");
            return true;
            
        } catch (error) {
            console.error("❌ Fehler beim Session-Cleanup:", error);
            
            // Erweiterte Fallback-Strategien
            return await this.fallbackCleanup();
        }
    }

    // Erweiterte Fallback-Bereinigung
    async fallbackCleanup() {
        try {
            console.log("🔄 Versuche Fallback-Bereinigung...");
            
            // Strategie 1: Nur wichtige Dateien löschen
            const criticalFiles = ['creds.json', 'app-state-sync-version.json'];
            let deletedFiles = 0;
            
            for (const file of criticalFiles) {
                const filePath = path.join(this.authDir, file);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        deletedFiles++;
                        console.log(`✅ ${file} gelöscht`);
                    } catch (fileError) {
                        console.log(`⚠️ Konnte ${file} nicht löschen`);
                    }
                }
            }
            
            // Strategie 2: Ordner umbenennen (Windows-Trick)
            if (deletedFiles === 0) {
                const tempName = `${this.authDir}_deleted_${Date.now()}`;
                try {
                    fs.renameSync(this.authDir, tempName);
                    console.log(`📁 Auth-Ordner umbenannt zu: ${path.basename(tempName)}`);
                    console.log("💡 Alter Ordner wird beim nächsten Neustart automatisch bereinigt");
                    return true;
                } catch (renameError) {
                    console.log("⚠️ Auch Umbenennung fehlgeschlagen");
                }
            }
            
            // Strategie 3: Leeren Ordner erstellen (Override)
            try {
                const newAuthDir = `${this.authDir}_new_${Date.now()}`;
                fs.mkdirSync(newAuthDir, { recursive: true });
                
                // Symbolischen Link erstellen (falls möglich)
                try {
                    if (fs.existsSync(this.authDir)) {
                        fs.rmSync(this.authDir, { recursive: true, force: true });
                    }
                    fs.renameSync(newAuthDir, this.authDir);
                    console.log("✅ Neuer Auth-Ordner erstellt");
                    return true;
                } catch (linkError) {
                    console.log("⚠️ Symbolischer Link fehlgeschlagen");
                }
            } catch (createError) {
                console.log("⚠️ Neuer Ordner konnte nicht erstellt werden");
            }
            
            console.log("⚠️ Fallback-Bereinigung teilweise erfolgreich");
            return deletedFiles > 0;
            
        } catch (fallbackError) {
            console.error("❌ Alle Bereinigungsstrategien fehlgeschlagen:", fallbackError);
            return false;
        }
    }

    // Windows-kompatible Ordner-Löschung mit erweiterten Fallback-Strategien
    async forceDeleteDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) return;

        try {
            // Moderne Node.js Lösung (Node.js 14.14.0+)
            if (fs.rmSync) {
                fs.rmSync(dirPath, { 
                    recursive: true, 
                    force: true,
                    maxRetries: 3,
                    retryDelay: 100
                });
                return;
            }
            
            // Fallback für ältere Node.js Versionen
            await this.legacyDeleteDirectory(dirPath);
            
        } catch (error) {
            if (error.code === 'EPERM' || error.code === 'EBUSY' || error.code === 'ENOTEMPTY') {
                console.log("⚠️ Windows-Berechtigungsfehler - verwende erweiterte Fallback-Strategien");
                await this.windowsEpermFallback(dirPath);
            } else {
                throw error;
            }
        }
    }

    // Legacy Verzeichnis-Löschung für ältere Node.js Versionen
    async legacyDeleteDirectory(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                await this.legacyDeleteDirectory(filePath);
            } else {
                await this.forceDeleteFile(filePath);
            }
        }
        
        fs.rmdirSync(dirPath);
    }

    // Robuste Datei-Löschung mit Windows-Kompatibilität
    async forceDeleteFile(filePath) {
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            if (error.code === 'EPERM') {
                // Windows EPERM Fallback-Strategien
                try {
                    // Strategie 1: Datei-Attribute zurücksetzen (Windows)
                    if (process.platform === 'win32') {
                        const { execSync } = await import('child_process');
                        execSync(`attrib -R -H -S "${filePath}"`, { stdio: 'ignore' });
                    }
                    fs.unlinkSync(filePath);
                } catch (attribError) {
                    try {
                        // Strategie 2: Datei überschreiben und dann löschen
                        fs.writeFileSync(filePath, '');
                        fs.unlinkSync(filePath);
                    } catch (overwriteError) {
                        // Strategie 3: Datei umbenennen (für spätere Löschung)
                        const tempName = `${filePath}_deleted_${Date.now()}`;
                        try {
                            fs.renameSync(filePath, tempName);
                            console.log(`📁 Datei umbenannt: ${path.basename(tempName)}`);
                        } catch (renameError) {
                            console.log(`⚠️ Konnte Datei nicht löschen: ${path.basename(filePath)}`);
                        }
                    }
                }
            } else {
                throw error;
            }
        }
    }

    // Windows EPERM Fallback-Strategien
    async windowsEpermFallback(dirPath) {
        try {
            // Strategie 1: Verzeichnis-Attribute zurücksetzen (Windows)
            if (process.platform === 'win32') {
                const { execSync } = await import('child_process');
                try {
                    execSync(`attrib -R -H -S "${dirPath}" /S /D`, { stdio: 'ignore' });
                    if (fs.rmSync) {
                        fs.rmSync(dirPath, { recursive: true, force: true });
                    } else {
                        await this.legacyDeleteDirectory(dirPath);
                    }
                    return;
                } catch (attribError) {
                    // Weiter zu nächster Strategie
                }
            }
            
            // Strategie 2: Verzeichnis umbenennen
            const tempName = `${dirPath}_deleted_${Date.now()}`;
            try {
                fs.renameSync(dirPath, tempName);
                console.log(`📁 Verzeichnis umbenannt zu: ${path.basename(tempName)}`);
                
                // Versuche verzögerte Löschung
                setTimeout(() => {
                    try {
                        if (fs.rmSync) {
                            fs.rmSync(tempName, { recursive: true, force: true });
                        }
                    } catch (delayedError) {
                        // Stille Behandlung - Verzeichnis bleibt umbenannt
                    }
                }, 1000);
                
            } catch (renameError) {
                console.log("⚠️ Verzeichnis konnte nicht umbenannt werden - bleibt bestehen");
            }
            
        } catch (fallbackError) {
            console.log(`⚠️ Alle Fallback-Strategien fehlgeschlagen für: ${path.basename(dirPath)}`);
        }
    }

    // Erstellt Auth-Ordner falls nicht vorhanden
    async ensureAuthDir() {
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
            console.log(`📁 Auth-Ordner erstellt: ${this.authDir}`);
        }
    }

    // Backup der Session erstellen
    async backupSession() {
        try {
            if (!fs.existsSync(this.authDir)) return false;

            const backupDir = `${this.authDir}_backup_${Date.now()}`;
            fs.mkdirSync(backupDir, { recursive: true });

            const files = fs.readdirSync(this.authDir);
            for (const file of files) {
                const srcPath = path.join(this.authDir, file);
                const destPath = path.join(backupDir, file);
                
                try {
                    if (fs.statSync(srcPath).isFile()) {
                        fs.copyFileSync(srcPath, destPath);
                    }
                } catch (copyError) {
                    console.log(`⚠️ Konnte ${file} nicht kopieren:`, copyError.message);
                }
            }

            console.log(`💾 Session-Backup erstellt: ${backupDir}`);
            return backupDir;
        } catch (error) {
            console.error("❌ Backup-Fehler:", error);
            return false;
        }
    }

    // Session-Status für Debugging
    getSessionStatus() {
        try {
            if (!fs.existsSync(this.authDir)) {
                return { status: 'no_session', files: [] };
            }

            const files = fs.readdirSync(this.authDir);
            const fileDetails = files.map(file => {
                const filePath = path.join(this.authDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        size: stats.size,
                        modified: stats.mtime,
                        isFile: stats.isFile()
                    };
                } catch (statError) {
                    return {
                        name: file,
                        size: 0,
                        modified: null,
                        error: statError.message
                    };
                }
            });

            return {
                status: 'session_exists',
                files: fileDetails,
                totalFiles: files.length,
                authDir: this.authDir
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    // Repariert korrupte Session
    async repairSession() {
        console.log("🔧 Versuche Session-Reparatur...");
        
        const validation = await this.validateSession();
        
        if (validation.reason === 'corrupted') {
            console.log("🗑️ Korrupte Session erkannt - bereinige...");
            await this.cleanupSession();
            return { repaired: true, action: 'cleanup' };
        }

        if (validation.reason === 'session_too_old') {
            console.log("⏰ Session zu alt - bereinige...");
            await this.cleanupSession();
            return { repaired: true, action: 'cleanup_old' };
        }

        return { repaired: false, reason: validation.reason };
    }

    // Versucht Session aus Backup wiederherzustellen
    async tryRecoverFromBackup() {
        try {
            const backupPattern = `${this.authDir}_backup_`;
            const parentDir = path.dirname(this.authDir);
            
            if (!fs.existsSync(parentDir)) return false;
            
            const entries = fs.readdirSync(parentDir);
            const backupDirs = entries
                .filter(entry => entry.startsWith(path.basename(backupPattern)))
                .map(entry => ({
                    path: path.join(parentDir, entry),
                    timestamp: parseInt(entry.split('_').pop()) || 0
                }))
                .sort((a, b) => b.timestamp - a.timestamp); // Neueste zuerst
            
            for (const backup of backupDirs) {
                const backupCredsPath = path.join(backup.path, 'creds.json');
                
                if (fs.existsSync(backupCredsPath)) {
                    try {
                        // Teste ob Backup-JSON gültig ist
                        const backupContent = fs.readFileSync(backupCredsPath, 'utf8');
                        const testCreds = JSON.parse(backupContent);
                        
                        if (testCreds.me?.id) {
                            // Backup ist gültig - stelle wieder her
                            console.log(`🔄 Stelle Session aus Backup wieder her: ${backup.path}`);
                            
                            // Kopiere alle Backup-Dateien zurück
                            const backupFiles = fs.readdirSync(backup.path);
                            for (const file of backupFiles) {
                                const srcPath = path.join(backup.path, file);
                                const destPath = path.join(this.authDir, file);
                                
                                try {
                                    fs.copyFileSync(srcPath, destPath);
                                } catch (copyError) {
                                    console.log(`⚠️ Konnte ${file} nicht wiederherstellen`);
                                }
                            }
                            
                            return true;
                        }
                    } catch (backupError) {
                        console.log(`⚠️ Backup ${backup.path} ist auch korrupt`);
                        continue;
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.error('❌ Backup-Recovery Fehler:', error);
            return false;
        }
    }
    
    // Erstellt Backup der korrupten Datei für Debugging
    async backupCorruptedFile(credsPath, content) {
        try {
            const timestamp = Date.now();
            const corruptedDir = `${this.authDir}_corrupted_${timestamp}`;
            
            fs.mkdirSync(corruptedDir, { recursive: true });
            
            // Korrupte Datei sichern
            fs.writeFileSync(path.join(corruptedDir, 'creds.json'), content);
            
            // Debug-Info hinzufügen
            const debugInfo = {
                timestamp: new Date().toISOString(),
                fileSize: content.length,
                firstChars: content.substring(0, 100),
                lastChars: content.substring(Math.max(0, content.length - 100)),
                error: 'JSON parse failed',
                platform: process.platform,
                nodeVersion: process.version
            };
            
            fs.writeFileSync(
                path.join(corruptedDir, 'debug-info.json'), 
                JSON.stringify(debugInfo, null, 2)
            );
            
            console.log(`🗂️ Korrupte Datei gesichert: ${corruptedDir}`);
        } catch (error) {
            console.error('❌ Fehler beim Sichern der korrupten Datei:', error);
        }
    }
    
    // Automatische Session-Reparatur mit erweiterten Optionen
    async autoRepairSession() {
        console.log("🔧 Starte automatische Session-Reparatur...");
        
        const validation = await this.validateSession();
        
        switch (validation.reason) {
            case 'corrupted_creds':
            case 'empty_creds':
            case 'incomplete_creds':
                console.log("🗑️ Korrupte Session erkannt - bereinige...");
                const cleanupResult = await this.cleanupSession();
                if (cleanupResult) {
                    return { repaired: true, action: 'cleanup_corrupted' };
                } else {
                    return { repaired: false, action: 'cleanup_failed' };
                }
                
            case 'session_too_old':
                console.log("⏰ Session zu alt - bereinige...");
                await this.cleanupSession();
                return { repaired: true, action: 'cleanup_old' };
                
            case 'not_logged_in':
                console.log("👤 Nicht eingeloggt - Session bereinigen...");
                await this.cleanupSession();
                return { repaired: true, action: 'cleanup_not_logged_in' };
                
            case 'no_creds':
                console.log("📄 Keine Credentials - Auth-Ordner vorbereiten...");
                await this.ensureAuthDir();
                return { repaired: true, action: 'prepare_auth_dir' };
                
            default:
                return { repaired: false, reason: validation.reason };
        }
    }

    // Intelligente Session-Bereinigung (nur wenn nötig)
    async smartCleanup() {
        const validation = await this.validateSession();
        
        if (validation.valid) {
            console.log("✅ Session ist gültig - keine Bereinigung nötig");
            return { cleaned: false, reason: 'session_valid' };
        }
        
        // Backup vor Bereinigung
        const backupPath = await this.backupSession();
        
        // Bereinigung durchführen
        const cleanupResult = await this.cleanupSession();
        
        return { 
            cleaned: cleanupResult, 
            reason: validation.reason,
            backup: backupPath 
        };
    }
}