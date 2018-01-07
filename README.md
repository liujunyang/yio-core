# yio-core

关于 [`commander`](https://github.com/liujunyang/yio-core/issues/1)

`init` 时将脚手架下文件夹 `project-template` 中的某个 quickstart 复制到用户 `init`（或 `run` 会默认进行 `init`） 时所在的文件夹中。
`run` 时将用户当前文件夹中的文件符号链接到 `/Users/liujunyang/.yio/scaffold/yio-scaffold-pure/workspace/0a80654c0f96263b53e665204694048f/test` 中（最后一个test为我执行 `run` 的当前文件夹）。