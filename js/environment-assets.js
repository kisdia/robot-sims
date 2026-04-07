// ============================================================
// EnvironmentAssets — Procedural isometric drawing of
// furniture, equipment, machines, and decorations
// ============================================================

export class EnvironmentRenderer {
    constructor() {
        this.tileW = 64;
        this.tileH = 32;
        this.thumbnailCache = new Map();
    }

    // Generate a thumbnail canvas for the asset panel
    getThumbnail(asset, size = 80) {
        const key = asset.id + '_' + size;
        if (this.thumbnailCache.has(key)) return this.thumbnailCache.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.translate(size / 2, size * 0.6);
        const scale = size / (Math.max(asset.width || 1, asset.height || 1) * 80);
        ctx.scale(scale, scale);

        this.drawAsset(ctx, asset, 0, 0);

        this.thumbnailCache.set(key, canvas);
        return canvas;
    }

    // Draw asset on the isometric engine canvas at grid position
    drawOnGrid(ctx, asset, screenX, screenY, zoom) {
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(zoom, zoom);
        this.drawAsset(ctx, asset, 0, 0);
        ctx.restore();
    }

    // Main draw dispatcher
    drawAsset(ctx, asset, x, y) {
        const shape = asset.shape;
        const color = asset.color || '#6B7280';

        switch (shape) {
            // Structure
            case 'wall-straight': this._drawWallStraight(ctx, x, y, color); break;
            case 'wall-corner':   this._drawWallCorner(ctx, x, y, color); break;
            case 'wall-glass':    this._drawWallGlass(ctx, x, y, color); break;
            case 'wall-end':      this._drawWallEnd(ctx, x, y, color); break;
            case 'door-single':   this._drawDoorSingle(ctx, x, y, color); break;
            case 'door-double':   this._drawDoorDouble(ctx, x, y, color); break;
            case 'door-emergency':this._drawDoorEmergency(ctx, x, y, color); break;
            case 'door-roller':   this._drawDoorRoller(ctx, x, y, color); break;
            case 'lift-doors':    this._drawLiftDoors(ctx, x, y, color); break;
            case 'lift-shaft':    this._drawLiftShaft(ctx, x, y, color); break;
            case 'stairs-straight': this._drawStairsStraight(ctx, x, y, color); break;
            case 'stairs-l-turn': this._drawStairsLTurn(ctx, x, y, color); break;
            case 'stairs-u-turn': this._drawStairsUTurn(ctx, x, y, color); break;
            case 'ramp':          this._drawRamp(ctx, x, y, color); break;

            // Furniture
            case 'desk': this._drawDesk(ctx, x, y, color); break;
            case 'chair': this._drawChair(ctx, x, y, color); break;
            case 'shelving': this._drawShelving(ctx, x, y, color); break;
            case 'cabinet': this._drawCabinet(ctx, x, y, color); break;
            case 'table-round': this._drawRoundTable(ctx, x, y, color); break;
            case 'whiteboard': this._drawWhiteboard(ctx, x, y, color); break;
            case 'sofa': this._drawSofa(ctx, x, y, color); break;

            // Equipment
            case 'workbench': this._drawWorkbench(ctx, x, y, color); break;
            case 'oscilloscope': this._drawOscilloscope(ctx, x, y, color); break;
            case '3d-printer': this._draw3DPrinter(ctx, x, y, color); break;
            case 'charging-station': this._drawChargingStation(ctx, x, y, color); break;
            case 'server-rack': this._drawServerRack(ctx, x, y, color); break;
            case 'monitor': this._drawMonitorStation(ctx, x, y, color); break;
            case 'tool-board': this._drawToolBoard(ctx, x, y, color); break;

            // Machines
            case 'conveyor': this._drawConveyor(ctx, x, y, color); break;
            case 'robotic-arm': this._drawRoboticArm(ctx, x, y, color); break;
            case 'pallet': this._drawPallet(ctx, x, y, color); break;
            case 'tank': this._drawTank(ctx, x, y, color); break;
            case 'barrier': this._drawBarrier(ctx, x, y, color); break;
            case 'forklift': this._drawForklift(ctx, x, y, color); break;

            // Decorations
            case 'plant': this._drawPlant(ctx, x, y, color); break;
            case 'screen': this._drawScreen(ctx, x, y, color); break;
            case 'hazard': this._drawHazardSign(ctx, x, y, color); break;
            case 'floor-mark': this._drawFloorMarking(ctx, x, y, color); break;
            case 'bin': this._drawBin(ctx, x, y, color); break;
            case 'extinguisher': this._drawExtinguisher(ctx, x, y, color); break;

            default:
                this._drawGenericBox(ctx, x, y, color, 30, 25);
        }
    }

    // --------- Isometric helpers ---------

    _isoPath(ctx, x, y, w, h) {
        // Top face of an isometric box
        const hw = w / 2;
        const hh = h / 2;
        ctx.beginPath();
        ctx.moveTo(x, y - hh);       // top
        ctx.lineTo(x + hw, y);       // right
        ctx.lineTo(x, y + hh);       // bottom
        ctx.lineTo(x - hw, y);       // left
        ctx.closePath();
    }

