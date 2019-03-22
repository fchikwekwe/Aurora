/** User routes, profile and dashboard go here */

const User = require('../models/user');

module.exports = (app) => {
    // ROOT
    app.get('/users/edit', async (req, res) => {
        const currentUser = req.user;

        if (currentUser) {
            var user = await User.findById(currentUser._id);
            console.log(user);
        }

        res.render('edit', { currentUser, user });
    });

    // UPDATE USER PROFILE
    app.put('/users/update', (req, res) => {
        const currentUser = req.user;

        if (currentUser) {
            User.findByIdAndUpdate(req.params.id)
                .then((user) => {
                    res.redirect('/video')
                })
                .catch((err) => {
                    console.log(err.message);
                })
        } else {
            res.json()
        }

    })

    // POST IMAGE To AWS
    app.post('/users/image', async (req, res) => {
        const currentUser = req.user;
        if (currentUser) {
            var user = await User.findById(req.params.id);
        }
        client.upload(req.file.path, {}, function(err, versions, meta) {
            if (err) { return res.status(400).send({ err }) };

            version.forEach((image) => {
                const urlArray = image.url.split('-');
                urlArray.pop();
                const url = urlArray.join('-');
                if (!photo1) {
                    user.photo1 = url;
                } else if (!photo2) {
                    user.photo2 = url;
                } else if (!photo3) {
                    user.photo3 = url;
                }
            })
        })
    })

};
