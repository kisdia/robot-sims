// ============================================================
// UIManager — Orchestrates all UI panels and toolbar
// ============================================================

import { ASSET_CATEGORIES, getAssetsByCategory, getAssetById, ROBOT_ASSETS, ENVIRONMENT_ASSETS } from './asset-library.js';
import { EnvironmentRenderer } from './environment-assets.js';

export class UIManager {
    constructor(engine, robotManager, robotDetailPanel, app) {
        this.engine = engine;
        this.robotManager = robotManager;
        this.robotDetailPanel = robotDetailPanel;
        this.app = app;
        this.envRenderer = new EnvironmentRenderer();

        // State
        this.currentTool = 'select';
        this.selectedAsset = null;
        this.currentCategory = 'robots';
        this.isPanning = false;
        this.panStart = null;
        this.lastMousePos = null;
        this.spaceHeld = false;
        this.contextMenu = null;

        // Room drawing
        this.currentRoomType = 'Lab';
        this.isDrawingRoom = false;

        // Toast container
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        document.getElementById('app').appendChild(this.toastContainer);

        this._bindToolbar();
        this._bindAssetPanel();
        this._bindCanvasInteraction();
        this._bindKeyboard();
        this._bindZoomControls();
        this._bindTopBarActions();
        this._bindRoomTypeSelector();
        this._bindPropertiesPanel();
        this._createDpad();

        // Initial render
        this._renderAssetGrid();
    }

    // ---------- Toolbar ----------

