// ================================================================
// 1. НАСТРОЙКА FIREBASE
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

let currentProfile = null;

function loadProfile() {
    const saved = localStorage.getItem('shoppingProfile');
    if (saved) {
        try {
            currentProfile = JSON.parse(saved);
            return true;
        } catch (e) { return false; }
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
const avatarGrid = document.getElementById('avatarGrid');
const editAvatarGrid = document.getElementById('editAvatarGrid');
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

let selectedAvatar = AVATARS[0].icon;
let editSelectedAvatar = AVATARS[0].icon;
let currentReminderProductId = null;
let currentReminderProductName = '';

function renderAvatarGrid(grid, selectedIcon) {
    grid.innerHTML = '';
    AVATARS.forEach(av => {
        const div = document.createElement('div');
        div.className = 'avatar-option' + (av.icon === selectedIcon ? ' selected' : '');
        div.textContent = av.icon;
        div.title = av.label;
        div.dataset.icon = av.icon;
        div.addEventListener('click', () => {
            grid.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            if (grid === avatarGrid) selectedAvatar = av.icon;
            else editSelectedAvatar = av.icon;
        });
        grid.appendChild(div);
    });
}

function showProfileModal() {
    renderAvatarGrid(avatarGrid, AVATARS[0].icon);
    selectedAvatar = AVATARS[0].icon;
    userNameInput.value = '';
    profileModal.classList.add('active');
    userNameInput.focus();
}

function showEditProfileModal() {
    if (!currentProfile) return;
    renderAvatarGrid(editAvatarGrid, currentProfile.avatar);
    editSelectedAvatar = currentProfile.avatar;
    editUserNameInput.value = currentProfile.name;
    editProfileModal.classList.add('active');
    editUserNameInput.focus();
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

logoutBtn.addEventListener('click', () => {
    if (confirm('Выйти?')) logout();
});

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
// 4. ТЕМА (dark / arch)
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
// 6. DOM
// ================================================================
const productList = document.getElementById('productList');
const productInput = document.getElementById('productInput');
const addButton = document.getElementById('addButton');
const archiveToggle = document.getElementById('archiveToggle');
const archiveItems = document.getElementById('archiveItems');
const archiveCount = document.getElementById('archiveCount');
const dragIndicator = document.getElementById('dragIndicator');

const catBtns = document.querySelectorAll('.cat-btn');
let selectedCategory = 'food';
catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.dataset.category;
    });
});

// ================================================================
// 7. DRAG-AND-DROP
// ================================================================
const LONG_PRESS_DELAY = 250;
let dragData = {
    isDragging: false,
    element: null,
    wrapper: null,
    clone: null,
    offsetX: 0, offsetY: 0,
    productId: null,
    currentCategory: null,
    startIndex: -1, targetIndex: -1,
    longPressTimer: null,
    isLongPress: false,
    startTouchX: 0, startTouchY: 0,
    isScrolling: false
};

let swipeActive = false;

function createDragClone(element) {
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

function showDragIndicator(index) {
    dragIndicator.classList.add('active');
    const items = productList.querySelectorAll('.product-wrapper');
    if (index < items.length) {
        items[index].before(dragIndicator);
    } else {
        productList.appendChild(dragIndicator);
    }
}

function hideDragIndicator() {
    dragIndicator.classList.remove('active');
}

function startDrag(e, productElement) {
    if (dragData.isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const rect = productElement.getBoundingClientRect();

    dragData.isDragging = true;
    dragData.element = productElement;
    dragData.wrapper = productElement.closest('.product-wrapper');
    dragData.productId = productElement.dataset.id;
    dragData.currentCategory = normalizeCategory(productElement.dataset.category);
    dragData.offsetX = touch.clientX - rect.left;
    dragData.offsetY = touch.clientY - rect.top;

    const items = productList.querySelectorAll('.product-item');
    dragData.startIndex = Array.from(items).indexOf(productElement);

    if (navigator.vibrate) navigator.vibrate(30);

    dragData.clone = createDragClone(productElement);
    productElement.style.opacity = '0.4';

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    if (e.type === 'touchstart') {
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd, { passive: false });
    } else {
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
    }
}

function onDragMove(e) {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    updateDragClone(touch.clientX, touch.clientY);
}

function updateDragClone(clientX, clientY) {
    if (dragData.clone) {
        dragData.clone.style.left = (clientX - dragData.offsetX) + 'px';
        dragData.clone.style.top = (clientY - dragData.offsetY) + 'px';
    }
    const items = productList.querySelectorAll('.product-item');
    let targetIdx = items.length;
    for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (clientY < midY) {
            targetIdx = i;
            break;
        }
    }
    if (targetIdx !== dragData.targetIndex) {
        dragData.targetIndex = targetIdx;
        showDragIndicator(targetIdx);
    }
    const catBtns = document.querySelectorAll('.cat-btn');
    catBtns.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const isOver = clientX >= rect.left && clientX <= rect.right &&
                       clientY >= rect.top && clientY <= rect.bottom;
        btn.classList.toggle('drag-over-category', isOver);
    });
}

