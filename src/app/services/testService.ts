import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";

@Service("TestService")
@Singleton
export class TestService {

    @Inject
    private http: Http;

    public async getSystemProperties(): Promise<{ [key: string]: string }> {
        return {TEST: "TEST"};
    }
}
