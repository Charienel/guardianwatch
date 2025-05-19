let map, marker, circle;


// 🔊 Play SOS alert sound
function playAlertSound() {
  const audio = document.getElementById("sos-audio");
  if (audio) audio.play();
}

// 🗺️ Initialize the map
function initMap(lat, lng) {
  map = L.map("map").setView([lat, lng], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  marker = L.marker([lat, lng]).addTo(map);

  circle = L.circle([lat, lng], {
    radius: 20,
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
  }).addTo(map);
}

// 🔄 Update live location on map
function updatePosition(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  marker.setLatLng([lat, lng]);
  circle.setLatLng([lat, lng]);
  map.setView([lat, lng], 16);
}

// ❌ Show error if geolocation denied
function showError() {
  alert("Location access denied or unavailable.");
}

// 📍 Get current location and start map
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    initMap(lat, lng);

    navigator.geolocation.watchPosition(updatePosition, showError, {
      enableHighAccuracy: true,
    });
  }, showError);
} else {
  alert("Geolocation is not supported in this browser.");
}
// 🔁 Reverse geocoding: Get readable address from coordinates
async function getAddressFromCoordinates(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data && data.display_name ? data.display_name : "Address not found";
    } catch {
      return "Error fetching address";
    }
  }

  function getCurrentPositionAsync(options = {}) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }
  
  
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ Authenticated user:", user.uid);
  
      document.getElementById("sos-btn").addEventListener("click", async () => {
        try {
          if (!marker) {
            console.warn("⚠️ No marker found.");
            return;
          }
  
          const icon = marker._icon;
          icon.classList.add("marker-blink");
          playAlertSound();
  
          const position = await getCurrentPositionAsync({ enableHighAccuracy: true });
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const timestamp = new Date().toISOString();
  
          const address = await getAddressFromCoordinates(lat, lng);
          console.log("📫 Address:", address);
  
          const sosData = {
            latitude: lat,
            longitude: lng,
            address,
            time: timestamp,
            user: user.uid,
          };
  
          // Save to Firebase
          await firebase.database().ref("Users/" + user.uid + "/lastSOS").set(sosData);
          await firebase.database().ref("Users/" + user.uid + "/Alert Logs").push(sosData);

          
  
          console.log("✅ SOS saved to Firebase!");

           // ✅ Fetch user details from Firebase
        const userInfoSnap = await firebase.database().ref("Users/" + user.uid + "/info").once("value");
        const userInfo = userInfoSnap.val();

        const dashboardLink = window.location.href;
            
        
        } catch (err) {
          console.error("❌ SOS trigger error:", err);
        }
      });
  
    } else {
      console.warn("⛔ No authenticated user.");
      // Optionally redirect to login page
      // window.location.href = "login.html";
    }
  });
  
document.getElementById("cancel-sos-btn").addEventListener("click", () => {
    if (marker) {
      const icon = marker._icon;
      icon.classList.remove("marker-blink");
    }
  
    // ⛔ Stop the sound
    const audio = document.getElementById("sos-audio");
    if (audio) {
      audio.pause();
      audio.currentTime = 0; // Reset to start
    }
  });
  document.getElementById("logout-btn").addEventListener("click", () => {
    firebase.auth().signOut()
      .then(() => {
        alert("Logged out successfully!");
        window.location.href = "login.html"; // or your actual login page path
      })
      .catch((error) => {
        console.error("Logout error:", error.message);
      });
  });
  document.querySelector('a[href="#alert-logs"]').addEventListener("click", () => {
    document.getElementById("alert-logs").style.display = "block";
    document.getElementById("map").style.display = "none"; // optional
    loadAlertLogs(); // load logs
  });
  
  document.getElementById("date-filter").addEventListener("change", loadAlertLogs);
  
  function loadAlertLogs() {
    const user = firebase.auth().currentUser;
    const logsTable = document.getElementById("logs-table-body");
    logsTable.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  
    const selectedDate = document.getElementById("date-filter").value;
  
    if (user) {
      firebase
        .database()
        .ref("Users/" + user.uid + "/Alert Logs")
        .once("value")
        .then((snapshot) => {
          const logs = snapshot.val();
          logsTable.innerHTML = "";
  
          if (logs) {
            let filtered = Object.values(logs);
  
            // Apply filter if date selected
            if (selectedDate) {
              filtered = filtered.filter((log) => {
                const logDate = new Date(log.time).toISOString().slice(0, 10);
                return logDate === selectedDate;
              });
            }
  
            if (filtered.length === 0) {
              logsTable.innerHTML = "<tr><td colspan='3'>No logs found for this date.</td></tr>";
              return;
            }
  
            filtered.forEach((log) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td style="padding: 8px; border: 1px solid #ccc;">${log.address || "Unknown"}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">${new Date(log.time).toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">${log.latitude}, ${log.longitude}</td>
              `;
              logsTable.appendChild(row);
            });
          } else {
            logsTable.innerHTML = "<tr><td colspan='3'>No logs available.</td></tr>";
          }
        });
    }
  }
  document.getElementById("back-to-map-btn").addEventListener("click", () => {
    window.location.href = "dashboard.html"; // or whatever your GPS tracking page is
  });
  
  