function onDragEnd(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    let targetCategory = null;
    const catBtns = document.querySelectorAll('.cat-btn');
    catBtns.forEach(btn => {
        if (btn.classList.contains('drag-over-category')) {
            targetCategory = btn.dataset.category;
        }
        btn.classList.remove('drag-over-category');
    });

    if (targetCategory && targetCategory !== dragData.currentCategory) {
        db.collection('products').doc(dragData.productId).update({ category: targetCategory })
            .catch(err => console.error('Ошибка обновления категории:', err));
    } else if (dragData.targetIndex !== -1 && dragData.targetIndex !== dragData.startIndex) {
        const items = productList.querySelectorAll('.product-item');
        const productIds = [];
        items.forEach(item => productIds.push(item.dataset.id));
        const movedId = dragData.productId;
        const startIdx = dragData.startIndex;
        const targetIdx = dragData.targetIndex;
        let newOrder = productIds.filter(id => id !== movedId);
        newOrder.splice(targetIdx, 0, movedId);
        const batch = db.batch();
        newOrder.forEach((id, index) => {
            const ref = db.collection('products').doc(id);
            batch.update(ref, { order: index });
        });
        batch.commit().catch(err => console.error('Ошибка обновления порядка:', err));
    }

    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    if (dragData.clone) {
        dragData.clone.remove();
        dragData.clone = null;
    }
    if (dragData.element) {
        dragData.element.style.opacity = '1';
        dragData.element = null;
    }
    hideDragIndicator();
    dragData.isDragging = false;
    dragData.isLongPress = false;
    dragData.productId = null;
    dragData.currentCategory = null;
    dragData.startIndex = -1;
    dragData.targetIndex = -1;
    dragData.wrapper = null;

    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
}

function cancelLongPress() {
    if (dragData.longPressTimer) {
        clearTimeout(dragData.longPressTimer);
        dragData.longPressTimer = null;
    }
    dragData.isLongPress = false;
}

// ================================================================
// 8. SWIPE-TO-DELETE / SWIPE-TO-COMPLETE (с поддержкой купленных)
// ================================================================
const SWIPE_THRESHOLD = 60;

