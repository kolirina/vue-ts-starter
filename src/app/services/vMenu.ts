import {Inject, Singleton} from "typescript-ioc";
import {Container} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Storage} from "../platform/services/storage";

@Service("VMenu")
@Singleton
export class VMenu {

    offsetX: string = "";
    offsetY: string = "";

    @Inject
    private localStorage: Storage;

    setVMenuOffsetX(value: string): void {
        this.offsetX = value;
    }

    setVMenuOffsetY(value: string): void {
        this.offsetY = value;
    }

}
