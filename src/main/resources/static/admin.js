document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    setupEventListeners();
});

function loadUsers() {
    fetch('/api/admin/users')
        .then(response => response.json())
        .then(users => {
            const tableBody = document.querySelector('#usersTable tbody');
            tableBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.surname}</td>
                    <td>${user.age}</td>
                    <td>${user.email}</td>
                    <td>${user.roles.map(role => role.formattedName).join(', ')}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${user.id}">Edit</button>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
}

function setupEventListeners() {
    document.getElementById('addUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const user = {
            name: formData.get('name'),
            surname: formData.get('surname'),
            age: parseInt(formData.get('age')),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
            roles: Array.from(document.querySelectorAll('#addUserForm input[name="roles"]:checked'))
                .map(checkbox => ({id: parseInt(checkbox.value)}))
        };

        fetch('/api/admin/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(user)
        })
            .then(() => {
                loadUsers();
                $('#addUserModal').modal('hide');
                this.reset();
            });
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const userId = e.target.getAttribute('data-id');
            fetch(`/api/admin/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    document.getElementById('editId').value = user.id;
                    document.getElementById('editName').value = user.name;
                    document.getElementById('editSurname').value = user.surname;
                    document.getElementById('editAge').value = user.age;
                    document.getElementById('editEmail').value = user.email;
                    document.getElementById('editUsername').value = user.username;

                    // Clear all checkboxes first
                    document.querySelectorAll('#editUserForm input[name="editRoles"]').forEach(checkbox => {
                        checkbox.checked = false;
                    });

                    // Check the roles the user has
                    user.roles.forEach(role => {
                        const checkbox = document.querySelector(`#editUserForm input[name="editRoles"][value="${role.id}"]`);
                        if (checkbox) checkbox.checked = true;
                    });

                    $('#editUserModal').modal('show');
                });
        }
    });

    document.getElementById('editUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const userId = document.getElementById('editId').value;
        const formData = new FormData(this);
        const user = {
            name: formData.get('editName'),
            surname: formData.get('editSurname'),
            age: parseInt(formData.get('editAge')),
            email: formData.get('editEmail'),
            username: formData.get('editUsername'),
            password: formData.get('editPassword'),
            roles: Array.from(document.querySelectorAll('#editUserForm input[name="editRoles"]:checked'))
                .map(checkbox => ({id: parseInt(checkbox.value)}))
        };

        fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(user)
        })
            .then(() => {
                loadUsers();
                $('#editUserModal').modal('hide');
            });
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this user?')) {
                const userId = e.target.getAttribute('data-id');
                fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE'
                })
                    .then(() => loadUsers());
            }
        }
    });
}