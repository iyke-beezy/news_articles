const express = require("express");
const ServiceRegistry = require("./lib/ServiceRegistry");
const service = express();
// const ServiceRegistry = require('./ServiceRegistry');

module.exports = (config) => {
	const log = config.log();
	const serviceRegistry = new ServiceRegistry(log);
	// Add a request logging middleware in development mode
	if (service.get("env") === "development") {
		service.use((req, res, next) => {
			log.debug(`${req.method}: ${req.url}`);
			return next();
		});
	}

	// create an endpoint for service to register itself with the name, service version and port
	// register service
	service.put(
		"/register/:servicename/:serviceversion/:serviceport",
		(req, res) => {
			const { servicename, serviceport, serviceversion } = req.params;
			// check if req ip is ipv6 and set service ip accordingly
			const serviceip = req.socket.remoteAddress.includes("::")
				? `[${req.socket.remoteAddress}]`
				: req.socket.remoteAddress;

			const servicekey = serviceRegistry.register(
				servicename,
				serviceversion,
				serviceip,
				serviceport
			);
			return res.json({ result: servicekey });
		}
	);
	// delete service
	service.delete(
		"/register/:servicename/:serviceversion/:serviceport",
		(req, res) => {
			const { servicename, serviceport, serviceversion } = req.params;
			// check if req ip is ipv6 and set service ip accordingly
			const serviceip = req.socket.remoteAddress.includes("::")
				? `[${req.socket.remoteAddress}]`
				: req.socket.remoteAddress;

			const servicekey = serviceRegistry.unregister(
				servicename,
				serviceversion,
				serviceip,
				serviceport
			);
			return res.json({ result: servicekey });
		}
	);
	// retrieve service
	service.get("/find/:servicename/:serviceversion", (req, res, next) => {
		const { servicename, serviceversion } = req.params;
		const svc = serviceRegistry.get(servicename, serviceversion);
		if (!svc) return res.status(404).json({ result: "Service not found" });
		return res.json(svc);
	});

	// eslint-disable-next-line no-unused-vars
	service.use((error, req, res, next) => {
		res.status(error.status || 500);
		// Log out the error to the console
		log.error(error);
		return res.json({
			error: {
				message: error.message,
			},
		});
	});
	return service;
};
