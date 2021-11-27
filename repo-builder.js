const fs = require('fs')
const {execSync} = require('child_process')
const path = require('path')

const TMP_PACKAGE_STORE = '/work/tmp'
const REPO_PATH = '/work/repo'
const REPO_NAME = process.env.REPO_NAME

let workingLock = false
const waitingQueue = []

/**
 * @param {string} pkgFileName
 */
const addPackage = (pkgFileName) => {
    if (workingLock) {
        waitingQueue.push(pkgFileName)
        return
    }

    workingLock = true
    try {
        // 从文件名中获取架构名称
        //            [----1名称版本----]-[---2架构---] .pkg .tar .zst/.gz/.xz?
        const exec = /^([A-Za-z0-9\-._]+)-([a-z0-9._]+)\.pkg\.tar(\.[a-z0-9]+)?$/.exec(pkgFileName)
        const archName = exec[2]

        let arches = [archName]
        if (archName === 'any') {
            arches = ['x86_64', 'i686', 'aarch64']
        }

        for (const arch of arches) {
            // 创建架构目录，如果不存在
            const archPath = path.join(REPO_PATH, arch)
            if (!fs.existsSync(archPath)) {
                fs.mkdirSync(archPath)
            }

            // 执行添加命令
            if (fs.existsSync(path.join(archPath, `${REPO_NAME}.db.tar.gz.lck`)))
                fs.unlinkSync(path.join(archPath, `${REPO_NAME}.db.tar.gz.lck`))
            execSync(`repo-add -R ${path.join(archPath, `${REPO_NAME}.db.tar.gz`)} ${path.join(TMP_PACKAGE_STORE, pkgFileName)}`)
        }

        if (archName === 'any') {
            for (const arch of arches) {
                fs.copyFileSync(path.join(TMP_PACKAGE_STORE, pkgFileName), path.join(REPO_PATH, arch, pkgFileName))
            }
            fs.unlinkSync(path.join(TMP_PACKAGE_STORE, pkgFileName))
        }
        else {
            // 将文件移动到架构目录
            const dest = path.join(REPO_PATH, archName, pkgFileName)
            fs.renameSync(path.join(TMP_PACKAGE_STORE, pkgFileName), dest)
        }
    }
    catch (e) {
        console.log(e)
    }
    finally {
        workingLock = false
        if (waitingQueue.length > 0) {
            addPackage(waitingQueue.shift())
        }
    }
}

const getQueue = () => {
    return waitingQueue
}

module.exports = {addPackage, getQueue}
