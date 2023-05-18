/**
 * @template K
 * @template { {} } V
 */
export class Cart extends EventTarget{
    /**
     * @param { { [key in keyof V]?: (val: V[key]) => boolean } } observers
     */
    constructor(observers){
        super()
        this.#observers = observers;
    }
    #observers;
    /**@type { Map<K, V> } */
    #map = new Map();

    [Symbol.iterator](){
        return this.#map[Symbol.iterator]();
    };

    /**
     * @template { keyof V } P
     * @param { K } id 
     * @param { P } key 
     * @param { V[P] } value
     * @param { () => V } [defaultVal]
     */
    set(id, key, value, defaultVal){
        let container = this.#map.get(id);
        if (container == undefined) {
            if (defaultVal) {
            container = structuredClone(defaultVal());
            this.#map.set(id, container);
            } else {
                throw new Error("")
            }
        }
        const old = container[key];
        container[key] = value;
        if (key in this.#observers && this.#observers[key](value)) {
            this.#map.delete(id);
            this.dispatchEvent(new CustomEvent("delete", {detail: {key: id}}))
        }
        return old;
    }

    /** 
     * @param { K } id 
     */
    get(id){
        return this.#map.get(id);
    }

    /** 
     * @param { K } id 
     */
    delete(id) {
        const value = this.#map.get(id) ?? null;
        if (this.#map.delete(id)) {
            this.dispatchEvent(new CustomEvent("delete", {detail: {key: id, value: value}}))
        }
        return value;
    }

    /**
     * @template { keyof V } P
     * @param { K } id 
     * @param { P } key 
     * @param { (oldVal: V[P]) => V[P] } updatefn
     * @param { () => V } [defaultVal]
     */
    update(id, key, updatefn, defaultVal){
        let container = this.#map.get(id);
        if (container == undefined) {
            if (defaultVal) {
                container = structuredClone(defaultVal());
                this.#map.set(id, container);
            } else {
                throw new Error("")
            }
        } 
        const value = updatefn(container[key]);
        container[key] = value;
        if (key in this.#observers && this.#observers[key](value)) {
            this.#map.delete(id);
            this.dispatchEvent(new CustomEvent("delete", {detail: {key: id}}))
        }
    }

    get size(){
        return this.#map.size;
    }

}
