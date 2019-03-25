
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

// var hideFace = false
$('body').on('click', '#face-toggle-button', function(e) {
    $('#overlay').toggle();
})

async function onPlay() {
    const videoEl = $('#inputVideo').get(0)

    // if (hideFace) return 

    if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())


    const options = getFaceDetectorOptions()

    const ts = Date.now()

    const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks()

    updateTimeStats(Date.now() - ts)

    if (result) {
        drawLandmarks(videoEl, $('#overlay').get(0), [result], withBoxes)
        // console.log(drawLandmarks(videoEl, $('#overlay').get(0), [result], withBoxes))
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

// Side Panel Dashboard
let EventHandler = {
    ShowHideSideBar: function(){
        if (document.getElementById("side-panel").className.indexOf("open") !== -1){
            document.getElementById("side-panel").className = "side-panel"
            document.getElementById("side-panel").className += " close"
            document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-right"
            return
        }
      
        document.getElementById("side-panel").className = "side-panel"
        document.getElementById("side-panel").className += " open"
        document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-left"
    }
}
  
window.onload = () => {
    document.getElementById('show_hide').onclick = EventHandler.ShowHideSideBar
}
