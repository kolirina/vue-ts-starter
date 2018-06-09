import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {ClientInfo} from "../types/types";

@Service("ClientService")
@Singleton
export class ClientService {

    private clientInfo: ClientInfo = null;

    getClientInfo(): ClientInfo {
        if (!this.clientInfo) {
            this.init();
        }
        return this.clientInfo;
    }

    init(): void {
        this.clientInfo = {
            token: 'LJSFDGJL(FSDG*FSDJLSDF)SD(FSD',
            client: {
                id: '3',
                username: 'FirstUser',
                email: 'first@intelinvest.ru',
                tariff: 'PRO',
                paidTill: '10.10.2020',
                currentPortfolioId: '28',
                portfolios: [
                    {id: '28', name: 'Портфель открытый', access: 'Публичный', fixFee: '0.1', currency: 'RUR', type: 'BROKERAGE', openDate: '20.10.2017'},
                    {id: '41', name: 'Портфель закрытый', access: 'Закрытый', fixFee: '0.2', currency: 'USD', type: 'IIS', openDate: '20.10.2015'}
                ]
            }
        };
        console.log("INIT CLIENT SERVICE");
    }
}