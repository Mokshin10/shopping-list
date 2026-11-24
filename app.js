// ================================================================
// 1. FIREBASE
// ================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBIw9xVGeDITBgllYPNL2KNqAikYlTArJo",
  authDomain: "shopping-list-bcde0.firebaseapp.com",
  projectId: "shopping-list-bcde0",
  storageBucket: "shopping-list-bcde0.firebasestorage.app",
  messagingSenderId: "665713375789",
  appId: "1:665713375789:web:a2b919515b91d766f616a4"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================================================================
// 2. ПРОФИЛЬ
// ================================================================
const AVATARS = [
  { id: 'mage', icon: '🧙‍♂️', label: 'Маг' },
  { id: 'warrior', icon: '⚔️', label: 'Воин' },
  { id: 'kratos', icon: '🦾', label: 'Кратос' },
  { id: 'elf', icon: '🧝', label: 'Эльф' },
  { id: 'druid', icon: '🌿', label: 'Друид' },
  { id: 'terminator', icon: '🤖', label: 'Терминатор' },
  { id: 'superhero', icon: '🦸', label: 'Супергерой' },
  { id: 'dragon', icon: '🐉', label: 'Дракон' },
  { id: 'alien', icon: '👾', label: 'Пришелец' },
  { id: 'astronaut', icon: '🧑‍🚀', label: 'Космонавт' },
  { id: 'cat', icon: '🐱', label: 'Кот' },
  { id: 'viking', icon: '🗡️', label: 'Викинг' }
];
const TASK_EMOJIS = ['📋','🛒','🏠','💼','🎉','🍽️','🎁','🧹','💊','📚','🎮','✈️','🚗','🎨','🎵','⚽','🏋️','🧺','🛠️','💻','📱','☕','🍕','🎂'];
let currentProfile = null;

function loadProfile() {
  const saved = localStorage.getItem('shoppingProfile');
  if (saved) {
    try { currentProfile = JSON.parse(saved); return true; }
    catch (e) { return false; }
  }
  return false;
}
function saveProfile(name, avatarIcon) {
  currentProfile = { name, avatar: avatarIcon };
  localStorage.setItem('shoppingProfile', JSON.stringify(currentProfile));
  updateProfileDisplay();
  closeAllModals();
}
function updateProfileDisplay() {
  const display = document.getElementById('profileDisplay');
  display.textContent = currentProfile ? currentProfile.avatar + ' ' + currentProfile.name : '👤';
}
function logout() {
  localStorage.removeItem('shoppingProfile');
  currentProfile = null;
  updateProfileDisplay();
  closeAllModals();
  showProfileModal();
}

// ================================================================
// 3. МОДАЛКИ
// ================================================================
const profileModal = document.getElementById('profileModal');
const editProfileModal = document.getElementById('editProfileModal');
const reminderModal = document.getElementById('reminderModal');
const taskEmojiModal = document.getElementById('taskEmojiModal');
const avatarGrid = document.getElementById('avatarGrid');
const editAvatarGrid = document.getElementById('editAvatarGrid');
const taskEmojiGrid = document.getElementById('taskEmojiGrid');
const userNameInput = document.getElementById('userNameInput');
const editUserNameInput = document.getElementById('editUserNameInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const saveEditProfileBtn = document.getElementById('saveEditProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const reminderProductName = document.getElementById('reminderProductName');
const reminderInterval = document.getElementById('reminderInterval');
const saveReminderBtn = document.getElementById('saveReminderBtn');
const removeReminderBtn = document.getElementById('removeReminderBtn');
const closeReminderBtn = document.getElementById('closeReminderBtn');
const closeTaskEmojiBtn = document.getElementById('closeTaskEmojiBtn');
const taskEmojiBtn = document.getElementById('taskEmojiBtn');

let selectedAvatar = AVATARS[0].icon;
let editSelectedAvatar = AVATARS[0].icon;
let currentReminderProductId = null;
let currentReminderProductName = '';
let selectedTaskEmoji = '📋';

function renderAvatarGrid(grid, selectedIcon, avatars) {
  grid.innerHTML = '';
  avatars.forEach(av => {
    const div = document.createElement('div');
    div.className = 'avatar-option' + (av.icon === selectedIcon ? ' selected' : '');
    div.textContent = av.icon;
    div.title = av.label || av.icon;
    div.dataset.icon = av.icon;
    div.addEventListener('click', () => {
      grid.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      if (grid === avatarGrid) selectedAvatar = av.icon;
      else if (grid === editAvatarGrid) editSelectedAvatar = av.icon;
      else if (grid === taskEmojiGrid) {
        selectedTaskEmoji = av.icon;
        taskEmojiBtn.textContent = av.icon;
      }
    });
    grid.appendChild(div);
  });
}
function showProfileModal() {
  renderAvatarGrid(avatarGrid, AVATARS[0].icon, AVATARS);
  selectedAvatar = AVATARS[0].icon;
  userNameInput.value = '';
  profileModal.classList.add('active');
  userNameInput.focus();
}
function showEditProfileModal() {
  if (!currentProfile) return;
  renderAvatarGrid(editAvatarGrid, currentProfile.avatar, AVATARS);
  editSelectedAvatar = currentProfile.avatar;
  editUserNameInput.value = currentProfile.name;
  editProfileModal.classList.add('active');
  editUserNameInput.focus();
}
function showTaskEmojiModal() {
  const emojiList = TASK_EMOJIS.map(e => ({ icon: e }));
  renderAvatarGrid(taskEmojiGrid, selectedTaskEmoji, emojiList);
  taskEmojiModal.classList.add('active');
}
function showReminderModal(productId, productName) {
  currentReminderProductId = productId;
  currentReminderProductName = productName;
  reminderProductName.textContent = productName;
  db.collection('products').doc(productId).get().then(doc => {
    const data = doc.data();
    if (data && data.repeat && data.repeat.enabled) {
      reminderInterval.value = data.repeat.interval || 7;
    } else {
      reminderInterval.value = 7;
    }
  });
  reminderModal.classList.add('active');
}
function closeAllModals() {
  profileModal.classList.remove('active');
  editProfileModal.classList.remove('active');
  reminderModal.classList.remove('active');
  taskEmojiModal.classList.remove('active');
}

saveProfileBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  if (!name) { alert('Введите имя'); return; }
  saveProfile(name, selectedAvatar);
});
userNameInput.addEventListener('keypress', e => { if (e.key === 'Enter') saveProfileBtn.click(); });
saveEditProfileBtn.addEventListener('click', () => {
  const name = editUserNameInput.value.trim();
  if (!name) { alert('Введите имя'); return; }
  saveProfile(name, editSelectedAvatar);
});
editUserNameInput.addEventListener('keypress', e => { if (e.key === 'Enter') saveEditProfileBtn.click(); });
logoutBtn.addEventListener('click', () => { if (confirm('Выйти?')) logout(); });
taskEmojiBtn.addEventListener('click', showTaskEmojiModal);
closeTaskEmojiBtn.addEventListener('click', closeAllModals);

