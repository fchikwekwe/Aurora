/** User routes, profile and dashboard go here */
const User = require('../models/user');

module.exports = (app) => {
    // ROOT
    app.get('/dashboard', (req, res) => {
        res.render('dashboard');
    });
};
