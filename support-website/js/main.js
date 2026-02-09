// ===== GLOBAL VARIABLES =====
let tickets = [];
let users = [];
let currentUser = null;
let isAdminLoggedIn = false;
let currentTicket = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
    setupEventListeners();
    updateStats();
});

function initializeApp() {
    // Load data from localStorage
    tickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
    users = JSON.parse(localStorage.getItem('supportUsers')) || [];
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup FAQ toggles
    setupFAQToggles();
    
    console.log('WAEngine Support System initialized');
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Forms
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', handleTicketSubmission);
    }
    
    const quickContactForm = document.getElementById('quickContactForm');
    if (quickContactForm) {
        quickContactForm.addEventListener('submit', handleQuickContact);
    }
    
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Modal close events
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ===== NAVIGATION =====
function handleNavigation(event) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== FAQ FUNCTIONALITY =====
function setupFAQToggles() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ===== TICKET SYSTEM =====
function openTicketModal(type = '') {
    const modal = document.getElementById('ticketModal');
    const typeSelect = document.getElementById('ticketType');
    
    if (type) {
        typeSelect.value = type;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeTicketModal() {
    const modal = document.getElementById('ticketModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('ticketForm').reset();
}

function handleTicketSubmission(event) {
    event.preventDefault();
    
    const ticketData = {
        id: generateTicketId(),
        type: document.getElementById('ticketType').value,
        priority: document.getElementById('ticketPriority').value,
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        subject: document.getElementById('ticketSubject').value,
        description: document.getElementById('ticketDescription').value,
        systemInfo: document.getElementById('systemInfo').value,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignee: null,
        conversation: []
    };
    
    // Add to tickets array
    tickets.push(ticketData);
    
    // Save to localStorage
    saveTickets();
    
    // Add user if not exists
    addOrUpdateUser(ticketData.name, ticketData.email);
    
    // Close modal and show success
    closeTicketModal();
    showToast(`Ticket ${ticketData.id} erfolgreich erstellt!`, 'success');
    
    // Update admin dashboard if logged in
    if (isAdminLoggedIn) {
        updateStats();
        loadRecentTickets();
        loadTicketsTable();
    }
    
    // Send auto-reply email (simulated)
    sendAutoReply(ticketData);
}

function generateTicketId() {
    const prefix = 'WAE';
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
    
    saveUsers();
}

function saveTickets() {
    localStorage.setItem('supportTickets', JSON.stringify(tickets));
}

function saveUsers() {
    localStorage.setItem('supportUsers', JSON.stringify(users));
}

function sendAutoReply(ticketData) {
    // Simulate auto-reply email
    console.log(`Auto-reply sent to ${ticketData.email} for ticket ${ticketData.id}`);
    
    // Add auto-reply to conversation
    ticketData.conversation.push({
        id: Date.now(),
        type: 'system',
        message: `Vielen Dank für Ihr Ticket! Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden. Ihre Ticket-ID ist: ${ticketData.id}`,
        timestamp: new Date().toISOString(),
        author: 'System'
    });
    
    saveTickets();
}

// ===== TICKET STATUS =====
function showTicketStatus() {
    const modal = document.getElementById('statusModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Clear results
    document.getElementById('ticketResults').innerHTML = '';
    document.getElementById('ticketId').value = '';
}

function searchTicket() {
    const searchTerm = document.getElementById('ticketId').value.trim();
    const resultsContainer = document.getElementById('ticketResults');
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '<p class="text-center">Bitte geben Sie eine Ticket-ID oder E-Mail-Adresse ein.</p>';
        return;
    }
    
    // Search by ticket ID or email
    const foundTickets = tickets.filter(ticket => 
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (foundTickets.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center">Keine Tickets gefunden.</p>';
        return;
    }
    
    // Display results
    let html = '<div class="ticket-results">';
    foundTickets.forEach(ticket => {
        html += `
            <div class="ticket-result-item">
                <div class="ticket-result-header">
                    <h4>${ticket.id} - ${ticket.subject}</h4>
                    <span class="status-badge status-${ticket.status}">${getStatusText(ticket.status)}</span>
                </div>
                <div class="ticket-result-meta">
                    <p><strong>Typ:</strong> ${getTypeText(ticket.type)}</p>
                    <p><strong>Priorität:</strong> ${getPriorityText(ticket.priority)}</p>
                    <p><strong>Erstellt:</strong> ${formatDate(ticket.createdAt)}</p>
                    <p><strong>Letztes Update:</strong> ${formatDate(ticket.updatedAt)}</p>
                </div>
                <div class="ticket-result-description">
                    <p>${ticket.description.substring(0, 200)}${ticket.description.length > 200 ? '...' : ''}</p>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    resultsContainer.innerHTML = html;
}

// ===== ADMIN SYSTEM =====
function showAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('adminLoginForm').reset();
}

function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple authentication (in production, use proper authentication)
    if (username === 'admin' && password === 'waengine2024') {
        isAdminLoggedIn = true;
        closeAdminLogin();
        showAdminPanel();
        showToast('Erfolgreich als Admin angemeldet!', 'success');
    } else {
        showToast('Ungültige Anmeldedaten!', 'error');
    }
}

function showAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Load admin data
    updateStats();
    loadRecentTickets();
    loadTicketsTable();
    loadUsersTable();
    
    // Show dashboard by default
    showAdminTab('dashboard');
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    showToast('Erfolgreich abgemeldet!', 'info');
}

function showAdminTab(tabName) {
    // Hide all content sections
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Show selected content
    const targetContent = document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
    }
    
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the clicked tab
    const clickedTab = Array.from(document.querySelectorAll('.admin-tab')).find(tab => 
        tab.textContent.toLowerCase().includes(tabName.toLowerCase()) ||
        tab.onclick.toString().includes(tabName)
    );
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    // Load section-specific data
    switch(tabName) {
        case 'dashboard':
            updateStats();
            loadRecentTickets();
            break;
        case 'tickets':
            loadTicketsTable();
            break;
        case 'users':
            loadUsersTable();
            break;
    }
}

// ===== ADMIN DASHBOARD =====
function updateStats() {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const closedTickets = tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;
    const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
    
    // Update dashboard stats
    const totalElement = document.getElementById('totalTickets');
    const openElement = document.getElementById('openTickets');
    const closedElement = document.getElementById('closedTickets');
    const urgentElement = document.getElementById('urgentTickets');
    
    if (totalElement) totalElement.textContent = totalTickets;
    if (openElement) openElement.textContent = openTickets;
    if (closedElement) closedElement.textContent = closedTickets;
    if (urgentElement) urgentElement.textContent = urgentTickets;
}

function loadRecentTickets() {
    const container = document.getElementById('recentActivities');
    
    if (!container) return;
    
    const recentTickets = tickets
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentTickets.length === 0) {
        container.innerHTML = '<p class="text-center">Keine Tickets vorhanden.</p>';
        return;
    }
    
    let html = '';
    recentTickets.forEach(ticket => {
        html += `
            <div class="ticket-item" onclick="openTicketDetail('${ticket.id}')">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="status-badge status-${ticket.status}">${getStatusText(ticket.status)}</span>
                </div>
                <h4>${ticket.subject}</h4>
                <p class="ticket-meta">
                    ${ticket.name} • ${getTypeText(ticket.type)} • ${formatDate(ticket.createdAt)}
                </p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function loadTicketsTable() {
    const tbody = document.getElementById('ticketsTableBody');
    
    if (!tbody) return;
    
    if (tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Keine Tickets vorhanden.</td></tr>';
        return;
    }
    
    let html = '';
    tickets.forEach(ticket => {
        html += `
            <tr style="cursor: pointer;" class="ticket-row">
                <td><strong>${ticket.id}</strong></td>
                <td>${ticket.subject}</td>
                <td>${ticket.name}</td>
                <td><span class="status-badge status-${ticket.type}">${getTypeText(ticket.type)}</span></td>
                <td><span class="priority-badge priority-${ticket.priority}">${getPriorityText(ticket.priority)}</span></td>
                <td><span class="status-badge status-${ticket.status}">${getStatusText(ticket.status)}</span></td>
                <td>${formatDate(ticket.createdAt)}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="openTicketDetail('${ticket.id}')" title="Ticket öffnen">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Keine Benutzer vorhanden.</td></tr>';
        return;
    }
    
    let html = '';
    users.forEach(user => {
        html += `
            <tr class="user-row">
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.ticketCount}</td>
                <td>${formatDate(user.lastContact)}</td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="viewUserTickets('${user.email}')" title="Benutzer-Tickets anzeigen">
                        <i class="fas fa-ticket-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ===== TICKET DETAIL =====
function openTicketDetail(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
        showToast('Ticket nicht gefunden!', 'error');
        return;
    }
    
    currentTicket = ticket;
    
    // Populate modal
    document.getElementById('ticketDetailTitle').textContent = `${ticket.id} - ${ticket.subject}`;
    document.getElementById('detailTicketId').textContent = ticket.id;
    document.getElementById('detailStatus').value = ticket.status;
    document.getElementById('detailPriority').value = ticket.priority;
    document.getElementById('detailAssignee').value = ticket.assignee || '';
    
    // Enhanced ticket description
    document.getElementById('ticketDescription').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; padding: 15px; background: var(--bg-secondary); border-radius: var(--border-radius);">
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-weight: 600; color: var(--text-secondary); font-size: 0.85rem;"><i class="fas fa-user"></i> Von:</label>
                <span style="font-weight: 500; color: var(--text-primary);">${ticket.name} (${ticket.email})</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-weight: 600; color: var(--text-secondary); font-size: 0.85rem;"><i class="fas fa-tag"></i> Typ:</label>
                <span style="font-weight: 500; color: var(--text-primary);">${getTypeText(ticket.type)}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-weight: 600; color: var(--text-secondary); font-size: 0.85rem;"><i class="fas fa-clock"></i> Erstellt:</label>
                <span style="font-weight: 500; color: var(--text-primary);">${formatDate(ticket.createdAt)}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-weight: 600; color: var(--text-secondary); font-size: 0.85rem;"><i class="fas fa-edit"></i> Aktualisiert:</label>
                <span style="font-weight: 500; color: var(--text-primary);">${formatDate(ticket.updatedAt)}</span>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <h5 style="font-size: 1rem; font-weight: 600; margin-bottom: 10px; color: var(--text-primary);"><i class="fas fa-align-left"></i> Beschreibung:</h5>
            <p style="line-height: 1.6; color: var(--text-secondary);">${ticket.description.replace(/\n/g, '<br>')}</p>
        </div>
        ${ticket.systemInfo ? `
            <div style="background: var(--bg-dark); padding: 15px; border-radius: var(--border-radius); margin-top: 15px;">
                <h5 style="color: #e2e8f0; font-size: 0.9rem; margin-bottom: 10px;"><i class="fas fa-desktop"></i> System Information:</h5>
                <pre style="color: #94a3b8; font-size: 0.8rem; line-height: 1.4; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${ticket.systemInfo}</pre>
            </div>
        ` : ''}
    `;
    
    // Load conversation
    loadConversation();
    
    // Show modal
    const modal = document.getElementById('ticketDetailModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeTicketDetail() {
    const modal = document.getElementById('ticketDetailModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentTicket = null;
}

function loadConversation() {
    if (!currentTicket) return;
    
    const container = document.getElementById('ticketMessages');
    
    if (!container) return;
    
    if (currentTicket.conversation.length === 0) {
        container.innerHTML = '<p class="text-center">Keine Nachrichten in der Konversation.</p>';
        return;
    }
    
    let html = '';
    currentTicket.conversation.forEach(message => {
        html += `
            <div class="conversation-message ${message.type}">
                <div class="message-header">
                    <strong>${message.author}</strong>
                    <span class="message-time">${formatDate(message.timestamp)}</span>
                </div>
                <div class="message-content">
                    ${message.message.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

function sendReply() {
    if (!currentTicket) return;
    
    const messageText = document.getElementById('replyMessage').value.trim();
    if (!messageText) {
        showToast('Bitte geben Sie eine Nachricht ein.', 'error');
        return;
    }
    
    // Add message to conversation
    const message = {
        id: Date.now(),
        type: 'admin',
        message: messageText,
        timestamp: new Date().toISOString(),
        author: 'Support Team'
    };
    
    currentTicket.conversation.push(message);
    currentTicket.updatedAt = new Date().toISOString();
    
    // Update status if it was open
    if (currentTicket.status === 'open') {
        currentTicket.status = 'pending';
        document.getElementById('detailStatus').value = 'pending';
    }
    
    // Save and update UI
    saveTickets();
    loadConversation();
    document.getElementById('replyMessage').value = '';
    
    // Update tables
    loadTicketsTable();
    updateStats();
    
    showToast('Antwort gesendet!', 'success');
}

function updateTicketStatus() {
    if (!currentTicket) return;
    
    const newStatus = document.getElementById('detailStatus').value;
    currentTicket.status = newStatus;
    currentTicket.updatedAt = new Date().toISOString();
    
    saveTickets();
    loadTicketsTable();
    updateStats();
    
    showToast('Status aktualisiert!', 'success');
}

function updateTicketPriority() {
    if (!currentTicket) return;
    
    const newPriority = document.getElementById('detailPriority').value;
    currentTicket.priority = newPriority;
    currentTicket.updatedAt = new Date().toISOString();
    
    saveTickets();
    loadTicketsTable();
    
    showToast('Priorität aktualisiert!', 'success');
}

function updateTicketAssignee() {
    if (!currentTicket) return;
    
    const assignee = document.getElementById('detailAssignee').value;
    currentTicket.assignee = assignee;
    currentTicket.updatedAt = new Date().toISOString();
    
    saveTickets();
    loadTicketsTable();
    
    showToast('Ticket zugewiesen!', 'success');
}

// ===== FILTERING & SEARCH =====
function filterTickets() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const searchTerm = document.getElementById('searchTickets').value.toLowerCase();
    
    let filteredTickets = tickets;
    
    if (statusFilter && statusFilter !== '') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter && priorityFilter !== '') {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
    }
    
    if (searchTerm) {
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.id.toLowerCase().includes(searchTerm) ||
            ticket.subject.toLowerCase().includes(searchTerm) ||
            ticket.name.toLowerCase().includes(searchTerm) ||
            ticket.email.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm)
        );
    }
    
    displayFilteredTickets(filteredTickets);
}

function displayFilteredTickets(filteredTickets) {
    const tbody = document.getElementById('ticketsTableBody');
    
    if (!tbody) return;
    
    if (filteredTickets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div style="padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <h3>Keine Ergebnisse</h3>
                        <p>Keine Tickets entsprechen Ihren Suchkriterien.</p>
                        <button class="btn btn-secondary" onclick="resetFilters()">Filter zurücksetzen</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filteredTickets.forEach(ticket => {
        html += `
            <tr style="cursor: pointer;" class="ticket-row">
                <td><strong>${ticket.id}</strong></td>
                <td>${ticket.subject}</td>
                <td>${ticket.name}</td>
                <td><span class="status-badge status-${ticket.type}">${getTypeText(ticket.type)}</span></td>
                <td><span class="priority-badge priority-${ticket.priority}">${getPriorityText(ticket.priority)}</span></td>
                <td><span class="status-badge status-${ticket.status}">${getStatusText(ticket.status)}</span></td>
                <td>${formatDate(ticket.createdAt)}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="openTicketDetail('${ticket.id}')" title="Ticket öffnen">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function resetFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const searchInput = document.getElementById('searchTickets');
    
    if (statusFilter) statusFilter.value = '';
    if (priorityFilter) priorityFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    loadTicketsTable();
}

// ===== HELPER FUNCTIONS =====
function viewUserTickets(email) {
    // Filter tickets by user email
    const userTickets = tickets.filter(ticket => ticket.email === email);
    
    if (userTickets.length === 0) {
        showToast('Dieser Benutzer hat keine Tickets.', 'info');
        return;
    }
    
    // Switch to tickets tab and filter
    showAdminTab('tickets');
    
    // Set search filter
    document.getElementById('searchTickets').value = email;
    filterTickets();
    
    showToast(`${userTickets.length} Tickets von ${email} gefunden.`, 'success');
}

function showAddUserModal() {
    showToast('Benutzer hinzufügen Feature kommt bald!', 'info');
}

// ===== QUICK CONTACT =====
function handleQuickContact(event) {
    event.preventDefault();
    
    // Simulate sending contact form
    showToast('Nachricht gesendet! Wir melden uns bald bei Ihnen.', 'success');
    event.target.reset();
}

// ===== UTILITY FUNCTIONS =====
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel && adminPanel.style.display === 'block' && !isAdminLoggedIn) {
        adminPanel.style.display = 'none';
    }
    
    document.body.style.overflow = 'auto';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    
    // Set toast color based on type
    toast.className = 'toast';
    if (type === 'error') {
        toast.style.background = 'var(--danger-color)';
    } else if (type === 'info') {
        toast.style.background = 'var(--info-color)';
    } else {
        toast.style.background = 'var(--success-color)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'open': 'Offen',
        'pending': 'Wartend',
        'resolved': 'Gelöst',
        'closed': 'Geschlossen'
    };
    return statusMap[status] || status;
}

function getPriorityText(priority) {
    const priorityMap = {
        'low': 'Niedrig',
        'medium': 'Mittel',
        'high': 'Hoch',
        'urgent': 'Dringend'
    };
    return priorityMap[priority] || priority;
}

function getTypeText(type) {
    const typeMap = {
        'bug': 'Bug Report',
        'feature': 'Feature Request',
        'help': 'Hilfe & Support',
        'installation': 'Installation',
        'documentation': 'Dokumentation',
        'other': 'Sonstiges'
    };
    return typeMap[type] || type;
}

// ===== SAMPLE DATA =====
function loadSampleData() {
    if (tickets.length === 0) {
        // Add some sample tickets for demonstration
        const sampleTickets = [
            {
                id: 'WAE-2024-001',
                type: 'bug',
                priority: 'high',
                name: 'Max Mustermann',
                email: 'max@example.com',
                subject: 'QR Code wird nicht angezeigt',
                description: 'Der QR Code erscheint nicht im Browser. Ich verwende Windows 11 mit Chrome.',
                systemInfo: 'Windows 11, Chrome 120, Node.js 18.17.0',
                status: 'open',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                assignee: null,
                conversation: [
                    {
                        id: 1,
                        type: 'system',
                        message: 'Vielen Dank für Ihr Ticket! Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden. Ihre Ticket-ID ist: WAE-2024-001',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        author: 'System'
                    }
                ]
            },
            {
                id: 'WAE-2024-002',
                type: 'feature',
                priority: 'medium',
                name: 'Anna Schmidt',
                email: 'anna@example.com',
                subject: 'Multi-Device Support für 5 Geräte',
                description: 'Wäre es möglich, mehr als 3 Geräte gleichzeitig zu unterstützen?',
                systemInfo: 'Ubuntu 22.04, Node.js 20.0.0',
                status: 'pending',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                assignee: 'admin',
                conversation: [
                    {
                        id: 1,
                        type: 'system',
                        message: 'Vielen Dank für Ihr Ticket! Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden. Ihre Ticket-ID ist: WAE-2024-002',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        author: 'System'
                    },
                    {
                        id: 2,
                        type: 'admin',
                        message: 'Hallo Anna, vielen Dank für Ihren Feature Request! Multi-Device Support für mehr als 3 Geräte ist bereits in Planung für v2.0. Wir werden Sie informieren, sobald es verfügbar ist.',
                        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                        author: 'Support Team'
                    }
                ]
            },
            {
                id: 'WAE-2024-003',
                type: 'help',
                priority: 'low',
                name: 'Peter Weber',
                email: 'peter@example.com',
                subject: 'Wie erstelle ich einen EasyBot?',
                description: 'Ich bin Anfänger und möchte einen einfachen Bot erstellen. Können Sie mir helfen?',
                systemInfo: 'macOS Ventura, Node.js 18.15.0',
                status: 'resolved',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                assignee: 'support',
                conversation: [
                    {
                        id: 1,
                        type: 'system',
                        message: 'Vielen Dank für Ihr Ticket! Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden. Ihre Ticket-ID ist: WAE-2024-003',
                        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        author: 'System'
                    },
                    {
                        id: 2,
                        type: 'admin',
                        message: 'Hallo Peter! Gerne helfe ich Ihnen beim Einstieg. Hier ist ein einfaches Beispiel:\n\nimport { quickBot } from "waengine";\n\nquickBot()\n    .when("hello").reply("Hi! 👋")\n    .start();\n\nMehr Beispiele finden Sie in unserer Dokumentation.',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        author: 'Support Team'
                    },
                    {
                        id: 3,
                        type: 'user',
                        message: 'Vielen Dank! Das hat perfekt funktioniert. Mein Bot läuft jetzt!',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        author: 'Peter Weber'
                    }
                ]
            }
        ];
        
        tickets = sampleTickets;
        saveTickets();
        
        // Add sample users
        users = [
            {
                name: 'Max Mustermann',
                email: 'max@example.com',
                ticketCount: 1,
                lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            },
            {
                name: 'Anna Schmidt',
                email: 'anna@example.com',
                ticketCount: 1,
                lastContact: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            },
            {
                name: 'Peter Weber',
                email: 'peter@example.com',
                ticketCount: 1,
                lastContact: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            }
        ];
        saveUsers();
    }
}