saveReminderBtn.addEventListener('click', async () => {
  if (!currentReminderProductId) return;
  const interval = parseInt(reminderInterval.value);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  await db.collection('products').doc(currentReminderProductId).update({
    repeat: {
      enabled: true,
      interval: interval,
      nextDate: firebase.firestore.Timestamp.fromDate(nextDate)
    }
  });
  closeAllModals();
  refreshProducts();
});
removeReminderBtn.addEventListener('click', async () => {
  if (!currentReminderProductId) return;
  if (!confirm('Отключить напоминание для этого продукта?')) return;
  await db.collection('products').doc(currentReminderProductId).update({
    repeat: { enabled: false, interval: 0, nextDate: null }
  });
  closeAllModals();
  refreshProducts();
});
closeReminderBtn.addEventListener('click', closeAllModals);

document.getElementById('profileDisplay').addEventListener('click', () => {
  if (currentProfile) showEditProfileModal();
});

if (!loadProfile()) showProfileModal();
else updateProfileDisplay();

// ================================================================
// 4. ТЕМА
// ================================================================
const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', storedTheme);
themeToggle.textContent = storedTheme === 'dark' ? '🌙' : '🐧';
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'arch' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '🌙' : '🐧';
});

// ================================================================
// 5. ВСПОМОГАТЕЛЬНЫЕ
// ================================================================
function isFromPreviousDay(timestamp) {
  if (!timestamp) return false;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return timestamp.toDate() < todayStart;
}
function normalizeCategory(category) {
  if (!category) return 'other';
  const normalized = category.toString().trim().toLowerCase();
  return normalized === 'food' ? 'food' : 'other';
}

// ================================================================
// 6. НАВИГАЦИЯ: ДЕЛИ / ПОКУПКИ
// ================================================================
const tasksScreen = document.getElementById('tasksScreen');
const productsScreen = document.getElementById('productsScreen');
const inputArea = document.getElementById('inputArea');
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const productList = document.getElementById('productList');
const productInput = document.getElementById('productInput');
const addButton = document.getElementById('addButton');
const backButton = document.getElementById('backButton');
const currentTaskNameEl = document.getElementById('currentTaskName');
const dragIndicator = document.getElementById('dragIndicator');

let currentView = 'tasks';       // 'tasks' | 'products'
let currentTaskId = null;
let currentTaskData = null;      // { id, name, emoji }
let selectedCategory = 'food';

const catBtns = document.querySelectorAll('.cat-btn');
catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    catBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCategory = btn.dataset.category;
  });
});

function openTask(taskId, taskData) {
  currentView = 'products';
  currentTaskId = taskId;
  currentTaskData = taskData;
  currentTaskNameEl.textContent = (taskData.emoji || '📋') + ' ' + taskData.name;
  tasksScreen.classList.remove('active');
  productsScreen.classList.add('active');
  inputArea.style.display = 'flex';
  refreshProducts();
  productInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeTask() {
  currentView = 'tasks';
  currentTaskId = null;
  currentTaskData = null;
  productsScreen.classList.remove('active');
  tasksScreen.classList.add('active');
  inputArea.style.display = 'none';
  if (unsubscribeProducts) { unsubscribeProducts(); unsubscribeProducts = null; }
  taskInput.focus();
}
backButton.addEventListener('click', closeTask);

// ================================================================
// 7. ДЕЛА — CRUD
// ================================================================
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });

async function addTask() {
  if (!currentProfile) { alert('Сначала выберите профиль!'); showProfileModal(); return; }
  const name = taskInput.value.trim();
  if (!name) return;
  try {
    await db.collection('tasks').add({
      name: name,
      emoji: selectedTaskEmoji,
      order: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      author: { name: currentProfile.name, avatar: currentProfile.avatar }
    });
    taskInput.value = '';
    selectedTaskEmoji = '📋';
    taskEmojiBtn.textContent = '📋';
    taskInput.focus();
  } catch (error) {
    console.error('Ошибка добавления дела:', error);
    alert('Не удалось добавить. Проверьте интернет.');
  }
}

async function deleteTask(id) {
  try {
    // Удаляем все продукты этого дела
    const snap = await db.collection('products').where('taskId', '==', id).get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    batch.delete(db.collection('tasks').doc(id));
    await batch.commit();
  } catch (error) {
    console.error('Ошибка удаления дела:', error);
  }
}

async function reorderTasks(orderedIds) {
  const batch = db.batch();
  orderedIds.forEach((id, index) => {
    batch.update(db.collection('tasks').doc(id), { order: index });
  });
  try { await batch.commit(); }
  catch (err) { console.error('Ошибка сортировки дел:', err); }
}

// ================================================================
// 8. ДЕЛА — РЕНДЕР + СВАЙПЫ + DRAG
// ================================================================
const tasksData = new Map();   // id -> { id, name, emoji, order, ... }
const taskProductCounts = new Map(); // id -> число покупок

function renderTasks() {
  const list = Array.from(tasksData.values());
  list.sort((a, b) => (a.order || 0) - (b.order || 0));

  taskList.innerHTML = '';
  if (list.length === 0) {
    taskList.innerHTML = '<div class="empty-message">Пока нет дел. Создайте первое!</div>';
    return;
  }
  list.forEach(task => {
    const wrapper = document.createElement('div');
    wrapper.className = 'task-wrapper';
    wrapper.dataset.id = task.id;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.textContent = 'Удалить';
    wrapper.appendChild(deleteBtn);

    const item = document.createElement('div');
    item.className = 'task-item';
    item.dataset.id = task.id;
    item.style.transform = 'translateX(0)';

    const emoji = document.createElement('span');
    emoji.className = 'task-emoji';
    emoji.textContent = task.emoji || '📋';
    item.appendChild(emoji);

    const info = document.createElement('div');
    info.className = 'task-info';
    const nameEl = document.createElement('div');
    nameEl.className = 'task-name';
    nameEl.textContent = task.name;
    info.appendChild(nameEl);
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    const count = taskProductCounts.get(task.id) || 0;
    meta.innerHTML = `<span class="task-count">${count} ${pluralize(count, 'покупка','покупки','покупок')}</span>` +
                     `<span>· ${task.author?.avatar || '👤'} ${escapeHtml(task.author?.name || '')}</span>`;
    info.appendChild(meta);
    item.appendChild(info);

    const arrow = document.createElement('span');
    arrow.className = 'task-arrow';
    arrow.textContent = '›';
    item.appendChild(arrow);

    wrapper.appendChild(item);
    taskList.appendChild(wrapper);

    // Клик — открыть дело
    item.addEventListener('click', (e) => {
      if (item.dataset.swiped === 'true') return;
      openTask(task.id, { name: task.name, emoji: task.emoji });
    });

    // Свайпы и drag
    initTaskSwipe(item, wrapper, task);
    attachTaskDragEvents(item, task);
  });
}

