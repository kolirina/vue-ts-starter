import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Используйте для загрузки отчеты в формате xls, присылаемые вам на почту.
                <br></br>
                Вы также можете запросить отчеты за произвольный период,
                обратившись в вашему персональному менеджеру по email или контактному телефону.
                <br></br>
                Контактная информация о менеджере указана в отчете.
                <v-img :src="IMAGES[0]" height="105" width="380" class="grey darken-4" @click="openImage(IMAGES[0])"></v-img>
                Полученный файлы используйте для импорта.
            </p>
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
