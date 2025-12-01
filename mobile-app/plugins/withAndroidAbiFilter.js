const { withAppBuildGradle } = require('@expo/config-plugins');

const withAndroidAbiFilter = (config) => {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // 我们需要找到 defaultConfig 代码块，并在其中插入 ndk { abiFilters ... }
    // 这种正则替换是修改 Android 构建配置的标准做法
    if (buildGradle.includes('defaultConfig {')) {
      config.modResults.contents = buildGradle.replace(
        /defaultConfig\s?\{/,
        `defaultConfig {
        // [AirTouch Config] 强制只打包 arm64-v8a，剔除 x86 和 armv7
        ndk {
            abiFilters "arm64-v8a"
        }`
      );
    } else {
      console.warn(
        'Warning: [withAndroidAbiFilter] 无法找到 defaultConfig 块，架构过滤可能失败。'
      );
    }

    return config;
  });
};

module.exports = withAndroidAbiFilter;