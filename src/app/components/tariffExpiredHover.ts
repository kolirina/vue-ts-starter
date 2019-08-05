import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y z-index="200" max-width="433px">
            <div class="fs12-non-opacity pa-3 bg-white">
                Подключите тарифный план “Профессионал”, чтобы открыть доступ ко всем возможностям сервиса.
                Подробнее узнать про тарифные планы Intelinvest вы можете пройдя по ссылке.
            </div>
        </v-menu>
    `
})
export class TariffExpiredHover extends UI {
    @Prop({required: true})
    private data: any;

    private showMenu: boolean = false;
    private x: number = 0;
    private y: number = 0;

    created(): void {
        this.showMenu = this.data.showMenu || false;
        this.x = this.data.x || 0;
        this.y = this.data.y || 0;
    }

    @Watch("data")
    private changeData(): void {
        console.log(4);
        this.$nextTick(() => {
            console.log(2);
            this.showMenu = this.data.showMenu || false;
            this.x = this.data.x || 0;
            this.y = this.data.y || 0;
        });
    }
}
