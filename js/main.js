// ============================================================
// Robotsims — Main Application Bootstrap
// By Autodiscovery
// ============================================================

import { IsometricEngine } from './isometric-engine.js';
import { UIManager } from './ui-manager.js';
import { RobotManager } from './robot-manager.js';
import { RobotDetailPanel } from './robot-detail-panel.js';
import { EnvironmentRenderer } from './environment-assets.js';
import { ROBOT_ASSETS, ENVIRONMENT_ASSETS, getAssetById } from './asset-library.js';

class App {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndo = 50;
        this.autoSaveInterval = null;
        this.envRenderer = new EnvironmentRenderer();
    }

    async init() {
        this._updateLoading('Initializing isometric engine...', 10);

        // Create engine
        const canvas = document.getElementById('iso-canvas');
        this.engine = new IsometricEngine(canvas, {
            gridCols: 20,
            gridRows: 20,
            tileWidth: 64,
            tileHeight: 32,
        });

        this._updateLoading('Loading robot assets...', 30);

        // Pre-load all robot images
        const loadPromises = ROBOT_ASSETS.map(asset =>
            this.engine.loadImage(asset.imageSrc).catch(err => {
                console.warn(`Could not load: ${asset.imageSrc}`, err);
            })
        );

        let loaded = 0;
        for (const promise of loadPromises) {
            await promise;
            loaded++;
            const progress = 30 + Math.floor((loaded / loadPromises.length) * 40);
            this._updateLoading(`Loading robot assets (${loaded}/${loadPromises.length})...`, progress);
        }

        this._updateLoading('Setting up robot manager...', 75);

        // Create robot manager
        this.robotManager = new RobotManager();

        // Create robot detail panel
        this.robotDetailPanel = new RobotDetailPanel(this.robotManager);

        this._updateLoading('Building UI...', 85);

        // Patch the engine's _drawObject to also handle procedural assets
        this._patchEngineRendering();

        // Create UI manager
        this.uiManager = new UIManager(this.engine, this.robotManager, this.robotDetailPanel, this);

        this._updateLoading('Loading saved data...', 92);

        // Try to load saved state
        this._loadFromStorage();

        this._updateLoading('Ready!', 100);

        // Show app
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.getElementById('app').classList.remove('hidden');
                this.engine.resize();
                this.engine.fitToView();
                this.uiManager._updateZoomLabel();
            }, 600);
        }, 500);

        // Auto-save every 60s
        this.autoSaveInterval = setInterval(() => {
            this.save(true);
        }, 60000);

        // Update object count
        document.getElementById('status-objects').textContent = `${this.engine.objects.length} objects`;
    }

    // ---------- Engine rendering patch for procedural assets ----------

    _patchEngineRendering() {
        const originalDraw = this.engine._drawObject.bind(this.engine);
        const envRenderer = this.envRenderer;
        const engine = this.engine;

        engine._drawObject = function (ctx, obj, alpha) {
            // If the object has an image, use the original drawing
            if (obj.imageSrc && engine.imageCache.has(obj.imageSrc)) {
                originalDraw(ctx, obj, alpha);
                return;
            }

            // For procedural assets, draw using EnvironmentRenderer
            const asset = obj.data;
            if (asset && asset.shape) {
                const w = obj.width || 1;
                const h = obj.height || 1;
                const centerCol = obj.col + w / 2;
                const centerRow = obj.row + h / 2;
                const pos = engine.gridToScreen(centerCol, centerRow);

                ctx.save();
                ctx.globalAlpha = alpha;

                // Draw shadow
                ctx.save();
                ctx.globalAlpha = 0.15 * alpha;
                ctx.beginPath();
                const frontRow = obj.row + h;
                const shadowPos = engine.gridToScreen(centerCol, frontRow);
                ctx.ellipse(shadowPos.x, shadowPos.y, 20 * engine.camera.zoom, 8 * engine.camera.zoom, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.fill();
                ctx.restore();

                envRenderer.drawOnGrid(ctx, asset, pos.x, pos.y - 6 * engine.camera.zoom, engine.camera.zoom);
                ctx.restore();
            } else {
                // Fallback to placeholder
                originalDraw(ctx, obj, alpha);
            }
        };

        // Also patch ghost rendering
        const originalGhost = engine._drawGhostObject.bind(engine);
        engine._drawGhostObject = function (ctx) {
            if (!engine.ghostObject || !engine.hoveredTile) return;

            const col = engine.hoveredTile.col;
            const row = engine.hoveredTile.row;
            const valid = engine.isValidTile(col, row);

            // Draw tile highlight
            const highlightColor = valid ? 'rgba(0, 212, 255, 0.2)' : 'rgba(239, 68, 68, 0.2)';
            const w = engine.ghostObject.width || 1;
            const h = engine.ghostObject.height || 1;
            for (let c = 0; c < w; c++) {
                for (let r = 0; r < h; r++) {
                    engine._drawTileHighlight(ctx, col + c, row + r, highlightColor);
                }
            }

            // Draw ghost
            if (engine.ghostObject.imageSrc && engine.imageCache.has(engine.ghostObject.imageSrc)) {
                const tempObj = { ...engine.ghostObject, col, row };
                ctx.save();
                ctx.globalAlpha = 0.5;
                originalDraw(ctx, tempObj, 0.5);
                ctx.restore();
            }
        };
    }

    // ---------- Undo/Redo ----------

    pushUndo() {
        const state = this._captureState();
        this.undoStack.push(state);
        if (this.undoStack.length > this.maxUndo) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const state = this.undoStack.pop();
        this.redoStack.push(this._captureState());
        this._restoreState(state);
        this.uiManager.showToast('Undone', 'info');
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const state = this.redoStack.pop();
        this.undoStack.push(this._captureState());
        this._restoreState(state);
        this.uiManager.showToast('Redone', 'info');
    }

    _captureState() {
        return {
            engine: this.engine.serialize(),
            robots: this.robotManager.serialize(),
            labName: document.getElementById('lab-name-input').value,
        };
    }

    _restoreState(state) {
        this.engine.deserialize(state.engine);
        this.robotManager.deserialize(state.robots);
        document.getElementById('lab-name-input').value = state.labName || 'My Robotics Lab';
        document.getElementById('status-objects').textContent = `${this.engine.objects.length} objects`;
    }

    // ---------- Save/Load ----------

    save(isAutoSave = false) {
        const state = this._captureState();
        localStorage.setItem('robotsims_save', JSON.stringify(state));
        if (!isAutoSave) {
            this.uiManager.showToast('Lab saved successfully!', 'success');
        }
        document.getElementById('status-autosave').textContent = isAutoSave ? `Auto-saved ${new Date().toLocaleTimeString()}` : 'Saved';
    }

    _loadFromStorage() {
        try {
            const saved = localStorage.getItem('robotsims_save');
            if (saved) {
                const state = JSON.parse(saved);
                this._restoreState(state);
            }
        } catch (e) {
            console.warn('Failed to load saved state:', e);
        }
    }

    exportJSON() {
        const state = this._captureState();
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `robotsims_${document.getElementById('lab-name-input').value.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.uiManager.showToast('Lab exported as JSON', 'success');
    }

    importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);
                this.pushUndo();
                this._restoreState(state);
                this.uiManager.showToast('Lab imported successfully!', 'success');
            } catch (err) {
                this.uiManager.showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    // ---------- Loading Screen ----------

    _updateLoading(message, progress) {
        const bar = document.getElementById('loading-bar-fill');
        const status = document.getElementById('loading-status');
        if (bar) bar.style.width = progress + '%';
        if (status) status.textContent = message;
    }
}

// ---------- Init ----------

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init().catch(err => {
        console.error('Robotsims initialization failed:', err);
    });
});
