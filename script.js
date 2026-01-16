function updateTime() {
  const now = new Date();
  
  // Update Time
  const timeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById("time").textContent = timeString;

  // Update Greeting based on hour
  const hour = now.getHours();
  let wish = "Hello";
  if (hour < 12) wish = "Good Morning";
  else if (hour < 18) wish = "Good Afternoon";
  else wish = "Good Evening";
  
  document.getElementById("greeting").textContent = `${wish} 👋`;
}

setInterval(updateTime, 1000);
updateTime();