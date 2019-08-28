import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" content-class="video-dialog">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-text class="pa-0">
                    <iframe width="600px" src="https://www.youtube.com/embed/1uPZHC0ABs4" frameborder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                </v-card-text>
            </v-card>
        </v-dialog>
    `
})
export class VideoHintDialog extends CustomDialog<string, void> {
}