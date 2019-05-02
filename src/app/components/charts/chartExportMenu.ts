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
        <v-menu v-model="visible" transition="slide-y-transition" bottom left>
            <v-btn slot="activator" flat icon dark @click.stop="toggleMenu">
                <span class="menuDots"></span>
            </v-btn>
            <v-list dense style="cursor: pointer;">
                <v-list-tile @click.native="print">
                    <v-list-tile-title>
                        Напечатать график
                    </v-list-tile-title>
                </v-list-tile>
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
