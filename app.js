import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get, child, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyClgcLeqnc0_L-xsLRSL9PEDkWa4Ysc03E",
    authDomain: "todo-list-manager-d3048.firebaseapp.com",
    databaseURL: "https://todo-list-manager-d3048-default-rtdb.firebaseio.com",
    projectId: "todo-list-manager-d3048",
    storageBucket: "todo-list-manager-d3048.appspot.com",
    messagingSenderId: "925465173666",
    appId: "1:925465173666:web:682e8b4d28376c8eb581fb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "light-mode") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        document.getElementById("themeSwitch").checked = false;
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        document.getElementById("themeSwitch").checked = true;
    }
});

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light-mode");
    } else {
        localStorage.setItem("theme", "dark-mode");
    }
}

window.toggleDarkMode = toggleDarkMode;

function showForm(formId) {
    document.querySelectorAll('form').forEach(form => {
        form.style.display = 'none';
    });
    document.getElementById(`${formId}Form`).style.display = 'block';
}

window.showForm = showForm;

function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (username.includes(' ')) {
        alert('Username should not contain spaces');
        return;
    }

    const usersRef = ref(db, 'users/' + username);
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert('Username already exists');
        } else {
            set(usersRef, {
                username: username,
                password: password
            }).then(() => {
                alert('User registered successfully');
                showForm('login');
            }).catch((error) => {
                console.error("Error during registration:", error);
                alert(error.message);
            });
        }
    }).catch((error) => {
        console.error("Error during username check:", error);
        alert(error.message);
    });
}

window.register = register;

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (username && password) {
        const usersRef = ref(db, 'users/' + username);
        get(usersRef).then((snapshot) => {
            if (snapshot.exists() && snapshot.val().password === password) {
                document.getElementById('userForms').style.display = 'none';
                document.getElementById('todoApp').style.display = 'block';
                loadTasks(username);
            } else {
                alert('Invalid username or password');
            }
        }).catch((error) => {
            console.error("Error during login:", error);
            alert(error.message);
        });
    } else {
        alert('Please fill in all fields');
    }
}

window.login = login;

function logout() {
    document.getElementById('userForms').style.display = 'block';
    document.getElementById('todoApp').style.display = 'none';
}

window.logout = logout;

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    const username = document.getElementById('loginUsername').value.trim();

    if (task) {
        const newTaskRef = push(ref(db, `tasks/${username}`));
        const now = new Date().toISOString();
        set(newTaskRef, {
            task: task,
            completed: false,
            createdDate: now,
            updatedDate: now
        });
        taskInput.value = '';
    }
}

window.addTask = addTask;

function loadTasks(username) {
    const tasksRef = ref(db, `tasks/${username}`);
    onValue(tasksRef, (snapshot) => {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const task = childSnapshot.val();
            const tr = document.createElement('tr');
            tr.classList.toggle('completed', task.completed);

            const taskCell = document.createElement('td');
            taskCell.textContent = task.task;
            taskCell.className = 'task';
            taskCell.onclick = () => toggleTaskStatus(username, childSnapshot.key, task.completed);

            const createdDateCell = document.createElement('td');
            createdDateCell.textContent = task.createdDate || 'N/A';

            const updatedDateCell = document.createElement('td');
            updatedDateCell.textContent = task.updatedDate || 'N/A';

            const statusCell = document.createElement('td');
            statusCell.textContent = task.completed ? 'Completed' : 'Pending';

            const actionsCell = document.createElement('td');

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'small';
            deleteBtn.onclick = () => deleteTask(username, childSnapshot.key);

            actionsCell.appendChild(deleteBtn);

            tr.appendChild(taskCell);
            tr.appendChild(createdDateCell);
            tr.appendChild(updatedDateCell);
            tr.appendChild(statusCell);
            tr.appendChild(actionsCell);

            taskList.appendChild(tr);
        });
    });
}

window.loadTasks = loadTasks;

function toggleTaskStatus(username, taskId, currentStatus) {
    const taskRef = ref(db, `tasks/${username}/${taskId}`);
    const now = new Date().toISOString();
    update(taskRef, {
        completed: !currentStatus,
        updatedDate: now
    });
}

window.toggleTaskStatus = toggleTaskStatus;

function deleteTask(username, taskId) {
    const taskRef = ref(db, `tasks/${username}/${taskId}`);
    remove(taskRef);
}

window.deleteTask = deleteTask;

function resetPassword() {
    const email = document.getElementById('resetEmail').value.trim();

    if (email) {
        // Replace with your Firebase Auth password reset logic
        console.log('Password reset for:', email);
        alert('Password reset email sent!');
        showForm('login');
    } else {
        alert('Please enter your email');
    }
}

window.resetPassword = resetPassword;
