module.exports = shipit => {
  require('shipit-deploy')(shipit);
  require('dotenv').config();

  const currentPath = `${process.env.DEPLOY_PATH}/current`;

  shipit.initConfig({
    default: {
      workspace: '/tmp/agon',
      deployTo: process.env.DEPLOY_PATH,
      repositoryUrl: 'https://github.com/cronos2/Agon.git',
      ignores: ['.git'],
      keepReleases: 2,
      key: '~/.ssh/id_rsa',
      shallowClone: true
    },
    production: {
      servers: `vagrant@${process.env.DEPLOY_HOST}`
    }
  });

  shipit.blTkask('run tests', () => {
    return shipit.local('npm run test');
  });

  shipit.task('install packages', ['run tests'], () => {
    return shipit.remote(`cd ${currentPath} && npm install &> /dev/null`);
  });

  // this task copies the .env from your local folder to the current folder
  shipit.task('install environment variables', ['run tests'], () => {
    return shipit.remoteCopy('.env', currentPath);
  });

  shipit.task(
    'start server',
    ['install packages', 'install environment variables'],
    () => { return shipit.remote(`cd ${currentPath} && PORT=80 sudo npm start &`); }
  );

  shipit.on('init', () => {
    shipit.start('run tests');
  });

  shipit.on('deployed', () => {
    shipit.start('start server');
  });
};
