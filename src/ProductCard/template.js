export default `
<img src="/placeholder.png" alt="изображение">
<div class="info">
    <div><span id="type"></span></div>
    <div>размер: <span id="size"></span></div>
    <div>ГОСТ <span id="gost"></span></div>
    <div>сорт: <span id="sort"></span></div>
    <div>материал: <span id="material"></span></div>
    <hr>
    <div class="controlls">
        <span id="price"></span>
        <div>
            <input value="1" type="number" min="1">
            <select>
                <option value="шт">шт</option>
                <option value="м²">м&sup2;</option>
            </select>
        </div>
        <button>в крозину</button>
    </div>
</div>
`;