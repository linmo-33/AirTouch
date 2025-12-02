const { withAppBuildGradle } = require('expo/config-plugins');

const withArm64 = (config) => {
    return withAppBuildGradle(config, (config) => {
        const buildGradle = config.modResults.contents;

        // 使用 **/ 前缀来匹配任意深度的目录
        const packagingConfig = `
// ===========================================================
// [AirTouch] 强制架构剔除配置
// ===========================================================
android {
    packagingOptions {
        // 防止 pickFirst 冲突报错
        pickFirst 'lib/**/*.so'
        
        // 🔥 重点：使用 **/ 匹配所有位置的 x86 和 armv7 文件
        exclude '**/x86/**'
        exclude '**/x86_64/**'
        exclude '**/armeabi-v7a/**'
        
        // 双保险：有时候目录名本身不带斜杠
        exclude '**/x86'
        exclude '**/x86_64'
        exclude '**/armeabi-v7a'
    }
}
`;

        // 防止重复写入
        if (!buildGradle.includes('[AirTouch] 强制架构剔除配置')) {
            config.modResults.contents = buildGradle + packagingConfig;
        }

        return config;
    });
};

module.exports = withArm64;