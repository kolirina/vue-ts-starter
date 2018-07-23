import axios from 'axios';
import {Container, Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {Storage} from '../platform/services/storage';
import {TradeDataRequest} from '../types/types';

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

@Service('TradeService')
@Singleton
export class TradeService {

    async saveTrade(req: TradeDataRequest): Promise<void> {
        const result = await axios.post('localhost:8080/api/trades', req);
    }
}