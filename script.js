const cartList = document.querySelector(".cart-list");
const confirmedCartList = document.querySelector(".confirmed-cart-list");
const emptyElement = document.querySelector(".empty");
const confirmedOrderElement = document.querySelector(".order-confirmation-wrapper");
const orderBtn = document.querySelector(".order-btn");
const newOrderBtn = document.querySelector(".new-order-btn");

let totalQuantity = 0;
let totalPrice = 0;
let products = [];
const sumPrice = document.querySelector(".total-price");
const confirmedTotalPrice = document.querySelector(".confirmed-total-price");
const count = document.querySelector(".count");
const orderElement = document.querySelector(".order");


function updateUI(){
    totalQuantity = 0;
    totalPrice = 0;
    emptyElement.style.display = "none";
    orderElement.style.display = "flex";

    cartList.innerHTML = ``;
    confirmedCartList.innerHTML = ``;
    Object.entries(listCart).forEach(([key, value]) => {
        totalQuantity += value.quantity;

        let itemTotalPrice = value.price * value.quantity;
        totalPrice += itemTotalPrice;

        let newDiv = document.createElement("li");
        newDiv.dataset.key = key;


        newDiv.innerHTML = `
            <div class="info">
                <h3>${value.name}</h3>
                <div>
                    <p>${value.quantity}x</p>
                    <p>@ $${value.price.toFixed(2)}</p>
                    <p>$${itemTotalPrice.toFixed(2)}</p>
                </div>
            </div>
            <span class="remove-btn">
                <img src="./assets/images/icon-remove-item.svg">
            </span>
        `;
        cartList.appendChild(newDiv);
        let confirmedDiv = document.createElement("li");
        confirmedDiv.dataset.key = key;
        confirmedDiv.innerHTML = `
            <div class="info-confirmed">
                <img src="${value.image.mobile}">
                <div class="item-details">
                    <h3>${value.name}</h3>
                    <div>
                        <p>${value.quantity}x</p>
                        <p>@ $${value.price.toFixed(2)}</p>
                        
                    </div>
                </div>
                <p id="total">$${itemTotalPrice.toFixed(2)}</p>
            </div>
        `;
        confirmedCartList.appendChild(confirmedDiv);

    });

    sumPrice.innerHTML = "$" + totalPrice.toFixed(2);
    confirmedTotalPrice.innerHTML = "$" + totalPrice.toFixed(2);
    count.innerHTML = totalQuantity;
    if(totalQuantity == 0){
        emptyElement.style.display = "block";
        orderElement.style.display = "none";
    }
}

async function fetchProducts() {
    
    try{
        let res = await fetch("./data.json");
        if(!res.ok) throw new Error("Error!");
        products = await res.json();
        console.log(products);
        render(products);
    }catch(err){
        handleError(err.message);
    }
}

function handleError(message){
    console.log(message);
}

const productList = document.querySelector(".product-list");

function render(products){
    productList.innerHTML = ``;
    products.forEach((value, key) => {
        let li = document.createElement("li");
        li.dataset.key = key;
        li.innerHTML = `
            <picture>   
                <source media="(min-width: 1440px)" srcset = "${value.image.desktop}"></source>
                <source media="(min-width: 768px)" srcset = "${value.image.tablet}"></source>
                <img src="${value.image.mobile}">
                <button class = "add-btn" data-key="${key}">
                    <img src="./assets/images/icon-add-to-cart.svg">
                    <p>Add to Cart</p>
                </button>
            </picture>
            
            <div class="info">
                <p class = "product-category">${value.category}</p>
                <h3 class="product-name">${value.name}</h3>
                <h3 class="product-price">$${value.price.toFixed(2)}</h3>
            </div>
        `;
        productList.appendChild(li);
    });
}



productList.addEventListener("click", function (e) {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    const product = btn.closest("li");
    product.classList.add("active");
    const key = btn.dataset.key;
    addToCart(key);
    transformButton(btn, key);
});


cartList.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-btn");
    if (!removeBtn) return;

    const cartItem = removeBtn.closest("li");
    const key = cartItem.dataset.key;


    delete listCart[key];

    const product = productList.querySelector(`li[data-key="${key}"]`);
    if (product) {
        product.classList.remove("active");

        const box = product.querySelector(".quantity-box");
        if (box) {
            box.outerHTML = `
                <button class="add-btn" data-key="${key}">
                    <img src="./assets/images/icon-add-to-cart.svg">
                    <p>Add to Cart</p>
                </button>
            `;
        }
    }

    updateUI();
});


orderBtn.addEventListener("click", () => {
    
    confirmedOrderElement.style.display = "flex";
});

newOrderBtn.addEventListener("click", () => {
    confirmedOrderElement.style.display = "none";
    listCart = {};
    render(products);  
    updateUI();
});





function transformButton(btn, key) {
    btn.outerHTML = `
        <div class="quantity-box">
            <button class="minus" data-key="${key}"><img src = "./assets/images/icon-decrement-quantity.svg"></button>
            <span>${listCart[key].quantity}</span>
            <button class="plus" data-key="${key}"><img src = "./assets/images/icon-increment-quantity.svg"></button>
        </div>
    `;
}
productList.addEventListener("click", (e)=>{
    
    const plusBtn = e.target.closest(".plus");
    const minusBtn = e.target.closest(".minus");

    if (plusBtn) {
        changeQuantity(plusBtn.dataset.key, 1);
    }

    if (minusBtn) {
        changeQuantity(minusBtn.dataset.key, -1);
    }
});
function changeQuantity(key, quantity) {
    if (!listCart[key]) return;

    listCart[key].quantity += quantity;
    const product = productList.querySelector(`li[data-key="${key}"]`);
    if (product) {
        const qtySpan = product.querySelector(".quantity-box span");
        if (qtySpan) {
            qtySpan.textContent = listCart[key].quantity;
        }
    }
    if (listCart[key].quantity <= 0) {
        delete listCart[key];

        const product = productList.querySelector(`li[data-key="${key}"]`);
        if (product) {
            product.classList.remove("active"); 
        }

        const box = document.querySelector(
            `.quantity-box [data-key="${key}"]`
        ).parentElement;

        box.outerHTML = `
            <button class="add-btn" data-key="${key}">
                <img src="./assets/images/icon-add-to-cart.svg">
                <p>Add to Cart</p>
            </button>
        `;
    }


    updateUI();
    
}

let listCart = {};
let quantity = 0;


function addToCart(key){
    if(!listCart[key]){
        listCart[key] = {
            ...products[key],
            quantity: 1
        };
        
    }
    updateUI();
}





fetchProducts();