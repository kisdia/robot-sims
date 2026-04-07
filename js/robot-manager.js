// ============================================================
// RobotManager — Robot fleet data, status, and management
// ============================================================

// XP required to reach each level from the previous
// Level 2 = 10 XP, Level 3 = 20 XP, Level 4 = 40 XP ...
export function levelXpRequired(level) {
    if (level <= 1) return 0;
    return 10 * Math.pow(2, level - 2); // 10, 20, 40, 80, ...
}

// Total cumulative XP needed to reach a given level from scratch
export function totalXpForLevel(level) {
    let total = 0;
    for (let l = 2; l <= level; l++) total += levelXpRequired(l);
    return total;
}

// Derive the level from total accumulated XP
export function levelFromXp(xp) {
    let level = 1;
    while (xp >= totalXpForLevel(level + 1)) level++;
    return level;
}

export const CYBERSECURITY_STATES = [
    { id: 'offline',               label: 'Offline',               color: '#6B7280', icon: '⛔' },
    { id: 'online',                label: 'Online',                color: '#3B82F6', icon: '🌐' },
    { id: 'remote-enabled',        label: 'Remote Enabled',        color: '#F59E0B', icon: '📡' },
    { id: 'autodiscovery-protected', label: 'Autodiscovery Protected', color: '#22C55E', icon: '🛡️' },
];

// Physical specs by robot type (defaults — users can edit)
const TYPE_SPECS = {
    UGV:       { weight: '35 kg',  speed: '1.5 m/s', battery: '4h', staircase: false },
    AMR:       { weight: '20 kg',  speed: '2.0 m/s', battery: '8h', staircase: false },
    Quadruped: { weight: '15 kg',  speed: '1.8 m/s', battery: '3h', staircase: true  },
    Humanoid:  { weight: '70 kg',  speed: '1.2 m/s', battery: '2h', staircase: true  },
    Cobot:     { weight: '18 kg',  speed: '0.5 m/s', battery: '6h', staircase: false },
    Sensor:    { weight: '3 kg',   speed: '0.0 m/s', battery: '12h', staircase: false },
};

export class RobotManager {
    constructor() {
        // Map of robotInstanceId -> robotData
        this.robots = new Map();
    }

