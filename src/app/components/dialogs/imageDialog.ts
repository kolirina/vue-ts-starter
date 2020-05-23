import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="820px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-text>
                    <v-img :src="data" max-height="800" max-width="800" contain class="grey darken-4"></v-img>
                </v-card-text>
            </v-card>
        </v-dialog>
    `
})
export class ImageDialog extends CustomDialog<string, null> {
}
