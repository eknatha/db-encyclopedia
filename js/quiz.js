
let quizState = {
  category: 'all',
  questions: [],
  current: 0,
  score: 0,
  answered: false,
  results: []
};

function selectQuizCat(btn, cat){
  document.querySelectorAll('.quiz-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  quizState.category = cat;
}

function startQuiz(){
  let pool = allQuizQuestions;
  if(quizState.category !== 'all'){
    pool = allQuizQuestions.filter(q => q.cat === quizState.category);
  }
  // Shuffle and take up to 15 questions
  quizState.questions = [...pool].sort(()=>Math.random()-.5).slice(0, Math.min(15, pool.length));
  quizState.current = 0;
  quizState.score = 0;
  quizState.answered = false;
  quizState.results = [];

  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-active').style.display = 'block';
  renderQuizQuestion();
}

function renderQuizQuestion(){
  const q = quizState.questions[quizState.current];
  const total = quizState.questions.length;
  const pct = ((quizState.current) / total * 100).toFixed(0);

  document.getElementById('quiz-prog-fill').style.width = pct + '%';
  document.getElementById('quiz-prog-text').textContent = `Question ${quizState.current + 1} of ${total}`;
  document.getElementById('quiz-score-badge').textContent = `Score: ${quizState.score}/${quizState.current}`;

  const catLabels = {sql:'SQL & Relational',nosql:'NoSQL',perf:'Performance',k8s:'K8s & Operators',replication:'Replication & HA',transactions:'Transactions & Isolation',vector:'Vector & AI',cloud:'Cloud & Warehouse',security:'Security & Ops'};
  const letters = ['A','B','C','D'];

  document.getElementById('quiz-q-wrap').innerHTML = `
    <div class="quiz-q-cat">${catLabels[q.cat]||q.cat}</div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options" id="quiz-opts">
      ${q.opts.map((opt,i) => `
        <button class="quiz-opt" onclick="answerQuiz(${i})" id="quiz-opt-${i}">
          <span class="quiz-opt-letter">${letters[i]}</span>
          <span>${opt}</span>
        </button>`).join('')}
    </div>
    <div id="quiz-exp" style="display:none"></div>
    <div id="quiz-next-wrap" style="display:none">
      <button class="quiz-next-btn" onclick="nextQuizQuestion()">
        ${quizState.current < quizState.questions.length - 1 ? 'Next Question →' : 'See Results →'}
      </button>
    </div>`;
}

function answerQuiz(chosen){
  if(quizState.answered) return;
  quizState.answered = true;

  const q = quizState.questions[quizState.current];
  const isCorrect = chosen === q.ans;
  if(isCorrect) quizState.score++;
  quizState.results.push({q:q.q, chosen, correct:q.ans, ok:isCorrect});

  // Style options
  for(let i=0;i<q.opts.length;i++){
    const btn = document.getElementById('quiz-opt-'+i);
    btn.disabled = true;
    if(i === q.ans) btn.classList.add('correct');
    else if(i === chosen && !isCorrect) btn.classList.add('wrong');
  }

  // Show explanation
  const expDiv = document.getElementById('quiz-exp');
  expDiv.innerHTML = `<div class="quiz-explanation"><strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</strong> ${q.exp}</div>`;
  expDiv.style.display = 'block';
  document.getElementById('quiz-next-wrap').style.display = 'block';
  document.getElementById('quiz-score-badge').textContent = `Score: ${quizState.score}/${quizState.current+1}`;
}

function nextQuizQuestion(){
  quizState.current++;
  quizState.answered = false;

  if(quizState.current >= quizState.questions.length){
    showQuizResults();
  } else {
    renderQuizQuestion();
  }
}

function showQuizResults(){
  document.getElementById('quiz-active').style.display = 'none';
  const res = document.getElementById('quiz-result');
  res.style.display = 'block';

  const pct = Math.round(quizState.score / quizState.questions.length * 100);
  const grade = pct >= 90 ? '🏆 Expert' : pct >= 75 ? '⭐ Advanced' : pct >= 60 ? '📚 Intermediate' : '🌱 Keep Learning';
  const color = pct >= 75 ? 'var(--accent3)' : pct >= 60 ? 'var(--accent5)' : 'var(--accent4)';

  res.innerHTML = `
    <div class="quiz-result-score" style="color:${color}">${pct}%</div>
    <div class="quiz-result-label">${grade}</div>
    <div class="quiz-result-stats">
      <div class="quiz-stat-item"><div class="quiz-stat-num" style="color:var(--accent3)">${quizState.score}</div><div class="quiz-stat-lbl">Correct</div></div>
      <div class="quiz-stat-item"><div class="quiz-stat-num" style="color:var(--accent4)">${quizState.questions.length - quizState.score}</div><div class="quiz-stat-lbl">Incorrect</div></div>
      <div class="quiz-stat-item"><div class="quiz-stat-num" style="color:var(--accent)">${quizState.questions.length}</div><div class="quiz-stat-lbl">Total</div></div>
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="retryQuiz()">Try Again</button>
      <button class="btn btn-outline" onclick="resetQuiz()">Change Category</button>
    </div>
    <div style="margin-top:2rem;text-align:left">
      <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:1rem">Review</div>
      ${quizState.results.map((r,i)=>`
        <div style="padding:.6rem .75rem;margin-bottom:.4rem;border-radius:8px;font-size:.8rem;background:${r.ok?'rgba(0,212,170,.07)':'rgba(247,114,79,.07)'};border:1px solid ${r.ok?'rgba(0,212,170,.2)':'rgba(247,114,79,.2)'}">
          ${r.ok?'✅':'❌'} ${r.q}
        </div>`).join('')}
    </div>`;
}

function retryQuiz(){ startQuiz(); }
function resetQuiz(){
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-active').style.display = 'none';
  document.getElementById('quiz-start').style.display = 'block';
}


