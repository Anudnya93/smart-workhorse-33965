# Generated by Django 3.2 on 2022-08-05 15:58

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('business', '0003_auto_20220804_1740'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='business_code',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Business Code'),
        ),
        migrations.AddField(
            model_name='business',
            name='employe_types',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='How do you refer to your employees'),
        ),
        migrations.AddField(
            model_name='business',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        )
    ]