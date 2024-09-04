// การเลือกปุ่มเพิ่มสินค้าเข้าในตะกร้าทั้งหมด
const addToCardButtons = document.querySelectorAll('.add-to-card');

// เลือกปุ่มปิด sidebar
const closeSidebarButton = document.querySelector('.sidebar-close i');

// เลือก icon ตะกร้าสินค้า
const cartIcon = document.querySelector('.cart-icon');

// เลือก element สำหรับแสดงรายการสินค้าในตะกร้า
const cardItemsContainer = document.querySelector('.card-items');

// เลือก element สำหรับแสดงยอดรวมทั้งหมดในตะกร้า
const cardTotalElement = document.querySelector('.card-total');

// array สำหรับเก็บข้อมูลสินค้าที่เพิ่มในตะกร้า
let cartItems = [];

// ฟังก์ชั่นเพิ่มสินค้าเข้าในตะกร้า
addToCardButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const itemName = document.querySelectorAll('.card .card--title')[index].textContent;
        const itemPrice = parseFloat(document.querySelectorAll('.card .price')[index].textContent.replace('$', ''));
        const itemImage = document.querySelectorAll('.card img')[index].src;

        // ค้นหาว่ามีสินค้ารายการเดียวกันในตะกร้าหรือไม่
        const existingItem = cartItems.find(item => item.name === itemName);

        if (existingItem) {
            // ถ้ามีสินค้าในตะกร้าแล้ว ให้เพิ่มจำนวน
            existingItem.quantity += 1;
        } else {
            // ถ้ายังไม่มีสินค้าในตะกร้า ให้เพิ่มสินค้าเข้าใน array
            cartItems.push({
                name: itemName,
                price: itemPrice,
                image: itemImage,
                quantity: 1
            });
        }

        // อัพเดตรายการสินค้าในตะกร้า
        updateCardItems();

        // แสดงยอดรวม
        updateCardTotal();

        // อัพเดตจำนวนสินค้าใน icon ตะกร้า
        updateCartIcon();
    });
});

// ฟังก์ชั่นปิด sidebar
closeSidebarButton.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('show');
});

// ฟังก์ชั่นเปิด sidebar
cartIcon.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('show');
});

// ฟังก์ชั่นอัพเดตรายการสินค้าในตะกร้า
function updateCardItems() {
    cardItemsContainer.innerHTML = '';

    cartItems.forEach((item, index) => {
        const cardItemElement = document.createElement('div');
        cardItemElement.classList.add('card-item');
        cardItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <div class="price-details">
            <span>${item.quantity} x ${item.price.toFixed(2)}</span>
            </div>
            <div class="price-details">
            <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <button class="remove-btn" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
            </button>
        `;

        cardItemsContainer.appendChild(cardItemElement);

        // เพิ่มฟังก์ชั่นลบสินค้า
        cardItemElement.querySelector('.remove-btn').addEventListener('click', removeItemFromCard);
    });
}


// ฟังก์ชั่นลบสินค้าจากตะกร้า
function removeItemFromCard(event) {
    const index = event.target.closest('button').dataset.index; // ใช้ closest เพื่อเข้าถึงปุ่ม <button> แล้วดึงค่า data-index
    cartItems.splice(index, 1);
    updateCardItems();
    updateCardTotal();
    updateCartIcon();
}

// ฟังก์ชั่นอัพเดตยอดรวมทั้งหมดในตะกร้า
function updateCardTotal() {
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    cardTotalElement.textContent = `$${total.toFixed(2)}`;
}

// ฟังก์ชั่นอัพเดตจำนวนสินค้าใน icon ตะกร้า
function updateCartIcon() {
    const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    cartIcon.querySelector('span').textContent = cartItemCount;
}

//ฟังค์ชั่นแสดงเมนูอาหารตามรายการที่เลือก
document.querySelectorAll('.menu--item').forEach(item => {
    item.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        document.querySelectorAll('.card').forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// แสดงรายการอาหารทั้งหมด
document.querySelector('[data-filter="all"]').click();


