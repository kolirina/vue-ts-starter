import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";

@Component({
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap pa-5">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-layout justify-center class="wrap-registration-form">
                    <v-layout class="maxW275" column>
                        <div class="fs18 bold alignC mb-5">У вас нету доступа к разделу. Что бы получить доступ нужно иметь тариф проффесионал.</div>
                        <div class="alignC mt-3">
                            <v-btn @click="registration" color="primary sign-btn maxW275">Перейти в раздел тарифов</v-btn>
                        </div>
                    </v-layout>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class RegistrationDialog extends CustomDialog<string, void> {
}
