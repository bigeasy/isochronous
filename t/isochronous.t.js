require('proof')(5, require('cadence')(prove))

function prove (async, assert) {
    var Isochronous = require('..')

    function Service () {
    }

    var expected = {
        stats: {
            scheduled: 15000,
            start: 15500,
            duration: null,
            overflow: true,
            iteration: 0
        },
        message: 'initial stats',
        now: 15600
    }

    Service.prototype.serve = function (callback) {
        assert(isochronous.stats, expected.stats, expected.message)
        now = expected.now
        callback()
    }

    var service = new Service

    var now = 15301
    var _setTimeout = function (callback, when) {
        assert(when, 0, 'initial timeout')
        _setTimeout = function (callback, when) {
            now += when + 100
            expected = {
                stats: {
                    scheduled: 20000,
                    start: 20100,
                    duration: 100,
                    overflow: false,
                    iteration: 1
                },
                message: 'subsequent stats',
                now: now + 200
            }
            assert(when, 4400, 'overflow')
            _setTimeout = function (callback, when) {
                assert(when, 4700, 'final timeout')
                isochronous.stop()
            }
            callback()
        }
        now = 15500
        callback()
    }

    var isochronous = new Isochronous(service, 'serve', {
        interval: 5000,
        _setTimeout: function (callback, when) { _setTimeout(callback, when) },
        _Date: { now: function () { return now } }
    })

    isochronous.stop()

    async(function () {
        isochronous.run(async())
    }, function () {
        var isochronous = new Isochronous(function (callback) {
            callback()
        }, {
            interval: 100,
            unref: true
        })
        isochronous.run(async())
        async(function () {
            setTimeout(async(), 250)
        }, function () {
            isochronous.stop()
        })
    })
}
