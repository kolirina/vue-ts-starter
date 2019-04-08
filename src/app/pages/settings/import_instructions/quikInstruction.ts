import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div class="import-default-text">
                Отчеты из терминала QUIK это универсальный вариант, подходящий к разным<br>
                брокерам, которые дают возможность загрузить отчет через терминал.
            </div>
            <div class="import-default-text import-default-text-margin-t">
                Для получения файла импорта в терминале QUIK
            </div>
            <div>
                <v-img :src="IMAGES[0]" height="250" width="948" class="grey darken-4 image"></v-img>
                <div class="import-default-text">
                    Перейдите в меню "Расширения" -> "Отчеты" -> "Отчет по всем сделкам клиента".
                </div>
                <v-img :src="IMAGES[1]" height="159.5" width="622.5" class="grey darken-4 image"></v-img>
                <div class="import-default-text">
                    Сформируйте отчет за требуемый вам период.
                </div>
                <v-img :src="IMAGES[2]" height="90" width="279" class="grey darken-4 image"></v-img>
                <div class="import-default-text">
                    Полученный файл используйте для импорта.
                </div>
            </div>
        </div>
    `
})
export class QuikInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/quik/1.png",
        "./img/import_instructions/quik/2.png",
        "./img/import_instructions/quik/3.png"
    ];

}
