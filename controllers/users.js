/** User routes, profile and dashboard go here */

const User = require('../models/user');

// UPLOADING TO AWS S3
const multer = require('multer');
const AWS = require('aws-sdk');

const Twitter = require('twitter');
const config = require('./config.js');
const T = new Twitter(config);

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

        // Get Base64 URL
        const base64 = req.body.img;

        // Get user object
        var user = await User.findById(currentUser._id);

        // Check for first available photo slot
        let userPhoto;
        if (!user.photo1) {
            userPhoto = '-photo1';
        } else if (!user.photo2) {
            userPhoto = '-photo2';
        } else if (!user.photo3) {
            userPhoto = '-photo3';
        } else if (!user.photo4) {
            userPhoto = '-photo4';
        }

        // Uploading Base64 code lines 66-91 with help from
        // https://medium.com/@mayneweb/upload-a-base64-image-data-from-nodejs-to-aws-s3-bucket-6c1bd945420f

        // AWS credentials
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION,
        });

        // Create an s3 instnce
        const s3 = new AWS.S3;

        // Regex to remove unnecessary parts of string
        const base64Data = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        // Regex to get file type
        const type = base64.split(';')[0].split('/')[1];

        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `${user.username}${userPhoto}.${type}`,
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: `image/${type}`,
        }

        s3.upload(params, async (err, data) => {
            // If there if a problem uploading the image, throw an error
            if (err) { return res.status(400).send({ err }) }

            // Check if the user has an empty slot for a photo
            if (user.photo1 == undefined || user.photo1 == null) {
                user.photo1 = data.Location;
            } else if (user.photo2 == undefined || user.photo2 == null) {
                user.photo2 = data.Location;
            } else if (user.photo3 == undefined || user.photo3 == null) {
                user.photo3 = data.Location;
            } else if (user.photo4 == undefined || user.photo4 == null) {
                user.photo4 = data.Location;
            } else {
                return res.json("You don't have any more space for photos. Please delete one to save a new photo.")
            }
            console.log("Image uploaded successfully!")
            console.log(user);
        })
        res.json(user);
    })

    // app.post('/users/twitter', async(req, res) => {
    //     T.post('/statuses/update')
    // })
};
