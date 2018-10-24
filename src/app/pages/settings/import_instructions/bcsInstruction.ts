import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Зайти в Личный кабинет, нажать на "Отчетность", выбрать "Отчетность (БКС Россия)" если работаем с Московской биржей.
                <v-img :src="IMAGES[0]" height="120" width="300" class="grey darken-4" @click="openImage(IMAGES[0])"></v-img>
                В строке с типом отчета можно выбрать ежедневный, ежемесячный и с начала текущего месяца.
                <v-img :src="IMAGES[1]" height="160" width="320" class="grey darken-4" @click="openImage(IMAGES[1])"></v-img>
                В ежемесячном типе отчета можно выбрать период по месяцам и годам. С начала текущего месяца отчет нужно запрашивать, нажав на "Запросить".
                Ниже будут представлены отчеты за выбранный период времени.
                <v-img :src="IMAGES[2]" height="160" width="320" class="grey darken-4" @click="openImage(IMAGES[2])"></v-img>
                Выбираем нужный, открываем, и он скачивается в формате xls.
                <v-img :src="IMAGES[3]" height="160" width="320" class="grey darken-4" @click="openImage(IMAGES[3])"></v-img>
            </p>
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
