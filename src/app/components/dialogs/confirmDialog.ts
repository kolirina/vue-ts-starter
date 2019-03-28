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

                <v-card-title class="headline">Требуется подтверждение</v-card-title>
                <v-card-text>
                    <div>{{ data }}</div>
                    <span>Продолжить?</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="close('YES')">Да</v-btn>
                    <v-btn @click.native="close('NO')">Нет</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class ConfirmDialog extends CustomDialog<string, BtnReturn> {
}