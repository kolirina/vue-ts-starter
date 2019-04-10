import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            <p class="import-default-text">
                Перейдите по адресу <a href="https://login.zerich.com/profile.html#/home"
                                       target="_blank">https://login.zerich.com/profile.html#/home</a>
                Выберите пункт "Брокерское обслуживание" - "Отчеты", выберите свой счет.
                Нажмите кнопку "Создать отчет".
                Настройте "Сводный отчет", период отчета и формат XML.
                После его формирования отчет появится в списке отчетов. Нажмите ссылку "Скачать" для скачивания отчета.
                Доступна загрузка сделок по бумагам, комиссий и денежных транзакций.
            </p>
        </div>
    `
})
export class ZerichInstruction extends UI {
}
