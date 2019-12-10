import {Component} from "../../app/ui";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {DeleteProfileReason, DeleteProfileRequest} from "../../services/clientService";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="table-settings composite-dialog">
                <v-icon @click.native="close" class="closeDialog">close</v-icon>
                <v-card-title class="pb-0">
                    <span class="dialog-header-text pl-3">Почему вы решили удалить профиль?</span>
                </v-card-title>
                <v-card-text class="pt-0">
                    <v-layout column class="pl-3">
                        <v-radio-group v-model="deleteProfileReason">
                            <v-radio v-for="answer in DeleteProfileReason.values()" :key="answer.code" :label="answer.description" :value="answer"></v-radio>
                        </v-radio-group>
                        <v-layout v-if="deleteProfileReason">
                            <v-text-field v-model="comment" box counter="255" maxlength="255" label="Комментарий" type="text" class="other-answer-area"></v-text-field>
                        </v-layout>
                    </v-layout>
                </v-card-text>
                <v-layout class="action-btn pt-0">
                    <v-spacer></v-spacer>
                    <v-btn @click.native="reply" color="primary" class="btn" :disabled="!deleteProfileReason">Ответить</v-btn>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class DeleteProfileReasonDialog extends CustomDialog<any, DeleteProfileRequest> {

    private deleteProfileReason: DeleteProfileReason = null;
    private DeleteProfileReason = DeleteProfileReason;
    private comment: string = "";

    private reply(): void {
        const requestData: DeleteProfileRequest = {
            reason: this.deleteProfileReason.code,
            comment: this.comment
        };
        this.close(requestData);
    }
}
