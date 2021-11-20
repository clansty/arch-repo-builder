const fs = require('fs')
const {execSync} = require('child_process')
const path = require('path')

const TMP_PACKAGE_STORE = '/work/tmp'
const REPO_PATH = '/work/repo'
const REPO_NAME = process.env.REPO_NAME

/**
 * @param {string} pkgFileName
 */
const addPackage = (pkgFileName) => {
    // 从文件名中获取架构名称
    //            [----1名称版本----]-[---2架构---] .pkg .tar .zst/.gz/.xz?
    const exec = /^([A-Za-z0-9\-._]+)-([a-z0-9._]+)\.pkg\.tar(\.[a-z0-9]+)?$/.exec(pkgFileName)
    const archName = exec[2]

    // 创建架构目录，如果不存在
    const archPath = path.join(REPO_PATH, archName)
    if (!fs.existsSync(archPath)) {
        fs.mkdirSync(archPath)
    }

    // 将文件移动到架构目录
    const dest = path.join(archPath, pkgFileName)
    fs.renameSync(path.join(TMP_PACKAGE_STORE, pkgFileName), dest)

    // 执行添加命令
    execSync(`repo-add ${path.join(archPath, `${REPO_NAME}.db.tar.gz`)} ${dest}`)
}

module.exports = {addPackage}
