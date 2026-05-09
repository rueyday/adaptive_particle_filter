const connectBtn = document.getElementById("connect-btn");
const eventsList = document.getElementById("calendar-events");
const canUseChromeIdentity = Boolean(
  window.chrome && chrome.identity && chrome.identity.getAuthToken
);
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

connectBtn.onclick = authenticate;
initCalendar();

function initCalendar() {
  if (!canUseChromeIdentity) {
    renderCalendarMessage("Calendar connects when Axiom Tab is loaded as a Chrome extension.");
    connectBtn.disabled = true;
    connectBtn.textContent = "Extension only";
    return;
  }

  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (chrome.runtime.lastError) {
      renderCalendarMessage("Connect your calendar to show upcoming events.");
      return;
    }

    if (token) {
      connectBtn.style.display = "none";
      fetchWeeklyEvents(token);
      return;
    }

    renderCalendarMessage("Connect your calendar to show upcoming events.");
  });
}

function authenticate() {
  if (!canUseChromeIdentity) return;

  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      console.error("Calendar auth error:", chrome.runtime.lastError.message);
      renderCalendarMessage(getAuthErrorMessage(chrome.runtime.lastError.message));
      connectBtn.textContent = "Connect Calendar";
      return;
    }
    if (!token) return;
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

  fetchVisibleCalendars(token)
  .then(calendars => fetchEventsForCalendars(token, calendars, start, end))
  .then(events => renderWeeklyView(events))
  .catch(err => {
    if (err.message === "Unauthorized") return;
    console.error("Calendar Fetch Error:", err);
    renderCalendarMessage(getCalendarErrorMessage(err));
    connectBtn.style.display = "";
  });
}

function fetchVisibleCalendars(token) {
  const url = `${CALENDAR_API}/users/me/calendarList?minAccessRole=reader`;

  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => parseCalendarResponse(response, token))
  .then(data => {
    const calendars = (data.items || [])
      .filter(calendar => calendar.selected !== false && !calendar.deleted)
      .map(calendar => ({
        id: calendar.id,
        summary: calendar.summary,
        primary: Boolean(calendar.primary),
      }));

    return calendars.length ? calendars : [{ id: "primary", summary: "Primary", primary: true }];
  });
}

function fetchEventsForCalendars(token, calendars, start, end) {
  return Promise.all(calendars.map(calendar => {
    const params = new URLSearchParams({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
    });
    const url = `${CALENDAR_API}/calendars/${encodeURIComponent(calendar.id)}/events?${params}`;

    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => parseCalendarResponse(response, token))
    .then(data => (data.items || []).map(event => ({
      ...event,
      calendarName: calendar.summary,
      calendarPrimary: calendar.primary,
    })));
  }))
  .then(calendarEvents => calendarEvents
    .flat()
    .sort((a, b) => getEventStart(a) - getEventStart(b)));
}

function parseCalendarResponse(response, token) {
  if (response.status === 401) {
    chrome.identity.removeCachedAuthToken({ token: token }, authenticate);
    throw new Error("Unauthorized");
  }

  return response.json().then(data => {
    if (!response.ok) {
      const error = new Error(data.error?.message || `Calendar request failed (${response.status})`);
      error.status = response.status;
      error.reason = data.error?.errors?.[0]?.reason || "";
      throw error;
    }
    return data;
  });
}

function getCalendarErrorMessage(error) {
  if (
    error.status === 403 &&
    (error.reason === "accessNotConfigured" || error.message.includes("disabled"))
  ) {
    return "Enable the Google Calendar API for this OAuth project, then reload Axiom Tab.";
  }

  return "Could not load calendar events.";
}

function getAuthErrorMessage(message) {
  if (message.includes("bad client id")) {
    return "OAuth client ID does not match this published extension. Create a Chrome Extension OAuth client for the Web Store extension ID.";
  }

  return "Calendar authorization failed. Check the extension setup and try again.";
}

function getEventStart(event) {
  return new Date(event.start.dateTime || event.start.date);
}

function renderCalendarMessage(message) {
  eventsList.innerHTML = "";
  const li = document.createElement("li");
  li.className = "calendar-empty";
  li.textContent = message;
  eventsList.appendChild(li);
}

function renderWeeklyView(events) {
  eventsList.innerHTML = "";
  const now = new Date();
  const groups = {};

  events.forEach(event => {
    const dateKey = getEventStart(event).toLocaleDateString([], { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
  });

  if (Object.keys(groups).length === 0) {
    renderCalendarMessage("No upcoming events.");
    return;
  }

  for (const [date, dayEvents] of Object.entries(groups)) {
    const dayHeader = document.createElement("li");
    dayHeader.className = "day-header";
    dayHeader.innerText = date;
    eventsList.appendChild(dayHeader);

    dayEvents.forEach(ev => {
      const start = getEventStart(ev);
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
      const calendarHtml = !ev.calendarPrimary && ev.calendarName
        ? `<div class="event-calendar">${ev.calendarName}</div>`
        : "";

      li.innerHTML = `
        <div class="event-info">
          <span class="event-time">${timeStr}</span>
          <div class="event-title">${ev.summary || "(No Title)"}</div>
          ${locationHtml}
          ${calendarHtml}
        </div>
      `;
      eventsList.appendChild(li);
    });
  }
}
