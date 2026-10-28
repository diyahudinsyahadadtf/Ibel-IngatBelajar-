/* =================================
   DAYFLOW - JAVASCRIPT
================================= */

/* 1. MENGAMBIL ELEMEN HTML */

const $ = (selector) => document.querySelector(selector);

const taskForm = $("#task-form");
const taskName = $("#task-name");
const taskDate = $("#task-date");
const taskPriority = $("#task-priority");
const taskList = $("#task-list");

const scheduleForm = $("#schedule-form");
const scheduleTime = $("#schedule-time");
const scheduleActivity = $("#schedule-activity");
const scheduleList = $("#schedule-list");

/* 2. PENYIMPANAN DATA */

function loadData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

let tasks = loadData("dayflow-tasks");
let schedules = loadData("dayflow-schedules");

function saveTasks() {
    localStorage.setItem("dayflow-tasks", JSON.stringify(tasks));
}

function saveSchedules() {
    localStorage.setItem(
        "dayflow-schedules",
        JSON.stringify(schedules)
    );
}

/* 3. TANGGAL DAN SAPAAN */

function updateDate() {
    const now = new Date();

    $("#current-date").textContent =
        now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    const hour = now.getHours();
    let greeting = "Selamat malam";

    if (hour >= 4 && hour < 11) {
        greeting = "Selamat pagi";
    } else if (hour >= 11 && hour < 15) {
        greeting = "Selamat siang";
    } else if (hour >= 15 && hour < 18) {
        greeting = "Selamat sore";
    }

    $("#greeting").textContent = greeting + "!";
}

updateDate();

/* 4. MEMBUAT ELEMEN */

function createElement(tag, className, text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;
    return element;
}

/* 5. MENAMPILKAN TUGAS */

function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        taskList.appendChild(
            createElement(
                "p",
                "empty-state",
                "Belum ada tugas. Tambahkan tugas pertamamu!"
            )
        );
    }

    tasks.forEach((task) => {
        const item = createElement(
            "article",
            "task-item" + (task.completed ? " completed" : "")
        );

        const main = createElement("div", "task-main");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Tandai tugas selesai");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
            updateDashboard();
        });

        const info = createElement("div", "task-info");

        info.appendChild(
            createElement("h4", "", task.name)
        );

        const dateText = task.date
            ? new Date(task.date + "T00:00:00")
                .toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
            : "Tanpa tenggat";

        info.appendChild(
            createElement("p", "", "Tenggat: " + dateText)
        );

        info.appendChild(
            createElement(
                "span",
                "priority " + task.priority,
                task.priority
            )
        );

        main.append(checkbox, info);

        const actions = createElement("div", "task-actions");

        const editButton = createElement("button", "", "Edit");
        editButton.type = "button";

        editButton.addEventListener("click", () => {
            const newName = prompt("Ubah nama tugas:", task.name);

            if (newName !== null && newName.trim() !== "") {
                task.name = newName.trim();
                saveTasks();
                renderTasks();
            }
        });

        const deleteButton = createElement("button", "", "Hapus");
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            if (confirm("Yakin ingin menghapus tugas ini?")) {
                tasks = tasks.filter((t) => t.id !== task.id);
                saveTasks();
                renderTasks();
                updateDashboard();
            }
        });

        actions.append(editButton, deleteButton);
        item.append(main, actions);
        taskList.appendChild(item);
    });

    $("#task-count").textContent = tasks.length + " tugas";
}

/* 6. MENAMBAH TUGAS */

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = taskName.value.trim();

    if (!name || !taskDate.value) {
        alert("Isi nama tugas dan tenggat waktunya.");
        return;
    }

    tasks.push({
        id: Date.now().toString() + Math.random(),
        name: name,
        date: taskDate.value,
        priority: taskPriority.value,
        completed: false
    });

    saveTasks();
    renderTasks();
    updateDashboard();

    taskForm.reset();
    taskPriority.value = "Sedang";
});

/* 7. DASHBOARD DAN PROGRES */

function updateDashboard() {
    const total = tasks.length;

    const completed = tasks.filter(
        (task) => task.completed
    ).length;

    const pending = total - completed;

    const percent = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    $("#total-tasks").textContent = total;
    $("#completed-tasks").textContent = completed;
    $("#pending-tasks").textContent = pending;
    $("#progress-percent").textContent = percent + "%";
    $("#progress-bar").style.width = percent + "%";
}

/* 8. JADWAL HARIAN */

function renderSchedules() {
    scheduleList.replaceChildren();

    if (schedules.length === 0) {
        scheduleList.appendChild(
            createElement(
                "p",
                "empty-state",
                "Belum ada jadwal. Tambahkan kegiatanmu!"
            )
        );
        return;
    }

    schedules.sort((a, b) => a.time.localeCompare(b.time));

    schedules.forEach((schedule) => {
        const item = createElement("article", "schedule-item");

        item.appendChild(
            createElement("span", "schedule-time", schedule.time)
        );

        item.appendChild(
            createElement(
                "span",
                "schedule-activity",
                schedule.activity
            )
        );

        const deleteButton = createElement(
            "button",
            "secondary-button",
            "Hapus"
        );

        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            schedules = schedules.filter(
                (s) => s.id !== schedule.id
            );

            saveSchedules();
            renderSchedules();
        });

        item.appendChild(deleteButton);
        scheduleList.appendChild(item);
    });
}

scheduleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const time = scheduleTime.value;
    const activity = scheduleActivity.value.trim();

    if (!time || !activity) {
        alert("Isi waktu dan nama kegiatan.");
        return;
    }

    schedules.push({
        id: Date.now().toString() + Math.random(),
        time: time,
        activity: activity
    });

    saveSchedules();
    renderSchedules();
    scheduleForm.reset();
});

/* 9. FOCUS TIMER */

const timerDisplay = $("#timer-display");
const timerMode = $("#timer-mode");
const startButton = $("#timer-start");
const resetButton = $("#timer-reset");

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

let remainingSeconds = FOCUS_SECONDS;
let isRunning = false;
let isBreak = false;
let timerInterval = null;

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    timerMode.textContent = isBreak
        ? "Waktu Istirahat"
        : "Waktu Fokus";

    startButton.textContent = isRunning ? "Jeda" : "Mulai";
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    updateTimerDisplay();
}

function startTimer() {
    if (isRunning) {
        stopTimer();
        return;
    }

    isRunning = true;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        remainingSeconds--;

        if (remainingSeconds <= 0) {
            stopTimer();

            alert(
                isBreak
                    ? "Waktu istirahat selesai!"
                    : "Sesi fokus selesai! Saatnya istirahat."
            );

            isBreak = !isBreak;
            remainingSeconds = isBreak
                ? BREAK_SECONDS
                : FOCUS_SECONDS;

            updateTimerDisplay();
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

startButton.addEventListener("click", startTimer);

resetButton.addEventListener("click", () => {
    stopTimer();
    isBreak = false;
    remainingSeconds = FOCUS_SECONDS;
    updateTimerDisplay();
});

/* 10. NAVIGASI */

document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach((item) => {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});

/* 11. MENAMPILKAN DATA SAAT HALAMAN DIBUKA */

renderTasks();
renderSchedules();
updateDashboard();
updateTimerDisplay();
