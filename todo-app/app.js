/* ── State ── */
let tasks = JSON.parse(localStorage.getItem('tasks_v1') || '[]');
let currentFilter = 'all';

/* ── Date Header ── */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
(function setDate() {
  const d = new Date();
  document.getElementById('date-label').textContent =
    DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
})();

/* ── Persistence ── */
function save() {
  localStorage.setItem('tasks_v1', JSON.stringify(tasks));
}

/* ── Add Task ── */
function addTask() {
  const input    = document.getElementById('task-input');
  const priority = document.getElementById('priority-select').value;
  const text     = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  tasks.unshift({ id: Date.now(), text, priority, done: false });
  input.value = '';
  input.focus();
  save();
  render();
}

/* ── Toggle Done ── */
function toggle(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}

/* ── Delete Task ── */
function remove(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

/* ── Clear Completed ── */
function clearDone() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

/* ── Filter ── */
function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  const labels = {
    all:    'All tasks',
    active: 'Active tasks',
    done:   'Completed',
    high:   'High priority',
    medium: 'Medium priority',
    low:    'Low priority',
  };
  document.getElementById('section-label').textContent = labels[filter] || 'All tasks';

  render();
}

/* ── Escape HTML ── */
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ── Render ── */
function render() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const left  = total - done;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent  = done;
  document.getElementById('stat-left').textContent  = left;

  const priorityFilters = ['high', 'medium', 'low'];
  let visible = [...tasks];

  if (currentFilter === 'active')                   visible = tasks.filter(t => !t.done);
  else if (currentFilter === 'done')                visible = tasks.filter(t => t.done);
  else if (priorityFilters.includes(currentFilter)) visible = tasks.filter(t => t.priority === currentFilter);

  /* sort: incomplete first, then by priority */
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  visible.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const list = document.getElementById('todo-list');

  if (!visible.length) {
    list.innerHTML = `
      <div class="empty">
        <i class="ti ti-checkbox"></i>
        Nothing here yet
      </div>`;
    document.getElementById('footer-note').textContent = '';
    return;
  }

  list.innerHTML = visible.map(t => `
    <div class="todo-item ${t.done ? 'done' : ''}" id="item-${t.id}">
      <button
        class="check-btn ${t.done ? 'checked' : ''}"
        onclick="toggle(${t.id})"
        aria-label="${t.done ? 'Mark incomplete' : 'Mark complete'}"
      ></button>
      <span class="todo-text">${escHtml(t.text)}</span>
      <span class="priority-badge ${t.priority}">${t.priority}</span>
      <button class="del-btn" onclick="remove(${t.id})" aria-label="Delete task">
        <i class="ti ti-x"></i>
      </button>
    </div>
  `).join('');

  const doneVisible = visible.filter(t => t.done).length;
  document.getElementById('footer-note').textContent =
    doneVisible ? `${doneVisible} completed` : '';
}

/* ── Event Listeners ── */
document.getElementById('add-btn').addEventListener('click', addTask);

document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

document.getElementById('clear-btn').addEventListener('click', clearDone);

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

/* ── Init ── */
render();
