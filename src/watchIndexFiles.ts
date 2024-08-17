import chokidar from 'chokidar';

export const watchIndexFiles = (dir: string, callback: () => void) => {
  chokidar
    .watch(`${dir.replace(/\/$/, '')}/**/index.ts`, { ignoreInitial: true })
    .on('all', callback);
};
