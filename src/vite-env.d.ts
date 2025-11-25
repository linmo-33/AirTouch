/// <reference types="vite/client" />

interface ImportMetaEnv {
    // 添加环境变量类型定义...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
