export interface INewServiceDto {
    id?: string;
    name: string;
    description?: string;
    operation?: 'update';
    isAdditional: string;
}