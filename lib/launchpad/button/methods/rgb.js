/*
	Module: Launchpad RGB button methods
	Description: Methods for RGB color capable Launchpad devices' buttons
	TODO: add channels and note on messages
*/


module.exports = {
	// Color
	light(color) {
		// Normalize
		color = this.device.constructor.normalizeColor(color);

		// Save
		this.color = color;

		// Send
		if (Array.isArray(color)) {
			// RGB
			this.device.sendSysEx([11, this.note, ...color]);
		} else if (typeof color === "number") {
			// Basic
			this.device.sendSysEx([10, this.note, color]);
		}

		// Method chaining
		return this;
	},
	dark() {
		return this.light("off");
	},
	// Flashing
	flash(color) {
		// Normalize
		color = this.device.constructor.normalizeColor(color);

		// Save
		this.flash = color;

		// Send
		if (Array.isArray(color)) {
			// RGB
			// TODO: polyfill by using _color, midi-clock, and light
			throw new TypeError("Flashing can't be used with an RGB color via MIDI.");
		} else if (typeof color === "number") {
			// Basic
			this.device.sendSysEx([35, 0, this.note, color]);
		}

		// Method chaining
		return this;
	},
	stopFlash() {
		return this.flash("off");
	},
	// Pulsing
	pulse(color) {
		// Normalize
		color = this.device.constructor.normalizeColor(color);

		// Save
		this.pulse = color;

		// Send
		if (Array.isArray(color)) {
			// RGB
			throw new TypeError("Pulsing can't be used with an RGB color via MIDI.");
		} else if (typeof color === "number") {
			// Basic
			this.device.sendSysEx([40, 0, this.note, color]);
		}

		// Method chaining
		return this;
	},
	stopPulse() {
		return this.pulse("off");
	},


	// Getter and setter properties
	"__properties__": {
		"color": {
			set(color) {
				this._color = color;
				this._flash = 0;
				this._pulse = 0;
			},
			get() {
				return this._color || 0;
			}
		},
		"flash": {
			set(color) {
				this._flash = color;
				this._pulse = 0;
			},
			get() {
				return this._flash || 0;
			}
		},
		"pulse": {
			set(color) {
				this._color = 0;
				this._flash = 0;
				this._pulse = color;
			},
			get() {
				return this._pulse || 0;
			}
		}
	}
};