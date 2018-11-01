import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";

@Service("FeedbackService")
@Singleton
export class FeedbackService {

    /**
     * Отправляет запрос с обратной связью
     * @param request запрос с обратной связью
     * @returns {Promise<void>}
     */
    async sendFeedback(request: FeedbackRequest): Promise<void> {
        await HTTP.INSTANCE.post(`/feedback`, request);
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
