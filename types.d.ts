type material = "сосна" | "пихта" | "ель";

type item = {
    props: ({
        h: number,
        w: number,
        l: number,
        price: number,
    })[],
    GOST: string,
    sort: number,
    material: material[];
}

interface DocumentFragment {
    cloneNode(deep?: boolean | undefined): DocumentFragment;
}

interface Window {
    app: import("./app.js").App;
}