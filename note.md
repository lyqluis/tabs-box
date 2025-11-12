# DRAFT

- 两个 tree 列表
- 都有 checkbox
- [ ] 如何从左侧到右侧添加tab/window/collection？
  - 如果冲突数组存在同名/id/hash/的collection，标为conflict属性为另一个的id
  - selected list记录选中目标，不去获取最大根元素
  - 通过selected item的collection.conflict来找到目标
  - ? 如何寻找目标终点？如果要移动一个window或者tabs
- [ ] 点击左侧展开，如果存在conflict，那么右侧一同展开
- [ ] tree 展示window数量和tab数量

# UI

- 把文件导入和文件内容展示合并到一起，节省文件内容展示的高度

# TODO

- [ ] compare collections
- [ ] select tabs/windows/collections
- [ ] move tabs/windows/collections
- [ ] checked window/collection, sub item should be checked
- [ ] checked maybe set to data, convenient to set both checkbox ui and data
