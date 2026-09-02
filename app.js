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
// 2. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (localStorage)
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
        } catch (e) {
            return false;
        }
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
    if (currentProfile) {
        display.textContent = currentProfile.avatar + ' ' + currentProfile.name;
    } else {
        display.textContent = '👤';
    }
}

function logout() {
    localStorage.removeItem('shoppingProfile');
    currentProfile = null;
    updateProfileDisplay();
    closeAllModals();
    // Показываем модалку выбора
    showProfileModal();
}

// ================================================================
// 3. МОДАЛЬНЫЕ ОКНА
// ================================================================
const profileModal = document.getElementById('profileModal');
const editProfileModal = document.getElementById('editProfileModal');
const avatarGrid = document.getElementById('avatarGrid');
const editAvatarGrid = document.getElementById('editAvatarGrid');
const userNameInput = document.getElementById('userNameInput');
const editUserNameInput = document.getElementById('editUserNameInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const saveEditProfileBtn = document.getElementById('saveEditProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');

let selectedAvatar = AVATARS[0].icon;
let editSelectedAvatar = AVATARS[0].icon;

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
            if (grid === avatarGrid) {
                selectedAvatar = av.icon;
            } else {
                editSelectedAvatar = av.icon;
            }
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

function closeAllModals() {
    profileModal.classList.remove('active');
    editProfileModal.classList.remove('active');
}

// Сохранение нового профиля (из модалки выбора)
saveProfileBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert('Пожалуйста, введите ваше имя');
        return;
    }
    saveProfile(name, selectedAvatar);
});

userNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveProfileBtn.click();
});

// Сохранение изменений (из модалки редактирования)
saveEditProfileBtn.addEventListener('click', () => {
    const name = editUserNameInput.value.trim();
    if (!name) {
        alert('Пожалуйста, введите ваше имя');
        return;
    }
    saveProfile(name, editSelectedAvatar);
});

editUserNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEditProfileBtn.click();
});

// Выход
logoutBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
        logout();
    }
});

// Клик по аватару в шапке открывает редактирование
document.getElementById('profileDisplay').addEventListener('click', () => {
    if (currentProfile) {
        showEditProfileModal();
    }
});

// Если профиль не сохранён, показываем модалку выбора
if (!loadProfile()) {
    showProfileModal();
} else {
    updateProfileDisplay();
}

// ================================================================
// 4. ТЕМА (по умолчанию тёмная)
// ================================================================
const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', storedTheme);
themeToggle.textContent = storedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// ================================================================
// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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
// 6. DOM-ЭЛЕМЕНТЫ
// ================================================================
const productList = document.getElementById('productList');
const productInput = document.getElementById('productInput');
const addButton = document.getElementById('addButton');
const archiveToggle = document.getElementById('archiveToggle');
const archiveItems = document.getElementById('archiveItems');
const archiveCount = document.getElementById('archiveCount');
const dropZones = document.getElementById('dropZones');
const dropZonesList = document.querySelectorAll('.drop-zone');

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
let dragData = {
    isDragging: false,
    element: null,
    clone: null,
    offsetX: 0,
    offsetY: 0,
    productId: null,
    currentCategory: null,
    longPressTimer: null,
    isLongPress: false,
    startTouchX: 0,
    startTouchY: 0,
    isScrolling: false
};

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

function showDropZones() {
    dropZones.classList.remove('hidden');
}

function hideDropZones() {
    dropZones.classList.add('hidden');
    dropZonesList.forEach(z => z.classList.remove('drag-over'));
}

function updateDragClone(clientX, clientY) {
    if (dragData.clone) {
        dragData.clone.style.left = (clientX - dragData.offsetX) + 'px';
        dragData.clone.style.top = (clientY - dragData.offsetY) + 'px';
    }
    dropZonesList.forEach(zone => {
        const rect = zone.getBoundingClientRect();
        const isOver = clientX >= rect.left && clientX <= rect.right &&
                       clientY >= rect.top && clientY <= rect.bottom;
        zone.classList.toggle('drag-over', isOver);
    });
}

