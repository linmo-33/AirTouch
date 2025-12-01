const { withAppBuildGradle } = require('@expo/config-plugins');

const withAndroidAbiFilter = (config) => {
    return withAppBuildGradle(config, (modConfig) => {
        let buildGradle = modConfig.modResults.contents;

        // 避免重复添加
        if (buildGradle.includes('abiFilters "arm64-v8a"')) {
            console.log('[withAndroidAbiFilter] ABI filter already configured');
            return modConfig;
        }

        // 找到 defaultConfig 并添加 ndk abiFilters
        if (buildGradle.includes('defaultConfig {')) {
            buildGradle = buildGradle.replace(
                /defaultConfig\s*\{/,
                `defaultConfig {
        ndk {
            abiFilters "arm64-v8a"
        }`
            );
            modConfig.modResults.contents = buildGradle;
            console.log('[withAndroidAbiFilter] Successfully added arm64-v8a filter');
        } else {
            console.warn('[withAndroidAbiFilter] Could not find defaultConfig block');
        }

        return modConfig;
    });
};

module.exports = withAndroidAbiFilter;