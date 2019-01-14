import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";

@Service("FeedbackService")
@Singleton
export class FeedbackService {

    @Inject
    private http: Http;

    /**
     * Отправляет запрос с обратной связью
     * @param request запрос с обратной связью
     * @returns {Promise<void>}
     */
    async sendFeedback(request: FeedbackRequest): Promise<void> {
        await this.http.post(`/feedback`, request);
    }
}

/** Запрос на отправку сообщения с обратной связью */
export interface FeedbackRequest {
    /** Имя пользователя */
    username: string;
    /** Email пользователя */
    email: string;
    /** Сообщение */
    message: string;
    /** Тема сообщения */
    feedbackType: FeedbackType;
}

/** Тип вопроса по обратной связи */
export enum FeedbackType {
    ERROR,
    FEATURE_REQUEST,
    OTHER
}

export interface FeedbackReason {
    type: FeedbackType;
    name: string;
}
