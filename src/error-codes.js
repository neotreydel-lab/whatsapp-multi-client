// 🆔 WAEngine Error Codes System
// Eindeutige Fehler-IDs für alle Fehlertypen

export const ERROR_CODES = {
    // 1xxx - Connection Errors
    CONNECTION: {
        FAILED: 'WAE-1001',
        TIMEOUT: 'WAE-1002',
        LOST: 'WAE-1003',
        SOCKET_ERROR: 'WAE-1004',
        RECONNECT_FAILED: 'WAE-1005',
        MAX_RETRIES: 'WAE-1006',
        NETWORK_UNREACHABLE: 'WAE-1007',
        DNS_FAILED: 'WAE-1008'
    },
    
    // 2xxx - Authentication Errors
    AUTH: {
        FAILED: 'WAE-2001',
        SESSION_EXPIRED: 'WAE-2002',
        SESSION_CORRUPTED: 'WAE-2003',
        INVALID_CREDENTIALS: 'WAE-2004',
        LOGOUT_DETECTED: 'WAE-2005',
        CREDENTIALS_MISSING: 'WAE-2006',
        LOGIN_REQUIRED: 'WAE-2007',
        LOGOUT_FAILED: 'WAE-2008'
    },
    
    // 3xxx - File System Errors
    FILE: {
        NOT_FOUND: 'WAE-3001',
        PERMISSION_DENIED: 'WAE-3002',
        DISK_FULL: 'WAE-3003',
        TOO_LARGE: 'WAE-3004',
        INVALID_FORMAT: 'WAE-3005',
        READ_ERROR: 'WAE-3006',
        WRITE_ERROR: 'WAE-3007',
        DELETE_ERROR: 'WAE-3008',
        CORRUPTED: 'WAE-3009'
    },
    
    // 4xxx - Message Errors
    MESSAGE: {
        SEND_FAILED: 'WAE-4001',
        INVALID_RECIPIENT: 'WAE-4002',
        TOO_LONG: 'WAE-4003',
        MEDIA_UPLOAD_FAILED: 'WAE-4004',
        INVALID_FORMAT: 'WAE-4005',
        RECEIVE_FAILED: 'WAE-4006',
        MEDIA_DOWNLOAD_FAILED: 'WAE-4007',
        MEDIA_TOO_LARGE: 'WAE-4008'
    },
    
    // 5xxx - Group Errors
    GROUP: {
        NOT_A_GROUP: 'WAE-5001',
        NOT_ADMIN: 'WAE-5002',
        USER_NOT_FOUND: 'WAE-5003',
        NOT_FOUND: 'WAE-5004',
        ACTION_RESTRICTED: 'WAE-5005',
        PERMISSION_DENIED: 'WAE-5006',
        INVALID_SETTINGS: 'WAE-5007'
    },
    
    // 6xxx - Media Errors
    MEDIA: {
        DOWNLOAD_FAILED: 'WAE-6001',
        CONVERSION_FAILED: 'WAE-6002',
        STICKER_CREATION_FAILED: 'WAE-6003',
        INVALID_TYPE: 'WAE-6004',
        TOO_LARGE: 'WAE-6005',
        UPLOAD_FAILED: 'WAE-6006',
        PROCESSING_FAILED: 'WAE-6007'
    },
    
    // 7xxx - Command Errors
    COMMAND: {
        NOT_FOUND: 'WAE-7001',
        EXECUTION_FAILED: 'WAE-7002',
        INVALID_ARGUMENTS: 'WAE-7003',
        PERMISSION_DENIED: 'WAE-7004',
        COOLDOWN_ACTIVE: 'WAE-7005',
        DISABLED: 'WAE-7006'
    },
    
    // 8xxx - Plugin Errors
    PLUGIN: {
        LOAD_FAILED: 'WAE-8001',
        NOT_FOUND: 'WAE-8002',
        INVALID_CONFIG: 'WAE-8003',
        DEPENDENCY_MISSING: 'WAE-8004',
        VERSION_INCOMPATIBLE: 'WAE-8005',
        INITIALIZATION_FAILED: 'WAE-8006',
        EXECUTION_FAILED: 'WAE-8007'
    },
    
    // 9xxx - System Errors
    SYSTEM: {
        OUT_OF_MEMORY: 'WAE-9001',
        PROCESS_CRASHED: 'WAE-9002',
        UNKNOWN_ERROR: 'WAE-9003',
        CONFIGURATION_INVALID: 'WAE-9004',
        INITIALIZATION_FAILED: 'WAE-9005',
        DEPENDENCY_MISSING: 'WAE-9006',
        VERSION_MISMATCH: 'WAE-9007'
    },
    
    // 10xxx - QR Code Errors
    QR: {
        GENERATION_FAILED: 'WAE-10001',
        DISPLAY_FAILED: 'WAE-10002',
        SCAN_TIMEOUT: 'WAE-10003',
        INVALID_DATA: 'WAE-10004',
        BROWSER_OPEN_FAILED: 'WAE-10005',
        TERMINAL_INCOMPATIBLE: 'WAE-10006'
    },
    
    // 11xxx - Mobile Support Errors
    MOBILE: {
        DETECTION_FAILED: 'WAE-11001',
        PAIRING_FAILED: 'WAE-11002',
        CODE_INVALID: 'WAE-11003',
        NOT_SUPPORTED: 'WAE-11004',
        TIMEOUT: 'WAE-11005'
    },
    
    // 12xxx - Recovery Errors
    RECOVERY: {
        FAILED: 'WAE-12001',
        BACKUP_NOT_FOUND: 'WAE-12002',
        BACKUP_CORRUPTED: 'WAE-12003',
        RESTORE_FAILED: 'WAE-12004',
        AUTO_BACKUP_FAILED: 'WAE-12005'
    },
    
    // 13xxx - Database Errors
    DATABASE: {
        CONNECTION_FAILED: 'WAE-13001',
        QUERY_FAILED: 'WAE-13002',
        MIGRATION_FAILED: 'WAE-13003',
        DATA_CORRUPTED: 'WAE-13004',
        TIMEOUT: 'WAE-13005'
    },
    
    // 14xxx - Network Errors
    NETWORK: {
        DNS_FAILED: 'WAE-14001',
        PROXY_FAILED: 'WAE-14002',
        SSL_ERROR: 'WAE-14003',
        RATE_LIMITED: 'WAE-14004',
        FIREWALL_BLOCKED: 'WAE-14005'
    },
    
    // 15xxx - Security Errors
    SECURITY: {
        UNAUTHORIZED: 'WAE-15001',
        TOKEN_EXPIRED: 'WAE-15002',
        INVALID_TOKEN: 'WAE-15003',
        ACCESS_DENIED: 'WAE-15004',
        ENCRYPTION_FAILED: 'WAE-15005'
    }
};

