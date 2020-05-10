import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            Используйте для загрузки отчеты в формате xls, присылаемые вам на почту.<br>
            Вы также можете запросить отчеты за произвольный период, обратившись<br>
            к вашему персональному менеджеру по email или контактному телефону.<br>

            <div class="import-default-text-margin-t">
                Контактная информация о менеджере указана в отчете.
            </div>
            <v-img :src="IMAGES[0]" max-width="980" class="grey darken-4 image"></v-img>

            Полученный файлы используйте для импорта.
        </div>
    `
})
export class UralsibInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/uralsib/1.png"
    ];

}
