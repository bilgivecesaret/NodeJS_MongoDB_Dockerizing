const express = require('express');
const router = express.Router();
const {HTTP_CODES} = require('../config/Enum');
const emitter = require('../lib/Emitter');

emitter.addEmitter('notifications');

router.get('/', async (req, res) => {

    res.writeHead(HTTP_CODES.OK, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
    });

    const listener = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    emitter.getEmitter('notifications').on('message', listener);

    req.on('close', () => {
        emitter.getEmitter('notifications').off('message', listener);
    });
});

module.exports = router;