// ==UserScript==
// @name         Scholar Paper Downloader and ICML
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Download papers from Google Scholar，以ICML为例
// @description  开启前确保浏览器设置点击PDF自动下载，设置下载位置以修改正确，运行结束后可在最下方下载json文件配合change_name.py修改文件名
// @author       rory
// @match        https://scholar.google.com/scholar/*
// @match        https://icml.cc/Conferences/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// ==/UserScript==

(function() {
    'use strict';

    // 关键词
    var keyword = 'active';
    var unfoundPDF = [];
    var downloadRecords = []; // 记录下载的 PDF 链接和文件名
    const links = document.querySelectorAll('.maincardBody'); // 获取所有文献标题
    const btnparent = document.querySelector('#main > div.container > div > div.col-sm-9'); //开启按钮放置位置的父节点设置

    const sleep = (time) => {
        return new Promise((resolve) => setTimeout(resolve, time));
    };

    // 提取文献标题的函数
    const extractPaperTitles = () => {
        
        let matchingTitles = [];
        for (let i = 0; i < links.length; i++) {
            let title = links[i].innerText.trim().toLowerCase();
            if (title.includes(keyword)) {
                matchingTitles.push(links[i].innerText.trim());
            }
        }
        return matchingTitles;
    };

    const simulateClickDownload = async(url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename; // 设置下载文件的名称
        link.target = "_blank"    // 新窗口打开，防止点击跳转导致文本暂停
        document.body.appendChild(link);
        link.click(); // 模拟用户点击

        downloadRecords.push({ url, filename });
        console.log(downloadRecords)
        await sleep(3000);

        document.body.removeChild(link); // 下载后移除链接
    };

    const searchAndDownloadFromScholar = async (title) => {
        const searchUrl = `https://scholar.google.com/scholar?hl=zh-CN&q=${encodeURIComponent(title)}`;

        console.log(`正在搜索文献: ${title} 在 Google Scholar 上`);

        // 使用 GM_xmlhttpRequest 获取 Google Scholar 搜索结果
        GM_xmlhttpRequest({
            method: 'GET',
            url: searchUrl,
            onload: function(response) {
                const htmlText = response.responseText;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');

                // 查找 PDF 下载链接
                const pdfLinkElement = doc.querySelector('a[href*="/pdf/"], a[href*=".pdf"]');
                if (pdfLinkElement) {
                    const pdfUrl = pdfLinkElement.href; // PDF 链接

                    // 下载文件并设置自定义文件名
                    const safeTitle = title.replace(/[:\/\\<>|?*"]/g, '_');
                    const filename = `${safeTitle}.pdf`;

                    simulateClickDownload(pdfUrl, filename);
                } else {
                    var url = null
                    console.log(`未找到文献: ${title} 的 PDF`);
                    downloadRecords.push({ url, title });
                    unfoundPDF.push(title);
                }
            },
            onerror: function(error) {
                console.error(`请求失败: ${title}`, error);
            }
        });
    };




    // 主下载函数
    const downloadPapers = async () => {
        const paperTitles = extractPaperTitles();
        console.log(`找到包含关键词的文献: ${paperTitles.length} 篇`);

        for (let i = 0; i < paperTitles.length; i++) {
            const title = paperTitles[i];
            console.log(`正在处理第${i}个文献: ${title}`);

            // 在 Google Scholar 上搜索并下载
            await searchAndDownloadFromScholar(title);
            await sleep(10000); // 每个请求间隔10秒
        }

        console.log("所有文献已处理完毕。");
        console.log("未找到的文献:", unfoundPDF);// 输出未找到的文献，这部分需要手动补充

        // 输出下载链接和文件名组成的 JSON 文件，后期配合change_name.py使用修改文件名
        const jsonOutput = JSON.stringify(downloadRecords, null, 2);
        console.log("下载记录:", jsonOutput);

        // 可以将 JSON 输出到文件或进行其他操作
        const blob = new Blob([jsonOutput], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'download_records.json';
        link.textContent = '点击这里下载 JSON 文件';
        document.body.appendChild(link);
        console.log('JSON 文件已准备好，可以下载。');
    };

    // 创建按钮，触发下载任务
    let btn = document.createElement("button");
    btn.innerHTML = "开始搜索并下载文献";
    
    btn.onclick = function() {
        downloadPapers();
    };
    parent.append(btn);
})();
