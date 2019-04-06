import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Используйте для загрузки отчеты в формате xls, присылаемые вам на почту.<br>
                    Вы также можете запросить отчеты за произвольный период, обратившись<br>
                    к вашему персональному менеджеру по email или контактному телефону.<br>

                    <div class="import-default-text-margin-t">
                        Контактная информация о менеджере указана в отчете.
                    </div>
                </div>
                <v-img :src="IMAGES[0]" height="207" width="980" class="grey darken-4 image" @click.stop="openImage(IMAGES[0])"></v-img>
                <div class="import-default-text">
                    Полученный файлы используйте для импорта.
                </div>
            </div>
        </div>
    `
})
export class UralsibInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/uralsib/1.png"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }
}