function initSwipe(element, wrapper, productId, isBought) {
    if (element.dataset.swipeInitialized) return;
    element.dataset.swipeInitialized = 'true';

    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    let isScrolling = false;
    let isPointerDown = false;
    let direction = 0;

    const deleteBtn = wrapper.querySelector('.delete-btn-swipe');
    const completeBtn = wrapper.querySelector('.complete-btn-swipe');

    function onStart(clientX, clientY) {
        if (dragData.isDragging) return;
        startX = clientX;
        currentX = startX;
        isSwiping = false;
        isScrolling = false;
        direction = 0;
        dragData.startTouchX = clientX;
        dragData.startTouchY = clientY;
        swipeActive = false;
        if (deleteBtn) {
            deleteBtn.style.transition = 'opacity 0.1s ease';
            deleteBtn.style.opacity = '0';
        }
        if (completeBtn) {
            completeBtn.style.transition = 'opacity 0.1s ease';
            completeBtn.style.opacity = '0';
        }
    }

    function onMove(clientX, clientY) {
        if (dragData.isDragging || dragData.isLongPress) return;
        const deltaX = clientX - startX;
        const deltaY = clientY - dragData.startTouchY;

        if (!isSwiping && Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
            isSwiping = true;
            swipeActive = true;
            direction = deltaX > 0 ? 1 : -1;
            cancelLongPress();

            // Определяем, какую кнопку показывать
            if (direction === 1 && !isBought && completeBtn) {
                // Активный товар, правый свайп – купить
                completeBtn.style.transition = 'opacity 0.1s ease';
                completeBtn.style.opacity = '1';
            } else if (direction === -1 && isBought && completeBtn) {
                // Купленный товар, левый свайп – вернуть
                completeBtn.style.transition = 'opacity 0.1s ease';
                completeBtn.style.opacity = '1';
            } else if (direction === -1 && !isBought && deleteBtn) {
                // Активный товар, левый свайп – удалить
                deleteBtn.style.transition = 'opacity 0.1s ease';
                deleteBtn.style.opacity = '1';
            } else {
                // Неподдерживаемое направление (например, правый свайп для купленных)
                isSwiping = false;
                swipeActive = false;
                direction = 0;
                return;
            }
        }

        if (isSwiping) {
            let offset = deltaX;
            if (direction === 1) offset = Math.min(offset, 80);
            else if (direction === -1) offset = Math.max(offset, -80);
            currentX = offset;
            element.style.transform = 'translateX(' + offset + 'px)';
        } else {
            if (Math.abs(deltaY) > 10) isScrolling = true;
        }
    }

    function onEnd() {
        if (isSwiping) {
            // Обработка правого свайпа (только для активных)
            if (direction === 1 && currentX > SWIPE_THRESHOLD && !isBought) {
                toggleBought(productId, false); // купить
                element.style.transition = 'transform 0.2s ease';
                element.style.transform = 'translateX(0)';
                setTimeout(() => {
                    element.style.transition = '';
                }, 250);
            }
            // Обработка левого свайпа для купленных (вернуть)
            else if (direction === -1 && currentX < -SWIPE_THRESHOLD && isBought) {
                toggleBought(productId, true); // вернуть
                element.style.transition = 'transform 0.2s ease';
                element.style.transform = 'translateX(0)';
                setTimeout(() => {
                    element.style.transition = '';
                }, 250);
            }
            // Обработка левого свайпа для активных (удалить)
            else if (direction === -1 && currentX < -SWIPE_THRESHOLD && !isBought) {
                const name = element.querySelector('.name')?.textContent || 'продукт';
                if (confirm('Удалить "' + name + '"?')) {
                    deleteProduct(productId, name);
                } else {
                    element.style.transition = 'transform 0.2s ease';
                    element.style.transform = 'translateX(0)';
                    setTimeout(() => {
                        element.style.transition = '';
                    }, 250);
                }
            } else {
                // Не довели до порога – возвращаем
                element.style.transition = 'transform 0.2s ease';
                element.style.transform = 'translateX(0)';
                setTimeout(() => {
                    element.style.transition = '';
                }, 250);
            }

            // Скрываем кнопки
            if (deleteBtn) {
                deleteBtn.style.transition = 'opacity 0.1s ease';
                deleteBtn.style.opacity = '0';
            }
            if (completeBtn) {
                completeBtn.style.transition = 'opacity 0.1s ease';
                completeBtn.style.opacity = '0';
            }
            isSwiping = false;
            currentX = 0;
            direction = 0;
            swipeActive = false;
        }
        dragData.isScrolling = false;
        isPointerDown = false;
        if (!isSwiping) {
            if (deleteBtn) deleteBtn.style.opacity = '0';
            if (completeBtn) completeBtn.style.opacity = '0';
        }
    }

    // Touch события
    element.addEventListener('touchstart', function(e) {
        if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
        if (dragData.isDragging) return;
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY);
    }, { passive: true });

    element.addEventListener('touchmove', function(e) {
        if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
        if (dragData.isDragging) return;
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
        if (isSwiping) e.preventDefault();
    }, { passive: false });

    element.addEventListener('touchend', function(e) {
        onEnd();
    }, { passive: true });

    // Mouse события
    element.addEventListener('mousedown', function(e) {
        if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
        if (dragData.isDragging) return;
        isPointerDown = true;
        onStart(e.clientX, e.clientY);
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isPointerDown) return;
        if (dragData.isDragging) return;
        onMove(e.clientX, e.clientY);
        if (isSwiping) e.preventDefault();
    });

    document.addEventListener('mouseup', function(e) {
        if (!isPointerDown) return;
        onEnd();
    });

    // Обработчики кликов по кнопкам (на случай, если пользователь нажмёт на кнопку)
    if (deleteBtn && !isBought) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = element.querySelector('.name')?.textContent || 'продукт';
            if (confirm('Удалить "' + name + '"?')) {
                deleteProduct(productId, name);
            } else {
                element.style.transition = 'transform 0.2s ease';
                element.style.transform = 'translateX(0)';
                setTimeout(() => {
                    element.style.transition = '';
                }, 250);
                deleteBtn.style.opacity = '0';
            }
        });
    }
    if (completeBtn) {
        completeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isBought) {
                toggleBought(productId, true);
            } else {
                toggleBought(productId, false);
            }
            completeBtn.style.opacity = '0';
            element.style.transition = 'transform 0.2s ease';
            element.style.transform = 'translateX(0)';
            setTimeout(() => {
                element.style.transition = '';
            }, 250);
        });
    }
}

