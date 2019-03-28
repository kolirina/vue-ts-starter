import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Используйте для импорта отчеты в формате xls.
                При возникновении ошибок, попробуйте открыть файл в Excel и пересохраните в формате Excel-2003.
                <br/>
                Доступна загрузка сделок по бумагам, комиссий и денежных транзакций.
                <br/>
                Вы можете использовать следующие типы отчетов для импорта:
            <ul>
                <li>
                    <b>Реестр сделок</b>
                    <v-img :src="IMAGES[0]" height="160" width="250" class="grey darken-4" @click.stop="openImage(IMAGES[0])"></v-img>
                </li>
                <li>
                    <b>Движение денег</b>
                    <v-img :src="IMAGES[1]" height="160" width="250" class="grey darken-4" @click.stop="openImage(IMAGES[1])"></v-img>
                </li>
                <li>
                    <b>Реестр комиссий за период</b>
                    <v-img :src="IMAGES[2]" height="160" width="250" class="grey darken-4" @click.stop="openImage(IMAGES[2])"></v-img>
                </li>
            </ul>
            </p>
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