function pluralize(n, one, two, five) {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// Свайпы для дел (вправо — удалить, влево — ничего, просто клик открывает)
const TASK_SWIPE_THRESHOLD = 60;
function initTaskSwipe(element, wrapper, task) {
  if (element.dataset.swipeInitialized) return;
  element.dataset.swipeInitialized = 'true';

  let startX = 0, currentX = 0, isSwiping = false, direction = 0;
  const deleteBtn = wrapper.querySelector('.task-delete-btn');

  function hideBtn() {
    if (deleteBtn) {
      deleteBtn.style.transition = 'opacity 0.1s ease';
      deleteBtn.style.opacity = '0';
    }
  }
  function onStart(clientX) {
    if (taskDragData.isDragging) return;
    startX = clientX; currentX = startX;
    isSwiping = false; direction = 0;
    hideBtn();
  }
  function onMove(clientX, clientY, startY) {
    if (taskDragData.isDragging || taskDragData.isLongPress) return;
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    if (!isSwiping && Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping = true;
      direction = deltaX > 0 ? 1 : -1;
      cancelTaskLongPress();
      if (direction === 1 && deleteBtn) {
        deleteBtn.style.transition = 'opacity 0.1s ease';
        deleteBtn.style.opacity = '1';
      } else {
        isSwiping = false; direction = 0; return;
      }
    }
    if (isSwiping && direction === 1) {
      currentX = Math.min(deltaX, 80);
      element.style.transform = 'translateX(' + currentX + 'px)';
    }
  }
  function onEnd() {
    if (isSwiping) {
      if (direction === 1 && currentX > TASK_SWIPE_THRESHOLD) {
        if (confirm('Удалить дело "' + task.name + '" и все его покупки?')) {
          deleteTask(task.id);
        } else {
          element.style.transition = 'transform 0.2s ease';
          element.style.transform = 'translateX(0)';
          setTimeout(() => { element.style.transition = ''; }, 250);
        }
      } else {
        element.style.transition = 'transform 0.2s ease';
        element.style.transform = 'translateX(0)';
        setTimeout(() => { element.style.transition = ''; }, 250);
      }
      hideBtn();
      isSwiping = false; currentX = 0; direction = 0;
    }
  }

  // Touch
  let touchStartY = 0;
  element.addEventListener('touchstart', e => {
    const t = e.touches[0]; touchStartY = t.clientY;
    onStart(t.clientX);
  }, { passive: true });
  element.addEventListener('touchmove', e => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY, touchStartY);
  }, { passive: true });
  element.addEventListener('touchend', onEnd, { passive: true });

  // Mouse
  let pointerDown = false, mouseStartY = 0;
  element.addEventListener('mousedown', e => {
    pointerDown = true; mouseStartY = e.clientY;
    onStart(e.clientX);
  });
  document.addEventListener('mousemove', e => {
    if (!pointerDown) return;
    onMove(e.clientX, e.clientY, mouseStartY);
  });
  document.addEventListener('mouseup', () => {
    if (!pointerDown) return;
    pointerDown = false;
    onEnd();
  });

  // Клик по кнопке удаления
  if (deleteBtn) {
    deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Удалить дело "' + task.name + '" и все его покупки?')) {
        deleteTask(task.id);
      } else {
        element.style.transition = 'transform 0.2s ease';
        element.style.transform = 'translateX(0)';
        setTimeout(() => { element.style.transition = ''; }, 250);
        deleteBtn.style.opacity = '0';
      }
    });
  }
}

// Drag-and-drop для дел
const LONG_PRESS_DELAY = 250;
let taskDragData = {
  isDragging: false, element: null, wrapper: null, clone: null,
  offsetX: 0, offsetY: 0, taskId: null,
  startIndex: -1, targetIndex: -1,
  longPressTimer: null, isLongPress: false,
  startTouchX: 0, startTouchY: 0, isScrolling: false
};

function createTaskDragClone(element) {
  const clone = document.createElement('div');
  clone.className = 'drag-clone';
  const name = element.querySelector('.task-name');
  const emoji = element.querySelector('.task-emoji');
  clone.textContent = (emoji ? emoji.textContent + ' ' : '') + (name ? name.textContent : '');
  const rect = element.getBoundingClientRect();
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.lineHeight = rect.height + 'px';
  document.body.appendChild(clone);
  return clone;
}
function showTaskDragIndicator(index) {
  // используем тот же индикатор, но временно переносим в taskList
  dragIndicator.classList.add('active');
  if (dragIndicator.parentElement !== taskList) taskList.appendChild(dragIndicator);
  const items = taskList.querySelectorAll('.task-wrapper');
  if (index < items.length) items[index].before(dragIndicator);
  else taskList.appendChild(dragIndicator);
}
function hideTaskDragIndicator() { dragIndicator.classList.remove('active'); }

