"""HNS_DFS URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_vi       ew(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from strosys import views
from django.urls import path

urlpatterns = [
    # login path
    path('login/', views.login.as_view()),
    # register path
    path('register/', views.test.as_view()),
    # visual interface
    path('decentralized_disk/', views.test.as_view()),
    # block_find
    path('checkblock/', views.find_block.as_view()),
    # block_find by a Beginner
    path('checkblock/find/', views.find_block_network.as_view()),
    # download block
    path('download/', views.download.as_view()),
    # delete block
    path('deleteblock/', views.delete_block.as_view()),
    # receive election
    path('election/', views.election.as_view()),
    # get NODES file
    path('nodes/<op_name>/', views.nodes.as_view()),
    path('nodes/', views.nodes.as_view()),
    # upload
    path('upload/<op_name>/', views.upload.as_view()),
    path('upload/', views.upload.as_view()),
    # test
    path('test/', views.test.as_view()),
    path('disk-test/', views.disk_test.as_view()),
    # default
    path('', views.login.as_view()),
]
