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

import {Inject} from "typescript-ioc";
import {Component, UI} from "../app/ui";
import {Storage} from "../platform/services/storage";
import {StoreKeys} from "../types/storeKeys";
import {Theme} from "../types/types";
import {ThemeUtils} from "../utils/ThemeUtils";

@Component({
    // language=Vue
    template: `
        <div v-if="invertSupported">
            <v-btn flat icon round @click="toggleTheme" :title="nightTheme ? 'Выключить Ночную тему' : 'Включить Ночную тему'" class="link-icon-btn">
                <v-icon v-if="nightTheme" light>far fa-moon</v-icon>
                <v-icon v-else light>far fa-lightbulb</v-icon>
            </v-btn>
            <span>{{ nightTheme ? 'Темная тема' : 'Светлая тема' }}</span>
        </div>
    `
})
export class ThemeSwitcher extends UI {

    @Inject
    private storage: Storage;

    /** Признак темной темы */
    private nightTheme = false;

    created(): void {
        if (!ThemeUtils.invertSupported()) {
            return;
        }
        this.nightTheme = this.storage.get<string>(StoreKeys.THEME, Theme.DAY) === Theme.NIGHT;
        ThemeUtils.setStyles(this.nightTheme);
    }

    private toggleTheme(): void {
        this.nightTheme = !this.nightTheme;
        this.storage.set(StoreKeys.THEME, this.nightTheme ? Theme.NIGHT : Theme.DAY);
        ThemeUtils.setStyles(this.nightTheme);
    }

    private get invertSupported(): boolean {
        return ThemeUtils.invertSupported();
    }
}
