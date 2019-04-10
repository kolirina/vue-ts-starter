import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="650px">
            <v-card class="dialog-wrap portfolio-dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="dialog-header-text paddB0">Настроить встраиваемые блоки</v-card-title>
                <v-card-text class="iframe-dialog-content paddT0 paddB0">
                    <div class="dialog-default-text">
                        Вы можете добавить таблицу с ценными бумагами или диаграмму на свой блог или сайт. Для этого выберите нужный
                        блок из списка ниже и получите код. Данный код представляет собой iframe, который достаточно вставить в html вашего сайта.
                    </div>
                    <div class="dialog-default-text">
                        У портфеля должен быть выставлен публичный доступ. После этого посетители смогут увидеть информацию по портфелю.
                    </div>

                    <div class="select-section">
                        <v-select :items="embeddedOptions" :return-object="true" item-text="name" v-model="embeddedOption" :hide-details="true"></v-select>
                    </div>

                    <v-text-field
                        label="Box"
                        single-line
                        box
                        :value="embeddedCode"
                        hide-details
                        readonly
                    ></v-text-field>
                    <div>
                        <v-btn class="btn">
                            Копировать ссылку
                        </v-btn>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" light @click.native="close">OK</v-btn>
                </v-card-actions>
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