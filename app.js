// ================================================================
// 1. НАСТРОЙКА FIREBASE (ЗАМЕНИТЕ НА СВОИ ДАННЫЕ)
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
// 2. ТЕМА
// ================================================================
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// ================================================================
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================================================
function isOlderThan24Hours(timestamp) {
    if (!timestamp) return false;
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return timestamp.toDate() < dayAgo;
}

// ================================================================
// 4. DOM-ЭЛЕМЕНТЫ
// ================================================================
const productList = document.getElementById('productList');
const productInput = document.getElementById('productInput');
const addButton = document.getElementById('addButton');
const archiveToggle = document.getElementById('archiveToggle');
const archiveItems = document.getElementById('archiveItems');
const archiveCount = document.getElementById('archiveCount');

// Категории
const catBtns = document.querySelectorAll('.cat-btn');
let selectedCategory = 'food'; // по умолчанию

catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.dataset.category;
    });
});

// ================================================================
// 5. ОСНОВНАЯ ЛОГИКА
// ================================================================
addButton.addEventListener('click', addProduct);
productInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addProduct();
});

async function addProduct() {
    const name = productInput.value.trim();
    if (!name) return;
    try {
        await db.collection('products').add({
            name: name,
            category: selectedCategory,
            bought: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            boughtAt: null
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
        if (product.bought && product.boughtAt && isOlderThan24Hours(product.boughtAt)) {
            try {
                await db.collection('archive').add({
                    name: product.name,
                    category: product.category || 'other',
                    boughtAt: product.boughtAt,
                    createdAt: product.createdAt
                });
                await db.collection('products').doc(product.id).delete();
            } catch (error) {
                console.error('Ошибка архивации:', error);
            }
        }
    }
}

function renderProducts(products) {
    productList.innerHTML = '';
    if (products.length === 0) {
        productList.innerHTML = '<div class="empty-message">Пока ничего нет. Добавьте продукты!</div>';
        return;
    }

    const active = products.filter(p => !p.bought);
    const bought = products.filter(p => p.bought);

    const groupByCategory = (items) => {
        const food = items.filter(p => p.category === 'food');
        const other = items.filter(p => p.category !== 'food' || !p.category);
        return { food, other };
    };

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

    if (bought.length > 0) {
        const divider = document.createElement('hr');
        divider.className = 'divider';
        productList.appendChild(divider);
    }

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
    });
    right.appendChild(delBtn);
    div.appendChild(right);

    div.addEventListener('click', () => {
        toggleBought(product.id, product.bought);
    });

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
        const catIcon = item.category === 'food' ? '🍔 ' : '🛒 ';
        div.textContent = catIcon + item.name;
        archiveItems.appendChild(div);
    });
}

// ================================================================
// 6. ПОДПИСКИ НА ИЗМЕНЕНИЯ (realtime)
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
// 7. УПРАВЛЕНИЕ АРХИВОМ (сворачивание)
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
// 8. СТАРТ
// ================================================================
productInput.focus();