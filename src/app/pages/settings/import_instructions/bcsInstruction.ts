import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            Зайти в Личный кабинет, нажать на <b>Отчетность</b> → <b>Отчетность (БКС Россия)</b> если работаем с Московской биржей.<br/>
            В строке с типом отчета можно выбрать ежедневный, ежемесячный и с начала текущего месяца.<br/>
            В ежемесячном типе отчета можно выбрать период по месяцам и годам.<br/>
            С начала текущего месяца отчет нужно запрашивать, нажав на "Запросить".<br>
            Ниже будут представлены отчеты за выбранный период времени.<br/>
            Выбираем нужный, открываем, и он скачивается в формате xls.

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="0" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="1" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[2]" alt="5" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[3]" alt="3" @click.stop="openImageDialog">
                </figure>
            </div>
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

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
