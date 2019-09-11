describe('isochronous', () => {
    const delay = require('delay')
    const assert = require('assert')
    it('can skip', async () => {
        const test = []
        const Isochronous = require('../isochronous')
        let count = 0
        const now = Date.now()
        const start = Math.floor((now + 1000) / 1000) * 1000 + 150
        console.log(now, start)
        await delay(start - now)
        console.log(Date.now())
        const isochronous = new Isochronous(100, true, async () => {
            console.log(isochronous.status)
            count++
            if (count == 1) {
                console.log('>>>', count)
                await delay(121)
                console.log('>>>', count)
            }
            if (count == 2) {
                assert.equal(isochronous.status.skip, 1, 'skipped')
                isochronous.stop()
            }
        })
        await isochronous.start()
    })
    it('can race', async () => {
        const test = []
        const Isochronous = require('../isochronous')
        let count = 0
        const now = Date.now()
        const start = Math.floor((now + 1000) / 1000) * 1000 + 50
        console.log(now, start)
        await delay(start - now)
        console.log(Date.now())
        const isochronous = new Isochronous(100, async () => {
            console.log(isochronous.status)
            count++
            if (count == 1) {
                await delay(121)
            }
            if (count == 2) {
                assert.equal(isochronous.status.skip, 0, 'raced')
                isochronous.stop()
            }
        })
        await isochronous.start()
    })
})
