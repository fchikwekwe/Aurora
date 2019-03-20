/** Root route and API routes go here */

require('@tensorflow/tfjs-node');

const faceapi = require('face-api.js');
const canvas  = require('canvas');
// const fetch = require('node-fetch');
// const path = require('path');

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
// faceapi.env.monkeyPatch({ fetch: fetch });

const MODELS_URL = '/Users/faith1/code/courses/FaceSpace/public/models/';

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
    app.get('/example', async (req, res) => {
        const net = new faceapi.TinyFaceDetector();
        // console.log(faceapi.nets);
        await net.loadFromDisk(MODELS_URL);
        
        const input = 'inputVideo';
        const detection = await faceapi.detectSingleFace(input);
        console.log("DETECTION", detection);

        const result = detection.withFaceLandmarks().withFaceDescriptors();

        console.log("RESULT", result);
        res.render('webcam');
    });
};
