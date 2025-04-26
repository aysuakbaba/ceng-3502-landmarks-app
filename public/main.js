const map = L.map("map").setView([20, 0], 2); // Default global view

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let landmarks = []; // Store fetched landmarks
let currentLat = null;
let currentLng = null;
let editingLandmarkName = null;
let selectedVisitedLandmark = null;
let selectedCategory = null;

const landmarkFilterOption = document.getElementById("landmarkFilter");
landmarkFilterOption.addEventListener("change", (event) => {
  selectedCategory = event.target.value;
  renderLandmarkList(selectedCategory);
});

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
  const note = document.getElementById("note").value;

  if (!currentLat || !currentLng) {
    alert("Location not selected!");
    return;
  }

  const landmarkData = {
    location: { lat: currentLat, lng: currentLng },
    name,
    description,
    category,
    note,
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

    await response.json();
    alert("Landmark saved successfully!");

    addLandmarkMarker(landmarkData);

    landmarks.push(landmarkData);
    renderLandmarkList();

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

function updateLandmark(name) {
  editingLandmarkName = name;
  renderLandmarkList();
}

function cancelEdit() {
  editingLandmarkName = null;
  renderLandmarkList();
}

async function saveLandmark(name) {
  const landmark = landmarks.find((lm) => lm.name === name);
  if (!landmark) return;

  const newName = document.getElementById(`edit-name-${name}`).value;
  const newDescription = document.getElementById(`edit-desc-${name}`).value;
  const newCategory = document.getElementById(`edit-category-${name}`).value;
  const newNote = document.getElementById(`edit-note-${name}`).value;

  try {
    const response = await fetch(
      `http://localhost:5000/api/landmarks/${landmark.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          location: landmark.location, // Assuming location doesn't change
          description: newDescription,
          category: newCategory,
          note: newNote,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update landmark on the server");
    }
    editingLandmarkName = null;
    renderLandmarkList();

    alert("Landmark updated successfully!");
  } catch (error) {
    console.error(error);
    alert("An error occurred while updating the landmark.");
  }
}

function fetchLandmarks() {
  fetch("http://localhost:5000/api/landmarks")
    .then((response) => response.json())
    .then((data) => {
      landmarks = data;
      landmarks.forEach((landmark) => {
        addLandmarkMarker(landmark);
      });
      renderLandmarkList();
    })
    .catch((error) => {
      console.error("Error fetching landmarks:", error);
    });
}

function deleteLandmark(id) {
  fetch(`http://localhost:5000/api/landmarks/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete landmark");
      }
      return response.json();
    })
    .then(() => {
      landmarks = landmarks.filter((landmark) => landmark.id !== id);
      renderLandmarkList();
    })
    .catch((error) => {
      console.error("Error deleting landmark:", error);
    });
}

const visitedLandmarkForm = document.getElementById("visitedLandmarkForm");

visitedLandmarkForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedVisitedLandmark) {
    alert("No landmark selected!");
    return;
  }

  const visitedDate = document.getElementById("visitedDate").value;
  const visitorName = document.getElementById("visitorName").value;

  const landmarkID = selectedVisitedLandmark.id;

  const visitedData = {
    landmark_id: landmarkID,
    visited_date: visitedDate,
    visitor_name: visitorName,
  };

  try {
    const response = await fetch("http://localhost:5000/api/visited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(visitedData),
    });

    if (!response.ok) {
      throw new Error("Failed to save visited landmark");
    }

    alert("Visited landmark saved successfully!");
    document.getElementById("visitedLandmarkModal").style.display = "none";
    visitedLandmarkForm.reset();
    selectedVisitedLandmark = null;
  } catch (error) {
    console.error("Error:", error);
    alert("Error saving visited landmark.");
  }
});

