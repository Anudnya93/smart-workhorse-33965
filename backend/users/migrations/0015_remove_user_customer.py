# Generated by Django 3.2.12 on 2022-11-12 12:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_remove_user_subscription'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='customer',
        ),
    ]