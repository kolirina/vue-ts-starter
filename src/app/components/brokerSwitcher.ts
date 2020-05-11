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

import {Component, UI} from "../app/ui";
import {DealsImportProvider} from "../services/importService";

@Component({
    // language=Vue
    template: `
        <v-list-tile class="text-xs-center sidebar-list-item">
            <v-list-tile-content class="portfolio-content">
                <v-menu offset-y transition="slide-y-transition" class="portfolios-drop portfolios-menu">
                    <v-btn slot="activator" class="pa-0 w100pc">
                        <span>Изменить брокера</span>
                    </v-btn>

                    <v-list class="portfolios-list">
                        <v-list-tile v-for="provider in providers" :key="provider.code" @click="onSelectProvider(provider)">
                            <v-layout align-center class="portfolios-list-icons">
                                <div :class="['item-img-block', provider.code.toLowerCase()]"></div>
                                <div class="item-text">
                                    {{ provider.description }}
                                </div>
                            </v-layout>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-list-tile-content>
        </v-list-tile>
    `
})
export class BrokerSwitcher extends UI {

    /** Провайдеры отчетов */
    private providers = DealsImportProvider.values();

    private async onSelectProvider(provider: DealsImportProvider): Promise<void> {
        this.$emit("selectProvider", provider);
    }
}
