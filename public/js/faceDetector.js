const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

if (window.FaceDetector) {
    runShapeDetectionApi();
} else {
    displayFallbackMessage();
}

async function runShapeDetectionApi() {
    const constraints = { video: { facingMode: 'environment' } };
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.autoplay = true;
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    };

    let renderLocked = false;
    const faceDetector = new FaceDetector({ fastMode: true });

    function render() {
        if (!video.paused) {
            renderLocked = true;

            Promise.all([
                faceDetector.detect(video).catch((error) => console.error(error)),
            ]).then(([detectedFaces = []]) => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                context.strokeStyle = '#ffeb3b';
                context.fillStyle = '#ffeb3b';
                context.font = '16px Mononoki';
                context.lineWidth = 5;

                detectedFaces.forEach((detectedFace) => {
                    const { top, left, width, height } = detectedFace.boundingBox;
                    context.beginPath();
                    context.rect(left, top, width, height);
                    context.stroke();
                    context.fillText('face detected', left + 5, top - 8);

                    if (detectedFace.landmarks) {
                        detectedFace.landmarks.forEach((landmark) => {
                            const x = landmark.locations[0].x; // 75
                            const y = landmark.locations[0].y; // 40
                            if (landmark.type == "mouth"){
                                // console.log("mouth");
                                context.beginPath();
                                context.moveTo(x, y)
                                context.bezierCurveTo(x, y + 3, x - 5, y - 15, x - 20, y - 15);
                                context.bezierCurveTo(x - 55, y - 15, x - 55, y + 22.5, x - 55, y +22.5);
                                context.bezierCurveTo(x - 55, y + 40, x - 35, y + 62, x, y + 80);
                                context.fill();
                                // heart example
                                // ctx.beginPath();
                                // ctx.moveTo(75, 40);
                                // ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
                                // ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
                                // ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
                                // ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
                                // ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
                                // ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
                                // ctx.fill();
                            } else if (landmark.type == "eye"){
                                context.beginPath();
                                // context.arc()
                            }
                            // context.beginPath();
                            // context.arc(x, y, 5, 0, Math.PI * 2);
                            // context.fill();
                            // context.fillText(landmark.type, x - 10, y + 30);
                        })
                    } else {
                        console.log("No landmarks detected.");
                    }
                });

                context.strokeStyle = '#f44336';
                context.fillStyle = '#f44336';
                context.font = '24px Mononoki';

                renderLocked = false;
            });
        }
    }

    let counter = 0;

    (function renderLoop() {
        counter += 1;
        // console.log("counter", counter);

        requestAnimationFrame(renderLoop);
        if (counter % 10 == 0) {
            if (!renderLocked) {
                render();
            }
        }

    })();
}

function displayFallbackMessage() {
    document.getElementById('fallback-message').style.visibility="visible"
    document.querySelector('canvas').style.visibility="hidden"
}
