import axios from 'axios';
import {Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {HTTP} from '../platform/services/http';
import {ClientInfo, LoginRequest} from '../types/types';

@Service('ClientService')
@Singleton
export class ClientService {

    clientInfo: ClientInfo = null;

    async getClientInfo(request: LoginRequest): Promise<ClientInfo> {
        if (!this.clientInfo) {
            // ------------------------------ POST ------------------------------------------
            const result = await axios.post('/api/user/login', request);
            this.clientInfo = await result.data as ClientInfo;
            console.log('INIT CLIENT SERVICE', this.clientInfo);
        }
        return this.clientInfo;
    }

    /**
     * Отправляет запрос на смену типа вознаграждения промо-кода
     * @param {string} type
     * @returns {Promise<void>}
     */
    async changeReferralAwardType(type: string): Promise<void> {
        await HTTP.INSTANCE.post(`/user/promo-code`, type);
    }
}
