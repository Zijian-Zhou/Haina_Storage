# HaiNa Storage: A Novel Decentralized Storage System （Web Engineering Version）

# 海纳存储：一种新型去中心化云存储系统(Web工程版)


---

 
 
This repository is the actual use of the engineering version of Haina storage, only for learning and research use. The related technology has been authorized with Chinese copyright and patent protection.
 
 
 
 

本仓库为海纳存储可实际使用的工程版本，仅供学习与研究使用。相关技术已授中国版权和专利保护。


You can access the operation video on Youtube: [https://youtu.be/2b8JMqvZV60](https://youtu.be/2b8JMqvZV60)

# Introdution (简介)

This engineering prototype is developed from ``Django``, consequently, you do need to start the program as ``Django`` requires.

该工程原型根据``Django``框架开发，因此您需要安装``Django``的启动流程进行项目的启动操作。

# Preparation (准备工作)

You need install ``mysql`` and ``pymysql`` lib. After that, edit the 110th to 119th lines in the configuration file [settings.py](/HNS_DFS/settings.py).

您需要提前安装``mysql``数据库并安装``pymysql``库。其次， 修改配置文件[settings.py](/HNS_DFS/settings.py)的第110至119行。

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'hns',
        'HOST': '127.0.0.1',
        'PORT': 3306,
        'USER': 'root',
        'PASSWORD': 'root',
    }
}
```

# Runing (运行)

## First Step (第一步)

First, you need to run the database generation operation.

首先，您需要进行数据库表生成操作。
```shell
python manage.py makemigrations
```
```python
python manage.py migrate
```

## Second Step (第二步)

Open the ``strosys_nodes`` table in your database and insert the node records as follows. You can change the port if you want.

打开数据库中的``strosys_nodes``表，按照如下示例完成所有节点记录插入。

```shell

| id | name | is_alive |
| 1  | 192.168.1.2:8000 | 1 | # if ip based
| 2  | n1.example.com:8000 | 1 | # if domain name based
```

## Third Step (第三步)
Start the project.

启动服务。

```shell
python manage.py runserver <ip>:<port>
```
