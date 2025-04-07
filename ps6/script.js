// get saved tasks or start w/ empty array
let tasks = JSON.parse(localStorage.getItem('lemonTasks')) || [];

let currentTaskIndex = null; // keeps track of active task
let cancelTimer = false;     // gets flipped if stop is pressed

// main ui elements
const taskListEl = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task');
const taskInputContainer = document.getElementById('task-input-container');
const taskInput = document.getElementById('task-input');
const confirmAddBtn = document.getElementById('confirm-add-task');

const workIntervalInput = document.getElementById('work-interval');
const breakIntervalInput = document.getElementById('break-interval');
const countdownEl = document.getElementById('countdown');
const currentTaskNameEl = document.getElementById('current-task-name');
const timerEl = document.getElementById('timer');
const stopBtn = document.getElementById('stop-timer');

// load saved work/break values if they exist
const savedWork = localStorage.getItem('workMinutes');
const savedBreak = localStorage.getItem('breakMinutes');
if (savedWork) workIntervalInput.value = savedWork;
if (savedBreak) breakIntervalInput.value = savedBreak;

// save work/break values when user changes them
workIntervalInput.addEventListener('input', () => {
    localStorage.setItem('workMinutes', workIntervalInput.value);
});
breakIntervalInput.addEventListener('input', () => {
    localStorage.setItem('breakMinutes', breakIntervalInput.value);
});

// when user clicks "+ add task"
addTaskBtn.addEventListener('click', () => {
    taskInput.value = ''; // clear previous
    taskInputContainer.classList.remove('hidden'); // show input
    taskInput.focus();
});

// confirm add task (button)
confirmAddBtn.addEventListener('click', () => {
    const desc = taskInput.value.trim();
    if (desc) {
        tasks.push({ description: desc, lemons: 0 }); // add to array
        saveTasks();
        renderTasks();
        taskInputContainer.classList.add('hidden'); // hide input
    }
});

// also allow pressing enter to confirm task
taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAddBtn.click();
});

// stop session
stopBtn.addEventListener('click', () => stopTimer());

// display all tasks
const renderTasks = () => {
  taskListEl.innerHTML = '';

  let index = 0;
  for (const task of tasks) {
      const currentIndex = index;

      const li = document.createElement('li');
      li.className = 'task-item';

      // task text
      const desc = document.createElement('span');
      desc.textContent = task.description;

      // lemons 🍋
      const lemons = document.createElement('span');
      lemons.innerHTML = '<i class="fa-solid fa-lemon"></i> '.repeat(task.lemons);

      lemons.className = 'lemon';

      // start button
      const startBtn = document.createElement('button');
      startBtn.textContent = '▶ start';
      startBtn.addEventListener('click', () => {
          if (cancelTimer === false && currentTaskIndex !== null) {
              alert("a session is already running.");
              return;
          }
          startSession(currentIndex);
      });

      // delete button ✕
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
          tasks.splice(currentIndex, 1);
          saveTasks();
          renderTasks();
      });

      // edit button ✎
      const editBtn = document.createElement('button');
      editBtn.textContent = '✎';
      editBtn.className = 'edit-btn';
      editBtn.addEventListener('click', () => {
          // hide all the other buttons and lemons
          lemons.classList.add('hidden');
          startBtn.classList.add('hidden');
          deleteBtn.classList.add('hidden');

          // replace description text with input field
          const input = document.createElement('input');
          input.type = 'text';
          input.value = task.description;
          input.className = 'edit-input';
          desc.replaceWith(input);
          input.focus();

          // change edit button to "OK"
          editBtn.textContent = 'OK';

          // add cancel button
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = 'Cancel';
          cancelBtn.className = 'cancel-btn';
          li.appendChild(cancelBtn);

          // save changes
          const saveEdit = () => {
              task.description = input.value.trim() || task.description;
              saveTasks();
              renderTasks();
          };

          // cancel editing
          const cancelEdit = () => {
              renderTasks(); // just re-render to reset
          };

          // press enter = save
          input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') saveEdit();
          });

          // click OK = save
          editBtn.addEventListener('click', saveEdit);

          // click Cancel = cancel
          cancelBtn.addEventListener('click', cancelEdit);

          // blur input = cancel (optional, comment out if you don’t want it)
          // input.addEventListener('blur', cancelEdit);
      });

      // append all elements
      li.appendChild(desc);
      li.appendChild(lemons);
      li.appendChild(startBtn);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      taskListEl.appendChild(li);

      index++;
  }
};


// save tasks to localStorage
const saveTasks = () => {
    localStorage.setItem('lemonTasks', JSON.stringify(tasks));
};

// lil delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// countdown timer logic
const runTimer = async (totalSeconds) => {
    for (let i = totalSeconds; i >= 0; i--) {
        if (cancelTimer) return;
        updateCountdown(i);
        await delay(1000); // wait 1 sec
    }
};

// handles full session: work → 🍋 → break
const startSession = async (index) => {
    currentTaskIndex = index;
    cancelTimer = false;

    const workMinutes = Number(workIntervalInput.value);
    const breakMinutes = Number(breakIntervalInput.value);

    document.querySelector('main').className = 'working';
    currentTaskNameEl.textContent = tasks[index].description;
    timerEl.classList.remove('hidden');

    await runTimer(Math.floor(workMinutes * 60));
    if (cancelTimer) return;

    // give the task a lemon
    tasks[index].lemons += 1;
    saveTasks();
    renderTasks();

    // start break
    document.querySelector('main').className = 'break';
    currentTaskNameEl.textContent = 'Break time';

    await runTimer(Math.floor(breakMinutes * 60));
    if (cancelTimer) return;

    resetUI(); // back to idle
};

// stops the timer
const stopTimer = () => {
    cancelTimer = true;
    resetUI();
};

// resets everything back to idle
const resetUI = () => {
    currentTaskIndex = null;
    timerEl.classList.add('hidden');
    document.querySelector('main').className = 'idle';
    countdownEl.textContent = '00:00';
};

// formats the countdown timer
const updateCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    countdownEl.textContent = `${mins}:${secs}`;
};

// show tasks on page load
renderTasks();
