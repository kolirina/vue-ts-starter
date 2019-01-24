import Component from "vue-class-component";
import {UI} from "../app/ui";
import {Prop} from "vue-property-decorator";
import {StockTable} from "../components/stockTable";

@Component({
  template: `
    <div class="exp-panel">
      <v-expansion-panel focusable expand :value="value">
        <v-expansion-panel-content :lazy="true" v-state="state">
          <template slot="actions">
            <v-icon class="exp-panel-arrow">arrow_drop_down</v-icon>
          </template>
          <div slot="header">
            <slot name="header"></slot>
          </div>
          <slot></slot>
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
  @Prop()
  private header: string;
  @Prop()
  private rows: [];
}