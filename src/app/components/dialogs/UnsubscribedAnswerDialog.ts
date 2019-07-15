import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {CancelOrderRequest, UnLinkCardAnswer} from "../../services/tariffService";

@Component({
  // language=Vue
  template: `
    <v-dialog v-model="showed" max-width="600px">
        <v-card class="table-settings composite-dialog">
            <v-icon @click.native="close" class="closeDialog">close</v-icon>
            <v-card-title class="pb-0">
                <span class="dialog-header-text pl-3">Почему вы отписались?</span>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-layout column class="pl-3">
                    <v-radio-group v-model="unsubscribedAnswer">
                        <v-radio
                            v-for="answer in unLinkCardAnswer.values()"
                            :key="answer.code"
                            :label="answer.description"
                            :value="answer"
                        ></v-radio>
                    </v-radio-group>
                    <v-layout v-if="unsubscribedAnswer">
                        <v-text-field
                            v-model="comment"
                            box
                            counter="255"
                            label="Описание причины"
                            type="text"
                            class="other-answer-area"
                        ></v-text-field>
                    </v-layout>
                </v-layout>
            </v-card-text>
            <v-layout class="action-btn pt-0">
                <v-spacer></v-spacer>
                <v-btn @click.native="reply" color="primary" class="btn" :disabled="!unsubscribedAnswer">Ответить</v-btn>
            </v-layout>
        </v-card>
    </v-dialog>
  `
})
export class UnsubscribedAnswerDialog extends CustomDialog<any, CancelOrderRequest> {
    private unsubscribedAnswer: UnLinkCardAnswer = null;
    private unLinkCardAnswer = UnLinkCardAnswer;
    private comment: string = "";

    private reply(): void {
        const requestData: CancelOrderRequest = {
            answer: this.unsubscribedAnswer.code,
            comment: this.comment
        };
        this.close(requestData);
    }
}