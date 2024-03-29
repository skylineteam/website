import { data } from "./data.js";
import { Cart } from "./cart.js";
import { ProductCard } from "./src/ProductCard/component.js";
import currency from "#currency";
import "./src/layoutManager/component.js"

customElements.define("product-card", ProductCard)

const catalog = /**@type {Element}*/(document.querySelector(".catalog"));

function computeType(w, h) {
    if (w >= 100 && h >= 100) return "брус"
    if (w/2 >= h) return "доска"
}

const orderModal = /**@type {HTMLDialogElement} */(document.getElementById("modal"));
const orderModalLayout = /**@type { import("./src/layoutManager/component.js").Layout } */(document.querySelector("#modal>layout-viewport"));
const cartList = /**@type {HTMLUListElement} */(document.getElementById("cart-list"));
const cartBtn = /**@type {HTMLButtonElement} */(document.getElementById("cart-btn"));
const cartTotal = /**@type {HTMLSpanElement} */(document.querySelector("#cart .total"));

const cartCounterKey = Symbol("cart counter");

const app = ({
    /**@readonly */
    cart: /**@type {Cart<string, {amount: number, price: number}>} */(new Cart({
        "amount"(val) {return val <= 0}
    })),
    [cartCounterKey]: /**@type {number}*/(0),
    get inCart(){
        return this[cartCounterKey];
    },
    set inCart(value){
        this[cartCounterKey] = value;
        cartBtn.style.setProperty("--value", value == 0? "" : `"${value}"`);
    }
});
/**@typedef { typeof app} App */
Object.defineProperty(window, "app", {
    configurable: false,
    writable: false,
    enumerable: false,
    value: app
})

window.app.cart.addEventListener("delete", /**@param {CustomEvent<{key: string}> } e */ function(e){
    const { key } = e.detail;
    for (const element of cartList.querySelectorAll(`li[data-key="${key}"]`)) {
        element.remove();
    }
});

function renderCart() {
    cartTotal.dataset.value = `0`
    cartTotal.innerText = currency.format(0);
    const fragment = new DocumentFragment();
    for (const [key, value] of window.app.cart) {
        const template = (new Range()).createContextualFragment(`
            <li data-key="${key}">
                <span>${key}</span>
                <span data-class="price"></span>
                <input data-value="0" value="0" type="number" min="0">
                <button class="delete">
                    <svg><use href="#icon-delete"></use></svg>
                </button>
            </li>
        `);
        const li = /**@type {HTMLLIElement}*/ (template.querySelector("li"));
        const btn = /**@type {HTMLButtonElement }*/ (template.querySelector("button"));
        const input = /**@type {HTMLInputElement  }*/ (template.querySelector("input"));
        const priceLable = /**@type {HTMLSpanElement}*/ (template.querySelector('[data-class="price"]'));

        input.addEventListener("change", function(e) {
            const value = parseInt(this.value)
            const oldValue = parseInt(this.dataset.value);
            const { price }  = window.app.cart.get(key)

            const total = value * price;
            priceLable.innerText = currency.format(total);
            this.dataset.value = `${value}`;

            const globalTotal = parseInt(cartTotal.dataset.value ?? "0") + ((value - oldValue) * price)
            cartTotal.dataset.value = `${globalTotal}`
            cartTotal.innerText = currency.format(globalTotal);

            const oldVal = window.app.cart.set(key, "amount", value);
            window.app.inCart += (value - oldVal);
        });
        btn.addEventListener("click", function(e) {
            window.app.inCart -= (window.app.cart.delete(key)?.amount ?? 0);
            li.remove();
        });

        input.value = `${value.amount}`;
        input.dispatchEvent(new Event("change"));

        fragment.append(template);
    }
    cartList.replaceChildren(fragment)
}

cartBtn.addEventListener("click", function(e){
    renderCart();
    orderModalLayout.show("cart");
    orderModal.showModal();
});

for (const {GOST, material: materials, props: props_list, sort } of data.items) {
    for (const props of props_list) {
        const element = /**@type { ProductCard } */(document.createElement("product-card"));
        element.type = computeType(props.w, props.h);
        element.size = `${props.h}x${props.w}x${props.l}`;
        element.gost = GOST;
        element.sort = sort;
        element.material = materials.join(", ");
        element.price = props.price
        catalog.append(element);
    }

}

{
    const closeCart = /**@type {HTMLButtonElement} */(document.querySelector("#cart .close"));
    closeCart.addEventListener("click", function(e) {
        orderModal.close();
    })

    const closeOrder = /**@type {HTMLButtonElement} */(document.querySelector("#order .close"));
    closeOrder.addEventListener("click", function(e) {
        orderModal.close();
    })

    const orderCreate = /**@type {HTMLButtonElement} */(document.querySelector("#cart .order"));
    orderCreate.addEventListener("click", function(e) {
        if (app.cart.size <= 0) {
            alert("корзина пуста");
        } else {
            orderModalLayout.show("order");
        }
    });

    const form = document.querySelector("#order .form");

    const orderEmplace = /**@type {HTMLButtonElement} */(document.querySelector("#order .emplace"));
    orderEmplace.addEventListener("click", function(e) {
        const data = {
            person: {},
            order: {}
        }
        for (const element of form.querySelectorAll("input")) {
            if (!(element.checkValidity())) {
                alert(`поле "${element.name}" заполнено не верно`)
                return;
            }
            data.person[element.name] = element.value;
        }
        for (const [key, value] of app.cart) {
            data.order[key] = value;
        }
        for (const key in data.order) {
            window.app.inCart -= (app.cart.delete(key)?.amount ?? 0);
        }
        fetch("https://skylineteam-api.onrender.com/order/create", {
            method: "POST",
            body: JSON.stringify(data)
        }).then((data)=>data.json()).then(resp => {
            console.log(resp);
            orderModal.close();
            window.alert("zakazano")
        })
    });

}
