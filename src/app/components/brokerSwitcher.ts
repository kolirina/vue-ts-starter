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

import {Component, Prop, UI} from "../app/ui";
import {DealsImportProvider} from "../services/importService";

@Component({
    // language=Vue
    template: `
        <v-list-tile class="text-xs-center sidebar-list-item">
            <v-list-tile-content :style="innerStyle">
                <v-menu offset-y transition="slide-y-transition" max-height="480px" min-width="260px" left>
                    <template slot="activator">
                        <slot name="activator">
                            <v-btn>
                                <v-icon left>icon-edit-broker</v-icon>
                                Изменить брокера
                            </v-btn>
                        </slot>
                    </template>
                    <v-list class="providers-list" style="height: 450px">
                        <vue-scroll>
                            <v-list-tile v-for="provider in providers" :key="provider.code" @click="onSelectProvider(provider)">
                                <v-layout align-center class="providers-list__item">
                                    <div :class="['providers-list__item-img', provider.code.toLowerCase()]"></div>
                                    <div class="providers-list__item-description">
                                        {{ provider.description }}
                                    </div>
                                </v-layout>
                            </v-list-tile>
                        </vue-scroll>
                    </v-list>
                </v-menu>
            </v-list-tile-content>
        </v-list-tile>
    `
})
export class BrokerSwitcher extends UI {

    @Prop({type: String, default: ""})
    private innerStyle: string;

    /** Провайдеры отчетов */
    private providers = DealsImportProvider.values();

    private async onSelectProvider(provider: DealsImportProvider): Promise<void> {
        this.$emit("selectProvider", provider);
    }
}
