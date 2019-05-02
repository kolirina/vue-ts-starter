export class CommonUtils {

    private constructor() {
    }

    /**
     * Проверка на существование объекта
     * @param obj объект
     * @returns boolean true если объект существует. В противном случае возвращается false
     */
    static exists(obj: any): boolean {
        return !(obj === null || typeof obj === "undefined");
    }

    /**
     * Проверка строки на пустоту
     * @param str
     * @return {boolean}
     */
    static isBlank(str: any): boolean {
        return !CommonUtils.exists(str) || str.trim().length === 0;
    }

    /**
     * Добавляет пробелы вокруг символов < и >
     * @param {string} stringValue строка для обработки
     * @return обработанная строка
     */
    static newLine(stringValue: string): any {
        let temp = " ";
        for (let i = 0; i < stringValue.length; i = i + 1) {
            const c = stringValue.charAt(i) + "";
            if (c === "<") {
                temp = temp + " <";
            } else if (c === ">") {
                temp = temp + "> ";
            } else {
                temp = temp + c;
            }
        }
        return temp;
    }

    /**
     * Генерирует уникальный идентификатор
     */
    static uuid(): string {
        let uuid = "";
        let i;
        let random;
        for (i = 0; i < 32; i++) {
            // tslint:disable-next-line
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += "-";
            }
            // tslint:disable-next-line
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }
}
