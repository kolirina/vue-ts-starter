declare module "*";

declare interface UseDeskWidget {
    toggle: (toggle: boolean) => void;
    openChat: () => void;
    closeChat: () => void;
    open: (type?: string) => void;
    sendMessage: (message: WidgetMessage) => void;
    userIdentify: (user: WidgetUserInfo) => void;
    identify: (user: WidgetUserInfo) => void;
    openCallback: () => void;
    closeCallback: () => void;
}

declare interface WidgetUserInfo {
    name?: string;
    email?: string;
    phone?: string;
}

declare interface WidgetMessage {
    message?: string;
    topic?: string;
}

interface Window {
    usedeskMessenger: UseDeskWidget;
    __widgetInitCallback: (widget: UseDeskWidget) => void;
}
