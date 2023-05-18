import style from "./style.js";
import template from "./template.js";
import currency from "#currency";

export class ProductCard extends HTMLElement {
    static template = (new Range()).createContextualFragment(template);
    static style = new CSSStyleSheet();
    static {
        this.style.replace(style);
    }
    

    static get observedAttributes() {
        return /**@type { const }*/([
            "data-type",
            "data-size",
            "data-gost",
            "data-sort",
            "data-material",
            "data-price",
        ]);
    }

    /**@satisfies { { [attr in (typeof ProductCard)["observedAttributes"][number]]: (this: ProductCard, oldVal: string | null, newVal: string | null) => void} } */
    static #handlers = {
        "data-type"(oldVal, newVal) {
            this.#elements.type.innerText = `${newVal}`;
        },
        "data-size"(oldVal, newVal) {
            this.#elements.size.innerText = `${newVal}`;
        },
        "data-gost"(oldVal, newVal) {
            this.#elements.gost.innerText = `${newVal}`;
        },
        "data-sort"(oldVal, newVal) {
            this.#elements.sort.innerText = `${newVal}`;
        },
        "data-material"(oldVal, newVal) {
            this.#elements.material.innerText = `${newVal}`;
        },
        "data-price"(oldVal, newVal) {
            this.#price = parseFloat(newVal);
            this.renderPrice();
        },
    }
    /**@type { Record<string, (this: ProductCard) => number> } */
    static #priceHandlers = {
        "шт"(){
            /**@type {string[]} */
            const dims = this.dataset.size.split("x");
            const area = dims.reduce((accum, val) => accum * parseInt(val), 1)
            return Math.floor((area * 1e-7) * this.#price) * 1e-2;
        },
        "м²"(){ return this.#price },
    };

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "closed" });
        const template = ProductCard.template.cloneNode(true);

        this.#elements = {
            type:       /**@type {HTMLSpanElement}*/(template.getElementById("type")),
            size:       /**@type {HTMLSpanElement}*/(template.getElementById("size")),
            gost:       /**@type {HTMLSpanElement}*/(template.getElementById("gost")),
            sort:       /**@type {HTMLSpanElement}*/(template.getElementById("sort")),
            material:   /**@type {HTMLSpanElement}*/(template.getElementById("material")),
            price:      /**@type {HTMLSpanElement}*/(template.getElementById("price"))
        }

        const self = this;

        const addToCart = /**@type {HTMLButtonElement}*/(template.querySelector("button"));
        const getDefault = () => ({
            amount: 0,
            price: ProductCard.#priceHandlers[this.#units].call(this)
        });
        addToCart.addEventListener("click", function(e) {
            const key = `${self.dataset.type}(${self.dataset.material}): ${self.dataset.size}, ${self.dataset.sort} сорт, гост ${self.dataset.gost} (${self.#units})`

            window.app.cart.update(key, "amount", (v) => v + self.#delta, getDefault);
            window.app.inCart+= self.#delta;
        });
        const unitsSelect = /**@type {HTMLSelectElement }*/(template.querySelector("select"));
        this.#units = unitsSelect.value;
        unitsSelect.addEventListener("change", function (e) {
            self.#units = this.value;
            self.renderPrice();
        })
        const deltaInput = /**@type {HTMLInputElement}*/(template.querySelector("input"));
        this.#delta = parseInt(deltaInput.value);
        deltaInput.addEventListener("change", function(e) {
            self.#delta = parseInt(this.value);
        })

        this.#shadow.append(template);
        this.#shadow.adoptedStyleSheets = [ProductCard.style];

    }

    renderPrice(){
        this.#elements.price.innerText = `${currency.format(ProductCard.#priceHandlers[this.#units].call(this))}`;
    }

    #shadow;

    #elements;

    #units;
    #delta;
    #price = 0;

    set type(value) {
        this.dataset.type = value;
    }
    set size(value) {
        this.dataset.size = value;
    }
    set gost(value) {
        this.dataset.gost = value;
    }
    set sort(value) {
        this.dataset.sort = value;
    }
    set material(value) {
        this.dataset.material = value;
    }
    set price(value) {
        this.dataset.price = value;
    }

    /**
     * 
     * @param { (typeof ProductCard)["observedAttributes"][number] } attrName 
     * @param { string } oldVal 
     * @param { string } newVal 
     */
    attributeChangedCallback(attrName, oldVal, newVal) {
        ProductCard.#handlers[attrName].call(this, oldVal, newVal);
    }
}