    // Create a new robot instance from an asset placed on the grid
    createRobotInstance(asset, gridObj) {
        const instanceId = gridObj.id;
        const typeSpec = TYPE_SPECS[asset.type] || TYPE_SPECS['UGV'];

        const robotData = {
            instanceId,
            assetId: asset.id,
            gridObjectId: gridObj.id,

            // Identity
            name: asset.name,
            model: asset.name,
            manufacturer: asset.manufacturer || 'Unknown',
            serialNumber: this._generateSerial(),
            type: asset.type || 'UGV',
            subtype: asset.subtype || '',
            imageSrc: asset.imageSrc,

            // Status
            status: this._randomStatus(),
            location: this._randomLocation(),
            lastSeen: new Date().toISOString(),

            // Cybersecurity
            cybersecurity: 'offline',

            // Level & XP (RPG system)
            xp: 0,
            level: 1,
            checkIns: 0,

            // Character Sheet (physical specs — editable)
            charSheet: {
                weight:    typeSpec.weight,
                speed:     typeSpec.speed,
                battery:   typeSpec.battery,
                staircase: typeSpec.staircase,
            },

            // Hardware
            hardwareVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}`,
            equipment: this._generateEquipment(asset),

            // Software
            softwareVersion: `v${Math.floor(Math.random() * 5) + 2}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 20)}`,
            rosVersion: 'ROS 2 Humble',
            firmwareVersion: `fw_${Math.floor(Math.random() * 100) + 200}`,
            os: 'Ubuntu 22.04',

            // Maintenance
            maintenanceStatus: this._randomMaintenanceStatus(),
            maintenanceLog: this._generateMaintenanceLog(),
            nextMaintenanceDue: this._futureDate(30, 180),

            // Warranty
            warrantyStart: this._pastDate(180, 730),
            warrantyEnd: this._futureDate(365, 1095),
            warrantyStatus: 'Active',

            // Bookings
            bookings: this._generateBookings(),

            // Notes
            notes: '',
        };

        // Derive warranty status
        const now = new Date();
        const wEnd = new Date(robotData.warrantyEnd);
        if (wEnd < now) {
            robotData.warrantyStatus = 'Expired';
        } else {
            const daysLeft = Math.ceil((wEnd - now) / (1000 * 60 * 60 * 24));
            robotData.warrantyStatus = daysLeft < 90 ? 'Expiring Soon' : 'Active';
        }

        this.robots.set(instanceId, robotData);
        return robotData;
    }

    getRobot(instanceId) {
        return this.robots.get(instanceId);
    }

    updateRobot(instanceId, updates) {
        const robot = this.robots.get(instanceId);
        if (robot) {
            Object.assign(robot, updates);
        }
        return robot;
    }

    removeRobot(instanceId) {
        this.robots.delete(instanceId);
    }

    getAllRobots() {
        return Array.from(this.robots.values());
    }

    // ---------- XP / Level system ----------

    // Add XP to a robot; returns { leveled: bool, newLevel: number, xp: number }
    addXP(instanceId, amount = 1) {
        const robot = this.robots.get(instanceId);
        if (!robot) return null;

        const oldLevel = robot.level;
        robot.xp = (robot.xp || 0) + amount;
        robot.level = levelFromXp(robot.xp);

        return {
            leveled: robot.level > oldLevel,
            newLevel: robot.level,
            xpGained: amount,
            xp: robot.xp,
        };
    }

    // Check-in: +1 XP, update lastSeen
    checkIn(instanceId) {
        const robot = this.robots.get(instanceId);
        if (!robot) return null;
        robot.lastSeen = new Date().toISOString();
        robot.checkIns = (robot.checkIns || 0) + 1;
        return this.addXP(instanceId, 1);
    }

    // XP progress within current level (0–1)
    xpProgress(robot) {
        const currentLevelTotal = totalXpForLevel(robot.level);
        const nextLevelTotal    = totalXpForLevel(robot.level + 1);
        const xpIntoLevel       = robot.xp - currentLevelTotal;
        const xpNeeded          = nextLevelTotal - currentLevelTotal;
        return { xpIntoLevel, xpNeeded, progress: xpIntoLevel / xpNeeded };
    }

    // ---------- Data Generation Helpers ----------

    _generateSerial() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let serial = 'AD-';
        for (let i = 0; i < 8; i++) {
            serial += chars[Math.floor(Math.random() * chars.length)];
        }
        return serial;
    }

    _randomStatus() {
        const statuses = ['online', 'online', 'online', 'maintenance', 'offline', 'field'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    _randomLocation() {
        const locations = ['In Lab', 'In Lab', 'In Lab', 'On Field Trial', 'In Maintenance', 'In Storage', 'Deployed'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    _randomMaintenanceStatus() {
        const statuses = ['OK', 'OK', 'OK', 'Due Soon', 'Overdue'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    _generateEquipment(asset) {
        const allEquipment = [
            { name: 'LiDAR', icon: '📡', desc: 'Livox MID-360 3D LiDAR', installed: false },
            { name: 'RGB Camera', icon: '📷', desc: 'OAK-D Stereo Camera', installed: false },
            { name: 'IMU', icon: '🧭', desc: '9-axis IMU Sensor', installed: false },
            { name: 'GPS/RTK', icon: '🛰️', desc: 'RTK GNSS Module', installed: false },
            { name: 'Robotic Arm', icon: '🦾', desc: '6-DOF Manipulator', installed: false },
            { name: 'Gripper', icon: '🤏', desc: '2-Finger Adaptive Gripper', installed: false },
            { name: 'Depth Camera', icon: '🔍', desc: 'Intel RealSense D435i', installed: false },
            { name: 'Battery Pack', icon: '🔋', desc: 'Li-ion 48V 30Ah', installed: false },
            { name: 'Edge Computer', icon: '💻', desc: 'NVIDIA Jetson Orin', installed: false },
            { name: 'Speaker', icon: '🔊', desc: 'Warning Audio System', installed: false },
            { name: 'Emergency Stop', icon: '🛑', desc: 'Wireless E-Stop', installed: false },
            { name: 'Thermal Camera', icon: '🌡️', desc: 'FLIR Lepton 3.5', installed: false },
        ];

        // Assign 2-5 random equipment
        const count = 2 + Math.floor(Math.random() * 4);
        const shuffled = [...allEquipment].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(e => ({ ...e, installed: true }));
    }

    _generateMaintenanceLog() {
        const types = ['Routine Check', 'Firmware Update', 'Wheel Replacement', 'Sensor Calibration', 'Battery Service', 'Motor Inspection', 'Software Update', 'Full Diagnostic'];
        const technicians = ['James K.', 'Sarah M.', 'David L.', 'Emma W.', 'Alex T.'];
        const log = [];
        const count = 2 + Math.floor(Math.random() * 5);

        for (let i = 0; i < count; i++) {
            log.push({
                date: this._pastDate(i * 30, i * 30 + 60),
                type: types[Math.floor(Math.random() * types.length)],
                description: 'Completed successfully',
                technician: technicians[Math.floor(Math.random() * technicians.length)],
                status: 'Completed',
            });
        }

        return log.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    _generateBookings() {
        const users = ['Prof. Smith', 'Dr. Chen', 'Lab Group A', 'PhD Student B', 'Research Team C', 'Industry Partner'];
        const bookings = [];
        const count = Math.floor(Math.random() * 4);

        for (let i = 0; i < count; i++) {
            const start = this._futureDate(i * 7, i * 7 + 14);
            const end = new Date(new Date(start).getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);
            bookings.push({
                id: 'booking_' + Date.now() + '_' + i,
                user: users[Math.floor(Math.random() * users.length)],
                startDate: start,
                endDate: end.toISOString().split('T')[0],
                purpose: ['Research', 'Teaching', 'Demo', 'Field Trial', 'Maintenance'][Math.floor(Math.random() * 5)],
            });
        }

        return bookings;
    }

    _pastDate(minDays, maxDays) {
        const days = minDays + Math.floor(Math.random() * (maxDays - minDays));
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split('T')[0];
    }

    _futureDate(minDays, maxDays) {
        const days = minDays + Math.floor(Math.random() * (maxDays - minDays));
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    }

    // ---------- Serialization ----------

    serialize() {
        const entries = {};
        for (const [key, val] of this.robots) {
            entries[key] = val;
        }
        return entries;
    }

    deserialize(data) {
        this.robots.clear();
        if (data) {
            for (const [key, val] of Object.entries(data)) {
                // Back-fill fields missing from older saves
                if (val.cybersecurity === undefined) val.cybersecurity = 'offline';
                if (val.xp === undefined) val.xp = 0;
                if (val.level === undefined) val.level = 1;
                if (val.checkIns === undefined) val.checkIns = 0;
                if (!val.charSheet) {
                    const typeSpec = TYPE_SPECS[val.type] || TYPE_SPECS['UGV'];
                    val.charSheet = { ...typeSpec };
                }
                this.robots.set(key, val);
            }
        }
    }
}
