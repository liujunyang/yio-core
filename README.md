# yio-core

## 关于命令行 `-` `--`
在命令行中，参数带一个 `-`, 表示这是一个简写的参数，如 `npm -v`, 用 `-` 而且是多个字母的话是表示多个参数，如 `-ab` 其实表示的是 `-a` `-b`。如果要写多个字母而表示是一个参数的话，要用 `--`, 如 `npm --version`。

[`Short flags may be passed as a single arg, for example -abc is equivalent to -a -b -c. Multi-word options such as "--template-engine" are camel-cased, becoming program.templateEngine etc.`](https://github.com/tj/commander.js/)

## 关于 [`commander`](https://github.com/tj/commander.js/)
### 构造函数
引入模块 `let commander = require('commander')` 得到的是一个 `Command` 实例，构造函数的原型链上有 `command` 方法（注意这个是小写 c）。在该方法中，会新建一个 `Command` 实例，并把该实例放入 `commander.commands` 数组中，并在该方法的最后返回新的子实例，所以可以链式调用。


`Command` 构造函数
```js
function Command(name) {
  this.commands = [];
  this.options = [];
  this._execs = {};
  this._allowUnknownOption = false;
  this._args = [];
  this._name = name || '';
}
```

`Command` 构造函数的 `command` 方法
```js
Command.prototype.command = function(name, desc, opts) {
  if(typeof desc === 'object' && desc !== null){
    opts = desc;
    desc = null;
  }
  opts = opts || {};
  var args = name.split(/ +/);
  var cmd = new Command(args.shift());

  if (desc) {
    cmd.description(desc);
    this.executables = true;
    this._execs[cmd._name] = true;
    if (opts.isDefault) this.defaultExecutable = cmd._name;
  }
  cmd._noHelp = !!opts.noHelp;
  this.commands.push(cmd);
  cmd.parseExpectedArgs(args);
  cmd.parent = this;

  if (desc) return this;
  return cmd;
};
```

即：
* 每次调用 `commander.command()` 方法会创建一个新的 `Command` 实例。该实例还能继续执行 `command()` 方法不断的建立子命令下去。
* 新建一个命令监听需要新调用一次 `commander.command()` 方法。
* 每次建一个命令就在该命令后面链式处理它的 `action` 回调函数注册。
* `commander.parse(process.argv)` 只需要执行一次即可，因为命令之间有 `parent` `this.commands = []` 来联系，TJ 做了内部处理。

### 原型链上的 `option()` 方法调用的 `Option()` 构造函数
可见：
* `.option('-p, --peppers', 'Add peppers')` 中的逗号可以用 空格 或 | 替代。

```js
function Option(flags, description) {
  this.flags = flags;
  this.required = ~flags.indexOf('<');
  this.optional = ~flags.indexOf('[');
  this.bool = !~flags.indexOf('-no-');
  flags = flags.split(/[ ,|]+/);
  if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
  this.long = flags.shift();
  this.description = description || '';
}
```

```js
Command.prototype.option = function(flags, description, fn, defaultValue) {
  var self = this
    , option = new Option(flags, description)
    , oname = option.name()
    , name = option.attributeName();

  ...
  ...

  return this;
};
```

`.option('-p, --peppers', 'Add peppers')` 后，`Command` 实例上得到的属性名字其实是后面的值，如本例中，是 `peppers`。

```js
Option.prototype.name = function() {
  return this.long
    .replace('--', '')
    .replace('no-', '');
};

Option.prototype.attributeName = function() {
  return camelcase( this.name() );
};
```
