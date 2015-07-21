require('proof')(5, require('cadence/redux')(prove))

function prove (async, assert) {
    var Isochronous = require('../..')

    function Service () {
    }

    var expected = {
        stats: {
            scheduled: 20000,
            start: 20004,
            duration: null,
            overflow: false,
            iteration: 0
        },
        message: 'initial stats',
        now: 25034
    }

    Service.prototype.serve = function (callback) {
        assert(isochronous.stats, expected.stats, expected.message)
        now = expected.now
        callback()
    }

    var service = new Service

    var now = 15301
    var _setTimeout = function (callback, when) {
        assert(when, 4699, 'initial timeout')
        _setTimeout = function (callback, when) {
            expected = {
                stats: {
                    scheduled: 25000,
                    start: 25043,
                    duration: 5030,
                    overflow: true,
                    iteration: 1
                },
                message: 'subsequent stats',
                now: now + 2340
            }
            now += 9
            assert(when, 0, 'overflow')
            _setTimeout = function (callback, when) {
                assert(when, 2626, 'final timeout')
                isochronous.stop()
            }
            callback()
        }
        now = 20004
        callback()
    }

    new Isochronous({
        operation: { object: service, method: 'serve' }
    })

    var isochronous = new Isochronous({
        interval: 5000,
        operation: { object: service, method: 'serve' },
        vargs: [],
        _setTimeout: function (callback, when) { _setTimeout(callback, when) },
        _Date: { now: function () { return now } }
    })

    isochronous.stop()

    async(function () {
        isochronous.run(async())
    })
}
