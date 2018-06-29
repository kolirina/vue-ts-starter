import {UI} from "../../app/UI";

export class CustomDialog<ParamType, ReturnType> extends UI {

    private static instances: any[] = [];

    /** Модель данных для диалога */
    protected data: ParamType = null;

    /** Возвращаемое значение по умолчанию */
    protected responseByDefault: ReturnType = null;

    protected showed = false;

    async show(data?: ParamType): Promise<ReturnType> {
        if (data) {
            this.data = data;
        }
        const workspace = document.body;
        const dialog = this.$mount(workspace.appendChild(document.createElement("div"))).$el;
        this.showed = true;
        console.log('DATA', data);
        return new Promise<ReturnType>((resolve, reject) => {
            let dialogResult: ReturnType = this.responseByDefault;
            // // регистрируем обработчик события на закрытие диалога
            this.$on("close", (result: ReturnType | MouseEvent) => {
                if (!(result instanceof MouseEvent)) {
                    dialogResult = result as ReturnType;
                }
                CustomDialog.instances.pop();
                this.unbindListeners();
                // при закрытии диалога возвращаем результат
                resolve(dialogResult);
            });

            this.bindListeners();
            CustomDialog.instances.push(this);
        }).then((buttonData) => {
            this.showed = false;
            this.$destroy();
            workspace.removeChild(dialog);
            return buttonData;
        });
    }

    /**
     * Закрывает окно диалога
     * @param result возвращаемое значение
     */
    protected close(result?: ReturnType | MouseEvent): void {
        this.$emit("close", result);
    }

    private bindListeners(): void {
        if (CustomDialog.instances.length === 0) {
            document.body.addEventListener("keyup", this.onEscapeListener);
        }
    }

    private unbindListeners(): void {
        if (CustomDialog.instances.length === 0) {
            document.body.removeEventListener("keyup", this.onEscapeListener);
        }
    }

    private onEscapeListener(event: any): void {
        if (event.keyCode === 27 && this.isClosable()) {
            CustomDialog.instances[CustomDialog.instances.length - 1].close();
            event.stopImmediatePropagation();
        }
    }

    /**
     * Возвращает признак возможности закрытия формы диалога крестиком, кликом по оверлею или клавишей Escape
     * @return {boolean}
     */
    private isClosable(): boolean {
        // Любой диалог должен иметь форму, причем не важно какую DialogForm или SimpleDialogForm. Если это не так, считаем, что диалог закрываемый
        if (!this.$children.length) {
            return true;
        }
        // Первым в списке всегда идет компонент формы, причем не важно какой - DialogForm или SimpleDialogForm
        const dialogFormProps: any = this.$children[0].$options.propsData;
        if (!dialogFormProps) {
            return true;
        }
        // Аттрибут closable должен быть установлен явно в false. Если это не так, считаем что диалог закрываемый
        return dialogFormProps.closable !== false;
    }
}

export enum BtnReturn {
    YES = "YES", NO = "NO", CANCEL = "CANCEL"
}