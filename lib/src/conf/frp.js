"use strict";
const iitom = require("@iarna/toml");
const { v4: uuidfrpName } = require("uuid"); // 导入uuid模块
const { exec } = require("child_process");
const frpConf = {
    sercvice_addr: "frp.freefrp.net",
    service_port: 8080,
    token: "freefrp.net",
};
// 生成随机端口
const generateRandomPort = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
// 打开frpc.exe
const openFrp = () => {
    const exeFile = require("path").join(__dirname, "../../frp/frpc.exe");
    const configFile = require("path").join(__dirname, "../../frp/frpc.toml");
    //   // 使用 `-c` 参数传递配置文件的路径
    const command = `${exeFile} -c ${configFile}`;
    const childProcess = exec(command);
    // 监听子进程的退出事件
    childProcess.on("exit", (code, signal) => {
        if (code === 0) {
            console.log("frpc.exe 已成功退出");
        }
        else {
            console.error(`frpc.exe 退出，退出码: ${code}, 信号: ${signal}`);
        }
    });
    // 监听子进程的错误事件
    childProcess.on("error", (error) => {
        console.error(`启动 frpc.exe 时发生错误: ${error.message}`);
    });
    // 监听子进程的标准输出和标准错误流
    childProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });
    childProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });
};
// 读取配置文件
const writePZFile = (data, configFile) => {
    const fs = require("fs");
    try {
        // 解析 TOML 配置文件
        const config = iitom.parse(data);
        // 修改配置值
        config.serverAddr = frpConf.sercvice_addr; // 修改 serverAddr
        config.serverPort = frpConf.service_port; // 修改 serverPort
        config.token = frpConf.token; // 修改 token
        console.log(config);
        // 添加一个新代理
        config.proxies = [{
                name: uuidfrpName(),
                type: "tcp",
                local_ip: "127.0.0.1",
                local_port: "3000",
                remote_port: generateRandomPort(1024, 65535).toString(),
            }];
        // 使用 @iarna/toml 库的 stringify 函数将配置对象转换为 TOML 格式
        const modifiedTOML = iitom.stringify(config);
        // 写入修改后的 TOML 字符串回到配置文件
        fs.writeFile(configFile, modifiedTOML, (writeErr) => {
            if (writeErr) {
                console.error(`无法写入配置文件: ${writeErr}`);
            }
            else {
                console.log("配置文件已成功修改和写入.");
                // 执行启动frp
                openFrp();
            }
        });
    }
    catch (parseError) {
        console.error(`无法解析配置文件: ${parseError}`);
    }
};
const updpFRP = (ifrphconf) => {
    const fs = require("fs");
    const path = require("path");
    const configFile = path.join(__dirname, "../../frp/frpc.toml");
    fs.readFile(configFile, "utf8", (err, data) => {
        if (err) {
            console.error(`无法读取配置文件: ${err}`);
            return;
        }
        try {
            writePZFile(data, configFile);
            // 现在你可以访问配置对象中的属性
            //   console.log("frpc 配置内容:", config);
        }
        catch (parseError) {
            console.error(`无法解析配置文件: ${parseError}`);
        }
    });
};
module.exports = {
    frpConf,
    updpFRP,
};
