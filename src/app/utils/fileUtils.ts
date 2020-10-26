/**
 * Утилиты по работе с файлами
 */
export class FileUtils {

    /** Допустимые MIME типы */
    static readonly ALLOWED_MIME_TYPES = "text/plain, application/excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel," +
        " application/x-excel, application/x-msexcel, application/xml, text/xml, .csv, .json, .cpt, application/x-cpt, text/html";

    /**
     * Не дает создать экземпляр класса
     */
    private constructor() {
    }

    /**
     * Преобразует объект FileList в список файлов
     * @param fileList объект FileList
     * @return список файлов
     */
    static fileListToFileArray(fileList: FileList): File[] {
        return Array.prototype.map.call(fileList, (item: File) => item) as File[];
    }

    static checkExtension(allowedExtensions: string[], file: File): boolean {
        return allowedExtensions.includes(this.getFileExtension(file));
    }

    /**
     * Возвращает расширение файла
     * @param file файл
     */
    static getFileExtension(file: File): string {
        return file.name.split(".").pop().toLowerCase();
    }
}
