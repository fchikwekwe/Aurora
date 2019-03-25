// window.onload = function showImage() {
//     var image = document.getElementById('selfie-image')
//     console.log(image.src)
//     if (image.src == "(unknown)") {
//         image.style.display = 'none';
//     } else {
//         image.style.display = 'block';
//     }
// }

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

    const imagePath = img.src;
    console.log(imagePath);

    axios.post('/users/image', { img: imagePath.toString() })
        .then((res) => {
            window.location.replace('/faceCam');
            return res
        })
        .catch((err) => {
            console.log("ERROR", err);
        })

}

function emailSelfie(){
    $(function() {
        // contact form animations
        $('#emailContact').click(function() {
            $('#emailForm').fadeToggle();
        })
        $(document).mouseup(function (e) {
            var container = $("#emailForm");

            if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
            {
                container.fadeOut();
            }
        });
    });
}

function sendMail(){ // after clicking send in contact form
    const img = document.getElementById('selfie-image');
    const email = documet
    const imagePath = img.src;
    console.log(imagePath);

    axios.post('/users/email', {
        img: imagePath.toString(),
        email: 'faith.chikwekwe@students.makeschool.com'
    })
        .then((res) => {
            window.location.replace('/faceCam');
            return res.redirect('/faceCam');
        })
        .catch((err) => {
            console.log("ERROR", err);
        })
}

function sendTweet(){
    // const message
    console.log("attempting to send tweet");
    axios.post('/users/twitter')
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        })
}
