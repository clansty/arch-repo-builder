const fs = require('fs/promises')
const fsO = require('fs')
const path = require('path')
const util = require('util')

const exec = util.promisify(require('child_process').exec)

const TMP_PACKAGE_STORE = '/work/tmp'
const REPO_PATH = '/work/repo'
const REPO_NAME = process.env.REPO_NAME

let workingLock = false
const waitingQueue = []

/**
 * @param {string} pkgFileName
 */
const addPackage = async (pkgFileName) => {
    if (workingLock) {
        waitingQueue.push(pkgFileName)
        return
    }

    workingLock = true
    try {
        // 从文件名中获取架构名称
        //                  [----1名称版本----]-[---2架构---] .pkg .tar .zst/.gz/.xz?
        const regexExec = /^([A-Za-z0-9\-._:]+)-([a-z0-9._]+)\.pkg\.tar(\.[a-z0-9]+)?$/.exec(pkgFileName)
        const archName = regexExec[2]

        let arches = [archName]
        if (archName === 'any') {
            arches = ['x86_64', 'i686', 'aarch64']
        }

        for (const arch of arches) {
            // 创建架构目录，如果不存在
            const archPath = path.join(REPO_PATH, arch)
            if (!fsO.existsSync(archPath)) {
                await fs.mkdir(archPath)
            }

            // 执行添加命令
            if (fsO.existsSync(path.join(archPath, `${REPO_NAME}.db.tar.gz.lck`)))
                await fs.unlink(path.join(archPath, `${REPO_NAME}.db.tar.gz.lck`))
            await exec(`repo-add -R ${path.join(archPath, `${REPO_NAME}.db.tar.gz`)} ${path.join(TMP_PACKAGE_STORE, pkgFileName)}`)
        }

        if (archName === 'any') {
            for (const arch of arches) {
                await fs.copyFile(path.join(TMP_PACKAGE_STORE, pkgFileName), path.join(REPO_PATH, arch, pkgFileName))
            }
            await fs.unlink(path.join(TMP_PACKAGE_STORE, pkgFileName))
        }
        else {
            // 将文件移动到架构目录
            const dest = path.join(REPO_PATH, archName, pkgFileName)
            await fs.rename(path.join(TMP_PACKAGE_STORE, pkgFileName), dest)
        }
    }
    catch (e) {
        console.log(e)
    }
    finally {
        workingLock = false
        if (waitingQueue.length > 0) {
            await addPackage(waitingQueue.shift())
        }
    }
}

const getQueue = () => {
    return waitingQueue
}

/**
 * @param {string} pkgFileName
 */
const packageExists = (pkgFileName) => {
    // 从文件名中获取架构名称
    //                  [----1名称版本----]-[---2架构---] .pkg .tar .zst/.gz/.xz?
    const regexExec = /^([A-Za-z0-9\-._:]+)-([a-z0-9._]+)\.pkg\.tar(\.[a-z0-9]+)?$/.exec(pkgFileName)
    let archName = regexExec[2]
    if (archName === 'any') {
        archName = 'x86_64'
    }
    return fsO.existsSync(path.join(REPO_PATH, archName, pkgFileName))
}

module.exports = {addPackage, getQueue, packageExists}