function startTaskDrag(e, element) {
  if (taskDragData.isDragging) return;
  const touch = e.touches ? e.touches[0] : e;
  const rect = element.getBoundingClientRect();
  taskDragData.isDragging = true;
  taskDragData.element = element;
  taskDragData.wrapper = element.closest('.task-wrapper');
  taskDragData.taskId = element.dataset.id;
  taskDragData.offsetX = touch.clientX - rect.left;
  taskDragData.offsetY = touch.clientY - rect.top;
  const items = taskList.querySelectorAll('.task-item');
  taskDragData.startIndex = Array.from(items).indexOf(element);
  if (navigator.vibrate) navigator.vibrate(30);
  taskDragData.clone = createTaskDragClone(element);
  element.style.opacity = '0.4';
  document.body.style.userSelect = 'none';

  if (e.type === 'touchstart') {
    document.addEventListener('touchmove', onTaskDragMove, { passive: false });
    document.addEventListener('touchend', onTaskDragEnd, { passive: false });
  } else {
    document.addEventListener('mousemove', onTaskDragMove);
    document.addEventListener('mouseup', onTaskDragEnd);
  }
}
function onTaskDragMove(e) {
  e.preventDefault();
  const touch = e.touches ? e.touches[0] : e;
  if (taskDragData.clone) {
    taskDragData.clone.style.left = (touch.clientX - taskDragData.offsetX) + 'px';
    taskDragData.clone.style.top = (touch.clientY - taskDragData.offsetY) + 'px';
  }
  const items = taskList.querySelectorAll('.task-item');
  let targetIdx = items.length;
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (touch.clientY < midY) { targetIdx = i; break; }
  }
  if (targetIdx !== taskDragData.targetIndex) {
    taskDragData.targetIndex = targetIdx;
    showTaskDragIndicator(targetIdx);
  }
}
function onTaskDragEnd() {
  if (taskDragData.targetIndex !== -1 && taskDragData.targetIndex !== taskDragData.startIndex) {
    const items = taskList.querySelectorAll('.task-item');
    const ids = Array.from(items).map(it => it.dataset.id);
    const movedId = taskDragData.taskId;
    let newOrder = ids.filter(id => id !== movedId);
    newOrder.splice(taskDragData.targetIndex, 0, movedId);
    reorderTasks(newOrder);
  }
  document.body.style.userSelect = '';
  if (taskDragData.clone) { taskDragData.clone.remove(); taskDragData.clone = null; }
  if (taskDragData.element) { taskDragData.element.style.opacity = '1'; taskDragData.element = null; }
  hideTaskDragIndicator();
  taskDragData.isDragging = false;
  taskDragData.isLongPress = false;
  taskDragData.taskId = null;
  taskDragData.startIndex = -1;
  taskDragData.targetIndex = -1;
  taskDragData.wrapper = null;
  document.removeEventListener('touchmove', onTaskDragMove);
  document.removeEventListener('touchend', onTaskDragEnd);
  document.removeEventListener('mousemove', onTaskDragMove);
  document.removeEventListener('mouseup', onTaskDragEnd);
}
function cancelTaskLongPress() {
  if (taskDragData.longPressTimer) {
    clearTimeout(taskDragData.longPressTimer);
    taskDragData.longPressTimer = null;
  }
  taskDragData.isLongPress = false;
}
function attachTaskDragEvents(element, task) {
  element.addEventListener('touchstart', function(e) {
    cancelTaskLongPress();
    const touch = e.touches[0];
    taskDragData.startTouchX = touch.clientX;
    taskDragData.startTouchY = touch.clientY;
    taskDragData.isScrolling = false;
    taskDragData.longPressTimer = setTimeout(() => {
      if (!taskDragData.isScrolling) {
        taskDragData.isLongPress = true;
        startTaskDrag(e, element);
      }
    }, LONG_PRESS_DELAY);
  }, { passive: true });
  element.addEventListener('touchmove', function(e) {
    if (taskDragData.startTouchX && taskDragData.startTouchY) {
      const touch = e.touches[0];
      const dx = touch.clientX - taskDragData.startTouchX;
      const dy = touch.clientY - taskDragData.startTouchY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        taskDragData.isScrolling = true;
        cancelTaskLongPress();
      }
    }
  }, { passive: true });
  element.addEventListener('touchend', function(e) {
    if (taskDragData.isLongPress) { e.preventDefault(); e.stopPropagation(); }
    cancelTaskLongPress();
    taskDragData.isScrolling = false;
  }, { passive: false });

  element.addEventListener('mousedown', function(e) {
    taskDragData.longPressTimer = setTimeout(() => {
      taskDragData.isLongPress = true;
      startTaskDrag(e, element);
    }, LONG_PRESS_DELAY);
  });
  element.addEventListener('mousemove', cancelTaskLongPress);
  element.addEventListener('mouseup', function(e) {
    if (taskDragData.isLongPress) { e.preventDefault(); e.stopPropagation(); }
    cancelTaskLongPress();
  });
}

// ================================================================
// 9. ПОКУПКИ — CRUD
// ================================================================
addButton.addEventListener('click', addProduct);
productInput.addEventListener('keypress', e => { if (e.key === 'Enter') addProduct(); });

async function addProduct() {
  if (!currentProfile) { alert('Сначала выберите профиль!'); showProfileModal(); return; }
  if (!currentTaskId) { alert('Сначала выберите дело'); return; }
  const name = productInput.value.trim();
  if (!name) return;
  try {
    await db.collection('products').add({
      name: name,
      category: selectedCategory,
      bought: false,
      order: Date.now(),
      urgent: false,
      repeat: { enabled: false, interval: 0, nextDate: null },
      taskId: currentTaskId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      boughtAt: null,
      author: { name: currentProfile.name, avatar: currentProfile.avatar }
    });
    productInput.value = '';
    productInput.focus();
  } catch (error) {
    console.error('Ошибка добавления:', error);
    alert('Не удалось добавить. Проверьте интернет.');
  }
}
async function toggleBought(id, currentBought) {
  try {
    await db.collection('products').doc(id).update({
      bought: !currentBought,
      boughtAt: !currentBought ? firebase.firestore.FieldValue.serverTimestamp() : null
    });
  } catch (error) { console.error('Ошибка обновления:', error); }
}
async function toggleUrgent(id, currentUrgent) {
  try { await db.collection('products').doc(id).update({ urgent: !currentUrgent }); }
  catch (error) { console.error('Ошибка:', error); }
}
async function deleteProduct(id) {
  try { await db.collection('products').doc(id).delete(); }
  catch (error) { console.error('Ошибка удаления:', error); }
}
async function checkReminders() {
  const now = new Date();
  const snapshot = await db.collection('products')
    .where('repeat.enabled', '==', true).get();
  const batch = db.batch();
  let changes = false;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.repeat && data.repeat.nextDate) {
      const next = data.repeat.nextDate.toDate();
      if (next <= now) {
        const newDoc = db.collection('products').doc();
        batch.set(newDoc, {
          name: data.name,
          category: data.category || 'other',
          bought: false,
          order: Date.now(),
          urgent: data.urgent || false,
          repeat: { enabled: false, interval: 0, nextDate: null },
          taskId: data.taskId || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          boughtAt: null,
          author: data.author || { name: 'Неизвестный', avatar: '👤' }
        });
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + data.repeat.interval);
        batch.update(doc.ref, {
          'repeat.nextDate': firebase.firestore.Timestamp.fromDate(nextDate)
        });
        changes = true;
      }
    }
  });
  if (changes) await batch.commit();
}
async function archiveOldProducts(products) {
  for (const product of products) {
    if (product.bought && product.boughtAt && isFromPreviousDay(product.boughtAt)) {
      try {
        // Получим название дела
        let taskName = '';
        if (product.taskId && tasksData.has(product.taskId)) {
          taskName = tasksData.get(product.taskId).name;
        }
        await db.collection('archive').add({
          name: product.name,
          category: product.category || 'other',
          boughtAt: product.boughtAt,
          createdAt: product.createdAt,
          taskId: product.taskId || null,
          taskName: taskName,
          author: product.author || null,
          urgent: product.urgent || false,
          repeat: product.repeat || { enabled: false, interval: 0, nextDate: null }
        });
        await db.collection('products').doc(product.id).delete();
      } catch (error) { console.error('Ошибка архивации:', error); }
    }
  }
}