    _bindToolbar() {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTool(btn.dataset.tool);
            });
        });

        document.getElementById('btn-undo').addEventListener('click', () => this.app.undo());
        document.getElementById('btn-redo').addEventListener('click', () => this.app.redo());
    }

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });

        // Update cursor
        const container = document.getElementById('canvas-container');
        container.className = 'canvas-container';
        switch (tool) {
            case 'select': container.classList.add('cursor-pointer'); break;
            case 'place': container.classList.add('cursor-crosshair'); break;
            case 'room': container.classList.add('cursor-crosshair'); break;
            case 'delete': container.classList.add('cursor-not-allowed'); break;
            case 'pan': container.classList.add('cursor-grab'); break;
        }

        // Update status
        const labels = { select: 'Select Mode', place: 'Place Mode', room: 'Room Draw Mode', delete: 'Delete Mode', pan: 'Pan Mode' };
        document.getElementById('status-mode').textContent = labels[tool] || tool;

        // Show/hide room type selector
        const roomSelector = document.getElementById('room-type-selector');
        if (tool === 'room') {
            roomSelector.classList.remove('hidden');
        } else {
            roomSelector.classList.add('hidden');
        }

        // Clear ghost if not in place mode
        if (tool !== 'place') {
            this.engine.ghostObject = null;
            this.selectedAsset = null;
            this._clearAssetSelection();
        }
    }

    // ---------- Asset Panel ----------

    _bindAssetPanel() {
        // Tab switching
        document.getElementById('asset-tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.panel-tab');
            if (!tab) return;
            this.currentCategory = tab.dataset.category;
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this._renderAssetGrid();
        });

        // Search
        document.getElementById('asset-search').addEventListener('input', (e) => {
            this._renderAssetGrid(e.target.value);
        });

        // Toggle panel
        document.getElementById('btn-toggle-assets').addEventListener('click', () => {
            document.getElementById('asset-panel').classList.toggle('collapsed');
        });
    }

    _renderAssetGrid(searchQuery = '') {
        const grid = document.getElementById('asset-grid');
        grid.innerHTML = '';

        let assets;
        if (this.currentCategory === 'robots') {
            assets = ROBOT_ASSETS;
        } else {
            assets = getAssetsByCategory(this.currentCategory);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            assets = assets.filter(a => a.name.toLowerCase().includes(q));
        }

        if (this.currentCategory === 'rooms') {
            // Room assets trigger room drawing mode
            assets.forEach(asset => {
                const card = this._createRoomCard(asset);
                grid.appendChild(card);
            });
        } else {
            assets.forEach(asset => {
                const card = this._createAssetCard(asset);
                grid.appendChild(card);
            });
        }
    }

    _createAssetCard(asset) {
        const card = document.createElement('div');
        card.className = 'asset-card';
        card.dataset.assetId = asset.id;

        if (asset.imageSrc) {
            // Robot with image
            const img = document.createElement('img');
            img.className = 'asset-card-image';
            img.src = asset.imageSrc;
            img.alt = asset.name;
            img.draggable = false;
            card.appendChild(img);
        } else {
            // Environment asset — draw thumbnail
            const thumbCanvas = this.envRenderer.getThumbnail(asset, 80);
            thumbCanvas.className = 'asset-card-canvas';
            card.appendChild(thumbCanvas);
        }

        const name = document.createElement('span');
        name.className = 'asset-card-name';
        name.textContent = asset.name;
        card.appendChild(name);

        if (asset.category === 'robots') {
            const badge = document.createElement('span');
            badge.className = 'asset-card-badge robot';
            badge.textContent = asset.type || 'Robot';
            card.appendChild(badge);
        }

        // Click to select for placement
        card.addEventListener('click', () => {
            this._selectAssetForPlacement(asset, card);
        });

        return card;
    }

    _createRoomCard(asset) {
        const card = document.createElement('div');
        card.className = 'asset-card';
        card.dataset.assetId = asset.id;

        const icon = document.createElement('div');
        icon.style.cssText = `width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: ${asset.color}22; border-radius: 8px;`;
        icon.textContent = { Lab: '🔬', Office: '💼', Workshop: '🔧', Warehouse: '📦', Corridor: '🚪', Outdoor: '🌳' }[asset.roomType] || '🏠';
        card.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'asset-card-name';
        name.textContent = asset.name;
        card.appendChild(name);

        const badge = document.createElement('span');
        badge.className = 'asset-card-badge room';
        badge.textContent = 'Room';
        card.appendChild(badge);

        card.addEventListener('click', () => {
            this.currentRoomType = asset.roomType;
            this.setTool('room');
            this._updateRoomTypeSelection();
        });

        return card;
    }

    _selectAssetForPlacement(asset, card) {
        // Clear previous selection
        this._clearAssetSelection();

        this.selectedAsset = asset;
        card.classList.add('selected');

        // Set tool to place
        this.setTool('place');

        // Set ghost object
        this.engine.ghostObject = {
            assetId: asset.id,
            imageSrc: asset.imageSrc,
            width: asset.width || 1,
            height: asset.height || 1,
            type: asset.category === 'robots' ? 'robot' : asset.drawType || 'object',
        };

        // Pre-load image
        if (asset.imageSrc) {
            this.engine.loadImage(asset.imageSrc);
        }
    }

    _clearAssetSelection() {
        document.querySelectorAll('.asset-card.selected').forEach(c => c.classList.remove('selected'));
    }

    // ---------- Canvas Interaction ----------

    _bindCanvasInteraction() {
        const canvas = this.engine.canvas;
        const container = document.getElementById('canvas-container');

        // Mouse move
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            this.lastMousePos = { x: mx, y: my };

            const tile = this.engine.screenToTile(mx, my);
            this.engine.hoveredTile = this.engine.isValidTile(tile.col, tile.row) ? tile : null;

            // Update status bar
            if (this.engine.hoveredTile) {
                document.getElementById('status-coords').textContent = `X: ${tile.col}  Y: ${tile.row}`;
            }

            // Panning
            if (this.isPanning && this.panStart) {
                const dx = e.clientX - this.panStart.x;
                const dy = e.clientY - this.panStart.y;
                this.engine.pan(dx, dy);
                this.panStart = { x: e.clientX, y: e.clientY };
            }

            // Room drawing
            if (this.isDrawingRoom && this.engine.hoveredTile) {
                this.engine.roomDrawEnd = { ...this.engine.hoveredTile };
            }

            // Update tooltip
            if (this.engine.hoveredTile) {
                const tooltip = document.getElementById('grid-tooltip');
                tooltip.textContent = `(${tile.col}, ${tile.row})`;
                tooltip.style.left = (e.clientX + 16) + 'px';
                tooltip.style.top = (e.clientY + 16) + 'px';
                tooltip.classList.remove('hidden');
            } else {
                document.getElementById('grid-tooltip').classList.add('hidden');
            }
        });

        // Mouse leave
        canvas.addEventListener('mouseleave', () => {
            this.engine.hoveredTile = null;
            document.getElementById('grid-tooltip').classList.add('hidden');
        });

        // Mouse down
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && (this.currentTool === 'pan' || this.spaceHeld))) {
                // Middle click or pan mode
                this.isPanning = true;
                this.panStart = { x: e.clientX, y: e.clientY };
                container.classList.add('cursor-grabbing');
                e.preventDefault();
                return;
            }

            if (e.button !== 0) return;

            // Compute tile directly from click coords (don't rely on hoveredTile from mousemove)
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const clickTile = this.engine.screenToTile(mx, my);
            const tile = this.engine.isValidTile(clickTile.col, clickTile.row) ? clickTile : null;

            // Also update hoveredTile for consistency
            this.engine.hoveredTile = tile;

            if (!tile) return;

            switch (this.currentTool) {
                case 'select':
                    this._handleSelect(tile);
                    break;
                case 'place':
                    this._handlePlace(tile);
                    break;
                case 'room':
                    this._handleRoomStart(tile);
                    break;
                case 'delete':
                    this._handleDelete(tile);
                    break;
            }
        });

        // Mouse up
        canvas.addEventListener('mouseup', (e) => {
            if (this.isPanning) {
                this.isPanning = false;
                container.classList.remove('cursor-grabbing');
            }
            if (this.isDrawingRoom) {
                // Compute final tile position from mouse coords
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                const endTile = this.engine.screenToTile(mx, my);
                if (this.engine.isValidTile(endTile.col, endTile.row)) {
                    this.engine.roomDrawEnd = endTile;
                }
                this._handleRoomEnd();
            }
        });

        // Double click — open robot details
        canvas.addEventListener('dblclick', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const tile = this.engine.screenToTile(mx, my);
            const obj = this.engine.getObjectAtTile(tile.col, tile.row);
            if (obj && obj.type === 'robot') {
                this.robotDetailPanel.open(obj.id);
            }
        });

        // Scroll zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            this.engine.zoom(factor, mx, my);
            this._updateZoomLabel();
        }, { passive: false });

        // Right click — context menu
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const tile = this.engine.screenToTile(mx, my);
            const obj = this.engine.getObjectAtTile(tile.col, tile.row);
            if (obj) {
                this._showContextMenu(e.clientX, e.clientY, obj);
            }
        });

        // Minimap rendering loop
        const miniCanvas = document.getElementById('minimap-canvas');
        setInterval(() => {
            this.engine.renderMinimap(miniCanvas);
        }, 500);
    }

    _handleSelect(tile) {
        const obj = this.engine.getObjectAtTile(tile.col, tile.row);
        if (obj) {
            this.engine.selectObject(obj);
            this._showProperties(obj);
        } else {
            this.engine.clearSelection();
            this._hideProperties();
        }
        this._updateDpad();
    }

    _handlePlace(tile) {
        if (!this.selectedAsset) return;
        if (!this.engine.isValidTile(tile.col, tile.row)) return;

        const asset = this.selectedAsset;

        // Check if tiles are free
        const w = asset.width || 1;
        const h = asset.height || 1;
        for (let c = 0; c < w; c++) {
            for (let r = 0; r < h; r++) {
                if (!this.engine.isValidTile(tile.col + c, tile.row + r)) {
                    this.showToast('Cannot place here — outside grid bounds', 'error');
                    return;
                }
            }
        }

        // Pre-load image if needed
        const placeObject = () => {
            const obj = this.engine.addObject({
                type: asset.category === 'robots' ? 'robot' : (asset.drawType || 'object'),
                assetId: asset.id,
                col: tile.col,
                row: tile.row,
                width: asset.width || 1,
                height: asset.height || 1,
                rotation: 0,
                imageSrc: asset.imageSrc || null,
                data: { ...asset },
            });

            // If robot, create robot instance with data
            if (asset.category === 'robots') {
                this.robotManager.createRobotInstance(asset, obj);
            }

            // Update status
            document.getElementById('status-objects').textContent = `${this.engine.objects.length} objects`;

            // Save to undo stack
            this.app.pushUndo();

            this.showToast(`Placed ${asset.name}`, 'success');
        };

        if (asset.imageSrc) {
            this.engine.loadImage(asset.imageSrc).then(placeObject).catch(() => {
                this.showToast('Failed to load asset image', 'error');
            });
        } else {
            placeObject();
        }
    }

    _handleDelete(tile) {
        const obj = this.engine.getObjectAtTile(tile.col, tile.row);
        if (obj) {
            if (obj.type === 'robot') {
                this.robotManager.removeRobot(obj.id);
            }
            this.engine.removeObject(obj.id);
            this._hideProperties();
            document.getElementById('status-objects').textContent = `${this.engine.objects.length} objects`;
            this.app.pushUndo();
            this.showToast(`Deleted ${obj.data?.name || 'object'}`, 'info');
        } else {
            // Check if there's a room here
            for (let i = this.engine.rooms.length - 1; i >= 0; i--) {
                const room = this.engine.rooms[i];
                if (tile.col >= room.col && tile.col < room.col + room.width &&
                    tile.row >= room.row && tile.row < room.row + room.height) {
                    this.engine.removeRoom(room.id);
                    this.app.pushUndo();
                    this.showToast(`Deleted room "${room.name || room.type}"`, 'info');
                    break;
                }
            }
        }
    }

    _handleRoomStart(tile) {
        this.isDrawingRoom = true;
        this.engine.roomDrawStart = { col: tile.col, row: tile.row };
        this.engine.roomDrawEnd = { col: tile.col, row: tile.row };
    }

    _handleRoomEnd() {
        if (!this.isDrawingRoom || !this.engine.roomDrawStart || !this.engine.roomDrawEnd) {
            this.isDrawingRoom = false;
            return;
        }

        const start = this.engine.roomDrawStart;
        const end = this.engine.roomDrawEnd;
        const col = Math.min(start.col, end.col);
        const row = Math.min(start.row, end.row);
        const width = Math.abs(end.col - start.col) + 1;
        const height = Math.abs(end.row - start.row) + 1;

        if (width > 0 && height > 0) {
            this.engine.addRoom({
                col,
                row,
                width,
                height,
                type: this.currentRoomType,
                name: this.currentRoomType,
            });
            this.app.pushUndo();
            this.showToast(`Created ${this.currentRoomType} (${width}×${height})`, 'success');
        }

        this.isDrawingRoom = false;
        this.engine.roomDrawStart = null;
        this.engine.roomDrawEnd = null;
    }

    // ---------- Properties Panel ----------

    _bindPropertiesPanel() {
        document.getElementById('btn-close-properties').addEventListener('click', () => {
            this._hideProperties();
            this.engine.clearSelection();
        });
    }

    _showProperties(obj) {
        const panel = document.getElementById('properties-panel');
        const title = document.getElementById('properties-title');
        const body = document.getElementById('properties-body');

        title.textContent = obj.data?.name || 'Object Properties';

        let html = '';

        html += `
            <div class="prop-group">
                <span class="prop-label">Position</span>
                <span class="prop-value">(${obj.col}, ${obj.row})</span>
            </div>
            <div class="prop-group">
                <span class="prop-label">Size</span>
                <span class="prop-value">${obj.width || 1} × ${obj.height || 1}</span>
            </div>
            <div class="prop-group">
                <span class="prop-label">Type</span>
                <span class="prop-value">${obj.type}</span>
            </div>
        `;

        if (obj.type === 'robot') {
            const robot = this.robotManager.getRobot(obj.id);
            if (robot) {
                const statusClass = this.robotDetailPanel._statusBadgeClass(robot.status);
                html += `
                    <div class="prop-group">
                        <span class="prop-label">Status</span>
                        <span class="detail-badge ${statusClass}">${robot.status}</span>
                    </div>
                    <div class="prop-group">
                        <span class="prop-label">Manufacturer</span>
                        <span class="prop-value">${robot.manufacturer}</span>
                    </div>
                    <div class="prop-group">
                        <span class="prop-label">Details</span>
                        <button class="prop-btn" id="btn-open-robot-detail">Open Details →</button>
                    </div>
                `;
            }
        }

        body.innerHTML = html;
        panel.classList.remove('hidden');

        // Bind detail button
        const detailBtn = document.getElementById('btn-open-robot-detail');
        if (detailBtn) {
            detailBtn.addEventListener('click', () => {
                this.robotDetailPanel.open(obj.id);
            });
        }
    }

    _hideProperties() {
        document.getElementById('properties-panel').classList.add('hidden');
        this._updateDpad();
    }

    // ---------- Room Type Selector ----------

    _bindRoomTypeSelector() {
        const options = document.getElementById('room-type-options');
        const roomTypes = [
            { type: 'Lab', icon: '🔬' },
            { type: 'Office', icon: '💼' },
            { type: 'Workshop', icon: '🔧' },
            { type: 'Warehouse', icon: '📦' },
            { type: 'Corridor', icon: '🚪' },
            { type: 'Outdoor', icon: '🌳' },
        ];

        roomTypes.forEach(rt => {
            const div = document.createElement('div');
            div.className = `room-type-option ${rt.type === this.currentRoomType ? 'active' : ''}`;
            div.innerHTML = `<span class="room-type-icon">${rt.icon}</span>${rt.type}`;
            div.addEventListener('click', () => {
                this.currentRoomType = rt.type;
                this._updateRoomTypeSelection();
            });
            options.appendChild(div);
        });
    }

    _updateRoomTypeSelection() {
        document.querySelectorAll('.room-type-option').forEach(opt => {
            opt.classList.toggle('active', opt.textContent.includes(this.currentRoomType));
        });
    }

    // ---------- Context Menu ----------

    _showContextMenu(x, y, obj) {
        this._removeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        const items = [
            { label: '🔍 Select', action: () => { this.engine.selectObject(obj); this._showProperties(obj); } },
        ];

        if (obj.type === 'robot') {
            items.push({ label: '📋 View Details', action: () => this.robotDetailPanel.open(obj.id) });
        }

        items.push({ label: '🗑️ Delete', action: () => this._handleDelete({ col: obj.col, row: obj.row }), danger: true });

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'context-menu-item' + (item.danger ? ' danger' : '');
            btn.textContent = item.label;
            btn.addEventListener('click', () => {
                item.action();
                this._removeContextMenu();
            });
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);
        this.contextMenu = menu;

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', this._contextMenuClose = () => {
                this._removeContextMenu();
            }, { once: true });
        }, 10);
    }

    _removeContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    }

    // ---------- Keyboard ----------

    _bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Don't intercept if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Arrow key movement for selected robot (Select tool only)
            if (this.currentTool === 'select' && this.engine.selectedObject) {
                const obj = this.engine.selectedObject;
                if (obj.type === 'robot') {
                    switch (e.key) {
                        case 'ArrowRight': e.preventDefault(); this._moveSelectedRobot(1, 0, 'right');  return;
                        case 'ArrowLeft':  e.preventDefault(); this._moveSelectedRobot(-1, 0, 'left'); return;
                        case 'ArrowDown':  e.preventDefault(); this._moveSelectedRobot(0, 1, 'down');  return;
                        case 'ArrowUp':    e.preventDefault(); this._moveSelectedRobot(0, -1, 'up');   return;
                    }
                }
            }

            switch (e.key.toLowerCase()) {
                case 'v': this.setTool('select'); break;
                case 'p': this.setTool('place'); break;
                case 'r': this.setTool('room'); break;
                case 'x': this.setTool('delete'); break;
                case ' ':
                    e.preventDefault();
                    this.spaceHeld = true;
                    document.getElementById('canvas-container').classList.add('cursor-grab');
                    break;
                case 'escape':
                    this.setTool('select');
                    this.engine.clearSelection();
                    this._hideProperties();
                    this.robotDetailPanel.close();
                    this._removeContextMenu();
                    break;
                case 'delete':
                case 'backspace':
                    if (this.engine.selectedObject) {
                        this._handleDelete({ col: this.engine.selectedObject.col, row: this.engine.selectedObject.row });
                    }
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) this.app.redo();
                        else this.app.undo();
                    }
                    break;
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.app.redo();
                    }
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.app.save();
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === ' ') {
                this.spaceHeld = false;
                if (this.currentTool !== 'pan') {
                    document.getElementById('canvas-container').classList.remove('cursor-grab');
                }
            }
        });
    }

    // Move the currently selected robot in a direction
    _moveSelectedRobot(dCol, dRow, direction) {
        const obj = this.engine.selectedObject;
        if (!obj || obj.type !== 'robot') return;

        const moved = this.engine.moveObject(obj, dCol, dRow, direction);
        if (moved) {
            // Update the properties panel position display
            this._showProperties(obj);
            this._updateDpad();
            this.app.pushUndo();

            // Animate the D-pad button briefly
            const btnMap = { right: 'dpad-right', left: 'dpad-left', up: 'dpad-up', down: 'dpad-down' };
            const btn = document.getElementById(btnMap[direction]);
            if (btn) {
                btn.classList.add('active');
                setTimeout(() => btn.classList.remove('active'), 150);
            }
        } else {
            // Flash red briefly to indicate blocked
            const dpad = document.getElementById('robot-dpad');
            if (dpad) {
                dpad.classList.add('blocked');
                setTimeout(() => dpad.classList.remove('blocked'), 300);
            }
        }
    }

    // ---------- D-Pad Controls ----------

    _createDpad() {
        const dpad = document.createElement('div');
        dpad.id = 'robot-dpad';
        dpad.className = 'robot-dpad hidden';
        dpad.innerHTML = `
            <div class="dpad-label">Move Robot</div>
            <div class="dpad-grid">
                <div></div>
                <button class="dpad-btn" id="dpad-up" title="Move Up (↑)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <div></div>
                <button class="dpad-btn" id="dpad-left" title="Move Left (←)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div class="dpad-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                </div>
                <button class="dpad-btn" id="dpad-right" title="Move Right (→)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <div></div>
                <button class="dpad-btn" id="dpad-down" title="Move Down (↓)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div></div>
            </div>
            <div class="dpad-hint">Arrow keys or click buttons</div>
        `;
        document.getElementById('app').appendChild(dpad);

        // Bind D-pad buttons
        document.getElementById('dpad-up').addEventListener('click',    () => this._moveSelectedRobot(0, -1, 'up'));
        document.getElementById('dpad-down').addEventListener('click',  () => this._moveSelectedRobot(0, 1, 'down'));
        document.getElementById('dpad-left').addEventListener('click',  () => this._moveSelectedRobot(-1, 0, 'left'));
        document.getElementById('dpad-right').addEventListener('click', () => this._moveSelectedRobot(1, 0, 'right'));
    }

    _updateDpad() {
        const dpad = document.getElementById('robot-dpad');
        if (!dpad) return;
        const obj = this.engine.selectedObject;
        const show = obj && obj.type === 'robot' && this.currentTool === 'select';
        dpad.classList.toggle('hidden', !show);
    }

    // ---------- Zoom Controls ----------

    _bindZoomControls() {
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.engine.zoom(1.2, this.engine.displayWidth / 2, this.engine.displayHeight / 2);
            this._updateZoomLabel();
        });
        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.engine.zoom(0.8, this.engine.displayWidth / 2, this.engine.displayHeight / 2);
            this._updateZoomLabel();
        });
        document.getElementById('btn-zoom-fit').addEventListener('click', () => {
            this.engine.fitToView();
            this._updateZoomLabel();
        });
    }

    _updateZoomLabel() {
        document.getElementById('zoom-label').textContent = `${Math.round(this.engine.camera.zoom * 100)}%`;
    }

    // ---------- Top Bar Actions ----------

    _bindTopBarActions() {
        document.getElementById('btn-save').addEventListener('click', () => this.app.save());
        document.getElementById('btn-export').addEventListener('click', () => this.app.exportJSON());
        document.getElementById('btn-import').addEventListener('click', () => {
            document.getElementById('file-import').click();
        });
        document.getElementById('file-import').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.app.importJSON(file);
            e.target.value = '';
        });
    }

    // ---------- Toast Notifications ----------

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span>${message}`;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}
