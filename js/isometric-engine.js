// ============================================================
// IsometricEngine — Canvas-based isometric renderer
// Handles grid, camera, coordinate transforms, object rendering
// ============================================================

export class IsometricEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Grid config
        this.gridCols = options.gridCols || 20;
        this.gridRows = options.gridRows || 20;
        this.tileWidth = options.tileWidth || 64;
        this.tileHeight = options.tileHeight || 32;

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            minZoom: 0.3,
            maxZoom: 3,
        };

        // Objects placed on the grid
        this.objects = [];
        this.rooms = [];
        this.selectedObject = null;
        this.hoveredTile = null;
        this.ghostObject = null; // preview while placing

        // Room drawing state
        this.roomDrawStart = null;
        this.roomDrawEnd = null;

        // Colors
        this.gridColor = 'rgba(0, 212, 255, 0.08)';
        this.gridColorHover = 'rgba(0, 212, 255, 0.25)';
        this.gridColorAccent = 'rgba(0, 212, 255, 0.15)';
        this.selectionColor = 'rgba(0, 212, 255, 0.5)';
        this.selectionGlow = 'rgba(0, 212, 255, 0.3)';
        this.bgColor = '#0a0e1a';

        // Image cache
        this.imageCache = new Map();

        // Bind resize
        this._resizeHandler = () => this.resize();
        window.addEventListener('resize', this._resizeHandler);
        this.resize();

        // Center camera on grid
        this.centerCamera();

        // Start render loop
        this._animFrame = null;
        this.startRenderLoop();
    }

    // ---------- Resize ----------

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }

    // ---------- Coordinate Transforms ----------

    // Grid (col, row) -> Isometric screen position (center of tile)
    gridToScreen(col, row) {
        const tx = (col - row) * (this.tileWidth / 2);
        const ty = (col + row) * (this.tileHeight / 2);
        const sx = tx * this.camera.zoom + this.camera.x + this.displayWidth / 2;
        const sy = ty * this.camera.zoom + this.camera.y + this.displayHeight / 2;
        return { x: sx, y: sy };
    }

    // Screen position -> Grid (col, row) — returns floats
    screenToGrid(sx, sy) {
        const cx = (sx - this.displayWidth / 2 - this.camera.x) / this.camera.zoom;
        const cy = (sy - this.displayHeight / 2 - this.camera.y) / this.camera.zoom;
        const col = (cx / (this.tileWidth / 2) + cy / (this.tileHeight / 2)) / 2;
        const row = (cy / (this.tileHeight / 2) - cx / (this.tileWidth / 2)) / 2;
        return { col, row };
    }

    // Snap to integer grid
    screenToTile(sx, sy) {
        const { col, row } = this.screenToGrid(sx, sy);
        return { col: Math.floor(col), row: Math.floor(row) };
    }

    // Check if tile is within grid bounds
    isValidTile(col, row) {
        return col >= 0 && col < this.gridCols && row >= 0 && row < this.gridRows;
    }

    // ---------- Camera Controls ----------

    pan(dx, dy) {
        this.camera.x += dx;
        this.camera.y += dy;
    }

    zoom(factor, pivotX, pivotY) {
        const oldZoom = this.camera.zoom;
        this.camera.zoom = Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, this.camera.zoom * factor));
        const zoomRatio = this.camera.zoom / oldZoom;
        // Zoom toward pivot point
        const cx = pivotX - this.displayWidth / 2;
        const cy = pivotY - this.displayHeight / 2;
        this.camera.x = cx - (cx - this.camera.x) * zoomRatio;
        this.camera.y = cy - (cy - this.camera.y) * zoomRatio;
    }

    setZoom(level) {
        this.camera.zoom = Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, level));
    }

    centerCamera() {
        // Center on the middle of the grid
        const midCol = this.gridCols / 2;
        const midRow = this.gridRows / 2;
        const tx = (midCol - midRow) * (this.tileWidth / 2);
        const ty = (midCol + midRow) * (this.tileHeight / 2);
        this.camera.x = -tx * this.camera.zoom;
        this.camera.y = -ty * this.camera.zoom;
    }

    fitToView() {
        // Calculate bounds of the grid in iso space
        const topLeft = this.gridToIso(0, 0);
        const topRight = this.gridToIso(this.gridCols, 0);
        const bottomLeft = this.gridToIso(0, this.gridRows);
        const bottomRight = this.gridToIso(this.gridCols, this.gridRows);

        const minX = Math.min(topLeft.x, bottomLeft.x);
        const maxX = Math.max(topRight.x, bottomRight.x);
        const minY = topLeft.y;
        const maxY = bottomRight.y;

        const gridWidth = maxX - minX;
        const gridHeight = maxY - minY;

        const padding = 60;
        const scaleX = (this.displayWidth - padding * 2) / gridWidth;
        const scaleY = (this.displayHeight - padding * 2) / gridHeight;
        this.camera.zoom = Math.min(scaleX, scaleY, this.camera.maxZoom);
        this.centerCamera();
    }

    gridToIso(col, row) {
        return {
            x: (col - row) * (this.tileWidth / 2),
            y: (col + row) * (this.tileHeight / 2),
        };
    }

    // ---------- Object Management ----------

    addObject(obj) {
        // obj: { id, type, assetId, col, row, width, height, rotation, image, data }
        if (!obj.id) obj.id = 'obj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        this.objects.push(obj);
        this.sortObjects();
        return obj;
    }

    removeObject(id) {
        this.objects = this.objects.filter(o => o.id !== id);
        if (this.selectedObject && this.selectedObject.id === id) {
            this.selectedObject = null;
        }
    }

    getObjectAtTile(col, row) {
        // Search from top (last rendered) to bottom for click detection
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            const w = obj.width || 1;
            const h = obj.height || 1;
            if (col >= obj.col && col < obj.col + w && row >= obj.row && row < obj.row + h) {
                return obj;
            }
        }
        return null;
    }

    sortObjects() {
        // Painter's algorithm: sort by depth (col + row), back to front
        this.objects.sort((a, b) => {
            const da = a.col + a.row;
            const db = b.col + b.row;
            if (da !== db) return da - db;
            return (a.row - b.row);
        });
    }

    selectObject(obj) {
        this.selectedObject = obj;
    }

    clearSelection() {
        this.selectedObject = null;
    }

    // Move the selected (or specified) object by delta col/row
    // direction: 'right' | 'left' | 'up' | 'down'
    moveObject(obj, dCol, dRow, direction) {
        const newCol = obj.col + dCol;
        const newRow = obj.row + dRow;

        // Bounds check (account for object size)
        const w = obj.width || 1;
        const h = obj.height || 1;
        if (!this.isValidTile(newCol, newRow) ||
            !this.isValidTile(newCol + w - 1, newRow + h - 1)) {
            return false; // blocked by boundary
        }

        obj.col = newCol;
        obj.row = newRow;
        obj.direction = direction;

        // Flip logic for isometric directions:
        // 'right' (col+1): front-right  → normal
        // 'down'  (row+1): front-left   → normal
        // 'left'  (col-1): back-left    → flipped
        // 'up'    (row-1): back-right   → flipped
        if (direction === 'left' || direction === 'up') {
            obj.flipX = true;
        } else {
            obj.flipX = false;
        }

        this.sortObjects();
        return true;
    }

    // ---------- Room Management ----------

    addRoom(room) {
        if (!room.id) room.id = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        this.rooms.push(room);
        return room;
    }

    removeRoom(id) {
        this.rooms = this.rooms.filter(r => r.id !== id);
    }

    // ---------- Image Loading ----------

    loadImage(src) {
        if (this.imageCache.has(src)) {
            return Promise.resolve(this.imageCache.get(src));
        }
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    // ---------- Rendering ----------

    startRenderLoop() {
        const loop = () => {
            this.render();
            this._animFrame = requestAnimationFrame(loop);
        };
        loop();
    }

    stopRenderLoop() {
        if (this._animFrame) {
            cancelAnimationFrame(this._animFrame);
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.displayWidth;
        const h = this.displayHeight;

        // Clear
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, w, h);

        // Draw background gradient
        this._drawBackground(ctx, w, h);

        // Draw rooms (floor fills)
        this._drawRooms(ctx);

        // Draw room preview if drawing
        if (this.roomDrawStart && this.roomDrawEnd) {
            this._drawRoomPreview(ctx);
        }

        // Draw grid
        this._drawGrid(ctx);

        // Draw objects (z-sorted)
        this._drawObjects(ctx);

        // Draw ghost object (placement preview)
        if (this.ghostObject && this.hoveredTile) {
            this._drawGhostObject(ctx);
        }

        // Draw selection highlight
        if (this.selectedObject) {
            this._drawSelectionHighlight(ctx);
        }

        // Draw hovered tile highlight
        if (this.hoveredTile && !this.ghostObject) {
            this._drawTileHighlight(ctx, this.hoveredTile.col, this.hoveredTile.row, this.gridColorHover);
        }
    }

    _drawBackground(ctx, w, h) {
        // Subtle radial gradient
        const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
        grd.addColorStop(0, '#0f1629');
        grd.addColorStop(1, '#060a14');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
    }

    _drawGrid(ctx) {
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1;

        // Draw grid lines
        for (let col = 0; col <= this.gridCols; col++) {
            const start = this.gridToScreen(col, 0);
            const end = this.gridToScreen(col, this.gridRows);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

        for (let row = 0; row <= this.gridRows; row++) {
            const start = this.gridToScreen(0, row);
            const end = this.gridToScreen(this.gridCols, row);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

        // Draw every 5th line slightly brighter
        ctx.strokeStyle = this.gridColorAccent;
        ctx.lineWidth = 1;
        for (let col = 0; col <= this.gridCols; col += 5) {
            const start = this.gridToScreen(col, 0);
            const end = this.gridToScreen(col, this.gridRows);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
        for (let row = 0; row <= this.gridRows; row += 5) {
            const start = this.gridToScreen(0, row);
            const end = this.gridToScreen(this.gridCols, row);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    _drawRooms(ctx) {
        for (const room of this.rooms) {
            this._drawRoomFill(ctx, room);
        }
    }

    _drawRoomFill(ctx, room) {
        const { col, row, width, height, type } = room;
        const colors = this.getRoomColor(type);

        // Draw filled diamond for the room area
        ctx.save();
        ctx.beginPath();

        const tl = this.gridToScreen(col, row);
        const tr = this.gridToScreen(col + width, row);
        const br = this.gridToScreen(col + width, row + height);
        const bl = this.gridToScreen(col, row + height);

        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();

        ctx.fillStyle = colors.fill;
        ctx.fill();
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw room label
        const center = this.gridToScreen(col + width / 2, row + height / 2);
        ctx.fillStyle = colors.text;
        ctx.font = `${11 * this.camera.zoom}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name || type, center.x, center.y);

        ctx.restore();
    }

    _drawRoomPreview(ctx) {
        const start = this.roomDrawStart;
        const end = this.roomDrawEnd;
        const col = Math.min(start.col, end.col);
        const row = Math.min(start.row, end.row);
        const width = Math.abs(end.col - start.col) + 1;
        const height = Math.abs(end.row - start.row) + 1;

        ctx.save();
        ctx.beginPath();

        const tl = this.gridToScreen(col, row);
        const tr = this.gridToScreen(col + width, row);
        const br = this.gridToScreen(col + width, row + height);
        const bl = this.gridToScreen(col, row + height);

        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();

        ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dimension label
        const center = this.gridToScreen(col + width / 2, row + height / 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
        ctx.font = `bold ${12 * this.camera.zoom}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${width} × ${height}`, center.x, center.y);

        ctx.restore();
    }

    _drawTileHighlight(ctx, col, row, color) {
        if (!this.isValidTile(col, row)) return;

        const tl = this.gridToScreen(col, row);
        const tr = this.gridToScreen(col + 1, row);
        const br = this.gridToScreen(col + 1, row + 1);
        const bl = this.gridToScreen(col, row + 1);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    _drawObjects(ctx) {
        for (const obj of this.objects) {
            this._drawObject(ctx, obj, 1.0);
        }
    }

    _drawObject(ctx, obj, alpha) {
        const img = this.imageCache.get(obj.imageSrc);
        if (!img) {
            // Draw placeholder
            this._drawPlaceholder(ctx, obj);
            return;
        }

        const w = (obj.width || 1);
        const h = (obj.height || 1);

        // Position at center-bottom of the tile area
        const centerCol = obj.col + w / 2;
        const frontRow = obj.row + h;
        const pos = this.gridToScreen(centerCol, frontRow);

        // Scale image to fit tile area
        const tilePixelWidth = this.tileWidth * this.camera.zoom * w;
        const imgAspect = img.width / img.height;
        const drawWidth = tilePixelWidth * 1.1; // slightly larger than tile
        const drawHeight = drawWidth / imgAspect;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Draw shadow
        ctx.save();
        ctx.globalAlpha = 0.15 * alpha;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, drawWidth * 0.35, drawWidth * 0.12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();

        // Apply horizontal flip for direction
        if (obj.flipX) {
            ctx.translate(pos.x, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(
                img,
                -drawWidth / 2,
                pos.y - drawHeight,
                drawWidth,
                drawHeight
            );
        } else {
            // Draw the image normally
            ctx.drawImage(
                img,
                pos.x - drawWidth / 2,
                pos.y - drawHeight,
                drawWidth,
                drawHeight
            );
        }

        ctx.restore();
    }

    _drawGhostObject(ctx) {
        if (!this.ghostObject || !this.hoveredTile) return;

        const col = this.hoveredTile.col;
        const row = this.hoveredTile.row;
        const valid = this.isValidTile(col, row);

        // Draw tile highlight
        const highlightColor = valid ? 'rgba(0, 212, 255, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        const w = this.ghostObject.width || 1;
        const h = this.ghostObject.height || 1;
        for (let c = 0; c < w; c++) {
            for (let r = 0; r < h; r++) {
                this._drawTileHighlight(ctx, col + c, row + r, highlightColor);
            }
        }

        // Draw ghost image
        const img = this.imageCache.get(this.ghostObject.imageSrc);
        if (img) {
            const tempObj = { ...this.ghostObject, col, row };
            ctx.save();
            ctx.globalAlpha = 0.6;
            this._drawObject(ctx, tempObj, 0.6);
            ctx.restore();
        }
    }

    _drawSelectionHighlight(ctx) {
        const obj = this.selectedObject;
        if (!obj) return;

        const w = obj.width || 1;
        const h = obj.height || 1;

        // Draw selection diamond around the object's tile area
        ctx.save();
        const tl = this.gridToScreen(obj.col, obj.row);
        const tr = this.gridToScreen(obj.col + w, obj.row);
        const br = this.gridToScreen(obj.col + w, obj.row + h);
        const bl = this.gridToScreen(obj.col, obj.row + h);

        // Glow effect
        ctx.shadowColor = this.selectionGlow;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();

        ctx.strokeStyle = this.selectionColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    _drawPlaceholder(ctx, obj) {
        const pos = this.gridToScreen(obj.col + 0.5, obj.row + 0.5);
        const size = 20 * this.camera.zoom;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);
        ctx.restore();
    }

    // ---------- Room Colors ----------

    getRoomColor(type) {
        const colors = {
            'Lab': { fill: 'rgba(59, 130, 246, 0.08)', stroke: 'rgba(59, 130, 246, 0.3)', text: 'rgba(59, 130, 246, 0.6)' },
            'Office': { fill: 'rgba(34, 197, 94, 0.08)', stroke: 'rgba(34, 197, 94, 0.3)', text: 'rgba(34, 197, 94, 0.6)' },
            'Workshop': { fill: 'rgba(245, 158, 11, 0.08)', stroke: 'rgba(245, 158, 11, 0.3)', text: 'rgba(245, 158, 11, 0.6)' },
            'Warehouse': { fill: 'rgba(139, 92, 246, 0.08)', stroke: 'rgba(139, 92, 246, 0.3)', text: 'rgba(139, 92, 246, 0.6)' },
            'Corridor': { fill: 'rgba(107, 114, 128, 0.08)', stroke: 'rgba(107, 114, 128, 0.3)', text: 'rgba(107, 114, 128, 0.6)' },
            'Outdoor': { fill: 'rgba(16, 185, 129, 0.08)', stroke: 'rgba(16, 185, 129, 0.3)', text: 'rgba(16, 185, 129, 0.6)' },
        };
        return colors[type] || colors['Lab'];
    }

    // ---------- Minimap ----------

    renderMinimap(miniCanvas) {
        const mCtx = miniCanvas.getContext('2d');
        const mw = miniCanvas.width;
        const mh = miniCanvas.height;

        mCtx.fillStyle = '#0a0e1a';
        mCtx.fillRect(0, 0, mw, mh);

        // Scale to fit grid
        const gridWorldWidth = this.gridCols * this.tileWidth;
        const gridWorldHeight = this.gridRows * this.tileHeight;
        const scale = Math.min(mw / (gridWorldWidth), mh / (gridWorldHeight * 0.6)) * 0.8;

        const offsetX = mw / 2;
        const offsetY = mh * 0.15;

        // Draw rooms on minimap
        for (const room of this.rooms) {
            const colors = this.getRoomColor(room.type);
            mCtx.beginPath();
            const corners = [
                [room.col, room.row],
                [room.col + room.width, room.row],
                [room.col + room.width, room.row + room.height],
                [room.col, room.row + room.height],
            ];
            corners.forEach(([c, r], i) => {
                const mx = (c - r) * (this.tileWidth / 2) * scale + offsetX;
                const my = (c + r) * (this.tileHeight / 2) * scale + offsetY;
                if (i === 0) mCtx.moveTo(mx, my);
                else mCtx.lineTo(mx, my);
            });
            mCtx.closePath();
            mCtx.fillStyle = colors.fill.replace('0.08', '0.3');
            mCtx.fill();
        }

        // Draw grid outline
        const tl = { x: (0 - 0) * (this.tileWidth / 2) * scale + offsetX, y: (0 + 0) * (this.tileHeight / 2) * scale + offsetY };
        const tr = { x: (this.gridCols) * (this.tileWidth / 2) * scale + offsetX, y: (this.gridCols) * (this.tileHeight / 2) * scale + offsetY };
        const br = { x: (this.gridCols - this.gridRows) * (this.tileWidth / 2) * scale + offsetX, y: (this.gridCols + this.gridRows) * (this.tileHeight / 2) * scale + offsetY };
        const bl = { x: (-this.gridRows) * (this.tileWidth / 2) * scale + offsetX, y: (this.gridRows) * (this.tileHeight / 2) * scale + offsetY };

        mCtx.beginPath();
        mCtx.moveTo(tl.x, tl.y);
        mCtx.lineTo(tr.x, tr.y);
        mCtx.lineTo(br.x, br.y);
        mCtx.lineTo(bl.x, bl.y);
        mCtx.closePath();
        mCtx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        mCtx.lineWidth = 1;
        mCtx.stroke();

        // Draw objects as dots
        for (const obj of this.objects) {
            const c = obj.col + 0.5;
            const r = obj.row + 0.5;
            const mx = (c - r) * (this.tileWidth / 2) * scale + offsetX;
            const my = (c + r) * (this.tileHeight / 2) * scale + offsetY;
            mCtx.beginPath();
            mCtx.arc(mx, my, 2, 0, Math.PI * 2);
            mCtx.fillStyle = obj.type === 'robot' ? '#00d4ff' : '#64748b';
            mCtx.fill();
        }

        // Draw viewport rectangle
        const viewTl = this.screenToGrid(0, 0);
        const viewBr = this.screenToGrid(this.displayWidth, this.displayHeight);
        const vmTl = {
            x: (viewTl.col - viewTl.row) * (this.tileWidth / 2) * scale + offsetX,
            y: (viewTl.col + viewTl.row) * (this.tileHeight / 2) * scale + offsetY,
        };
        const vmBr = {
            x: (viewBr.col - viewBr.row) * (this.tileWidth / 2) * scale + offsetX,
            y: (viewBr.col + viewBr.row) * (this.tileHeight / 2) * scale + offsetY,
        };

        mCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        mCtx.lineWidth = 1;
        mCtx.strokeRect(vmTl.x, vmTl.y, vmBr.x - vmTl.x, vmBr.y - vmTl.y);
    }

    // ---------- Serialization ----------

    serialize() {
        return {
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            camera: { ...this.camera },
            objects: this.objects.map(o => ({
                id: o.id,
                type: o.type,
                assetId: o.assetId,
                col: o.col,
                row: o.row,
                width: o.width,
                height: o.height,
                rotation: o.rotation,
                flipX: o.flipX || false,
                direction: o.direction || 'right',
                imageSrc: o.imageSrc,
                data: o.data,
            })),
            rooms: this.rooms.map(r => ({
                id: r.id,
                col: r.col,
                row: r.row,
                width: r.width,
                height: r.height,
                type: r.type,
                name: r.name,
            })),
        };
    }

    async deserialize(data) {
        this.gridCols = data.gridCols || 20;
        this.gridRows = data.gridRows || 20;
        if (data.camera) {
            this.camera = { ...this.camera, ...data.camera };
        }
        this.rooms = data.rooms || [];
        this.objects = [];

        // Load images and recreate objects
        for (const objData of (data.objects || [])) {
            if (objData.imageSrc) {
                try {
                    await this.loadImage(objData.imageSrc);
                } catch (e) {
                    console.warn('Failed to load image for', objData.assetId);
                }
            }
            this.objects.push(objData);
        }
        this.sortObjects();
    }

    // ---------- Cleanup ----------

    destroy() {
        this.stopRenderLoop();
        window.removeEventListener('resize', this._resizeHandler);
    }
}
