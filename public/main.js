const map = L.map("map").setView([20, 0], 2); // Default global view

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let landmarks = []; // Store fetched landmarks
let currentLat = null;
let currentLng = null;

map.on("click", (e) => {
  currentLat = e.latlng.lat.toFixed(6);
  currentLng = e.latlng.lng.toFixed(6);

  document.getElementById("landmarkModal").style.display = "block";
});

// Form Submission

const landmarkForm = document.getElementById("landmarkForm");

landmarkForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const description = document.getElementById("desc").value;
  const category = document.getElementById("landmarkCategory").value;

  if (!currentLat || !currentLng) {
    alert("Location not selected!");
    return;
  }

  const landmarkData = {
    location: { lat: currentLat, lng: currentLng },
    name,
    description,
    category,
  };

  try {
    const response = await fetch("http://localhost:5000/api/landmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(landmarkData),
    });

    if (!response.ok) {
      throw new Error("Failed to save landmark");
    }

    const savedLandmark = await response.json();
    console.log("Server response:", savedLandmark);
    alert("Landmark saved successfully!");

    addLandmarkMarker(landmarkData);

    landmarks.push(landmarkData);

    landmarkForm.reset();
    document.getElementById("landmarkModal").style.display = "none";
    currentLat = null;
    currentLng = null;
  } catch (error) {
    console.error("Error:", error);
    alert("Error saving landmark. Please try again.");
  }
});

document.getElementById("closeModal").onclick = () => {
  document.getElementById("landmarkModal").style.display = "none";
  landmarkForm.reset();
  currentLat = null;
  currentLng = null;
};

// Fetch Landmarks on Load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:5000/api/landmarks");
    if (!response.ok) {
      throw new Error("Failed to fetch landmarks");
    }

    const data = await response.json();
    landmarks = data;
    console.log("Landmarks fetched:", landmarks);

    landmarks.forEach((landmark) => {
      addLandmarkMarker(landmark);
    });
  } catch (error) {
    console.error("Error:", error);
    alert("Error fetching landmarks. Please try again.");
  }
});

function addLandmarkMarker(landmark) {
  if (!landmark.location) {
    console.warn("Skipping invalid landmark:", landmark);
    return;
  }

  const { lat, lng } = landmark.location;
  const marker = L.marker([lat, lng]).addTo(map);

  marker.bindPopup(
    `<b>${landmark.name}</b><br>${landmark.description}<br><i>Category:</i> ${landmark.category}`
  );
}
