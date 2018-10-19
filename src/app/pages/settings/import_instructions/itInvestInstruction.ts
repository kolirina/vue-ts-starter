import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                В электронном кабинете выберите вкладку ОТЧЕТЫ, затем подпункт
                ОТЧЕТЫ БРОКЕРА ЗА ОПРЕДЕЛЕННЫЙ ПЕРИОД. Выберите период и поставьте две галочки -
                "Отчет в формате XML" и "Показывать сделки". Полученный файл необходимо открыть в Excel и
                сохранить в формате CSV. Используйте этот CSV-файл для импорта.
            </p>
        </div>
    `
})
export class ItInvestInstruction extends UI {
}
