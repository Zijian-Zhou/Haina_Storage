from django.db import models


# Block's hash maps to logical location.
class Block_file_map(models.Model):
    # block hash value
    hash = models.CharField(primary_key=True, max_length=80)
    # logical location
    path = models.TextField(null=True)
    # delete_token
    token = models.CharField(max_length=80)


# Nodes file
class Nodes(models.Model):
    # node name
    name = models.TextField(null=True)
    # alive
    is_alive = models.IntegerField(default=1)


# Modified CSRF_TOKEN
class Csrf_token(models.Model):
    # original data
    value = models.TextField(null=False)
    # Hash of value
    hash = models.TextField(null=False, max_length=80)
    # User location
    loc = models.TextField(null=False)
    # Path
    path = models.TextField(null=False)
    """# Time
    time = models.TextField(null=True)"""
