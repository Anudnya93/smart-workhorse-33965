# Generated by Django 3.2.12 on 2022-09-01 10:28

import business.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0012_attendance'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attendance',
            name='feedback_media',
            field=models.FileField(blank=True, null=True, upload_to=business.models.employee_directory_path, verbose_name='Feedback Media'),
        ),
        migrations.CreateModel(
            name='LeaveRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(blank=True, max_length=200, null=True)),
                ('request_type', models.CharField(blank=True, choices=[('PAID', 'PAID'), ('UNPAID', 'UNPAID'), ('SICK', 'SICK')], max_length=200, null=True, verbose_name='Request Type')),
                ('from_date', models.DateField(blank=True, null=True)),
                ('to_date', models.DateField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('PENDING', 'PENDING'), ('APPROVED', 'APPROVED'), ('DENY', 'DENY')], default='PENDING', max_length=200, verbose_name='Request Status')),
                ('admin_note', models.TextField(blank=True, null=True)),
                ('employee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='business.employee')),
            ],
            options={
                'verbose_name': 'Leave Request',
                'verbose_name_plural': 'Leave Requests',
            },
        ),
    ]
