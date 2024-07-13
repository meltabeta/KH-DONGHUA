import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get, child, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIbxx3LiXJymH-wrh27ClMBEdpk1pqQO4",
    authDomain: "project-web-c0bf9.firebaseapp.com",
    databaseURL: "https://project-web-c0bf9-default-rtdb.firebaseio.com",
    projectId: "project-web-c0bf9",
    storageBucket: "project-web-c0bf9.appspot.com",
    messagingSenderId: "50274103900",
    appId: "1:50274103900:web:1cd400f348e0cae8b1ec99"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let currentTaskId = null;

window.showForm = function(formId) {
    document.querySelectorAll('form').forEach(form => {
        form.style.display = 'none';
    });
    document.getElementById(`${formId}Form`).style.display = 'block';
}

window.login = async function() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === "" || password === "") {
        alert("Please fill in both fields.");
        return;
    }

    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, `users/${username}`));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                document.getElementById('userForms').style.display = 'none';
                document.getElementById('todoApp').style.display = 'block';
                loadTasks(username);
            } else {
                alert("Invalid password.");
            }
        } else {
            alert("Username not found.");
        }
    } catch (error) {
        console.error(error);
    }
}

window.register = async function() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (username === "" || password === "") {
        alert("Please fill in both fields.");
        return;
    }

    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, `users/${username}`));
        if (snapshot.exists()) {
            alert("Username already exists. Please choose another one.");
        } else {
            await set(ref(db, `users/${username}`), {
                password: password
            });
            alert("User registered successfully. You can now log in.");
            showForm('login');
        }
    } catch (error) {
        console.error(error);
    }
}

window.resetPassword = function() {
    alert("Password reset is not supported in this demo.");
}

window.logout = function() {
    document.getElementById('userForms').style.display = 'block';
    document.getElementById('todoApp').style.display = 'none';
}

window.addTask = function() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    if (task) {
        const username = document.getElementById('loginUsername').value;
        const newTaskRef = push(ref(db, `tasks/${username}`));
        set(newTaskRef, {
            task: task,
            createdDate: new Date().toISOString(),
            updatedDate: "N/A",
            status: "Pending"
        });
        taskInput.value = '';
    }
}

document.getElementById('taskInput').addEventListener('input', function () {
    const charCount = document.getElementById('taskInput').value.length;
    document.getElementById('charCount').innerText = `${charCount}/50`;
});

document.getElementById('editTaskInput').addEventListener('input', function () {
    const charCount = document.getElementById('editTaskInput').value.length;
    document.getElementById('editCharCount').innerText = `${charCount}/50`;
});

window.loadTasks = function(username) {
    const tasksRef = ref(db, `tasks/${username}`);
    onValue(tasksRef, (snapshot) => {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const taskData = childSnapshot.val();
            const tr = document.createElement('tr');
            tr.className = taskData.status.toLowerCase(); // Set the class based on the status
            tr.innerHTML = `
                <td>${taskData.task}</td>
                <td class="actions">
                    <button class="small view" onclick="viewTask('${childSnapshot.key}')">View</button>
                    <button class="small edit" onclick="editTask('${childSnapshot.key}', '${taskData.task}')">Edit</button>
                    <button class="small ${taskData.status.toLowerCase()}" onclick="toggleStatus('${childSnapshot.key}', '${taskData.status}')">${taskData.status}</button>
                    <button class="small delete" onclick="deleteTask('${childSnapshot.key}')">Delete</button>
                </td>
            `;
            taskList.appendChild(tr);
        });
    });
}


window.viewTask = function(taskId) {
    const username = document.getElementById('loginUsername').value;
    const taskRef = ref(db, `tasks/${username}/${taskId}`);
    onValue(taskRef, (snapshot) => {
        const taskData = snapshot.val();
        document.getElementById('taskDetail').textContent = taskData.task;
        document.getElementById('createdDateDetail').textContent = taskData.createdDate;
        document.getElementById('updatedDateDetail').textContent = taskData.updatedDate;
        document.getElementById('statusDetail').textContent = taskData.status;
        document.getElementById('taskDetailModal').style.display = 'block';
    });
}

window.editTask = function(taskId, task) {
    currentTaskId = taskId;
    document.getElementById('editTaskInput').value = task;
    document.getElementById('taskEditModal').style.display = 'block';
}

window.updateTask = function() {
    const updatedTask = document.getElementById('editTaskInput').value.trim();
    if (updatedTask) {
        const username = document.getElementById('loginUsername').value;
        const taskRef = ref(db, `tasks/${username}/${currentTaskId}`);
        update(taskRef, {
            task: updatedTask,
            updatedDate: new Date().toISOString()
        });
        document.getElementById('taskEditModal').style.display = 'none';
    }
}

window.closeModal = function() {
    document.getElementById('taskDetailModal').style.display = 'none';
}

window.closeEditModal = function() {
    document.getElementById('taskEditModal').style.display = 'none';
}

window.deleteTask = function(taskId) {
    const username = document.getElementById('loginUsername').value;
    const taskRef = ref(db, `tasks/${username}/${taskId}`);
    remove(taskRef);
}

window.toggleStatus = function(taskId, currentStatus) {
    const username = document.getElementById('loginUsername').value;
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    const taskRef = ref(db, `tasks/${username}/${taskId}`);
    update(taskRef, {
        status: newStatus,
        updatedDate: new Date().toISOString()
    });
}

window.toggleDarkMode = function() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
}
