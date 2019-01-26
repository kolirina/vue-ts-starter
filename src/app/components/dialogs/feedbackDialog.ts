import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {ClientInfo} from "../../services/clientService";
import {FeedbackService, FeedbackType} from "../../services/feedbackService";
import {CustomDialog} from "./customDialog";

/**
 * Диалог обратной связи
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="550px">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title><b>Обратная связь</b></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn icon dark @click.native="close">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm12>
                                <v-text-field label="От кого" v-model.trim="data.user.username" :readonly="isDemoUser()" append-icon="fas fa-user"></v-text-field>
                            </v-flex>

                            <v-flex xs12 sm12>
                                <v-text-field label="Email" v-model.trim="data.user.email" :readonly="isDemoUser()" append-icon="fas fa-at"></v-text-field>
                            </v-flex>

                            <v-flex xs12 sm12>
                                <v-select :items="feedbackTypes" v-model="feedbackType" item-value="type" item-text="name" label="Тема"></v-select>
                            </v-flex>

                            <v-flex xs12 sm12>
                                <v-textarea label="Сообщение" v-model.trim="message" :counter="5000" :rows="3"></v-textarea>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <span>Для более оперативной связи, пожалуйста, напишите нам в
                        <a href="https://telegram.me/intelinvestSupportBot">Telegram</a>
                        <i class="fab fa-telegram"></i></span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="sendFeedback" dark small>
                        Отправить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class FeedbackDialog extends CustomDialog<ClientInfo, void> {

    @Inject
    private feedbackService: FeedbackService;
    /** Темы сообщения */
    private feedbackTypes = [
        {type: FeedbackType.ERROR, name: "Ошибка в работе"},
        {type: FeedbackType.FEATURE_REQUEST, name: "Предложение о доработке"},
        {type: FeedbackType.OTHER, name: "Другое"}];
    /** Текст сообщения */
    private message = "";
    /** Имя пользователя */
    private username = "";
    /** Эл. почта пользователя */
    private email = "";
    /** Выбранная тема сообщения */
    private feedbackType = this.feedbackTypes[1].type;

    /**
     * Инициализация данных диалога
     * @inheritDoc
     */
    mounted(): void {
        this.username = this.data.user.username;
        this.email = this.data.user.email;
    }

    /**
     * Валидирует данные и отправляет запрос с сообщением
     */
    private async sendFeedback(): Promise<void> {
        if (this.username.length === 0 || this.email.length === 0 || this.message.length === 0) {
            this.$snotify.warning("Пожалуйста заполните все поля для отправки");
            return;
        }
        await this.feedbackService.sendFeedback({username: this.username, email: this.email, feedbackType: this.feedbackType, message: this.message});
        this.$snotify.info("Письмо успешно отправлено. Мы ответим вам в течение 24 часов");
        this.close();
    }

    /**
     * Возвращает признак что залогинен демо-пользователь
     */
    private isDemoUser(): boolean {
        return this.username !== "demo_user";
    }
}
