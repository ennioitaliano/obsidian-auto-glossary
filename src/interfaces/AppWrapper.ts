import { VaultWrapper } from "./VaultAdapter";

export class AppWrapper {
    vault: VaultWrapper;

    constructor() {
        this.vault = new VaultWrapper();
    }
}