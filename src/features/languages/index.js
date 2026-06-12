import { SIDEBAR_LANGUAGES } from './sidebarLanguages.js';
import { LANG_META } from './languageMeta.js';
import { DEFAULT_CODE } from './defaults/index.js';
import { WEB_FILES, DEFAULT_WEB_FILES } from './web/defaultFiles.js';
import { buildWebPreviewDocument } from './web/buildPreview.js';
import { RUNTIME_CAPABILITIES } from './runtimeCapabilities.js';

export { SIDEBAR_LANGUAGES, LANG_META, DEFAULT_CODE, WEB_FILES, DEFAULT_WEB_FILES, buildWebPreviewDocument, RUNTIME_CAPABILITIES };

export const LANGUAGES = SIDEBAR_LANGUAGES.map(({ key, name }) => ({
  key,
  name,
  ...LANG_META[key],
  capabilities: RUNTIME_CAPABILITIES[key],
}));

export const getLanguageMeta = (key) =>
  LANGUAGES.find((l) => l.key === key) || LANGUAGES[0];
