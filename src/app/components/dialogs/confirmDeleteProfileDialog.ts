import {VueRouter} from "vue-router/types/router";
import {Component} from "../../app/ui";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <div>
                    <v-card-title class="dialog-header-text">Удалить аккаунт?</v-card-title>
                    <v-card-text>
                        <div>
                            Вы уверены, что хотите удалить аккаунт?<br/>
                            Личный кабинет Intelinvest будет недоступен.<br/>
                            Вы не сможете войти или зарегистрировать новый аккаунт с той же почтой.
                        </div>
                        <br/>
                        <div>
                            Для очистки портфеля воспользуйтесь разделом <a @click="goToPortfolioManagement">Управление портфелями</a>,
                            меню таблицы - пункт Очистить
                        </div>
                        <br/>
                        <div class="mt-2">Продолжить?</div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click.native="close('YES')">Да</v-btn>
                        <v-btn @click.native="close('NO')">Нет</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class ConfirmDeleteProfileDialog extends CustomDialog<VueRouter, BtnReturn> {

    private async goToPortfolioManagement(): Promise<void> {
        this.close();
        await this.data.push("/settings/portfolio-management");
    }
}