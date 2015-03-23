# ptpjs
Prototype Platformer JS

PTP JS is a platformer made with pixi.js and javascript. It can run in the browser or through node-webkit. Utilities for bundling resources are provided and require node.js to run.

The platformer can be used as a framework, with fejs handling core functions.

# Main Features
* Entity System - Provides a clean way to add functionality to entities and manage entities and their components.
* Scripting System - A scripting interface is provided and can be easily extended. Scripting is used for creating abilities, AI, level logic, and more. Events are used to fire off scripts.
* Graphics Scale - Graphics can be easily scaled without affecting game logic.
* Input - Gamepad support, keyboard support, and mouse support is easily mapped. Multiple bindings can be set to a hotkey by name.
* Tiled Support - The TMX file format is supported, no need to convert to another format before use.
