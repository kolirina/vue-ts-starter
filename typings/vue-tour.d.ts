export class VueTour {
    [key: string]: VueTourItem;
}

export class VueTourItem {
    isLast: boolean;
    isRunning: boolean;
    numberOfSteps: number;
    currentStep: number;

    nextStep(): void;

    start(): void;

    stop(): void;
}
