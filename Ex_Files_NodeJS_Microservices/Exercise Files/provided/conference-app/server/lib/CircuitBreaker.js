const axios = require('axios');

// circuit breaker is a mechanism to handle when services fail by setting states and triggering state of request and services.
class CircuitBreaker {
    constructor() {
        this.states = {};
        this.cooldownPeriod = 10; //cool down period timer in seconds before next try
        this.failureThreshold = 5; //failure counter to trigger closing the circuit;
        this.requestTimeout = 0.3; //time to wait for request to return or to tell if it has failed after request exceeds this value.
    }

    async callService(requestOptions) {
        const endpoint = `${requestOptions.method}:${requestOptions.url}`;
        if (!this.canRequest(endpoint)) return false;
        requestOptions.timeout = this.requestTimeout * 1000;

        try {
            const response = await axios(requestOptions);
            this.onSuccess(endpoint)
            return response.data;
        } catch (error) {
            this.onFailure(endpoint);
            return false;
        }
    }

    //create a state object for an endpoint
    initState(endpoint) {
        this.states[endpoint] = {
            failures: 0,
            cooldownPeriod: this.cooldownPeriod,
            circuit: 'CLOSED',
            nextTry: 0
        }
    }

    // reset state on success 
    onSuccess(endpoint) { this.initState(endpoint) };

    // handle failed requests
    onFailure = (endpoint) => {
        const state = this.states[endpoint];
        state.failures += 1;
        if (state.failures > this.failureThreshold) {
            state.circuit = "OPEN";
            state.nextTry = Math.floor(new Date() / 1000) + this.cooldownPeriod;
            console.log(`Alert! Circut for endpoint ${endpoint} is OPEN`)
        }
    }

    //create a function to request if an endpoint circuit is closed
    canRequest = (endpoint) => {
        if (!this.states[endpoint]) this.initState(endpoint);
        const state = this.states[endpoint];
        const now = new Date() / 1000;
        if (state.circuit === 'CLOSED') return true;

        if (state.nextTry <= now) {
            state.circuit = 'HALF'
            return true;
        }
        return false;
    }

}

module.exports = CircuitBreaker;