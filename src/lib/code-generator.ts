import type { ObjectMember } from "./json-helper";

export type SupportedLanguages = 'CS' | 'TS' | 'JS'

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

export function generateComplexProperty(property: ObjectMember, language: SupportedLanguages): string {
    switch (language) {
        case 'CS':
            return generateCSharpComplexProperty(property);
        case 'TS':
            return generateTypeScriptComplexProperty(property);
        case 'JS':
            return generateJavaScriptComplexProperty(property);
        default:
            break;
    }
    return 'Selected language is not yet implemented'
}


function generateCSharpComplexProperty(property: ObjectMember) {
    if (!property || !property.members) {
        return '';
    }

    let props = '';
    let childObjects: ObjectMember[] = [];
    for (const member of property.members) {
        let name = formatName(member.name);
        let dataType = member.dataType;
        let dataTypeName: string = dataType;
        switch (dataType) {
            case 'object':
            case 'list':
                let childExists = childObjectExists(member, childObjects);
                if (!childExists.exists) {
                    childObjects.push(member);
                }

                if (dataType === 'object') {
                    dataTypeName = capitalize(childExists.name);
                } else {
                    dataTypeName = `List<${capitalize(childExists.name)}>`;
                    // console.log('x', dataTypeName, childExists)
                }
                break;

            default:
                break;
        }
        let property = `\n\t[JsonPropertyName("${member.name}")]\n\t${member.accessModifier} ${dataTypeName}${member.nullable ? '?' : ''} ${name} { get; set; }\n`;
        props = `${props} ${property}`;


    }

    let childObjectsCode = '';

    for (const child of childObjects) {
        childObjectsCode += "\n" + generateCSharpComplexProperty(child);
    }


    let className = formatName(property.name);
    let code = `${property.accessModifier} class ${className}\n{${props}} \n ${childObjectsCode}`;
    return code;
}



function generateTypeScriptComplexProperty(property: ObjectMember) {
    if (!property || !property.members) {
        return '';
    }

    let props = '';

    let childObjects: ObjectMember[] = [];
    for (const member of property.members) {
        let name = member.name;
        let dataType = member.dataType;
        let dataTypeName: string = '';
        switch (dataType) {
            case 'DateTime':
                dataTypeName = 'Date';
                break;
            case 'bool':
                dataTypeName = 'boolean';
                break;
            case 'int':
            case 'double':
            case 'long':
                dataTypeName = 'number';
                break;
            case 'string':
                dataTypeName = 'string';
                break;
            case 'list':
            case 'object':
                let exists = childObjectExists(member, childObjects);
                if (!exists.exists) {
                    childObjects.push(member);
                }
                // dataTypeName = 'any[]'

                dataTypeName = dataType === 'object' ? capitalize(exists.name) : `${capitalize(exists.name)}[]`
                break;
            default:
                break;
        }

        let property = `\t${name}${member.nullable ? '?' : ''}: ${dataTypeName};\n`;
        props = `${props}${property}`;
    }
    let typeName = formatName(property.name);

    let childClasses = '';
    for (const child of childObjects) {
        let childClassCode = generateTypeScriptComplexProperty(child);
        childClasses = `${childClasses}\n${childClassCode}`
    }
    let code = `export type ${typeName} = {\n${props}} ${childClasses}`;
    return code;
}

function generateJavaScriptComplexProperty(property: ObjectMember) {
    if (!property || !property.members) {
        return '';
    }

    let lines: string[] = [`\n/**`, ` * @typedef {Object} ${capitalize(property.name)}`];
    let childObjects: ObjectMember[] = [];
    for (const member of property.members) {
        let name = member.name;
        let dataType = member.dataType;
        let dataTypeName: string = '';
        switch (dataType) {
            case 'DateTime':
                dataTypeName = 'Date';
                break;
            case 'bool':
                dataTypeName = 'boolean';
                break;
            case 'int':
            case 'double':
            case 'long':
                dataTypeName = 'number';
                break;
            case 'string':
                dataTypeName = 'string';
                break;
            case 'list':
            case 'object':
                let exists = childObjectExists(member, childObjects);
                if (!exists.exists) {
                    childObjects.push(member);
                }
                // dataTypeName = 'any[]'

                dataTypeName = dataType === 'object' ? capitalize(exists.name) : `${capitalize(exists.name)}[]`
                break;
            default:
                break;
        }

        let property = ` * @property {${dataTypeName}} ${member.name}`;
        lines.push(property);
    }
    lines.push(' */\n');

    let childClasses = '';
    for (const child of childObjects) {
        let childClassCode = generateJavaScriptComplexProperty(child);
        childClasses = `${childClasses}\n${childClassCode}`
    }
    let code = lines.join('\n');
    code = ` ${code} ${childClasses}`;
    return code;
}




function childObjectExists(object: ObjectMember, children: ObjectMember[]) {
    for (const child of children) {
        let exists = compareMembers(object, child);
        if (exists) {
            return {
                exists: exists,
                name: child.name
            };
        }
    }
    return {
        exists: false,
        name: object.name
    };

}

function compareMembers(left: ObjectMember, right: ObjectMember): boolean {
    if (!left.members && !right.members) {
        return true;
    }
    if (!left.members || !right.members) {
        return false;
    }

    if (left.members.length !== right.members.length) {
        return false;
    }

    for (let index = 0; index < left.members.length; index++) {
        const leftElement = left.members[index];
        const rightElement = right.members[index];
        if (leftElement.name !== rightElement.name) {
            return false;
        }
    }

    return true;

}
