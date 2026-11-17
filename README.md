<div align="center">

<img src="deploy/fnos/wuchengerp/app/ui/images/icon_256.png" width="96" alt="灵兔电商工作台" />

# 灵兔电商工作台

**采购、销售、经营总览，在一个原生飞牛工作台里完成。**

面向飞牛 NAS 的浏览器工作台：从飞牛桌面进入，程序、账本、附件与备份分开管理。

**简体中文（默认）** · [English](README.en.md)

[![Release](https://img.shields.io/github/v/release/907609732/lingtu-ecommerce-workbench?color=0071e3&label=Release)](https://github.com/907609732/lingtu-ecommerce-workbench/releases)
[![Browser ERP checks](https://github.com/907609732/lingtu-ecommerce-workbench/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/907609732/lingtu-ecommerce-workbench/actions/workflows/ci.yml)
![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-339933)
![fnOS native](https://img.shields.io/badge/fnOS-native-0B7A5C)

**[发布记录](https://github.com/907609732/lingtu-ecommerce-workbench/releases)** · [问题反馈](https://github.com/907609732/lingtu-ecommerce-workbench/issues) · [运行维护](docs/operations.md)

</div>

---

[主要功能](#主要功能) · [快速使用](#快速使用) · [数据与安全](#数据与安全) · [源码开发](#源码开发) · [文档](#文档) · [版本与发布证据](#版本与发布证据)

## 主要功能

| 能力 | 可以做什么 |
| --- | --- |
| 🛒 采购 | 手工录入、表格导入、原始附件、手机录入；维护供应商、地址、月度确认与订单日志。 |
| 💰 销售 | 销售记账、官方账单导入、运费、月结、历史报表与原始附件。 |
| 📊 经营总览 | 经营看板、费用账单、人力支出、付款记录、月报快照与原件下载。 |
| 🖥️ 菜鸟登录 | 在顶栏打开 NAS 上的 Chromium，经随包 Xvfb、VNC 与 noVNC 操作；平台登录和人机验证（CAPTCHA）由用户本人完成。 |
| 🗂️ 版本与备份 | 程序版本与账本分离；升级前停写、生成一致性备份并做副本恢复校验，失败时保留原数据与回退材料。 |

0.15.6 的销售与经营总览分别保留登录资料。0.15.7 候选包才改为一个 Chromium 共用登录状态、各模块使用受控标签页；旧经营总览资料原样保留，不合并 Cookie 数据库。切换平台账号会同时影响两个模块，采集前须确认当前账号。

## 快速使用

本次更新仓库名称与文档；已安装应用仍可能显示「五成ERP」。飞牛应用 ID 仍为 `wuchengerp`，现有安装、账本与备份路径不变。

1. 从飞牛桌面打开现有 ERP 应用（当前安装版名称为「五成ERP」）。桌面访问采用设备内所有用户；入口仍校验飞牛可信代理、来源和会话，业务密码、复核与月锁继续生效。
2. 先核对程序版本与账本身份。统一管理员密码由实际经办人设置或验证，没有默认密码。
3. 在采购、销售、经营总览中录入、导入或核对业务；月结前检查范围、金额、笔数与缺项，再锁定月份。
4. 需要菜鸟数据时打开「菜鸟登录」，在远程 Chromium 中由本人完成平台登录和人机验证，再回业务台连接采集。采集前确认账号，不要绕过待核对申请。
5. 升级时先隔离试装并验证备份，再从应用中心沿用已安装数据升级。不能新建空账本替代原账本；完整步骤见[运行维护](docs/operations.md)。

> **为什么不用 Docker？** 正式环境是飞牛应用中心安装的原生应用，运行不依赖 Docker，也没有旧 ERP 容器作为正式入口或回退服务。原生包自带 Node.js、Chromium、Xvfb、VNC 与 noVNC；其他业务容器不随本工作台启停。清理时不要执行全局 Docker prune，也不要连带删除账本、独立云仓或其他服务。

## 数据与安全

业务账本仍为 SQLite，程序、运行文件、账本、附件、登录资料与备份分开存放。网关校验飞牛可信 Unix 代理、来源、会话和签名身份，并保留 CSRF、重复提交回执、上传限制与审计；业务密码、复核和月锁继续生效。

以下内容不进入 Git、文档示例、CI 或发布包：正式账本、附件、Cookie 与登录资料、密钥、密码库、运行状态和备份。GitHub Actions 处理源码构建与合成测试，不携带正式数据。开发入口只监听本机，默认数据位于 `.codex-artifacts/web-dev/data`，与正式账本隔离。

启用数据版本托管时，白名单业务快照和必要附件会纳入独立、需认证的 UVCS 数据仓库托管流程；授权、会话、运行状态和历史备份不在导出范围。只有取得真实 changeset 才显示已托管，且待上传内容可能排队；它不能替代本机业务备份。

备份必须写入新目录，以 SHA-256 与 SQLite `integrity_check` 校验；恢复只写新目录，并安排恢复演练。外部副本仍需复制到可信存储。清理旧程序或测试目录前核对运行实例、挂载和备份用途，不删除账本、独立云仓或其他服务。

## 源码开发

需要 Node.js 24 或更新版本、npm 与 Git。发行包自带运行环境；开发数据与正式账本隔离。以下命令在 Windows PowerShell 中执行。

```powershell
git clone https://github.com/907609732/lingtu-ecommerce-workbench.git
cd lingtu-ecommerce-workbench
npm.cmd ci --ignore-scripts
npm.cmd --prefix apps/purchase ci --ignore-scripts
npm.cmd --prefix apps/sales ci --ignore-scripts
npm.cmd --prefix apps/overview ci --ignore-scripts
npm.cmd run web:dev
```

开发入口为 `http://127.0.0.1:28430/`，默认数据目录为 `.codex-artifacts/web-dev/data`。端口冲突时传入独立的 development 配置及数据目录：`npm.cmd run web:dev -- --config <配置路径>`。

```powershell
npm.cmd run web:check
npm.cmd test
npm.cmd run test:purchase
npm.cmd run test:sales
npm.cmd run test:overview
npm.cmd run check:ui
```

模块：`apps/purchase`、`apps/sales`、`apps/overview`；宿主与网关：`server/`；共享协议：`shared/`；共享样式：`ui/`。云仓和买家订单导出使用独立项目。源码测试通过不代表真实平台采集或正式账本切换成功；真实登录、验证码与平台页面变化仍需人工验收。

## 文档

| 文档 | 内容 |
| --- | --- |
| [运行维护（中文）](docs/operations.md) / [Operations (English)](docs/operations.en.md) | 正式环境、访问、升级、故障与回退 |
| [开发说明](docs/development.md) | 本地开发、测试与数据隔离 |
| [架构](docs/architecture.md) | 网关、三个模块与数据存储 |
| [共享 UI](ui/README.md) | tokens、组件、期间选择器与同步规则 |
| [原生飞牛打包工作流](.github/workflows/fnos-native.yml) | FPK 构建与交付 |
| [验收规则](docs/verification.md) | 源码测试与真实验收的边界 |
| [数据版本托管](docs/data-version-operations.md) | UVCS 业务快照、恢复与限制 |
| [历史迁移记录](docs/browser-only-migration.md) | 浏览器服务迁移背景，仅供追溯 |

历史浏览器服务和迁移文档用于追溯，当前环境以运行维护文档为准。仓库保留源码、锁文件、运行资源和文档；构建产物由发布流程交付。

## 版本与发布证据

以下为截至 **2026-11-12** 的验收记录。它不表示阅读当天再次完成线上核验，也不表示正式 NAS 已升级。

| 版本 | 状态 | 菜鸟浏览器 |
| --- | --- | --- |
| [0.15.6](https://github.com/907609732/lingtu-ecommerce-workbench/releases/tag/v0.15.6) | 最近一次实机核验的正式安装版本 | 销售与经营总览分别保留登录资料 |
| 0.15.7 | 已构建并归档到私有发布草稿，尚未安装到正式 NAS | 一个 Chromium 共用登录状态，各模块使用受控标签页 |

0.15.7 候选包软件提交：`aa6218c2f004c98b609b7ce97b91c91b55ef4ead`。[完整构建](https://github.com/907609732/lingtu-ecommerce-workbench/actions/runs/43155768567)有 962 项通过、0 项失败、3 项条件跳过，并通过干净运行环境验收。[归档任务](https://github.com/907609732/lingtu-ecommerce-workbench/actions/runs/43157591549)保留同次 FPK、对应源码及校验文件。安装后的局域网与远程入口复测仍待完成。

CI 通过不代表正式 NAS 已升级，也不代替真实平台账号采集验收。候选证据对应上述提交，不表示 0.15.7 源码已在 `main`，也不表示所有分支均已合并；分支与发布状态以实际 Git 历史和 Releases 为准。

## 授权说明

仓库根目录没有 `LICENSE` 文件，本 README 不声明 MIT 或其他开源许可证。第三方依赖、平台名称与图标遵循各自许可或权利声明；再利用代码或素材前，请先与权利人确认授权。

<p align="center"><sub>灵兔电商工作台 · 原生飞牛应用 <code>wuchengerp</code></sub></p>