// ================================================================
// 10. ПОКУПКИ — РЕНДЕР
// ================================================================
function renderProducts(products) {
  products.forEach(p => {
    p.category = normalizeCategory(p.category);
    if (!p.author) p.author = { name: 'Неизвестный', avatar: '👤' };
    if (p.urgent === undefined) p.urgent = false;
    if (!p.repeat) p.repeat = { enabled: false, interval: 0, nextDate: null };
  });
  products.sort((a, b) => {
    if (a.bought !== b.bought) return a.bought ? 1 : -1;
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return (a.order || 0) - (b.order || 0);
  });
  productList.innerHTML = '';
  if (products.length === 0) {
    productList.innerHTML = '<div class="empty-message">Пока ничего нет. Добавьте покупки!</div>';
    return;
  }
  const active = products.filter(p => !p.bought);
  const bought = products.filter(p => p.bought);
  const groupByCategory = (items) => ({
    food: items.filter(p => p.category === 'food'),
    other: items.filter(p => p.category === 'other')
  });
  const renderGroup = (items, label, isBought = false) => {
    if (!items.length) return;
    const labelEl = document.createElement('div');
    labelEl.className = 'category-label' + (isBought ? ' bought-label' : '');
    labelEl.textContent = label;
    productList.appendChild(labelEl);
    items.forEach(p => productList.appendChild(createProductWrapper(p)));
  };
  const activeGroups = groupByCategory(active);
  renderGroup(activeGroups.food, '🍔 Еда');
  renderGroup(activeGroups.other, '🛒 Остальное');
  if (bought.length) {
    const divider = document.createElement('hr');
    divider.className = 'divider';
    productList.appendChild(divider);
    const boughtGroups = groupByCategory(bought);
    renderGroup(boughtGroups.food, '🍔 Еда (куплено)', true);
    renderGroup(boughtGroups.other, '🛒 Остальное (куплено)', true);
  }
}

function createProductWrapper(product) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-wrapper';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn-swipe';
  deleteBtn.textContent = 'Удалить';
  wrapper.appendChild(deleteBtn);

  const completeBtn = document.createElement('button');
  completeBtn.className = 'complete-btn-swipe';
  completeBtn.textContent = '✔';
  if (product.bought) completeBtn.style.display = 'none';
  wrapper.appendChild(completeBtn);

  const returnBtn = document.createElement('button');
  returnBtn.className = 'return-btn-swipe';
  returnBtn.textContent = '↺';
  if (!product.bought) returnBtn.style.display = 'none';
  wrapper.appendChild(returnBtn);

  const div = document.createElement('div');
  div.className = 'product-item' + (product.bought ? ' bought' : '');
  if (product.urgent && !product.bought) div.classList.add('urgent-highlight');
  div.dataset.id = product.id;
  div.dataset.category = product.category;
  div.style.transform = 'translateX(0)';

  const avatarSpan = document.createElement('span');
  avatarSpan.className = 'avatar-mini';
  avatarSpan.textContent = product.author.avatar || '👤';
  avatarSpan.title = product.author.name || 'Неизвестный';
  div.appendChild(avatarSpan);

  const nameSpan = document.createElement('span');
  nameSpan.className = 'name';
  nameSpan.textContent = product.name;
  div.appendChild(nameSpan);

  const urgentIcon = document.createElement('span');
  urgentIcon.className = 'urgent-icon';
  urgentIcon.textContent = '⚡';
  if (product.bought) {
    urgentIcon.style.opacity = '0.2';
    urgentIcon.style.cursor = 'default';
  } else {
    urgentIcon.style.opacity = product.urgent ? '1' : '0.3';
    urgentIcon.title = product.urgent ? 'Срочно (нажмите, чтобы отменить)' : 'Сделать срочным';
    urgentIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleUrgent(product.id, product.urgent);
    });
  }
  div.appendChild(urgentIcon);

  if (!product.bought && product.repeat && product.repeat.enabled) {
    const remIcon = document.createElement('span');
    remIcon.className = 'reminder-icon';
    remIcon.textContent = '🔄';
    remIcon.title = 'Напоминание включено';
    remIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      showReminderModal(product.id, product.name);
    });
    div.appendChild(remIcon);
  }

  if (product.bought) {
    const check = document.createElement('span');
    check.className = 'check';
    check.textContent = '✔';
    div.appendChild(check);
  }

  wrapper.appendChild(div);
  if (!product.bought) {
    attachProductDragEvents(div, product);
    initProductSwipe(div, wrapper, product.id, false);
  } else {
    initProductSwipe(div, wrapper, product.id, true);
  }
  return wrapper;
}

// ================================================================
// 11. ПОКУПКИ — СВАЙПЫ
// ================================================================
const SWIPE_THRESHOLD = 60;
let swipeActive = false;

