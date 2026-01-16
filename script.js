function updateTime() {
  const now = new Date();
  
  // Update Time
  const timeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById("time").textContent = timeString;
  
}

setInterval(updateTime, 1000);
updateTime();