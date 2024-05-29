
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
    if (value === null || value === undefined || value === '') {
        return 'string'
    }
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
    typeIndecisive: boolean,
};

// function getAbcs(): string {
//     const rangeEnd = 97 + 25;
//     let abcs = '';
//     for (let index = 97; index < rangeEnd; index++) {
//         const element = String.fromCharCode(index);
//         abcs += element;
//     }
//     abcs += abcs.toUpperCase();
//     return abcs;
// }
const _abcs = 'abcdefghijklmnopqrstuvwxy123456789_';
function getSafeCharacter(char: string) {
    const charLowered = char.toLowerCase();
    for (const abc of _abcs) {
        if (abc === charLowered) {
            return char;
        }
    }
    return '_';
}

export function getRandomVariableName(): string {
    let rand = Math.ceil(Math.random() * 100);
    return `variable_${rand}`;
}

export function getValidVariableName(name: string): string {
    name = name.trim();
    if (!name) {
        return getRandomVariableName();
    }
    let char0 = name[0];
    for (let index = 0; index < 10; index++) {
        if (char0 === `${index}`) {
            name = '_' + name.substring(1, name.length);
            break;
        }
    }
    //getAbcs() is what I used to get this result but creating a constant is obviously more beneficial
    //still it is kept for reference
    name = name.replaceAll(' ', '_')
        .replaceAll('-', '_');

    let safeName = '';
    for (const char of name) {
        let safeChar = getSafeCharacter(char);
        safeName += safeChar;
    }
    return safeName;
}