function initProductSwipe(element, wrapper, productId, isBought) {
  if (element.dataset.swipeInitialized) return;
  element.dataset.swipeInitialized = 'true';
  let startX = 0, currentX = 0, isSwiping = false, isPointerDown = false, direction = 0;
  const deleteBtn = wrapper.querySelector('.delete-btn-swipe');
  const completeBtn = wrapper.querySelector('.complete-btn-swipe');
  const returnBtn = wrapper.querySelector('.return-btn-swipe');

  function hideAllButtons() {
    [deleteBtn, completeBtn, returnBtn].forEach(b => {
      if (b) { b.style.transition = 'opacity 0.1s ease'; b.style.opacity = '0'; }
    });
  }
  function onStart(clientX, clientY) {
    if (productDragData.isDragging) return;
    startX = clientX; currentX = startX;
    isSwiping = false; direction = 0;
    productDragData.startTouchX = clientX;
    productDragData.startTouchY = clientY;
    swipeActive = false;
    hideAllButtons();
  }
  function onMove(clientX, clientY) {
    if (productDragData.isDragging || productDragData.isLongPress) return;
    const deltaX = clientX - startX;
    const deltaY = clientY - productDragData.startTouchY;
    if (!isSwiping && Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping = true;
      swipeActive = true;
      direction = deltaX > 0 ? 1 : -1;
      cancelProductLongPress();
      if (direction === 1 && deleteBtn) {
        deleteBtn.style.transition = 'opacity 0.1s ease';
        deleteBtn.style.opacity = '1';
      } else if (direction === -1 && !isBought && completeBtn) {
        completeBtn.style.transition = 'opacity 0.1s ease';
        completeBtn.style.opacity = '1';
      } else if (direction === -1 && isBought && returnBtn) {
        returnBtn.style.transition = 'opacity 0.1s ease';
        returnBtn.style.opacity = '1';
      } else {
        isSwiping = false; swipeActive = false; direction = 0; return;
      }
    }
    if (isSwiping) {
      let offset = deltaX;
      if (direction === 1) offset = Math.min(offset, 80);
      else if (direction === -1) offset = Math.max(offset, -80);
      currentX = offset;
      element.style.transform = 'translateX(' + offset + 'px)';
    }
  }
  function onEnd() {
    if (isSwiping) {
      if (direction === 1 && currentX > SWIPE_THRESHOLD) {
        const name = element.querySelector('.name')?.textContent || 'продукт';
        if (confirm('Удалить "' + name + '"?')) deleteProduct(productId);
        else {
          element.style.transition = 'transform 0.2s ease';
          element.style.transform = 'translateX(0)';
          setTimeout(() => { element.style.transition = ''; }, 250);
        }
      } else if (direction === -1 && currentX < -SWIPE_THRESHOLD && !isBought) {
        toggleBought(productId, false);
        element.style.transition = 'transform 0.2s ease';
        element.style.transform = 'translateX(0)';
        setTimeout(() => { element.style.transition = ''; }, 250);
      } else if (direction === -1 && currentX < -SWIPE_THRESHOLD && isBought) {
        toggleBought(productId, true);
        element.style.transition = 'transform 0.2s ease';
        element.style.transform = 'translateX(0)';
        setTimeout(() => { element.style.transition = ''; }, 250);
      } else {
        element.style.transition = 'transform 0.2s ease';
        element.style.transform = 'translateX(0)';
        setTimeout(() => { element.style.transition = ''; }, 250);
      }
      hideAllButtons();
      isSwiping = false; currentX = 0; direction = 0; swipeActive = false;
    }
    isPointerDown = false;
    hideAllButtons();
  }

  element.addEventListener('touchstart', function(e) {
    if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
    if (productDragData.isDragging) return;
    const t = e.touches[0]; onStart(t.clientX, t.clientY);
  }, { passive: true });
  element.addEventListener('touchmove', function(e) {
    if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
    if (productDragData.isDragging) return;
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
    if (isSwiping) e.preventDefault();
  }, { passive: false });
  element.addEventListener('touchend', onEnd, { passive: true });

  element.addEventListener('mousedown', function(e) {
    if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
    if (productDragData.isDragging) return;
    isPointerDown = true; onStart(e.clientX, e.clientY); e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!isPointerDown) return;
    if (productDragData.isDragging) return;
    onMove(e.clientX, e.clientY);
    if (isSwiping) e.preventDefault();
  });
  document.addEventListener('mouseup', () => { if (isPointerDown) onEnd(); });

  if (deleteBtn) {
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const name = element.querySelector('.name')?.textContent || 'продукт';
      if (confirm('Удалить "' + name + '"?')) deleteProduct(productId);
      else {
        element.style.transition = 'transform 0.2s ease';
        element.style.transform = 'translateX(0)';
        setTimeout(() => { element.style.transition = ''; }, 250);
        deleteBtn.style.opacity = '0';
      }
    });
  }
  if (completeBtn && !isBought) {
    completeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleBought(productId, false);
      completeBtn.style.opacity = '0';
      element.style.transition = 'transform 0.2s ease';
      element.style.transform = 'translateX(0)';
      setTimeout(() => { element.style.transition = ''; }, 250);
    });
  }
  if (returnBtn && isBought) {
    returnBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleBought(productId, true);
      returnBtn.style.opacity = '0';
      element.style.transition = 'transform 0.2s ease';
      element.style.transform = 'translateX(0)';
      setTimeout(() => { element.style.transition = ''; }, 250);
    });
  }
}

// ================================================================
// 12. ПОКУПКИ — DRAG-AND-DROP
// ================================================================
let productDragData = {
  isDragging: false, element: null, wrapper: null, clone: null,
  offsetX: 0, offsetY: 0, productId: null,
  currentCategory: null, startIndex: -1, targetIndex: -1,
  longPressTimer: null, isLongPress: false,
  startTouchX: 0, startTouchY: 0, isScrolling: false
};

function createProductDragClone(element) {
  const clone = document.createElement('div');
  clone.className = 'drag-clone';
  const nameSpan = element.querySelector('.name');
  clone.textContent = nameSpan ? nameSpan.textContent : element.textContent;
  const rect = element.getBoundingClientRect();
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.lineHeight = rect.height + 'px';
  clone.style.padding = '10px 16px';
  document.body.appendChild(clone);
  return clone;
}
function showProductDragIndicator(index) {
  dragIndicator.classList.add('active');
  if (dragIndicator.parentElement !== productList) productList.appendChild(dragIndicator);
  const items = productList.querySelectorAll('.product-wrapper');
  if (index < items.length) items[index].before(dragIndicator);
  else productList.appendChild(dragIndicator);
}
function hideProductDragIndicator() { dragIndicator.classList.remove('active'); }

