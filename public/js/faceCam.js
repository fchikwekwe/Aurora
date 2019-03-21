
  let forwardTimes = []
  let withBoxes = true

  function onChangeHideBoundingBoxes(e) {
    withBoxes = !$(e.target).prop('checked')
  }

  function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
    $('#time').val(`${Math.round(avgTimeInMs)} ms`)
    $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
  }

  async function onPlay() {
    const videoEl = $('#inputVideo').get(0)

    if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
      return setTimeout(() => onPlay())


    const options = getFaceDetectorOptions()

    const ts = Date.now()

    const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks()

    updateTimeStats(Date.now() - ts)

    if (result) {
      drawLandmarks(videoEl, $('#overlay').get(0), [result])
    }

    setTimeout(() => onPlay())
  }

  async function run() {
    // load face detection and face landmark models
    await changeFaceDetector(TINY_FACE_DETECTOR)
    await faceapi.loadFaceLandmarkModel('/')
    changeInputSize(224)

    // try to access users webcam and stream the images
    // to the video element
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    const videoEl = $('#inputVideo').get(0)
    videoEl.srcObject = stream
  }

  function updateResults() {}

  $(document).ready(function() {
    // renderNavBar('#navbar', 'webcam_face_landmark_detection')
    initFaceDetectionControls()
    run()
  })

// $(document).ready(async function() {
//     console.log("1");
//     try {
//         // Load Models
//         await faceapi.loadFaceLandmarkModel('/');
//         console.log("2")
//         // Get Input
//         const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
//         const videoEl = $('#inputVideo').get(0);
//         videoEl.srcObject = stream;
//         console.log("3")
//         // await faceapi.drawDetection(videoEl, canvas, result, box);
//     } catch (err) {
//         console.log(err);
//     }
//
//     async function onPlay() {
//         const videoEl = $('#inputVideo').get(0);
//
//         // Pass input to detect single face method
//         if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
//             return setTimeout(() => onPlay())
//
//         const result = await faceapi.detectSingleFace(videoEl).withFaceLandmarks();
//
//         // Draw box
//         const box = new faceapi.BoxWithText(new faceapi.Rect(0, 0, 50, 50), 'some text');
//         const canvas = $('#overlay').get(0)
//
//         console.log("4");
//
//         // Draw contours
//         // Draw landmarks
//
//         // Render to canvas
//         drawLandmarks(videoEl, canvas, [result])
//
//         setTimeout(() => onPlay())
//     }
// })
