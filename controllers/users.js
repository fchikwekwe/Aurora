/** User routes, profile and dashboard go here */

const User = require('../models/user');

// UPLOADING TO AWS S3
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');



module.exports = (app) => {
    // ROOT
    app.get('/users/edit', async (req, res) => {
        const currentUser = req.user;

        if (currentUser) {
            var user = User.findById(currentUser._id);
            console.log(user);
        }

        res.render('edit', { currentUser, user });
    });

    // UPDATE USER PROFILE
    app.put('/users/update', (req, res) => {
        const currentUser = req.user;
        if (currentUser) {
            User.findByIdAndUpdate(req.params.id)
                .then(() => {
                    res.redirect('/video')
                })
                .catch((err) => {
                    console.log(err.message);
                })
        } else {
            res.json('NOOO!')
        }

    })

    // POST IMAGE To AWS
    app.post('/users/image', async (req, res) => {
        const currentUser = req.user;

        if (currentUser) {
            var user = User.findById(currentUser._id);
            console.log(user);
        }

        if (!user.photo1) {
            var userPath = 'users/photo1';
        } else if (!user.photo2) {
            var userPath = 'users/photo2';
        } else if (!user.photo3) {
            var userPath = 'users/photo3';
        } else if (!user.photo4) {
            var userPath = 'users/photo4';
        }

        const client = new Upload(process.env.S3_BUCKET, {
            aws: {
                path: userPath,
                region: process.env.S3_REGION,
                acl: 'public-read',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            cleanup: {
                versions: true,
                original: true,
            },
            versions: [{
                maxWidth: 400,
                aspect: '16:10',
                suffix: '-square',
            }],
        });

        client.upload(req.src, {}, function(err, versions, meta) {
            if (err) { return res.status(400).send({ err }) };

            versions.forEach((image) => {
                const urlArray = image.url.split('-');
                urlArray.pop();
                const url = urlArray.join('-');

                if (!user.photo1) {
                    user.photo1 = url;
                } else if (!user.photo2) {
                    user.photo2 = url;
                } else if (!user.photo3) {
                    user.photo3 = url;
                } else if (!user.photo4) {
                    user.photo4 = url;
                } else {
                    res.json("You don't have any more space for photos. Please delete one to save a new photo.")
                }
                user.findByIdAndUpdate(user._id)
                    .then(() => {
                        res.json(user);
                    })
            });
            console.log(user);
            res.send({ user });
        })
    })

};
