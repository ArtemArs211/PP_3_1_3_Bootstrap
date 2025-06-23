document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await fetchUserInfo();
        renderUserDetails(user);
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('userDetails').innerHTML = `
            <div class="alert alert-danger">
                Ошибка загрузки данных: ${error.message}
            </div>
        `;
    }
});

async function fetchUserInfo() {
    const response = await fetch('/api/user/info');
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    return await response.json();
}

function renderUserDetails(user) {
    const detailsContainer = document.getElementById('userDetails');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <tr><th>ID</th><td>${user.id}</td></tr>
        <tr><th>Имя</th><td>${escapeHtml(user.name)}</td></tr>
        <tr><th>Фамилия</th><td>${escapeHtml(user.surname)}</td></tr>
        <tr><th>Возраст</th><td>${user.age}</td></tr>
        <tr><th>Email</th><td>${escapeHtml(user.email)}</td></tr>
        <tr><th>Роли</th><td>${escapeHtml(user.roles.map(r => r.formattedName).join(', '))}</td></tr>
    `;
}