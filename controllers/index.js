/** Root route and API routes go here */

require('@tensorflow/tfjs-node');

const faceapi = require('../public/js/face-api.js');
const canvas  = require('canvas');

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_URL = 'public/'

module.exports = (app) => {
    // ROOT
    app.get('/', (req, res) => {
        const currentUser = req.user;
        res.render('index', { currentUser });
    });

    // Camera route that renders central app
    app.get('/video', async (req, res) => {
        const currentUser = req.user;
        const emailSubject = 'Here is your Aurora Selfie!',
            emailBody = `
        Hi there!

        Here is the selfie that you asked for.

        Check us out again soon at auroramirror.com

        --Faith and Stephanie`,
            attachment = 'aurora_selfie.png',
            mailTo = 'mailto:?subject=' + emailSubject + '&body=' + emailBody + '?attach=' + attachment;

        try {
            const ssd = new faceapi.SsdMobilenetv1();
            const tiny = new faceapi.TinyFaceDetector();

            // console.log(faceapi.nets);
            await ssd.loadFromDisk(MODELS_URL);
            await tiny.loadFromDisk(MODELS_URL);

            // console.log(mailTo);
            res.render('facecam', { mailTo, currentUser });
        } catch (err) {
            console.log(err);
        }
    })
};
