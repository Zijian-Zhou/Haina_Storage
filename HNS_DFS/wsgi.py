"""
WSGI config for HNS_DFS project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

from HNS_DFS.settings import CORS_ORIGIN_WHITELIST
from strosys.models import Nodes

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HNS_DFS.settings')

application = get_wsgi_application()

