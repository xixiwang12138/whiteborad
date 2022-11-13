import pymysql
from datetime import datetime


class DishonestListPipeline(object):

    def open_spider(self, spider):
        # 创建数据链接
        self.connect = pymysql.connect(host="127.0.0.1", user="root", password="root",
                                       db="dishonest", port=3306)
        # 获取执行SQL的cursor
        self.cursor = self.connect.cursor()

    def process_item(self, item, spider):
        # 根据证件号, 数据条数
        select_sql = "select count(1) from dishonest where card_num='{}'".format(item['card_num'])
        # 执行查询SQL
        self.cursor.execute(select_sql)
        # 获取查询结果
        count = self.cursor.fetchone()[0]
        # 如果查询的数量为0, 说明该人不存在, 不存在就插入
        if count == 0:
            # 获取当前的时间, 为插入数据库的时间
            item['create_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            item['update_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            # 把数据转换为键, 值的格式, 方便插入数据库
            keys, values = zip(*dict(item).items())
            # 插入数据库SQL
            insert_sql = 'insert into dishonest ({}) values({})'.format(
                ','.join(keys),
                ','.join(['%s'] * len(values))
            )
            # 执行插入数据SQL
            self.cursor.execute(insert_sql, values)
            # 提交
            self.connect.commit()
        else:
            spider.logger.info('{}  重复'.format(item))

        return item

    def close_spider(self, spider):
        # 释放游标
        self.cursor.close()
        # 释放链接
        self.connect.close()

DEFAULT_REQUEST_HEADERS = {
    'Referer': 'https://www.baidu.com/s',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
}



ITEM_PIPELINES = {
    'dishonest_list.pipelines.DishonestListPipeline': 300,
}

# 开启下载器中间件
DOWNLOADER_MIDDLEWARES = {
    'dishonest_list.middlewares.ProxyMiddleware': 543,
    'dishonest_list.middlewares.RandomUserAgent': 600,
}
# 配置重试次数, 当使用不稳定代理的时候,可能会导致请求失败
RETRY_TIMES = 6

if __name__ == '__main__':
    pipeline = DishonestListPipeline()
    pipeline.open_spider('xx')
    item = {
        'card_num': '12345'
    }
    pipeline.process_item(item, '')
