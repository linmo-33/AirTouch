const { withAppBuildGradle } = require('expo/config-plugins');

const withArm64 = (config) => {
    return withAppBuildGradle(config, (config) => {
        const buildGradle = config.modResults.contents;

        // 目标代码
        const ndkConfig = `
        ndk {
            abiFilters "arm64-v8a"
        }`;

        // 🔍 改进的正则：
        // 1. \s* 允许 'defaultConfig' 和 '{' 之间有任意空格或换行
        // 2. /m 开启多行模式（虽然对这个简单正则影响不大，但更保险）
        const pattern = /defaultConfig\s*\{/m;

        // 防止重复注入
        if (buildGradle.includes('abiFilters "arm64-v8a"')) {
            console.log('✅ [withArm64] abiFilters already present. Skipping.');
            return config;
        }

        if (buildGradle.match(pattern)) {
            // 注入
            console.log('✅ [withArm64] Injecting ndk abiFilters into defaultConfig...');
            config.modResults.contents = buildGradle.replace(
                pattern,
                `defaultConfig {${ndkConfig}`
            );
        } else {
            // ❌ 如果没找到，抛出显眼的错误，这样你在本地就能发现
            throw new Error(
                '❌ [withArm64] Error: Could not find "defaultConfig {" in android/app/build.gradle. Plugin failed.'
            );
        }

        return config;
    });
};

module.exports = withArm64;