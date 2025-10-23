
document.addEventListener("DOMContentLoaded", () => {

    // UI要素の取得
    const subjectSelect = document.getElementById("subject-select");
    const newSubjectInput = document.getElementById("new-subject-input"); // 設定タブの新しい科目入力フィールド
    const addSubjectBtnSettings = document.getElementById("add-subject-btn"); // 設定タブの科目追加ボタン
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
    const gachaTabBtn = document.getElementById("gacha-tab");
    const charactersTabBtn = document.getElementById("characters-tab");
    const gachaSection = document.getElementById("gacha-section");
    const charactersSection = document.getElementById("characters-section");
    const currentStonesSpan = document.getElementById("current-stones");
    const gacha1PullBtn = document.getElementById("gacha-1-pull");
    const gacha10PullBtn = document.getElementById("gacha-10-pull");
    const gachaResultsDiv = document.getElementById("gacha-results");
    const characterListDiv = document.getElementById("character-list");
    const noCharactersMessage = document.getElementById("no-characters-message");
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
    let gachaHistory = [];
    let acquiredCharacters = [];
    let consecutivePullsWithoutSSR = 0; // 天井システム用: SSRが出なかった連続回数
    let gachaPullCount = 0; // 天井システム用: ガチャ総回数

    // ガチャアイテム定義
    const gachaItems = {
        'star5': [
            { name: 'ウェンティ', rarity: 5, type: 'character' }, { name: 'クレー', rarity: 5, type: 'character' }, { name: 'タルタリヤ', rarity: 5, type: 'character' }, { name: '鍾離', rarity: 5, type: 'character' }, { name: 'アルベド', rarity: 5, type: 'character' },
            { name: '甘雨', rarity: 5, type: 'character' }, { name: '魈', rarity: 5, type: 'character' }, { name: '胡桃', rarity: 5, type: 'character' }, { name: 'エウルア', rarity: 5, type: 'character' }, { name: '楓原万葉', rarity: 5, type: 'character' },
            { name: '神里綾華', rarity: 5, type: 'character' }, { name: '宵宮', rarity: 5, type: 'character' }, { name: '雷電将軍', rarity: 5, type: 'character' }, { name: '珊瑚宮心海', rarity: 5, type: 'character' }, { name: '荒瀧一斗', rarity: 5, type: 'character' },
            { name: '申鶴', rarity: 5, type: 'character' }, { name: '八重神子', rarity: 5, type: 'character' }, { name: '神里綾人', rarity: 5, type: 'character' }, { name: '夜蘭', rarity: 5, type: 'character' }, { name: 'ティナリ', rarity: 5, type: 'character' },
            { name: 'セノ', rarity: 5, type: 'character' }, { name: 'ニィロウ', rarity: 5, type: 'character' }, { name: 'ナヒーダ', rarity: 5, type: 'character' }, { name: '放浪者', rarity: 5, type: 'character' }, { name: 'アルハイゼン', rarity: 5, type: 'character' },
            { name: 'ディシア', rarity: 5, type: 'character' }, { name: '白朮', rarity: 5, type: 'character' }, { name: 'リネ', rarity: 5, type: 'character' }, { name: 'ヌヴィレット', rarity: 5, type: 'character' }, { name: 'リオセスリ', rarity: 5, type: 'character' },
            { name: 'フリーナ', rarity: 5, type: 'character' }, { name: 'ナヴィア', rarity: 5, type: 'character' }, { name: '閑雲', rarity: 5, type: 'character' }, { name: '千織', rarity: 5, type: 'character' }, { name: 'アルレッキーノ', rarity: 5, type: 'character' },
            { name: 'クロリンデ', rarity: 5, type: 'character' }, { name: 'シグウィン', rarity: 5, type: 'character' }, { name: 'セトス', rarity: 5, type: 'character' }, { name: '螺旋の祝福', rarity: 5, type: 'character' }, { name: '原石の塊', rarity: 5, type: 'character' },
            { name: 'モラの花', rarity: 5, type: 'character' }, { name: '経験値の書', rarity: 5, type: 'character' }, { name: '仕上げ用魔鉱', rarity: 5, type: 'character' }, { name: '天賦の素材', rarity: 5, type: 'character' }, { name: '武器突破素材', rarity: 5, type: 'character' },
            { name: '聖遺物', rarity: 5, type: 'character' }, { name: '濃縮樹脂', rarity: 5, type: 'character' }, { name: '脆弱樹脂', rarity: 5, type: 'character' }, { name: '出会いの縁', rarity: 5, type: 'character' }, { name: '紡がれた運命', rarity: 5, type: 'character' },
            { name: '王冠', rarity: 5, type: 'character' }, { name: '知恵の冠', rarity: 5, type: 'character' }, { name: '調度品設計図', rarity: 5, type: 'character' }, { name: '便利アイテム', rarity: 5, type: 'character' }, { name: '特産品', rarity: 5, type: 'character' },
            { name: '料理', rarity: 5, type: 'character' }, { name: '不思議な鉱石', rarity: 5, type: 'character' }, { name: '冒険者の経験', rarity: 5, type: 'character' }, { name: '大英雄の経験', rarity: 5, type: 'character' }, { name: '仕上げ用良鉱', rarity: 5, type: 'character' }
        ],
        'star4': [
            { name: 'フィッシュル', rarity: 4, type: 'character' }, { name: 'スクロース', rarity: 4, type: 'character' }, { name: 'ベネット', rarity: 4, type: 'character' }, { name: 'ノエル', rarity: 4, type: 'character' }, { name: 'リサ', rarity: 4, type: 'character' },
            { name: 'ガイア', rarity: 4, type: 'character' }, { name: 'アンバー', rarity: 4, type: 'character' }, { name: 'バーバラ', rarity: 4, type: 'character' }, { name: '香菱', rarity: 4, type: 'character' }, { name: '凝光', rarity: 4, type: 'character' },
            { name: '北斗', rarity: 4, type: 'character' }, { name: '行秋', rarity: 4, type: 'character' }, { name: '重雲', rarity: 4, type: 'character' }, { name: 'レザー', rarity: 4, type: 'character' }, { name: '辛炎', rarity: 4, type: 'character' },
            { name: 'ディオナ', rarity: 4, type: 'character' }, { name: 'ロサリア', rarity: 4, type: 'character' }, { name: '煙緋', rarity: 4, type: 'character' }, { name: '早柚', rarity: 4, type: 'character' }, { name: '九条裟羅', rarity: 4, type: 'character' },
            { name: 'トーマ', rarity: 4, type: 'character' }, { name: 'ゴロー', rarity: 4, type: 'character' }, { name: '雲菫', rarity: 4, type: 'character' }, { name: '久岐忍', rarity: 4, type: 'character' }, { name: '鹿野院平蔵', rarity: 4, type: 'character' },
            { name: 'コレイ', rarity: 4, type: 'character' }, { name: 'ドリー', rarity: 4, type: 'character' }, { name: 'キャンディス', rarity: 4, type: 'character' }, { name: 'レイラ', rarity: 4, type: 'character' }, { name: 'ファルザン', rarity: 4, type: 'character' },
            { name: 'ヨォーヨ', rarity: 4, type: 'character' }, { name: 'ミカ', rarity: 4, type: 'character' }, { name: 'カヴェ', rarity: 4, type: 'character' }, { name: '綺良々', rarity: 4, type: 'character' }, { name: 'フレミネ', rarity: 4, type: 'character' },
            { name: 'シャルロット', rarity: 4, type: 'character' }, { name: 'シュヴルーズ', rarity: 4, type: 'character' }, { name: '嘉明', rarity: 4, type: 'character' }, { name: 'セシリアの苗', rarity: 4, type: 'character' }, { name: '風車アスター', rarity: 4, type: 'character' },
            { name: 'ググプラム', rarity: 4, type: 'character' }, { name: 'ヴァルベリー', rarity: 4, type: 'character' }, { name: '慕風のマッシュルーム', rarity: 4, type: 'character' }, { name: 'イグサ', rarity: 4, type: 'character' }, { name: '落落莓', rarity: 4, type: 'character' },
            { name: '絶雲の唐辛子', rarity: 4, type: 'character' }, { name: '霓裳花', rarity: 4, type: 'character' }, { name: '琉璃百合', rarity: 4, type: 'character' }
        ],
        'star3': [
            { name: '仕上げ用鉱石', rarity: 3, type: 'material' }, { name: 'モラ', rarity: 3, type: 'material' }, { name: '冒険家の経験', rarity: 3, type: 'material' },
            { name: '脆弱な樹脂', rarity: 3, type: 'material' }, { name: '聖遺物残骸', rarity: 3, type: 'material' }, { name: '武器強化素材', rarity: 3, type: 'material' }
        ]
    };

    // 初期化
    loadData();
    renderSubjects();
    renderSessions();
    renderSubjectColorSettings();
    setCurrentDateTime(); // 初期表示時に現在日時を設定
    renderStats();
    renderCharacters();
    updateGachaStoneCount();

    // 初期タブを「記録」に設定
    switchTab("record");


    // 設定タブの科目追加ボタンにイベントリスナーを追加
    addSubjectBtnSettings.addEventListener("click", addSubject);

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

    
    // 科目選択が変更されたとき


    // タブボタンにイベントリスナーを追加
    document.querySelectorAll(".tab-selector button").forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.id.replace("-tab", "");

            switchTab(tabId);
        });
    });

    // 関数定義
    function switchTab(tab) {
        // すべてのタブボタンとセクションを非アクティブ化
        document.querySelectorAll(".tab-selector button").forEach(btn => btn.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));

        // 選択されたタブをアクティブ化
        document.getElementById(`${tab}-tab`).classList.add("active");
        const targetSection = document.getElementById(`${tab}-section`);
        if (targetSection) {
            targetSection.classList.add("active");
        } else {
            console.error(`Section not found for tab: ${tab}`);
        }

        // 各タブに固有の処理
        if (tab === "record") {
            setCurrentDateTime(); // 記録タブに戻った時に現在日時を設定
            renderSubjects(); // 記録タブでも科目選択を更新
            renderSessions();
        } else if (tab === "stats") {
            renderStats(); // 統計タブ表示時に再描画
        } else if (tab === "settings") {
            renderSubjects(); // 設定タブ表示時に科目リストを再描画
            renderSubjectColorSettings(); // 設定タブ表示時に色設定を再描画
        } else if (tab === "gacha") {
            updateGachaStoneCount();
        } else if (tab === "characters") {
            renderCharacters();
        }
    }

    function setCurrentDateTime() {
        const now = new Date(); // now変数をここで定義
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');

        dateInput.value = `${year}-${month}-${day}`;
        timeInput.value = `${hours}:${minutes}`;
    }

    function addSubject() {
        const newSubject = newSubjectInput.value.trim();
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
        newSubjectInput.value = "";

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
        const now = new Date(); // add this line to define 'now'
        let subject = subjectSelect.value;
        // 科目選択が空で、かつ入力フィールドに値がある場合、入力フィールドの値を採用
        if (subject === "" && newSubjectInput.value.trim() !== "") {
            subject = newSubjectInput.value.trim();
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

        // 日付または時刻が空の場合、記録追加ボタン押下時刻を自動設定
        if (!selectedDate) {
            selectedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        }
        if (!selectedTime) {
            selectedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
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
            stones: duration * 10, // 1分あたり10個の石
            startTime: sessionDateTime.toISOString()
        };

        studySessions.push(newSession);
        gachaHistory.push({ type: 'stone_gain', amount: newSession.stones, sourceId: newSession.id, timestamp: new Date().toISOString() });
        studySessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // 最新の記録が上に来るようにソート
        saveData();
        renderSubjects();
        renderSessions();
        renderStats();
        updateGachaStoneCount();

        // 入力フィールドをリセット
        subjectSelect.value = "";
        newSubjectInput.value = "";
        detailInput.value = "";
        durationManualInput.value = "30";
        durationSlider.value = "30";
        // setCurrentDateTime(); // 現在日時を再設定 (記録追加後に自動リセットしない)
    }

    function deleteSession(id) {
        const sessionIdToDelete = id;

        if (confirm("この勉強記録を削除してもよろしいですか？")) {
            const deletedSession = studySessions.find(session => session.id === sessionIdToDelete);
            studySessions = studySessions.filter(session => session.id !== sessionIdToDelete);

            if (deletedSession) {
                // gachaHistoryから対応する石の獲得記録を削除
                gachaHistory = gachaHistory.filter(entry => !(entry.type === 'stone_gain' && entry.sourceId === sessionIdToDelete));
            }

            saveData();
            renderSessions();
            renderStats();
            updateGachaStoneCount();
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
        const savedGachaHistory = localStorage.getItem("gachaHistory");
        if (savedGachaHistory) {
            gachaHistory = JSON.parse(savedGachaHistory);
        }
        const savedAcquiredCharacters = localStorage.getItem("acquiredCharacters");
        if (savedAcquiredCharacters) {
            acquiredCharacters = JSON.parse(savedAcquiredCharacters);
        }
        const savedGachaPullCount = localStorage.getItem("gachaPullCount");
        if (savedGachaPullCount) {
            gachaPullCount = parseInt(savedGachaPullCount);
        }
        const savedConsecutivePullsWithoutSSR = localStorage.getItem("consecutivePullsWithoutSSR");
        if (savedConsecutivePullsWithoutSSR) {
            consecutivePullsWithoutSSR = parseInt(savedConsecutivePullsWithoutSSR);
        }
    }

    function saveData() {
        localStorage.setItem("studySessions", JSON.stringify(studySessions));
        localStorage.setItem("registeredSubjects", JSON.stringify(registeredSubjects));
        localStorage.setItem("subjectColors", JSON.stringify(subjectColors));
        localStorage.setItem("gachaHistory", JSON.stringify(gachaHistory));
        localStorage.setItem("acquiredCharacters", JSON.stringify(acquiredCharacters));
        localStorage.setItem("gachaPullCount", gachaPullCount.toString());
        localStorage.setItem("consecutivePullsWithoutSSR", consecutivePullsWithoutSSR.toString());
    }

    function renderSubjects() {
        subjectSelect.innerHTML = '<option value="">科目を選択または入力</option>';
        registeredSubjectsList.innerHTML = "";

        // 科目選択ドロップダウンの更新
        registeredSubjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });

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

            document.querySelectorAll(".delete-subject-btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    deleteSubject(event.target.dataset.subject);
                });
            });
        }
    }

    function renderSessions() {
        sessionList.innerHTML = "";
        if (studySessions.length === 0) {
            noRecordsMessage.style.display = "block";
        } else {
            noRecordsMessage.style.display = "none";
            studySessions.forEach(session => {
                const li = document.createElement("li");
                const sessionDateTime = new Date(session.startTime);
                const formattedDate = sessionDateTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });
                const formattedTime = sessionDateTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
                li.innerHTML = `
                    <div>
                        <h4>${session.subject}</h4>
                        <p>${session.detail}</p>
                        <small>${formattedDate} ${formattedTime} - ${session.duration} 分</small>
                    </div>
                    <button class="delete-btn" data-id="${session.id}">削除</button>
                `;
                sessionList.appendChild(li);
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    deleteSession(event.target.dataset.id);
                });
            });
        }
    }

    function renderStats() {
        const totalDuration = studySessions.reduce((total, session) => total + session.duration, 0);
        const hours = Math.floor(totalDuration / 60);
        const minutes = totalDuration % 60;
        totalDurationSpan.textContent = `${hours} 時間 ${minutes} 分`;

        const totalStones = studySessions.reduce((total, session) => total + session.stones, 0);
        totalStonesSpan.textContent = totalStones;

        const subjectDurations = {};
        studySessions.forEach(session => {
            if (subjectDurations[session.subject]) {
                subjectDurations[session.subject] += session.duration;
            } else {
                subjectDurations[session.subject] = session.duration;
            }
        });

        subjectStatsList.innerHTML = "";
        if (Object.keys(subjectDurations).length === 0) {
            noStatsMessage.style.display = "block";
        } else {
            noStatsMessage.style.display = "none";
            for (const subject in subjectDurations) {
                const li = document.createElement("li");
                const subjectHours = Math.floor(subjectDurations[subject] / 60);
                const subjectMinutes = subjectDurations[subject] % 60;
                li.textContent = `${subject}: ${subjectHours} 時間 ${subjectMinutes} 分`;
                subjectStatsList.appendChild(li);
            }
        }

        // 科目別勉強時間グラフ
        const subjectCtx = document.getElementById('subjectChart').getContext('2d');
        if (subjectChartInstance) {
            subjectChartInstance.destroy();
        }
        subjectChartInstance = new Chart(subjectCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(subjectDurations),
                datasets: [{
                    label: '科目別勉強時間 (分)',
                    data: Object.values(subjectDurations),
                    backgroundColor: Object.keys(subjectDurations).map(subject => subjectColors[subject] || getRandomColor(subject)),
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // 日別勉強時間グラフ
        const dailyDurations = {};
        studySessions.forEach(session => {
            const date = new Date(session.startTime).toLocaleDateString('ja-JP');
            if (dailyDurations[date]) {
                dailyDurations[date] += session.duration;
            } else {
                dailyDurations[date] = session.duration;
            }
        });

        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
        if (dailyChartInstance) {
            dailyChartInstance.destroy();
        }
        dailyChartInstance = new Chart(dailyCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(dailyDurations).reverse(),
                datasets: [{
                    label: '日別勉強時間 (分)',
                    data: Object.values(dailyDurations).reverse(),
                    backgroundColor: 'rgba(0, 122, 255, 0.7)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function renderSubjectColorSettings() {
        colorSettingsDiv.innerHTML = "";
        if (registeredSubjects.length > 0) {
            registeredSubjects.forEach(subject => {
                const colorSetting = document.createElement("div");
                const currentColor = subjectColors[subject] || getRandomColor(subject);
                colorSetting.innerHTML = `
                    <label for="color-${subject}">${subject}</label>
                    <input type="color" id="color-${subject}" value="${currentColor}">
                `;
                colorSettingsDiv.appendChild(colorSetting);

                document.getElementById(`color-${subject}`).addEventListener("input", (event) => {
                    subjectColors[subject] = event.target.value;
                    saveData();
                    renderStats(); // 色が変更されたら統計グラフを再描画
                });
            });
        }
    }

    function getRandomColor(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    // ガチャ関連の関数

    function updateGachaStoneCount() {
        const totalStones = studySessions.reduce((total, session) => total + session.stones, 0);
        const spentStones = gachaHistory.filter(entry => entry.type === 'gacha_pull').reduce((total, entry) => total + entry.cost, 0);
        const currentStones = totalStones - spentStones;
        currentStonesSpan.textContent = currentStones;
    }

    function performGacha(pulls) {
        console.log(`performGacha called with ${pulls} pulls.`);
        const cost = pulls * 160;
        const totalStones = studySessions.reduce((total, session) => total + session.stones, 0);
        const spentStones = gachaHistory.filter(entry => entry.type === 'gacha_pull').reduce((total, entry) => total + entry.cost, 0);
        const currentStones = totalStones - spentStones;

        if (currentStones < cost) {
            alert("石が足りません。");
            return;
        }

        let results = [];
        let guaranteedSR = false;

        for (let i = 0; i < pulls; i++) {
            gachaPullCount++;
            let item;

            // 確定枠のチェック (星3が9連続)
            if (consecutivePullsWithoutSSR >= 9) {
                guaranteedSR = true;
            }

            if (guaranteedSR) {
                const rand = Math.random();
                if (rand < 0.006) { // 星5
                    item = gachaItems.star5[Math.floor(Math.random() * gachaItems.star5.length)];
                } else { // 星4
                    item = gachaItems.star4[Math.floor(Math.random() * gachaItems.star4.length)];
                }
                guaranteedSR = false; // 確定枠消費
                consecutivePullsWithoutSSR = 0;
            } else {
                // 天井システムのチェック
                let ssrRate = 0.006;
                if (gachaPullCount >= 75) {
                    ssrRate += (gachaPullCount - 74) * 0.06;
                }

                const rand = Math.random();
                if (rand < ssrRate) { // 星5
                    item = gachaItems.star5[Math.floor(Math.random() * gachaItems.star5.length)];
                    gachaPullCount = 0; // 天井リセット
                    consecutivePullsWithoutSSR = 0;
                } else if (rand < 0.06) { // 星4
                    item = gachaItems.star4[Math.floor(Math.random() * gachaItems.star4.length)];
                    consecutivePullsWithoutSSR = 0;
                } else { // 星3
                    item = gachaItems.star3[Math.floor(Math.random() * gachaItems.star3.length)];
                    consecutivePullsWithoutSSR++;
                }
            }
            results.push(item);
            acquiredCharacters.push(item);
        }

        gachaHistory.push({ type: 'gacha_pull', items: results, cost: cost, timestamp: new Date().toISOString() });
        saveData();

        renderGachaResults(results);
        updateGachaStoneCount();
        renderCharacters();
    }

    function renderGachaResults(results) {
        console.log("renderGachaResults called with:", results);
        gachaResultsDiv.innerHTML = "<h3>ガチャ結果</h3>";
        results.forEach((item, index) => {
            const p = document.createElement("p");
            let stars = "";
            for (let i = 0; i < item.rarity; i++) {
                stars += "☆";
            }
            p.textContent = `${index + 1}連目: ${stars}${item.name}`;

            gachaResultsDiv.appendChild(p);
        });
    }

    function renderCharacters() {
        characterListDiv.innerHTML = "";
        if (acquiredCharacters.length === 0) {
            noCharactersMessage.style.display = "block";
        } else {
            noCharactersMessage.style.display = "none";
            const characterGroups = {};
            acquiredCharacters.forEach(char => {
                if (characterGroups[char.name]) {
                    characterGroups[char.name].count++;
                } else {
                    characterGroups[char.name] = { ...char, count: 1 };
                }
            });

            const sortedCharacters = Object.values(characterGroups).sort((a, b) => {
                if (a.rarity !== b.rarity) {
                    return b.rarity - a.rarity;
                }
                return a.name.localeCompare(b.name);
            });

            sortedCharacters.forEach(char => {
                const li = document.createElement("li");
                let stars = "";
                for (let i = 0; i < char.rarity; i++) {
                    stars += "☆";
                }
                li.textContent = `${stars} ${char.name} (x${char.count})`;
                characterListDiv.appendChild(li);
            });
        }
    }

    gacha1PullBtn.addEventListener("click", () => performGacha(1));
    gacha10PullBtn.addEventListener("click", () => performGacha(10));

});

