# Generated by Django 2.2.28 on 2022-08-07 08:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0005_auto_20220807_0736'),
    ]

    operations = [
        migrations.RenameField(
            model_name='business',
            old_name='employe_types',
            new_name='employee_types',
        ),
    ]