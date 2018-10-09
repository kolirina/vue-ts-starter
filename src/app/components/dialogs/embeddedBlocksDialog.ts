import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "./customDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="650px">
            <v-card>
                <v-card-title class="headline">Настроить встраиваемые блоки</v-card-title>
                <v-card-text>
                    <div>
                        Вы можете добавить таблицу с ценными бумагами или диаграмму на свой блог или сайт. Для этого выберите нужный
                        блок из списка ниже и получите код. Данный код представляет собой iframe, который достаточно вставить в html вашего сайта.
                        После этого ваши посетители смогут увидеть актуальную информацию по портфелю. У портфеля должен быть выставлен публичный доступ.
                    </div>

                    <v-select :items="embeddedOptions" :return-object="true" item-text="name" v-model="embeddedOption" :hide-details="true"></v-select>

                    <v-textarea :readonly="true" :value="embeddedCode" :rows="2" :hide-details="true" style="font-size: 14px"></v-textarea>
                </v-card-text>
            </v-card>
        </v-dialog>
    `
})
export class EmbeddedBlocksDialog extends CustomDialog<string, BtnReturn> {

    private embeddedOptions: EmbeddedOption[] = [
        {name: "Диаграмма по акциям и ETF", value: "stocks-diagram"},
        {name: "Таблица облигаций", value: "bonds-table"},
        {name: "Диаграмма по облигациям", value: "bonds-diagram"},
        {name: "График суммарной стоимости портфеля", value: "portfolio-history-chart"},
        {name: "Таблица со сделками", value: "trades-table"}
    ];

    private embeddedOption = this.embeddedOptions[0];

    private get embeddedCode(): string {
        return `<iframe src="${window.location.protocol}//${window.location.host}/${this.data}/${this.embeddedOption.value}"
style="height: 600px; width: 100%; margin: 10px 0; display: block;" frameborder="0"></iframe>`;
    }
}

type EmbeddedOption = {
    name: string,
    value: string
};