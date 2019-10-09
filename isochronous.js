class Isochronous {
    constructor (...vargs) {
        this.interval = vargs.shift()

        this._skip = typeof vargs[0] == 'boolean' ? vargs.shift() : false

        this._stop = false

        this._f = vargs.shift()

        this._resolve = () => {}
        this._timeout = null
    }

    async start () {
        this._stop = false

        const now = Date.now()
        let scheduled = Math.floor(now / 1000) * 1000
        while ((scheduled + this.interval) < now) {
            scheduled += this.interval
        }

        const status = this.status = {
            scheduled: scheduled,
            interval: this.interval,
            previous: null,
            start: null,
            duration: null,
            skip: 0,
            iteration: 0
        }

        let difference = 0
        while (!this._stop) {
            if (difference != 0) {
                await new Promise(resolve => {
                    this._resolve = resolve
                    this._timeout = setTimeout(resolve, difference)
                })
                difference = 0
                continue
            }
            status.when = Date.now()
            await this._f.call(null, status)
            const now = Date.now()
            status.iteration++
            status.previous = {
                when: status.when,
                duration: now - status.when,
                skip: status.skip
            }
            status.skip = 0
            status.scheduled += status.interval
            difference = status.scheduled - now
            while (difference < 0) {
                if (this._skip) {
                    status.skip++
                    status.scheduled += status.interval
                    difference = status.scheduled - now
                } else {
                    difference = 0
                }
            }
        }
    }

    stop () {
        this._stop = true
        clearTimeout(this._timeout)
        this._resolve.call()
    }
}

module.exports = Isochronous
