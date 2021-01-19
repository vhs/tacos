import CustomLogger from '../../lib/custom-logger'

var log = new CustomLogger('tacos:services:statemachine')

const EventEmitter = require('events')

class Emitter extends EventEmitter { }

class StateMachine {
    consumers
    store

    constructor() {
        this.store = {}
        this.consumers = new Emitter()
        this.defaultTopic = 'state'

        setInterval(() => {
            log.debug('stateMachine', 'store', this.store)
            log.debug('stateMachine', 'listenerCount', this.consumers.listenerCount())
        }, 15000)
    }

    fetch(topic, defaultVal) {
        return (this.store.state[topic] !== undefined) ? { [topic]: this.store.state[topic] } : { [topic]: defaultVal || null }
    }

    pub(topic, args) {
        if (typeof topic !== 'string') {
            args = topic
            topic = this.defaultTopic
        }

        if (this.store[topic] === undefined) this.store[topic] = {}

        let updateObj = false

        log.debug('stateMachine', 'pub', topic, args, typeof args)

        let emit = false

        if (Array.isArray(args)) {
            updateObj = []

            for (let updateKey in args)
                if (this.store[topic][updateKey] === undefined || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(args[updateKey]))
                    updateObj[updateKey] = args[updateKey]

            if (updateObj.length > 0) {
                this.store[topic] = [...this.store[topic], ...updateObj]
                emit = true
            }
        } else if (typeof args === 'object') {
            updateObj = {}
            for (let updateKey in args)
                if (this.store[topic][updateKey] === undefined || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(args[updateKey]))
                    updateObj[updateKey] = args[updateKey]

            if (typeof updateObj === 'object' && Object.keys(updateObj).length > 0) {
                this.store[topic] = { ...this.store[topic], ...updateObj }
                emit = true
            }
        } else {
            if (this.store[topic] !== args) {
                updateObj = args
                this.store[topic] = updateObj
                emit = true
            }
        }

        if (emit) {
            log.debug('stateMachine', 'pub', 'emit', topic, updateObj)
            this.consumers.emit(topic, updateObj)
            if (topic === this.defaultTopic) {
                log.debug('stateMachine', 'pub', 'defaulttopic match:', updateObj)
                Object.entries(updateObj).forEach(([stateKey, stateVal]) => this.consumers.emit(stateKey, { [stateKey]: stateVal }))
            }
        }
    }

    sub(topic, handler) {
        if (typeof topic === 'function') {
            handler = topic
            topic = this.defaultTopic
        }

        topic = (topic) ? topic : this.defaultTopic
        return this.consumers.on(topic, handler)
    }

    unsub(topic, handler) {
        if (typeof topic === 'function') {
            handler = topic
            topic = this.defaultTopic
        }

        topic = (topic) ? topic : this.defaultTopic
        return this.consumers.off(topic, handler)
    }

    attach(topic, handler) {
        return this.sub(topic, handler)
    }
}

const stateMachine = new StateMachine();

stateMachine.sub((args) => {
    log.debug('stateMachine', 'state update issued for:', args);
})

// stateMachine.pub({ init: 'ok' });
stateMachine.pub('init', 'ok');

export default stateMachine 