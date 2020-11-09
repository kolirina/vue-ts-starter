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

import {VueRouter} from "vue-router/types/router";
import {Component} from "../../app/ui";
import {CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог перехода на смену тарифа
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" content-class="change-tariff-dialog">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <div class="dialog__element-centering maxW370">
                    <img src="/img/common/well-done.svg" class="dialog-header__img" alt="">
                    <v-card-title class="dialog-header-text">Полный порядок!</v-card-title>
                    <v-card-text>
                        <div class="import-default-text">
                            <div>Решили добавить категорию тегов?</div>
                            Мы поддерживаем Ваши стремления, подпишитесь
                            на тарифный план "Профессионал" и получите
                            неограниченные возможности использования инструментов Intelinvest
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click="goToTariffs">Сменить тариф</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class TagCategoryForbiddenDialog extends CustomDialog<VueRouter, string> {

    private goToTariffs(): void {
        if (this.data.currentRoute.name !== "tariffs") {
            this.data.push({name: "tariffs"});
            this.close();
        }
    }
}
