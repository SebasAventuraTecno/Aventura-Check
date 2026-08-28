import { createGoogleAuth, hasFirebaseConfig } from "./auth.js";

const BASE_STORAGE_KEY = "agenda-proyectos-activities";
const LOCAL_DATA_CLAIMED_KEY = "agenda-proyectos-local-data-claimed";
const CLOUD_DATA_SEEDED_PREFIX = "agenda-proyectos-cloud-data-seeded";
const editActivityDialog = document.querySelector("#editActivityDialog");
const editActivityForm = document.querySelector("#editActivityForm");
const closeEditActivityDialog = document.querySelector("#closeEditActivityDialog");
const cancelEditModalButton = document.querySelector("#cancelEditModalButton");
const editTitleInput = document.querySelector("#editTitleInput");
const editTypeInput = document.querySelector("#editTypeInput");
const editPriorityInput = document.querySelector("#editPriorityInput");
const editDateInput = document.querySelector("#editDateInput");
const editDateLabel = document.querySelector("#editDateLabel");
const editTimeInput = document.querySelector("#editTimeInput");
const editEndDateField = document.querySelector("#editEndDateField");
const editEndDateInput = document.querySelector("#editEndDateInput");
const editCourseInput = document.querySelector("#editCourseInput");
const editReminderInput = document.querySelector("#editReminderInput");
const editNotesInput = document.querySelector("#editNotesInput");
const homeLink = document.querySelector("[data-home-link]");
const heroGreeting = document.querySelector("#heroGreeting");
const form = document.querySelector("#activityForm");
const quickEntry = document.querySelector(".quick-entry");
const quickTitle = document.querySelector("#quickTitle");
const activityList = document.querySelector("#activityList");
const activityCount = document.querySelector("#activityCount");
const dashboardToday = document.querySelector("#dashboardToday");
const dashboardPending = document.querySelector("#dashboardPending");
const dashboardTrips = document.querySelector("#dashboardTrips");
const dashboardDone = document.querySelector("#dashboardDone");
const activitySearchInput = document.querySelector("#activitySearchInput");
const exportActivitiesButton = document.querySelector("#exportActivitiesButton");
const titleInput = document.querySelector("#titleInput");
const dateInput = document.querySelector("#dateInput");
const dateLabel = document.querySelector("#dateLabel");
const endDateInput = document.querySelector("#endDateInput");
const endDateField = document.querySelector("#endDateField");
const typeInput = document.querySelector("#typeInput");
const priorityInput = document.querySelector("#priorityInput");
const timeInput = document.querySelector("#timeInput");
const courseInput = document.querySelector("#courseInput");
const reminderInput = document.querySelector("#reminderInput");
const notesInput = document.querySelector("#notesInput");
const saveActivityButton = document.querySelector("#saveActivityButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const todayLabel = document.querySelector("#todayLabel");
const heroDateLabel = document.querySelector("#heroDateLabel");
const heroTodayCount = document.querySelector("#heroTodayCount");
const heroTripCount = document.querySelector("#heroTripCount");
const emptyStateTemplate = document.querySelector("#emptyStateTemplate");
const filterButtons = document.querySelectorAll(".filter-button");
const navButtons = document.querySelectorAll(".nav-button");
const installButton = document.querySelector("#installButton");
const calendarGrid = document.querySelector("#calendarGrid");
const monthLabel = document.querySelector("#monthLabel");
const previousMonth = document.querySelector("#previousMonth");
const nextMonth = document.querySelector("#nextMonth");
const calendarCreateDialog = document.querySelector("#calendarCreateDialog");
const calendarCreateForm = document.querySelector("#calendarCreateForm");
const closeCalendarCreateDialog = document.querySelector("#closeCalendarCreateDialog");
const cancelCalendarCreateDialog = document.querySelector("#cancelCalendarCreateDialog");
const calendarCreateDateLabel = document.querySelector("#calendarCreateDateLabel");
const calendarCreateDateInput = document.querySelector("#calendarCreateDateInput");
const calendarCreateTitleInput = document.querySelector("#calendarCreateTitleInput");
const activityDialog = document.querySelector("#activityDialog");
const closeActivityDialog = document.querySelector("#closeActivityDialog");
const activityDialogType = document.querySelector("#activityDialogType");
const activityDialogTitle = document.querySelector("#activityDialogTitle");
const activityDialogDate = document.querySelector("#activityDialogDate");
const activityDialogTime = document.querySelector("#activityDialogTime");
const activityDialogPriority = document.querySelector("#activityDialogPriority");
const activityDialogStatus = document.querySelector("#activityDialogStatus");
const activityDialogCourse = document.querySelector("#activityDialogCourse");
const activityDialogReminder = document.querySelector("#activityDialogReminder");
const activityDialogNotes = document.querySelector("#activityDialogNotes");
const editActivityButton = document.querySelector("#editActivityButton");
const deleteActivityButton = document.querySelector("#deleteActivityButton");
const doneActivityDialog = document.querySelector("#doneActivityDialog");
const accountButton = document.querySelector("#accountButton");
const accountName = document.querySelector("#accountName");
const accountEmail = document.querySelector("#accountEmail");
const accountAvatarFallback = document.querySelector("#accountAvatarFallback");
const accountAvatarImage = document.querySelector("#accountAvatarImage");
const authDialog = document.querySelector("#authDialog");
const closeAuthDialog = document.querySelector("#closeAuthDialog");
const authSignedOut = document.querySelector("#authSignedOut");
const authSignedIn = document.querySelector("#authSignedIn");
const googleSignInButton = document.querySelector("#googleSignInButton");
const signOutButton = document.querySelector("#signOutButton");
const authStatus = document.querySelector("#authStatus");
const authProfileName = document.querySelector("#authProfileName");
const authProfileEmail = document.querySelector("#authProfileEmail");
const authProfileFallback = document.querySelector("#authProfileFallback");
const authProfileImage = document.querySelector("#authProfileImage");

let currentUserId = "local";
let activities = loadActivities();
let currentFilter = "todas";
let activitySearch = "";
let installPromptEvent = null;
let calendarDate = new Date();
let editingActivityId = null;
let selectedActivityId = null;
let authController = null;
let activitySyncUnsubscribe = null;
let cloudActivitiesCollection = null;

const today = new Date();
const todayISO = toISODate(today);
const tomorrowISO = toISODate(addDays(today, 1));
const nextSevenDaysISO = toISODate(addDays(today, 7));
dateInput.value = todayISO;
todayLabel.textContent = new Intl.DateTimeFormat("es-CR", {
  weekday: "short",
  day: "numeric",
  month: "short",
}).format(today);
heroDateLabel.textContent = capitalize(
  new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today),
);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();

  if (!title) return;

  const activityData = {
    title,
    type: data.get("type"),
    priority: data.get("priority"),
    date: data.get("date"),
    endDate: getEndDate(data),
    time: data.get("time"),
    course: String(data.get("course") || "").trim(),
    reminder: data.get("reminder") || "sin",
    notes: String(data.get("notes") || "").trim(),
  };

  const activityBeingEdited = activities.find((activity) => activity.id === editingActivityId);
  if (activityBeingEdited) {
    Object.assign(activityBeingEdited, activityData);
  } else {
    activities.push({
      id: crypto.randomUUID(),
      ...activityData,
      status: "pendiente",
      createdAt: new Date().toISOString(),
    });
  }

  saveActivities();
  resetActivityForm();
  renderApp();
  titleInput.focus();
});

