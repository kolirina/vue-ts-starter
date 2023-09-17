/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2022
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2022
 */

/**
 * Удаляет элемент массива
 * @param indexOrObject индекс удаляемого элемента или удаляемый объект
 * @return {@code true} если объект удалён
 */
Array.prototype.remove = function<T>(indexOrObject: number | T): boolean {
    const index = typeof indexOrObject === "number" ? indexOrObject : this.indexOf(indexOrObject);
    if (index !== -1) {
        this.splice(index, 1);
    }
    return index !== -1;
};