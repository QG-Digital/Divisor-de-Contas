class ExpenseManager {
    constructor() {
        this.people = [];
        this.categories = [];
        this.expenses = [];
        this.payments = [];
        this.divisionMode = 'equal';
        this.init();
    }

    init() {
        this.loadData();
        this.initNavigation();
        this.initModals();
        this.initDivisionMode();
        this.render();
    }

    loadData() {
        const savedData = localStorage.getItem('expenseManagerData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.people = data.people || [];
            this.categories = data.categories || [];
            this.expenses = data.expenses || [];
            this.payments = data.payments || [];
            this.divisionMode = data.divisionMode || 'equal';
        } else {
            this.loadDefaultData();
        }
    }

    loadDefaultData() {
        this.categories = [
            { id: Date.now() + 1, name: 'Alimentação' },
            { id: Date.now() + 2, name: 'Transporte' },
            { id: Date.now() + 3, name: 'Moradia' },
            { id: Date.now() + 4, name: 'Saúde' },
            { id: Date.now() + 5, name: 'Lazer' }
        ];
        this.saveData();
    }

    saveData() {
        const data = {
            people: this.people,
            categories: this.categories,
            expenses: this.expenses,
            payments: this.payments,
            divisionMode: this.divisionMode
        };
        localStorage.setItem('expenseManagerData', JSON.stringify(data));
    }

    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);

                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchView(viewName) {
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));

        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.render();
    }

    initModals() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('modal-close');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        document.getElementById('add-person-btn').addEventListener('click', () => this.openPersonModal());
        document.getElementById('add-category-btn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('add-expense-btn').addEventListener('click', () => this.openExpenseModal());
        document.getElementById('add-payment-btn').addEventListener('click', () => this.openPaymentModal());
    }

    initDivisionMode() {
        const select = document.getElementById('division-mode');
        select.value = this.divisionMode;
        select.addEventListener('change', (e) => {
            this.divisionMode = e.target.value;
            this.saveData();
            this.render();
        });
    }

    openModal(title, content) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `<h2 style="margin-bottom: 24px;">${title}</h2>${content}`;
        modal.classList.add('active');
    }

    openPersonModal(person = null) {
        const isEdit = person !== null;
        const content = `
            <form id="person-form">
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="name" value="${person ? person.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Salário (R$)</label>
                    <input type="number" name="salary" step="0.01" min="0" value="${person ? person.salary : ''}" required>
                </div>
                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" name="active" ${!person || person.active ? 'checked' : ''}>
                        Ativo
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Adicionar'}</button>
                </div>
            </form>
        `;

        this.openModal(isEdit ? 'Editar Pessoa' : 'Adicionar Pessoa', content);

        document.getElementById('person-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: person ? person.id : Date.now(),
                name: formData.get('name'),
                salary: parseFloat(formData.get('salary')),
                active: formData.get('active') === 'on'
            };

            if (isEdit) {
                const index = this.people.findIndex(p => p.id === person.id);
                this.people[index] = data;
            } else {
                this.people.push(data);
            }

            this.saveData();
            this.render();
            document.getElementById('modal').classList.remove('active');
        });
    }

    openCategoryModal(category = null) {
        const isEdit = category !== null;
        const content = `
            <form id="category-form">
                <div class="form-group">
                    <label>Nome da Categoria</label>
                    <input type="text" name="name" value="${category ? category.name : ''}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Adicionar'}</button>
                </div>
            </form>
        `;

        this.openModal(isEdit ? 'Editar Categoria' : 'Adicionar Categoria', content);

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: category ? category.id : Date.now(),
                name: formData.get('name')
            };

            if (isEdit) {
                const index = this.categories.findIndex(c => c.id === category.id);
                this.categories[index] = data;
            } else {
                this.categories.push(data);
            }

            this.saveData();
            this.render();
            document.getElementById('modal').classList.remove('active');
        });
    }

    openExpenseModal(expense = null) {
        const isEdit = expense !== null;
        const peopleOptions = this.people.map(p =>
            `<option value="${p.id}" ${expense && expense.paidBy === p.id ? 'selected' : ''}>${p.name}</option>`
        ).join('');

        const categoryOptions = this.categories.map(c =>
            `<option value="${c.id}" ${expense && expense.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        const content = `
            <form id="expense-form">
                <div class="form-group">
                    <label>Descrição</label>
                    <input type="text" name="description" value="${expense ? expense.description : ''}" required>
                </div>
                <div class="form-group">
                    <label>Valor (R$)</label>
                    <input type="number" name="amount" step="0.01" min="0" value="${expense ? expense.amount : ''}" required>
                </div>
                <div class="form-group">
                    <label>Pago por</label>
                    <select name="paidBy" required>
                        <option value="">Selecione</option>
                        ${peopleOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <select name="categoryId" required>
                        <option value="">Selecione</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="notes">${expense ? expense.notes || '' : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Adicionar'}</button>
                </div>
            </form>
        `;

        this.openModal(isEdit ? 'Editar Despesa' : 'Adicionar Despesa', content);

        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: expense ? expense.id : Date.now(),
                description: formData.get('description'),
                amount: parseFloat(formData.get('amount')),
                paidBy: parseInt(formData.get('paidBy')),
                categoryId: parseInt(formData.get('categoryId')),
                notes: formData.get('notes'),
                date: expense ? expense.date : new Date().toISOString()
            };

            if (isEdit) {
                const index = this.expenses.findIndex(e => e.id === expense.id);
                this.expenses[index] = data;
            } else {
                this.expenses.push(data);
            }

            this.saveData();
            this.render();
            document.getElementById('modal').classList.remove('active');
        });
    }

    openPaymentModal(payment = null) {
        const isEdit = payment !== null;
        const peopleOptions = this.people.map(p =>
            `<option value="${p.id}">${p.name}</option>`
        ).join('');

        const content = `
            <form id="payment-form">
                <div class="form-group">
                    <label>De</label>
                    <select name="fromId" required>
                        <option value="">Selecione</option>
                        ${peopleOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Para</label>
                    <select name="toId" required>
                        <option value="">Selecione</option>
                        ${peopleOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Valor (R$)</label>
                    <input type="number" name="amount" step="0.01" min="0" value="${payment ? payment.amount : ''}" required>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="notes">${payment ? payment.notes || '' : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Adicionar'}</button>
                </div>
            </form>
        `;

        this.openModal(isEdit ? 'Editar Pagamento' : 'Registrar Pagamento', content);

        document.getElementById('payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: payment ? payment.id : Date.now(),
                fromId: parseInt(formData.get('fromId')),
                toId: parseInt(formData.get('toId')),
                amount: parseFloat(formData.get('amount')),
                notes: formData.get('notes'),
                date: payment ? payment.date : new Date().toISOString()
            };

            if (data.fromId === data.toId) {
                alert('As pessoas devem ser diferentes');
                return;
            }

            if (isEdit) {
                const index = this.payments.findIndex(p => p.id === payment.id);
                this.payments[index] = data;
            } else {
                this.payments.push(data);
            }

            this.saveData();
            this.render();
            document.getElementById('modal').classList.remove('active');
        });
    }

    deletePerson(id) {
        if (confirm('Deseja realmente excluir esta pessoa?')) {
            this.people = this.people.filter(p => p.id !== id);
            this.saveData();
            this.render();
        }
    }

    deleteCategory(id) {
        if (confirm('Deseja realmente excluir esta categoria?')) {
            this.categories = this.categories.filter(c => c.id !== id);
            this.saveData();
            this.render();
        }
    }

    deleteExpense(id) {
        if (confirm('Deseja realmente excluir esta despesa?')) {
            this.expenses = this.expenses.filter(e => e.id !== id);
            this.saveData();
            this.render();
        }
    }

    deletePayment(id) {
        if (confirm('Deseja realmente excluir este pagamento?')) {
            this.payments = this.payments.filter(p => p.id !== id);
            this.saveData();
            this.render();
        }
    }

    calculateBalances() {
        const balances = {};
        const activePeople = this.people.filter(p => p.active);

        activePeople.forEach(person => {
            balances[person.id] = {
                name: person.name,
                paid: 0,
                owes: 0,
                balance: 0
            };
        });

        this.expenses.forEach(expense => {
            if (balances[expense.paidBy]) {
                balances[expense.paidBy].paid += expense.amount;
            }

            let sharePerPerson;
            if (this.divisionMode === 'equal') {
                sharePerPerson = expense.amount / activePeople.length;
                activePeople.forEach(person => {
                    if (balances[person.id]) {
                        balances[person.id].owes += sharePerPerson;
                    }
                });
            } else {
                const totalSalary = activePeople.reduce((sum, p) => sum + p.salary, 0);
                activePeople.forEach(person => {
                    const proportion = person.salary / totalSalary;
                    const share = expense.amount * proportion;
                    if (balances[person.id]) {
                        balances[person.id].owes += share;
                    }
                });
            }
        });

        this.payments.forEach(payment => {
            if (balances[payment.fromId]) {
                balances[payment.fromId].paid += payment.amount;
            }
            if (balances[payment.toId]) {
                balances[payment.toId].owes += payment.amount;
            }
        });

        Object.keys(balances).forEach(id => {
            balances[id].balance = balances[id].paid - balances[id].owes;
        });

        return balances;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    render() {
        this.renderDashboard();
        this.renderPeople();
        this.renderCategories();
        this.renderExpenses();
        this.renderPayments();
    }

    renderDashboard() {
        const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
        const activePeople = this.people.filter(p => p.active).length;

        document.getElementById('total-expenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('active-people').textContent = activePeople;
        document.getElementById('total-categories').textContent = this.categories.length;

        const balances = this.calculateBalances();
        const balancesList = document.getElementById('balances-list');

        if (Object.keys(balances).length === 0) {
            balancesList.innerHTML = '<div class="empty-state"><p>Nenhuma pessoa cadastrada ainda</p></div>';
            return;
        }

        balancesList.innerHTML = Object.values(balances).map(balance => {
            let statusClass = 'balanced';
            let statusText = 'Sem dívidas';
            let amountClass = 'positive';
            let amountText = this.formatCurrency(0);

            if (Math.abs(balance.balance) < 0.01) {
                statusClass = 'balanced';
                statusText = 'Sem dívidas';
                amountClass = 'positive';
                amountText = this.formatCurrency(0);
            } else if (balance.balance < 0) {
                statusClass = 'owes';
                statusText = 'Deve pagar';
                amountClass = 'negative';
                amountText = this.formatCurrency(Math.abs(balance.balance));
            } else {
                statusClass = 'receives';
                statusText = 'Vai receber';
                amountClass = 'positive';
                amountText = this.formatCurrency(balance.balance);
            }

            return `
                <div class="balance-item ${statusClass}">
                    <div class="balance-info">
                        <h3>${balance.name}</h3>
                        <p class="balance-status">${statusText}</p>
                    </div>
                    <div class="balance-amount ${amountClass}">${amountText}</div>
                </div>
            `;
        }).join('');
    }

    renderPeople() {
        const peopleList = document.getElementById('people-list');

        if (this.people.length === 0) {
            peopleList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <h3>Nenhuma pessoa cadastrada</h3>
                    <p>Clique em "Adicionar Pessoa" para começar</p>
                </div>
            `;
            return;
        }

        peopleList.innerHTML = this.people.map(person => `
            <div class="list-item">
                <div class="item-info">
                    <h3>${person.name}</h3>
                    <p class="item-meta">
                        Salário: ${this.formatCurrency(person.salary)} |
                        <span class="status-badge ${person.active ? 'active' : 'inactive'}">
                            ${person.active ? 'Ativo' : 'Inativo'}
                        </span>
                    </p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="expenseManager.openPersonModal(${JSON.stringify(person).replace(/"/g, '&quot;')})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="expenseManager.deletePerson(${person.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    renderCategories() {
        const categoriesList = document.getElementById('categories-list');

        if (this.categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <h3>Nenhuma categoria cadastrada</h3>
                    <p>Clique em "Adicionar Categoria" para começar</p>
                </div>
            `;
            return;
        }

        categoriesList.innerHTML = this.categories.map(category => `
            <div class="list-item">
                <div class="item-info">
                    <h3>${category.name}</h3>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="expenseManager.openCategoryModal(${JSON.stringify(category).replace(/"/g, '&quot;')})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="expenseManager.deleteCategory(${category.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    renderExpenses() {
        const expensesList = document.getElementById('expenses-list');

        if (this.expenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <h3>Nenhuma despesa registrada</h3>
                    <p>Clique em "Adicionar Despesa" para começar</p>
                </div>
            `;
            return;
        }

        expensesList.innerHTML = this.expenses.map(expense => {
            const person = this.people.find(p => p.id === expense.paidBy);
            const category = this.categories.find(c => c.id === expense.categoryId);

            return `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${expense.description} - ${this.formatCurrency(expense.amount)}</h3>
                        <p class="item-meta">
                            Pago por: ${person ? person.name : 'Desconhecido'} |
                            Categoria: <span class="category-badge">${category ? category.name : 'Sem categoria'}</span> |
                            ${this.formatDate(expense.date)}
                        </p>
                        ${expense.notes ? `<p class="item-meta" style="margin-top: 4px;">${expense.notes}</p>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-secondary btn-sm" onclick="expenseManager.openExpenseModal(${JSON.stringify(expense).replace(/"/g, '&quot;')})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="expenseManager.deleteExpense(${expense.id})">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPayments() {
        const paymentsList = document.getElementById('payments-list');

        if (this.payments.length === 0) {
            paymentsList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <h3>Nenhum pagamento registrado</h3>
                    <p>Clique em "Registrar Pagamento" para começar</p>
                </div>
            `;
            return;
        }

        paymentsList.innerHTML = this.payments.map(payment => {
            const fromPerson = this.people.find(p => p.id === payment.fromId);
            const toPerson = this.people.find(p => p.id === payment.toId);

            return `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${this.formatCurrency(payment.amount)}</h3>
                        <p class="item-meta">
                            De: ${fromPerson ? fromPerson.name : 'Desconhecido'} →
                            Para: ${toPerson ? toPerson.name : 'Desconhecido'} |
                            ${this.formatDate(payment.date)}
                        </p>
                        ${payment.notes ? `<p class="item-meta" style="margin-top: 4px;">${payment.notes}</p>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-secondary btn-sm" onclick="expenseManager.openPaymentModal(${JSON.stringify(payment).replace(/"/g, '&quot;')})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="expenseManager.deletePayment(${payment.id})">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

let expenseManager;

document.addEventListener('DOMContentLoaded', () => {
    expenseManager = new ExpenseManager();
});
