// ============================================================
// AssetLibrary — Catalog of all placeable assets
// Robots, rooms, furniture, equipment, machines, decorations
// ============================================================

export const ASSET_CATEGORIES = {
    robots: { name: 'Robots', icon: '🤖' },
    rooms: { name: 'Rooms', icon: '🏠' },
    structure: { name: 'Structure', icon: '🧱' },
    furniture: { name: 'Furniture', icon: '🪑' },
    equipment: { name: 'Equipment', icon: '⚙️' },
    machines: { name: 'Machines', icon: '🏭' },
    decorations: { name: 'Decorations', icon: '🌿' },
};

// ---------- Robot Assets (from PNG image packs) ----------

export const ROBOT_ASSETS = [
    // Pack 1 — UGVs
    { id: 'tracer-200', name: 'Tracer 200', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Tracer-200.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Indoor AMR' },
    { id: 'tracer-2', name: 'Tracer 2', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Tracer-2.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Indoor AMR' },
    { id: 'hunter-se', name: 'Hunter SE', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Hunter-SE.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Ackermann Steering' },
    { id: 'hunter-2', name: 'Hunter 2', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Hunter-2.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Ackermann Steering' },
    { id: 'ranger', name: 'Ranger', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/ranger.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'All-terrain' },
    { id: 'ranger-mini', name: 'Ranger Mini', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/ranger_mini.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Compact All-terrain' },
    { id: 'scout-2', name: 'Scout 2', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/scout-2.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Skid-steer' },
    { id: 'scout-mini', name: 'Scout Mini', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/scout-mini.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Compact Skid-steer' },
    { id: 'titan', name: 'Titan', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Titan.png', width: 2, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Heavy-duty Platform' },
    { id: 'bunker', name: 'Bunker', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Bunker.png', width: 2, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Tracked Platform' },
    { id: 'bunker-pro', name: 'Bunker Pro', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Bunker-pro.png', width: 2, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Heavy Tracked Platform' },
    { id: 'bunker-mini', name: 'Bunker Mini', category: 'robots', imageSrc: 'assets/Isometric robots 1/PNG/Bunker-mini.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Compact Tracked' },

    // Pack 2 — Mixed
    { id: 'rtu', name: 'RTU', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/RTU.png', width: 1, height: 1, manufacturer: 'Autodiscovery', type: 'UGV', subtype: 'Research Platform' },
    { id: 'navis', name: 'Navis', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/navis.png', width: 1, height: 1, manufacturer: 'Autodiscovery', type: 'AMR', subtype: 'Navigation Robot' },
    { id: 'ros2-edu', name: 'ROS2 EDU', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/Ros2.png', width: 1, height: 1, manufacturer: 'Autodiscovery', type: 'UGV', subtype: 'Educational Platform' },
    { id: 'limo-cobot', name: 'Limo Cobot', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/limo cobot.png', width: 1, height: 1, manufacturer: 'AgileX Robotics', type: 'UGV', subtype: 'Mobile Manipulator' },
    { id: 'auto-kit-2', name: 'Auto Kit 2', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/Auto kit 2.png', width: 1, height: 1, manufacturer: 'Autodiscovery', type: 'UGV', subtype: 'Sensor Kit' },
    { id: 'head360', name: 'Head360', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/Head360.png', width: 1, height: 1, manufacturer: 'Autodiscovery', type: 'Sensor', subtype: '360° Camera Head' },
    { id: 'cobot-magic', name: 'Cobot Magic', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/Cobot magic.png', width: 2, height: 2, manufacturer: 'Autodiscovery', type: 'Cobot', subtype: 'Collaborative Robot Arm' },
    { id: 'stella', name: 'Stella', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/Stella.png', width: 2, height: 2, manufacturer: 'Unitree', type: 'Quadruped', subtype: 'Heavy Quadruped' },
    { id: 'go2', name: 'Go2', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/Go2.png', width: 1, height: 1, manufacturer: 'Unitree', type: 'Quadruped', subtype: 'Compact Quadruped' },
    { id: 'b2', name: 'B2', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/B2.png', width: 1, height: 1, manufacturer: 'Unitree', type: 'Quadruped', subtype: 'Industrial Quadruped' },
    { id: 'g1', name: 'G1', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/G1.png', width: 1, height: 1, manufacturer: 'Unitree', type: 'Humanoid', subtype: 'General Purpose Humanoid' },
    { id: 'g1-alt', name: 'G1 (Alt)', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/G1 (2).png', width: 1, height: 1, manufacturer: 'Unitree', type: 'Humanoid', subtype: 'General Purpose Humanoid' },
    { id: 'h1', name: 'H1', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/H1.png', width: 1, height: 1, manufacturer: 'Unitree', type: 'Humanoid', subtype: 'Full-size Humanoid' },
    { id: 'h1-alt', name: 'H1 (Alt)', category: 'robots', imageSrc: 'assets/Isometric robots 2/Png/H1 (2).png', width: 1, height: 1, manufacturer: 'Unitree', type: 'Humanoid', subtype: 'Full-size Humanoid' },

    // Pack 3 — Spot-style quadrupeds
    { id: 'spot-base', name: 'Spot', category: 'robots', imageSrc: 'assets/Isometris robots 3/Png/robots-3_0000.png', width: 1, height: 1, manufacturer: 'Boston Dynamics', type: 'Quadruped', subtype: 'Agile Mobile Robot' },
    { id: 'spot-arm', name: 'Spot + Arm', category: 'robots', imageSrc: 'assets/Isometris robots 3/Png/robots-3_0001.png', width: 1, height: 1, manufacturer: 'Boston Dynamics', type: 'Quadruped', subtype: 'Mobile Manipulator' },
    { id: 'spot-cam', name: 'Spot + Camera', category: 'robots', imageSrc: 'assets/Isometris robots 3/Png/robots-3_0002.png', width: 1, height: 1, manufacturer: 'Boston Dynamics', type: 'Quadruped', subtype: 'Inspection Robot' },
];

// ---------- Environment Assets (procedurally drawn) ----------

export const ENVIRONMENT_ASSETS = [
    // Rooms
    { id: 'room-lab', name: 'Laboratory', category: 'rooms', drawType: 'room', roomType: 'Lab', color: '#3b82f6' },
    { id: 'room-office', name: 'Office', category: 'rooms', drawType: 'room', roomType: 'Office', color: '#22c55e' },
    { id: 'room-workshop', name: 'Workshop', category: 'rooms', drawType: 'room', roomType: 'Workshop', color: '#f59e0b' },
    { id: 'room-warehouse', name: 'Warehouse', category: 'rooms', drawType: 'room', roomType: 'Warehouse', color: '#8b5cf6' },
    { id: 'room-corridor', name: 'Corridor', category: 'rooms', drawType: 'room', roomType: 'Corridor', color: '#6b7280' },
    { id: 'room-outdoor', name: 'Outdoor Area', category: 'rooms', drawType: 'room', roomType: 'Outdoor', color: '#10b981' },

    // Structure — Walls
    { id: 'wall-straight', name: 'Wall', category: 'structure', drawType: 'structure', shape: 'wall-straight', width: 1, height: 1, color: '#8B9DB0' },
    { id: 'wall-corner', name: 'Corner Wall', category: 'structure', drawType: 'structure', shape: 'wall-corner', width: 1, height: 1, color: '#8B9DB0' },
    { id: 'wall-glass', name: 'Glass Wall', category: 'structure', drawType: 'structure', shape: 'wall-glass', width: 1, height: 1, color: '#93C5FD' },
    { id: 'wall-end', name: 'Wall End Cap', category: 'structure', drawType: 'structure', shape: 'wall-end', width: 1, height: 1, color: '#8B9DB0' },

    // Structure — Doors
    { id: 'door-single', name: 'Door', category: 'structure', drawType: 'structure', shape: 'door-single', width: 1, height: 1, color: '#92400E' },
    { id: 'door-double', name: 'Double Door', category: 'structure', drawType: 'structure', shape: 'door-double', width: 2, height: 1, color: '#92400E' },
    { id: 'door-emergency', name: 'Emergency Exit', category: 'structure', drawType: 'structure', shape: 'door-emergency', width: 1, height: 1, color: '#DC2626' },
    { id: 'door-roller', name: 'Roller Shutter', category: 'structure', drawType: 'structure', shape: 'door-roller', width: 2, height: 1, color: '#6B7280' },

    // Structure — Lift / Elevator
    { id: 'lift-doors', name: 'Lift Doors', category: 'structure', drawType: 'structure', shape: 'lift-doors', width: 2, height: 1, color: '#475569' },
    { id: 'lift-shaft', name: 'Lift Shaft', category: 'structure', drawType: 'structure', shape: 'lift-shaft', width: 2, height: 2, color: '#334155' },

    // Structure — Staircases
    { id: 'stairs-straight', name: 'Staircase', category: 'structure', drawType: 'structure', shape: 'stairs-straight', width: 2, height: 3, color: '#78716C' },
    { id: 'stairs-l-turn', name: 'L-Turn Stairs', category: 'structure', drawType: 'structure', shape: 'stairs-l-turn', width: 3, height: 3, color: '#78716C' },
    { id: 'stairs-u-turn', name: 'U-Turn Stairs', category: 'structure', drawType: 'structure', shape: 'stairs-u-turn', width: 3, height: 4, color: '#78716C' },
    { id: 'ramp', name: 'Ramp', category: 'structure', drawType: 'structure', shape: 'ramp', width: 2, height: 3, color: '#6B7280' },

    // Furniture
    { id: 'desk', name: 'Desk', category: 'furniture', drawType: 'furniture', shape: 'desk', width: 2, height: 1, color: '#8B7355' },
    { id: 'chair', name: 'Chair', category: 'furniture', drawType: 'furniture', shape: 'chair', width: 1, height: 1, color: '#4B5563' },
    { id: 'shelving', name: 'Shelving Unit', category: 'furniture', drawType: 'furniture', shape: 'shelving', width: 2, height: 1, color: '#6B7280' },
    { id: 'cabinet', name: 'Cabinet', category: 'furniture', drawType: 'furniture', shape: 'cabinet', width: 1, height: 1, color: '#78716C' },
    { id: 'table-round', name: 'Round Table', category: 'furniture', drawType: 'furniture', shape: 'table-round', width: 1, height: 1, color: '#92400E' },
    { id: 'whiteboard', name: 'Whiteboard', category: 'furniture', drawType: 'furniture', shape: 'whiteboard', width: 2, height: 1, color: '#E5E7EB' },
    { id: 'sofa', name: 'Sofa', category: 'furniture', drawType: 'furniture', shape: 'sofa', width: 2, height: 1, color: '#374151' },

    // Equipment
    { id: 'workbench', name: 'Workbench', category: 'equipment', drawType: 'equipment', shape: 'workbench', width: 2, height: 1, color: '#78716C' },
    { id: 'oscilloscope', name: 'Oscilloscope', category: 'equipment', drawType: 'equipment', shape: 'oscilloscope', width: 1, height: 1, color: '#1F2937' },
    { id: '3d-printer', name: '3D Printer', category: 'equipment', drawType: 'equipment', shape: '3d-printer', width: 1, height: 1, color: '#1E40AF' },
    { id: 'charging-station', name: 'Charging Station', category: 'equipment', drawType: 'equipment', shape: 'charging-station', width: 1, height: 1, color: '#059669' },
    { id: 'computer-rack', name: 'Server Rack', category: 'equipment', drawType: 'equipment', shape: 'server-rack', width: 1, height: 1, color: '#111827' },
    { id: 'monitor-station', name: 'Monitor Station', category: 'equipment', drawType: 'equipment', shape: 'monitor', width: 1, height: 1, color: '#1F2937' },
    { id: 'tool-board', name: 'Tool Board', category: 'equipment', drawType: 'equipment', shape: 'tool-board', width: 1, height: 1, color: '#92400E' },

    // Machines
    { id: 'conveyor-belt', name: 'Conveyor Belt', category: 'machines', drawType: 'machine', shape: 'conveyor', width: 3, height: 1, color: '#4B5563' },
    { id: 'robotic-arm', name: 'Robotic Arm', category: 'machines', drawType: 'machine', shape: 'robotic-arm', width: 1, height: 1, color: '#F59E0B' },
    { id: 'pallet', name: 'Pallet', category: 'machines', drawType: 'machine', shape: 'pallet', width: 1, height: 1, color: '#92400E' },
    { id: 'storage-tank', name: 'Storage Tank', category: 'machines', drawType: 'machine', shape: 'tank', width: 2, height: 2, color: '#6B7280' },
    { id: 'safety-barrier', name: 'Safety Barrier', category: 'machines', drawType: 'machine', shape: 'barrier', width: 1, height: 1, color: '#EF4444' },
    { id: 'forklift', name: 'Forklift Area', category: 'machines', drawType: 'machine', shape: 'forklift', width: 1, height: 2, color: '#D97706' },

    // Decorations
    { id: 'plant-pot', name: 'Plant', category: 'decorations', drawType: 'decoration', shape: 'plant', width: 1, height: 1, color: '#22C55E' },
    { id: 'monitor-screen', name: 'Display Screen', category: 'decorations', drawType: 'decoration', shape: 'screen', width: 1, height: 1, color: '#3B82F6' },
    { id: 'sign-hazard', name: 'Hazard Sign', category: 'decorations', drawType: 'decoration', shape: 'hazard', width: 1, height: 1, color: '#EAB308' },
    { id: 'floor-marking', name: 'Floor Marking', category: 'decorations', drawType: 'decoration', shape: 'floor-mark', width: 1, height: 1, color: '#EAB308' },
    { id: 'trash-bin', name: 'Trash Bin', category: 'decorations', drawType: 'decoration', shape: 'bin', width: 1, height: 1, color: '#6B7280' },
    { id: 'fire-extinguisher', name: 'Fire Extinguisher', category: 'decorations', drawType: 'decoration', shape: 'extinguisher', width: 1, height: 1, color: '#EF4444' },
];

// Combine all non-room assets
export const ALL_ASSETS = [...ROBOT_ASSETS, ...ENVIRONMENT_ASSETS];

// Get assets by category
export function getAssetsByCategory(category) {
    if (category === 'robots') return ROBOT_ASSETS;
    return ENVIRONMENT_ASSETS.filter(a => a.category === category);
}

// Find asset by ID
export function getAssetById(id) {
    return ALL_ASSETS.find(a => a.id === id);
}
