// let baseUrl = "https://venom-devils-api.koyeb.app/download/";
let baseUrl = "http://192.168.8.140:8000/download/";
let usersApiKey = null;
// Check for apikey in URL parameters
if (location.search.includes("apikey=")) {
    const urlParams = new URLSearchParams(location.search);
    const apikeyParam = urlParams.get("apikey");
    if (apikeyParam) {
        usersApiKey = apikeyParam;
    }
    


}
let apiKey =  usersApiKey || "1224";

// Public CORS proxy
let proxy = "https://cors-anywhere.herokuapp.com/";

function getendpoint(url) {
    let domain;
    try {
        domain = (new URL(url)).hostname;
    } catch (e) {
        console.error("Invalid URL");
        return null;
    }

    if (domain.includes("facebook.com") || domain.includes("fb.watch")) {
        return "fb";
    } else if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
        return "yt";
    } else if (domain.includes("tiktok.com") || domain.includes("vm.tiktok.com") || domain.includes("vt.tiktok.com")) {
        return "tiktok";
    } else if (domain.includes("instagram.com")) {
        return "insta";
    }
     else {
        return null;
    }
}
document.getElementById("button-close").addEventListener("click", () => {

    document.getElementById("urlInput").value= "";
    document.getElementById("result_main").classList.add("hidden");
    document.getElementById("urlInput").focus();
});
pasteButton = document.querySelector('.paste-btn');
pasteTarget = document.getElementById('urlInput');

pasteButton.addEventListener('click', async () => {
  try {
    // Read text from the clipboard asynchronously
    const clipText = await navigator.clipboard.readText();
    // Set the value of the textarea
    pasteTarget.value = clipText;
    // console.log('Text pasted successfully.');
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
    // Provide a fallback or instruction for manual paste if permission is denied
    alert('Permission to access clipboard denied. Please use Ctrl/Cmd+V to paste manually.');
  }
});


document.getElementById("fetchButton").addEventListener("click", () => {
    let result_main = document.getElementById("result_main");
    let inputUrl = document.getElementById("urlInput").value;
        document.getElementById("fetchButton").disabled = true;
    document.getElementById("fetchButton").innerHTML = "Loading...";

    document.getElementById("fetchButton").disabled = true;
    let endpoint = getendpoint(inputUrl);
    // console.log(endpoint);
    
    document.querySelector("#loader-container").classList.remove("hidden");
if (!result_main.classList.contains("hidden")) {
    result_main.classList.add("hidden");
}
    if (endpoint) {
        fetchData(endpoint, inputUrl, (data) => {
            info_update(data, endpoint);
            console.log("API Response:", data);
        });
    } else {
        alert("Unsupported URL");
    }
});


function info_update(data, endpoint) {
    // console.log(data.videoInfo.metadata);

    const resultMain = document.getElementById("result_main");
    const loader = document.querySelector("#loader-container");
    const btn = document.getElementById("fetchButton");
    const result = document.getElementById("result");
    const thumb = document.getElementById("thumbnail");

    // Show result area / hide loader
    resultMain.classList.remove("hidden");
    loader.classList.add("hidden");

    // Re-enable button safely
    btn.disabled = false;
    btn.innerHTML = "Submit";

    // if (data.videoInfo?.status === "true") {
    //     result.innerHTML = `<p style="color:red;"><strong>Error:</strong> ${data.message || "Unknown error"}</p>`;
    //     return;
    // }

    // SAFE fallback values
    const title = data.videoInfo.desc || data.videoInfo.title || data.videoInfo.metadata.title || "Unknown";
    const duration = data.videoInfo.duration || data.videoInfo.metadata.timestamp || "Unknown";
    const thumbnail = data.videoInfo.thumbnail || data.videoInfo.cover || data.videoInfo.metadata.thumbnail || null;"";

  // ------------------------ YouTube -------------------------
   if (endpoint === "yt") {
        result.innerHTML = `
        <div class="info-container">
            <h3><strong>Title:</strong> ${title}</h3>
            <h3><strong>Duration:</strong> ${duration}</h3>
            <div class="button-container">
                    ${data.videoInfo.available.map(format => `<a class="btn" href="${format.url}">${format.quality}</a>`).join('')}
            </div>
            <center>            <h3><strong>Audio Downloads:</strong></h3>
            </center>
            <hr> 
            <div class="button-container">
${data.videoInfo.audio
    .filter(format => format.quality.includes("320"))
    .map(format => `<a class="btn" href="${format.url}">${format.quality}</a>`)
    .join('')}
            </div>

            <center><small>Provided by @vreden/youtube_scraper</small></center>
        </div>
    `;

}

    // --------------------------- FB ---------------------------
    if (endpoint === "fb") {
        result.innerHTML = `
            <div class="info-container" >
                <h3><strong>Title:</strong> ${title}</h3>
                <h3><strong>Duration:</strong> ${duration}</h3>
                <center>            <h3><strong>Video Downloads:</strong></h3></center><div class="button-container">
                    <a class="btn" href="${data.videoInfo.hd || "#"}">Download HD Video</a>
                    <a class="btn" href="${data.videoInfo.sd || "#"}">Download SD Video</a>
                </center>           <div>
            </div>
        `;
    }

    // ------------------------ TikTok --------------------------
    else if (endpoint === "tiktok") {

        let tiktokDuration = data.videoInfo.duration;
        if (Array.isArray(tiktokDuration)) tiktokDuration = tiktokDuration[1];
        if (!tiktokDuration) tiktokDuration = "Unknown";
result.innerHTML = `
    <div class="info-container">
        <h3><strong></strong></h3>
        <p>${data.videoInfo.desc || "No description"}</p>

        <h3><strong>Creator:</strong> ${data.videoInfo.author || "Unknown"}</h3>
        <h3><strong>Duration:</strong> ${tiktokDuration}s</h3>

        <div class="like-share-container">
            <p><strong>Likes:</strong> ${data.videoInfo.like || 0}</p>
            <p><strong>Shares:</strong> ${data.videoInfo.share || 0}</p>
            <p><strong>Comments:</strong> ${data.videoInfo.comment || 0}</p>
            <p><strong>Repost:</strong> ${data.videoInfo.repost || 0}</p>
        </div>

        <div class="button-container">
            <a class="btn" href="${data.videoInfo.video || "#"}" download="video.mp4">
                Download Video
            </a>

            <a class="btn" href="${data.videoInfo.sound || "#"}" download="music.mp3">
                Download Music
            </a>
        </div>
    </div>
`;

    }


    // --------------- SAFE Thumbnail Update --------------------
    if (thumbnail) {
        thumb.src = thumbnail;
    }
}




function fetchData(endpoint, inputUrl, callback) {

    let fullUrl =
        // proxy +
        baseUrl +
        endpoint +
        "?url=" +
        encodeURIComponent(inputUrl) +
        "&apikey=" +
        apiKey;

    fetch(fullUrl, { method: "GET" })
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error("Error fetching data:", error));
}
