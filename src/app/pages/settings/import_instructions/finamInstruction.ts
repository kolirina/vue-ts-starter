import {Component, Prop, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";
import {PortfolioParams} from "../../../services/portfolioService";

@Component({
    // language=Vue
    template: `
        <div>
            <div v-if="showFixedCommissionInput" class="fs13">
                <div class="mb-2">
                    Отчеты вашего брокера не содержат информацию о комиссиях.
                </div>
                <div class="mb-2">
                    Пожалуйста, укажите процент, который составляет комиссия от суммы сделки.
                </div>
                <div class="mb-2">
                    И мы автоматически рассчитаем комиссию по каждой сделке.
                </div>
                <ii-number-field label="Фиксированная комиссия" v-model="portfolioParams.fixFee" class="maxW275 w100pc"
                                 hint="Для автоматического рассчета комиссии при импорте сделок." :decimals="5" @input="changePortfolioParams">
                </ii-number-field>
            </div>
            <div class="margT50">
                Для получения отчета по сделкам перейдите в личный кабинет брокера. Перейдите на вкладку просмотра <strong>Единой<br>
                денежной позиции</strong> далее вкладка <strong>Справка по счету.</strong>

                Настройте параметры отчета:
                <ul>
                    <li>Укажите период</li>
                    <li>Укажите формат отчета <b><i>xml</i></b></li>
                    <li>Нажмите кнопку <b><i>Сформировать</i></b></li>
                </ul>
                После успешного формирования отчета появится запрос на скачивание отчета.<br>
                Полученный файл используйте для импорта.
            </div>

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="0" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="1" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class FinamInstruction extends UI {

    @Prop({required: true})
    private portfolioParams: PortfolioParams;

    private showFixedCommissionInput: boolean = false;

    private IMAGES: string[] = [
        "./img/import_instructions/finam/1.png",
        "./img/import_instructions/finam/2.png"
    ];

    created(): void {
        this.showFixedCommissionInput = Number(this.portfolioParams.fixFee) === 0;
    }

    private changePortfolioParams(): void {
        this.$emit("changePortfolioParams", this.portfolioParams);
    }

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
