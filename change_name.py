import json
import os
import difflib
from urllib.parse import urlparse

# 配合json文件使用，修改文献文件名

def extract_pdf_filename(url):
    """从URL中提取文件名"""
    parsed_url = urlparse(url)
    # print(parsed_url)
    return os.path.basename(parsed_url.path)

def rename_files(json_file, download_folder):
    with open(json_file, 'r') as f:
        data = json.load(f)


    # 遍历JSON中的文件信息
    for item in data:
        url = item['url']
        if url is None:
            continue
        correct_filename = item['filename']
        
        # 从URL中提取文件名（如2401.02955v2.pdf）
        actual_filename = extract_pdf_filename(url)

        # 获取下载文件夹中的所有文件
        downloaded_files = os.listdir(download_folder)

        # 使用模糊匹配找到最接近的文件名
        best_match = difflib.get_close_matches(actual_filename, downloaded_files, n=1)

        if best_match:
            # 如果找到匹配的文件名，将其重命名
            try:
                old_filepath = os.path.join(download_folder, best_match[0])
                new_filepath = os.path.join(download_folder, correct_filename)

                os.rename(old_filepath, new_filepath)
                print(f'Renamed: {best_match[0]} to {correct_filename}')
                print('\n')
            except Exception as e:
                print(f"Error renaming {best_match[0]} to {correct_filename}: {e}")
                print('\n')
        else:
            print(f"No match found for {actual_filename}")
            print('\n')

# 示例用法
json_file = 'ICML 2024/download_records.json'  # JSON文件路径
download_folder = 'ICML 2024'  # 下载文件夹路径

rename_files(json_file, download_folder)