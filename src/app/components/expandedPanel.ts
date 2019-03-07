import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="exp-panel" @click="$emit('click')">
            <v-menu v-if="withMenu" :attach="'#exp-panel-attach' + name" class="exp-panel-menu" @click.stop>
                <v-btn slot="activator" icon>
                    <v-icon>more_horiz</v-icon>
                </v-btn>

                <v-list>
                    <v-list-tile class="exp-panel-list-tile">
                        <slot name="list"></slot>
                    </v-list-tile>
                </v-list>
            </v-menu>

            <v-expansion-panel :readonly="alwaysOpen" focusable expand :value="value">
                <v-expansion-panel-content :lazy="true" v-state="state">
                    <template #actions>
                        <i v-if="!alwaysOpen" class="exp-panel-arrow"></i>
                        <div class="exp-panel-attach" :id="'exp-panel-attach' + name"></div>
                    </template>
                    <div slot="header">
                        <slot name="header"></slot>
                    </div>

                    <v-card style="overflow: auto;" @click.stop>
                        <slot></slot>
                    </v-card>

                    <slot name="underCard"></slot>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </div>
    `
})
export class ExpandedPanel extends UI {

    @Prop()
    private value: [];
    @Prop()
    private state: string;
    @Prop()
    private name: string;
    @Prop()
    private withMenu: boolean;
    @Prop()
    private alwaysOpen: boolean;
}
