// Copies the heading face and its license from the pinned npm package into
// dist/fonts (spec 11.2: a locally bundled rounded face, no web fonts). Run
// `npm run fonts` after changing the package version, and commit the result.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', '@fontsource-variable', 'nunito');
const target = join(root, 'dist', 'fonts');
mkdirSync(target, { recursive: true });
copyFileSync(join(source, 'files', 'nunito-latin-wght-normal.woff2'), join(target, 'nunito-latin-wght.woff2'));
copyFileSync(join(source, 'LICENSE'), join(target, 'OFL.txt'));
console.log('Copied Nunito (SIL Open Font License 1.1) to dist/fonts');
