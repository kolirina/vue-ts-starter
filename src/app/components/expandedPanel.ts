import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {StockTable} from "./stockTable";

@Component({
    // language=Vue
    template: `
        <div class="exp-panel">
            <v-expansion-panel focusable expand :value="value">
                <v-expansion-panel-content :class="contentPanelClass" :lazy="true" v-state="state">
                    <template slot="actions">
                        <v-icon class="exp-panel-arrow">arrow_drop_down</v-icon>
                    </template>
                    <div slot="header">
                        <slot name="header"></slot>
                    </div>

                    <v-card style="overflow: auto;">
                        <slot></slot>
                    </v-card>

                    <template name="underCard"></template>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </div>
    `,
    components: {StockTable}
})
export class ExpandedPanel extends UI {
    @Prop()
    private value: [];
    @Prop()
    private state: string;
    @Prop({default: "", type: String, required: false})
    private contentPanelClass: string;
}