# DRAFT

- 把文件导入和文件内容展示合并到一起，节省文件内容展示的高度
- 转移
  - ui: 先选择要移动的tab/window/collection，点击移动按钮，另一边进入选择模式，选择完成，点击确定进行移动
  - [ ] 如何从左侧到右侧添加tab/window/collection？
    - 如果冲突数组存在同title/id/hash/的collection，标为conflict属性为另一个的id
    - 通过selected item的collection.conflict来找到目标
- selected list: 记录选中目标，获取最大根元素collection放入list
  - 永远记录collection；移动的时候计算checked tab/window
  - [?] if check tab/window，额外记录一个window序号
- each operator has its own selected list
- expand: 点击左侧展开，如果存在conflict，那么右侧一同展开
- [ ] add conflict/new style in tab

# UI

- 两个 tree 列表
- 都有 checkbox
- tree 展示window数量和tab数量

# TODO

- [x] compare collections
- [x] select tabs/windows/collections
- [x] move tabs/windows/collections
- [x] checked window/collection, sub item should be checked
- [x] checked maybe set to data, convenient to set both checkbox ui and data
- [x] delete tab/window/collection
- [x] export tree
  - use wrapped-collection.windows to replace data.windows; same to wrapped-window.tabs
- [x] UI: merge import area inside the tree area

# BUG

- [x] wrapped collectin.data.windows still has `raw` and `extra`, tab is the same
- [x] click check box, will open conflict tree
- [?] after hot reload, conflict expand not work
- [x] expand conflict on the left side always not work
