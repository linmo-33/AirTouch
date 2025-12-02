const { withAppBuildGradle } = require('expo/config-plugins');
const fs = require('fs');

module.exports = function withAbiSplits(config) {
  return withAppBuildGradle(config, (config) => {
    const gradlePath = `${config.modRequest.platformProjectRoot}/app/build.gradle`;
    let content = fs.readFileSync(gradlePath, 'utf-8');

    const splitsBlock = `
splits {
    abi {
        reset()
        enable true
        enableSeparateBuildPerCPUArchitecture true
        universalApk false
        include 'arm64-v8a'
    }
}
applicationVariants.all { variant ->
    variant.outputs.each { output ->
        def abi = output.getFilter(com.android.build.OutputFile.ABI)
        if (abi != null) {
            output.versionCodeOverride = defaultConfig.versionCode * 1000 + (abi == 'arm64-v8a' ? 2 : 0)
        }
    }
}
`;

    // 插入到 buildTypes { } 后
    const buildTypesEnd = content.indexOf('}', content.indexOf('buildTypes {'));
    const insertPos = content.indexOf('\n', buildTypesEnd) + 1;
    content = content.slice(0, insertPos) + splitsBlock + '\n' + content.slice(insertPos);

    fs.writeFileSync(gradlePath, content);
    return config;
  });
};