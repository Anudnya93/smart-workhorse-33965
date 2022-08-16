# Generated by Django 3.2 on 2022-08-15 09:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_auto_20220812_1405'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='gender',
            field=models.CharField(blank=True, choices=[('MALE', 'MALE'), ('FEMALE', 'FEMALE'), ('GENDERLESS', 'GENDERLESS')], max_length=200, null=True, verbose_name='Gender of User'),
        ),
    ]