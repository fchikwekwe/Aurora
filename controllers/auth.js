/** Auth routes go here */

const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (app) => {
    // LOGIN AND SIGN-UP GET
    app.get('/login-signup', (req, res) => {
        const currentUser = req.user;
        const info = {};
        res.render('login-signup', { currentUser, info });
    });

    // SIGN-UP POST; right now can only use username or email for sign-up
    app.post('/sign-up', async (req, res) => {
        let user;
        try {
            user = new User(req.body);
            console.log(user);
            await user.save();
            // res.redirect

            let token;
            token = await jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: '60 days' });
            res.cookie('faceToken', token, {
                maxAge: 900000,
                httpOnly: true
            });
            console.log("It worked!");
            res.redirect('/faceCam');
        } catch (err) {
            const currentUser = req.user;
            const info = { ...req.body };
            if (err.name == 'ValidationError') {
                return res.render('login-signup', {
                    info,
                    err: err.message,
                    currentUser
                });
            } else if (err.code == 11000) {
                const message = "Your username or email address is already in use. Use the toggle above to login instead."
                return res.render('login-signup', {
                    info,
                    err: message,
                    currentUser
                })
            }
            console.log("ERR NAME", err.name)
            console.log(err);
        }
    });

    app.post('/login', async (req, res) => {
        const {
            username, email, password
        } = req.body;
        // Find this username
        const user = await User.findOne({ username }, 'username password');
        if (!user) {
            const user = await User.findOne({ email }, 'username password');
            if (!user) {
                return res.status(401).send({
                    message: 'Did you sign up? Wrong username or password!'
                });
            }
        }
        user.comparePassword(password, (err, isMatch) => {
            if (!isMatch) {
                return res.status(401).send({
                    message: 'Password is not valid!'
                });
            } else {
                // console.log(user, "successfully logged in!")
            }
            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username
                },
                process.env.SECRET,
                {
                    expiresIn: '60 days'
                }
            );
            res.cookie('faceToken', token, {
                maxAge: 900000,
                httpOnly: true
            });
            return res.redirect('/faceCam');
        });
    });

    // LOGOUT
    app.get('/logout', (req, res) => {
        res.clearCookie('faceToken');
        res.redirect('/');
    });
};