// Error Code Descriptions (Deutsch)
const ErrorDescriptions = {
    // 1xxx - Connection Errors
    'WAE-1001': 'Verbindung fehlgeschlagen',
    'WAE-1002': 'Verbindungs-Timeout',
    'WAE-1003': 'Verbindung verloren',
    'WAE-1004': 'Socket-Fehler',
    'WAE-1005': 'Wiederverbindung fehlgeschlagen',
    'WAE-1006': 'Maximale Wiederverbindungsversuche überschritten',
    'WAE-1007': 'Netzwerk nicht erreichbar',
    'WAE-1008': 'DNS-Auflösung fehlgeschlagen',
    
    // 2xxx - Authentication Errors
    'WAE-2001': 'Authentifizierung fehlgeschlagen',
    'WAE-2002': 'Session abgelaufen',
    'WAE-2003': 'Session korrupt',
    'WAE-2004': 'Credentials ungültig',
    'WAE-2005': 'Logout erkannt',
    'WAE-2006': 'Credentials fehlen',
    'WAE-2007': 'Login erforderlich',
    'WAE-2008': 'Logout fehlgeschlagen',
    
    // 3xxx - File System Errors
    'WAE-3001': 'Datei nicht gefunden',
    'WAE-3002': 'Zugriff verweigert',
    'WAE-3003': 'Festplatte voll',
    'WAE-3004': 'Datei zu groß',
    'WAE-3005': 'Dateiformat ungültig',
    'WAE-3006': 'Datei-Lesefehler',
    'WAE-3007': 'Datei-Schreibfehler',
    'WAE-3008': 'Datei-Löschfehler',
    'WAE-3009': 'Datei korrupt',
    
    // 4xxx - Message Errors
    'WAE-4001': 'Nachricht senden fehlgeschlagen',
    'WAE-4002': 'Empfänger ungültig',
    'WAE-4003': 'Nachricht zu lang',
    'WAE-4004': 'Medien-Upload fehlgeschlagen',
    'WAE-4005': 'Nachrichtenformat ungültig',
    'WAE-4006': 'Nachricht empfangen fehlgeschlagen',
    'WAE-4007': 'Medien-Download fehlgeschlagen',
    'WAE-4008': 'Medien zu groß',
    
    // 5xxx - Group Errors
    'WAE-5001': 'Keine Gruppe',
    'WAE-5002': 'Kein Admin',
    'WAE-5003': 'User nicht gefunden',
    'WAE-5004': 'Gruppe nicht gefunden',
    'WAE-5005': 'Aktion eingeschränkt',
    'WAE-5006': 'Gruppenberechtigung verweigert',
    'WAE-5007': 'Gruppeneinstellungen ungültig',
    
    // 6xxx - Media Errors
    'WAE-6001': 'Media-Download fehlgeschlagen',
    'WAE-6002': 'Media-Konvertierung fehlgeschlagen',
    'WAE-6003': 'Sticker-Erstellung fehlgeschlagen',
    'WAE-6004': 'Media-Typ ungültig',
    'WAE-6005': 'Media zu groß',
    'WAE-6006': 'Media-Upload fehlgeschlagen',
    'WAE-6007': 'Media-Verarbeitung fehlgeschlagen',
    
    // 7xxx - Command Errors
    'WAE-7001': 'Command nicht gefunden',
    'WAE-7002': 'Command-Ausführung fehlgeschlagen',
    'WAE-7003': 'Command-Argumente ungültig',
    'WAE-7004': 'Command-Berechtigung verweigert',
    'WAE-7005': 'Command-Cooldown aktiv',
    'WAE-7006': 'Command deaktiviert',
    
    // 8xxx - Plugin Errors
    'WAE-8001': 'Plugin-Laden fehlgeschlagen',
    'WAE-8002': 'Plugin nicht gefunden',
    'WAE-8003': 'Plugin-Konfiguration ungültig',
    'WAE-8004': 'Plugin-Abhängigkeit fehlt',
    'WAE-8005': 'Plugin-Version inkompatibel',
    'WAE-8006': 'Plugin-Initialisierung fehlgeschlagen',
    'WAE-8007': 'Plugin-Ausführung fehlgeschlagen',
    
    // 9xxx - System Errors
    'WAE-9001': 'Speicher voll',
    'WAE-9002': 'Prozess abgestürzt',
    'WAE-9003': 'Unbekannter Fehler',
    'WAE-9004': 'Konfiguration ungültig',
    'WAE-9005': 'Initialisierung fehlgeschlagen',
    'WAE-9006': 'Abhängigkeit fehlt',
    'WAE-9007': 'Versions-Konflikt',
    
    // 10xxx - QR Code Errors
    'WAE-10001': 'QR-Code Generierung fehlgeschlagen',
    'WAE-10002': 'QR-Code Anzeige fehlgeschlagen',
    'WAE-10003': 'QR-Code Scan Timeout',
    'WAE-10004': 'QR-Daten ungültig',
    'WAE-10005': 'Browser-Öffnung fehlgeschlagen',
    'WAE-10006': 'Terminal inkompatibel',
    
    // 11xxx - Mobile Support Errors
    'WAE-11001': 'Mobile-Erkennung fehlgeschlagen',
    'WAE-11002': 'Mobile-Pairing fehlgeschlagen',
    'WAE-11003': 'Pairing-Code ungültig',
    'WAE-11004': 'Mobile nicht unterstützt',
    'WAE-11005': 'Mobile-Timeout',
    
    // 12xxx - Recovery Errors
    'WAE-12001': 'Recovery fehlgeschlagen',
    'WAE-12002': 'Backup nicht gefunden',
    'WAE-12003': 'Backup korrupt',
    'WAE-12004': 'Wiederherstellung fehlgeschlagen',
    'WAE-12005': 'Auto-Backup fehlgeschlagen',
    
    // 13xxx - Database Errors
    'WAE-13001': 'Datenbankverbindung fehlgeschlagen',
    'WAE-13002': 'Datenbankabfrage fehlgeschlagen',
    'WAE-13003': 'Datenbank-Migration fehlgeschlagen',
    'WAE-13004': 'Daten korrupt',
    'WAE-13005': 'Datenbank-Timeout',
    
    // 14xxx - Network Errors
    'WAE-14001': 'DNS fehlgeschlagen',
    'WAE-14002': 'Proxy fehlgeschlagen',
    'WAE-14003': 'SSL-Fehler',
    'WAE-14004': 'Rate-Limit erreicht',
    'WAE-14005': 'Firewall blockiert',
    
    // 15xxx - Security Errors
    'WAE-15001': 'Nicht autorisiert',
    'WAE-15002': 'Token abgelaufen',
    'WAE-15003': 'Token ungültig',
    'WAE-15004': 'Zugriff verweigert',
    'WAE-15005': 'Verschlüsselung fehlgeschlagen'
};

