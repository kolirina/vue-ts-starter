import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../../../app/ui";
import {PortfolioParams} from "../../../services/portfolioService";

@Component({
    // language=Vue
    template: `
        <div>
            <div v-if="isFixFeeAboveZero" class="fs13">
                Фиксированная комиссия: {{ portfolioParams.fixFee }}%
            </div>
            <div v-else class="fs13">
                Отчет вашего брокера не содержит информацию о комиссиях. Пожалуйста, укажите процент, который комиссия составляет от суммы сделки
                <ii-number-field label="Фиксированная комиссия" v-model="portfolioParams.fixFee" class="maxW275 w100pc"
                                 hint="Для автоматического рассчета комиссии при внесении сделок." :decimals="5" @input="changePortfolioParams">
                </ii-number-field>
            </div>
            <div>
                <div class="import-default-text">
                    Перейдите в личный кабинет брокера. Перейдите на вкладку просмотра <strong>Единой<br>
                    денежной позиции</strong> далее вкладка <strong>Справка по счету.</strong>
                </div>
                    <v-img :src="IMAGES[0]" height="350" width="980" class="grey darken-4 image"></v-img>
                <div class="import-default-text">
                    Настройте параметры отчета:
                </div>
                <div class="import-format-requirements-ul">
                    <ul>
                        <li>Укажите период</li>
                        <li>Укажите формат отчета <b><i>xml</i></b></li>
                        <li>Нажмите кнопку <b><i>Сформировать</i></b></li>
                    </ul>
                </div>
                <v-img :src="IMAGES[1]" height="384" width="980" class="grey darken-4 image"></v-img>
                <div class="import-default-text">
                    После успешного формирования отчета появится запрос на скачивание отчета.<br>
                    Полученный файл используйте для импорта.
                </div>
            </div>
        </div>
    `
})
export class FinamInstruction extends UI {

    @Prop()
    private isFixFeeAboveZero: boolean;
    @Prop()
    private portfolioParams: PortfolioParams;

    private IMAGES: string[] = [
        "./img/import_instructions/finam/1.png",
        "./img/import_instructions/finam/2.png"
    ];

    private changePortfolioParams(): void {
        this.$emit("changePortfolioParams", this.portfolioParams);
    }

}
