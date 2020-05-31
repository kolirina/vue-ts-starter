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
        <div class="theme-switcher">
            <v-btn flat @click="setTheme(Theme.NIGHT)" title="Темная тема" :class="{'btn theme-switcher__dark': true, 'active': theme === Theme.NIGHT}">
                <span>Темная тема</span>
            </v-btn>
            <v-btn flat @click="setTheme(Theme.DAY)" title="Светлая тема" :class="{'btn theme-switcher__light': true, 'active': theme === Theme.DAY}">
                <span>Светлая тема</span>
            </v-btn>
        </div>
    `
})
export class ThemeSwitcher extends UI {

    @Inject
    private storage: Storage;
    /** Признак темной темы */
    private theme = Theme.DAY;
    /** Тема */
    private Theme = Theme;

    created(): void {
        this.theme = this.storage.get<Theme>(StoreKeys.THEME, ThemeUtils.detectPrefersColorScheme());
        ThemeUtils.setStyles(this.theme === Theme.NIGHT);
    }

    private setTheme(theme: Theme): void {
        this.theme = theme;
        this.storage.set(StoreKeys.THEME, theme);
        ThemeUtils.setStyles(this.theme === Theme.NIGHT);
    }
}
