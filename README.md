# Robot Sims — Virtual Robotics Lab Builder

**Robot Sims** is a web-based, isometric virtual lab builder inspired by the Sims. It allows universities and companies to design their own virtual labs or factories and add representations of their real-world robots.

This project is built directly with HTML5 Canvas, Vanilla JS, and Vanilla CSS, requiring no build tools or package managers.

## Features

- **Isometric Grid Building**: Procedural rendering of an isometric tile grid.
- **Room & Structure Drafting**: Click and drag to create rooms of various types (Lab, Office, Factory, Storage, etc.). Place walls, doors, stairs, and lifts.
- **Asset Library**:
  - **Robots**: Place various types of robots (UGV, AMR, Quadruped, Humanoid, Cobot, Sensor).
  - **Furniture & Equipment**: Outfit your lab with desks, racks, workstations, and domain-specific equipment.
  - **Structures**: Glass walls, double doors, emergency exits, and more.
- **Interactive Robot Fleet Management**:
  - **Select & Move**: Select a robot and use the D-Pad or arrow keys to drive it around the lab. The robot sprites dynamically flip based on orientation.
  - **Detailed Profiles**: Click on a robot to see its status, location, maintenance logs, upcoming bookings, and warranty information.
  - **RPG-Style Leveling**: Robots earn XP and level up through check-ins and property updates.
  - **Cybersecurity Tracking**: Manage the security status of each robot (Offline, Online, Remote Enabled, Autodiscovery Protected).
  - **Character Sheets**: Define the physical specifications of each robot, such as weight, speed, battery runtime, and staircase traversal ability.
- **Persistence**: Your entire lab layout and robot fleet data are automatically saved to `localStorage`, allowing you to resume your work upon returning. Export/Import functionality for `.robosim` files.

## Tech Stack

- **HTML5**: Standard structure and layout.
- **CSS3 / Vanilla CSS**: Built with a sleek, dark-themed, glassmorphism UI. CSS grids, flexbox, and custom properties (variables) are heavily utilized.
- **Vanilla JavaScript (ES6 Modules)**: Complete state management, rendering loops, and user interaction logic without external frameworks.

## Getting Started

1. Clone this repository.
2. Serve the directory using any local web server. For example:
   ```bash
   npx serve .
   # or
   python -m http.server
   ```
3. Open your browser to the local server address (e.g., `http://localhost:3000` or `http://localhost:8000`).

## File Overview

- `index.html`: Entry point, UI skeleton, and asset library definitions.
- `index.css`: Global styles, themes, and UI components.
- `js/main.js`: Bootstrapper and main application controller.
- `js/isometric-engine.js`: Handles all Canvas rendering, depth sorting, grid math, and visual asset drawing.
- `js/ui-manager.js`: Manages interaction states (Place, Select, Draw Room), keyboard shortcuts, D-Pad movement, and UI events.
- `js/room-manager.js`: State management and geometric logic for drawn rooms.
- `js/robot-manager.js`: Fleet data, XP leveling system, character sheets, and simulated mock data generation.
- `js/robot-detail-panel.js`: Renders the sliding side-panel with comprehensive robot profiles.

## Developer Note

This is a frontend-focused initial version. Future plans include moving the persistence layer to an Autodiscovery-hosted Linux server using a Python (FastAPI/Flask) backend, enabling user registration and cloud saves.
