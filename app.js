
document.addEventListener("DOMContentLoaded", () => {
    // UI要素の取得
    const subjectSelect = document.getElementById("subject-select");
    const subjectInput = document.getElementById("subject-input");
    const addSubjectBtn = document.getElementById("add-subject-btn");
    const detailInput = document.getElementById("detail-input");
    const durationManualInput = document.getElementById("duration-manual");
    const durationSlider = document.getElementById("duration-slider");
    const dateInput = document.getElementById("date-input");
    const timeInput = document.getElementById("time-input");
    const addSessionBtn = document.getElementById("add-session-btn");
    const sessionList = document.getElementById("session-list");
    const totalDurationSpan = document.getElementById("total-duration");
    const totalStonesSpan = document.getElementById("total-stones");
    const subjectStatsList = document.getElementById("subject-stats-list");
    const recordTabBtn = document.getElementById("record-tab");
    const statsTabBtn = document.getElementById("stats-tab");
    const settingsTabBtn = document.getElementById("settings-tab");
    const recordSection = document.getElementById("record-section");
    const statsSection = document.getElementById("stats-section");
    const settingsSection = document.getElementById("settings-section");
    const noRecordsMessage = document.getElementById("no-records-message");
    const noStatsMessage = document.getElementById("no-stats-message");
    const registeredSubjectsList = document.getElementById("registered-subjects-list");
    const noSubjectsMessage = document.getElementById("no-subjects-message");
    const colorSettingsDiv = document.getElementById("color-settings");

    let studySessions = [];
    let registeredSubjects = [];
    let subjectColors = {};
    let subjectChartInstance = null;
    let dailyChartInstance = null;

    // 初期化
    loadData();
    renderSubjects();
    renderSessions();
    renderSubjectColorSettings();
    setCurrentDateTime(); // 初期表示時に現在日時を設定

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
    addSubjectBtn.addEventListener("click", addSubject);
    
    // 科目選択が変更されたとき
    subjectSelect.addEventListener("change", () => {
        if (subjectSelect.value === "") {
            subjectInput.style.display = "block"; // 「科目を選択または入力」が選ばれたら入力フィールドを表示
            subjectInput.focus();
        } else {
            subjectInput.style.display = "none"; // 既存の科目が選ばれたら入力フィールドを隠す
            subjectInput.value = ""; // 入力フィールドの値をクリア
        }
    });

    recordTabBtn.addEventListener("click", () => {
        switchTab("record");
    });

    statsTabBtn.addEventListener("click", () => {
        switchTab("stats");
    });

    settingsTabBtn.addEventListener("click", () => {
        switchTab("settings");
    });

    // 関数定義
    function switchTab(tab) {
        // すべてのタブボタンとセクションを非アクティブ化
        recordTabBtn.classList.remove("active");
        statsTabBtn.classList.remove("active");
        settingsTabBtn.classList.remove("active");
        recordSection.classList.remove("active");
        statsSection.classList.remove("active");
        settingsSection.classList.remove("active");

        // 選択されたタブをアクティブ化
        if (tab === "record") {
            recordTabBtn.classList.add("active");
            recordSection.classList.add("active");
            setCurrentDateTime(); // 記録タブに戻った時に現在日時を設定
        } else if (tab === "stats") {
            statsTabBtn.classList.add("active");
            statsSection.classList.add("active");
            renderStats(); // 統計タブ表示時に再描画
        } else if (tab === "settings") {
            settingsTabBtn.classList.add("active");
            settingsSection.classList.add("active");
            renderSubjects(); // 設定タブ表示時に科目リストを再描画
            renderSubjectColorSettings(); // 設定タブ表示時に色設定を再描画
        }
    }

    function setCurrentDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');

        dateInput.value = `${year}-${month}-${day}`;
        timeInput.value = `${hours}:${minutes}`;
    }

    function addSubject() {
        const newSubject = subjectInput.value.trim();
        if (newSubject === "") {
            alert("科目名を入力してください。");
            return;
        }
        if (registeredSubjects.includes(newSubject)) {
            alert("その科目は既に登録されています。");
            return;
        }
        registeredSubjects.push(newSubject);
        registeredSubjects.sort();
        saveData();
        renderSubjects();
        subjectInput.value = "";
        subjectInput.style.display = "none"; // 追加後は入力フィールドを隠す
        subjectSelect.value = ""; // 選択をリセット
        renderSubjectColorSettings();
    }

    function deleteSubject(subjectToDelete) {
        if (confirm(`「${subjectToDelete}」を削除してもよろしいですか？この科目の記録は削除されません。`)) {
            registeredSubjects = registeredSubjects.filter(sub => sub !== subjectToDelete);
            // 削除された科目の色設定もクリア
            if (subjectColors[subjectToDelete]) {
                delete subjectColors[subjectToDelete];
            }
            saveData();
            renderSubjects();
            renderSubjectColorSettings();
            renderStats(); // 統計も更新
        }
    }

    function addSession() {
        let subject = subjectSelect.value;
        // 科目選択が空で、かつ入力フィールドに値がある場合、入力フィールドの値を採用
        if (subject === "" && subjectInput.value.trim() !== "") {
            subject = subjectInput.value.trim();
        } else if (subject === "") {
            alert("科目名を選択または入力してください。");
            return;
        }

        const detail = detailInput.value.trim();
        const duration = parseFloat(durationManualInput.value);
        let selectedDate = dateInput.value;
        let selectedTime = timeInput.value;

        if (isNaN(duration) || duration <= 0) {
            alert("勉強時間を正しく入力してください。");
            return;
        }

        // 日付または時刻が空の場合、現在の日時で補完
        const now = new Date();
        if (!selectedDate) {
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            selectedDate = `${year}-${month}-${day}`;
        }
        if (!selectedTime) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            selectedTime = `${hours}:${minutes}`;
        }

        const sessionDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
        if (isNaN(sessionDateTime.getTime())) {
            alert("日付または時刻の形式が正しくありません。\n例: 2023-01-01 12:30");
            return;
        }

        const confirmation = confirm(
            `以下の内容で記録しますか？\n\n` +
            `科目: ${subject}\n` +
            `時間: ${duration} 分\n` +
            `詳細: ${detail || 'なし'}\n` +
            `日時: ${sessionDateTime.toLocaleString('ja-JP')}`
        );

        if (!confirmation) {
            return;
        }

        // 新しい科目であれば登録
        if (!registeredSubjects.includes(subject)) {
            registeredSubjects.push(subject);
            registeredSubjects.sort();
        }

        const newSession = {
            id: Date.now().toString(),
            subject: subject,
            detail: detail,
            duration: duration,
            startTime: sessionDateTime.toISOString(),
            stones: duration * 10 // 1分あたり10個の石
        };

        studySessions.push(newSession);
        studySessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // 最新の記録が上に来るようにソート
        saveData();
        renderSubjects();
        renderSessions();
        renderStats();

        // 入力フィールドをリセット
        subjectInput.value = "";
        subjectInput.style.display = "none";
        subjectSelect.value = "";
        detailInput.value = "";
        durationManualInput.value = "30";
        durationSlider.value = "30";
        setCurrentDateTime(); // 現在日時を再設定
    }

    function deleteSession(id) {
        if (confirm("この勉強記録を削除してもよろしいですか？")) {
            studySessions = studySessions.filter((session) => session.id !== id);
            saveData();
            renderSessions();
            renderStats();
        }
    }

    function loadData() {
        const savedSessions = localStorage.getItem("studySessions");
        if (savedSessions) {
            studySessions = JSON.parse(savedSessions).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        }
        const savedSubjects = localStorage.getItem("registeredSubjects");
        if (savedSubjects) {
            registeredSubjects = JSON.parse(savedSubjects).sort();
        }
        const savedColors = localStorage.getItem("subjectColors");
        if (savedColors) {
            subjectColors = JSON.parse(savedColors);
        }
    }

    function saveData() {
        localStorage.setItem("studySessions", JSON.stringify(studySessions));
        localStorage.setItem("registeredSubjects", JSON.stringify(registeredSubjects));
        localStorage.setItem("subjectColors", JSON.stringify(subjectColors));
    }

    function renderSubjects() {
        subjectSelect.innerHTML = '<option value="">科目を選択または入力</option>';
        registeredSubjectsList.innerHTML = "";

        // 科目選択ドロップダウンの更新
        if (registeredSubjects.length > 0) {
            registeredSubjects.forEach(subject => {
                const option = document.createElement("option");
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
            subjectInput.style.display = "none"; // 登録科目がある場合は入力フィールドを隠す
        } else {
            subjectInput.style.display = "block"; // 登録科目がない場合は入力フィールドを表示
        }

        // 設定タブの科目リストの更新
        if (registeredSubjects.length === 0) {
            noSubjectsMessage.style.display = "block";
        } else {
            noSubjectsMessage.style.display = "none";
            registeredSubjects.forEach(subject => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${subject}</span>
                    <button class="delete-subject-btn" data-subject="${subject}">削除</button>
                `;
                registeredSubjectsList.appendChild(li);
            });
        }

        registeredSubjectsList.querySelectorAll(".delete-subject-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                deleteSubject(event.target.dataset.subject);
            });
        });
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
                        <p>開始: ${startTime.toLocaleString('ja-JP')}</p>
                        <p>獲得石: ${session.stones} 個</p>
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
            totalStonesSpan.textContent = "0 個";
            subjectStatsList.innerHTML = "";
            noStatsMessage.style.display = "block";
            if (subjectChartInstance) subjectChartInstance.destroy();
            if (dailyChartInstance) dailyChartInstance.destroy();
            return;
        }

        noStatsMessage.style.display = "none";

        const totalDurationMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0);
        totalDurationSpan.textContent = `${(totalDurationMinutes / 60).toFixed(1)} 時間`;
        const totalStones = studySessions.reduce((sum, session) => sum + session.stones, 0);
        totalStonesSpan.textContent = `${totalStones} 個`;

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

        const backgroundColors = labels.map(subject => {
            // 既存の色があればそれを使用、なければランダムな色を生成して保存
            if (!subjectColors[subject]) {
                subjectColors[subject] = getRandomColor();
                saveData(); // 新しい色を保存
            }
            return subjectColors[subject];
        });

        subjectChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    },
                    title: {
                        display: true,
                        text: '科目別勉強時間 (時間)',
                        color: getComputedStyle(document.body).color // テキスト色をCSSから取得
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
        // 日付をソートしてグラフの表示順を保証
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
                        labels: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    },
                    title: {
                        display: true,
                        text: '日別勉強時間 (時間)',
                        color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '時間',
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        },
                        ticks: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    }
                }
            }
        });
    }

    function renderSubjectColorSettings() {
        colorSettingsDiv.innerHTML = ''; // コンテンツをクリア
        if (registeredSubjects.length === 0) {
            const p = document.createElement('p');
            p.className = 'message-text';
            p.textContent = '科目ごとのグラフ色をここで設定できます。科目を登録すると表示されます。';
            colorSettingsDiv.appendChild(p);
            return;
        }

        registeredSubjects.forEach(subject => {
            const div = document.createElement('div');
            // 色がまだ設定されていなければランダムな色を割り当てる
            if (!subjectColors[subject]) {
                subjectColors[subject] = getRandomColor();
                saveData(); // 新しい色を保存
            }
            div.innerHTML = `
                <label for="color-${subject}">${subject}</label>
                <input type="color" id="color-${subject}" value="${subjectColors[subject]}">
            `;
            const colorInput = div.querySelector(`#color-${subject}`);
            colorInput.addEventListener('change', (event) => {
                subjectColors[subject] = event.target.value;
                saveData();
                renderStats(); // 色変更後に統計グラフを再描画
            });
            colorSettingsDiv.appendChild(div);
        });
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // 初期タブの表示
    switchTab("record");
});

