import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="750px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title>
                    <span class="headline">Ошибка импорта</span>
                </v-card-title>
                <v-card-text>
                    <div>
                        <p>
                            <i class="fa fa-warning"></i>
                            <span>Произошла ошибка импорта: {{ data.generalError }}</span>
                        </p>

                        <div>
                            <span>Попробуйте указать </span><a @click="goToBalances">начальные балансы </a><i class="fa fa-balance-scale"/>
                            <span>для быстрого старта</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>Если у Вас нет полной истории ваших сделок. Вы можете добавить дополнительные сделки позже.</span>
                            </v-tooltip>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="close" dark>
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class ImportGeneralErrorDialog extends CustomDialog<ImportGeneralErrorDialogData, void> {

    private goToBalances(): void {
        this.data.router.push("trades");
        this.close();
    }
}

export type ImportGeneralErrorDialogData = {
    generalError: string,
    router: VueRouter
};
