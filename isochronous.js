var Operation = require('operation')
var cadence = require('cadence/redux')

function Isochronous (options) {
    this._interval = options.interval || 1000
    this._operation = new Operation(options.operation)
    this._setTimeout = options._setTimeout || setTimeout
    this._Date = options._Date || Date
}

Isochronous.prototype._wait = function (stats, now, callback) {
    var delay = stats.scheduled - now
    if (stats.overflow = delay < 0) {
        delay = 0
    }
    this._timeout = (this._setTimeout)(this._callback = callback, delay)
}

Isochronous.prototype.run = cadence(function (async) {
    this._stop = false

    var now = (this._Date).now()
    var stats = {
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
                return [ loop ]
            }
        }
        var loop = async(function () {
            this._callback = null
        }, cancel, function () {
            stats.start = (this._Date).now()
            this._operation.apply([ stats ].concat(async()))
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