// ================================================================
// 9. ОСНОВНАЯ ЛОГИКА
// ================================================================
addButton.addEventListener('click', addProduct);
productInput.addEventListener('keypress', e => { if (e.key === 'Enter') addProduct(); });

async function addProduct() {
    if (!currentProfile) {
        alert('Сначала выберите профиль!');
        showProfileModal();
        return;
    }
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
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            boughtAt: null,
            author: {
                name: currentProfile.name,
                avatar: currentProfile.avatar
            }
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
    } catch (error) {
        console.error('Ошибка обновления:', error);
    }
}

async function toggleUrgent(id, currentUrgent) {
    try {
        await db.collection('products').doc(id).update({
            urgent: !currentUrgent
        });
    } catch (error) {
        console.error('Ошибка обновления срочности:', error);
    }
}

async function deleteProduct(id, name) {
    try {
        await db.collection('products').doc(id).delete();
    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
}

async function checkReminders() {
    const now = new Date();
    const snapshot = await db.collection('products')
        .where('repeat.enabled', '==', true)
        .get();
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
    if (changes) {
        await batch.commit();
    }
}

async function archiveOldProducts(products) {
    for (const product of products) {
        if (product.bought && product.boughtAt && isFromPreviousDay(product.boughtAt)) {
            try {
                await db.collection('archive').add({
                    name: product.name,
                    category: product.category || 'other',
                    boughtAt: product.boughtAt,
                    createdAt: product.createdAt,
                    author: product.author || null,
                    urgent: product.urgent || false,
                    repeat: product.repeat || { enabled: false, interval: 0, nextDate: null }
                });
                await db.collection('products').doc(product.id).delete();
            } catch (error) {
                console.error('Ошибка архивации:', error);
            }
        }
    }
}

// ================================================================
// 10. ОТРИСОВКА
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
        productList.innerHTML = '<div class="empty-message">Пока ничего нет. Добавьте продукты!</div>';
        return;
    }

    const active = products.filter(p => !p.bought);
    const bought = products.filter(p => p.bought);

    const groupByCategory = (items) => {
        const food = items.filter(p => p.category === 'food');
        const other = items.filter(p => p.category === 'other');
        return { food, other };
    };

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

    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn-swipe';
    if (product.bought) {
        completeBtn.textContent = '↺';
        completeBtn.classList.add('return');
    } else {
        completeBtn.textContent = '✔';
    }
    wrapper.appendChild(completeBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn-swipe';
    deleteBtn.textContent = 'Удалить';
    if (product.bought) {
        deleteBtn.style.display = 'none';
    }
    wrapper.appendChild(deleteBtn);

    const div = document.createElement('div');
    div.className = 'product-item' + (product.bought ? ' bought' : '');
    if (product.urgent && !product.bought) {
        div.classList.add('urgent-highlight');
    }
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
        urgentIcon.title = 'Купленный продукт';
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
        remIcon.title = 'Напоминание включено (нажмите для настройки)';
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
        attachDragEvents(div, product);
        initSwipe(div, wrapper, product.id, false);
    } else {
        initSwipe(div, wrapper, product.id, true);
        deleteBtn.style.display = 'flex';
    }

    return wrapper;
}

