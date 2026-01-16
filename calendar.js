const connectBtn = document.getElementById("connect-btn");
const eventsList = document.getElementById("calendar-events");

connectBtn.onclick = authenticate;
initCalendar();

function initCalendar() {
  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (token) {
      connectBtn.style.display = "none";
      fetchWeeklyEvents(token);
    }
  });
}

function authenticate() {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError || !token) return;
    connectBtn.style.display = "none";
    fetchWeeklyEvents(token);
  });
}

function fetchWeeklyEvents(token) {
  const start = new Date();
  start.setDate(start.getDate());
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setDate(end.getDate() + 10);
  end.setHours(23, 59, 59, 999);

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`;

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(r => {
    if (r.status === 401) {
      chrome.identity.removeCachedAuthToken({ token: token }, authenticate);
      throw new Error("Unauthorized");
    }
    return r.json();
  })
  .then(data => renderWeeklyView(data.items || []))
  .catch(err => console.error("Calendar Fetch Error:", err));
}

function renderWeeklyView(events) {
  eventsList.innerHTML = "";
  const now = new Date();
  const groups = {};

  events.forEach(event => {
    const dateKey = new Date(event.start.dateTime || event.start.date).toLocaleDateString([], { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
  });

  if (Object.keys(groups).length === 0) {
    eventsList.innerHTML = "<li style='list-style:none; color:gray;'>No upcoming events.</li>";
    return;
  }

  for (const [date, dayEvents] of Object.entries(groups)) {
    const dayHeader = document.createElement("li");
    dayHeader.className = "day-header";
    dayHeader.innerText = date;
    eventsList.appendChild(dayHeader);

    dayEvents.forEach(ev => {
      const start = new Date(ev.start.dateTime || ev.start.date);
      const end = new Date(ev.end.dateTime || ev.end.date);
      const isCurrent = now >= start && now <= end;
      
      const li = document.createElement("li");
      li.className = `event-block ${isCurrent ? 'current-event' : ''}`;
      
      const timeStr = ev.start.dateTime 
        ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "All Day";

      const locationHtml = ev.location 
        ? `<div class="event-location">${ev.location}</div>` 
        : "";

      li.innerHTML = `
        <div class="event-info">
          <span class="event-time">${timeStr}</span>
          <div class="event-title">${ev.summary || "(No Title)"}</div>
          ${locationHtml}
        </div>
      `;
      eventsList.appendChild(li);
    });
  }
}