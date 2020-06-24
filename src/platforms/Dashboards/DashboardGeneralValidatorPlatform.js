const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.validator.general';

// change platform name
platform.setName('dashboard_general_validator');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-general/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "general/style-dashboard-general.scss";
    task.watch = [
        "_common/**/*.scss",
        "general/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(4500, '/');

module.exports = platform;