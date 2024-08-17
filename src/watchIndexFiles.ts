import chokidar from 'chokidar';

export const watchIndexFiles = (dir: string, callback: () => void) => {
  chokidar
    .watch(dir, { ignoreInitial: true, ignored: /^(?!.*\/index\.ts$).*$/ })
    .on('all', callback);
};
