import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            Перейдите по адресу <a href="https://login.zerich.com/profile.html#/home"
                                   target="_blank">https://login.zerich.com/profile.html#/home</a><br>
            Выберите пункт "Брокерское обслуживание" - "Отчеты", выберите свой счет.<br>
            Нажмите кнопку "Создать отчет".<br>
            Настройте "Сводный отчет", период отчета и формат XML.<br>
            После его формирования отчет появится в списке отчетов. Нажмите ссылку "Скачать" для скачивания отчета.<br>
            Доступна загрузка сделок по бумагам, комиссий и денежных транзакций.
        </div>
    `
})
export class ZerichInstruction extends UI {
}
