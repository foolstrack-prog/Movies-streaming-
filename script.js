/**
 * Note: This is JavaScript, not Java.
 * This file handles interactivity, admin panel logic, and video streaming attempts.
 */

// Helper function to try and convert a standard Google Drive sharing link
// into a link that attempts to force direct delivery/embedding.
function getDirectDriveUrl(driveUrl) {
    // 1. Check if the URL is a standard Google Drive sharing URL
    const match = driveUrl.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);

    if (match && match[1]) {
        const fileId = match[1];
        // The workaround: use the file ID to generate a link that tries 
        // to deliver the content directly.
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // 2. If it's already a direct video link (e.g., from AWS, or a converted Drive link), return it as is.
    return driveUrl;
}


// Modified playMovie function
function playMovie(movieData) {
    // Check if movieData is an object (from Admin Uploads) or just an ID string (from hardcoded list)
    let videoUrl = (typeof movieData === 'object' && movieData !== null) ? movieData.videoUrl : movieData;
    let movieTitle = (typeof movieData === 'object' && movieData !== null) ? movieData.title : movieData.toUpperCase();
    
    // Attempt the Google Drive link conversion
    const streamUrl = getDirectDriveUrl(videoUrl);

    console.log(`Original URL: ${videoUrl}`);
    console.log(`Attempting to stream from modified URL: ${streamUrl}`);

    // --- STREAMING LOGIC ---
    
    if (streamUrl.includes('drive.google.com/uc')) {
        const confirmStreaming = confirm(
            `You are attempting to stream: ${movieTitle}.\n\n` +
            `This uses the Google Drive workaround, which may fail or require a Google login.\n\n` +
            `Click OK to attempt to open the video in a new tab.`
        );

        if (confirmStreaming) {
            window.open(streamUrl, '_blank');
        }
    } else {
        // Fallback for hardcoded movies or non-Drive links
        alert(`Starting stream for ${movieTitle}! This is where the video player would load. URL: ${streamUrl}`);
    }
}


// Function to toggle the visibility of the admin panel
function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    const isHidden = adminPanel.style.display === 'none';
    
    adminPanel.style.display = isHidden ? 'block' : 'none';
    
    // Also toggle the visibility of the "Admin Uploads" movie section
    const adminUploadsSection = document.getElementById('admin-uploads-section');
    adminUploadsSection.style.display = isHidden ? 'block' : 'none';
}

// Function to handle the form submission
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
});

function handleUploadSubmit(event) {
    event.preventDefault(); 

    const title = document.getElementById('movie-title').value;
    const posterUrl = document.getElementById('poster-url').value;
    const videoUrl = document.getElementById('video-url').value; 

    const movie = {
        title: title,
        posterUrl: posterUrl,
        videoUrl: videoUrl, 
        id: `admin_${Date.now()}`
    };

    addNewMovieCard(movie);

    document.getElementById('upload-form').reset();
    alert(`Movie "${title}" added to Admin Uploads!`);
}

// Function to create and add the new movie card
function addNewMovieCard(movie) {
    const list = document.getElementById('admin-uploads-list');

    const card = document.createElement('div');
    // Using JSON.stringify to pass the full movie object to playMovie
    card.setAttribute('onclick', `playMovie(${JSON.stringify(movie).replace(/"/g, "'")})`);
    card.classList.add('movie-card', 'vertical-card');

    card.innerHTML = `
        <img src="${movie.posterUrl}" alt="${movie.title}">
        <h3>${movie.title.substring(0, 15)}...</h3>
    `;

    list.prepend(card);
    
    document.getElementById('admin-uploads-section').style.display = 'block';
}