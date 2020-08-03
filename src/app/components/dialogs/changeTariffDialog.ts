import Component from "vue-class-component";
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
                <div class="import-general-error-wrapper__element-centering">
                    <v-card-title class="dialog-header-text">Поздравляем!</v-card-title>
                    <v-card-text>
                        <div class="import-default-text">
                            <div>Решили добавить инвестиционный портфель?</div>
                            Мы поддерживаем Ваши стремления, подпишитесь
                            на тарифный план "Профессионал" и получите
                            неограниченные возможности учета Ваших активов
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary">Сменить тариф</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class ChangeTariffDialog extends CustomDialog<string, string> {
}