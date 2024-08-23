import { DataAdapterWrapper } from "./DataAdapterWrapper";
import { TFileWrapper } from "./TFileWrapper";

export class VaultWrapper {
    adapter: DataAdapterWrapper;

    constructor() {
        this.adapter = new DataAdapterWrapper();
    }

    async cachedRead(file: TFileWrapper): Promise<string> {
        return "";
    }
}