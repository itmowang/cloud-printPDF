"use strict";
// 复制frp目录到lib目录
const copydir = require("copy-dir");
// 如果没有lib目录先创建
const fs = require("fs");
if (!fs.existsSync("./lib")) {
    fs.mkdirSync("./lib");
}
copydir.sync(`./frp`, `./lib/frp`, {
    utimes: true,
    mode: true,
    cover: true // cover file when exists, default is true
});
