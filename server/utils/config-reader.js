import fs from 'fs';
import YAML from 'js-yaml';
import path from 'path';

export const readConfig = () => {
  try {
    return YAML.safeLoad(fs.readFileSync(path.join(process.cwd(), 'env.yaml'), 'utf8'));
  } catch (error) {
    return false;
  }
};

export const getDatabaseConfig = key => {
  try {
    const config = readConfig();
    const databaseConfig = config.database;
    return databaseConfig[key];
  } catch (error) {
    return false;
  }
};
