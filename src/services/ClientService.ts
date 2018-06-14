import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {ClientInfo} from "../types/types";
import axios from 'axios';

@Service("ClientService")
@Singleton
export class ClientService {

    private clientInfo: ClientInfo = null;

    async getClientInfo(): Promise<ClientInfo> {
        if (!this.clientInfo) {
            await this.init();
        }
        return this.clientInfo;
    }

    private async init(): Promise<void> {
        this.clientInfo = await this.load();
        console.log("INIT CLIENT SERVICE", this.clientInfo);
    }

    async load(): Promise<ClientInfo> {
        // ------------------------------ POST ------------------------------------------
        const result = await axios.get('http://localhost:8080/api/user/login', {
            username: 'FirstUser',
            password: '12345678'
        });
        return await result.data;
    }
}
