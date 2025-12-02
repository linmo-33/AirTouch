const { withAppBuildGradle } = require('expo/config-plugins');

// 从 Node.js fs 模块导入文件操作函数
const fs = require('fs');

module.exports = function withAbiSplits(config) {
  return withAppBuildGradle(config, (config) => {
    const gradlePath = config.modRequest.platformProjectRoot + '/app/build.gradle';
    const content = fs.readFileSync(gradlePath, 'utf-8');

    // splits 配置块（仅 arm64-v8a）
    const splitsBlock = `
    splits {
        abi {
            reset()
            enable true
            enableSeparateBuildPerCPUArchitecture true
            universalApk false
            include "arm64-v8a"
        }
    }

    // 处理 versionCode 以避免 ABI 冲突
    applicationVariants.all { variant ->
        variant.outputs.each { output ->
            def abi = output.getFilter(com.android.build.OutputFile.ABI)
            if (abi != null) {
                def abiCode = (abi == "arm64-v8a") ? 2 : 0
                output.versionCodeOverride = defaultConfig.versionCode * 1000 + abiCode
            }
        }
    }
    `;

    // 插入到 android { } 块的末尾（在最后一个 } 前）
    const insertPoint = content.lastIndexOf('}') - 1;  // 找到 android 块的结束
    const newContent = content.slice(0, insertPoint) + splitsBlock + '\n' + content.slice(insertPoint);

    fs.writeFileSync(gradlePath, newContent);
    return config;
  });
};