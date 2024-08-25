import { DataAdapterWrapper } from "interfaces/DataAdapterWrapper";

export class DataAdapterMock implements DataAdapterWrapper
{
    /**
     * Designed to be overwritten by Sinon mocks
     */
    async exists(normalizedPath: string, sensitive?: boolean): Promise<boolean> {
        throw Error("Not implemented");        
    }
}