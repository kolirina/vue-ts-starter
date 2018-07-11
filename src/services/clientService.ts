import {Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {ClientInfo, LoginRequest} from '../types/types';
import axios from 'axios';
import {HTTP} from '../platform/services/http';

@Service('ClientService')
@Singleton
export class ClientService {

    clientInfo: ClientInfo = null;

    async getClientInfo(request: LoginRequest): Promise<ClientInfo> {
        if (!this.clientInfo) {
            // ------------------------------ POST ------------------------------------------
            const result = await axios.post('/api/user/login', request);
            this.clientInfo = await <ClientInfo>result.data;
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
