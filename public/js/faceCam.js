
  let forwardTimes = []
  let wantLandmarks = true
  let withBoxes = true

  function onChangeHideLandmarks(e) {
    wantLandmarks = !$(e.target).prop('checked')
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

  //   if (result && wantLandmarks) {
  //       var element = document.getElementById('overlay');
  //       element.setAttribute('display', 'block');
  //       drawLandmarks(videoEl, $('#overlay').get(0), [result], withBoxes)
  // } else {
  //       var element = document.getElementById('overlay');
  //       element.setAttribute('display', 'none');
  // }

    drawLandmarks(videoEl, $('#overlay').get(0), [result], withBoxes)

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