function startProductDrag(e, element) {
  if (productDragData.isDragging) return;
  const touch = e.touches ? e.touches[0] : e;
  const rect = element.getBoundingClientRect();
  productDragData.isDragging = true;
  productDragData.element = element;
  productDragData.wrapper = element.closest('.product-wrapper');
  productDragData.productId = element.dataset.id;
  productDragData.currentCategory = normalizeCategory(element.dataset.category);
  productDragData.offsetX = touch.clientX - rect.left;
  productDragData.offsetY = touch.clientY - rect.top;
  const items = productList.querySelectorAll('.product-item');
  productDragData.startIndex = Array.from(items).indexOf(element);
  if (navigator.vibrate) navigator.vibrate(30);
  productDragData.clone = createProductDragClone(element);
  element.style.opacity = '0.4';
  document.body.style.userSelect = 'none';

  if (e.type === 'touchstart') {
    document.addEventListener('touchmove', onProductDragMove, { passive: false });
    document.addEventListener('touchend', onProductDragEnd, { passive: false });
  } else {
    document.addEventListener('mousemove', onProductDragMove);
    document.addEventListener('mouseup', onProductDragEnd);
  }
}
function onProductDragMove(e) {
  e.preventDefault();
  const touch = e.touches ? e.touches[0] : e;
  if (productDragData.clone) {
    productDragData.clone.style.left = (touch.clientX - productDragData.offsetX) + 'px';
    productDragData.clone.style.top = (touch.clientY - productDragData.offsetY) + 'px';
  }
  const items = productList.querySelectorAll('.product-item');
  let targetIdx = items.length;
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (touch.clientY < midY) { targetIdx = i; break; }
  }
  if (targetIdx !== productDragData.targetIndex) {
    productDragData.targetIndex = targetIdx;
    showProductDragIndicator(targetIdx);
  }
  // Подсветка категории при перетаскивании
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    const isOver = touch.clientX >= rect.left && touch.clientX <= rect.right &&
                   touch.clientY >= rect.top && touch.clientY <= rect.bottom;
    btn.classList.toggle('drag-over-category', isOver);
  });
}
function onProductDragEnd() {
  let targetCategory = null;
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(btn => {
    if (btn.classList.contains('drag-over-category')) targetCategory = btn.dataset.category;
    btn.classList.remove('drag-over-category');
  });
  if (targetCategory && targetCategory !== productDragData.currentCategory) {
    db.collection('products').doc(productDragData.productId)
      .update({ category: targetCategory })
      .catch(err => console.error('Ошибка категории:', err));
  } else if (productDragData.targetIndex !== -1 && productDragData.targetIndex !== productDragData.startIndex) {
    const items = productList.querySelectorAll('.product-item');
    const ids = Array.from(items).map(it => it.dataset.id);
    const movedId = productDragData.productId;
    let newOrder = ids.filter(id => id !== movedId);
    newOrder.splice(productDragData.targetIndex, 0, movedId);
    const batch = db.batch();
    newOrder.forEach((id, index) => {
      batch.update(db.collection('products').doc(id), { order: index });
    });
    batch.commit().catch(err => console.error('Ошибка порядка:', err));
  }
  document.body.style.userSelect = '';
  if (productDragData.clone) { productDragData.clone.remove(); productDragData.clone = null; }
  if (productDragData.element) { productDragData.element.style.opacity = '1'; productDragData.element = null; }
  hideProductDragIndicator();
  productDragData.isDragging = false;
  productDragData.isLongPress = false;
  productDragData.productId = null;
  productDragData.currentCategory = null;
  productDragData.startIndex = -1;
  productDragData.targetIndex = -1;
  productDragData.wrapper = null;
  document.removeEventListener('touchmove', onProductDragMove);
  document.removeEventListener('touchend', onProductDragEnd);
  document.removeEventListener('mousemove', onProductDragMove);
  document.removeEventListener('mouseup', onProductDragEnd);
}
function cancelProductLongPress() {
  if (productDragData.longPressTimer) {
    clearTimeout(productDragData.longPressTimer);
    productDragData.longPressTimer = null;
  }
  productDragData.isLongPress = false;
}
function attachProductDragEvents(element, product) {
  if (product.bought) return;
  element.addEventListener('touchstart', function(e) {
    if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
    if (swipeActive) return;
    cancelProductLongPress();
    const touch = e.touches[0];
    productDragData.startTouchX = touch.clientX;
    productDragData.startTouchY = touch.clientY;
    productDragData.isScrolling = false;
    productDragData.longPressTimer = setTimeout(() => {
      const style = element.style.transform;
      if (!productDragData.isScrolling && (!style || style === 'translateX(0px)' || style === '')) {
        productDragData.isLongPress = true;
        startProductDrag(e, element);
      }
    }, LONG_PRESS_DELAY);
  }, { passive: true });
  element.addEventListener('touchmove', function(e) {
    if (productDragData.startTouchX && productDragData.startTouchY) {
      const touch = e.touches[0];
      const dx = touch.clientX - productDragData.startTouchX;
      const dy = touch.clientY - productDragData.startTouchY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        productDragData.isScrolling = true;
        cancelProductLongPress();
      }
    }
  }, { passive: true });
  element.addEventListener('touchend', function(e) {
    if (productDragData.isLongPress) { e.preventDefault(); e.stopPropagation(); }
    cancelProductLongPress();
    productDragData.isScrolling = false;
  }, { passive: false });

  element.addEventListener('mousedown', function(e) {
    if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
    if (swipeActive) return;
    productDragData.longPressTimer = setTimeout(() => {
      const style = element.style.transform;
      if (!style || style === 'translateX(0px)' || style === '') {
        productDragData.isLongPress = true;
        startProductDrag(e, element);
      }
    }, LONG_PRESS_DELAY);
  });
  element.addEventListener('mousemove', cancelProductLongPress);
  element.addEventListener('mouseup', function(e) {
    if (productDragData.isLongPress) { e.preventDefault(); e.stopPropagation(); }
    cancelProductLongPress();
  });
}

// ================================================================
// 13. АРХИВ
// ================================================================
const archiveToggle = document.getElementById('archiveToggle');
const archiveItems = document.getElementById('archiveItems');
const archiveCount = document.getElementById('archiveCount');
let archiveVisible = false;

archiveToggle.addEventListener('click', () => {
  archiveVisible = !archiveVisible;
  archiveItems.style.display = archiveVisible ? 'flex' : 'none';
  archiveToggle.innerHTML = archiveVisible
    ? '<span>📦</span> Скрыть купленное ранее'
    : `<span>📦</span> Куплено ранее (<span id="archiveCount">${archiveCount.textContent}</span>)`;
});

function renderArchive(archivedItems) {
  archiveCount.textContent = archivedItems.length;
  archiveItems.innerHTML = '';
  if (archivedItems.length === 0) {
    archiveItems.innerHTML = '<div class="empty-message" style="padding:10px 0;">Нет записей</div>';
    return;
  }
  archivedItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'archive-item';
    const catIcon = normalizeCategory(item.category) === 'food' ? '🍔 ' : '🛒 ';
    const authorIcon = (item.author && item.author.avatar) ? item.author.avatar : '👤';
    const urgentIcon = item.urgent ? '⚡ ' : '';
    div.textContent = authorIcon + ' ' + urgentIcon + catIcon + item.name;

    if (item.taskName) {
      const badge = document.createElement('span');
      badge.className = 'archive-task-badge';
      badge.textContent = 'из: ' + item.taskName;
      div.appendChild(badge);
    }

    const reminderBtn = document.createElement('button');
    reminderBtn.className = 'reminder-setup-btn';
    reminderBtn.textContent = '⏰';
    reminderBtn.title = 'Настроить напоминание';
    reminderBtn.addEventListener('click', () => showReminderModalForArchived(item));
    div.appendChild(reminderBtn);

    archiveItems.appendChild(div);
  });
}

