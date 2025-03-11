
class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
  }

  connect(onMessage) {
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => console.log("WebSocket connected.");
    this.socket.onmessage = (event) => onMessage(JSON.parse(event.data));
    this.socket.onclose = () => console.log("WebSocket disconnected.");
    this.socket.onerror = (error) => console.error("WebSocket error:", error);
  }

  sendMessage(command) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(command));
    }
  }
}

class VideoPlayer {
  constructor(videoElementId, captionElementId, tagsElementId) {
    this.videoElement = document.getElementById(videoElementId);
    this.captionElement = document.getElementById(captionElementId);
    this.tagsElement = document.getElementById(tagsElementId);
    this.videoList = [];
    this.currentIndex = 0;
  }

  updateVideos(data) {
    let newVideos = [];

    if (data.name === "lists") {
      newVideos = [...data.posts];
    } else if (data.name === "new") {
      newVideos = [data.post];

      // Insert the new video *after* the current video
      this.videoList.splice(this.currentIndex + 1, 0, ...newVideos);
    }

    if (newVideos.length > 0) {
      this.videoList.push(...newVideos);

      if (this.videoList.length === newVideos.length) {
        this.playVideo(0);
        return;
      }
      this.playVideo(this.currentIndex);

    }

  }

  playVideo(index) {
    if (index >= 0 && index < this.videoList.length) {
      this.currentIndex = index;
      const videoData = this.videoList[index];

      this.videoElement.src = `http://localhost:4000/api/contents/content/${videoData.slug}?token=${sessionToken}`;
      this.captionElement.innerText = `Caption: ${videoData.caption}`;
      this.tagsElement.innerText = `Tags: ${videoData.tags} - ID: ${videoData.id}`;

      this.videoElement.play();
    }
  }

  nextVideo() {
    if (this.videoList.length === 0) {
      webSocketService.sendMessage({ command: `/consume list ${take} ${skip}` });
      this.playVideo(this.currentIndex);
      return;
    }
    if (this.currentIndex + 1 < this.videoList.length) {
      this.playVideo(++this.currentIndex);
    } else {
      skip += take;
      webSocketService.sendMessage({ command: `/consume list ${take} ${skip}` });
    }
  }

  prevVideo() {
    if (this.currentIndex > 0) {
      this.playVideo(--this.currentIndex);
    }
  }
}

// Configuration
const sessionToken = "ed5c86c0-e2fb-4541-a8ce-69e85ec08c85";
let take = 5;
let skip = 0;
const wsUrl = `ws://localhost:4000/ws/consume/content?token=${sessionToken}`;

// Instantiate Services
const webSocketService = new WebSocketService(wsUrl);
const videoPlayer = new VideoPlayer("videoElement", "videoCaption", "videoTags");

// Start WebSocket Connection on Page Load
window.onload = () => {
  webSocketService.connect((data) => videoPlayer.updateVideos(data));

  webSocketService.sendMessage({ command: `/consume list ${take} ${skip}` });

  // Attach button events
  document.getElementById("nextBtn").addEventListener("click", () => videoPlayer.nextVideo());
  document.getElementById("prevBtn").addEventListener("click", () => videoPlayer.prevVideo());

  console.log("Page loaded.");
};
