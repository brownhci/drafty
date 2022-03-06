const fs = require('fs')
const yaml = require('js-yaml');

const yaml_path = '../../backend/sheets.yaml';
const dir = '../../backend/views/partials/sheets/';
const file_ext = '.hbs';

try {
    let urlName = 'csprofessors';
    let fileContents = fs.readFileSync(yaml_path, 'utf8');
    let yaml_data = yaml.safeLoad(fileContents);

    for (const key of Object.keys(yaml_data)) {
        console.log(key,yaml_data[key])
    }

    console.log('urlName = ',urlName)

    if(urlName in yaml_data) {
        console.log('hooray',yaml_data[urlName].name)

    } else {
        console.log('oh noes')
    }

    console.log(yaml_data);
} catch (e) {
    console.log(e);
}

try {
    const path = dir + 'csprofessors' + file_ext;
    if (fs.existsSync(path)) {
        console.log('file exists! ',path)
        return path;
    }
} catch(err) {
    console.error(err);
}