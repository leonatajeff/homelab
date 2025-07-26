const videoList = document.getElementById("videos");
const videoContainer = document.getElementById("video-container");
const videoPlayer = document.getElementById("video-player");
const backBtn = document.getElementById("back-btn");
const videoListDiv = document.getElementById("video-list");

async function loadVideos() {
  try {
    const response = await fetch("/videos");
    const videos = await response.json();
    
    videoList.innerHTML = "";
    
    if (videos.length === 0) {
      videoList.innerHTML = "<p>No videos found</p>";
      return;
    }
    
    videos.forEach(video => {
      const videoItem = document.createElement("div");
      videoItem.className = "video-item";
      videoItem.innerHTML = `
        <h3>${video}</h3>
        <button onclick="playVideo('${encodeURIComponent(video)}')">
          ▶ Play
        </button>
      `;
      videoList.appendChild(videoItem);
    });
  } catch (error) {
    console.error("Error loading videos:", error);
    videoList.innerHTML = "<p>Error loading videos</p>";
  }
}

function playVideo(videoName) {
  const streamUrl = `/stream/${videoName}`;
  videoPlayer.src = streamUrl;
  
  videoListDiv.style.display = "none";
  videoContainer.style.display = "block";
}

backBtn.addEventListener("click", () => {
  videoPlayer.pause();
  videoPlayer.src = "";
  
  videoContainer.style.display = "none";
  videoListDiv.style.display = "block";
});

loadVideos();