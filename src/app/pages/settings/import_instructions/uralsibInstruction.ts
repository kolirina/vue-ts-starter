import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            Используйте для загрузки отчеты в формате xls, присылаемые вам на почту.<br>
            Вы также можете запросить отчеты за произвольный период, обратившись<br>
            к вашему персональному менеджеру по email или контактному телефону.<br>

            <div class="import-default-text-margin-t">
                Контактная информация о менеджере указана в отчете.
            </div>

            Полученный файлы используйте для импорта.

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="0" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class UralsibInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/uralsib/1.png"
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
