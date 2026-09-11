let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
let currentFilter = 'all';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const searchInput = document.getElementById('search-input');
const taskList = document.getElementById('task-list');

// Save & Render Logic
function saveAndRender() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    render();
}

function render() {
    taskList.innerHTML = '';
    const query = searchInput.value.toLowerCase();

    const filtered = tasks.filter(t => {
        const matchesFilter = currentFilter === 'all' || 
            (currentFilter === 'pending' && !t.completed) || 
            (currentFilter === 'completed' && t.completed);
        return matchesFilter && t.title.toLowerCase().includes(query);
    });

    filtered.forEach(t => {
        const li = document.createElement('li');
        li.className = `task-item ${t.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div>
                <input type="checkbox" ${t.completed ? 'checked' : ''} onclick="toggleTask(${t.id})">
                <span>${t.title}</span> 
                <small class="priority-${t.priority.toLowerCase()}">(${t.priority})</small>
            </div>
            <div>
                <button onclick="editTask(${t.id})">✏️</button>
                <button onclick="deleteTask(${t.id})">🗑️</button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateProgress();
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('progress-text').textContent = `${completed}/${total} completed`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('progress-fill').style.width = `${percent}%`;
}

// Event Listeners
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    tasks.push({
        id: Date.now(),
        title: taskInput.value.trim(),
        priority: prioritySelect.value,
        completed: false
    });
    taskInput.value = '';
    saveAndRender();
});

window.toggleTask = id => {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
};

window.deleteTask = id => {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
};

window.editTask = id => {
    const task = tasks.find(t => t.id === id);
    const newTitle = prompt('Edit task:', task.title);
    if (newTitle) {
        task.title = newTitle.trim();
        saveAndRender();
    }
};

searchInput.addEventListener('input', render);

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        render();
    });
});

document.getElementById('clear-completed').addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.toggleAttribute('data-theme', !isDark);
});

// Initial Load
render();