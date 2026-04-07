// ============================================================
// RobotDetailPanel — Full robot information slide-out panel
// ============================================================
import { CYBERSECURITY_STATES, levelXpRequired, totalXpForLevel } from './robot-manager.js';

export class RobotDetailPanel {
    constructor(robotManager) {
        this.robotManager = robotManager;
        this.currentRobotId = null;
        this.currentTab = 'overview';

        // DOM elements
        this.overlay = document.getElementById('robot-detail-overlay');
        this.hero = document.getElementById('robot-detail-hero');
        this.content = document.getElementById('robot-detail-content');
        this.tabs = document.getElementById('robot-detail-tabs');
        this.closeBtn = document.getElementById('btn-close-robot-detail');

        this._bindEvents();
    }

    _bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Tab switching
        this.tabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.robot-tab');
            if (!tab) return;
            this.currentTab = tab.dataset.tab;
            this.tabs.querySelectorAll('.robot-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this._renderTabContent();
        });
    }

    open(instanceId) {
        this.currentRobotId = instanceId;
        this.currentTab = 'overview';

        // Reset tab selection
        this.tabs.querySelectorAll('.robot-tab').forEach(t => t.classList.remove('active'));
        this.tabs.querySelector('[data-tab="overview"]').classList.add('active');

        this._renderHero();
        this._renderTabContent();
        this.overlay.classList.remove('hidden');
    }

    close() {
        this.overlay.classList.add('hidden');
        this.currentRobotId = null;
    }

    isOpen() {
        return !this.overlay.classList.contains('hidden');
    }

    _getRobot() {
        return this.robotManager.getRobot(this.currentRobotId);
    }

    // ---- Hero ----
    _renderHero() {
        const robot = this._getRobot();
        if (!robot) return;

        const statusClass = robot.status;
        const statusLabel = {
            online: 'Online — In Lab',
            maintenance: 'In Maintenance',
            offline: 'Offline',
            field: 'On Field Trial',
        }[robot.status] || robot.status;

        const cs = CYBERSECURITY_STATES.find(s => s.id === robot.cybersecurity) || CYBERSECURITY_STATES[0];
        const lvl = robot.level || 1;
        const xpInfo = this.robotManager.xpProgress(robot);

        this.hero.innerHTML = `
            <img class="robot-hero-image" src="${robot.imageSrc}" alt="${robot.name}">
            <div class="robot-hero-info">
                <h2 class="robot-hero-name">${robot.name}</h2>
                <p class="robot-hero-model">${robot.manufacturer} · ${robot.subtype}</p>
                <div class="robot-hero-badges">
                    <div class="robot-hero-status ${statusClass}">
                        <span class="status-dot ${robot.status === 'online' ? 'pulse' : ''}"></span>
                        ${statusLabel}
                    </div>
                    <div class="robot-level-badge" title="Level ${lvl}">
                        ⭐ Lv.${lvl}
                    </div>
                    <div class="robot-cyber-badge" style="--cs-color: ${cs.color};" title="Cybersecurity: ${cs.label}">
                        ${cs.icon} ${cs.label}
                    </div>
                </div>
                <div class="xp-bar-container">
                    <div class="xp-bar-track">
                        <div class="xp-bar-fill" style="width: ${Math.min(100, xpInfo.progress * 100).toFixed(1)}%"></div>
                    </div>
                    <span class="xp-bar-label">${xpInfo.xpIntoLevel} / ${xpInfo.xpNeeded} XP to Lv.${lvl + 1}</span>
                </div>
            </div>
        `;
    }

    // ---- Tab Content ----
    _renderTabContent() {
        const robot = this._getRobot();
        if (!robot) return;

        switch (this.currentTab) {
            case 'overview': this._renderOverview(robot); break;
            case 'profile':  this._renderProfile(robot);  break;
            case 'equipment': this._renderEquipment(robot); break;
            case 'specs': this._renderSpecs(robot); break;
            case 'maintenance': this._renderMaintenance(robot); break;
            case 'booking': this._renderBooking(robot); break;
            case 'warranty': this._renderWarranty(robot); break;
        }
    }

    // ---- Overview ----
    _renderOverview(robot) {
        const cs = CYBERSECURITY_STATES.find(s => s.id === robot.cybersecurity) || CYBERSECURITY_STATES[0];
        this.content.innerHTML = `
            <div class="detail-card">
                <h4 class="detail-card-title">Current Status</h4>
                <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${robot.location}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-badge ${this._statusBadgeClass(robot.status)}">${robot.status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Last Seen</span>
                    <span class="detail-value">${this._formatDate(robot.lastSeen)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Cybersecurity</span>
                    <span class="detail-badge cyber" style="--cs-color: ${cs.color};">${cs.icon} ${cs.label}</span>
                </div>
            </div>
            <div class="detail-card">
                <h4 class="detail-card-title">Quick Info</h4>
                <div class="detail-row">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${robot.type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Model</span>
                    <span class="detail-value">${robot.model}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Serial Number</span>
                    <span class="detail-value" style="font-family: var(--font-mono);">${robot.serialNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Equipment Installed</span>
                    <span class="detail-value">${robot.equipment.length} items</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Maintenance</span>
                    <span class="detail-badge ${this._maintenanceBadgeClass(robot.maintenanceStatus)}">${robot.maintenanceStatus}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Warranty</span>
                    <span class="detail-badge ${this._warrantyBadgeClass(robot.warrantyStatus)}">${robot.warrantyStatus}</span>
                </div>
            </div>
            <div class="detail-card">
                <h4 class="detail-card-title">Upcoming Bookings</h4>
                ${robot.bookings.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px;">No upcoming bookings</p>' :
                robot.bookings.slice(0, 3).map(b => `
                    <div class="detail-row">
                        <span class="detail-label">${b.user}</span>
                        <span class="detail-value" style="font-size: 12px;">${this._formatDate(b.startDate)} — ${b.purpose}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ---- Profile (Character Sheet + Level + Cybersecurity) ----
    _renderProfile(robot) {
        const xpInfo = this.robotManager.xpProgress(robot);
        const charSheet = robot.charSheet || {};

        // XP to level-up table (next 5 levels)
        let levelTableRows = '';
        for (let l = 1; l <= Math.max(robot.level + 5, 8); l++) {
            const needed = totalXpForLevel(l);
            const isCurrent = l === robot.level;
            const isPast = l < robot.level;
            levelTableRows += `
                <tr class="${isCurrent ? 'level-current' : isPast ? 'level-past' : ''}">
                    <td><strong>Level ${l}</strong></td>
                    <td>${needed} XP total</td>
                    <td>${isPast ? '✅' : isCurrent ? '▶️' : `+${levelXpRequired(l)} XP`}</td>
                </tr>
            `;
        }

        this.content.innerHTML = `
            <!-- Level & XP -->
            <div class="detail-card">
                <h4 class="detail-card-title">Level &amp; Experience</h4>
                <div class="profile-level-display">
                    <div class="profile-level-badge">
                        <span class="profile-level-number">${robot.level}</span>
                        <span class="profile-level-label">LVL</span>
                    </div>
                    <div class="profile-xp-info">
                        <div class="profile-xp-total">${robot.xp} XP total · ${robot.checkIns || 0} check-ins</div>
                        <div class="xp-bar-track profile-xp-bar">
                            <div class="xp-bar-fill" style="width: ${Math.min(100, xpInfo.progress * 100).toFixed(1)}%"></div>
                        </div>
                        <div class="xp-bar-label">${xpInfo.xpIntoLevel} / ${xpInfo.xpNeeded} XP → Level ${robot.level + 1}</div>
                    </div>
                </div>
                <button class="checkin-btn" id="btn-checkin">
                    ✅ Check In <span class="checkin-xp">+1 XP</span>
                </button>
                <div class="detail-card" style="margin-top: 12px; padding: 10px; background: var(--bg-elevated);">
                    <table class="level-table">
                        <thead><tr><th>Level</th><th>Requirement</th><th>Status</th></tr></thead>
                        <tbody>${levelTableRows}</tbody>
                    </table>
                </div>
            </div>

            <!-- Cybersecurity -->
            <div class="detail-card">
                <h4 class="detail-card-title">Cybersecurity</h4>
                <div class="cyber-selector">
                    ${CYBERSECURITY_STATES.map(cs => `
                        <label class="cyber-option ${robot.cybersecurity === cs.id ? 'selected' : ''}"
                               data-cs-id="${cs.id}"
                               style="--cs-color: ${cs.color};">
                            <input type="radio" name="cybersecurity" value="${cs.id}"
                                   ${robot.cybersecurity === cs.id ? 'checked' : ''}>
                            <span class="cyber-icon">${cs.icon}</span>
                            <span class="cyber-label">${cs.label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- Character Sheet -->
            <div class="detail-card">
                <h4 class="detail-card-title">Character Sheet</h4>
                <div class="charsheet-grid">
                    <div class="charsheet-field">
                        <label class="charsheet-label">⚖️ Weight</label>
                        <input class="charsheet-input" id="cs-weight" type="text"
                               value="${charSheet.weight || ''}" placeholder="e.g. 35 kg">
                    </div>
                    <div class="charsheet-field">
                        <label class="charsheet-label">⚡ Max Speed</label>
                        <input class="charsheet-input" id="cs-speed" type="text"
                               value="${charSheet.speed || ''}" placeholder="e.g. 1.5 m/s">
                    </div>
                    <div class="charsheet-field">
                        <label class="charsheet-label">🔋 Battery Runtime</label>
                        <input class="charsheet-input" id="cs-battery" type="text"
                               value="${charSheet.battery || ''}" placeholder="e.g. 4h">
                    </div>
                    <div class="charsheet-field">
                        <label class="charsheet-label">🪜 Can Use Stairs</label>
                        <div class="charsheet-toggle">
                            <label class="toggle-option ${charSheet.staircase ? '' : 'selected'}" id="toggle-stairs-no">
                                <input type="radio" name="staircase" value="no" ${!charSheet.staircase ? 'checked' : ''}> No
                            </label>
                            <label class="toggle-option ${charSheet.staircase ? 'selected' : ''}" id="toggle-stairs-yes">
                                <input type="radio" name="staircase" value="yes" ${charSheet.staircase ? 'checked' : ''}> Yes
                            </label>
                        </div>
                    </div>
                </div>
                <button class="save-charsheet-btn" id="btn-save-charsheet">
                    💾 Save Character Sheet <span class="checkin-xp">+1 XP</span>
                </button>
            </div>
        `;

        // --- Bind profile interactions ---

        // Check-in button
        document.getElementById('btn-checkin').addEventListener('click', () => {
            const result = this.robotManager.checkIn(this.currentRobotId);
            this._showXpPopup(result);
            this._renderHero();
            this._renderProfile(this.robotManager.getRobot(this.currentRobotId));
        });

        // Cybersecurity radio change
        this.content.querySelectorAll('input[name="cybersecurity"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const result = this.robotManager.addXP(this.currentRobotId, 1);
                this.robotManager.updateRobot(this.currentRobotId, { cybersecurity: radio.value });
                // Update visual selection
                this.content.querySelectorAll('.cyber-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.dataset.csId === radio.value);
                });
                this._showXpPopup(result);
                this._renderHero();
            });
        });

        // Save character sheet
        document.getElementById('btn-save-charsheet').addEventListener('click', () => {
            const robot = this._getRobot();
            const newSheet = {
                weight:    document.getElementById('cs-weight').value.trim() || robot.charSheet.weight,
                speed:     document.getElementById('cs-speed').value.trim()  || robot.charSheet.speed,
                battery:   document.getElementById('cs-battery').value.trim() || robot.charSheet.battery,
                staircase: document.querySelector('input[name="staircase"]:checked')?.value === 'yes',
            };
            this.robotManager.updateRobot(this.currentRobotId, { charSheet: newSheet });
            const result = this.robotManager.addXP(this.currentRobotId, 1);
            this._showXpPopup(result);
            this._renderHero();
            // Briefly highlight button
            const btn = document.getElementById('btn-save-charsheet');
            if (btn) { btn.textContent = '✅ Saved!'; setTimeout(() => { btn.innerHTML = '💾 Save Character Sheet <span class="checkin-xp">+1 XP</span>'; }, 1500); }
        });
    }

    // Show floating XP pop-up
    _showXpPopup(result) {
        if (!result) return;
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.textContent = result.leveled
            ? `🎉 LEVEL UP! Now Lv.${result.newLevel}`
            : `+${result.xpGained} XP`;
        this.overlay.appendChild(popup);
        // Position near hero
        const heroRect = this.hero.getBoundingClientRect();
        popup.style.top  = (heroRect.bottom - 20) + 'px';
        popup.style.right = '40px';
        setTimeout(() => popup.remove(), 2000);
    }

    // ---- Equipment ----
    _renderEquipment(robot) {
        this.content.innerHTML = `
            <div class="detail-card">
                <h4 class="detail-card-title">Installed Equipment (${robot.equipment.length})</h4>
                <div class="equipment-list">
                    ${robot.equipment.map(e => `
                        <div class="equipment-item">
                            <div class="equipment-icon">${e.icon}</div>
                            <div class="equipment-info">
                                <span class="equipment-name">${e.name}</span>
                                <span class="equipment-desc">${e.desc}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ---- Specs ----
    _renderSpecs(robot) {
        this.content.innerHTML = `
            <div class="detail-card">
                <h4 class="detail-card-title">Identity</h4>
                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${robot.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Model</span>
                    <span class="detail-value">${robot.model}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Manufacturer</span>
                    <span class="detail-value">${robot.manufacturer}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Serial Number</span>
                    <span class="detail-value" style="font-family: var(--font-mono);">${robot.serialNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${robot.type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Subtype</span>
                    <span class="detail-value">${robot.subtype}</span>
                </div>
            </div>
            <div class="detail-card">
                <h4 class="detail-card-title">Hardware</h4>
                <div class="detail-row">
                    <span class="detail-label">Hardware Version</span>
                    <span class="detail-value" style="font-family: var(--font-mono);">${robot.hardwareVersion}</span>
                </div>
            </div>
            <div class="detail-card">
                <h4 class="detail-card-title">Software</h4>
                <div class="detail-row">
                    <span class="detail-label">Software Version</span>
                    <span class="detail-value" style="font-family: var(--font-mono);">${robot.softwareVersion}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">ROS Version</span>
                    <span class="detail-value">${robot.rosVersion}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Firmware</span>
                    <span class="detail-value" style="font-family: var(--font-mono);">${robot.firmwareVersion}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Operating System</span>
                    <span class="detail-value">${robot.os}</span>
                </div>
            </div>
        `;
    }

    // ---- Maintenance ----
    _renderMaintenance(robot) {
        this.content.innerHTML = `
            <div class="detail-card">
                <h4 class="detail-card-title">Maintenance Status</h4>
                <div class="detail-row">
                    <span class="detail-label">Current Status</span>
                    <span class="detail-badge ${this._maintenanceBadgeClass(robot.maintenanceStatus)}">${robot.maintenanceStatus}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Next Service Due</span>
                    <span class="detail-value">${this._formatDate(robot.nextMaintenanceDue)}</span>
                </div>
            </div>
            <div class="detail-card">
                <h4 class="detail-card-title">Maintenance Log</h4>
                ${robot.maintenanceLog.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px;">No maintenance records</p>' : `
                <table class="maintenance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Technician</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${robot.maintenanceLog.map(entry => `
                            <tr>
                                <td>${this._formatDate(entry.date)}</td>
                                <td>${entry.type}</td>
                                <td>${entry.technician}</td>
                                <td><span class="detail-badge green">${entry.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `}
            </div>
        `;
    }

    // ---- Booking ----
    _renderBooking(robot) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const bookedDays = new Set();
        for (const booking of robot.bookings) {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                if (d.getMonth() === month && d.getFullYear() === year) {
                    bookedDays.add(d.getDate());
                }
            }
        }

        let calendarHTML = '';
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(d => { calendarHTML += `<div class="booking-day-header">${d}</div>`; });
        for (let i = 0; i < firstDay; i++) calendarHTML += '<div class="booking-day empty"></div>';
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === now.getDate();
            const isBooked = bookedDays.has(day);
            const classes = ['booking-day'];
            if (isToday) classes.push('today');
            if (isBooked) classes.push('booked');
            calendarHTML += `<div class="${classes.join(' ')}">${day}</div>`;
        }

        this.content.innerHTML = `
            <div class="detail-card">
                <h4 class="detail-card-title">${monthName}</h4>
                <div class="booking-calendar">${calendarHTML}</div>
                <div class="booking-legend">
                    <div class="booking-legend-item">
                        <div class="booking-legend-dot" style="background: var(--accent-primary); opacity: 0.3;"></div>
                        Booked
                    </div>
                    <div class="booking-legend-item">
                        <div class="booking-legend-dot" style="border: 1px solid var(--accent-primary);"></div>
                        Today
                    </div>
                </div>
            </div>
            <div class="detail-card">
                <h4 class="detail-card-title">Bookings (${robot.bookings.length})</h4>
                ${robot.bookings.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px;">No bookings scheduled</p>' :
                robot.bookings.map(b => `
                    <div class="detail-row" style="flex-wrap: wrap; gap: 4px;">
                        <div>
                            <span class="detail-label">${b.user}</span>
                            <span class="detail-value" style="margin-left: 8px; font-size: 12px;">${b.purpose}</span>
                        </div>
                        <span class="detail-badge blue">${this._formatDate(b.startDate)} → ${this._formatDate(b.endDate)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ---- Warranty ----
    _renderWarranty(robot) {
        const start = new Date(robot.warrantyStart);
        const end = new Date(robot.warrantyEnd);
        const now = new Date();

        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const elapsedDays = (now - start) / (1000 * 60 * 60 * 24);
        const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
        const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

        let progressColor = 'var(--status-online)';
        if (progress > 80) progressColor = 'var(--status-warning)';
        if (progress > 95) progressColor = 'var(--status-danger)';

        this.content.innerHTML = `
            <div class="detail-card">
                <h4 class="detail-card-title">Warranty Status</h4>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-badge ${this._warrantyBadgeClass(robot.warrantyStatus)}">${robot.warrantyStatus}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Start Date</span>
                    <span class="detail-value">${this._formatDate(robot.warrantyStart)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">End Date</span>
                    <span class="detail-value">${this._formatDate(robot.warrantyEnd)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Days Remaining</span>
                    <span class="detail-value" style="font-weight: 700; color: ${daysLeft < 90 ? 'var(--status-warning)' : 'var(--text-primary)'};">${daysLeft} days</span>
                </div>
                <div class="warranty-progress">
                    <div class="warranty-progress-fill" style="width: ${progress}%; background: ${progressColor};"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
                    <span>${this._formatDate(robot.warrantyStart)}</span>
                    <span>${Math.round(progress)}% elapsed</span>
                    <span>${this._formatDate(robot.warrantyEnd)}</span>
                </div>
            </div>
            <div class="detail-card">
                <h4 class="detail-card-title">Coverage Details</h4>
                <div class="detail-row">
                    <span class="detail-label">Coverage Type</span>
                    <span class="detail-value">Standard Manufacturer Warranty</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Includes</span>
                    <span class="detail-value">Parts &amp; Labour</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Exclusions</span>
                    <span class="detail-value">Accidental damage, wear parts</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Manufacturer Support</span>
                    <span class="detail-value">${robot.manufacturer}</span>
                </div>
            </div>
        `;
    }

    // ---------- Helpers ----------

    _statusBadgeClass(status) {
        return { online: 'green', maintenance: 'amber', offline: 'red', field: 'blue' }[status] || 'blue';
    }
    _maintenanceBadgeClass(status) {
        return { OK: 'green', 'Due Soon': 'amber', Overdue: 'red' }[status] || 'green';
    }
    _warrantyBadgeClass(status) {
        return { Active: 'green', 'Expiring Soon': 'amber', Expired: 'red' }[status] || 'green';
    }
    _formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
}
