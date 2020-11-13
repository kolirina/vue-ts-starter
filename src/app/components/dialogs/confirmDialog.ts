import Component from "vue-class-component";
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
                <div class="dialog__element-centering maxW320">
                    <img src="../img/common/need-confirm.svg" class="dialog-header__img" alt="">
                    <v-card-title class="dialog-header-text">Требуется подтверждение</v-card-title>
                    <v-card-text>
                        <div class="import-default-text">{{ data }}</div>
                        <div class="import-default-text-margin-t import-default-text">Продолжить?</div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click.native="close('YES')" v-enter="closeConfirmed">Да</v-btn>
                        <v-btn @click.native="close('NO')">Нет</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class ConfirmDialog extends CustomDialog<string, BtnReturn> {

    private closeConfirmed(): void {
        this.close(BtnReturn.YES);
    }
}
