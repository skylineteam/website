export default `
:host {
    display: block;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
}
::slotted(*) {
    padding: var(--padding, 1em);
    height: calc(100% - (var(--padding, 1em) * 2));
    width: calc(100% - (var(--padding, 1em) * 2));
}
`;