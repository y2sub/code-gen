
export const maxInt32 = 0x7fffffff;

export function revive(key: string, value: any, context: any) {
    const source = context;
    const dataType = typeof value
    switch (dataType) {
        case "number":
            return `${context.source}`;
        default:
            break;
    }

    return value;
}

export function checkDataType(value: string | number | bigint | any): dataTypes {
    const num = Number(value);
    if (!isNaN(num)) {
        if (`${value}`.includes('.')) {
            return 'double';
        } else {
            return num >= maxInt32 ? 'long' : 'int';
        }
    }
    let date = new Date(value);
    if (!isNaN(date.getTime())) {
        return 'DateTime';
    }

    return 'string'
    // let dt = new Date(`${value}`);

}

export type dataTypes = 'string' | 'DateTime' | 'bool' | 'int' | 'long' | 'double' | 'object' | 'list';

export type ObjectMember = {
    name: string;
    dataType: dataTypes;
    members?: ObjectMember[];
    nullable?: boolean;
    accessModifier: 'public' | 'private';
    indent: number;
};