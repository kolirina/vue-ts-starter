// noinspection TsLint
interface Array<T> {

    /**
     * Определяет, содержит ли массив определенный элемент
     * @param {T} value искомый элемент
     * @param {number} fromIndex позиция в массиве, с которой начинать поиск элемента searchElement, по умолчанию 0
     * @return {boolean} содержит ли массив определенный элемент
     */
    includes(value: T, fromIndex?: number): boolean;

    /**
     * Возвращает значение первого найденного в массиве элемента, которое удовлетворяет условию переданному в callbackfn функции.
     * В противном случае возвращается undefined.
     * @param {(value: T, index: number, array: T[]) => boolean} callbackfn функция, вызывающаяся для каждого значения в массиве
     * @param thisArg значение, используемое в качестве this при выполнении функции callback
     * @return {T} значение элемента из массива, если элемент прошел проверку, иначе undefined
     */
    find(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T | undefined;

    /**
     * Удаляет элемент массива
     * @param {number | T} indexOrObject индекс удаляемого элемента или удаляемый объект
     * @return {boolean} {@code true} если объект удалён
     */
    remove(indexOrObject: number | T): boolean;

    /**
     * Заменяет элемент массива
     * @param {number} index индекс заменяемого элемента
     * @param {T} value устанавливаем элемент
     */
    replace(index: number, value: T): void;

    /**
     * Ищет вхождение объекта в массив. Поиск осуществляется по содержимому контента
     * @param {T} value искомый элемент
     * @return {boolean} {@code true} если объект содержится в массиве
     */
    contains(obj: T): boolean;

    /**
     * Ищет индекс вхождения объекта в массив. Поиск осуществляется по содержимому контента
     * @param {T} value искомый элемент
     * @return {number} индекс вхождения в массив
     */
    indexOfObject(obj: T): number;
}

// noinspection TsLint
interface ReadonlyArray<T> {

    /**
     * Определяет, содержит ли массив определенный элемент
     * @param {T} value искомый элемент
     * @param {number} fromIndex позиция в массиве, с которой начинать поиск элемента searchElement, по умолчанию 0
     * @return {boolean} содержит ли массив определенный элемент
     */
    includes(value: T, fromIndex?: number): boolean;

    /**
     * Возвращает значение первого найденного в массиве элемента, которое удовлетворяет условию переданному в callbackfn функции.
     * В противном случае возвращается undefined.
     * @param {(value: T, index: number, array: T[]) => boolean} callbackfn функция, вызывающаяся для каждого значения в массиве
     * @param thisArg значение, используемое в качестве this при выполнении функции callback
     * @return {T} значение элемента из массива, если элемент прошел проверку, иначе undefined
     */
    find(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T | undefined;

    /**
     * Ищет вхождение объекта в массив. Поиск осуществляется по содержимому контента
     * @param {T} value искомый элемент
     * @return {boolean} {@code true} если объект содержится в массиве
     */
    contains(obj: T): boolean;

    /**
     * Ищет индекс вхождения объекта в массив. Поиск осуществляется по содержимому контента
     * @param {T} value искомый элемент
     * @return {number} индекс вхождения в массив
     */
    indexOfObject(obj: T): number;
}

// noinspection TsLint
interface String {

    /**
     * Определяет, начинается ли строка с символов другой строки
     * @param {string} searchString символы, искомые в начале данной строки
     * @param {number} position позиция в строке, с которой начинать поиск строки searchString, по умолчанию 0
     * @return {boolean} начинается ли строка с символов другой строки
     */
    startsWith(searchString: string, position?: number): boolean;

    /**
     * Определяет, заканчивается ли строка с символов другой строки
     * @param {string} searchString символы, искомые в конце данной строки
     * @param {number} length устанавливает длину строки, в которой производится поиск
     * @return {boolean} заканчивается ли строка с символов другой строки
     */
    endsWith(searchString: string, length?: number): boolean;

    /**
     * Определяет, находится ли одна строка внутри другой
     * @param {string} searchString строка для поиска
     * @param {number} position позиция в строке, с которой начинать поиск строки searchString, по умолчанию 0
     * @return {boolean} находится ли одна строка внутри другой
     */
    includes(searchString: string, position?: number): boolean;

    /**
     * Проверяет на строку на пустоту
     * @returns {boolean} {@code true} строка пустая, {@code false} иначе
     */
    isEmpty(): boolean;

    /**
     * Проверяет соответствует ли строка регулярному выражению
     * @param {string} regExp регулярное выражение
     * @returns {boolean} {@code true} строка соответствует регулярному выражению, {@code false} иначе
     */
    matches(regExp: string): boolean;

    /**
     * Заменяет соответствия регулярному выражению строкой replace
     * @param {string} regExp  регулярное выражение
     * @param {string} replace строка на которую заменяем
     * @returns {string} результирующая строка
     */
    replaceAll(regExp: string, replace: string): string;

    /**
     * Удаляет пробелы из строки
     * @returns {string} результирующая строка
     */
    deleteWhiteSpaces(): string;

    /**
     * Сравнивает строки игнорируя регистр
     * @param {string} str строка с которой сравниваем
     * @returns {boolean} {@code true} строки равны, {@code false} иначе
     */
    equalsIgnoreCase(str: string): boolean;

    /**
     * Сравнивает строки
     * @param {string} str строка с которой сравниваем
     * @returns {number} результат сравнения
     */
    compareTo(str: string): number;

    /**
     * Оборачивает спецсимволы
     * @param {string} str строка
     * @returns {string} результирующая строка
     */
    escapeSpecChars(): string;

    /**
     * Удаляет пробелы из начала и конца строки
     * @returns {string} обрезанная строка
     */
    trim(): string;
}