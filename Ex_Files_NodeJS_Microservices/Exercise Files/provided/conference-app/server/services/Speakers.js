/* eslint-disable class-methods-use-this */
const { default: axios } = require("axios");

class SpeakersService {
	constructor({serviceRegistryUrl, serviceVersionIdentifier}) {
		this.serviceRegistryUrl = serviceRegistryUrl;
    this.serviceVersionIdentifier = serviceVersionIdentifier;
	}

  async getImages (path) {
    const { ip, port } = await this.getService("speakers-service");
		return this.callService({
			method: "get",
      responseType: 'stream',
			url: `http://${ip}:${port}/images/${path}`,
		});
  }

	async getNames() {
		const { ip, port } = await this.getService("speakers-service");
		return this.callService({
			method: "get",
			url: `http://${ip}:${port}/names`,
		});
	}

	async getListShort() {
		const { ip, port } = await this.getService("speakers-service");
		return this.callService({
			method: "get",
			url: `http://${ip}:${port}/list-short`,
		});
	}

	async getList() {
		const { ip, port } = await this.getService("speakers-service");
		return this.callService({
			method: "get",
			url: `http://${ip}:${port}/list`,
		});
	}

	async getAllArtwork() {
		const { ip, port } = await this.getService("speakers-service");
		return this.callService({
			method: "get",
			url: `http://${ip}:${port}/artworks`,
		});
	}

	async getSpeaker(shortname) {
		const { ip, port } = await this.getService("speakers-service");
		return this.callService({
			method: "get",
			url: `http://${ip}:${port}/speaker/${shortname}`,
		});
	}

	async getArtworkForSpeaker(shortname) {
		const { ip, port } = await this.getService("speakers-service");
		return this.callService({
			method: "get",
			url: `http://${ip}:${port}/artworks/${shortname}`,
		});
	}

	async getService(servicename) {
		const response = await axios.get(
			`${this.serviceRegistryUrl}/find/${servicename}/${this.serviceVersionIdentifier}`
		);
		return response.data;
	}

	async callService(serviceoptions) {
		const response = await axios(serviceoptions);
		return response.data;
	}
}

module.exports = SpeakersService;
