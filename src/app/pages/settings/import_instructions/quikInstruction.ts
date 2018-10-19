import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Отчеты из терминала QUIK это универсальный вариант, подходящий к разным брокерам,
                которые дают возможность загрузить отчет через терминал.
            </p>
            <p>
                Для получения файла импорта в терминале QUIK
                <v-img :src="IMAGES[0]" height="240" width="300" class="grey darken-4" @click="openImage(IMAGES[0])"></v-img>
                перейдите в меню Отчет - Отчет по всем сделкам клиента.
                <v-img :src="IMAGES[1]" height="80" width="320" class="grey darken-4" @click="openImage(IMAGES[1])"></v-img>
                Сформируйте отчет за требуемый вам период.
                <v-img :src="IMAGES[2]" height="120" width="300" class="grey darken-4" @click="openImage(IMAGES[2])"></v-img>
                Полученный файл используйте для импорта.
            </p>
        </div>
    `
})
export class QuikInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/quik/1.png",
        "./img/import_instructions/quik/2.png",
        "./img/import_instructions/quik/3.png"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }
}
