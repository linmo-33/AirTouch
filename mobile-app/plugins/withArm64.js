const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withAbiSplit(config) {
    return withAppBuildGradle(config, (config) => {
        // 在 android { } 块中添加 splits 配置
        const androidBlock = `
android {
  ...
  splits {
    abi {
      reset()
      enable true
      enableSeparateBuildPerCPUArchitecture true
      universalApk false  // 不生成通用 APK
      include "arm64-v8a"  // 仅包含 arm64-v8a 架构
    }
  }
  ...
}
    `;
        // 替换或追加到 build.gradle 中的 android 块（简化处理，实际可使用字符串替换逻辑）
        config.modResults.contents = config.modResults.contents.replace(
            /android\s*\{/,
            `$&${androidBlock.split('android {')[1] || ''}`
        );
        return config;
    });
};
