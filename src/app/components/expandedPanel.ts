import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {StockTable} from "./stockTable";

@Component({
  template: `
    <div class="exp-panel">
      <v-menu v-if="withMenu" :attach="'#exp-panel-attach' + name" class="exp-panel-menu">
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
          <template slot="actions">
            <v-icon v-if="!alwaysOpen" class="exp-panel-arrow" :class="{'exp-panel-arrow-margin': withMenu}">arrow_drop_down</v-icon>
            <div class="exp-panel-attach" :id="'exp-panel-attach' + name"></div>
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
  @Prop()
  private name: string;
  @Prop()
  private withMenu: boolean;
  @Prop()
  private alwaysOpen: boolean;
}