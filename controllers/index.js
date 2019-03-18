/** Root route and API routes go here */

module.exports = (app) => {
    // ROOT
    app.get('/', (req, res) => {
        res.render('index');
    });

    // Camera route that renders central app
    app.get('/camera', (req, res) => {
        res.render('camera');
    });
};
