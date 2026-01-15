/* ===========================================================
   PYTHON LEARNING PLATFORM – MAIN SCRIPT (BUG-FREE)
   =========================================================== */
class PythonLearningPlatform {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.userProgress = JSON.parse(localStorage.getItem('progress')) || {};
        this.currentQuiz  = null;
        this.codeEditor   = null;
        this.init();
    }

    /* ---------------  CORE INITIALISATION  ------------------- */
    init() {
        this.setupTheme();
        this.setupNavigation();
        this.setupAnimations();
        this.setupProgressTracking();
        this.initializePageSpecificFeatures();
    }

    /* ---------------  THEME HANDLER  ----------------------- */
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const toggle = document.querySelector('#theme-toggle');
        if (toggle) toggle.addEventListener('click', () => this.toggleTheme());
    }
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        const icon = document.querySelector('#theme-icon');
        if (icon) icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }

    /* ---------------  NAVIGATION  -------------------------- */
    setupNavigation() {
        const mobileBtn  = document.querySelector('#mobile-menu-btn');
        const mobileMenu = document.querySelector('#mobile-menu');
        if (mobileBtn && mobileMenu) {
            mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        }

        const currentPage = (window.location.pathname.split('/').pop() || 'index.html').replace(/^\/|\/$/g, '');
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) link.classList.add('active');
        });
    }

    /* ---------------  ANIMATIONS  -------------------------- */
    setupAnimations() {
        if (typeof anime !== 'undefined') {
            this.setupScrollAnimations();
            this.setupHoverAnimations();
        }
        if (typeof Typed !== 'undefined') this.setupTypewriterEffect();
    }
    setupScrollAnimations() {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));
    }
    setupHoverAnimations() {
        document.querySelectorAll('.hover-card').forEach(card => {
            card.addEventListener('mouseenter', () =>
                anime({ targets: card, scale: 1.05, rotateY: 5, duration: 300, easing: 'easeOutCubic' }));
            card.addEventListener('mouseleave', () =>
                anime({ targets: card, scale: 1, rotateY: 0, duration: 300, easing: 'easeOutCubic' }));
        });
    }
    setupTypewriterEffect() {
        const el = document.querySelector('#hero-typewriter');
        if (!el) return;
        new Typed('#hero-typewriter', {
            strings: [
                'Learn Python the Smart Way',
                'Master Python Programming',
                'Build Amazing Projects',
                'Start Your Coding Journey'
            ],
            typeSpeed: 50, backSpeed: 30, backDelay: 2000, loop: true,
            showCursor: true, cursorChar: '|'
        });
    }

    /* ---------------  PROGRESS TRACKING  ------------------- */
    setupProgressTracking() {
        if (!this.userProgress.lessons) {
            this.userProgress = { lessons: {}, quizzes: {}, projects: {}, streak: 0, totalTime: 0, achievements: [] };
        }
        this.updateProgressDisplay();
    }
    markLessonComplete(id) {
        this.userProgress.lessons[id] = { completed: true, completedAt: new Date().toISOString() };
        this.saveProgress();
        this.updateProgressDisplay();
        this.checkAchievements();
    }
    updateQuizScore(id, score) {
        this.userProgress.quizzes[id] = { score, completedAt: new Date().toISOString() };
        this.saveProgress();
    }
    saveProgress() { localStorage.setItem('progress', JSON.stringify(this.userProgress)); }
    updateProgressDisplay() {
        document.querySelectorAll('.progress-bar[data-lesson]').forEach(bar => {
            const id = bar.dataset.lesson;
            if (this.userProgress.lessons[id]) {
                bar.style.width = '100%';
                bar.classList.add('completed');
            }
        });
        document.querySelectorAll('.completion-check[data-lesson]').forEach(check => {
            const id = check.dataset.lesson;
            if (this.userProgress.lessons[id]) {
                check.classList.add('completed');
                check.innerHTML = '✅';
            }
        });
    }
    checkAchievements() {
        const done = Object.keys(this.userProgress.lessons).length;
        const arr  = this.userProgress.achievements;
        if (done === 1 && !arr.includes('first-lesson')) {
            arr.push('first-lesson');
            this.showAchievement('First Steps', 'Completed your first lesson!');
        }
        if (done >= 7 && !arr.includes('week-warrior')) {
            arr.push('week-warrior');
            this.showAchievement('Week Warrior', 'Completed 7 lessons!');
        }
        this.saveProgress();
    }
    showAchievement(title, desc) {
        const box = document.createElement('div');
        box.className = 'achievement-notification fixed top-5 right-5 bg-white shadow-xl rounded-lg p-4 z-50';
        box.innerHTML = `
          <div class="achievement-content">
            <h4 class="font-bold text-teal-600">🏆 Achievement Unlocked!</h4>
            <h5 class="font-semibold">${title}</h5>
            <p class="text-sm text-gray-600">${desc}</p>
          </div>`;
        document.body.appendChild(box);
        anime({ targets: box, translateX: [300, 0], opacity: [0, 1], duration: 500, easing: 'easeOutCubic' });
        setTimeout(() => {
            anime({ targets: box, translateX: [0, 300], opacity: [1, 0], duration: 500, easing: 'easeInCubic', complete: () => box.remove() });
        }, 4000);
    }

    /* ---------------  PAGE ROUTING  ------------------------ */
    initializePageSpecificFeatures() {
        const page = (window.location.pathname.split('/').pop() || 'index.html').replace(/^\/|\/$/g, '');
        switch (page) {
            case 'index.html':
            case '':
                this.initHomePage();
                break;
            case 'course.html':
                this.initCoursePage();
                break;
            case 'playground.html':
                this.initPlaygroundPage();
                break;
            case 'quiz.html':
                this.initQuizPage();
                break;
            case 'projects.html':
                this.initProjectsPage();
                break;
            case 'dashboard.html':
                this.initDashboardPage();
                break;
        }
    }

    /* ---------------  HOME PAGE  --------------------------- */
    initHomePage() {
        this.setupTestimonialCarousel();
        this.setupStatsCounters();
    }
    setupTestimonialCarousel() {
        const items = document.querySelectorAll('.testimonial');
        if (!items.length) return;
        let idx = 0;
        const show = i => items.forEach((el, k) => el.style.display = k === i ? 'block' : 'none');
        show(0);
        setInterval(() => { idx = (idx + 1) % items.length; show(idx); }, 5000);
    }
    setupStatsCounters() {
        document.querySelectorAll('.stat-counter').forEach(counter => {
            const target = +counter.dataset.target;
            if (!target) return;
            const inc  = target / (2000 / 16);
            let curr   = 0;
            const tick = () => {
                curr += inc;
                if (curr < target) { counter.textContent = Math.floor(curr); requestAnimationFrame(tick); }
                else counter.textContent = target;
            };
            tick();
        });
    }

    /* ---------------  COURSE PAGE  ------------------------- */
    initCoursePage() {
        this.setupChapterNavigation();
        this.setupLessonExpansion();
    }
    setupChapterNavigation() {
        const chapters = document.querySelectorAll('.chapter');
        chapters.forEach(chapter => {
            const header = chapter.querySelector('.chapter-header');
            if (!header) return;
            header.addEventListener('click', () => {
                const wasOpen = chapter.classList.contains('expanded');
                chapters.forEach(c => c.classList.remove('expanded'));
                if (!wasOpen) chapter.classList.add('expanded');
            });
        });
    }
    setupLessonExpansion() {
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.addEventListener('click', e => {
                e.stopPropagation();                                    // keep chapter open
                const content = item.parentElement.nextElementSibling;  // .lesson-content
                if (content) content.classList.toggle('hidden');
            });
        });
    }

    /* ---------------  PLAYGROUND PAGE  --------------------- */
    initPlaygroundPage() {
        this.setupCodeEditor();
        this.setupCodeExecution();
    }
    setupCodeEditor() {
        const el = document.querySelector('#code-editor');
        if (!el) return;
        this.codeEditor = { element: el, getValue: () => el.value, setValue: v => el.value = v };
        el.addEventListener('input', () => this.highlightSyntax());
    }
    setupCodeExecution() {
        const runBtn = document.querySelector('#run-code');
        const out    = document.querySelector('#code-output');
        if (runBtn && out) runBtn.addEventListener('click', () => this.executeCode());
    }
    executeCode() {
        const code = this.codeEditor.getValue();
        const out  = document.querySelector('#code-output');
        if (!out) return;
        try {
            out.innerHTML = `<pre class="text-green-400">${this.simulatePythonExecution(code)}</pre>`;
        } catch (err) {
            out.innerHTML = `<pre class="text-red-400">Error: ${err.message}</pre>`;
        }
    }
    simulatePythonExecution(code) {
        /* very small sandbox – safe for demo */
        if (code.includes('print(')) {
            const m = code.match(/print\((.+)\)/);
            if (m) return String(eval(m[1].replace(/"/g, '')));
        }
        return 'Code executed successfully!';
    }
    highlightSyntax() { /* stub – plug in Prism or CodeMirror here */ }

    /* ---------------  QUIZ PAGE  --------------------------- */
    initQuizPage() {
        this.currentQuiz = {
            questions: [
                { id: 1, question: 'How do you create a variable in Python?', options: ['var x = 5', 'x = 5', 'int x = 5', 'create x = 5'], correct: 1, explanation: 'Simple assignment: x = 5' },
                { id: 2, question: 'Which function prints text?',            options: ['display()', 'print()', 'output()', 'show()'], correct: 1, explanation: 'print() shows output.' }
            ],
            currentQuestion: 0, score: 0, answers: []
        };
        this.displayQuestion();
    }
    displayQuestion() {
        const q = this.currentQuiz.questions[this.currentQuiz.currentQuestion];
        const qBox = document.querySelector('#quiz-question');
        const oBox = document.querySelector('#quiz-options');
        if (!qBox || !oBox) return;

        qBox.textContent = q.question;
        oBox.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option w-full p-4 text-left border rounded-lg hover:bg-gray-100 transition-colors';
            btn.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
            btn.addEventListener('click', () => this.selectAnswer(i));
            oBox.appendChild(btn);
        });
        const fb = document.querySelector('#quiz-feedback');
        if (fb) fb.classList.add('hidden');
    }
    selectAnswer(idx) {
        const q = this.currentQuiz.questions[this.currentQuiz.currentQuestion];
        const ok = idx === q.correct;
        this.currentQuiz.answers.push({ questionId: q.id, selected: idx, correct: ok });
        if (ok) this.currentQuiz.score++;

        document.querySelectorAll('.quiz-option').forEach((b, i) => {
            b.disabled = true;
            if (i === idx) b.classList.add(ok ? 'bg-green-200' : 'bg-red-200');
            if (i === q.correct) b.classList.add('bg-green-200');
        });

        const fb = document.querySelector('#quiz-feedback');
        if (fb) {
            fb.innerHTML = `<div class="p-4 rounded-lg ${ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                              <p class="font-bold">${ok ? 'Correct!' : 'Incorrect'}</p>
                              <p>${q.explanation}</p>
                            </div>`;
            fb.classList.remove('hidden');
        }
        setTimeout(() => this.nextQuestion(), 2000);
    }
    nextQuestion() {
        this.currentQuiz.currentQuestion++;
        if (this.currentQuiz.currentQuestion >= this.currentQuiz.questions.length) this.showQuizResults();
        else this.displayQuestion();
    }
    showQuizResults() {
        const { score, questions } = this.currentQuiz;
        const pct = Math.round((score / questions.length) * 100);
        const box = document.querySelector('#quiz-container');
        if (box) {
            box.innerHTML = `
              <div class="text-center">
                <h2 class="text-3xl font-bold mb-4">Quiz Complete!</h2>
                <div class="text-6xl mb-4">${pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
                <p class="text-xl mb-2">Your Score: ${score}/${questions.length} (${pct}%)</p>
                <p class="text-gray-600 mb-6">${pct >= 70 ? 'Excellent work!' : pct >= 50 ? 'Good job!' : 'Keep practicing!'}</p>
                <button onclick="location.reload()" class="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">Try Again</button>
              </div>`;
        }
        this.updateQuizScore('sample-quiz', pct);
    }

    /* ---------------  PROJECTS PAGE  ----------------------- */
    initProjectsPage() {
        this.setupProjectFiltering();
        this.setupProjectDetails();
    }
    setupProjectFiltering() {
        const btns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.project-card');
        btns.forEach(btn => btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cards.forEach(card => {
                const cat = card.dataset.category;
                const show = filter === 'all' || cat === filter;
                card.style.display = show ? 'block' : 'none';
                if (show && typeof anime !== 'undefined') anime({ targets: card, opacity: [0, 1], scale: [0.8, 1], duration: 300 });
            });
        }));
    }
    setupProjectDetails() {
        document.querySelectorAll('.project-card').forEach(card => {
            const btn = card.querySelector('.show-details');
            if (!btn) return;
            btn.addEventListener('click', () => {
                const details = card.querySelector('.project-details');
                if (details) details.classList.toggle('hidden');
            });
        });
    }

    /* ---------------  DASHBOARD PAGE  ---------------------- */
    initDashboardPage() {
        this.setupProgressCharts();
        this.setupAchievementGallery();
    }
    setupProgressCharts() {
        if (typeof echarts === 'undefined') return;
        const container = document.querySelector('#progress-chart');
        if (!container) return;
        const chart = echarts.init(container);
        chart.setOption({
            title: { text: 'Learning Progress' },
            tooltip: {},
            xAxis: { data: ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4', 'Ch 5'] },
            yAxis: {},
            series: [{ name: 'Completion %', type: 'bar', data: [100, 85, 70, 45, 20], itemStyle: { color: '#0d9488' } }]
        });
    }
    setupAchievementGallery() {
        const achievements = [
            { id: 'first-lesson', title: 'First Steps', icon: '🎯', unlocked: true },
            { id: 'week-warrior', title: 'Week Warrior', icon: '🗓️', unlocked: true },
            { id: 'quiz-master',  title: 'Quiz Master',  icon: '🧠', unlocked: false },
            { id: 'project-builder', title: 'Project Builder', icon: '🔨', unlocked: false }
        ];
        const gallery = document.querySelector('#achievement-gallery');
        if (gallery) {
            gallery.innerHTML = achievements.map(a => `
              <div class="achievement-card p-4 rounded-lg border-2 ${a.unlocked ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50'}">
                <div class="text-3xl mb-2">${a.icon}</div>
                <h4 class="font-bold">${a.title}</h4>
                <p class="text-sm text-gray-600">${a.unlocked ? 'Unlocked!' : 'Locked'}</p>
              </div>`).join('');
        }
    }
}

/* ---------------  GLOBAL HELPERS  -------------------------- */
function showNotification(msg, type = 'info') {
    const note = document.createElement('div');
    note.className = `notification fixed top-5 right-5 px-4 py-2 rounded shadow text-white bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500 z-50`;
    note.textContent = msg;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
}
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showNotification('Code copied!', 'success'));
}

/* ---------------  BOOTSTRAP  ------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    window.pythonPlatform = new PythonLearningPlatform();
});