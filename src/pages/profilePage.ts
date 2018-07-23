import Component from 'vue-class-component';
import {namespace} from 'vuex-class/lib/bindings';
import {UI} from '../app/UI';
import {ChangePasswordDialog} from '../components/dialogs/changePasswordDialog';
import {ClientInfo} from '../types/types';
import {StoreType} from '../vuex/storeType';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            Профиль
            <v-card>
                <v-card-text>
                    <v-btn dark color="primary" @click.native="changePassword">
                        Сменить пароль
                    </v-btn>
                    <div style="height: 50px"></div>
                    <v-btn dark color="primary">
                        Сменить email
                    </v-btn>
                    <div style="height: 50px"></div>
                    <v-btn dark color="primary">
                        Сменить имя пользователя
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class ProfilePage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private async mounted(): Promise<void> {

    }

    private async changePassword(): Promise<void> {
        const result = await new ChangePasswordDialog().show();
        console.log(result);
    }
}
