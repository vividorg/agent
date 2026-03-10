import { Action } from "./types";
import { Logger } from "../utils/Logger";

export abstract class AIEngine {
    protected logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    abstract decide(shortTerm: object, longTerm: string, input?: string, inputSys?: string): Promise<Action>;
}