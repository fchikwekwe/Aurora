/** Root route and API routes go here */

require('@tensorflow/tfjs-node');

const faceapi = require('../public/js/face-api.js');
const canvas  = require('canvas');
// const fetch = require('node-fetch');
// const path = require('path');

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
// faceapi.env.monkeyPatch({ fetch: fetch });

const MODELS_URL = '/Users/faith1/code/courses/FaceSpace/public/weights/';

module.exports = (app) => {
    // ROOT
    app.get('/', (req, res) => {
        res.render('index');
    });

    // Camera route that renders central app
    app.get('/camera', (req, res) => {
        res.render('camera');
    });

    // Camera route that renders central app
    app.get('/video', async (req, res) => {
        const tiny = new faceapi.TinyFaceDetector();
        const ssd = new faceapi.SsdMobilenetv1();
        // console.log(faceapi.nets);
        await tiny.loadFromDisk(MODELS_URL);
        await ssd.loadFromDisk(MODELS_URL);

        res.render('facecam');
    });
};
