document.addEventListener('DOMContentLoaded', () => {
    // 1. Storage & State
    let transactions = JSON.parse(localStorage.getItem('financepulse_transactions')) || [];
    let myChart = null; // Chart instance store karne ke liye

    // Helper Functions
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function getLocalDateString() {
        return new Date().toLocaleDateString('en-CA');
    }

    function formatCurrency(val) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }

    // DOM Elements
    const form = document.getElementById('transaction-form');
    const titleInput = document.getElementById('tx-title');
    const amountInput = document.getElementById('tx-amount');
    const dateInput = document.getElementById('tx-date');
    const categoryInput = document.getElementById('tx-category');

    const balanceEl = document.getElementById('balance-amount');
    const incomeEl = document.getElementById('income-amount');
    const expenseEl = document.getElementById('expense-amount');

    const listEl = document.getElementById('transaction-list');
    const emptyStateEl = document.getElementById('empty-state');

    const searchInput = document.getElementById('search-tx');
    const filterTypeSelect = document.getElementById('filter-type');
    const filterCategorySelect = document.getElementById('filter-category');

    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const exportBtn = document.getElementById('export-btn');

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editId = document.getElementById('edit-id');
    const editTitle = document.getElementById('edit-title');
    const editAmount = document.getElementById('edit-amount');
    const editDate = document.getElementById('edit-date');
    const editType = document.getElementById('edit-type');
    const editCategory = document.getElementById('edit-category');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');

    if (dateInput) dateInput.value = getLocalDateString();

    const categories = [
        "Salary", "Freelance", "Investments", "Other Income",
        "Food & Dining", "Shopping", "Housing & Bills", "Transportation", 
        "Entertainment", "Health", "Other Expense"
    ];

    function populateCategories() {
        if (categoryInput) {
            categoryInput.innerHTML = '';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                categoryInput.appendChild(opt);
            });
        }

        if (filterCategorySelect) {
            filterCategorySelect.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                filterCategorySelect.appendChild(opt);
            });
        }
    }
    populateCategories();

    // Dark Mode Toggle
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber';
    } else {
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (themeIcon) {
                themeIcon.className = isDark ? 'fa-solid fa-sun text-amber' : 'fa-solid fa-moon';
            }
            updateChart(); // Dark mode switch par chart refresh karo
        });
    }

    // --- CHART LOGIC ---
    function updateChart() {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;

        // Sirf Expenses ka data group karna hai
        const expenseTxs = transactions.filter(t => t.type === 'expense');

        const categoryTotals = {};
        expenseTxs.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        // Dark/Light text color adjustment
        const isDark = document.body.classList.contains('dark');
        const textColor = isDark ? '#f8fafc' : '#1e293b';

        // Agar pehle se chart hai toh usko destroy karke naya banao
        if (myChart) {
            myChart.destroy();
        }

        if (labels.length === 0) {
            // No Data Display Logic
            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Expenses Recorded'],
                    datasets: [{
                        data: [1],
                        backgroundColor: [isDark ? '#334155' : '#e2e8f0']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: textColor } },
                        tooltip: { enabled: false }
                    }
                }
            });
            return;
        }

        // Color Palette
        const colors = [
            '#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed', 
            '#db2777', '#0891b2', '#ca8a04', '#4f46e5', '#059669'
        ];

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: isDark ? '#1e293b' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }

    // Save Transactions
    function saveTransactions() {
        localStorage.setItem('financepulse_transactions', JSON.stringify(transactions));
        updateSummary();
        renderList();
        updateChart(); // Chart update ho jayega
    }

    // Summary calculation
    function updateSummary() {
        const incomeTotal = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expenseTotal = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const balance = incomeTotal - expenseTotal;

        if (balanceEl) balanceEl.textContent = formatCurrency(balance);
        if (incomeEl) incomeEl.textContent = `+${formatCurrency(incomeTotal)}`;
        if (expenseEl) expenseEl.textContent = `-${formatCurrency(expenseTotal)}`;
    }

    // Form Submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            const amount = parseFloat(amountInput.value);
            const date = dateInput.value;
            const typeRadio = document.querySelector('input[name="tx-type"]:checked');
            const type = typeRadio ? typeRadio.value : 'income';
            const category = categoryInput.value;

            if (!title || isNaN(amount) || amount <= 0) return;

            const newTx = {
                id: Date.now().toString(),
                title,
                amount,
                date: date || getLocalDateString(),
                type,
                category
            };

            transactions.unshift(newTx);
            saveTransactions();

            titleInput.value = '';
            amountInput.value = '';
            dateInput.value = getLocalDateString();
        });
    }

    // Delete Item
    window.deleteTx = function(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            transactions = transactions.filter(t => t.id !== id);
            saveTransactions();
        }
    };

    // Modal Operations
    window.openEditModal = function(id) {
        const tx = transactions.find(t => t.id === id);
        if (!tx || !editModal) return;

        editId.value = tx.id;
        editTitle.value = tx.title;
        editAmount.value = tx.amount;
        editDate.value = tx.date;
        editType.value = tx.type;

        editCategory.innerHTML = '';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            if (cat === tx.category) opt.selected = true;
            editCategory.appendChild(opt);
        });

        editModal.classList.remove('hidden');
    };

    function closeModal() {
        if (editModal) editModal.classList.add('hidden');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeModal);

    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = editId.value;
            const title = editTitle.value.trim();
            const amount = parseFloat(editAmount.value);

            if (!title || isNaN(amount) || amount <= 0) return;

            transactions = transactions.map(t => {
                if (t.id === id) {
                    return {
                        ...t,
                        title,
                        amount,
                        date: editDate.value,
                        type: editType.value,
                        category: editCategory.value
                    };
                }
                return t;
            });

            saveTransactions();
            closeModal();
        });
    }

    // Filter Logic
    if (searchInput) searchInput.addEventListener('input', renderList);
    if (filterTypeSelect) filterTypeSelect.addEventListener('change', renderList);
    if (filterCategorySelect) filterCategorySelect.addEventListener('change', renderList);

    function renderList() {
        if (!listEl) return;

        const q = searchInput ? searchInput.value.toLowerCase() : '';
        const typeFilter = filterTypeSelect ? filterTypeSelect.value : 'all';
        const catFilter = filterCategorySelect ? filterCategorySelect.value : 'all';

        const filtered = transactions.filter(t => {
            if (typeFilter !== 'all' && t.type !== typeFilter) return false;
            if (catFilter !== 'all' && t.category !== catFilter) return false;
            if (q && !t.title.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
            return true;
        });

        listEl.innerHTML = '';

        if (emptyStateEl) {
            if (filtered.length === 0) {
                emptyStateEl.classList.remove('hidden');
            } else {
                emptyStateEl.classList.add('hidden');
            }
        }

        filtered.forEach(t => {
            const tr = document.createElement('tr');
            const isIncome = t.type === 'income';

            tr.innerHTML = `
                <td style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap;">${t.date}</td>
                <td style="font-weight: 500;">${escapeHTML(t.title)}</td>
                <td><span class="badge-cat">${escapeHTML(t.category)}</span></td>
                <td class="${isIncome ? 'text-emerald' : 'text-rose'} text-right" style="font-weight: 600;">
                    ${isIncome ? '+' : '-'}${formatCurrency(t.amount)}
                </td>
                <td class="text-center" style="white-space: nowrap;">
                    <button onclick="openEditModal('${t.id}')" class="action-btn" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteTx('${t.id}')" class="action-btn action-btn-del" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            listEl.appendChild(tr);
        });
    }

    // Export CSV
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (transactions.length === 0) {
                alert('No transactions available to export.');
                return;
            }

            let csvContent = "ID,Date,Type,Description,Category,Amount\n";
            transactions.forEach(t => {
                csvContent += `"${t.id}","${t.date}","${t.type}","${t.title.replace(/"/g, '""')}","${t.category}","${t.amount}"\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `finance_report_${getLocalDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    // Initial Load
    updateSummary();
    renderList();
    updateChart();
});