/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Storage} from "../platform/services/storage";
import {ClientInfo, ClientService} from "../services/clientService";
import {StoreKeys} from "../types/storeKeys";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {Component, UI} from "./ui";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container grid-list-md text-xs-center>
            <v-layout row wrap>
                <v-flex xs12>
                    <v-progress-circular :size="70" :width="7" indeterminate color="indigo"></v-progress-circular>
                </v-flex>
            </v-layout>
        </v-container>`
})
export class AuthComponent extends UI {

    @Inject
    private clientService: ClientService;
    @Inject
    private localStorage: Storage;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.SET_CLIENT_INFO)
    private loadUser: (clientInfo: ClientInfo) => Promise<void>;
    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    async created(): Promise<void> {
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.$router.push("/portfolio");
        } else {
            await this.login();
        }
        const fromRegistration = this.$route.query.fromRegistration;
        if (fromRegistration === "true") {
            this.$snotify.info("Поздравляем с успешной регистрацией! Письмо в паролем отправлено вам на почту.");
        }
    }

    private async login(): Promise<void> {
        const token = this.$route.params.token;
        this.localStorage.set(StoreKeys.TOKEN_KEY, token);
        const client = await this.clientService.getClientInfo();
        await this.loadUser({token: token, refreshToken: this.localStorage.get(StoreKeys.REFRESH_TOKEN, null), user: client});
        await this.setCurrentPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
        this.$router.push("/portfolio");

    }
}
