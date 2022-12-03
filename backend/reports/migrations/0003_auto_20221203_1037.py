# Generated by Django 3.2.12 on 2022-12-03 10:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workside', '0014_alter_event_frequency'),
        ('reports', '0002_auto_20221015_1525'),
    ]

    operations = [
        migrations.AddField(
            model_name='inspectionreport',
            name='tasks',
            field=models.ManyToManyField(to='workside.Task'),
        ),
        migrations.DeleteModel(
            name='InspectionArea',
        ),
    ]
