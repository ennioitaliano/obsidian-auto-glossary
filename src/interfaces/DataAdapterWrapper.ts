
export class DataAdapterWrapper {
    async exists(normalizedPath: string, sensitive?: boolean): Promise<boolean> {
        return true;
    }
}