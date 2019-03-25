/** User routes, profile and dashboard go here */

// Import Models
const User = require('../models/user');
const Photo = require('../models/photo');

// UPLOADING TO AWS S3
const multer = require('multer');
const AWS = require('aws-sdk');

const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');

// Send Emails with NodeMailer
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const auth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.EMAIL_DOMAIN,
    }
}

const nodemailerMailgun = nodemailer.createTransport(mg(auth));


// Twitter package
const Twitter = require('twitter');
// Define Twitter credentials
const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    oauth_callback: process.env.OAUTH_CALLBACK,
})


module.exports = (app) => {
    // ROOT
    app.get('/users-edit', async (req, res) => {
        const currentUser = req.user;
        const editFailure = 'You need to be logged in to do that!'

        if (currentUser) {
            var user = await User.findById(currentUser._id);
            // console.log(user);
            return res.render('edit', { currentUser, user });
        }
        res.render('facecam', {
            editFailure
        })

    });

    // UPDATE USER PROFILE
    app.put('/users/update', (req, res) => {
        const currentUser = req.user;
        const updateFailure = 'You need to be logged in to do that!'
        console.log("REQ BODY", req.body);
        console.log("ID", req.params.id);

        if (currentUser) {
            User.findByIdAndUpdate(currentUser._id, req.body)
                .then((user) => {
                    res.redirect('/faceCam')
                })
                .catch((err) => {
                    console.log(err.message);
                })
        } else {
            res.render('facecam', {
                updateFailure
            })
        }

    })

    app.post('/users/email', async(req, res) => {
        const base64 = req.body.img;
        const email = req.body.email;
        const emailSuccess = "Your email was successfully sent!";
        const emailFailure = "There was a problem send your email."

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
            Key: `${email}-aurora_selfie.${type}`,
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: `image/${type}`,
        }

        s3.upload(params, async (err, data) => {
            nodemailerMailgun.sendMail({
                from: 'no-reply@auroramirror.com',
                to: 'faith.chikwekwe@students.makeschool.com',
                subject: "Here's your Aurora Selfie!",
                html: `
                <h1>Thanks for checking out Aurora!</h1>
                <a href="https://auroramirror.herokuapp.com/">
                Come back </a><p>to our website the next time you're doing your makeup!
                </p>
                <br>
                <a href=` + data.Location + `>Click here for your selfie<a/>
                `,
                attachments: {
                    filename: 'aurora_selfie.png',
                    content: base64Data
                }
            })
                .then((info) => {
                    // console.log('Response:' + info);
                    res.render('facecam', {
                        currentUser,
                        user,
                        emailSuccess
                    });
                })
                .catch((err) => {
                    // console.log('Error:' + err);
                    res.render('facecam', {
                        currentUser,
                        user,
                        emailFailure
                    });
                })
        })
    })

    // POST IMAGE To AWS
    app.post('/users/image', async (req, res) => {
        const currentUser = req.user;
        const imageSuccess = "Your selfie was successfully saved!"

        let rng = Math.floor((Math.random() * 999) + 100);
        console.log(rng);
        // const imageFailure = "There was a problem with saving your selfie."

        if (currentUser == undefined) {
            // save photo to cookie and then redirect back to save photo within login/signup route
            console.log("OH!")
            return res.redirect('/login-signup');
        } else {
            // Get Base64 URL
            const base64 = req.body.img;

            // Get user object
            var user = await User.findById(currentUser._id);

            // Check for first available photo slot
            let userPhoto;
            if (user.photo1 == undefined || user.photo1 == null) {
                userPhoto = '-photo1';
            } else if (user.photo2 == undefined || user.photo2 == null) {
                userPhoto = '-photo2';
            } else if (user.photo3 == undefined || user.photo3 == null) {
                userPhoto = '-photo3';
            } else if (user.photo4 == undefined || user.photo4 == null) {
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
                Key: `${user.username}${userPhoto}${rng}.${type}`,
                Body: base64Data,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: `image/${type}`,
            }

            s3.upload(params, async (err, data) => {
                let body;
                let photo;

                // If there if a problem uploading the image, throw an error
                if (err) { return res.status(400).send({ err }) }

                // Check if the user has an empty slot for a photo
                if (user.photo1 == undefined || user.photo1 == null) {
                    body = {
                        name: 'photo1',
                        user: user,
                        urlString: data.Location,
                        base64String: base64Data,
                    }
                    photo = await Photo.create(body);
                    await User.findByIdAndUpdate(user._id, { photo1: photo })
                } else if (user.photo2 == undefined || user.photo2 == null) {
                    body = {
                        name: 'photo2',
                        user: user,
                        urlString: data.Location,
                        base64String: base64Data,
                    }
                    photo = await Photo.create(body);
                    await User.findByIdAndUpdate(user._id, { photo2: photo })
                } else if (user.photo3 == undefined || user.photo3 == null) {
                    body = {
                        name: 'photo3',
                        user: user,
                        urlString: data.Location,
                        base64String: base64Data,
                    }
                    photo = await Photo.create(body);
                    await User.findByIdAndUpdate(user._id, { photo3: photo })
                } else if (user.photo4 == undefined || user.photo4 == null) {
                    body = {
                        name: 'photo4',
                        user: user,
                        urlString: data.Location,
                        base64String: base64Data,
                    }
                    photo = await Photo.create(body);
                    await User.findByIdAndUpdate(user._id, { photo4: photo })
                } else {
                    return res.json("You don't have any more space for photos. Please delete one to save a new photo.")
                }
            })
        }
        return res.json(user);
    })

    app.post('/users/twitter', async(req, res) => {
        const currentUser = req.user;
        const tweetSuccess = "Your tweet was successfully sent!"

        if (currentUser) {
            var user = await User.findById(currentUser._id).populate('photo1')
            console.log(user);
            // console.log("Facecam photo", user.photo1.name);
        }

        // get the base64Url of the photo from the client side via axios request
        let base64String = user.photo1.base64String;
        let tweet = 'Test tweet from my new app.';

        if (currentUser == undefined) {
            res.redirect('/login-signup');
        } else {
            client.post('/media/upload', base64String, (err, media, res) => {
                if (err) { return res.status(400).send({ err }) }
                console.log(media);
                client.post('/statuses/update', tweet, (err, tweet, res) => {
                    if (err) { return res.status(400).send({ err }) }
                    return res.render('facecam', {
                        currentUser,
                        user,
                        tweetSuccess,
                    })
                })

            })
        }

    })

    app.post('/users/loginTwitter', (req, res) => {
        const currentUser = req.user;
        const tweet = 'Test tweet from my new app.';

        if (currentUser == undefined) {
            res.redirect('/login-signup');
        } else {
            const oauth = OAuth({
                consumer: {
                    key: process.env.CONSUMER_KEY,
                    secret: process.env.CONSUMER_SECRET,
                },
                signature_method: 'HMAC-SHA1',
                hash_function(base_string, key) {
                    return crypto.createHmac('sha1', key).update(base_string).digest('key')
                }
            });

            const request_data = {
                url: 'https://api.twitter.com/oauth/request_token',
                method: 'POST',
                data: { status: tweet }
            }

            const token = {
                key: process.env.CONSUMER_KEY,
                secret: process.env.CONSUMER_SECRET,
            }

            request({
                url: request_data.url,
                method: request_data.method,
                form: oauth.authorize(request_data, token)
            }, (error, response, body) => {
                // const type = base64.split(';')[0].split('/')[1];
                // console.log(response)
                res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${response}`);
            })
        }
    })
};
