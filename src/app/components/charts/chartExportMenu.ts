/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */
import {Component, UI} from "../../app/ui";
import {EventType} from "../../types/eventType";

@Component({
    // language=Vue
    template: `
        <div class="chart-export-menu">
            <div @click="print" class="intel-icon icon-print" title="Напечатать график"></div>
            <v-menu v-model="visible" transition="slide-y-transition" bottom left nudge-bottom="40">
                <div  slot="activator" class="intel-icon icon-export" @click.stop="toggleMenu"></div>
                <v-list dense style="cursor: pointer;">
                    <v-list-tile @click.native="exportTo('JPG')">
                        <v-list-tile-title>
                            Скачать JPG
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click.native="exportTo('PNG')">
                        <v-list-tile-title>
                            Скачать PNG
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click.native="exportTo('SVG')">
                        <v-list-tile-title>
                            Скачать SVG
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click.native="exportTo('PDF')">
                        <v-list-tile-title>
                            Скачать PDF
                        </v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </div>
    `
})
export class ChartExportMenu extends UI {

    visible = false;

    toggleMenu(): void {
        this.visible = !this.visible;
    }

    private print(): void {
        this.$emit(EventType.PRINT);
    }

    private exportTo(type: string): void {
        this.$emit(EventType.EXPORT, type);
    }
}
