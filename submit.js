#!/usr/bin/env node

// CODE VIBE CODING 99% TÔI CHỈ LÀM ĐỂ ANH EM UP BÀI CHO TIỆN THUI !!

// các thư viện
const fs = require("fs");
const path = require("path");
const os = require("os");
const open = require("open");
const { execSync } = require("child_process");
const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const figlet = require("figlet");

// ================= HELPER FUNCTIONS =================

function runCommand(cmd, silent = false, cwdPath = null, debug = false) {
    try {
        const options = {
            encoding: "utf8",
            stdio: silent ? "pipe" : "inherit"
        };
        if (cwdPath) {
            options.cwd = cwdPath;
        }
        return execSync(cmd, options);
    } catch (error) {
        if (debug) {
            console.error(chalk.red(`\n[DEBUG] Lệnh thất bại: ${cmd}`));
            console.error(chalk.red(`[DEBUG] Lỗi: ${error.message}`));
        }
        return null;
    }
}

function getCurrentBranch() {
    try {
        return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    } catch (error) {
        return "main";
    }
}

const CONFIG_FILE = path.join(os.homedir(), '.gitsubmitrc');

function getConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
        }
    } catch (error) { }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
}

function isGitRepo() {
    return runCommand("git rev-parse --git-dir", true) !== null;
}

function hasRemoteOrigin() {
    return runCommand("git remote get-url origin", true) !== null;
}

function getChangedFiles() {
    const output = runCommand("git status --porcelain", true);
    if (!output) return [];

    return output
        .trim()
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => {
            const status = line.substring(0, 2).trim();
            const file = line.substring(3);
            return { status, file };
        });
}

function getGitUserInfo() {
    const name = runCommand("git config user.name", true)?.trim();
    const email = runCommand("git config user.email", true)?.trim();
    return { name, email };
}

function createGithubRepo(org, repoName, cwdPath = null) {
    runCommand(`gh repo create ${org}/${repoName} --public`, true, cwdPath);
    runCommand(
        `git remote add origin https://github.com/${org}/${repoName}.git`,
        true,
        cwdPath
    );
}

function checkGhAuth() {
    const result = runCommand("gh auth status", true);
    if (result === null) {
        console.log(chalk.red("\n❌ Bạn chưa đăng nhập GitHub CLI!"));
        console.log(chalk.yellow("👉 Hãy chạy lệnh: ") + chalk.white("gh auth login") + chalk.yellow(" rồi thử lại.\n"));
        process.exit(1);
    }
}

