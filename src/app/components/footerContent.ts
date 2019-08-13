import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import * as versionConfig from "../../version.json";
import {UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {FeedbackDialog} from "./dialogs/feedbackDialog";

@Component({
    // language=Vue
    template: `
        <v-layout class="wrap-content" wrap align-center justify-space-between>
            <div class="fs14"><i class="far fa-copyright"></i> {{ copyrightInfo }}</div>

            <div>
                <a v-if="clientInfo" href="mailto:web@intelinvest.ru" class="fs14 mr-3 decorationNone">
                    <span>Напишите нам</span> <i class="fas fa-envelope"></i>
                </a>

                <a class="fs14 decorationNone" href="https://telegram.me/intelinvestSupportBot">
                    <span>Telegram</span> <i class="fab fa-telegram"></i>
                </a>
            </div>
        </v-layout>
    `
})
export class FooterContent extends UI {

    @Prop({required: false, default: null})
    private clientInfo: ClientInfo;

    private get copyrightInfo(): string {
        return `Intelligent Investments 2012-${this.actualYear} версия ${versionConfig.version} сборка ${versionConfig.build} от ${versionConfig.date}`;
    }

    private get actualYear(): string {
        return String(new Date().getFullYear());
    }

    private async openFeedBackDialog(): Promise<void> {
        await new FeedbackDialog().show(this.clientInfo);
    }

}