function startDrag(e, productElement) {
    if (dragData.isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const rect = productElement.getBoundingClientRect();

    dragData.isDragging = true;
    dragData.element = productElement;
    dragData.productId = productElement.dataset.id;
    dragData.currentCategory = normalizeCategory(productElement.dataset.category);
    dragData.offsetX = touch.clientX - rect.left;
    dragData.offsetY = touch.clientY - rect.top;

    if (navigator.vibrate) navigator.vibrate(30);

    dragData.clone = createDragClone(productElement);
    productElement.style.opacity = '0.4';

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    showDropZones();

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

function onDragEnd(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    let targetCategory = null;
    dropZonesList.forEach(zone => {
        if (zone.classList.contains('drag-over')) {
            targetCategory = zone.dataset.category;
        }
    });

    if (targetCategory && targetCategory !== dragData.currentCategory) {
        const productId = dragData.productId;
        db.collection('products').doc(productId).update({ category: targetCategory })
            .catch(err => console.error('Ошибка обновления категории:', err));
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
    hideDropZones();
    dragData.isDragging = false;
    dragData.productId = null;
    dragData.currentCategory = null;
    dragData.isScrolling = false;

    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
}

function handleLongPress(e, productElement) {
    if (e.type === 'touchstart') {
        const touch = e.touches[0];
        dragData.startTouchX = touch.clientX;
        dragData.startTouchY = touch.clientY;
        dragData.isScrolling = false;

        dragData.longPressTimer = setTimeout(() => {
            if (!dragData.isScrolling) {
                dragData.isLongPress = true;
                startDrag(e, productElement);
            }
        }, 500);
    } else if (e.type === 'mousedown') {
        dragData.longPressTimer = setTimeout(() => {
            dragData.isLongPress = true;
            startDrag(e, productElement);
        }, 500);
    }
}

function cancelLongPress() {
    if (dragData.longPressTimer) {
        clearTimeout(dragData.longPressTimer);
        dragData.longPressTimer = null;
    }
    dragData.isLongPress = false;
}

function attachDragEvents(element, product) {
    if (product.bought) return;

    element.addEventListener('touchstart', function(e) {
        if (e.target.closest('.delete-btn')) return;
        handleLongPress(e, element);
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
        if (e.target.closest('.delete-btn')) return;
        handleLongPress(e, element);
    });

    element.addEventListener('mousemove', function(e) {
        cancelLongPress();
    });

    element.addEventListener('mouseup', function(e) {
        if (dragData.isLongPress) {
            e.preventDefault();
            e.stopPropagation();
        }
        cancelLongPress();
    });
}

// ================================================================
// 8. ОСНОВНАЯ ЛОГИКА
// ================================================================
addButton.addEventListener('click', addProduct);
productInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addProduct();
});

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

async function deleteProduct(id, name) {
    if (!confirm(`Удалить "${name}"?`)) return;
    try {
        await db.collection('products').doc(id).delete();
    } catch (error) {
        console.error('Ошибка удаления:', error);
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
                    author: product.author || null
                });
                await db.collection('products').doc(product.id).delete();
            } catch (error) {
                console.error('Ошибка архивации:', error);
            }
        }
    }
}

// ================================================================
// 9. ОТРИСОВКА
// ================================================================
function renderProducts(products) {
    products.forEach(p => {
        p.category = normalizeCategory(p.category);
        if (!p.author) {
            p.author = { name: 'Неизвестный', avatar: '👤' };
        }
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

    // Активные
    const activeGroups = groupByCategory(active);
    if (activeGroups.food.length) {
        const label = document.createElement('div');
        label.className = 'category-label';
        label.textContent = '🍔 Еда';
        productList.appendChild(label);
        activeGroups.food.forEach(p => productList.appendChild(createProductElement(p)));
    }
    if (activeGroups.other.length) {
        const label = document.createElement('div');
        label.className = 'category-label';
        label.textContent = '🛒 Остальное';
        productList.appendChild(label);
        activeGroups.other.forEach(p => productList.appendChild(createProductElement(p)));
    }

    if (bought.length) {
        const divider = document.createElement('hr');
        divider.className = 'divider';
        productList.appendChild(divider);
    }

    // Купленные
    const boughtGroups = groupByCategory(bought);
    if (boughtGroups.food.length) {
        const label = document.createElement('div');
        label.className = 'category-label bought-label';
        label.textContent = '🍔 Еда (куплено)';
        productList.appendChild(label);
        boughtGroups.food.forEach(p => productList.appendChild(createProductElement(p)));
    }
    if (boughtGroups.other.length) {
        const label = document.createElement('div');
        label.className = 'category-label bought-label';
        label.textContent = '🛒 Остальное (куплено)';
        productList.appendChild(label);
        boughtGroups.other.forEach(p => productList.appendChild(createProductElement(p)));
    }
}

function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-item' + (product.bought ? ' bought' : '');
    div.dataset.id = product.id;
    div.dataset.category = product.category;

    // Аватар автора
    const avatarSpan = document.createElement('span');
    avatarSpan.className = 'avatar-mini';
    avatarSpan.textContent = product.author.avatar || '👤';
    avatarSpan.title = product.author.name || 'Неизвестный';
    div.appendChild(avatarSpan);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    const catIcon = product.category === 'food' ? '🍔 ' : '🛒 ';
    nameSpan.textContent = catIcon + product.name;
    div.appendChild(nameSpan);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '8px';

    if (product.bought) {
        const check = document.createElement('span');
        check.className = 'check';
        check.textContent = '✔';
        right.appendChild(check);
    }

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteProduct(product.id, product.name);
        delBtn.blur();
    });
    right.appendChild(delBtn);
    div.appendChild(right);

    div.addEventListener('click', (e) => {
        if (dragData.isLongPress || dragData.isDragging) return;
        if (e.target.closest('.delete-btn')) return;
        toggleBought(product.id, product.bought);
    });

    if (!product.bought) {
        attachDragEvents(div, product);
    }

    return div;
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
        div.textContent = authorIcon + ' ' + catIcon + item.name;
        archiveItems.appendChild(div);
    });
}

// ================================================================
// 10. ПОДПИСКИ НА ИЗМЕНЕНИЯ
// ================================================================
db.collection('products')
    .orderBy('bought', 'asc')
    .onSnapshot((snapshot) => {
        const products = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            products.push({ id: doc.id, ...data });
        });
        products.sort((a, b) => {
            if (a.bought !== b.bought) return a.bought ? 1 : -1;
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return timeB - timeA;
        });
        renderProducts(products);
        archiveOldProducts(products);
    }, (error) => {
        console.error('Ошибка подписки на продукты:', error);
    });

db.collection('archive')
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

// ================================================================
// 11. АРХИВ – СВОРАЧИВАНИЕ
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
// 12. СТАРТ
// ================================================================
productInput.focus();
