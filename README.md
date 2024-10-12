# 简单介绍
这段代码是一个 Tampermonkey 用户脚本，用于自动化下载与特定关键词相关的学术论文
找到某会议的paperList，自动获取与关键词相关的所有paper title并自动从google scholar查找下载pdf，成功率约85%
代码运行结束后会在页面最下方生成一个json文件，配合change_name.py可以批量修改论文文件名

# 使用方法
1. 修改@match为你的paperList网页链接
2. 修改var keyword为你的关键词
3. 修改links，query到paper title的节点
4. 修改btnparent，设置按钮放置位置

# 注意事项
1. 确保浏览器设置点击PDF自动下载，设置下载位置以修改正确，设置允许paperlist网页批量下载文件
2. 代码运行结束后会在页面最下方生成一个json文件，配合change_name.py可以批量修改论文文件名
3. 仅可用于少量论文下载，下载量过大可能触发google的反爬虫机制
4. 修改searchUrl可以从arxiv下载
5. 可以调整sleep时间，但最短应大于3s，否则可能触发反爬虫机制

# 改进方向
1. 尝试直接用GM_download下载，但总是失败，于是改成模拟点击+收集信息修改文件名的方式，如果找到解决方式或许不需要另一脚本进行修改文件名了
2. `const pdfLinkElement = doc.querySelector('a[href*="/pdf/"], a[href*=".pdf"]');` 中元素选择器可以改进，目前部分文献链接在google scholar中但无法被识别，但我这次已经完工了，懒得改了，下次如果还有这种需求可以想想该咋加





