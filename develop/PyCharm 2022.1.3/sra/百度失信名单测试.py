import requests as requests

headers = {
        'Referer': 'https://www.baidu.com/s',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
}

# 百度测试
url = 'https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?resource_id=6899&query=失信人名单&pn=0&ie=utf-8&oe=utf-8&format=json'
response = requests.get(url, headers=headers)
print(response.content.decode())