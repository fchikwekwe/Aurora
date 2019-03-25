
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
        drawLandmarks(videoEl, $('#overlay').get(0), [result], withBoxes)
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

// image zoom
function imageZoom(imgID, resultID) {
    var img, lens, result, cx, cy;
    img = document.getElementById(imgID);
    result = document.getElementById(resultID);
    /*create lens:*/
    lens = document.createElement("DIV");
    lens.setAttribute("class", "img-zoom-lens");
    /*insert lens:*/
    img.parentElement.insertBefore(lens, img);
    /*calculate the ratio between result DIV and lens:*/
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    /*set background properties for the result DIV:*/
    result.style.backgroundImage = "url('" + img.src + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    /*execute a function when someone moves the cursor over the image, or the lens:*/
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);
    /*and also for touch screens:*/
    lens.addEventListener("touchmove", moveLens);
    img.addEventListener("touchmove", moveLens);
    function moveLens(e) {
        var pos, x, y;
        /*prevent any other actions that may occur when moving over the image:*/
        e.preventDefault();
        /*get the cursor's x and y positions:*/
        pos = getCursorPos(e);
        /*calculate the position of the lens:*/
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);
        /*prevent the lens from being positioned outside the image:*/
        if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
        if (x < 0) {x = 0;}
        if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
        if (y < 0) {y = 0;}
        /*set the position of the lens:*/
        lens.style.left = x + "px";
        lens.style.top = y + "px";
        /*display what the lens "sees":*/
        result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }
    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /*get the x and y positions of the image:*/
        a = img.getBoundingClientRect();
        /*calculate the cursor's x and y coordinates, relative to the image:*/
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /*consider any page scrolling:*/
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return {x : x, y : y};
    }
}