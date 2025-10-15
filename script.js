(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('primary-menu');
  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const STORAGE_KEY = 'theme';
  const applyTheme = (mode) => { document.documentElement.dataset.theme = mode; };
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') applyTheme(saved); else applyTheme(prefersDark.matches ? 'dark' : 'light');
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  const setupForm = document.getElementById('setup-form');
  const categorySelect = document.getElementById('category');
  const difficultySelect = document.getElementById('difficulty');
  const amountInput = document.getElementById('amount');
  const typeSelect = document.getElementById('type');
  const setupError = document.getElementById('setup-error');

  const loading = document.getElementById('loading');
  const hud = document.getElementById('hud');
  const currentEl = document.getElementById('current');
  const totalEl = document.getElementById('total');
  const scoreEl = document.getElementById('score');
  const questionBlock = document.getElementById('question-block');
  const questionEl = document.getElementById('question');
  const answersEl = document.getElementById('answers');
  const nextBtn = document.getElementById('next');
  const resultEl = document.getElementById('result');
  const finalScoreEl = document.getElementById('final-score');
  const finalTotalEl = document.getElementById('final-total');
  const playAgainBtn = document.getElementById('play-again');

  const decode = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const shuffle = (arr) => arr
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);

  let questions = [];
  let index = 0;
  let score = 0;

  const setHidden = (el, hidden) => { if (el) el.hidden = hidden; };

  const resetGameUI = () => {
    setHidden(resultEl, true);
    setHidden(questionBlock, true);
    setHidden(hud, true);
    nextBtn.disabled = true;
    answersEl.innerHTML = '';
    scoreEl.textContent = '0';
  };

  const POKEMON_LOCAL_ID = 'pokemon-local';

  const appendPokemonCategory = () => {
    const opt = document.createElement('option');
    opt.value = POKEMON_LOCAL_ID;
    opt.textContent = 'Pokémon (Local)';
    categorySelect.appendChild(opt);
  };

  const loadCategories = async () => {
    try {
      categorySelect.innerHTML = '<option value="">Any</option>';
      const res = await fetch('https://opentdb.com/api_category.php');
      const data = await res.json();
      for (const cat of data.trivia_categories) {
        const opt = document.createElement('option');
        opt.value = String(cat.id);
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
      }
    } catch {
      const fallback = [
        { id: 9, name: 'General Knowledge' },
        { id: 21, name: 'Sports' },
        { id: 23, name: 'History' },
        { id: 18, name: 'Science: Computers' }
      ];
      for (const cat of fallback) {
        const opt = document.createElement('option');
        opt.value = String(cat.id);
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
      }
    } finally {
      appendPokemonCategory();
    }
  };

  const buildApiUrl = (amount, category, difficulty, type) => {
    const params = new URLSearchParams();
    params.set('amount', String(amount));
    if (category) params.set('category', String(category));
    if (difficulty) params.set('difficulty', difficulty);
    if (type) params.set('type', type);
    return `https://opentdb.com/api.php?${params.toString()}`;
  };

  const filterLocalQuestions = (items, { amount, difficulty, type }) => {
    let filtered = items;
    if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
    if (type) filtered = filtered.filter((q) => q.type === type);
    filtered = shuffle(filtered).slice(0, amount);
    return filtered;
  };

  const showQuestion = () => {
    const q = questions[index];
    currentEl.textContent = String(index + 1);
    totalEl.textContent = String(questions.length);
    questionEl.textContent = decode(q.question);
    answersEl.innerHTML = '';

    const options = q.type === 'boolean' ? [q.correct_answer, ...q.incorrect_answers] : shuffle([q.correct_answer, ...q.incorrect_answers]);
    for (const option of options) {
      const btn = document.createElement('button');
      btn.className = 'answer';
      btn.type = 'button';
      btn.textContent = decode(option);
      btn.addEventListener('click', () => handleAnswer(btn, option === q.correct_answer));
      answersEl.appendChild(btn);
    }

    setHidden(hud, false);
    setHidden(questionBlock, false);
    nextBtn.disabled = true;
  };

  const handleAnswer = (button, isCorrect) => {
    for (const child of answersEl.children) child.disabled = true;
    if (isCorrect) {
      button.classList.add('correct');
      score += 1;
      scoreEl.textContent = String(score);
    } else {
      button.classList.add('wrong');
      for (const child of answersEl.children) {
        if (child.textContent === decode(questions[index].correct_answer)) child.classList.add('correct');
      }
    }
    nextBtn.disabled = false;
  };

  const showResult = () => {
    finalScoreEl.textContent = String(score);
    finalTotalEl.textContent = String(questions.length);
    setHidden(questionBlock, true);
    setHidden(resultEl, false);
  };

  const nextQuestion = () => {
    index += 1;
    if (index >= questions.length) {
      showResult();
    } else {
      showQuestion();
    }
  };

  nextBtn?.addEventListener('click', nextQuestion);
  playAgainBtn?.addEventListener('click', () => {
    resetGameUI();
    setupForm.scrollIntoView({ behavior: 'smooth' });
  });

  setupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setupError.hidden = true;
    resetGameUI();

    const amount = Number(amountInput.value || 10);
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;
    const type = typeSelect.value;

    setHidden(loading, false);
    try {
      if (category === POKEMON_LOCAL_ID) {
        const res = await fetch('data/pokemon.json');
        const all = await res.json();
        const selected = filterLocalQuestions(all, { amount, difficulty, type });
        if (!selected.length) throw new Error('No local Pokémon questions match your filters.');
        questions = selected;
      } else {
        const url = buildApiUrl(amount, category, difficulty, type);
        const res = await fetch(url);
        const data = await res.json();
        if (!data || data.response_code !== 0 || !Array.isArray(data.results) || data.results.length === 0) {
          throw new Error('No questions returned. Try different settings.');
        }
        questions = data.results;
      }

      index = 0;
      score = 0;
      setHidden(loading, true);
      showQuestion();
    } catch (err) {
      setHidden(loading, true);
      setupError.textContent = err?.message || 'Failed to load questions.';
      setupError.hidden = false;
    }
  });

  loadCategories();
})();
