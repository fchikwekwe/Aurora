function takeSelfie(){

    var hidden_canvas = document.getElementById('selfie-canvas'),
        video = document.querySelector('video'),
        image = document.querySelector('#selfie-image'),

        // Get the exact size of the video element.
        width = video.videoWidth,
        height = video.videoHeight,

        // Context object for working with the canvas.
        context = hidden_canvas.getContext('2d');

    // Set the canvas to the same dimensions as the video.
    hidden_canvas.width = width * 0.8;
    hidden_canvas.height = height * 0.8;

    // Draw a copy of the current frame from the video on the canvas.
    context.drawImage(video, 0, 0, width, height);

    // Get an image dataURL from the canvas.
    var imageDataURL = hidden_canvas.toDataURL('image/png');

    // Set the dataURL as source of an image element, showing the captured photo.
    image.setAttribute('src', imageDataURL);

    // Set the href attribute of the download button.
    document.querySelector('#downloadSelfie').href = imageDataURL;

}

function downloadSelfie() {
    // Get an image dataURL from the canvas.
    var imageDataURL = canvas.toDataURL('image/png');

    // Set the href attribute of the download button.
    document.querySelector('#downloadSelfie').href = imageDataURL;
}

function saveSelfieToProfile() {
    const img = document.getElementById('selfie-image');

    fetch(img.src)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], 'aurora_selfie.png', blob)
            console.log(file)
            return file;
        });

    axios.post('/users/image', img)
        .then((res) => {
            window.location.replace('/video');
            return res
        })
        .catch((err) => {
            console.log(err);
        })

}
