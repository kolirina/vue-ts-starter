import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            Используйте для импорта <b>брокерские</b> отчеты в формате xls.<br>
            Вы также можете использовать для импорта реестры сделок.<br>
            Предпочтительным форматом является брокерский отчет.<br>
            При возникновении ошибок, попробуйте открыть файл в Excel <br>
            и пересохраните в формате Excel-2003.<br>
            Доступна загрузка сделок по бумагам, комиссий и денежных транзакций.
            <div class="import-default-text-margin-t">
                Получение брокерского отчета
            </div>

            <v-img :src="IMAGES[3]" max-width="980" class="grey darken-4 image"></v-img>
            <v-img :src="IMAGES[4]" max-width="980" class="grey darken-4 image"></v-img>

            <div class="import-default-text-margin-t">
                Вы можете использовать следующие типы отчетов для импорта:
            </div>
            <div class="import-default-text-margin-t">
                Реестр сделок
            </div>

            <v-img :src="IMAGES[0]" max-width="980" class="grey darken-4 image"></v-img>

            <div class="import-default-text-margin-t">
                Движение денег
            </div>

            <v-img :src="IMAGES[1]" max-width="980" class="grey darken-4 image"></v-img>

            <div class="import-default-text-margin-t">
                Реестр комиссий за период
            </div>

            <v-img :src="IMAGES[2]" max-width="669" class="grey darken-4 image"></v-img>
        </div>
    `
})
export class VtbInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/vtb/1.png",
        "./img/import_instructions/vtb/2.png",
        "./img/import_instructions/vtb/3.png",
        "./img/import_instructions/vtb/4.png",
        "./img/import_instructions/vtb/5.png",
    ];

}
