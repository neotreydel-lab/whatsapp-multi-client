#!/usr/bin/env node

/**
 * WAEngine Support Website Server
 * Simple Node.js server for the support ticket system
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Get current directory for ES modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// In-memory storage (in production, use a real database)
let tickets = [];
let users = [];
let settings = {
    emailSettings: {
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        emailAddress: 'support@waengine.com'
    },
    ticketSettings: {
        autoReply: true,
        defaultPriority: 'medium',
        ticketPrefix: 'WAE'
    }
};

// Load data from files if they exist
function loadData() {
    try {
        const dataDir = path.join(__dirname, 'data');
        if (fs.existsSync(path.join(dataDir, 'tickets.json'))) {
            tickets = JSON.parse(fs.readFileSync(path.join(dataDir, 'tickets.json'), 'utf8'));
        }
        if (fs.existsSync(path.join(dataDir, 'users.json'))) {
            users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
        }
        if (fs.existsSync(path.join(dataDir, 'settings.json'))) {
            settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf8'));
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to files
function saveData() {
    try {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        fs.writeFileSync(path.join(dataDir, 'tickets.json'), JSON.stringify(tickets, null, 2));
        fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
        fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Serve static files
function serveStaticFile(filePath, res) {
    const fullPath = path.join(__dirname, filePath);
    const extname = path.extname(fullPath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// API Routes
function handleAPI(req, res, pathname, method) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    switch (pathname) {
        case '/api/tickets':
            handleTicketsAPI(req, res, method);
            break;
        case '/api/users':
            handleUsersAPI(req, res, method);
            break;
        case '/api/settings':
            handleSettingsAPI(req, res, method);
            break;
        case '/api/stats':
            handleStatsAPI(req, res, method);
            break;
        default:
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
}

// Tickets API
function handleTicketsAPI(req, res, method) {
    switch (method) {
        case 'GET':
            res.writeHead(200);
            res.end(JSON.stringify(tickets));
            break;
            
        case 'POST':
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const ticketData = JSON.parse(body);
                    
                    // Generate ticket ID
                    const ticketId = generateTicketId();
                    
                    const newTicket = {
                        id: ticketId,
                        ...ticketData,
                        status: 'open',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        assignee: null,
                        conversation: [{
                            id: Date.now(),
                            type: 'system',
                            message: `Vielen Dank für Ihr Ticket! Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden. Ihre Ticket-ID ist: ${ticketId}`,
                            timestamp: new Date().toISOString(),
                            author: 'System'
                        }]
                    };
                    
                    tickets.push(newTicket);
                    
                    // Add or update user
                    addOrUpdateUser(ticketData.name, ticketData.email);
                    
                    saveData();
                    
                    res.writeHead(201);
                    res.end(JSON.stringify(newTicket));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
            break;
            
        case 'PUT':
            // Update ticket
            let updateBody = '';
            req.on('data', chunk => {
                updateBody += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const updateData = JSON.parse(updateBody);
                    const ticketIndex = tickets.findIndex(t => t.id === updateData.id);
                    
                    if (ticketIndex === -1) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Ticket not found' }));
                        return;
                    }
                    
                    tickets[ticketIndex] = {
                        ...tickets[ticketIndex],
                        ...updateData,
                        updatedAt: new Date().toISOString()
                    };
                    
                    saveData();
                    
                    res.writeHead(200);
                    res.end(JSON.stringify(tickets[ticketIndex]));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
            break;
            
        default:
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
}

// Users API
function handleUsersAPI(req, res, method) {
    switch (method) {
        case 'GET':
            res.writeHead(200);
            res.end(JSON.stringify(users));
            break;
            
        default:
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
}

// Settings API
function handleSettingsAPI(req, res, method) {
    switch (method) {
        case 'GET':
            res.writeHead(200);
            res.end(JSON.stringify(settings));
            break;
            
        case 'PUT':
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const newSettings = JSON.parse(body);
                    settings = { ...settings, ...newSettings };
                    saveData();
                    
                    res.writeHead(200);
                    res.end(JSON.stringify(settings));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
            break;
            
        default:
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
}

// Stats API
function handleStatsAPI(req, res, method) {
    if (method !== 'GET') {
        res.writeHead(405);
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        pendingTickets: tickets.filter(t => t.status === 'pending').length,
        closedTickets: tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length,
        totalUsers: users.length,
        ticketsByType: {
            bug: tickets.filter(t => t.type === 'bug').length,
            feature: tickets.filter(t => t.type === 'feature').length,
            help: tickets.filter(t => t.type === 'help').length,
            installation: tickets.filter(t => t.type === 'installation').length,
            other: tickets.filter(t => t.type === 'other').length
        },
        ticketsByPriority: {
            urgent: tickets.filter(t => t.priority === 'urgent').length,
            high: tickets.filter(t => t.priority === 'high').length,
            medium: tickets.filter(t => t.priority === 'medium').length,
            low: tickets.filter(t => t.priority === 'low').length
        }
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(stats));
}

// Helper functions
function generateTicketId() {
    const prefix = settings.ticketSettings.ticketPrefix || 'WAE';
    const year = new Date().getFullYear();
    const number = String(tickets.length + 1).padStart(3, '0');
    return `${prefix}-${year}-${number}`;
}

function addOrUpdateUser(name, email) {
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
        existingUser.lastContact = new Date().toISOString();
        existingUser.ticketCount = tickets.filter(ticket => ticket.email === email).length;
    } else {
        users.push({
            name: name,
            email: email,
            ticketCount: 1,
            lastContact: new Date().toISOString(),
            status: 'active'
        });
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname, method);
        return;
    }
    
    // Handle static files
    let filePath = pathname;
    
    // Default to index.html
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    serveStaticFile(filePath, res);
});

// Start server
server.listen(PORT, HOST, () => {
    console.log(`🚀 WAEngine Support Server running at http://${HOST}:${PORT}/`);
    console.log(`📊 Admin Panel: http://${HOST}:${PORT}/#admin`);
    console.log(`🔧 API Endpoints: http://${HOST}:${PORT}/api/`);
    
    // Load existing data
    loadData();
    
    // Save data periodically
    setInterval(saveData, 30000); // Save every 30 seconds
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    saveData();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    saveData();
    process.exit(0);
});