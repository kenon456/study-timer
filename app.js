
document.addEventListener("DOMContentLoaded", () => {
    const subjectInput = document.getElementById("subject-input");
    const detailInput = document.getElementById("detail-input");
    const durationManualInput = document.getElementById("duration-manual");
    const durationSlider = document.getElementById("duration-slider");
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
    let subjectChartInstance = null;
    let dailyChartInstance = null;

    // 初期化
    loadSessions();
    renderSessions();
    renderStats();

    // イベントリスナー
    durationManualInput.addEventListener("input", () => {
        let value = parseInt(durationManualInput.value);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        durationManualInput.value = value;
        durationSlider.value = value;
    });
    durationSlider.addEventListener("input", () => {
        durationManualInput.value = durationSlider.value;
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
        const detail = detailInput.value.trim();
        const duration = parseFloat(durationManualInput.value);

        if (subject === "") {
            alert("科目名を入力してください。");
            return;
        }
        if (isNaN(duration) || duration <= 0) {
            alert("勉強時間を正しく入力してください。");
            return;
        }

        const newSession = {
            id: Date.now().toString(),
            subject: subject,
            detail: detail,
            duration: duration,
            startTime: new Date().toISOString(),
        };

        studySessions.push(newSession);
        saveSessions();
        renderSessions();
        renderStats();

        subjectInput.value = "";
        detailInput.value = "";
        durationManualInput.value = "30";
        durationSlider.value = "30";
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
                        ${session.detail ? `<p>詳細: ${session.detail}</p>` : ''}
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
            if (subjectChartInstance) subjectChartInstance.destroy();
            if (dailyChartInstance) dailyChartInstance.destroy();
            return;
        }

        noStatsMessage.style.display = "none";

        const totalDurationMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0);
        totalDurationSpan.textContent = `${(totalDurationMinutes / 60).toFixed(1)} 時間`;

        // 科目別統計
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
        
        renderSubjectChart(subjectDurations);

        // 日別統計
        const dailyDurations = {};
        studySessions.forEach(session => {
            const date = new Date(session.startTime).toLocaleDateString('ja-JP');
            dailyDurations[date] = (dailyDurations[date] || 0) + session.duration;
        });

        renderDailyChart(dailyDurations);
    }

    function renderSubjectChart(subjectDurations) {
        if (subjectChartInstance) {
            subjectChartInstance.destroy();
        }
        const ctx = document.getElementById('subjectChart').getContext('2d');
        const labels = Object.keys(subjectDurations);
        const data = Object.values(subjectDurations).map(d => (d / 60).toFixed(1)); // 時間に変換

        subjectChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#007aff', '#34c759', '#ff9500', '#eb5545', '#5856d6',
                        '#ff2d55', '#af52de', '#ffcc00', '#a2845e', '#636266'
                    ],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '科目別勉強時間 (時間)'
                    }
                }
            }
        });
    }

    function renderDailyChart(dailyDurations) {
        if (dailyChartInstance) {
            dailyChartInstance.destroy();
        }
        const ctx = document.getElementById('dailyChart').getContext('2d');
        const sortedDates = Object.keys(dailyDurations).sort((a, b) => new Date(a) - new Date(b));
        const data = sortedDates.map(date => (dailyDurations[date] / 60).toFixed(1)); // 時間に変換

        dailyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: '日別勉強時間 (時間)',
                    data: data,
                    backgroundColor: '#007aff',
                    borderColor: '#007aff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '日別勉強時間 (時間)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '時間'
                        }
                    }
                }
            }
        });
    }

    // 初期タブの表示
    switchTab("record");
});