function addToVisited(name) {
  selectedVisitedLandmark = landmarks.find((lm) => lm.name === name);
  if (!selectedVisitedLandmark) {
    alert("Landmark not found!");
    return;
  }
  if (selectedVisitedLandmark.visited) {
    fetch(`http://localhost:5000/api/visited/${selectedVisitedLandmark.id}`)
      .then((response) => response.json())
      .then((data) => {
        selectedVisitedLandmark.visited_date = data.visited_date;
        selectedVisitedLandmark.visitor_name = data.visitor_name;

        alert(
          `Landmark "${selectedVisitedLandmark.name}" is already marked as visited on ${selectedVisitedLandmark.visited_date} by ${selectedVisitedLandmark.visitor_name}.`
        );
      })
      .catch((error) => {
        console.error("Error fetching visited landmark:", error);
      });
    return;
  }
  document.getElementById("visitedLandmarkModal").style.display = "block";
}

document.getElementById("closeVisitedModal").onclick = () => {
  document.getElementById("visitedLandmarkModal").style.display = "none";
  visitedLandmarkForm.reset();
  selectedVisitedLandmark = null;
};
function renderLandmarkList(selectedCategory) {
  const list = document.getElementById("landmarkList");
  list.innerHTML = "";

  landmarks.forEach((landmark) => {
    const isEditing = editingLandmarkName === landmark.name;
    const listItem = document.createElement("li");
    if (selectedCategory === "visited" && !landmark.visited) return;

    listItem.innerHTML = `
        <div style="border: 1px solid #ccc; border-radius: 8px; padding: 10px; margin-bottom: 10px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
          ${
            isEditing
              ? `
                <input id="edit-name-${landmark.name}" value="${
                  landmark.name
                }" style="width: 100%; margin-bottom: 5px;" />
                <input id="edit-desc-${landmark.name}" value="${
                  landmark.description
                }" style="width: 100%; margin-bottom: 5px;" />
                <input id="edit-category-${landmark.name}" value="${
                  landmark.category
                }" style="width: 100%; margin-bottom: 5px;" />
                <input id="edit-note-${landmark.name}" value="${
                  landmark.note || ""
                }" style="width: 100%; margin-bottom: 5px;" />
              `
              : `
                <h3 style="margin: 0; font-size: 1.2em;">${landmark.name}</h3>
                <div style="margin-top: 5px;">
                  <p style="margin: 5px 0;"><b>Location:</b> ${
                    landmark.location.lat
                  }, ${landmark.location.lng}</p>
                  <p style="margin: 5px 0;"><b>Description:</b> ${
                    landmark.description
                  }</p>
                  <p style="margin: 5px 0;"><b>Category:</b> ${
                    landmark.category
                  }</p>
                  ${
                    landmark.note
                      ? `<p style="margin: 5px 0;"><b>Note:</b> ${landmark.note}</p>`
                      : ""
                  }
                </div>
              `
          }
  
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            ${
              isEditing
                ? `
                  <button style="padding: 5px 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="saveLandmark('${landmark.name}')"
                  >
                    SAVE
                  </button>
                  <button style="padding: 5px 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="cancelEdit()"
                  >
                    CANCEL
                  </button>
                `
                : `
                  <button style="padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="updateLandmark('${landmark.name}')"
                  >
                    UPDATE
                  </button>
                  <button style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="deleteLandmark('${landmark.id}')"
                  >
                    DELETE
                  </button>
                  <button style="padding: 5px 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="addToVisited('${landmark.name}')"
                  >
                    ${landmark.visited ? "VISITED" : "ADD TO VISITED"}
                  </button>
                `
            }
          </div>
        </div>
      `;

    list.appendChild(listItem);
  });
}

// Fetch Landmarks on Load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    fetchLandmarks();
  } catch (error) {
    console.error("Error during initial fetch:", error);
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
    `<div style="max-width: 200px; word-wrap: break-word;">
        <b>${landmark.name}</b><br>
        <b><i>Description:</i></b> ${landmark.description}<br>
        <b><i>Category:</i></b> ${landmark.category}<br>
        ${landmark.note ? `<b><i>Note:</i></b> ${landmark.note}<br>` : ""}
        <b><i>Location:</i></b> ${landmark.location.lat}, ${
      landmark.location.lng
    }
    </div>`
  );
}
