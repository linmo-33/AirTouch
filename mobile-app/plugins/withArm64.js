const { withAppBuildGradle } = require('expo/config-plugins');

const withArm64 = (config) => {
    return withAppBuildGradle(config, (config) => {
        // 读取当前的 build.gradle 内容
        const buildGradle = config.modResults.contents;

        // 定义我们要插入的配置块
        // 使用 packagingOptions (或 packaging) 进行物理剔除
        // 这是最稳健的方式，不管编译过程如何，最后打包时直接扔掉多余文件
        const packagingConfig = `
// [AirTouch] Added by Config Plugin
android {
    packagingOptions {
        // 确保如果有重复文件不会报错
        pickFirst 'lib/**/*.so'
        
        // 【核心】强制剔除 x86 (模拟器) 和 armv7 (32位老手机)
        exclude 'lib/x86/**'
        exclude 'lib/x86_64/**'
        exclude 'lib/armeabi-v7a/**'
    }
}
`;

        // 防止重复添加
        if (!buildGradle.includes('[AirTouch] Added by Config Plugin')) {
            config.modResults.contents = buildGradle + packagingConfig;
        }

        return config;
    });
};

module.exports = withArm64;