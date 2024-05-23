import type { ObjectMember } from "./json-helper";

export function capitalize(str: string) {
    if (!str) return '';
    return `${str[0].toUpperCase()}${str.substring(1, str.length)}`;
}

export function formatName(name: string): string {
    name = capitalize(name);
    if (name.includes('_')) {
        const nameSplit = name.split('_');
        name = '';
        for (const nameSection of nameSplit) {
            name = name + capitalize(nameSection);
        }
    }
    return name;
}

export function generateComplexProperty(property: ObjectMember) {
    if (!property || !property.members) {
        return '';
    }

    let props = '';
    let childClasses = '';
    for (const member of property.members) {
        let name = formatName(member.name);
        let dataType = member.dataType;
        let dataTypeName: string = dataType;
        if (dataType === 'object') {
            dataTypeName = name;
            childClasses = childClasses + '\n' + generateComplexProperty(member);
        } else {
        }
        let property = `\n[JsonPropertyName("${member.name}")]\n${member.accessModifier} ${dataTypeName}${member.nullable ? '?' : ''} ${name} {get; set;}\n`;
        props = `${props} ${property}`;
    }
    let className = formatName(property.name);
    let code = `${property.accessModifier} class ${className}\n{${props}} \n ${childClasses}`;
    return code;
}

