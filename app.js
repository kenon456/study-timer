
document.addEventListener("DOMContentLoaded", () => {
    const subjectInput = document.getElementById("subject-input");
    const durationSlider = document.getElementById("duration-slider");
    const durationDisplay = document.getElementById("duration-display");
    const addSessionBtn = document.getElementById("add-session-btn");
    const sessionList = document.getElementById("session-list");
    const totalDurationSpan = document.getElementById("total-duration");
    const subjectStatsList = document.getElementById("subject-stats-list");
    const recordTabBtn = document.getElementById("record-tab");
    const statsTabBtn = document.getElementById("stats-tab");
    const recordSection = document.getElementById("record-section");
    const statsSection = document.getElementById("stats-section");
    const noRecordsMessage = document.getElementById("no-records-message");
    const noStatsMessage = document.getElementById("no-stats-message");

    let studySessions = [];

    // 初期化
    loadSessions();
    renderSessions();
    renderStats();

    // イベントリスナー
    durationSlider.addEventListener("input", () => {
        durationDisplay.textContent = `${durationSlider.value}分`;
    });

    addSessionBtn.addEventListener("click", addSession);

    recordTabBtn.addEventListener("click", () => {
        switchTab("record");
    });

    statsTabBtn.addEventListener("click", () => {
        switchTab("stats");
    });

    // 関数定義
    function switchTab(tab) {
        recordTabBtn.classList.remove("active");
        statsTabBtn.classList.remove("active");
        recordSection.classList.remove("active");
        statsSection.classList.remove("active");

        if (tab === "record") {
            recordTabBtn.classList.add("active");
            recordSection.classList.add("active");
        } else {
            statsTabBtn.classList.add("active");
            statsSection.classList.add("active");
            renderStats(); // 統計タブ表示時に再描画
        }
    }

    function addSession() {
        const subject = subjectInput.value.trim();
        const duration = parseFloat(durationSlider.value);

        if (subject === "") {
            alert("科目名を入力してください。");
            return;
        }

        const newSession = {
            id: Date.now().toString(),
            subject: subject,
            duration: duration,
            startTime: new Date().toISOString(),
        };

        studySessions.push(newSession);
        saveSessions();
        renderSessions();
        renderStats();

        subjectInput.value = "";
        durationSlider.value = "30";
        durationDisplay.textContent = "30分";
    }

    function deleteSession(id) {
        studySessions = studySessions.filter((session) => session.id !== id);
        saveSessions();
        renderSessions();
        renderStats();
    }

    function loadSessions() {
        const savedSessions = localStorage.getItem("studySessions");
        if (savedSessions) {
            studySessions = JSON.parse(savedSessions).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        }
    }

    function saveSessions() {
        localStorage.setItem("studySessions", JSON.stringify(studySessions));
    }

    function renderSessions() {
        sessionList.innerHTML = "";
        if (studySessions.length === 0) {
            noRecordsMessage.style.display = "block";
        } else {
            noRecordsMessage.style.display = "none";
            studySessions.forEach((session) => {
                const li = document.createElement("li");
                const startTime = new Date(session.startTime);
                li.innerHTML = `
                    <div class="session-details">
                        <h4>${session.subject}</h4>
                        <p>時間: ${session.duration} 分</p>
                        <p>開始: ${startTime.toLocaleString()}</p>
                    </div>
                    <button class="delete-btn" data-id="${session.id}">削除</button>
                `;
                sessionList.appendChild(li);
            });

            sessionList.querySelectorAll(".delete-btn").forEach((button) => {
                button.addEventListener("click", (event) => {
                    deleteSession(event.target.dataset.id);
                });
            });
        }
    }

    function renderStats() {
        if (studySessions.length === 0) {
            totalDurationSpan.textContent = "0 時間";
            subjectStatsList.innerHTML = "";
            noStatsMessage.style.display = "block";
            return;
        }

        noStatsMessage.style.display = "none";

        const totalDurationMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0);
        totalDurationSpan.textContent = `${(totalDurationMinutes / 60).toFixed(1)} 時間`;

        const subjectDurations = {};
        studySessions.forEach((session) => {
            subjectDurations[session.subject] = (subjectDurations[session.subject] || 0) + session.duration;
        });

        subjectStatsList.innerHTML = "";
        Object.entries(subjectDurations)
            .sort(([, a], [, b]) => b - a) // 降順でソート
            .forEach(([subject, duration]) => {
                const li = document.createElement("li");
                li.innerHTML = `<span>${subject}</span><span>${(duration / 60).toFixed(1)} 時間</span>`;
                subjectStatsList.appendChild(li);
            });
    }

    // 初期タブの表示
    switchTab("record");
});

