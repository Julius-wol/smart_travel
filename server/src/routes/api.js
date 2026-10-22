const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Chào mừng đến với Smart Travel API v1!',
        version: '1.0'
    });
});

module.exports = router;
