/**
 * Утилиты по работе с файлами
 */
export class FileUtils {

    /** Допустимые расширения файлов */
    static readonly ALLOWED_EXTENSION = ["txt", "csv", "xml", "xls", "xlsx", "json", "cpt", "html"];
    /** Допустимые MIME типы */
    static readonly ALLOWED_MIME_TYPES = "text/plain, application/excel, application/vnd.ms-excel, application/x-excel, application/x-msexcel, application/xml, " +
        "text/xml, .csv, .json, .cpt, application/x-cpt, text/html";

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

    static checkExtension(file: File): boolean {
        return FileUtils.ALLOWED_EXTENSION.includes(this.getFileExtension(file));
    }

    /**
     * Возвращает расширение файла
     * @param file файл
     */
    static getFileExtension(file: File): string {
        return file.name.split(".").pop().toLowerCase();
    }
}