function escapeMessage(msg) {
    return msg.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

// ================= MAIN PROGRAM =================

(async () => {
    try {
        console.clear();
        console.log(
            chalk.cyan(
                figlet.textSync("Git Submit", {
                    font: "Standard",
                    horizontalLayout: "default",
                })
            )
        );
        console.log(chalk.gray("━".repeat(60)));
        console.log(chalk.yellow("🚀 Tool Quản Lý & Nộp Bài Tự Động - By Lê Phước Lộc (VIBE CODING)\n"));

        // ===== MENU LỰA CHỌN TÍNH NĂNG =====
        const { mainAction } = await inquirer.prompt([
            {
                type: "list",
                name: "mainAction",
                message: "MÀY MUỐN LÀM GÌ THẰNG LỒN?",
                choices: [
                    { name: "🚀 Nộp bài lên GitHub (Push Code cho repo hiện tại)", value: "push" },
                    { name: "📁 Tạo thư mục bài tập tự động (Tự tạo cả repo trên git)", value: "scaffold" },
                    { name: "❌ Thoát", value: "exit" }
                ],
            },
        ]);

        if (mainAction === "exit") {
            console.log(chalk.gray("Cút! Chúc mày deadline ngập đầu. 👋"));
            process.exit(0);
        }

        // ===== TÍNH NĂNG: TẠO BÀI TẬP & PUSH HÀNG LOẠT =====
        if (mainAction === "scaffold") {
            console.log(chalk.gray("━".repeat(60)));

            const { prefix, startIndex, count, template } = await inquirer.prompt([
                {
                    type: "input",
                    name: "prefix",
                    message: "Tên tiền tố (VD: SESSION03_BAI):",
                    default: "SESSION03_BAI",
                    validate: (input) => input.trim() !== "" || "Mày biết nhập dữ liệu vào không?",
                },
                {
                    type: "number",
                    name: "startIndex",
                    message: "Bắt đầu tạo từ bài số mấy? (VD: Đã có bài 1,2,3 thì nhập 4):",
                    default: 1,
                    validate: (input) => input > 0 || "Ngu vậy ông cố, nhập số lượng ai cho nhập âm!",
                },
                {
                    type: "number",
                    name: "count",
                    message: "Số lượng bài muốn tạo THÊM (VD: 3):",
                    default: 3,
                    validate: (input) => input > 0 || "Ngu vậy ông cố, nhập số lượng ai cho nhập âm!",
                },
                {
                    type: "list",
                    name: "template",
                    message: "Mày muốn tạo sẵn file gì ở trong?",
                    choices: [
                        { name: "🌐 Web Front-end (index.html, style.css, script.js)", value: "web" },
                        { name: "💻 File Sql", value: "sql" },
                        { name: "❤️ Bất ngờ của Lộc", value: "suprise" },
                        { name: "📂 Chỉ tạo thư mục trống", value: "none" },
                    ],
                },
            ]);

            const spinScaffold = ora("Đang khởi tạo workspace...").start();

            let successCount = 0;
            const createdFolders = [];

            // Lặp từ startIndex đến startIndex + count - 1
            const endIndex = startIndex + count - 1;

            for (let i = startIndex; i <= endIndex; i++) {
                const folderName = `${prefix.trim()}${i}`;
                const folderPath = path.join(process.cwd(), folderName);

                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);

                    if (template === "web") {
                        fs.writeFileSync(
                            path.join(folderPath, "index.html"),
                            `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${folderName}</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>Bài tập: ${folderName}</h1>\n    <script src="script.js"></script>\n</body>\n</html>`
                        );
                        fs.writeFileSync(
                            path.join(folderPath, "style.css"),
                            `/* CSS cho ${folderName} */\nbody {\n    font-family: Arial, sans-serif;\n}`
                        );
                        fs.writeFileSync(
                            path.join(folderPath, "script.js"),
                            `// JavaScript cho ${folderName}\nconsole.log("Hello from ${folderName}!");`
                        );
                    } else if (template === "sql") {
                        fs.writeFileSync(
                            path.join(folderPath, "TUDOITENFILENHATHANGLON.sql"),
                            `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from ${folderName}!" << endl;\n    return 0;\n}`
                        );
                    } else if (template === "suprise") {
                        const noiDung = `ANH YÊU MẤY EM`;
                        fs.writeFileSync(path.join(folderPath, "TUDOITENFILENHATHANGLON.txt"), noiDung);
                    }
                    successCount++;
                    createdFolders.push({ name: folderName, path: folderPath });
                } else {
                    console.log(chalk.yellow(`\n⚠️  Đã bỏ qua: Thư mục ${folderName} đã tồn tại.`));
                }
            }

            spinScaffold.succeed(chalk.green(`✓ Đã tạo thành công ${successCount} thư mục bài tập mới!`));

            if (createdFolders.length === 0) {
                console.log(chalk.yellow("⚠️  Không có thư mục mới nào được tạo. Tool kết thúc."));
                process.exit(0);
            }

            const { pushNow } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "pushNow",
                    message: "🚀 Bạn có muốn tạo Repo và đẩy code cho TỪNG BÀI lên GitHub luôn không?",
                    default: true,
                },
            ]);

            if (!pushNow) {
                console.log(chalk.cyan(`\n💡 Gợi ý: Vào từng thư mục để làm bài. Xong bài nào gõ 'submit' để nộp nhé!\n`));
                process.exit(0);
            }

            checkGhAuth();

            const currentConfig = getConfig();
            const { org } = await inquirer.prompt([
                {
                    type: "input",
                    name: "org",
                    message: "🏢 Nhập tên organization (Tổ chức / Username GitHub) :",
                    default: currentConfig.org || "IT202RIKKEI",
                }
            ]);
            saveConfig({ ...currentConfig, org });

            console.log(chalk.magenta("\n🔥 Bắt đầu đẩy từng bài lên GitHub..."));

            for (const folder of createdFolders) {
                console.log(chalk.cyan(`\n👉 Đang thao tác tại thư mục: ${chalk.bold(folder.name)}`));
                const spinRepo = ora(`Đang đẩy ${folder.name} lên GitHub...`).start();

                // 1. Khởi tạo và ép nhánh main (Giải quyết lỗi push bị rỗng code)
                runCommand("git init", true, folder.path);
                runCommand("git branch -M main", true, folder.path);

                // 2. Tạo repo
                const createRes = runCommand(
                    `gh repo create ${org}/${folder.name} --public`,
                    true,
                    folder.path
                );

                if (createRes === null) {
                    spinRepo.fail(chalk.red(`✗ Lỗi tạo repo ${folder.name} (Có thể đã tồn tại). Bỏ qua bài này.`));
                    continue;
                }

                // 3. Liên kết remote
                runCommand(`git remote add origin https://github.com/${org}/${folder.name}.git`, true, folder.path);

                // 4. Add & Commit
                runCommand("git add .", true, folder.path);
                const initMsg = escapeMessage(`Khởi tạo bài tập ${folder.name}`);
                runCommand(`git commit -m "${initMsg}"`, true, folder.path);

                // 5. Push
                const pushRes = runCommand("git push -u origin main", true, folder.path);

                if (pushRes === null) {
                    spinRepo.fail(chalk.red(`✗ Push thất bại cho bài ${folder.name}! (CHỈ MỚI UP REPO TRỐNG LÊN GIT CHƯA CÓ TỆP CON)`));
                } else {
                    spinRepo.succeed(chalk.green(`✓ Đã lên GitHub: ${folder.name} (Gồm cả vỏ repo và folder con)`));
                }
            }

            console.log(chalk.green.bold("\n🎉 HOÀN TẤT QUÁ TRÌNH TẠO & PUSH HÀNG LOẠT!"));
            console.log(chalk.cyan(`🌐 Bạn có thể vào trang GitHub của ${org} để kiểm tra.`));
            process.exit(0);
        }

        // =========================================================
        // ===== LUỒNG PUSH CODE BÌNH THƯỜNG (Cho 1 Repo hiện tại) =====

        // HIỂN THỊ THƯ MỤC HIỆN TẠI ĐỂ TRÁNH NHẦM LẪN
        const currentFolderName = path.basename(process.cwd());
        console.log(chalk.magenta(`👉 Đang chuẩn bị Nộp bài cho thư mục: ${chalk.bold(currentFolderName)}\n`));

        let spinner = null;

        if (!isGitRepo()) {
            const { shouldInit } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "shouldInit",
                    message: "⚠️  Chưa có Git repository. Khởi tạo Git?",
                    default: true,
                },
            ]);

            if (!shouldInit) {
                console.log(chalk.red("❌ Đã hủy!"));
                process.exit(0);
            }

            spinner = ora("Đang khởi tạo Git...").start();
            runCommand("git init");
            runCommand("git branch -M main"); // Ép tên nhánh
            runCommand('echo "# init" > README.md', true);
            spinner.succeed(chalk.green("✓ Đã khởi tạo Git repository"));
        } else {
            console.log(chalk.green("✓ Git repository đã tồn tại"));
        }

        if (!hasRemoteOrigin()) {
            const { createRepo } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "createRepo",
                    message: "❓ Chưa có remote origin. Tạo repo trên GitHub?",
                    default: true,
                },
            ]);

            if (createRepo) {
                checkGhAuth();

                const answers = await inquirer.prompt([
                    {
                        type: "input",
                        name: "org",
                        message: "🏢 Nhập tên organization:",
                        default: getConfig().org || "IT202RIKKEI",
                    },
                    {
                        type: "input",
                        name: "repoName",
                        message: "📦 Nhập tên repo:",
                        default: currentFolderName, // Lấy tên thư mục hiện tại làm mặc định
                    },
                ]);

                const currentConfig = getConfig();
                saveConfig({ ...currentConfig, org: answers.org });

                console.log(chalk.yellow("🚀 Đang tạo repo trên GitHub..."));
                createGithubRepo(answers.org, answers.repoName);
                console.log(chalk.green("✅ Đã tạo và liên kết repo thành công!"));
            } else {
                console.log(chalk.red("❌ Không có remote, không thể push!"));
                process.exit(0);
            }
        }

        const userInfo = getGitUserInfo();
        if (userInfo.name && userInfo.email) {
            console.log(chalk.gray(`📝 User: ${userInfo.name} <${userInfo.email}>`));
        }

        console.log(chalk.gray("━".repeat(60)) + "\n");

        const changedFiles = getChangedFiles();

        if (changedFiles.length === 0) {
            console.log(chalk.yellow("⚠️  Không có thay đổi nào để commit!"));
            process.exit(0);
        }

        console.log(chalk.cyan("📂 Files đã thay đổi:"));
        changedFiles.forEach(({ status, file }) => {
            const icon = status === "M" ? "📝" : status === "A" ? "➕" : status === "D" ? "❌" : "❓";
            console.log(`   ${icon} ${chalk.white(file)} ${chalk.gray(`[${status}]`)}`);
        });
        console.log("");

        const { filesToAdd } = await inquirer.prompt([
            {
                type: "list",
                name: "filesToAdd",
                message: "📁 Chọn files để commit:",
                choices: [
                    { name: "✅ Tất cả files", value: "." },
                    { name: "📂 Chọn thư mục cụ thể", value: "custom" },
                ],
            },
        ]);

        let targetPath = ".";

        if (filesToAdd === "custom") {
            const { customPath } = await inquirer.prompt([
                {
                    type: "input",
                    name: "customPath",
                    message: "📁 Nhập đường dẫn (vd: session-1/bai1 hoặc . để lấy tất cả):",
                    default: ".",
                    validate: (input) => input.trim() !== "" || "Đường dẫn không được để trống!",
                },
            ]);
            targetPath = customPath.trim();
        }

        const { commitMessage } = await inquirer.prompt([
            {
                type: "input",
                name: "commitMessage",
                message: "💬 Nhập commit message:",
                default: `Submit ${new Date().toLocaleDateString("vi-VN")}`,
                validate: (input) => input.trim() !== "" || "Message không được để trống!",
            },
        ]);

        console.log("\n" + chalk.gray("━".repeat(60)));
        console.log(chalk.yellow("📋 Tóm tắt commit:"));
        console.log(chalk.gray(`   Path: ${chalk.white(targetPath)}`));
        console.log(chalk.gray(`   Message: ${chalk.white(commitMessage)}`));
        console.log(chalk.gray(`   Files: ${chalk.white(changedFiles.length)} thay đổi`));
        console.log(chalk.gray("━".repeat(60)) + "\n");

        const { confirmPush } = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmPush",
                message: "🚀 Xác nhận push lên GitHub?",
                default: true,
            },
        ]);

        if (!confirmPush) {
            console.log(chalk.red("❌ Đã hủy!"));
            process.exit(0);
        }

        spinner = ora("Đang thực hiện Git workflow...").start();

        spinner.text = "📦 Đang add files...";
        runCommand(`git add ${targetPath}`);
        spinner.succeed(chalk.green("✓ Đã add files"));

        spinner.start("💾 Đang commit...");
        const safeMessage = escapeMessage(commitMessage);
        const commitResult = runCommand(`git commit -m "${safeMessage}"`, true);
        if (commitResult === null) {
            spinner.fail(chalk.red("⚠️  Không có gì để commit hoặc commit thất bại!"));
            process.exit(0);
        }
        spinner.succeed(chalk.green("✓ Đã commit"));

        spinner.start("🚀 Đang push lên GitHub...");
        const currentBranch = getCurrentBranch() || "main";
        let pushResult = runCommand(`git push -u origin ${currentBranch}`, true);

        if (pushResult === null) {
            spinner.warn(chalk.yellow("⚠️  Push thất bại do GitHub có code mới hơn (Conflict)!"));

            const { tryRebase } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "tryRebase",
                    message: "🔧 Bạn có muốn tự động lấy code về (pull --rebase) rồi push lại không?",
                    default: true,
                },
            ]);

            if (tryRebase) {
                spinner.start("🔄 Đang pull code mới về...");
                const pullResult = runCommand(`git pull origin ${currentBranch} --rebase`, true);

                if (pullResult !== null) {
                    spinner.succeed(chalk.green("✓ Đã gộp code thành công."));

                    const updatedFiles = runCommand("git diff --name-status HEAD@{1} HEAD", true);
                    if (updatedFiles && updatedFiles.trim() !== "") {
                        console.log(chalk.cyan("\n📥 Code mới từ GitHub có những thay đổi sau:"));
                        updatedFiles.trim().split("\n").forEach(line => {
                            const parts = line.split(/\s+/);
                            const status = parts[0];
                            const file = parts.slice(1).join(" ");
                            const icon =
                                status.startsWith("A") ? "➕" :
                                    status.startsWith("M") ? "📝" :
                                        status.startsWith("D") ? "❌" : "🔄";
                            console.log(`   ${icon} ${chalk.white(file)} ${chalk.gray(`[${status}]`)}`);
                        });
                        console.log("");
                    } else {
                        console.log(chalk.gray("   (Không có thay đổi mới từ server sau khi rebase)\n"));
                    }

                    spinner.start("🚀 Đang push lại...");
                    pushResult = runCommand(`git push -u origin ${currentBranch}`, true);

                    if (pushResult === null) {
                        spinner.fail(chalk.red("✗ Vẫn không push được. Bạn cần mở file lên sửa conflict thủ công!"));
                        console.log(chalk.yellow("\n💡 Gợi ý: Chạy 'git status' để xem file nào đang conflict.\n"));
                        process.exit(1);
                    }
                } else {
                    spinner.fail(chalk.red("✗ Pull --rebase thất bại. Hãy kiểm tra lại code và thử thủ công!"));
                    console.log(chalk.yellow("\n💡 Gợi ý: Chạy 'git rebase --abort' để hoàn tác rồi tự sửa conflict.\n"));
                    process.exit(1);
                }
            } else {
                console.log(chalk.red("❌ Đã hủy push!"));
                process.exit(0);
            }
        }

        spinner.succeed(chalk.green("✓ Đã push lên GitHub thành công!"));

        console.log("\n" + chalk.gray("━".repeat(60)));
        console.log(chalk.green.bold("🎉 PUSH THÀNH CÔNG!"));
        console.log(chalk.gray("━".repeat(60)));

        const remoteUrl = runCommand("git remote get-url origin", true)?.trim();
        if (remoteUrl) {
            const cleanUrl = remoteUrl.replace(/\.git$/, '');
            console.log(chalk.cyan(`\n🔗 Repository: ${cleanUrl}\n`));
            console.log(chalk.gray("🌐 Đang mở GitHub trên trình duyệt..."));
            await open(cleanUrl);
        }

    } catch (error) {
        console.log("\n" + chalk.red("❌ LỖI KHÔNG XÁC ĐỊNH:"), error.message);
        if (process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
})();
