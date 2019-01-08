/**
 * Утилиты по работе с файлами
 */
export class FileUtils {

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
}