async function showReminderModalForArchived(item) {
  if (!currentTaskId && !item.taskId) {
    alert('Сначала откройте дело, в которое добавить продукт');
    return;
  }
  const targetTaskId = currentTaskId || item.taskId;
  const snapshot = await db.collection('products')
    .where('name', '==', item.name)
    .where('taskId', '==', targetTaskId)
    .get();
  if (!snapshot.empty) {
    const existing = snapshot.docs[0];
    showReminderModal(existing.id, existing.data().name);
  } else {
    if (!confirm(`Добавить "${item.name}" в текущее дело и настроить напоминание?`)) return;
    const newDoc = db.collection('products').doc();
    const interval = 7;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    await newDoc.set({
      name: item.name,
      category: item.category || 'other',
      bought: false,
      order: Date.now(),
      urgent: item.urgent || false,
      repeat: { enabled: true, interval: interval, nextDate: firebase.firestore.Timestamp.fromDate(nextDate) },
      taskId: targetTaskId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      boughtAt: null,
      author: item.author || { name: 'Неизвестный', avatar: '👤' }
    });
    closeAllModals();
    refreshProducts();
  }
}

// ================================================================
// 14. МАССОВОЕ ДОБАВЛЕНИЕ
// ================================================================
const bulkAddToggle = document.getElementById('bulkAddToggle');
const bulkAddPanel = document.getElementById('bulkAddPanel');
const bulkInput = document.getElementById('bulkInput');
const bulkAddBtn = document.getElementById('bulkAddBtn');
const aiExampleBtn = document.getElementById('aiExampleBtn');
const AI_EXAMPLE = `Сгенерируй JSON-массив продуктов в таком формате:
[
{"name": "Молоко", "category": "food"},
{"name": "Хлеб", "category": "food"},
{"name": "Мыло", "category": "other"},
{"name": "Средство для посуды", "category": "other", "urgent": true}
]
Правила:
- name — название (обязательно);
- category — строго "food" или "other";
- urgent — необязательно, true/false.
Мой список:
1.
2.
3.`;
let bulkVisible = false;

bulkAddToggle.addEventListener('click', () => {
  bulkVisible = !bulkVisible;
  bulkAddPanel.style.display = bulkVisible ? 'flex' : 'none';
  if (bulkVisible) {
    setTimeout(() => { bulkAddPanel.scrollIntoView({ behavior: 'smooth', block: 'center' }); bulkInput.focus(); }, 80);
  }
});
aiExampleBtn.addEventListener('click', async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(AI_EXAMPLE);
    } else {
      const ta = document.createElement('textarea');
      ta.value = AI_EXAMPLE;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    const original = aiExampleBtn.textContent;
    aiExampleBtn.textContent = '✅ Скопировано!';
    aiExampleBtn.classList.add('copied');
    setTimeout(() => { aiExampleBtn.textContent = original; aiExampleBtn.classList.remove('copied'); }, 1500);
  } catch (e) {
    alert('Не удалось скопировать. Шаблон:\n\n' + AI_EXAMPLE);
  }
});
bulkAddBtn.addEventListener('click', async () => {
  if (!currentProfile) { alert('Сначала выберите профиль!'); showProfileModal(); return; }
  if (!currentTaskId) { alert('Сначала откройте дело'); return; }
  let text = bulkInput.value.trim();
  if (!text) return;
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  let items;
  try { items = JSON.parse(text); }
  catch (e) { alert('Не удалось распознать JSON.'); return; }
  if (!Array.isArray(items)) { alert('Ожидается массив объектов.'); return; }
  const valid = items.filter(it => it && typeof it === 'object' && typeof it.name === 'string' && it.name.trim());
  if (!valid.length) { alert('В массиве нет ни одного продукта с полем "name".'); return; }
  const baseOrder = Date.now();
  const batch = db.batch();
  valid.forEach((it, i) => {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      name: it.name.trim(),
      category: normalizeCategory(it.category),
      bought: false,
      order: baseOrder + i,
      urgent: !!it.urgent,
      repeat: { enabled: false, interval: 0, nextDate: null },
      taskId: currentTaskId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      boughtAt: null,
      author: { name: currentProfile.name, avatar: currentProfile.avatar }
    });
  });
  try {
    await batch.commit();
    bulkInput.value = '';
    bulkAddPanel.style.display = 'none';
    bulkVisible = false;
    alert(`Добавлено ${valid.length} продуктов`);
  } catch (e) {
    console.error('Ошибка массового добавления:', e);
    alert('Не удалось добавить.');
  }
});

// ================================================================
// 15. ПОДПИСКИ
// ================================================================
let unsubscribeTasks = null;
let unsubscribeProducts = null;
let unsubscribeArchive = null;

function refreshTasks() {
  if (unsubscribeTasks) unsubscribeTasks();
  unsubscribeTasks = db.collection('tasks').onSnapshot(snapshot => {
    tasksData.clear();
    snapshot.forEach(doc => tasksData.set(doc.id, { id: doc.id, ...doc.data() }));
    renderTasks();
  }, err => console.error('Ошибка подписки на дела:', err));
}

function refreshProducts() {
  if (unsubscribeProducts) { unsubscribeProducts(); unsubscribeProducts = null; }
  if (!currentTaskId) return;
  unsubscribeProducts = db.collection('products')
    .where('taskId', '==', currentTaskId)
    .onSnapshot(async snapshot => {
      const products = [];
      snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
      renderProducts(products);
      await checkReminders();
      archiveOldProducts(products);
    }, err => console.error('Ошибка подписки на продукты:', err));
}

function refreshArchive() {
  if (unsubscribeArchive) unsubscribeArchive();
  unsubscribeArchive = db.collection('archive')
    .orderBy('boughtAt', 'desc')
    .onSnapshot(snapshot => {
      const archived = [];
      snapshot.forEach(doc => archived.push({ id: doc.id, ...doc.data() }));
      renderArchive(archived);
    }, err => console.error('Ошибка подписки на архив:', err));
}

// Отдельная подписка для подсчёта количества покупок в каждом деле
let unsubscribeCounts = null;
function refreshCounts() {
  if (unsubscribeCounts) unsubscribeCounts();
  unsubscribeCounts = db.collection('products')
    .where('bought', '==', false)
    .onSnapshot(snapshot => {
      taskProductCounts.clear();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.taskId) {
          taskProductCounts.set(data.taskId, (taskProductCounts.get(data.taskId) || 0) + 1);
        }
      });
      renderTasks();
    });
}

// Старт
refreshTasks();
refreshCounts();
refreshArchive();
taskInput.focus();