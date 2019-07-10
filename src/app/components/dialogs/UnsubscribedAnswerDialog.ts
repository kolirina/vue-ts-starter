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
                    <v-layout v-if="unsubscribedAnswer === unLinkCardAnswer.OTHER">
                        <v-text-field
                            v-model="otherAnswer"
                            box
                            :rules="rulesTextArea"
                            counter="500"
                            label="Описание причины"
                            type="text"
                            class="other-answer-area"
                        ></v-text-field>
                    </v-layout>
                </v-layout>
            </v-card-text>
            <v-layout class="action-btn pt-0">
                <v-spacer></v-spacer>
                <v-btn @click.native="reply" color="primary" class="btn">Ответить</v-btn>
            </v-layout>
        </v-card>
    </v-dialog>
  `
})
export class UnsubscribedAnswerDialog extends CustomDialog<any, CancelOrderRequest> {
    private unsubscribedAnswer: UnLinkCardAnswer = UnLinkCardAnswer.REDUCE_INVEST_ACTIVITY;
    private unLinkCardAnswer = UnLinkCardAnswer;
    private otherAnswer: string = "";
    private rulesTextArea = [(v: string): boolean | string => (v || "").length >= 1 || "Заполните причину отписки"];

    private reply(): void {
        const requestData: CancelOrderRequest = {
            answer: this.unsubscribedAnswer.code,
            comment: this.otherAnswer
        };
        this.close(requestData);
    }
}