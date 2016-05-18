var Operation = require('operation')
var cadence = require('cadence')

// TODO Feel like there should be an option to have regular intervals that you
// try to hit, which means skipping them if you've taken too long, and
// alternatively an interval between completion.

function Isochronous (options) {
    this._interval = options.interval || 1000
    this._unref = options.unref || false
    this._operation = new Operation(options.operation)
    // TODO remove underbars, this is a public feature.
    // TODO It is‽
    this._setTimeout = options._setTimeout || setTimeout
    this._Date = options._Date || Date
}

Isochronous.prototype._wait = function (stats, now, callback) {
    var delay = stats.scheduled - now
    if (stats.overflow = delay < 0) {
        delay = 0
    }
    this._timeout = this._setTimeout.call(null, this._callback = callback, delay)
    if (this._unref) {
        this._timeout.unref()
    }
}

Isochronous.prototype.run = cadence(function (async) {
    this._stop = false

    var now = (this._Date).now()
    var stats = this.stats = {
        scheduled: (Math.floor(now / 1000) * 1000) + this._interval,
        start: null,
        duration: null,
        overflow: false,
        iteration: 0
    }

    async(function () {
        this._wait(stats, now, async())
    }, function () {
        function cancel () {
            if (this._stop) {
                return [ loop.break ]
            }
        }
        var loop = async(function () {
            this._callback = null
        }, cancel, function () {
            stats.start = (this._Date).now()
            this._operation.apply([ async() ])
        }, cancel, function () {
            stats.iteration++

            var now = (this._Date).now()

            stats.duration = now - stats.start
            stats.scheduled = stats.scheduled + this._interval

            this._wait(stats, now, async())
        })()
    })
})

Isochronous.prototype.stop = function () {
    this._stop = true
    var callback
    if (callback = this._callback) {
        clearTimeout(this._timeout)
        callback()
    }
}

module.exports = Isochronous
