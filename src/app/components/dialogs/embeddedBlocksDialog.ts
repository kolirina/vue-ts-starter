import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {PortfolioService} from "../../services/portfolioService";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap portfolio-dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="dialog-header-text paddB0">
                    <div class="mb-4">
                        Настроить встраиваемые блоки
                    </div>
                </v-card-title>
                <v-card-text class="iframe-dialog-content paddT0 paddB0">
                    <div class="dialog-default-text">
                        Вы можете добавить таблицу с ценными бумагами или диаграмму на свой блог или сайт. Для этого выберите нужный
                        блок из списка ниже и получите код. Данный код представляет собой iframe, который достаточно вставить в html вашего сайта.
                    </div>
                    <br>
                    <div class="dialog-default-text">
                        У портфеля должен быть выставлен публичный доступ. После этого посетители смогут увидеть информацию по портфелю.
                    </div>

                    <div class="select-section embedded-dialog-select">
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
                    <div class="embedded-copy-btn-section">
                        <v-btn class="btn" v-clipboard="() => embeddedCode" @click="copyLink">
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

    @Inject
    private portfolioService: PortfolioService;

    private embeddedOptions: EmbeddedOption[] = [
        {name: "Диаграмма по акциям и ETF", value: "stocks-diagram"},
        {name: "Таблица облигаций", value: "bonds-table"},
        {name: "Диаграмма по облигациям", value: "bonds-diagram"},
        {name: "График суммарной стоимости портфеля", value: "portfolio-history-chart"},
        {name: "Таблица со сделками", value: "trades-table"}
    ];

    private embeddedOption = this.embeddedOptions[0];

    private get embeddedCode(): string {
        return `<iframe src="${window.location.protocol}//${window.location.host}/public-portfolio/${this.data}/${this.embeddedOption.value}"` +
        `style="height: 600px; width: 100%; margin: 10px 0; display: block;" frameborder="0"></iframe>`;
    }

    private copyLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }
}

type EmbeddedOption = {
    name: string,
    value: string
};
