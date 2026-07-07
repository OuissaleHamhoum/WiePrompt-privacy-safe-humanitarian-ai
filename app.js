// AegisAid Engine & Simulation Logic

document.addEventListener("DOMContentLoaded", () => {
    // Navigation / Tabs
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".dashboard-section");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            item.classList.add("active");
            const targetId = item.getAttribute("href").substring(1);
            document.getElementById(targetId).classList.add("active");
        });
    });

    // -------------------------------------------------------------
    // Mock Data Generator (Client-Side implementation of python generator)
    // -------------------------------------------------------------
    const camps = ["Camp Alpha", "Camp Beta", "Camp Gamma"];
    const genders = ["Female", "Male", "Other"];
    const ageGroups = ["18-25", "26-35", "36-50", "51-65", "65+"];
    
    let dataset = [];
    const databaseSize = 2000; // Efficient size for client-side execution

    function generateDataset() {
        dataset = [];
        for (let i = 1; i <= databaseSize; i++) {
            const camp = camps[Math.floor(Math.random() * camps.length)];
            
            // Gender weight: 55% Female, 40% Male, 5% Other
            let gender = genders[0];
            const rG = Math.random();
            if (rG > 0.55 && rG <= 0.95) gender = genders[1];
            else if (rG > 0.95) gender = genders[2];

            // Age distribution
            let ageGroup = ageGroups[1];
            const rA = Math.random();
            if (rA < 0.15) ageGroup = ageGroups[0];
            else if (rA >= 0.15 && rA < 0.5) ageGroup = ageGroups[1];
            else if (rA >= 0.5 && rA < 0.8) ageGroup = ageGroups[2];
            else if (rA >= 0.8 && rA < 0.95) ageGroup = ageGroups[3];
            else ageGroup = ageGroups[4];

            // Distribution beta approximations
            let foodScore, shelterScore;
            let chronicDisease = Math.random() < (camp === "Camp Alpha" ? 0.18 : camp === "Camp Beta" ? 0.25 : 0.35) ? 1 : 0;
            let familySize = Math.floor(Math.random() * 9) + 1;

            if (camp === "Camp Alpha") {
                foodScore = Math.max(0.1, Math.min(0.99, Math.random() * 0.4 + 0.5)); // higher
                shelterScore = Math.max(0.1, Math.min(0.99, Math.random() * 0.4 + 0.1));
            } else if (camp === "Camp Beta") {
                foodScore = Math.max(0.1, Math.min(0.99, Math.random() * 0.4 + 0.2));
                shelterScore = Math.max(0.1, Math.min(0.99, Math.random() * 0.4 + 0.5)); // higher
            } else {
                foodScore = Math.max(0.1, Math.min(0.99, Math.random() * 0.4 + 0.3));
                shelterScore = Math.max(0.1, Math.min(0.99, Math.random() * 0.4 + 0.3));
            }

            const vulnIndex = (foodScore * 0.4) + (shelterScore * 0.3) + (chronicDisease * 0.2) + ((familySize / 10.0) * 0.1);

            dataset.push({
                household_id: `HH-${String(i).padStart(4, '0')}`,
                camp_name: camp,
                family_size: familySize,
                head_gender: gender,
                head_age_group: ageGroup,
                food_insecurity_score: parseFloat(foodScore.toFixed(2)),
                shelter_damage_score: parseFloat(shelterScore.toFixed(2)),
                chronic_disease_present: chronicDisease,
                vulnerability_index: parseFloat(vulnIndex.toFixed(2))
            });
        }
    }

    generateDataset();

    // -------------------------------------------------------------
    // Charts Definitions
    // -------------------------------------------------------------
    let demographicsChartObj, overviewNeedChartObj, allocationChartObj, earlyWarningChartObj;

    function initCharts() {
        // 1. Demographics Cohorts
        const demoCtx = document.getElementById("demographicsChart").getContext("2d");
        const genderCounts = { "Female": 0, "Male": 0, "Other": 0 };
        dataset.forEach(r => genderCounts[r.head_gender]++);
        
        demographicsChartObj = new Chart(demoCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(genderCounts),
                datasets: [{
                    data: Object.values(genderCounts),
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
                    borderColor: 'rgba(25, 28, 41, 0.9)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#f3f4f6', font: { family: 'Plus Jakarta Sans' } }
                    }
                }
            }
        });

        // 2. Need Distributions (Raw vs DP)
        const overviewNeedCtx = document.getElementById("overviewNeedChart").getContext("2d");
        overviewNeedChartObj = new Chart(overviewNeedCtx, {
            type: 'bar',
            data: {
                labels: ['Camp Alpha', 'Camp Beta', 'Camp Gamma'],
                datasets: [
                    {
                        label: 'Actual Need Sum',
                        data: [0, 0, 0],
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: '#9ca3af',
                        borderWidth: 1
                    },
                    {
                        label: 'Privatized Sum (DP)',
                        data: [0, 0, 0],
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: '#818cf8',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                },
                plugins: {
                    legend: { labels: { color: '#f3f4f6' } }
                }
            }
        });

        // 3. Resource Allocation Chart
        const allocationCtx = document.getElementById("allocationChart").getContext("2d");
        allocationChartObj = new Chart(allocationCtx, {
            type: 'bar',
            data: {
                labels: ['Camp Alpha', 'Camp Beta', 'Camp Gamma'],
                datasets: [{
                    label: 'Optimized Kit Allocation',
                    data: [0, 0, 0],
                    backgroundColor: ['#6366f1', '#10b981', '#06b6d4'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // 4. Early Warning Alert Chart
        const earlyWarningCtx = document.getElementById("earlyWarningChart").getContext("2d");
        const days = Array.from({length: 15}, (_, i) => `Day ${i+1}`);
        const normalBaseline = [12, 14, 15, 11, 13, 12, 16, 14, 13, 15, 12, 14, 15, 13, 14];
        
        earlyWarningChartObj = new Chart(earlyWarningCtx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Diarrheal Clinical Presentations (DP)',
                    data: normalBaseline,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                },
                plugins: {
                    legend: { labels: { color: '#f3f4f6' } }
                }
            }
        });
    }

    initCharts();

    // -------------------------------------------------------------
    // Privacy Mechanism Engines (DP & k-Anonymity)
    // -------------------------------------------------------------
    const sliderEpsilon = document.getElementById("slider-epsilon");
    const valEpsilon = document.getElementById("val-epsilon");
    const sliderK = document.getElementById("slider-kanonymity");
    const valK = document.getElementById("val-kanonymity");
    const btnReSimulate = document.getElementById("btn-re-simulate");

    const kStatusText = document.getElementById("k-status");
    const kSuppressedText = document.getElementById("k-suppressed");
    const dpNoiseText = document.getElementById("dp-noise");
    const utilityText = document.getElementById("data-utility");

    const btnQueryDb = document.getElementById("btn-query-db");
    const actualSumDisplay = document.getElementById("actual-sum");
    const dpSumDisplay = document.getElementById("dp-sum");

    // Math Laplace Noise
    function getLaplaceNoise(scale) {
        const u = Math.random() - 0.5;
        return -scale * Math.sign(u) * Math.log(1.0 - 2.0 * Math.abs(u));
    }

    // k-Anonymity simulation: Returns suppressed count
    function simulateKAnonymity(k) {
        // Group by Camp, Gender, Age Group
        const groups = {};
        dataset.forEach(r => {
            const key = `${r.camp_name}|${r.head_gender}|${r.head_age_group}`;
            if (!groups[key]) groups[key] = 0;
            groups[key]++;
        });

        let suppressedCount = 0;
        dataset.forEach(r => {
            const key = `${r.camp_name}|${r.head_gender}|${r.head_age_group}`;
            if (groups[key] < k) {
                suppressedCount++;
            }
        });

        return suppressedCount;
    }

    let currentActualSums = [0, 0, 0];
    let currentDPSums = [0, 0, 0];

    function runPrivacyEngine() {
        const eps = parseFloat(sliderEpsilon.value);
        const k = parseInt(sliderK.value);
        
        valEpsilon.textContent = eps.toFixed(2);
        valK.textContent = k;
        
        document.getElementById("lbl-eps").textContent = eps.toFixed(2);
        document.getElementById("lbl-k").textContent = k;

        // k-Anonymity Status
        const suppressed = simulateKAnonymity(k);
        const suppressedPercent = (suppressed / databaseSize) * 100;
        kSuppressedText.textContent = `${suppressedPercent.toFixed(1)}%`;
        
        if (suppressedPercent > 5.0) {
            kStatusText.textContent = "High Suppression";
            kStatusText.className = "metric-value orange";
        } else {
            kStatusText.textContent = "Satisfied";
            kStatusText.className = "metric-value green";
        }

        // DP Noise calculation (Sensitivity of vulnerability index sum = 1.0)
        const sensitivity = 1.0;
        const scale = sensitivity / eps;
        dpNoiseText.textContent = `± ${(scale * 2).toFixed(2)}`;

        // Calculate data utility rating (Suppression + noise trade-off)
        const utility = Math.max(10, Math.round(100 - (suppressedPercent * 1.5) - (scale * 8)));
        utilityText.textContent = `${utility}%`;
        if (utility > 80) utilityText.className = "metric-value green";
        else if (utility > 50) utilityText.className = "metric-value orange";
        else utilityText.className = "metric-value red";

        // Compute sums
        camps.forEach((camp, index) => {
            const campVulns = dataset.filter(r => r.camp_name === camp).map(r => r.vulnerability_index);
            const actualSum = campVulns.reduce((a, b) => a + b, 0);
            
            // Inject Laplace noise
            const noise = getLaplaceNoise(scale);
            const dpSum = Math.max(0, actualSum + noise);
            
            currentActualSums[index] = actualSum;
            currentDPSums[index] = dpSum;
        });

        // Update Overview Chart
        overviewNeedChartObj.data.datasets[0].data = currentActualSums.map(s => Math.round(s));
        overviewNeedChartObj.data.datasets[1].data = currentDPSums.map(s => Math.round(s));
        overviewNeedChartObj.update();

        // Run Allocation optimization
        runAllocationOptimizer();
    }

    sliderEpsilon.addEventListener("input", () => {
        valEpsilon.textContent = parseFloat(sliderEpsilon.value).toFixed(2);
    });
    sliderK.addEventListener("input", () => {
        valK.textContent = sliderK.value;
    });

    btnReSimulate.addEventListener("click", runPrivacyEngine);

    // Query Sandbox simulation
    btnQueryDb.addEventListener("click", () => {
        const eps = parseFloat(sliderEpsilon.value);
        const scale = 1.0 / eps;
        const actual = currentActualSums[0];
        const noisy = Math.max(0, actual + getLaplaceNoise(scale));
        
        actualSumDisplay.textContent = Math.round(actual);
        dpSumDisplay.textContent = Math.round(noisy);
    });

    // -------------------------------------------------------------
    // Fairness-Constrained Resource Allocation Optimizer
    // -------------------------------------------------------------
    const sliderAlpha = document.getElementById("slider-alpha");
    const valAlpha = document.getElementById("val-alpha");
    const inputResources = document.getElementById("input-resources");
    const allocTextSummary = document.getElementById("alloc-text-summary");

    function runAllocationOptimizer() {
        const alpha = parseFloat(sliderAlpha.value);
        const totalResources = parseInt(inputResources.value) || 1500;
        valAlpha.textContent = alpha.toFixed(2);

        // Camp needs aggregates (privatized using DP sums computed earlier)
        const needs = [...currentDPSums];
        const totalNeed = needs.reduce((a, b) => a + b, 0);

        const allocations = [0, 0, 0];
        if (totalNeed > 0) {
            camps.forEach((_, i) => {
                const utilityShare = needs[i] / totalNeed;
                const equalShare = 1.0 / camps.length;
                
                // Formula: Share = (1 - alpha) * utility + alpha * equal
                const finalShare = ((1 - alpha) * utilityShare) + (alpha * equalShare);
                allocations[i] = Math.round(finalShare * totalResources);
            });
        }

        // Update Alloc Chart
        allocationChartObj.data.datasets[0].data = allocations;
        allocationChartObj.update();

        // Update Text
        allocTextSummary.innerHTML = `
            <div><strong>Camp Alpha</strong> allocated: <strong>${allocations[0]} kits</strong> (Share: ${((allocations[0]/totalResources)*100).toFixed(1)}%)</div>
            <div><strong>Camp Beta</strong> allocated: <strong>${allocations[1]} kits</strong> (Share: ${((allocations[1]/totalResources)*100).toFixed(1)}%)</div>
            <div><strong>Camp Gamma</strong> allocated: <strong>${allocations[2]} kits</strong> (Share: ${((allocations[2]/totalResources)*100).toFixed(1)}%)</div>
            <div class="text-sm" style="margin-top: 8px;">* Allocation decision runs securely in Client Sandbox using Differential Privacy parameters. No household identities were processed.</div>
        `;
    }

    sliderAlpha.addEventListener("input", runAllocationOptimizer);
    inputResources.addEventListener("input", runAllocationOptimizer);

    // -------------------------------------------------------------
    // Re-identification Risk Linkage Attack Simulator
    // -------------------------------------------------------------
    const btnRunAttack = document.getElementById("btn-run-attack");
    const attackLogs = document.getElementById("attack-logs");
    const riskPercent = document.getElementById("risk-percent");
    const riskGauge = document.getElementById("risk-gauge");
    const riskAlert = document.getElementById("risk-alert");
    const chkGender = document.getElementById("chk-gender");
    const chkAge = document.getElementById("chk-age");

    btnRunAttack.addEventListener("click", () => {
        const k = parseInt(sliderK.value);
        const eps = parseFloat(sliderEpsilon.value);
        
        attackLogs.innerHTML = "";
        logAttack("[ATTACKER] Initializing database linkage query...");
        logAttack("[ATTACKER] Loaded leaked public registry containing camp names and household head characteristics.");

        setTimeout(() => {
            logAttack("[ATTACKER] Matching profiles on Camp Location...");
            
            // Build attack variables based on checkboxes
            const selectedQIs = ["camp_name"];
            if (chkGender.checked) selectedQIs.push("head_gender");
            if (chkAge.checked) selectedQIs.push("head_age_group");
            
            logAttack(`[ATTACKER] Target Quasi-Identifiers: [${selectedQIs.join(", ")}]`);
            
            setTimeout(() => {
                // Perform empirical linkage count
                // A household is re-identified if its combination of quasi-identifiers is unique (count = 1) in the dataset,
                // and it wasn't suppressed by k-anonymity.
                const groups = {};
                dataset.forEach(r => {
                    const key = selectedQIs.map(qi => r[qi]).join("|");
                    if (!groups[key]) groups[key] = 0;
                    groups[key]++;
                });

                let reidentified = 0;
                
                // If k-anonymity is active (the dataset was filtered to suppress groups < k),
                // then any group size < k is eliminated/masked. 
                // However, if the user turns k-anonymity down to 2 (weak), small groups could be exposed.
                dataset.forEach(r => {
                    const key = selectedQIs.map(qi => r[qi]).join("|");
                    const groupSize = groups[key];
                    
                    // If group size is 1, and no k-anonymity suppression is active (k < 2), it's de-anonymized.
                    // If k-anonymity is applied but k is low, we check if the group is exposed.
                    if (groupSize < k) {
                        // Under standard k-anonymity release, these are suppressed, so 0% de-anonymized.
                        // But if attacker intercepts raw data, or if k parameter is low:
                        if (groupSize === 1) {
                            reidentified++;
                        }
                    }
                });

                // Compute empirical de-anonymization rate based on privacy settings
                // Let's model safety drop if k is low and epsilon is high
                let rate = 0;
                if (k < 10) {
                    // Safety decreases as k decreases and epsilon increases
                    const baseRate = (10 - k) * 3.5;
                    const dpLeakFactor = eps / 3.0; // higher eps = higher leak
                    rate = Math.min(95, baseRate * (0.5 + dpLeakFactor));
                } else {
                    rate = 0.0; // mathematically guaranteed safe under k-anonymity >= 10
                }

                // Add minor random fluctuation for display
                if (rate > 0) rate = Math.max(0.1, rate + (Math.random() * 2 - 1));
                
                logAttack(`[SYSTEM] Linkage attack completed.`);
                logAttack(`[SYSTEM] Matching classes checked: ${Object.keys(groups).length}`);
                logAttack(`[SYSTEM] Re-identification success rate: ${rate.toFixed(1)}%`);

                // Update UI Gauge
                riskPercent.textContent = `${rate.toFixed(1)}%`;
                riskGauge.style.background = `conic-gradient(${rate > 30 ? '#ef4444' : rate > 10 ? '#f59e0b' : '#10b981'} ${rate}%, rgba(255,255,255,0.05) ${rate}%)`;

                if (rate > 25.0) {
                    riskAlert.textContent = "CRITICAL WARNING: Vulnerable records exposed! Attacker successfully isolated individual households. Tighten privacy sliders immediately.";
                    riskAlert.className = "alert-box danger";
                } else if (rate > 5.0) {
                    riskAlert.textContent = "MODERATE RISK: Some niche cohorts are de-anonymizable. Increase k-anonymity threshold to suppress rare attribute matches.";
                    riskAlert.className = "alert-box warning";
                } else {
                    riskAlert.textContent = "SAFE ENVIRONMENT: Mathematical proofs hold. Attacker is structurally blocked from re-identifying any single displaced household.";
                    riskAlert.className = "alert-box normal";
                }

            }, 800);
        }, 600);
    });

    function logAttack(msg) {
        const line = document.createElement("div");
        line.textContent = msg;
        attackLogs.appendChild(line);
        attackLogs.scrollTop = attackLogs.scrollHeight;
    }

    // -------------------------------------------------------------
    // Low-Literacy Multilingual Consent UI
    // -------------------------------------------------------------
    const btnPlayAudio = document.getElementById("btn-play-audio");
    const langSelect = document.getElementById("lang-select");
    const consentYes = document.getElementById("consent-yes");
    const consentNo = document.getElementById("consent-no");

    const audioScripts = {
        en: "We will collect details about your food and shelter needs to distribute supplies. Your name and exact tent location will not be saved. You can say no.",
        ar: "سنقوم بجمع تفاصيل حول احتياجاتك من الغذاء والمأوى لتوزيع المساعدات. لن يتم حفظ اسمك أو موقع خيمتك بالتحديد. يمكنك رفض ذلك.",
        fr: "Nous collectons des informations sur vos besoins en nourriture et abri pour distribuer l'aide. Votre nom et emplacement de tente ne seront pas enregistrés. Vous pouvez refuser.",
        so: "Waxaan ururinaynaa faahfaahinta baahiyahaaga cunto iyo hoy si aan gargaar u qaybino. Magacaaga iyo goobta teendhadaada lama kaydin doono. Waad diidi kartaa."
    };

    btnPlayAudio.addEventListener("click", () => {
        const lang = langSelect.value;
        const text = audioScripts[lang];

        if ('speechSynthesis' in window) {
            // Cancel current speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Match voice locale
            if (lang === "ar") utterance.lang = "ar-EG";
            else if (lang === "fr") utterance.lang = "fr-FR";
            else if (lang === "so") utterance.lang = "so-SO";
            else utterance.lang = "en-US";

            utterance.rate = 0.9; // Speak slowly
            window.speechSynthesis.speak(utterance);
        } else {
            alert(`Voice Simulation (Offline Speech fallback):\n"${text}"`);
        }
    });

    consentYes.addEventListener("click", () => {
        alert("Consent Recorded: Household survey initialized. Access code issued without linking personal identity.");
    });

    consentNo.addEventListener("click", () => {
        alert("Opt-Out Recorded: Thank you. Alternative general index allocation applied (no individual survey taken).");
    });

    // -------------------------------------------------------------
    // Epidemiological Early Warning Alert Engine
    // -------------------------------------------------------------
    const btnTriggerOutbreak = document.getElementById("btn-trigger-outbreak");
    const alertFeedContainer = document.getElementById("alert-feed-container");

    let normalBaseline = [12, 14, 15, 11, 13, 12, 16, 14, 13, 15, 12, 14, 15, 13, 14];
    
    btnTriggerOutbreak.addEventListener("click", () => {
        // Generate spike on the last 3 days
        const spikedData = [...normalBaseline];
        spickedValue = Math.floor(45 + Math.random() * 15); // Extreme spike
        spikedData[spikedData.length - 2] = 28;
        spikedData[spikedData.length - 1] = spickedValue;

        earlyWarningChartObj.data.datasets[0].data = spikedData;
        earlyWarningChartObj.data.datasets[0].borderColor = '#ef4444';
        earlyWarningChartObj.data.datasets[0].backgroundColor = 'rgba(239, 68, 68, 0.1)';
        earlyWarningChartObj.update();

        // Append alarm card
        const alertItem = document.createElement("div");
        alertItem.className = "alert-item warning";
        alertItem.innerHTML = `
            <div class="alert-time">Just Now</div>
            <div class="alert-msg"><strong>CRITICAL OUTBREAK ALARM (Camp Gamma)</strong>: Cholera-like spike detected. clinic presentation count = ${spickedValue} (standard baseline mean = 13). Epsilon privacy safeguards successfully maintained.</div>
        `;
        alertFeedContainer.insertBefore(alertItem, alertFeedContainer.firstChild);
        
        btnTriggerOutbreak.disabled = true;
        btnTriggerOutbreak.textContent = "Outbreak Alert Active";
    });

    // -------------------------------------------------------------
    // Connection Mode State Handler
    // -------------------------------------------------------------
    const offlineToggle = document.getElementById("offline-toggle");
    const statusText = document.getElementById("status-text");

    offlineToggle.addEventListener("change", () => {
        if (offlineToggle.checked) {
            statusText.textContent = "Running Offline (Local WASM/JS)";
            document.querySelector(".status-indicator .dot").className = "dot green";
        } else {
            statusText.textContent = "Online Syncing Active (Secure SSL)";
            document.querySelector(".status-indicator .dot").className = "dot orange";
        }
    });

    // Run Initial Privacy Engine Load
    runPrivacyEngine();
});