// Get error description
export function getErrorDescription(errorCode) {
    return ErrorDescriptions[errorCode] || 'Unbekannter Fehler';
}

// Create error with code
export function createError(errorCode, message, context = {}) {
    const description = getErrorDescription(errorCode);
    const error = new Error(message || description);
    error.code = errorCode;
    error.description = description;
    error.context = context;
    error.timestamp = Date.now();
    return error;
}

// Check if error code exists
export function isValidErrorCode(errorCode) {
    return errorCode in ErrorDescriptions;
}

// Get error category
export function getErrorCategory(errorCode) {
    const code = parseInt(errorCode.split('-')[1]);
    if (code >= 1000 && code < 2000) return 'Connection';
    if (code >= 2000 && code < 3000) return 'Authentication';
    if (code >= 3000 && code < 4000) return 'File System';
    if (code >= 4000 && code < 5000) return 'Message';
    if (code >= 5000 && code < 6000) return 'Group';
    if (code >= 6000 && code < 7000) return 'Media';
    if (code >= 7000 && code < 8000) return 'Command';
    if (code >= 8000 && code < 9000) return 'Plugin';
    if (code >= 9000 && code < 10000) return 'System';
    if (code >= 10000 && code < 11000) return 'QR Code';
    if (code >= 11000 && code < 12000) return 'Mobile';
    if (code >= 12000 && code < 13000) return 'Recovery';
    if (code >= 13000 && code < 14000) return 'Database';
    if (code >= 14000 && code < 15000) return 'Network';
    if (code >= 15000 && code < 16000) return 'Security';
    return 'Unknown';
}
