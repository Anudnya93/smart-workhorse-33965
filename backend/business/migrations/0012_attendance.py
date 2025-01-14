# Generated by Django 3.2.12 on 2022-08-31 12:20

import business.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workside', '0009_auto_20220823_1634'),
        ('business', '0011_employee_profile_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attendance',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(blank=True, choices=[('CHECK_IN', 'CHECK_IN'), ('CHECK_OUT', 'CHECK_OUT')], max_length=200, null=True, verbose_name='Attendance Status')),
                ('notes', models.CharField(blank=True, max_length=2000, null=True)),
                ('notes_media', models.FileField(blank=True, null=True, upload_to=business.models.employee_directory_path, verbose_name='Attendance Note Media')),
                ('feedback', models.CharField(blank=True, max_length=2000, null=True)),
                ('feedback_media', models.FileField(blank=True, null=True, upload_to=business.models.employee_directory_path, verbose_name='Attendance Note Media')),
                ('urgent', models.BooleanField(default=False)),
                ('clock_in_time', models.DateTimeField(blank=True, null=True)),
                ('clock_out_time', models.DateTimeField(blank=True, null=True)),
                ('total_hours', models.DecimalField(blank=True, decimal_places=1, max_digits=200, null=True)),
                ('completed_tasks', models.ManyToManyField(blank=True, to='workside.Task')),
                ('employee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='business.employee')),
                ('event', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='workside.event')),
            ],
            options={
                'verbose_name': 'Attendance',
                'verbose_name_plural': 'Attendance',
            },
        ),
    ]

