/** Root route and API routes go here */

require('@tensorflow/tfjs-node');

const faceapi = require('../public/js/face-api.js');
const canvas  = require('canvas');

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// const MODELS_URL = '/Users/faith1/code/courses/FaceSpace/';

const MODELS_URL = 'public'
module.exports = (app) => {
    // ROOT
    app.get('/', (req, res) => {
        res.render('index');
    });  

    // Camera route that renders central app
    app.get('/video', async (req, res) => {
        const ssd = new faceapi.SsdMobilenetv1();
        const tiny = new faceapi.TinyFaceDetector();

        // console.log(faceapi.nets);
        await ssd.loadFromDisk(MODELS_URL);
        await tiny.loadFromDisk(MODELS_URL);

        res.render('facecam');

    });
};
