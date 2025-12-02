const { withAppBuildGradle } = require('expo/config-plugins');

const withAndroidAbiFilter = (config) => {
    return withAppBuildGradle(config, (config) => {
        const buildGradle = config.modResults.contents;

        console.log('🔥 [AirTouch] 正在尝试注入 NDK 过滤配置...');

        // 正则查找 applicationId "com.airtouch.app" 这样的行
        // 这一行一定在 defaultConfig 内部
        const pattern = /applicationId\s+["']([^"']+)["']/;

        if (buildGradle.match(pattern)) {
            // 替换策略：保留原有的 applicationId，在其下方插入 ndk 配置
            config.modResults.contents = buildGradle.replace(
                pattern,
                `applicationId "$1"
        ndk {
            // 强制只保留 64位 ARM，这是减小体积的关键
            abiFilters "arm64-v8a"
        }`
            );
            console.log('✅ [AirTouch] 成功注入 abiFilters!');
        } else {
            // 如果找不到，直接报错停止构建，避免浪费时间
            throw new Error("❌ [AirTouch] 致命错误：无法在 build.gradle 中找到 applicationId，插件失效。");
        }

        return config;
    });
};

module.exports = withAndroidAbiFilter;