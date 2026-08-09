// State Management
let tasks = JSON.parse(localStorage.getItem('taskmaster_tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';
let priorityFilter = 'all';
let categoryFilter = 'all';

// DOM Elements - Main Form
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskCategoryInput = document.getElementById('task-category');
const taskPriorityInput = document.getElementById('task-priority');
const taskDueDateInput = document.getElementById('task-duedate');
const validationError = document.getElementById('validation-error');

// DOM Elements - Output & Filters
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');

// DOM Elements - Counters
const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');

// DOM Elements - Theme Switch
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// DOM Elements - Toolbar
const filterTabs = document.querySelectorAll('.filter-tab');
const filterPrioritySelect = document.getElementById('filter-priority');
const filterCategorySelect = document.getElementById('filter-category');

// DOM Elements - Edit Modal
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-id');
const editTitleInput = document.getElementById('edit-title');
const editCategoryInput = document.getElementById('edit-category');
const editPriorityInput = document.getElementById('edit-priority');
const editDueDateInput = document.getElementById('edit-duedate');
const editValidationError = document.getElementById('edit-validation-error');
const closeModalBtn = document.getElementById('close-modal');
const cancelEditBtn = document.getElementById('cancel-edit');

// Theme Logic Init
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
    themeIcon.className = 'fa-solid fa-sun text-amber';
} else {
    document.body.classList.remove('dark');
    themeIcon.className = 'fa-solid fa-moon';
}

themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeIcon.className = 'fa-solid fa-moon';
    } else {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.className = 'fa-solid fa-sun text-amber';
    }
});

// Storage Functions
function saveTasks() {
    localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
    updateCounters();
    renderTasks();
}

function updateCounters() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCountEl.textContent = total;
    pendingCountEl.textContent = pending;
    completedCountEl.textContent = completed;
}

// Form Handlers
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();

    if (!title) {
        validationError.classList.remove('hidden');
        return;
    }
    validationError.classList.add('hidden');

    const newTask = {
        id: Date.now().toString(),
        title: title,
        category: taskCategoryInput.value,
        priority: taskPriorityInput.value,
        dueDate: taskDueDateInput.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();

    taskTitleInput.value = '';
    taskDueDateInput.value = '';
    taskPriorityInput.value = 'Medium';
    taskCategoryInput.value = 'Personal';
});

// Task Actions (Global Access for inline onclick)
window.toggleTask = function(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveTasks();
};

window.deleteTask = function(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
    }
};

window.openEditModal = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editIdInput.value = task.id;
    editTitleInput.value = task.title;
    editCategoryInput.value = task.category;
    editPriorityInput.value = task.priority;
    editDueDateInput.value = task.dueDate || '';
    editValidationError.classList.add('hidden');

    editModal.classList.remove('hidden');
};

function closeModal() {
    editModal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeModal);
cancelEditBtn.addEventListener('click', closeModal);

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const title = editTitleInput.value.trim();

    if (!title) {
        editValidationError.classList.remove('hidden');
        return;
    }

    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                title,
                category: editCategoryInput.value,
                priority: editPriorityInput.value,
                dueDate: editDueDateInput.value
            };
        }
        return task;
    });

    saveTasks();
    closeModal();
});

// Search and Filter Listeners
filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');
        currentFilter = tab.dataset.filter;
        renderTasks();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTasks();
});

filterPrioritySelect.addEventListener('change', (e) => {
    priorityFilter = e.target.value;
    renderTasks();
});

filterCategorySelect.addEventListener('change', (e) => {
    categoryFilter = e.target.value;
    renderTasks();
});

// Helper Functions
function getPriorityBadge(priority) {
    switch (priority) {
        case 'High':
            return `<span class="badge-prio prio-high">High</span>`;
        case 'Medium':
            return `<span class="badge-prio prio-medium">Medium</span>`;
        case 'Low':
        default:
            return `<span class="badge-prio prio-low">Low</span>`;
    }
}

function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;

        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

        if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;

        return true;
    });

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `card task-item ${task.completed ? 'completed' : ''}`;

        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date().setHours(0,0,0,0) && !task.completed;

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onclick="toggleTask('${task.id}')"
                    class="checkbox">
                
                <div class="task-content">
                    <p class="task-text ${task.completed ? 'strike' : ''}">
                        ${escapeHTML(task.title)}
                    </p>
                    
                    <div class="task-meta">
                        <span class="badge-cat">
                            ${task.category}
                        </span>
                        ${getPriorityBadge(task.priority)}
                        ${task.dueDate ? `
                            <span class="${isOverdue ? 'task-overdue' : ''}">
                                <i class="fa-regular fa-calendar"></i> ${task.dueDate} ${isOverdue ? '(Overdue)' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="task-actions">
                <button onclick="openEditModal('${task.id}')" class="action-btn" title="Edit Task">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button onclick="deleteTask('${task.id}')" class="action-btn action-btn-del" title="Delete Task">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Initial Run
updateCounters();
renderTasks();
