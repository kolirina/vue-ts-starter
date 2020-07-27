/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import {Inject} from "typescript-ioc";
import {Component, Prop, UI} from "../../../app/ui";
import {BrokerSwitcher} from "../../../components/brokerSwitcher";
import {EmbeddedOption} from "../../../components/dialogs/embeddedBlocksDialog";

import {PortfolioParams, PortfolioService} from "../../../services/portfolioService";

@Component({
    // language=Vue
    template: `
        <div class="portfolio-management-tab__wrapper">
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
        </div>
    `,
    components: {BrokerSwitcher}
})
export class PortfolioManagementIntegrationTab extends UI {
    @Inject
    private portfolioService: PortfolioService;
    /** Портфель */
    @Prop()
    portfolio: PortfolioParams;

    private embeddedOptions: EmbeddedOption[] = [
        {name: "Диаграмма по акциям и ETF", value: "stocks-diagram"},
        {name: "Таблица облигаций", value: "bonds-table"},
        {name: "Диаграмма по облигациям", value: "bonds-diagram"},
        {name: "График суммарной стоимости портфеля", value: "portfolio-history-chart"},
        {name: "Таблица со сделками", value: "trades-table"}
    ];

    private embeddedOption = this.embeddedOptions[0];

    private get embeddedCode(): string {
        return `<iframe src="${window.location.protocol}//${window.location.host}/public-portfolio/${this.portfolio}/${this.embeddedOption.value}"` +
            `style="height: 600px; width: 100%; margin: 10px 0; display: block;" frameborder="0"></iframe>`;
    }

    private copyLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }
}