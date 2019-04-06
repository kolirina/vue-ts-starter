import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" persistent>
            <v-card class="dialog-wrap import-dialog-wrapper import-general-error-wrapper">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <div class="import-general-error-wrapper__element-centering">
                    <v-card-title>
                        <span class="import-dialog-wrapper__title-text">Ошибка импорта</span>
                    </v-card-title>
                    <v-card-text>
                        <div>
                            <p class="import-dialog-wrapper__description-text import-default-text">
                                Произошла ошибка импорта: {{ data.generalError }}
                            </p>

                            <div class="import-dialog-wrapper__description-text import-default-text">
                                Попробуйте указать балансы для быстрого старта
                            </div>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click="goToPortfolio" dark>
                            Перейти к портфелю
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class ImportGeneralErrorDialog extends CustomDialog<ImportGeneralErrorDialogData, void> {

    private goToPortfolio(): void {
        this.data.router.push("portfolio");
        this.close();
    }
}

export type ImportGeneralErrorDialogData = {
    generalError: string,
    router: VueRouter
};
