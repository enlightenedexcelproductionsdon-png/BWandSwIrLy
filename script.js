const videoUpload = document.getElementById('videoUpload');
const videoPlayer = document.getElementById('videoPlayer');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); // Context for drawing on canvas

const waveIntensitySlider = document.getElementById('wave-intensity');
const swirlRadiusSlider = document.getElementById('swirl-radius');
const exportButton = document.getElementById('exportVideo');
const downloadLink = document.getElementById('downloadLink');

let videoStream = null;
let animationFrameId = null;

// --- Video Upload Handling ---
videoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        videoPlayer.src = fileURL;
        videoPlayer.style.display = 'block'; // Show video player
        canvas.style.display = 'none'; // Hide canvas by default

        videoPlayer.onloadedmetadata = () => {
            // Set canvas dimensions to match video
            canvas.width = videoPlayer.videoWidth;
            canvas.height = videoPlayer.videoHeight;

            // Optionally start drawing on canvas once metadata is loaded
            // animate(); // Uncomment to start effect rendering immediately
        };
    }
});

// --- Basic Animation Loop (for drawing on canvas) ---
function animate() {
    if (videoPlayer.paused || videoPlayer.ended) {
        cancelAnimationFrame(animationFrameId);
        return;
    }

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the current video frame onto the canvas
    ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);

    // --- Apply Effects (Conceptual - requires detailed implementation) ---
    applyEffects();

    animationFrameId = requestAnimationFrame(animate);
}

// --- Effect Application Function (Conceptual) ---
function applyEffects() {
    const waveIntensity = parseInt(waveIntensitySlider.value);
    const swirlRadius = parseInt(swirlRadiusSlider.value);

    // Get image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // --- Wave Effect (Conceptual) ---
    if (waveIntensity > 0) {
        // This is a simplified example. Real wave effects are more complex.
        // You'd typically apply a sine wave distortion to pixel positions.
        const amplitude = waveIntensity * 0.05; // Adjust multiplier as needed
        const frequency = 0.02; // Adjust frequency for wave density

        const tempPixels = new Uint8ClampedArray(pixels); // Work on a copy

        for (let y = 0; y < canvas.height; y++) {
            const xOffset = Math.sin(y * frequency) * amplitude;
            for (let x = 0; x < canvas.width; x++) {
                const originalX = x - xOffset;
                if (originalX >= 0 && originalX < canvas.width) {
                    const originalIndex = (Math.floor(originalX) + y * canvas.width) * 4;
                    const currentIndex = (x + y * canvas.width) * 4;

                    pixels[currentIndex] = tempPixels[originalIndex];
                    pixels[currentIndex + 1] = tempPixels[originalIndex + 1];
                    pixels[currentIndex + 2] = tempPixels[originalIndex + 2];
                    pixels[currentIndex + 3] = tempPixels[originalIndex + 3];
                }
            }
        }
    }

    // --- Swirly Effect (Conceptual) ---
    if (swirlRadius > 0) {
        // This is a simplified example. Real swirl effects involve polar coordinates.
        const center_x = canvas.width / 2;
        const center_y = canvas.height / 2;
        const radius = swirlRadius; // Max radius of the swirl
        const angle_factor = 0.001 * radius; // Adjust angle multiplier for swirl intensity

        const tempPixels = new Uint8ClampedArray(pixels);

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - center_x;
                const dy = y - center_y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                    const angle = Math.atan2(dy, dx);
                    const swirl_angle = angle + Math.sin(dist / radius * Math.PI) * angle_factor * (radius - dist);

                    const originalX = center_x + Math.cos(swirl_angle) * dist;
                    const originalY = center_y + Math.sin(swirl_angle) * dist;

                    if (originalX >= 0 && originalX < canvas.width && originalY >= 0 && originalY < canvas.height) {
                        const originalIndex = (Math.floor(originalX) + Math.floor(originalY) * canvas.width) * 4;
                        const currentIndex = (x + y * canvas.width) * 4;

                        pixels[currentIndex] = tempPixels[originalIndex];
                        pixels[currentIndex + 1] = tempPixels[originalIndex + 1];
                        pixels[currentIndex + 2] = tempPixels[originalIndex + 2];
                        pixels[currentIndex + 3] = tempPixels[originalIndex + 3];
                    }
                }
            }
        }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
}


// --- Playback and Effect Triggering ---
videoPlayer.addEventListener('play', () => {
    // If canvas is intended to show effects, we need to switch
    // from video player to canvas for rendering.
    // For this example, we'll assume we are always drawing to canvas when playing.
    if (videoPlayer.src) {
        videoPlayer.style.display = 'none';
        canvas.style.display = 'block';
        animate(); // Start the animation loop
    }
});

videoPlayer.addEventListener('pause', () => {
    cancelAnimationFrame(animationFrameId);
});

videoPlayer.addEventListener('ended', () => {
    cancelAnimationFrame(animationFrameId);
});

// Update animation when slider values change
waveIntensitySlider.addEventListener('input', applyEffects);
swirlRadiusSlider.addEventListener('input', applyEffects);


// --- Video Export (Highly Conceptual and Limited) ---
// This is a basic implementation and might not work reliably for complex videos
// or for all browsers. For robust export, server-side processing is recommended.

exportButton.addEventListener('click', () => {
    if (!canvas.style.display === 'block' || !videoPlayer.src) {
        alert("Please upload a video and ensure effects are being rendered on the canvas.");
        return;
    }

    // This is where advanced libraries or server-side processing would be needed.
    // For a pure client-side approach, libraries like CCapture.js or
    // using the MediaRecorder API (which has limitations) could be explored.

    // Example using MediaRecorder API (might not be fully suitable for video *effects* export directly)
    // This requires capturing the stream from the canvas.

    const stream = canvas.captureStream(30); // Capture stream at 30fps
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' }); // Use a suitable mimeType

    let chunks = [];
    recorder.ondataavailable = (e) => {
        chunks.push(e.data);
    };

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = 'exported_video.webm';
        downloadLink.style.display = 'inline-block';
        alert("Video export is ready. Click the 'Download' link.");
    };

    recorder.start();

    // To stop recording after video ends, you'd need to trigger recorder.stop()
    // when videoPlayer.ended is true. This requires careful timing.
    // For simplicity, this example doesn't include auto-stop.
    // You might need to manually stop or implement a timed stop.

    // A common strategy is to play the video on the canvas,
    // record for the duration of the video, and then stop.
    // This requires knowing the video duration.
    // For a more robust solution, consider ffmpeg.js for client-side processing
    // or a backend server for encoding.
});

// --- Helper to ensure canvas dimensions are correct when video loads ---
videoPlayer.addEventListener('loadedmetadata', () => {
    canvas.width = videoPlayer.videoWidth;
    canvas.height = videoPlayer.videoHeight;
});

// --- Basic Cleanup ---
window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    // Revoke object URLs to free up memory
    if (videoPlayer.src) {
        URL.revokeObjectURL(videoPlayer.src);
    }
});
