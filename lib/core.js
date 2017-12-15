/*
	Module: Core
	Description: Basic features to find and use MIDI devices
*/
/*
	Module dependencies
*/
// MIDI
const midi = require("midi");
// Support
const support = require("./support.js");


module.exports = {
	// Normalize ports
	normalizePorts(ports) {
		if (ports.length === 2 && typeof ports[0] === "number" && typeof ports[1] === "number") {
			return {
				"input": ports[0],
				"output": ports[1]
			};
		} else {
			const first = ports[0];

			switch (typeof first) {
				case "number": {
					return {
						"input": first,
						"output": first
					};
				}
				case "object": {
					if (Array.isArray(first)) {
						return {
							"input": first[0],
							"output": first[1]
						};
					} else {
						// first ~= {input, output}
						return first;
					}
				}
				case "undefined": {
					return false;
				}
				default: {
					throw new TypeError("Invalid port type.");
				}
			}
		}
	},


	// Get MIDI I/O
	createMidiIO() {
		try {
			const data = {};
			// Gets a MIDI input
			data.input = new midi.input();
			// Gets a MIDI output
			data.output = new midi.output();

			return data;
		} catch (error) {
			throw new Error("Couldn't create MIDI I/O.\n\n" + error);
		}
	},


	// Gets the first port that match the given pattern
	getFirstMatchingPort(port, pattern) {
		const names = this.getAllPortNames(port);

		// For all ports in input/output
		for (let i = 0; i < names.length; i++) {
			if (names[i].match(pattern)) {
				return i;
			}
		}

		throw new Error("Failed to find a matching port.");
	},
	// Gets the first device with ports that match the given pattern
	getFirstMatchingDevicePorts(inputPort, outputPort, pattern) {
		// Get the first input port that matches the pattern (regex or otherwise)
		const input = this.getFirstMatchingPort(inputPort, pattern);
		// Get the first output port that matches the input port string
		const output = this.getFirstMatchingPort(outputPort, this.getPortName(inputPort, input));

		return {input, output};
	},
	// Gets the first supported device's ports
	getFirstSupportedDevice(inputPort, outputPort) {
		return this.getFirstMatchingDevicePorts(inputPort, outputPort, support.regex);
	},


	// Alias for port.getPortCount
	getPortCount(port) {
		return port.getPortCount();
	},


	// Get a port's name
	getPortName(port, num) {
		// Get name from node-midi
		const name = port.getPortName(num);
		// Return the port name with the port number at the end removed
		return name.match(/(.+)(?:\s+\d*)$/i)[1];
	},
	// Get all existing port names
	getAllPortNames(port) {
		const portCount = this.getPortCount(port);
		const names = [];

		for (let i = 0; i < portCount; i++) {
			names.push(this.getPortName(port, i));
		}

		return names;
	},
	// Get a name that matches a type name based off a device's port names
	getDeviceName(inputPort, outputPort, inputNum, outputNum) {
		let name;
		const inputName = this.getPortName(inputPort, inputNum);
		const outputName = this.getPortName(outputPort, outputNum);

		// If the input's name and output matches (setting name to the input's)
		if ((name = inputName) === outputName) {
			return name;
		} else {
			throw new Error(`Your device's output port's name doesn't match your input port's name (${name}).`);
		}
	}
};