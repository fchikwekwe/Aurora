let forwardTimes = []

function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
    $('#time').val(`${Math.round(avgTimeInMs)} ms`)
    $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

async function onPlay() {
    const videoEl = $('#inputVideo').get(0)

    if(videoEl.paused || videoEl.ended)
        return setTimeout(() => onPlay())

    const ts = Date.now()

    const result = await faceapi.detectSingleFace(videoEl)
    const detectionForSize = faceapi.resizeResults(result, { width: videoEl.width, height: videoEl.height })

    updateTimeStats(Date.now() - ts)

    if (result) {
        drawDetections(videoEl, $('#overlay').get(0), [result])
    }

    setTimeout(() => onPlay())
}

async function run() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    const videoEl = $('#inputVideo').get(0)
    videoEl.srcObject = stream
}

function updateResults() {}

$(document).ready(function() {
    run()
})
