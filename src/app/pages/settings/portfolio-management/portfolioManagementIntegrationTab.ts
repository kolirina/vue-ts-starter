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
import {PortfolioParams, PortfolioService} from "../../../services/portfolioService";

@Component({
    // language=Vue
    template: `
        <div class="portfolio-management-tab__wrapper">
            <div class="portfolio-management-tab__title">Встраиваемые блоки</div>
            <div class="portfolio-management-tab__informer">
                <a class="portfolio-link fs14" :href="informerH" target="_blank">Информер-картинка горизонтальный</a>
                <a class="portfolio-link fs14" :href="informerV" target="_blank">Информер-картинка вертикальный</a>
            </div>
            <p>
                Вы можете добавить таблицу с ценными бумагами или диаграмму на свой блог или сайт. Для этого выберите нужный
                блок из списка ниже и получите код. Данный код представляет собой iframe, который достаточно вставить в html вашего сайта.
            </p>
            <p>У портфеля должен быть выставлен публичный доступ. После этого посетители смогут увидеть информацию по портфелю.</p>
            <div class="select-section embedded-dialog-select">
                <v-select :items="embeddedOptions" :return-object="true" item-text="name" v-model="embeddedOption" :hide-details="true"></v-select>
            </div>
            <div class="portfolio-management-tab__flex-row">
                <v-text-field :value="embeddedCode" hide-details readonly></v-text-field>
                <div class="portfolio-management-tab__wrap-row">
                    <v-btn class="btn" v-clipboard="() => embeddedCode" @click="copyLink">Копировать ссылку</v-btn>
                </div>
            </div>
        </div>
    `,
    components: {BrokerSwitcher}
})
export class PortfolioManagementIntegrationTab extends UI {
    @Inject
    private portfolioService: PortfolioService;
    /** Портфель */
    @Prop()
    private portfolio: PortfolioParams;

    private embeddedOptions: Array<{ name: string, value: string }> = [
        {name: "Таблица Акции", value: "stocks-table"},
        {name: "Таблица Облигации", value: "bonds-table"},
        {name: "Таблица ПИФы/ETF", value: "stocks-table"},
        {name: "Таблица Прочие активы", value: "assets-table"},
        {name: "Таблица Сделки", value: "trades-table"},
        {name: "Диаграмма Акции", value: "stocks-diagram"},
        {name: "Диаграмма Облигации", value: "bonds-diagram"},
        {name: "Диаграмма ПИФы/ETF", value: "etf-diagram"},
        {name: "Диаграмма Прочие активы", value: "asset-diagram"},
        {name: "Диаграмма состав портфеля", value: "aggregate-diagram"},
        {name: "Диаграмма Сектора", value: "sectors-diagram"},
        {name: "Диаграмма Типы облигаций", value: "bond-sectors-diagram"},
        {name: "График стоимости портфеля", value: "portfolio-history-chart"},
        {name: "График прибыли портфеля", value: "portfolio-profit-chart"}
    ];

    private embeddedOption = this.embeddedOptions[0];

    private get embeddedCode(): string {
        return `<iframe src="${window.location.protocol}//${window.location.host}/public-portfolio/${this.portfolio.id}/${this.embeddedOption.value}"` +
            `style="height: 600px; width: 100%; margin: 10px 0; display: block;" frameborder="0"></iframe>`;
    }

    private get informerV(): string {
        return `${window.location.protocol}//${window.location.host}/informer/v/${this.portfolio.id}.png`;
    }

    private get informerH(): string {
        return `${window.location.protocol}//${window.location.host}/informer/h/${this.portfolio.id}.png`;
    }

    private copyLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }
}
