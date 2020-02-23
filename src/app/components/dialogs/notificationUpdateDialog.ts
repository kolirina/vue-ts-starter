import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {UpdateServiceInfo} from "../updateServiceInfo";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap update-service-dialog">
                <v-icon class="closeDialog" @click.native="acceptAndClose">close</v-icon>

                <v-card-title class="pb-0">
                    <span class="dialog-header-text pl-3">Обновления сервиса</span>
                </v-card-title>

                <v-card-text>
                    <update-service-info @openFeedBackDialog="openFeedBackDialog" is-login class="pl-3 py-0"></update-service-info>
                </v-card-text>
                <v-card-actions class="pr-3 pb-3">
                    <v-spacer></v-spacer>
                    <div class="pr-3 pb-3">
                        <v-btn color="primary" @click.native="acceptAndClose" dark>
                            Спасибо. Закрыть
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `,
    components: {UpdateServiceInfo}
})
export class NotificationUpdateDialog extends CustomDialog<void, BtnReturn> {

    static readonly DATE: string = "2020-02-23";

    private acceptAndClose(): void {
        this.close(BtnReturn.YES);
    }

    private openFeedBackDialog(): void {
        this.close(BtnReturn.SHOW_FEEDBACK);
    }
}
