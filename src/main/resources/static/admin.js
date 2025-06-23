document.addEventListener('DOMContentLoaded', () => {
    // Инициализация приложения
    initApp();
});

// Константы и глобальные переменные
const API_BASE_URL = '/api/admin';
let currentUser = null;

/**
 * Инициализация приложения
 */
async function initApp() {
    try {
        // Загружаем данные пользователя и роли параллельно
        const [user, roles] = await Promise.all([
            fetchUserInfo(),
            fetchRoles()
        ]);

        currentUser = user;
        displayUserInfo(user);
        renderRoles(roles);
        loadUsers();

        // Настройка обработчиков событий
        setupEventListeners();
    } catch (error) {
        showError('Ошибка инициализации: ' + error.message);
    }
}

/**
 * Загрузка информации о текущем пользователе
 */
async function fetchUserInfo() {
    const response = await fetch('/api/user/info');
    if (!response.ok) throw new Error('Ошибка загрузки данных пользователя');
    return await response.json();
}

/**
 * Загрузка списка ролей
 */
async function fetchRoles() {
    const response = await fetch(`${API_BASE_URL}/roles`);
    if (!response.ok) throw new Error('Ошибка загрузки ролей');
    return await response.json();
}

/**
 * Загрузка списка пользователей
 */
async function loadUsers() {
    try {
        showLoader('#usersTable');
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        showError('Ошибка загрузки пользователей: ' + error.message);
    } finally {
        hideLoader('#usersTable');
    }
}

/**
 * Отображение информации о текущем пользователе
 */
function displayUserInfo(user) {
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        const roles = user.roles.map(role => role.formattedName).join(', ');
        userInfoElement.textContent = `${user.username} (${roles})`;
    }
}

/**
 * Рендеринг списка пользователей
 */
function renderUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    // Используем DocumentFragment для оптимизации
    const fragment = document.createDocumentFragment();

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(user.id)}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.surname)}</td>
            <td>${escapeHtml(user.age)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.roles.map(r => r.formattedName).join(', '))}</td>
            <td>
                <button class="btn btn-warning btn-sm edit-btn" data-id="${user.id}">
                    <i class="bi bi-pencil"></i> Edit
                </button>
            </td>
            <td>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        fragment.appendChild(row);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

/**
 * Рендеринг ролей в модальных окнах
 */
function renderRoles(roles) {
    const containers = ['rolesContainer', 'editRolesContainer'];

    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        roles.forEach(role => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" 
                       name="${containerId === 'rolesContainer' ? 'roles' : 'editRoles'}" 
                       value="${role.id}" id="${containerId}-${role.id}">
                <label class="form-check-label" for="${containerId}-${role.id}">
                    ${escapeHtml(role.formattedName)}
                </label>
            `;
            container.appendChild(div);
        });
    });
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
    // Добавление пользователя
    document.getElementById('addUserForm')?.addEventListener('submit', handleAddUser);

    // Редактирование пользователя
    document.getElementById('editUserForm')?.addEventListener('submit', handleEditUser);

    // Делегирование событий для кнопок
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.edit-btn')) {
            const userId = e.target.closest('.edit-btn').dataset.id;
            await showEditUserModal(userId);
        }

        if (e.target.closest('.delete-btn')) {
            const userId = e.target.closest('.delete-btn').dataset.id;
            await deleteUser(userId);
        }

        if (e.target.closest('#refreshBtn')) {
            await loadUsers();
        }
    });

    // Очистка формы при закрытии модального окна
    $('#addUserModal').on('hidden.bs.modal', () => {
        document.getElementById('addUserForm').reset();
    });
}

/**
 * Обработка добавления пользователя
 */
async function handleAddUser(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        surname: formData.get('surname'),
        age: parseInt(formData.get('age')),
        email: formData.get('email'),
        username: formData.get('username'),
        password: formData.get('password'),
        roles: Array.from(document.querySelectorAll('#rolesContainer input[name="roles"]:checked'))
            .map(checkbox => ({ id: parseInt(checkbox.value) }))
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка при добавлении пользователя');
        }

        $('#addUserModal').modal('hide');
        await loadUsers();
        showSuccess('Пользователь успешно добавлен');
    } catch (error) {
        showError('Ошибка: ' + error.message);
    }
}

/**
 * Показ модального окна редактирования
 */
async function showEditUserModal(userId) {
    try {
        showLoader('#editUserModal .modal-content');

        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных пользователя');

        const user = await response.json();

        // Заполняем форму
        document.getElementById('editId').value = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editSurname').value = user.surname;
        document.getElementById('editAge').value = user.age;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editUsername').value = user.username;

        // Сбрасываем и устанавливаем роли
        document.querySelectorAll('#editRolesContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = user.roles.some(role => role.id === parseInt(checkbox.value));
        });

        $('#editUserModal').modal('show');
    } catch (error) {
        showError('Ошибка: ' + error.message);
    } finally {
        hideLoader('#editUserModal .modal-content');
    }
}

/**
 * Обработка редактирования пользователя
 */
async function handleEditUser(e) {
    e.preventDefault();

    const userId = document.getElementById('editId').value;
    const formData = new FormData(e.target);

    const userData = {
        name: formData.get('name'),
        surname: formData.get('surname'),
        age: parseInt(formData.get('age')),
        email: formData.get('email'),
        username: formData.get('username'),
        password: formData.get('password') || undefined,
        roles: Array.from(document.querySelectorAll('#editRolesContainer input[name="editRoles"]:checked'))
            .map(checkbox => ({ id: parseInt(checkbox.value) }))
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка при обновлении пользователя');
        }

        $('#editUserModal').modal('hide');
        await loadUsers();
        showSuccess('Пользователь успешно обновлен');
    } catch (error) {
        showError('Ошибка: ' + error.message);
    }
}

/**
 * Удаление пользователя
 */
async function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Ошибка при удалении пользователя');

        await loadUsers();
        showSuccess('Пользователь успешно удален');
    } catch (error) {
        showError('Ошибка: ' + error.message);
    }
}

/**
 * Вспомогательные функции
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showLoader(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add('loading');
    }
}

function hideLoader(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.remove('loading');
    }
}

function showError(message) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)"
    }).showToast();
}

function showSuccess(message) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
    }).showToast();
}