function attachDragEvents(element, product) {
    if (product.bought) return;
    element.addEventListener('touchstart', function(e) {
        if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
        if (swipeActive) return;
        cancelLongPress();
        const touch = e.touches[0];
        dragData.startTouchX = touch.clientX;
        dragData.startTouchY = touch.clientY;
        dragData.isScrolling = false;
        dragData.longPressTimer = setTimeout(() => {
            const style = element.style.transform;
            if (!dragData.isScrolling && (!style || style === 'translateX(0px)' || style === '')) {
                dragData.isLongPress = true;
                startDrag(e, element);
            }
        }, LONG_PRESS_DELAY);
    }, { passive: true });

    element.addEventListener('touchmove', function(e) {
        if (dragData.startTouchX && dragData.startTouchY) {
            const touch = e.touches[0];
            const dx = touch.clientX - dragData.startTouchX;
            const dy = touch.clientY - dragData.startTouchY;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                dragData.isScrolling = true;
                cancelLongPress();
            }
        }
    }, { passive: true });

    element.addEventListener('touchend', function(e) {
        if (dragData.isLongPress) {
            e.preventDefault();
            e.stopPropagation();
        }
        cancelLongPress();
        dragData.isScrolling = false;
    }, { passive: false });

    element.addEventListener('mousedown', function(e) {
        if (e.target.closest('.urgent-icon') || e.target.closest('.reminder-icon')) return;
        if (swipeActive) return;
        dragData.longPressTimer = setTimeout(() => {
            const style = element.style.transform;
            if (!style || style === 'translateX(0px)' || style === '') {
                dragData.isLongPress = true;
                startDrag(e, element);
            }
        }, LONG_PRESS_DELAY);
    });

    element.addEventListener('mousemove', cancelLongPress);
    element.addEventListener('mouseup', function(e) {
        if (dragData.isLongPress) {
            e.preventDefault();
            e.stopPropagation();
        }
        cancelLongPress();
    });
}

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
        const reminderBtn = document.createElement('button');
        reminderBtn.className = 'reminder-setup-btn';
        reminderBtn.textContent = '⏰';
        reminderBtn.title = 'Настроить напоминание для этого продукта';
        reminderBtn.addEventListener('click', () => {
            showReminderModalForArchived(item);
        });
        div.appendChild(reminderBtn);
        archiveItems.appendChild(div);
    });
}

async function showReminderModalForArchived(item) {
    const snapshot = await db.collection('products')
        .where('name', '==', item.name)
        .get();
    if (!snapshot.empty) {
        const existing = snapshot.docs[0];
        showReminderModal(existing.id, existing.data().name);
    } else {
        if (!confirm(`Добавить "${item.name}" в список и настроить напоминание?`)) return;
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
            repeat: {
                enabled: true,
                interval: interval,
                nextDate: firebase.firestore.Timestamp.fromDate(nextDate)
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            boughtAt: null,
            author: item.author || { name: 'Неизвестный', avatar: '👤' }
        });
        closeAllModals();
        refreshProducts();
    }
}

// ================================================================
// 11. ПОДПИСКИ
// ================================================================
let unsubscribeProducts = null;
let unsubscribeArchive = null;

function refreshProducts() {
    if (unsubscribeProducts) unsubscribeProducts();
    if (unsubscribeArchive) unsubscribeArchive();

    unsubscribeProducts = db.collection('products')
        .onSnapshot(async (snapshot) => {
            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                products.push({ id: doc.id, ...data });
            });
            renderProducts(products);
            await checkReminders();
            archiveOldProducts(products);
        }, (error) => {
            console.error('Ошибка подписки на продукты:', error);
        });

    unsubscribeArchive = db.collection('archive')
        .orderBy('boughtAt', 'desc')
        .onSnapshot((snapshot) => {
            const archived = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                archived.push({ id: doc.id, ...data });
            });
            renderArchive(archived);
        }, (error) => {
            console.error('Ошибка подписки на архив:', error);
        });
}

refreshProducts();

// ================================================================
// 12. АРХИВ – СВОРАЧИВАНИЕ
// ================================================================
let archiveVisible = false;
archiveToggle.addEventListener('click', () => {
    archiveVisible = !archiveVisible;
    archiveItems.style.display = archiveVisible ? 'flex' : 'none';
    archiveToggle.innerHTML = archiveVisible
        ? '<span>📦</span> Скрыть купленное ранее'
        : `<span>📦</span> Куплено ранее (<span id="archiveCount">${archiveCount.textContent}</span>)`;
});

// ================================================================
// 13. СТАРТ
// ================================================================
productInput.focus();
