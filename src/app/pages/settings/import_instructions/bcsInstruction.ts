import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Зайти в Личный кабинет, нажать на "Отчетность", выбрать "Отчетность (БКС<br>Россия)" если работаем с Московской биржей.
                </div>
                <v-img :src="IMAGES[0]" height="287" width="980" class="grey darken-4 image" @click.stop="openImage(IMAGES[0])"></v-img>
                <div class="import-default-text">
                    В строке с типом отчета можно выбрать ежедневный, ежемесячный и с начала текущего месяца.
                </div>
                <v-img :src="IMAGES[1]" height="323" width="980" class="grey darken-4 image" @click.stop="openImage(IMAGES[1])"></v-img>
                <div class="import-default-text">
                    В ежемесячном типе отчета можно выбрать период по месяцам и годам.<br>С начала текущего месяца отчет нужно запрашивать, нажав на "Запросить".<br>
                    Ниже будут представлены отчеты за выбранный период времени.
                </div>
                <v-img :src="IMAGES[2]" height="416" width="980" class="grey darken-4 image" @click.stop="openImage(IMAGES[2])"></v-img>
                <div class="import-default-text">
                    Выбираем нужный, открываем, и он скачивается в формате xls.
                </div>
                <v-img :src="IMAGES[3]" height="98" width="980" class="grey darken-4 image" @click.stop="openImage(IMAGES[3])"></v-img>
            </div>
        </div>
    `
})
export class BcsInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/bcs/1.jpg",
        "./img/import_instructions/bcs/2.jpg",
        "./img/import_instructions/bcs/3.jpg",
        "./img/import_instructions/bcs/4.jpg"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }
}
