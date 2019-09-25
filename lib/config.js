/*
 * Create and export configuration variables
 *
 *
 */

//container for all var env

const environments = {};

// Staging (default) environments

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret'
};
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAlsoASecret'
};

//Determine which env has to be exported out - check arg command line
const currentEnv =
  typeof process.env.NODE_ENV == 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';

// Check the current environnment is one of the environment above, if not default to string
const environmentToExport =
  typeof environments[currentEnv] == 'object'
    ? environments[currentEnv]
    : environments.staging;

module.exports = environmentToExport;
