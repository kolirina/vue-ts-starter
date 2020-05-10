import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            Зайти в Личный кабинет, нажать на "Отчетность", выбрать "Отчетность (БКС<br>Россия)" если работаем с Московской биржей.
            <v-img :src="IMAGES[0]" max-width="980" class="grey darken-4 image"></v-img>
            В строке с типом отчета можно выбрать ежедневный, ежемесячный и с начала текущего месяца.
            <v-img :src="IMAGES[1]" max-width="980" class="grey darken-4 image"></v-img>
            В ежемесячном типе отчета можно выбрать период по месяцам и годам.<br>С начала текущего месяца отчет нужно запрашивать, нажав на "Запросить".<br>
            Ниже будут представлены отчеты за выбранный период времени.
            <v-img :src="IMAGES[2]" max-width="980" class="grey darken-4 image"></v-img>
            Выбираем нужный, открываем, и он скачивается в формате xls.
            <v-img :src="IMAGES[3]" max-width="980" class="grey darken-4 image"></v-img>
        </div>
    `
})
export class BcsInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/bcs/1.png",
        "./img/import_instructions/bcs/2.png",
        "./img/import_instructions/bcs/3.png",
        "./img/import_instructions/bcs/4.png"
    ];

}
