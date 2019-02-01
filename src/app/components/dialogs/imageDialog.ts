import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "./customDialog";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="720px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-text>
                    <v-img :src="data" max-height="700" max-width="700" contain class="grey darken-4"></v-img>
                </v-card-text>
            </v-card>
        </v-dialog>
    `
})
export class ImageDialog extends CustomDialog<string, null> {
}
