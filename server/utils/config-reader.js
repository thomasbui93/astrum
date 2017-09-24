import fs from 'fs';
import YAML from 'js-yaml';
import path from 'path';

export const getConfig = () => {
  try {
    return YAML.safeLoad(fs.readFileSync(path.join(process.cwd(), 'env.yaml'), 'utf8'));
  } catch (error) {
    return false;
  }
};

export const readConfigPath = (path, delimiter = '.') => {
  let configSource = getConfig();

  if (!configSource) {
    return false;
  }

  if (typeof path === 'string' && typeof delimiter === 'string' && delimiter.length > 0) {
    const pathFragments = path.split('.');
    try {
      pathFragments.forEach(fragment => {
        configSource = configSource[fragment];
      });
      return configSource;
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
};

export const getDatabaseConfig = key => {
  try {
    const config = getConfig();
    const databaseConfig = config.database;
    return databaseConfig[key];
  } catch (error) {
    return false;
  }
};
