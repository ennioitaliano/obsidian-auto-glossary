
export interface DataAdapterWrapper {
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
}