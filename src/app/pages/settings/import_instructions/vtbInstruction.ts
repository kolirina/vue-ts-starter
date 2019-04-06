import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Используйте для импорта отчеты в формате xls. При возникновении ошибок,<br>
                    попробуйте открыть файл в Excel и пересохраните в формате Excel-2003.<br>
                    Доступна загрузка сделок по бумагам, комиссий и денежных транзакций.
                    <div class="import-default-text-margin-t">
                        Вы можете использовать следующие типы отчетов для импорта:
                    </div>
                    <div class="import-default-text-margin-t">
                        Реестр сделок
                    </div>
                </div>

                <v-img :src="IMAGES[0]" height="265" width="980" class="grey darken-4 image" @click.stop="openImage(IMAGES[0])"></v-img>

                <div class="import-default-text">
                    <div class="import-default-text-margin-t">
                        Движение денег
                    </div>
                </div>

                <v-img :src="IMAGES[1]" height="300" width="980" class="grey darken-4 image" @click.stop="openImage(IMAGES[1])"></v-img>

                <div class="import-default-text">
                    <div class="import-default-text-margin-t">
                    Реестр комиссий за период
                    </div>
                </div>

                <v-img :src="IMAGES[2]" height="286" width="669" class="grey darken-4 image" @click.stop="openImage(IMAGES[2])"></v-img>

            </div>
        </div>
    `
})
export class VtbInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/vtb/1.png",
        "./img/import_instructions/vtb/2.png",
        "./img/import_instructions/vtb/3.png"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }
}