    _drawIsoBox(ctx, x, y, w, d, h, topColor, leftColor, rightColor) {
        const hw = w / 2;
        const hd = d / 2;

        // Top face
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x + hw, y - h + hd);
        ctx.lineTo(x, y - h + d);
        ctx.lineTo(x - hw, y - h + hd);
        ctx.closePath();
        ctx.fillStyle = topColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Left face
        ctx.beginPath();
        ctx.moveTo(x - hw, y - h + hd);
        ctx.lineTo(x, y - h + d);
        ctx.lineTo(x, y + d);
        ctx.lineTo(x - hw, y + hd);
        ctx.closePath();
        ctx.fillStyle = leftColor;
        ctx.fill();
        ctx.stroke();

        // Right face
        ctx.beginPath();
        ctx.moveTo(x + hw, y - h + hd);
        ctx.lineTo(x, y - h + d);
        ctx.lineTo(x, y + d);
        ctx.lineTo(x + hw, y + hd);
        ctx.closePath();
        ctx.fillStyle = rightColor;
        ctx.fill();
        ctx.stroke();
    }

    _lighten(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R},${G},${B})`;
    }

    _darken(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R},${G},${B})`;
    }

    _drawGenericBox(ctx, x, y, color, w, h) {
        this._drawIsoBox(ctx, x, y, w, w * 0.5, h,
            this._lighten(color, 15),
            this._darken(color, 10),
            this._darken(color, 20)
        );
    }

    // ========= STRUCTURE — Walls =========

    // Wall is a tall, thin isometric slab oriented along the X-axis (left-right)
    _drawWallStraight(ctx, x, y, color) {
        const wc = this._lighten(color, 8);
        const lc = this._darken(color, 12);
        const rc = this._darken(color, 22);
        // Thick horizontal wall slab
        this._drawIsoBox(ctx, x, y, 62, 6, 36, wc, lc, rc);
        // Mortar lines
        ctx.strokeStyle = this._darken(color, 30);
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.4;
        for (let i = 1; i < 4; i++) {
            const ly = y - i * 9;
            ctx.beginPath();
            ctx.moveTo(x - 31, ly + 3);
            ctx.lineTo(x + 31, ly + 3);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    _drawWallCorner(ctx, x, y, color) {
        const wc = this._lighten(color, 8);
        const lc = this._darken(color, 12);
        const rc = this._darken(color, 22);
        // Left wing
        this._drawIsoBox(ctx, x - 15, y, 34, 6, 36, wc, lc, rc);
        // Right wing (perpendicular)
        this._drawIsoBox(ctx, x + 12, y + 6, 6, 30, 36, wc, lc, rc);
    }

    _drawWallGlass(ctx, x, y, color) {
        const frameC = '#94A3B8';
        // Frame top and bottom
        this._drawIsoBox(ctx, x, y,      62, 6, 3, frameC, this._darken(frameC, 10), this._darken(frameC, 20));
        this._drawIsoBox(ctx, x, y - 33, 62, 6, 3, frameC, this._darken(frameC, 10), this._darken(frameC, 20));
        // Vertical frame posts
        this._drawIsoBox(ctx, x - 28, y - 16, 6, 6, 33, frameC, this._darken(frameC, 10), this._darken(frameC, 20));
        this._drawIsoBox(ctx, x + 28, y - 16, 6, 6, 33, frameC, this._darken(frameC, 10), this._darken(frameC, 20));
        // Glass panes (translucent)
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = color;
        // Left pane top face
        ctx.beginPath();
        ctx.moveTo(x - 28, y - 33);
        ctx.lineTo(x,      y - 33 + 3);
        ctx.lineTo(x,      y - 3);
        ctx.lineTo(x - 28, y);
        ctx.closePath();
        ctx.fill();
        // Right pane top face
        ctx.beginPath();
        ctx.moveTo(x, y - 33);
        ctx.lineTo(x + 28, y - 33 + 3);
        ctx.lineTo(x + 28, y - 3);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Reflection gleam
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#E0F2FE';
        ctx.fillRect(x - 22, y - 30, 4, 22);
        ctx.fillRect(x + 6, y - 30, 4, 22);
        ctx.restore();
    }

    _drawWallEnd(ctx, x, y, color) {
        // Short end-cap pillar
        this._drawIsoBox(ctx, x, y, 12, 12, 36,
            this._lighten(color, 12),
            this._darken(color, 8),
            this._darken(color, 20)
        );
    }

    // ========= STRUCTURE — Doors =========

    _drawDoorSingle(ctx, x, y, color) {
        const frameC = '#6B7280';
        // Door frame wall stubs
        this._drawIsoBox(ctx, x - 24, y, 14, 6, 36, this._lighten('#8B9DB0', 8), this._darken('#8B9DB0', 12), this._darken('#8B9DB0', 22));
        this._drawIsoBox(ctx, x + 24, y, 14, 6, 36, this._lighten('#8B9DB0', 8), this._darken('#8B9DB0', 12), this._darken('#8B9DB0', 22));
        // Lintel (top bar)
        this._drawIsoBox(ctx, x, y - 28, 62, 6, 8, this._lighten('#8B9DB0', 8), this._darken('#8B9DB0', 12), this._darken('#8B9DB0', 22));
        // Door panel (wood, slightly open)
        this._drawIsoBox(ctx, x - 4, y - 14, 28, 3, 28,
            this._lighten(color, 12),
            this._darken(color, 8),
            this._darken(color, 18)
        );
        // Panel detail lines
        ctx.strokeStyle = this._darken(color, 25);
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(x - 16, y - 26); ctx.lineTo(x - 16, y - 14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 8, y - 26); ctx.lineTo(x + 8, y - 14); ctx.stroke();
        // Handle
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(x + 6, y - 20, 2, 0, Math.PI * 2);
        ctx.fill();
        // Frame outline
        ctx.strokeStyle = frameC;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 31, y - 40, 62, 40);
        // Exit arrow on floor
        ctx.fillStyle = 'rgba(34,197,94,0.3)';
        this._isoPath(ctx, x, y + 8, 24, 10);
        ctx.fill();
    }

    _drawDoorDouble(ctx, x, y, color) {
        const wallC = '#8B9DB0';
        // Frame stubs
        this._drawIsoBox(ctx, x - 38, y, 14, 6, 36, this._lighten(wallC, 8), this._darken(wallC, 12), this._darken(wallC, 22));
        this._drawIsoBox(ctx, x + 38, y, 14, 6, 36, this._lighten(wallC, 8), this._darken(wallC, 12), this._darken(wallC, 22));
        // Lintel
        this._drawIsoBox(ctx, x, y - 28, 90, 6, 8, this._lighten(wallC, 8), this._darken(wallC, 12), this._darken(wallC, 22));
        // Left door leaf
        this._drawIsoBox(ctx, x - 18, y - 14, 30, 3, 28, this._lighten(color, 12), this._darken(color, 8), this._darken(color, 18));
        // Right door leaf
        this._drawIsoBox(ctx, x + 18, y - 14, 30, 3, 28, this._lighten(color, 12), this._darken(color, 8), this._darken(color, 18));
        // Centre gap line
        ctx.strokeStyle = this._darken(color, 30);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y - 42); ctx.lineTo(x, y); ctx.stroke();
        // Handles
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath(); ctx.arc(x - 6, y - 20, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 6, y - 20, 2, 0, Math.PI * 2); ctx.fill();
    }

    _drawDoorEmergency(ctx, x, y, color) {
        const wallC = '#8B9DB0';
        // Wall stubs
        this._drawIsoBox(ctx, x - 24, y, 14, 6, 36, this._lighten(wallC, 8), this._darken(wallC, 12), this._darken(wallC, 22));
        this._drawIsoBox(ctx, x + 24, y, 14, 6, 36, this._lighten(wallC, 8), this._darken(wallC, 12), this._darken(wallC, 22));
        // Door (bright red)
        this._drawIsoBox(ctx, x - 2, y - 14, 30, 3, 28, this._lighten(color, 8), this._darken(color, 5), this._darken(color, 15));
        // Green exit sign above
        this._drawIsoBox(ctx, x, y - 35, 22, 3, 7, '#22C55E', '#16A34A', '#15803D');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', x, y - 30);
        // Panic bar
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(x - 12, y - 22, 24, 2);
        // Diagonal stripes on door
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 14 + i * 7, y - 42);
            ctx.lineTo(x - 14 + i * 7 + 6, y - 14);
            ctx.stroke();
        }
        ctx.restore();
        // Floor hazard
        ctx.fillStyle = 'rgba(239,68,68,0.2)';
        this._isoPath(ctx, x, y + 8, 28, 12);
        ctx.fill();
    }

    _drawDoorRoller(ctx, x, y, color) {
        const wallC = '#8B9DB0';
        // Frame stubs
        this._drawIsoBox(ctx, x - 38, y, 14, 6, 36, this._lighten(wallC, 8), this._darken(wallC, 12), this._darken(wallC, 22));
        this._drawIsoBox(ctx, x + 38, y, 14, 6, 36, this._lighten(wallC, 8), this._darken(wallC, 12), this._darken(wallC, 22));
        // Roller box at top
        this._drawIsoBox(ctx, x, y - 32, 80, 8, 8, this._lighten(color, 15), color, this._darken(color, 15));
        // Shutter slats (partially open)
        const slats = 5;
        for (let i = 0; i < slats; i++) {
            const sy = y - 28 + i * 5;
            const sc = i % 2 === 0 ? this._lighten(color, 5) : color;
            ctx.fillStyle = sc;
            ctx.fillRect(x - 30, sy, 60, 3);
            // Slat shadow
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(x - 30, sy + 2, 60, 1);
        }
        // Handle bar
        ctx.fillStyle = '#D97706';
        ctx.fillRect(x - 10, y - 8, 20, 2);
        // Guide rails
        ctx.fillStyle = this._darken(color, 20);
        ctx.fillRect(x - 31, y - 30, 2, 30);
        ctx.fillRect(x + 29, y - 30, 2, 30);
    }

    // ========= STRUCTURE — Lift / Elevator =========

    _drawLiftDoors(ctx, x, y, color) {
        const frameC = '#94A3B8';
        const panelC = color;
        // Outer frame
        this._drawIsoBox(ctx, x, y - 20, 70, 8, 48, this._darken(frameC, 5), this._darken(frameC, 15), this._darken(frameC, 25));
        // Left door panel
        this._drawIsoBox(ctx, x - 16, y - 20, 30, 4, 42, this._lighten(panelC, 15), panelC, this._darken(panelC, 10));
        // Right door panel
        this._drawIsoBox(ctx, x + 16, y - 20, 30, 4, 42, this._lighten(panelC, 15), panelC, this._darken(panelC, 10));
        // Centre gap
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, y - 62); ctx.lineTo(x, y - 2); ctx.stroke();
        // Metallic sheen on panels
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 28, y - 60, 6, 40);
        ctx.fillRect(x + 4, y - 60, 6, 40);
        ctx.restore();
        // Call button panel (right side)
        this._drawIsoBox(ctx, x + 38, y - 16, 6, 4, 22, '#1E293B', '#0F172A', '#0F172A');
        // Up/down buttons
        ctx.fillStyle = '#FDE047'; // up button lit
        ctx.beginPath(); ctx.arc(x + 36, y - 24, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#374151';
        ctx.beginPath(); ctx.arc(x + 36, y - 16, 2.5, 0, Math.PI * 2); ctx.fill();
        // Floor indicator display
        this._drawIsoBox(ctx, x + 22, y - 56, 10, 3, 8, '#0F172A', '#0F172A', '#0F172A');
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('2', x + 21, y - 52);
        // Door gap floor marking
        ctx.fillStyle = 'rgba(251,191,36,0.25)';
        this._isoPath(ctx, x, y + 4, 36, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(251,191,36,0.6)';
        ctx.lineWidth = 1;
        this._isoPath(ctx, x, y + 4, 36, 14);
        ctx.stroke();
    }

    _drawLiftShaft(ctx, x, y, color) {
        const shaftC = this._darken(color, 5);
        // Shaft walls (back two sides visible)
        this._drawIsoBox(ctx, x, y, 60, 50, 80,
            this._darken(color, 20),
            this._darken(color, 30),
            this._darken(color, 35)
        );
        // Cab (the elevator car inside the shaft)
        this._drawIsoBox(ctx, x, y - 22, 44, 36, 40,
            this._lighten(shaftC, 12),
            this._lighten(shaftC, 5),
            shaftC
        );
        // Cab interior darker top
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x - 20, y - 60, 40, 15);
        ctx.restore();
        // Guide rails
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(x - 22, y - 62, 2, 62);
        ctx.fillRect(x + 20, y - 62, 2, 62);
        // Cables
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * 8, y - 80);
            ctx.lineTo(x + i * 8, y - 62);
            ctx.stroke();
        }
        // "B2" floor label on cab
        ctx.fillStyle = '#E2E8F0';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LIFT', x, y - 48);
    }

    // ========= STRUCTURE — Staircases =========

    _drawStairsStraight(ctx, x, y, color) {
        const steps = 8;
        const stepW = 48;
        const stepD = 5;
        const stepH = 5;
        const tread = this._lighten(color, 8);
        const riser = this._darken(color, 15);
        const side  = this._darken(color, 22);

        // Side cheeks
        this._drawIsoBox(ctx, x - 22, y, 4, steps * stepD, steps * stepH, side, side, this._darken(color, 35));
        this._drawIsoBox(ctx, x + 22, y, 4, steps * stepD, steps * stepH, side, side, this._darken(color, 35));

        // Steps (back to front so painter's algo works)
        for (let i = steps - 1; i >= 0; i--) {
            const sy = y - i * stepH;
            const depth = (steps - 1 - i) * stepD;
            // Tread
            this._drawIsoBox(ctx, x, sy, stepW, stepD, 2, tread, this._darken(color, 10), this._darken(color, 12));
            // Riser (vertical face)
            ctx.fillStyle = riser;
            ctx.beginPath();
            ctx.moveTo(x - stepW / 2, sy + stepD / 2);
            ctx.lineTo(x + stepW / 2, sy + stepD / 2);
            ctx.lineTo(x + stepW / 2, sy + stepD / 2 + stepH);
            ctx.lineTo(x - stepW / 2, sy + stepD / 2 + stepH);
            ctx.closePath();
            ctx.fill();
        }

        // Handrail
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 22, y - steps * stepH - 10);
        ctx.lineTo(x - 22, y - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 22, y - steps * stepH - 10);
        ctx.lineTo(x + 22, y - 10);
        ctx.stroke();
    }

    _drawStairsLTurn(ctx, x, y, color) {
        const tread = this._lighten(color, 8);
        const riser = this._darken(color, 15);

        // First flight — goes right
        for (let i = 0; i < 5; i++) {
            this._drawIsoBox(ctx, x - 14 + i * 10, y - i * 5, 10, 5, 2, tread, this._darken(color, 10), this._darken(color, 12));
            ctx.fillStyle = riser;
            ctx.fillRect(x - 18 + i * 10, y - i * 5 + 1, 10, 5);
        }
        // Landing platform
        this._drawIsoBox(ctx, x + 26, y - 26, 16, 16, 3, this._lighten(color, 5), this._darken(color, 8), this._darken(color, 18));
        // Second flight — goes forward
        for (let i = 0; i < 4; i++) {
            this._drawIsoBox(ctx, x + 26, y - 28 - i * 5, 14, 5, 2, tread, this._darken(color, 10), this._darken(color, 12));
        }
        // Handrails
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 2);
        ctx.lineTo(x + 22, y - 22);
        ctx.stroke();
    }

    _drawStairsUTurn(ctx, x, y, color) {
        const tread = this._lighten(color, 8);
        const riser = this._darken(color, 14);
        const land  = this._lighten(color, 4);

        // Left flight going up
        for (let i = 0; i < 5; i++) {
            this._drawIsoBox(ctx, x - 20, y - i * 5, 16, 5, 2, tread, this._darken(color, 10), this._darken(color, 12));
            ctx.fillStyle = riser;
            ctx.fillRect(x - 28, y - i * 5 + 1, 16, 5);
        }
        // Top landing
        this._drawIsoBox(ctx, x, y - 28, 18, 16, 3, land, this._darken(color, 8), this._darken(color, 18));
        // Right flight going down
        for (let i = 0; i < 5; i++) {
            this._drawIsoBox(ctx, x + 20, y - 24 + i * 5, 16, 5, 2, tread, this._darken(color, 10), this._darken(color, 12));
        }
        // Handrails both sides
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 28, y + 2); ctx.lineTo(x - 28, y - 24); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 28, y + 2); ctx.lineTo(x + 28, y - 24); ctx.stroke();
    }

    _drawRamp(ctx, x, y, color) {
        const steps = 10;
        // Ramp surface — progressive isometric slabs getting taller
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const bh = 2 + t * 22;
            const shade = Math.round(t * 15);
            const tc = this._lighten(color, 10 - shade);
            const lc = this._darken(color, 8 + shade);
            const rc = this._darken(color, 18 + shade);
            this._drawIsoBox(ctx, x, y - i * 3.5, 40, 6, bh, tc, lc, rc);
        }
        // Side guardrails
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 20, y + 2); ctx.lineTo(x - 20, y - steps * 3.5 - 10); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 2); ctx.lineTo(x + 20, y - steps * 3.5 - 10); ctx.stroke();
        // Non-slip stripes
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        for (let i = 1; i < steps; i += 2) {
            ctx.beginPath();
            ctx.moveTo(x - 20, y - i * 3.5);
            ctx.lineTo(x + 20, y - i * 3.5);
            ctx.stroke();
        }
    }


    _drawDesk(ctx, x, y, color) {
        // Desktop surface (wide, thin)
        this._drawIsoBox(ctx, x, y, 55, 28, 3,
            this._lighten(color, 10),
            this._darken(color, 5),
            this._darken(color, 15)
        );
        // Legs
        const legColor = this._darken(color, 25);
        const legW = 4, legH = 18;
        // Front-left
        this._drawIsoBox(ctx, x - 22, y + 8, legW, legW * 0.5, legH, legColor, legColor, this._darken(color, 35));
        // Front-right
        this._drawIsoBox(ctx, x + 22, y + 8, legW, legW * 0.5, legH, legColor, legColor, this._darken(color, 35));
        // Back-left
        this._drawIsoBox(ctx, x - 22, y - 6, legW, legW * 0.5, legH, legColor, legColor, this._darken(color, 35));
        // Back-right
        this._drawIsoBox(ctx, x + 22, y - 6, legW, legW * 0.5, legH, legColor, legColor, this._darken(color, 35));
        // Monitor on desk
        this._drawIsoBox(ctx, x + 5, y - 5 - 3, 12, 2, 10, '#1a1a2e', '#111', '#0a0a15');
        // Screen glow
        ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.fillRect(x + 1, y - 18, 8, 6);
    }

    _drawChair(ctx, x, y, color) {
        // Seat
        this._drawIsoBox(ctx, x, y, 18, 14, 2,
            this._lighten(color, 10), this._darken(color, 5), this._darken(color, 15));
        // Backrest
        this._drawIsoBox(ctx, x, y - 6, 18, 3, 15,
            this._lighten(color, 5), this._darken(color, 10), this._darken(color, 20));
        // Base pillar
        this._drawIsoBox(ctx, x, y + 4, 6, 3, 10, '#333', '#222', '#1a1a1a');
        // Wheels (small circles)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(x - 5, y + 12, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 12, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawShelving(ctx, x, y, color) {
        const shelfColor = this._lighten(color, 10);
        // Frame
        this._drawIsoBox(ctx, x, y, 50, 15, 40, this._lighten(color, 5), this._darken(color, 10), this._darken(color, 20));
        // Shelves (3 levels)
        for (let i = 0; i < 3; i++) {
            const sy = y - 8 - i * 12;
            this._drawIsoBox(ctx, x, sy + 10, 48, 14, 1, shelfColor, this._darken(color, 5), this._darken(color, 15));
            // Items on shelf
            if (i < 2) {
                this._drawIsoBox(ctx, x - 12, sy + 5, 8, 6, 6, '#3B82F6', '#2563EB', '#1D4ED8');
                this._drawIsoBox(ctx, x + 8, sy + 5, 10, 6, 5, '#F59E0B', '#D97706', '#B45309');
            }
        }
    }

    _drawCabinet(ctx, x, y, color) {
        this._drawIsoBox(ctx, x, y, 22, 16, 30,
            this._lighten(color, 10), this._darken(color, 5), this._darken(color, 15));
        // Handle
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 8, y - 10, 2, 4);
        ctx.fillRect(x + 8, y - 22, 2, 4);
    }

    _drawRoundTable(ctx, x, y, color) {
        // Tabletop (ellipse)
        ctx.beginPath();
        ctx.ellipse(x, y - 12, 16, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._lighten(color, 10);
        ctx.fill();
        ctx.strokeStyle = this._darken(color, 10);
        ctx.lineWidth = 1;
        ctx.stroke();
        // Pedestal
        this._drawIsoBox(ctx, x, y, 6, 3, 12, this._darken(color, 15), this._darken(color, 25), this._darken(color, 30));
        // Base
        ctx.beginPath();
        ctx.ellipse(x, y + 1, 10, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._darken(color, 20);
        ctx.fill();
    }

    _drawWhiteboard(ctx, x, y, color) {
        // Board surface
        this._drawIsoBox(ctx, x, y, 50, 3, 30, color, this._darken('#E5E7EB', 10), this._darken('#E5E7EB', 20));
        // Frame
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 24, y - 30, 48, 28);
        // Stand
        this._drawIsoBox(ctx, x - 18, y + 2, 4, 2, 8, '#555', '#444', '#333');
        this._drawIsoBox(ctx, x + 18, y + 2, 4, 2, 8, '#555', '#444', '#333');
        // Markers tray
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(x - 15, y - 2, 30, 2);
        // Marker dots
        ['#EF4444', '#3B82F6', '#22C55E'].forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.fillRect(x - 8 + i * 6, y - 4, 3, 2);
        });
    }

    _drawSofa(ctx, x, y, color) {
        // Base cushion
        this._drawIsoBox(ctx, x, y, 50, 22, 8, this._lighten(color, 8), this._darken(color, 5), this._darken(color, 15));
        // Back cushion
        this._drawIsoBox(ctx, x, y - 8, 50, 8, 12, this._lighten(color, 5), this._darken(color, 8), this._darken(color, 18));
        // Armrests
        this._drawIsoBox(ctx, x - 22, y - 2, 6, 20, 10, this._lighten(color, 3), this._darken(color, 10), this._darken(color, 20));
        this._drawIsoBox(ctx, x + 22, y - 2, 6, 20, 10, this._lighten(color, 3), this._darken(color, 10), this._darken(color, 20));
    }

    // --------- Equipment ---------

    _drawWorkbench(ctx, x, y, color) {
        // Surface
        this._drawIsoBox(ctx, x, y, 55, 25, 3, this._lighten(color, 10), this._darken(color, 5), this._darken(color, 15));
        // Legs (4 sturdy legs)
        const legC = this._darken(color, 30);
        this._drawIsoBox(ctx, x - 22, y + 8, 5, 3, 20, legC, legC, this._darken(color, 40));
        this._drawIsoBox(ctx, x + 22, y + 8, 5, 3, 20, legC, legC, this._darken(color, 40));
        this._drawIsoBox(ctx, x - 22, y - 7, 5, 3, 20, legC, legC, this._darken(color, 40));
        this._drawIsoBox(ctx, x + 22, y - 7, 5, 3, 20, legC, legC, this._darken(color, 40));
        // Vice on bench
        this._drawIsoBox(ctx, x - 15, y - 5 - 3, 8, 6, 8, '#555', '#444', '#333');
        // Tool items
        this._drawIsoBox(ctx, x + 10, y - 2 - 3, 6, 4, 3, '#EF4444', '#DC2626', '#B91C1C');
    }

    _drawOscilloscope(ctx, x, y, color) {
        this._drawIsoBox(ctx, x, y, 22, 18, 18, this._lighten(color, 10), this._darken(color, 5), this._darken(color, 15));
        // Screen
        ctx.fillStyle = '#0a2a1a';
        ctx.fillRect(x - 7, y - 18, 14, 8);
        // Waveform
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const px = x - 6 + i;
            const py = y - 14 + Math.sin(i * 0.8) * 2;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // Knobs
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(x - 4, y - 7, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 4, y - 7, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    _draw3DPrinter(ctx, x, y, color) {
        // Frame
        this._drawIsoBox(ctx, x, y, 24, 20, 28, this._lighten(color, 15), color, this._darken(color, 10));
        // Build plate
        this._drawIsoBox(ctx, x, y - 4, 18, 14, 1, '#888', '#777', '#666');
        // Printed object on plate
        this._drawIsoBox(ctx, x - 2, y - 7, 6, 5, 5, '#00d4ff', '#0099cc', '#006699');
        // Extruder head
        this._drawIsoBox(ctx, x + 4, y - 18, 5, 4, 4, '#F59E0B', '#D97706', '#B45309');
        // Status LED
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + 10, y - 25, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawChargingStation(ctx, x, y, color) {
        // Base unit
        this._drawIsoBox(ctx, x, y, 22, 18, 6, this._lighten(color, 10), color, this._darken(color, 15));
        // Upright
        this._drawIsoBox(ctx, x, y - 8, 8, 4, 18, this._lighten(color, 5), this._darken(color, 5), this._darken(color, 15));
        // Status light
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x, y - 24, 2, 0, Math.PI * 2);
        ctx.fill();
        // Cable
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 3, y - 6);
        ctx.quadraticCurveTo(x + 12, y, x + 10, y + 5);
        ctx.stroke();
        // Lightning bolt icon
        ctx.fillStyle = '#FDE047';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', x, y - 16);
    }

    _drawServerRack(ctx, x, y, color) {
        this._drawIsoBox(ctx, x, y, 20, 14, 38, this._lighten(color, 10), this._darken(color, 5), this._darken(color, 10));
        // Server slots
        for (let i = 0; i < 5; i++) {
            const sy = y - 6 - i * 6;
            ctx.fillStyle = i % 2 === 0 ? '#1a1a2e' : '#161629';
            ctx.fillRect(x - 8, sy, 16, 4);
            // LEDs
            ctx.fillStyle = i === 2 ? '#EF4444' : '#22c55e';
            ctx.beginPath();
            ctx.arc(x + 6, sy + 2, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawMonitorStation(ctx, x, y, color) {
        // Stand
        this._drawIsoBox(ctx, x, y, 8, 4, 10, '#555', '#444', '#333');
        // Screen
        this._drawIsoBox(ctx, x, y - 10, 26, 3, 18, '#1a1a2e', '#111', '#0a0a15');
        // Screen content glow
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fillRect(x - 10, y - 26, 20, 12);
        // Blue UI elements
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fillRect(x - 8, y - 24, 16, 1);
        ctx.fillRect(x - 8, y - 21, 10, 1);
        ctx.fillRect(x - 8, y - 18, 12, 1);
    }

    _drawToolBoard(ctx, x, y, color) {
        // Board
        this._drawIsoBox(ctx, x, y, 24, 3, 28, color, this._darken(color, 10), this._darken(color, 20));
        // Tool silhouettes
        ctx.fillStyle = '#555';
        // Wrench
        ctx.fillRect(x - 6, y - 22, 2, 12);
        // Screwdriver
        ctx.fillRect(x + 2, y - 20, 1.5, 14);
        // Pliers
        ctx.fillRect(x + 7, y - 18, 2, 10);
        // Hooks
        ctx.fillStyle = '#888';
        [x - 6, x + 2, x + 7].forEach(hx => {
            ctx.beginPath();
            ctx.arc(hx + 1, y - 24, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // --------- Machines ---------

    _drawConveyor(ctx, x, y, color) {
        // Side rails
        this._drawIsoBox(ctx, x, y, 70, 18, 8, this._lighten(color, 10), this._darken(color, 5), this._darken(color, 15));
        // Belt surface (dark rubber)
        this._drawIsoBox(ctx, x, y - 8, 66, 12, 1, '#2a2a2a', '#1a1a1a', '#111');
        // Rollers
        for (let i = -2; i <= 2; i++) {
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.ellipse(x + i * 14, y - 4, 1.5, 4, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
        }
        // Boxes on belt
        this._drawIsoBox(ctx, x - 15, y - 12, 10, 8, 8, '#D97706', '#B45309', '#92400E');
        this._drawIsoBox(ctx, x + 12, y - 12, 8, 7, 6, '#EF4444', '#DC2626', '#B91C1C');
    }

    _drawRoboticArm(ctx, x, y, color) {
        // Base
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._darken(color, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Arm segments
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y - 3);
        ctx.lineTo(x - 5, y - 20);
        ctx.lineTo(x + 8, y - 30);
        ctx.lineTo(x + 12, y - 25);
        ctx.stroke();

        // Joints
        ctx.fillStyle = this._darken(color, 15);
        [[x, y - 3], [x - 5, y - 20], [x + 8, y - 30]].forEach(([jx, jy]) => {
            ctx.beginPath();
            ctx.arc(jx, jy, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // End effector
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 10, y - 27, 5, 4);
    }

    _drawPallet(ctx, x, y, color) {
        // Pallet base
        this._drawIsoBox(ctx, x, y, 26, 22, 3, color, this._darken(color, 10), this._darken(color, 20));
        // Slats
        ctx.strokeStyle = this._darken(color, 15);
        ctx.lineWidth = 0.5;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 12, y - 1 + i * 3);
            ctx.lineTo(x + 12, y - 1 + i * 3);
            ctx.stroke();
        }
        // Box on pallet
        this._drawIsoBox(ctx, x, y - 3, 18, 16, 12, '#6B7280', '#4B5563', '#374151');
    }

    _drawTank(ctx, x, y, color) {
        // Cylinder body (approximated)
        ctx.beginPath();
        ctx.ellipse(x, y - 28, 18, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._lighten(color, 10);
        ctx.fill();

        // Body sides
        ctx.fillStyle = this._darken(color, 5);
        ctx.fillRect(x - 18, y - 28, 36, 28);

        // Bottom ellipse
        ctx.beginPath();
        ctx.ellipse(x, y, 18, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._darken(color, 15);
        ctx.fill();

        // Highlight stripe
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x - 8, y - 28, 6, 28);

        // Pipe on top
        this._drawIsoBox(ctx, x + 8, y - 32, 4, 3, 6, '#888', '#777', '#666');
    }

    _drawBarrier(ctx, x, y, color) {
        // Posts
        this._drawIsoBox(ctx, x - 12, y, 3, 2, 22, '#888', '#777', '#666');
        this._drawIsoBox(ctx, x + 12, y, 3, 2, 22, '#888', '#777', '#666');
        // Barrier stripes
        const stripeH = 4;
        for (let i = 0; i < 3; i++) {
            const sy = y - 6 - i * 7;
            const isRed = i % 2 === 0;
            ctx.fillStyle = isRed ? color : '#FDE047';
            ctx.beginPath();
            ctx.moveTo(x - 12, sy);
            ctx.lineTo(x + 12, sy);
            ctx.lineTo(x + 12, sy - stripeH);
            ctx.lineTo(x - 12, sy - stripeH);
            ctx.closePath();
            ctx.fill();
        }
    }

    _drawForklift(ctx, x, y, color) {
        // Body
        this._drawIsoBox(ctx, x, y, 16, 22, 12, color, this._darken(color, 10), this._darken(color, 20));
        // Mast
        this._drawIsoBox(ctx, x - 8, y + 4, 3, 3, 30, '#555', '#444', '#333');
        // Forks
        ctx.fillStyle = '#888';
        ctx.fillRect(x - 14, y + 6, 8, 2);
        ctx.fillRect(x - 14, y + 10, 8, 2);
        // Wheels
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(x - 4, y + 12, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 4, y + 12, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Warning light
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(x + 2, y - 12, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // --------- Decorations ---------

    _drawPlant(ctx, x, y, color) {
        // Pot
        this._drawIsoBox(ctx, x, y, 12, 10, 10, '#92400E', '#78350F', '#451A03');
        // Dirt
        ctx.beginPath();
        ctx.ellipse(x, y - 10, 5, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#3E2723';
        ctx.fill();
        // Leaves
        const leafColor = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const lx = x + Math.cos(angle) * 8;
            const ly = (y - 16) + Math.sin(angle) * 4;
            ctx.beginPath();
            ctx.ellipse(lx, ly, 5, 3, angle, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? leafColor : this._darken(leafColor, 15);
            ctx.fill();
        }
        // Center
        ctx.beginPath();
        ctx.arc(x, y - 16, 3, 0, Math.PI * 2);
        ctx.fillStyle = this._lighten(leafColor, 10);
        ctx.fill();
    }

    _drawScreen(ctx, x, y, color) {
        // Stand
        this._drawIsoBox(ctx, x, y, 6, 3, 8, '#333', '#222', '#1a1a1a');
        // Screen frame
        this._drawIsoBox(ctx, x, y - 8, 28, 3, 20, '#1a1a2e', '#111', '#0a0a15');
        // Screen glow
        ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`;
        ctx.fillRect(x - 11, y - 26, 22, 14);
        // Data visualization
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const bh = 3 + Math.random() * 8;
            ctx.fillRect(x - 8 + i * 4, y - 14 - bh, 3, bh);
        }
    }

    _drawHazardSign(ctx, x, y, color) {
        // Post
        this._drawIsoBox(ctx, x, y, 3, 2, 20, '#888', '#777', '#666');
        // Sign triangle
        ctx.beginPath();
        ctx.moveTo(x, y - 28);
        ctx.lineTo(x - 8, y - 16);
        ctx.lineTo(x + 8, y - 16);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Exclamation mark
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', x, y - 19);
    }

    _drawFloorMarking(ctx, x, y, color) {
        // Hazard stripes on the floor (isometric diamond)
        this._isoPath(ctx, x, y, 28, 14);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
        ctx.fill();

        // Diagonal stripes
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = -6; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 14 + i * 5, y - 10);
            ctx.lineTo(x - 14 + i * 5 + 10, y + 10);
            ctx.stroke();
        }
        ctx.restore();

        // Border
        this._isoPath(ctx, x, y, 28, 14);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    _drawBin(ctx, x, y, color) {
        // Body (slightly tapered)
        this._drawIsoBox(ctx, x, y, 10, 8, 14, this._lighten(color, 10), color, this._darken(color, 15));
        // Lid
        this._drawIsoBox(ctx, x, y - 14, 12, 10, 2, this._lighten(color, 20), this._lighten(color, 5), color);
        // Recycle symbol
        ctx.fillStyle = '#22c55e';
        ctx.font = '6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♻', x + 3, y - 5);
    }

    _drawExtinguisher(ctx, x, y, color) {
        // Body cylinder
        ctx.beginPath();
        ctx.ellipse(x, y - 18, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._lighten(color, 10);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillRect(x - 5, y - 18, 10, 18);
        ctx.beginPath();
        ctx.ellipse(x, y, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._darken(color, 15);
        ctx.fill();
        // Nozzle
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 1.5, y - 22, 3, 5);
        // Handle
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 20);
        ctx.quadraticCurveTo(x + 8, y - 22, x + 6, y - 16);
        ctx.stroke();
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '4px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FIRE', x + 2, y - 8);
    }
}
