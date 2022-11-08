const semver = require("semver");
class ServiceRegistry {
	constructor(log) {
		this.log = log;
		this.services = {};
		this.timeout = 30;
	}

	// get a service
	get(name, version) {
		this.cleanup();
		const candidates = Object.values(this.services).filter(
			(service) =>
				service.name === name && semver.satisfies(service.version, version)
		);

		return candidates[Math.floor(Math.random() * candidates.length)];
	}

	// register a service
	register(name, version, ip, port) {
		this.cleanup();
		const key = name + version + ip + port;
		if (!this.services[key]) {
			this.services[key] = {
				name,
				version,
				ip,
				port,
				timestamp: Math.floor(new Date() / 1000),
			};
			this.log.debug(
				`Added Services ${name}, version ${version} running at ${ip}:${port}`
			);
			return key;
		}

		this.services[key].timestamp = Math.floor(new Date() / 1000);
		this.log.debug(
			`Updated Services ${name}, version ${version} running at ${ip}:${port}`
		);
		return key;
	}

	// unregister a service
	unregister(name, version, ip, port) {
		const key = name + version + ip + port;
		delete this.services[key];
		this.log.debug(
			`Unregistered Services ${name}, version ${version} running at ${ip}:${port}`
		);
		return key;
	}

	// cleanup on expire
	cleanup() {
		const now = Math.floor(new Date() / 1000);
		Object.keys(this.services).forEach((key) => {
			if (this.services[key].timestamp + this.timeout < now) {
				delete this.services[key];
				this.log.debug(`Service with key ${key} has expired`);
			}
		});
	}
}

module.exports = ServiceRegistry;
