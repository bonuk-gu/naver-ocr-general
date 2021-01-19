const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api/hand_photo',
        proxy({
            target: 'http://localhost:5000',
            changeOrigin: true
        })
    );
};