typeInput.addEventListener("change", () => {
  syncTripFields();
});

dateInput.addEventListener("change", () => {
  if (typeInput.value === "gira" && (!endDateInput.value || endDateInput.value < dateInput.value)) {
    endDateInput.value = dateInput.value;
  }
});

cancelEditButton.addEventListener("click", () => {
  resetActivityForm();
  titleInput.focus();
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;

    const addSection = document.querySelector("#addActivity");
    const calendarSection = document.querySelector("#calendarSection");
    const agendaSection = document.querySelector("#agendaSection");
    const appShell = document.querySelector(".app-shell");

    if (!addSection || !calendarSection || !agendaSection) return;

    // Ocultar todo primero
    addSection.classList.add("is-hidden");
    calendarSection.classList.add("is-hidden");
    agendaSection.classList.add("is-hidden");

    // Mostrar solamente la sección seleccionada
    if (targetId === "addActivity") {
      addSection.classList.remove("is-hidden");
    }

    if (targetId === "calendarSection") {
      calendarSection.classList.remove("is-hidden");
    }

    if (targetId === "agendaSection") {
      agendaSection.classList.remove("is-hidden");
    }

    // Nos permite acomodar correctamente el layout
    appShell.dataset.view = targetId;

    setActiveNav(targetId);

    document.querySelector(`#${targetId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});
homeLink?.addEventListener("click", () => {
  const addSection = document.querySelector("#addActivity");
  const calendarSection = document.querySelector("#calendarSection");
  const agendaSection = document.querySelector("#agendaSection");
  const appShell = document.querySelector(".app-shell");

  if (!addSection || !calendarSection || !agendaSection || !appShell) return;

  // Vista de inicio:
  // formulario a la izquierda + calendario grande a la derecha
  addSection.classList.remove("is-hidden");
  calendarSection.classList.remove("is-hidden");
  agendaSection.classList.add("is-hidden");

  // IMPORTANTE: quitar la configuración de las vistas individuales
  appShell.dataset.view = "home";

  setActiveNav("addActivity");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

activitySearchInput?.addEventListener("input", () => {
  activitySearch = activitySearchInput.value.trim().toLowerCase();
  renderActivities();
});

exportActivitiesButton?.addEventListener("click", () => {
  exportActivitiesToCSV(getVisibleActivities());
});

activityList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  const activity = activities.find((item) => item.id === id);

  if (button.dataset.action === "delete") {
    deleteActivity(activity);
    return;
  }

  if (button.dataset.action === "edit" && activity) {
    startEditing(activity);
    return;
  }

  if (button.dataset.action === "next-status" && activity) {
    activity.status = getNextStatus(activity.status);
  }

  saveActivities();
  renderApp();
});

previousMonth.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
  renderCalendar();
});

calendarGrid.addEventListener("click", (event) => {
  // 1. Si tocamos una actividad que ya existe
  const calendarItem = event.target.closest("[data-activity-id]");

  if (calendarItem) {
    const activity = activities.find(
      (item) => item.id === calendarItem.dataset.activityId
    );

    if (activity) {
      openActivityDialog(activity);
    }

    return;
  }

  // 2. Si tocamos un día vacío del calendario
  const dayCell = event.target.closest(".calendar-day");

  if (!dayCell || !dayCell.dataset.date) return;

  openCalendarCreateDialog(dayCell.dataset.date);
});
function openCalendarCreateDialog(dateISO) {
  calendarCreateForm.reset();

  // Guardamos la fecha que el usuario tocó
  calendarCreateDateInput.value = dateISO;

  // Mostramos la fecha bonita
  const selectedDate = parseISODate(dateISO);

  calendarCreateDateLabel.textContent = capitalize(
    new Intl.DateTimeFormat("es-CR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(selectedDate)
  );

  calendarCreateDialog.showModal();

  setTimeout(() => {
    calendarCreateTitleInput.focus();
  }, 100);
}


// Guardar actividad creada desde el calendario
calendarCreateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(calendarCreateForm);

  const title = String(data.get("title") || "").trim();
  const date = String(data.get("date") || "");
  const type = String(data.get("type") || "tarea");

  if (!title || !date) return;

  activities.push({
    id: crypto.randomUUID(),
    title,
    type,
    priority: String(data.get("priority") || "media"),
    date,

    // Si luego queremos una gira de varios días,
    // se podrá editar desde los detalles.
    endDate: "",

    time: String(data.get("time") || ""),
    course: String(data.get("course") || "").trim(),
    reminder: String(data.get("reminder") || "sin"),
    notes: String(data.get("notes") || "").trim(),

    status: "pendiente",
    createdAt: new Date().toISOString(),
  });

  saveActivities();
  renderApp();

  calendarCreateDialog.close();
  calendarCreateForm.reset();
});


// Cerrar con la X
closeCalendarCreateDialog.addEventListener("click", () => {
  calendarCreateDialog.close();
});


// Cerrar con Cancelar
cancelCalendarCreateDialog.addEventListener("click", () => {
  calendarCreateDialog.close();
});


// Cerrar tocando fuera de la ventana
calendarCreateDialog.addEventListener("click", (event) => {
  if (event.target === calendarCreateDialog) {
    calendarCreateDialog.close();
  }
});
closeActivityDialog.addEventListener("click", () => activityDialog.close());
doneActivityDialog.addEventListener("click", () => activityDialog.close());

editActivityButton.addEventListener("click", () => {
  const activity = activities.find((item) => item.id === selectedActivityId);
  if (activity) startEditing(activity);
});

deleteActivityButton.addEventListener("click", () => {
  const activity = activities.find((item) => item.id === selectedActivityId);
  deleteActivity(activity);
});

activityDialog.addEventListener("click", (event) => {
  if (event.target === activityDialog) activityDialog.close();
});

activityDialog.addEventListener("close", () => {
  selectedActivityId = null;
});

accountButton.addEventListener("click", () => {
  authDialog.showModal();
});

closeAuthDialog.addEventListener("click", () => authDialog.close());

authDialog.addEventListener("click", (event) => {
  if (event.target === authDialog) authDialog.close();
});

googleSignInButton.addEventListener("click", async () => {
  if (!authController?.configured) return;

  googleSignInButton.disabled = true;
  authStatus.textContent = "Abriendo Google...";
  try {
    await authController.signIn();
  } catch (error) {
    showAuthError(error);
  } finally {
    googleSignInButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  if (!authController?.configured) return;
  signOutButton.disabled = true;
  try {
    await authController.signOut();
    authDialog.close();
  } catch (error) {
    showAuthError(error);
  } finally {
    signOutButton.disabled = false;
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPromptEvent = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPromptEvent) return;
  installPromptEvent.prompt();
  await installPromptEvent.userChoice;
  installPromptEvent = null;
  installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

renderApp();
setupAuthentication();

function renderApp() {
  renderHeroSummary();
  renderActivityDashboard();
  renderActivities();
  renderCalendar();
}

async function setupAuthentication() {
  updateAccountUI(null);
  googleSignInButton.disabled = true;

  if (!hasFirebaseConfig()) {
    authStatus.textContent = "La conexion inicial con Google esta pendiente.";
    return;
  }

  authStatus.textContent = "Conectando con Google...";
  authController = await createGoogleAuth({
    onUserChange: handleAuthUserChange,
    onError: showAuthError,
  });

  if (authController.configured) {
    googleSignInButton.disabled = false;
    authStatus.textContent = "";
  }
}

function handleAuthUserChange(user) {
  updateAccountUI(user);
  switchActivityOwner(user?.uid || "local");
  authStatus.textContent = user ? "Cuenta conectada. Sincronizando actividades..." : "";
}

function updateAccountUI(user) {
  const signedIn = Boolean(user);
  const displayName = user?.displayName || "Mi cuenta";
  const email = user?.email || "Cuenta de Google";
if (heroGreeting) {
  const firstName = signedIn ? displayName.split(" ")[0] : "";
  heroGreeting.textContent = signedIn ? `Hola, ${firstName}` : "Aventura Check";
}
  accountName.textContent = signedIn ? displayName : "Ingresar";
  accountEmail.textContent = email;
  authSignedOut.hidden = signedIn;
  authSignedIn.hidden = !signedIn;

  setProfileImage(accountAvatarImage, accountAvatarFallback, user);

  if (signedIn) {
    authProfileName.textContent = displayName;
    authProfileEmail.textContent = email;
    setProfileImage(authProfileImage, authProfileFallback, user);
  }
}

function setProfileImage(image, fallback, user) {
  const photoURL = user?.photoURL || "";
  const name = user?.displayName || user?.email || "Usuario";
  fallback.textContent = getInitials(name);
  fallback.hidden = Boolean(photoURL);
  image.hidden = !photoURL;

  if (photoURL) {
    image.src = photoURL;
  } else {
    image.removeAttribute("src");
  }
}

function switchActivityOwner(nextUserId) {
  if (nextUserId === currentUserId) return;

  stopActivitySync();

  const nextStorageKey = getStorageKey(nextUserId);
  const localDataClaimed = localStorage.getItem(LOCAL_DATA_CLAIMED_KEY);
  if (nextUserId !== "local" && !localStorage.getItem(nextStorageKey) && !localDataClaimed) {
    const localActivities = localStorage.getItem(BASE_STORAGE_KEY);
    if (localActivities) {
      localStorage.setItem(nextStorageKey, localActivities);
      localStorage.setItem(LOCAL_DATA_CLAIMED_KEY, nextUserId);
    }
  }

  currentUserId = nextUserId;
  activities = loadActivities();
  resetActivityForm();
  renderApp();

  if (nextUserId !== "local") {
    startActivitySync(nextUserId);
  }
}

function startActivitySync(userId) {
  if (!authController?.configured || !authController.db || !authController.firestore) return;

  const firestore = authController.firestore;
  cloudActivitiesCollection = firestore.collection(authController.db, "users", userId, "activities");
  const seededKey = `${CLOUD_DATA_SEEDED_PREFIX}:${userId}`;

  activitySyncUnsubscribe = firestore.onSnapshot(
    cloudActivitiesCollection,
    (snapshot) => {
      if (snapshot.empty && activities.length && !localStorage.getItem(seededKey)) {
        localStorage.setItem(seededKey, "pending");
        syncActivitiesToCloud();
        return;
      }

      activities = snapshot.docs
        .map((docSnapshot) => normalizeCloudActivity(docSnapshot.id, docSnapshot.data()))
        .sort(compareActivities);
      localStorage.setItem(getStorageKey(userId), JSON.stringify(activities));
      localStorage.setItem(seededKey, "done");
      renderApp();

      if (authDialog.open) {
        authStatus.textContent = "Actividades sincronizadas en Firestore.";
      }
    },
    (error) => {
      showAuthError(error);
      stopActivitySync();
    },
  );
}

function stopActivitySync() {
  if (activitySyncUnsubscribe) {
    activitySyncUnsubscribe();
  }
  activitySyncUnsubscribe = null;
  cloudActivitiesCollection = null;
}

function syncActivitiesToCloud() {
  if (!cloudActivitiesCollection || !authController?.firestore) return;

  const firestore = authController.firestore;
  Promise.all(
    activities.map((activity) =>
      firestore.setDoc(
        firestore.doc(cloudActivitiesCollection, activity.id),
        sanitizeActivityForCloud(activity),
      ),
    ),
  ).catch(showAuthError);
}

function deleteActivityFromCloud(activityId) {
  if (!cloudActivitiesCollection || !authController?.firestore) return;

  const firestore = authController.firestore;
  firestore.deleteDoc(firestore.doc(cloudActivitiesCollection, activityId)).catch(showAuthError);
}

function showAuthError(error) {
  const messages = {
    "auth/popup-closed-by-user": "Se cerro la ventana antes de terminar el ingreso.",
    "auth/cancelled-popup-request": "El ingreso anterior fue cancelado.",
    "auth/network-request-failed": "No se pudo conectar con Google. Revisa tu conexion.",
    "auth/unauthorized-domain": "Este sitio todavia no esta autorizado para usar Google.",
  };
  authStatus.textContent = messages[error?.code] || "No se pudo completar el ingreso. Intenta nuevamente.";
}

function getInitials(value) {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";
}

function renderHeroSummary() {
  const todayActivities = activities.filter(
    (activity) => activity.status !== "completada" && isActivityOnDate(activity, todayISO),
  );
  const activeTrips = activities.filter(
    (activity) =>
      activity.type === "gira" &&
      activity.status !== "completada" &&
      (activity.endDate || activity.date) >= todayISO,
  );

  heroTodayCount.textContent = `${todayActivities.length}`;
  heroTripCount.textContent = `${activeTrips.length}`;
}

function renderActivityDashboard() {
  if (!dashboardToday || !dashboardPending || !dashboardTrips || !dashboardDone) return;

  const todayActivities = activities.filter((activity) => activity.status !== "completada" && isActivityOnDate(activity, todayISO));
  const pendingActivities = activities.filter((activity) => activity.status !== "completada");
  const activeTrips = activities.filter(
    (activity) =>
      activity.type === "gira" &&
      activity.status !== "completada" &&
      (activity.endDate || activity.date) >= todayISO,
  );
  const doneActivities = activities.filter((activity) => activity.status === "completada");

  dashboardToday.textContent = `${todayActivities.length}`;
  dashboardPending.textContent = `${pendingActivities.length}`;
  dashboardTrips.textContent = `${activeTrips.length}`;
  dashboardDone.textContent = `${doneActivities.length}`;
}

function renderActivities() {
  activityList.innerHTML = "";
  const visibleActivities = getVisibleActivities();
  activityCount.textContent = `${visibleActivities.length}`;

  if (visibleActivities.length === 0) {
    activityList.append(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  visibleActivities.forEach((activity) => {
    const card = document.createElement("article");
    card.className = `activity-card ${activity.priority} ${activity.type}`;
    card.innerHTML = `
      <div class="activity-main">
        <span class="activity-icon" aria-hidden="true">${getActivityIcon(activity.type)}</span>
        <div>
          <h3 class="activity-title">${escapeHTML(activity.title)}</h3>
          <div class="activity-meta">
            <span class="pill">${formatActivityDate(activity)}</span>
            <span class="pill">${capitalize(activity.type)}</span>
            ${activity.type === "gira" ? `<span class="pill">${getTripDuration(activity)}</span>` : ""}
            <span class="pill">Prioridad ${activity.priority}</span>
            <span class="pill">${capitalize(activity.status)}</span>
          </div>
        </div>
      </div>
      <div class="activity-progress ${activity.status.replace(/\s+/g, "-")}">
        <span>${getActivitySignal(activity)}</span>
      </div>
      ${renderActivityDetails(activity)}
      ${activity.notes ? `<p class="activity-notes">${escapeHTML(activity.notes)}</p>` : ""}
      <div class="activity-actions">
        <button class="status-button" type="button" data-action="next-status" data-id="${activity.id}">
          Cambiar estado
        </button>
        <button class="edit-button" type="button" data-action="edit" data-id="${activity.id}">
          Editar
        </button>
        <button class="delete-button" type="button" data-action="delete" data-id="${activity.id}">
          Eliminar
        </button>
      </div>
    `;
    activityList.append(card);
  });
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingDays + lastDay.getDate()) / 7) * 7;

  monthLabel.textContent = new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
  }).format(firstDay);

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - leadingDays + 1;
    const cellDate = new Date(year, month, dayNumber);
    const cellDateISO = toISODate(cellDate);
    const isCurrentMonth = cellDate.getMonth() === month;
    const dayActivities = activities
      .filter((activity) => isActivityOnDate(activity, cellDateISO))
      .sort((a, b) => `${a.time || "23:59"}${a.title}`.localeCompare(`${b.time || "23:59"}${b.title}`));

 const cell = document.createElement("article");

cell.className = `calendar-day${isCurrentMonth ? "" : " muted"}${cellDateISO === todayISO ? " today-cell" : ""}${dayActivities.length ? " has-items" : ""}`;

cell.dataset.date = cellDateISO;

cell.innerHTML = `
  <div class="calendar-day-number">${cellDate.getDate()}</div>

  <div class="calendar-items">
    ${dayActivities
      .map((activity) => renderCalendarItem(activity, cellDateISO))
      .join("")}
  </div>
`;

calendarGrid.append(cell);
  }
}

function getVisibleActivities() {
  return [...activities]
    .filter((activity) => {
      if (activitySearch && !getActivitySearchText(activity).includes(activitySearch)) return false;
      if (currentFilter === "todas") return true;
      if (currentFilter === "hoy") return isActivityOnDate(activity, todayISO);
      if (currentFilter === "semana") return isActivityBetweenDates(activity, todayISO, nextSevenDaysISO);
      if (["pendiente", "en proceso", "completada"].includes(currentFilter)) return activity.status === currentFilter;
      return activity.type === currentFilter;
    })
    .sort(compareActivities);
}

function getEndDate(data) {
  const type = data.get("type");
  const date = String(data.get("date") || "");
  const endDate = String(data.get("endDate") || "");
  if (type !== "gira") return "";
  if (!endDate || endDate < date) return date;
  return endDate;
}

function isActivityOnDate(activity, date) {
  const start = activity.date;
  const end = activity.endDate || activity.date;
  return Boolean(start) && date >= start && date <= end;
}

function isActivityBetweenDates(activity, startDate, endDate) {
  const start = activity.date;
  const end = activity.endDate || activity.date;
  return Boolean(start) && start <= endDate && end >= startDate;
}

function formatActivityDate(activity) {
  const start = formatDate(activity.date);
  const end = activity.endDate && activity.endDate !== activity.date ? ` - ${formatDate(activity.endDate)}` : "";
  const time = activity.time ? `, ${activity.time}` : "";
  return `${start}${end}${time}`;
}

function renderActivityDetails(activity) {
  const details = [
    activity.course ? ["Curso", activity.course] : null,
    activity.reminder && activity.reminder !== "sin" ? ["Recordatorio", formatReminder(activity.reminder)] : null,
  ].filter(Boolean);

  if (!details.length) return "";

  return `
    <div class="activity-extra">
      ${details
        .map(
          ([label, value]) => `
            <span>
              <small>${escapeHTML(label)}</small>
              <strong>${escapeHTML(value)}</strong>
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function formatReminder(value) {
  const labels = {
    sin: "Sin recordatorio",
    "mismo-dia": "El mismo dia",
    "1-dia": "1 dia antes",
    "3-dias": "3 dias antes",
  };
  return labels[value] || "Sin recordatorio";
}

function getActivityIcon(type) {
  const icons = {
    proyecto: "PR",
    tarea: "TA",
    gira: "GI",
    reunion: "EX",
    universidad: "UN",
    personal: "PE",
  };
  return icons[type] || "AC";
}

function getActivitySignal(activity) {
  if (activity.status === "completada") return "Completada";
  if (isActivityOnDate(activity, todayISO)) return "Para hoy";
  if (isActivityOnDate(activity, tomorrowISO)) return "Manana";
  if (activity.date < todayISO) return "Atrasada";
  if (isActivityBetweenDates(activity, todayISO, nextSevenDaysISO)) return "Esta semana";
  if (activity.type === "gira") return "Ruta programada";
  if (activity.status === "en proceso") return "En proceso";
  return "Proxima";
}

function getTripDuration(activity) {
  if (activity.type !== "gira") return "";
  const start = parseISODate(activity.date);
  const end = parseISODate(activity.endDate || activity.date);
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
  return days === 1 ? "1 dia" : `${days} dias`;
}

function getActivitySearchText(activity) {
  return [
    activity.title,
    activity.type,
    activity.priority,
    activity.status,
    activity.course,
    formatReminder(activity.reminder),
    activity.notes,
    formatActivityDate(activity),
  ]
    .join(" ")
    .toLowerCase();
}

function renderCalendarItem(activity, date) {
  const startsToday = activity.date === date;
  const endsToday =
    activity.endDate === date &&
    activity.endDate !== activity.date;

  const isTrip =
    activity.type === "gira" &&
    activity.endDate &&
    activity.endDate !== activity.date;

  const typeLabels = {
    proyecto: "Proyecto",
    tarea: "Tarea",
    gira: "Gira",
    reunion: "Examen",
    universidad: "Universidad",
    personal: "Personal",
  };

  const typeLabel = typeLabels[activity.type] || "Actividad";

  const activityLabel =
    startsToday && activity.time
      ? `${activity.time} ${activity.title}`
      : activity.title;

  let prefix = `${typeLabel}: `;

  // Las giras de varios días conservan Entrada / Gira / Salida
  if (isTrip) {
    if (startsToday) {
      prefix = "Entrada: ";
    } else if (endsToday) {
      prefix = "Salida: ";
    } else {
      prefix = "Gira: ";
    }
  }

  const className =
    `calendar-item ${activity.type} ${activity.priority}` +
    `${activity.status === "completada" ? " done" : ""}`;

  return `
    <button
      class="${className}"
      type="button"
      data-activity-id="${escapeHTML(activity.id)}"
      title="${escapeHTML(typeLabel)}: ${escapeHTML(activity.title)}"
    >
      ${escapeHTML(prefix + activityLabel)}
    </button>
  `;
}

function openActivityDialog(activity) {
  selectedActivityId = activity.id;
  activityDialogType.textContent = capitalize(activity.type);
  activityDialogTitle.textContent = activity.title;
  activityDialogDate.textContent = formatActivityDate(activity);
  activityDialogTime.textContent = activity.time || "Sin hora definida";
  activityDialogPriority.textContent = capitalize(activity.priority);
  activityDialogStatus.textContent = capitalize(activity.status);
  activityDialogCourse.textContent = activity.course || "Sin curso o referencia";
  activityDialogReminder.textContent = formatReminder(activity.reminder);
  activityDialogNotes.textContent = activity.notes || "Sin descripcion";
  activityDialog.showModal();
}

function startEditing(activity) {
  editingActivityId = activity.id;

  editTitleInput.value = activity.title;
  editTypeInput.value = activity.type;
  editPriorityInput.value = activity.priority;
  editDateInput.value = activity.date;
  editTimeInput.value = activity.time || "";
  editEndDateInput.value = activity.endDate || "";
  editCourseInput.value = activity.course || "";
  editReminderInput.value = activity.reminder || "sin";
  editNotesInput.value = activity.notes || "";

  syncEditTripFields();

  if (activityDialog.open) activityDialog.close();
  editActivityDialog.showModal();
  editTitleInput.focus();
}
editTypeInput.addEventListener("change", syncEditTripFields);

editDateInput.addEventListener("change", () => {
  if (editTypeInput.value === "gira" && (!editEndDateInput.value || editEndDateInput.value < editDateInput.value)) {
    editEndDateInput.value = editDateInput.value;
  }
});

closeEditActivityDialog.addEventListener("click", () => {
  editActivityDialog.close();
});

cancelEditModalButton.addEventListener("click", () => {
  editActivityDialog.close();
});

editActivityForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const activity = activities.find((item) => item.id === editingActivityId);
  if (!activity) return;

  activity.title = editTitleInput.value.trim();
  activity.type = editTypeInput.value;
  activity.priority = editPriorityInput.value;
  activity.date = editDateInput.value;
  activity.endDate = editTypeInput.value === "gira"
    ? editEndDateInput.value || editDateInput.value
    : "";
  activity.time = editTimeInput.value;
  activity.course = editCourseInput.value.trim();
  activity.reminder = editReminderInput.value;
  activity.notes = editNotesInput.value.trim();

  saveActivities();
  renderApp();

  editingActivityId = null;
  editActivityDialog.close();
});

function syncEditTripFields() {
  const isTrip = editTypeInput.value === "gira";
  editEndDateField.hidden = !isTrip;
  editEndDateInput.required = isTrip;
  editDateLabel.textContent = isTrip ? "Fecha de entrada" : "Fecha";

  if (isTrip && !editEndDateInput.value) {
    editEndDateInput.value = editDateInput.value;
  }

  if (!isTrip) {
    editEndDateInput.value = "";
  }
}

function deleteActivity(activity) {
  if (!activity) return;
  const confirmed = window.confirm(`Eliminar "${activity.title}"? Esta accion no se puede deshacer.`);
  if (!confirmed) return;

  activities = activities.filter((item) => item.id !== activity.id);
  if (editingActivityId === activity.id) resetActivityForm();
  if (activityDialog.open) activityDialog.close();
  deleteActivityFromCloud(activity.id);
  saveActivities();
  renderApp();
}

function resetActivityForm() {
  editingActivityId = null;
  form.reset();
  dateInput.value = todayISO;
  priorityInput.value = "media";
  endDateInput.value = "";
  syncTripFields();
  quickTitle.textContent = "Agregar actividad";
  saveActivityButton.textContent = "Guardar actividad";
  cancelEditButton.hidden = true;
  quickEntry.classList.remove("editing");
}

function syncTripFields() {
  const isTrip = typeInput.value === "gira";
  endDateField.hidden = !isTrip;
  endDateInput.required = isTrip;
  dateLabel.textContent = isTrip ? "Fecha de entrada" : "Fecha";
  if (isTrip && !endDateInput.value) endDateInput.value = dateInput.value;
  if (!isTrip) endDateInput.value = "";
}

function setActiveNav(targetId) {
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });
}

function loadActivities() {
  try {
    const storageKey = getStorageKey();
    const storedActivities = localStorage.getItem(storageKey);
    if (storedActivities) return JSON.parse(storedActivities);

    const sampleActivities = getSampleActivities();
    localStorage.setItem(storageKey, JSON.stringify(sampleActivities));
    return sampleActivities;
  } catch {
    return getSampleActivities();
  }
}

function saveActivities() {
  localStorage.setItem(getStorageKey(), JSON.stringify(activities));
  syncActivitiesToCloud();
}

function getStorageKey(userId = currentUserId) {
  return userId === "local" ? BASE_STORAGE_KEY : `${BASE_STORAGE_KEY}:${userId}`;
}

function getSampleActivities() {
  return [
    {
      id: crypto.randomUUID(),
      title: "Revisar avance del proyecto",
      type: "proyecto",
      priority: "alta",
      date: toISODate(new Date()),
      endDate: "",
      time: "18:00",
      course: "Proyecto final",
      reminder: "1-dia",
      notes: "Definir pendientes antes de la proxima entrega.",
      status: "pendiente",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Preparar gira programada",
      type: "gira",
      priority: "media",
      date: toISODate(addDays(new Date(), 2)),
      endDate: toISODate(addDays(new Date(), 4)),
      time: "07:30",
      course: "Gestion de calidad",
      reminder: "3-dias",
      notes: "Confirmar transporte, ubicacion y materiales.",
      status: "en proceso",
      createdAt: new Date().toISOString(),
    },
  ];
}

function normalizeCloudActivity(id, data) {
  return {
    id,
    title: String(data.title || ""),
    type: data.type || "tarea",
    priority: data.priority || "media",
    date: data.date || todayISO,
    endDate: data.endDate || "",
    time: data.time || "",
    course: data.course || "",
    reminder: data.reminder || "sin",
    notes: data.notes || "",
    status: data.status || "pendiente",
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function sanitizeActivityForCloud(activity) {
  return {
    title: activity.title || "",
    type: activity.type || "tarea",
    priority: activity.priority || "media",
    date: activity.date || todayISO,
    endDate: activity.endDate || "",
    time: activity.time || "",
    course: activity.course || "",
    reminder: activity.reminder || "sin",
    notes: activity.notes || "",
    status: activity.status || "pendiente",
    createdAt: activity.createdAt || new Date().toISOString(),
  };
}

function compareActivities(a, b) {
  const firstUrgency = getUrgencyRank(a);
  const secondUrgency = getUrgencyRank(b);
  if (firstUrgency !== secondUrgency) return firstUrgency - secondUrgency;

  const firstPriority = getPriorityRank(a.priority);
  const secondPriority = getPriorityRank(b.priority);
  if (firstPriority !== secondPriority) return firstPriority - secondPriority;

  const first = `${a.date || "9999-12-31"}T${a.time || "23:59"}`;
  const second = `${b.date || "9999-12-31"}T${b.time || "23:59"}`;
  return first.localeCompare(second);
}

function getUrgencyRank(activity) {
  if (activity.status === "completada") return 6;
  if ((activity.endDate || activity.date) < todayISO) return 0;
  if (isActivityOnDate(activity, todayISO)) return 1;
  if (isActivityOnDate(activity, tomorrowISO)) return 2;
  if (isActivityBetweenDates(activity, todayISO, nextSevenDaysISO)) return 3;
  if (activity.status === "en proceso") return 4;
  return 5;
}

function getPriorityRank(priority) {
  if (priority === "alta") return 0;
  if (priority === "media") return 1;
  return 2;
}

function exportActivitiesToCSV(items) {
  if (!items.length) {
    window.alert("No hay actividades para exportar con el filtro actual.");
    return;
  }

  const headers = ["Titulo", "Tipo", "Estado", "Prioridad", "Fecha", "Fecha de salida", "Hora", "Curso", "Recordatorio", "Notas"];
  const rows = items.map((activity) => [
    activity.title,
    activity.type,
    activity.status,
    activity.priority,
    activity.date,
    activity.endDate || "",
    activity.time || "",
    activity.course || "",
    formatReminder(activity.reminder),
    activity.notes || "",
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aventura-check-${todayISO}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function getNextStatus(status) {
  if (status === "pendiente") return "en proceso";
  if (status === "en proceso") return "completada";
  return "pendiente";
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function parseISODate(value) {
  const [year, month, day] = String(value || todayISO).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
