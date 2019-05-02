/**
 * Полифиллы объекта String
 */

if (!String.prototype.startsWith) {

    /**
     * Определяет, начинается ли строка с символов другой строки
     * @param {string} searchString символы, искомые в начале данной строки
     * @param {number} stringPosition позиция в строке, с которой начинать поиск строки searchString, по умолчанию 0
     * @return {boolean} начинается ли строка с символов другой строки
     */
    String.prototype.startsWith = function(searchString: string, stringPosition?: number): boolean {
        const position = stringPosition || 0;
        return this.indexOf(searchString, position) === position;
    };
}

if (!String.prototype.endsWith) {

    /**
     * Определяет, заканчивается ли строка с символов другой строки
     * @param {string} searchString символы, искомые в конце данной строки
     * @param {number} stringLength устанавливает длину строки, в которой производится поиск
     * @return {boolean} заканчивается ли строка с символов другой строки
     */
    String.prototype.endsWith = function(searchString: string, stringLength?: number): boolean {
        const subjectString = this.toString();
        let length = stringLength;
        if (length === undefined || length > subjectString.length) {
            length = subjectString.length;
        }
        length -= searchString.length;
        const lastIndex = subjectString.indexOf(searchString, length);
        return lastIndex !== -1 && lastIndex === length;
    };
}

if (!String.prototype.includes) {

    /**
     * Определяет, находится ли одна строка внутри другой
     * @param {string} searchString строка для поиска
     * @param {number} position позиция в строке, с которой начинать поиск строки searchString, по умолчанию 0
     * @return {boolean} находится ли одна строка внутри другой
     */
    String.prototype.includes = function(searchString: string, position?: number): boolean {
        return this.indexOf(searchString, position) !== -1;
    };
}

if (!String.prototype.trim) {

    /**
     * Удаляет пробелы из начала и конца строки
     * @returns {string} обрезанная строка
     */
    String.prototype.trim = function(): string {
        return this.replace(/^\s+|\s+$/g, "");
    };
}

/**
 * Проверяет на строку на пустоту
 * @returns {boolean} {@code true} строка пустая, {@code false} иначе
 */
String.prototype.isEmpty = function(): boolean {
    return this.trim().length === 0;
};

/**
 * Проверяет соответствует ли строка регулярному выражению
 * @param {string} regExp регулярное выражение
 * @returns {boolean} {@code true} строка соответствует регулярному выражению, {@code false} иначе
 */
String.prototype.matches = function(regExp: string): boolean {
    return !!this.match("^" + regExp + "$");
};

/**
 * Заменяет соответствия регулярному выражению строкой replace
 * @param {string} regExp  регулярное выражение
 * @param {string} replace строка на которую заменяем
 * @returns {string} результирующая строка
 */
String.prototype.replaceAll = function(regExp: string, replace: string): string {
    if (typeof regExp !== "string") {
        throw new Error("Regular expression must be initialized with string literal");
    }
    return this.replace(new RegExp(regExp, "g"), replace);
};

/**
 * Удаляет пробелы из строки
 * @returns {string} результирующая строка
 */
String.prototype.deleteWhiteSpaces = function(): string {
    return this.replaceAll(" ", "");
};

/**
 * Сравнивает строки игнорируя регистр
 * @param {string} str строка с которой сравниваем
 * @returns {boolean} {@code true} строки равны, {@code false} иначе
 */
String.prototype.equalsIgnoreCase = function(str: string): boolean {
    return str != null && this.toUpperCase() === str.toUpperCase();
};

/**
 * Сравнивает строки
 * @param {string} str строка с которой сравниваем
 * @returns {number} результат сравнения
 */
String.prototype.compareTo = function(str: string): number {
    return this.localeCompare(str);
};

/**
 * Оборачивает спецсимволы
 * @param {string} str строка
 * @returns {string} результирующая строка
 */
String.prototype.escapeSpecChars = function(): string {
    return this.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};