/*
	Module: Launchpad MK2
	Description: Class for the Launchpad MK2 device
*/
/*
	Module dependencies
*/
const _ = require("lodash");
const mixin = require("../mixin.js");
const Device = require("../device.js");


/*
	Launchpad MK2 Class
*/
class LaunchpadMk2 extends Device {
	constructor() {
		// Device, EventEmitter
		super(...arguments);
	}


	// Full reset
	// The MK2 ignores all reset commands from the MIDI spec I tested and
	// doesn't document their own in the reference so...
	reset() {
		this.clock.reset();
		this.layout.reset();
		this.marquee.reset();
		this.light.reset();

		// Method chaining
		return this;
	}


	// Layouts regex and channels (to allow config of user 1 and 2)
	get layouts() {
		return Object.defineProperty(this, "layouts", {
			"value": [
				{
					"regex": /Session|Default/i,
					"channel": 1
				},
				{
					"regex": /User 1|Drum|Rack/i,
					"channel": 6
				},
				{
					"regex": /User 2/i,
					"channel": 14
				},
				{
					"regex": /Reserved|Ableton|Live/i,
					"channel": 1
				},
				{
					"regex": /Volume|^Fader$/i,
					"channel": 1
				},
				{
					"regex": /Pan/i,
					"channel": 1
				}
			]
		}).layouts;
	}


	// Button values smart getter
	static get values() {
		const values = [];
		const range = _.range(0, 8);

		// Grid and Right
		const rightNames = ["record arm", "solo", "mute", "stop", "send b", "send a", "pan", "volume"];
		for (const y of range) {
			for (const x of range) {
				// Quadrant
				let quadrant = 0;
				if (x > 3) {
					quadrant += 1;
				}
				if (y > 3) {
					quadrant += 2;
				}

				// Push to values
				values.push({
					"status": "note on",
					"group": "grid",
					"column": x,
					"row": y,
					quadrant,
					"note": new Proxy({}, {
						get(target, property) {
							if (property === "1") {
								// Note for layouts[1]
								return 36 + (4 * y) + x + (x <= 3 ? 0 : 28);
							} else {
								// Default
								return (10 * y) + x + 11;
							}
						}
					})
				});
			}

			// Right
			values.push({
				"name": rightNames[y],
				"group": "right",
				"status": "note on",
				"column": 8,
				"row": y,
				"note": new Proxy({}, {
					get(target, property) {
						if (property === "1") {
							// Note for layouts[1]
							return 100 + y;
						} else {
							// Default
							return (10 * y) + 19;
						}
					}
				})
			});
		}

		// Top
		const topNames = ["up", "down", "left", "right", "session", "user 1", "user 2", "mixer"];
		for (const x of range) {
			values.push({
				"name": topNames[x],
				"group": "top",
				"status": "control change",
				"column": x,
				"row": 8,
				"note": new Proxy({}, {
					get() {
						// Default
						return 104 + x;
					}
				})
			});
		}

		delete this.values;
		return this.values = values;
	}
}


/*
	SysEx information
*/
LaunchpadMk2.sysex = {
	get prefix() {
		delete this.prefix;
		return this.prefix = this.manufacturer.concat(this.model);
	},
	// SysEx Manufacturer ID for Focusrite/Novation
	// https://www.midi.org/specifications/item/manufacturer-id-numbers
	"manufacturer": [0, 32, 41],
	// Model information used in SysEx messages
	"model": [
		// Product type
		2,
		// Product number
		24
	]
};


/*
	Device type
*/
// Device type name, key for `rocketry.devices`, etc
LaunchpadMk2.type = "Launchpad MK2";


/*
	Mixins
*/
// key => location
// value => arguments such as "sub-mixins"
LaunchpadMk2.mixins = {
	// Instance and static methods
	"rgb-color": [],
	"marquee": [],
	"clock": [],
	"layout": [],
	"inquiry": [],
	"query": [],
	"fader": [],
	// Button mixin and its own mixins
	"button": [
		["rgb-color"]
	]
};
// Instance, static methods, Button
for (const key in LaunchpadMk2.mixins) {
	const args = LaunchpadMk2.mixins[key];
	mixin(LaunchpadMk2, `./launchpad/mixins/${key}.js`, ...args);
}


module.exports = LaunchpadMk2;