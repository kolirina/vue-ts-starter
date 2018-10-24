import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {CustomDialog} from "./customDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="750px">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>Ошибка импорта</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn icon dark @click.native="close">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <div>
                        <p>
                            <i class="fa fa-warning"></i>
                            <span>Произошла ошибка импорта: {{ data.generalError }}</span>
                        </p>

                        <div>
                            <span>Попробуйте указать </span><a @click="goToBalances">начальные балансы </a><i class="fa fa-balance-scale"/>
                            <span>для быстрого старта</span>
                            <v-tooltip bottom>
                                <i slot="activator" class="fa fa-question-circle"/>
                                <span>Если у Вас нет полной истории ваших сделок. Вы можете добавить дополнительные сделки позже.</span>
                            </v-tooltip>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="close" dark small>
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