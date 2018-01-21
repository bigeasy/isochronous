var cadence = require('cadence')
var coalesce = require('extant')
var Operation = require('operation/variadic')

// TODO Feel like there should be an option to have regular intervals that you
// try to hit, which means skipping them if you've taken too long, and
// alternatively an interval between completion.

function Isochronous () {
    var vargs = Array.prototype.slice.call(arguments)
    this._operation = new Operation(vargs)
    var options = coalesce(vargs.shift(), {})
    if (typeof options == 'number') {
        options = { interval: options }
    }
    this._interval = coalesce(options.interval, 1000)
    this._unref = coalesce(options.unref, false)
    // TODO remove underbars, this is a public feature.
    // TODO It is‽
    this._setTimeout = coalesce(options._setTimeout, setTimeout)
    this._Date = coalesce(options._Date, Date)
}

Isochronous.prototype._wait = function (stats, now, callback) {
    var delay = stats.scheduled - now
    if (stats.overflow = delay < 0) {
        delay = 0
    }
    this._timeout = this._setTimeout.call(null, this._callback = callback, delay)
    if (this._unref && delay != 0) {
        this._timeout.unref()
    }
}

Isochronous.prototype.run = cadence(function (async) {
    this._stop = false

    var now = (this._Date).now()
    var stats = this.stats = {
        scheduled: (Math.floor(now / 1000) * 1000),
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
            this._operation.call(null, async())
        }, cancel, function () {
            stats.iteration++

            var now = (this._Date).now()

            stats.duration = now - stats.start
// TODO Need to advance if updated scheudled is in the past.
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
