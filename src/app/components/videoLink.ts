import Component from "vue-class-component";
import {UI} from "../app/ui";
import {VideoHintDialog} from "./dialogs/videoHintDialog";

@Component({
    // language=Vue
    template: `
        <div @click.stop="openVideo()">
            <slot name="foreword"></slot>
            <slot></slot>
        </div>
    `
})
export class VideoLink extends UI {

    private async openVideo(): Promise<void> {
        await new VideoHintDialog().show();
    }

}
