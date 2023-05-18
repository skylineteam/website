export default `
:host {
    display: flex;
    flex-direction: column;
    width: min-content;
    background-color: var(--color-2);
    border: 1px solid var(--color-3);
}

img {
    width: 100%;
    object-fit: cover;
    aspect-ratio: 1/1;
}

.info {
    padding: 1em;
}

.controlls {
    display: flex;
    gap: 1em;
    justify-content: space-between;
    align-items: center;
}

.controlls>div {
    display: flex;
}

button {
    border: 0;
    background-color: var(--color-3);
    padding: 0.5em;
    border-radius: 0.25em;
    color: var(--font-color-1);
    white-space: nowrap;
}

button:active {
    background-color: var(--color-4);
}

input {
    height: 1em;
    font-size: inherit;
    width: 2em;
}

#price {
    font-weight: bold;
    width: 6em;
}
`;