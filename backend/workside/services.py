import base64
from django.core.files.base import ContentFile
from workside.models import(
    WorkSite,
    Task,
    TaskAttachments
)
from business.models import (
    Business
)

def convert_file_from_bse64_to_blob(file):
    imgstr = file.split(';base64,')
    data = ContentFile(base64.b64decode(file), name='file.jpg')
    return data

def create_worksite(user, data):
    worksite = WorkSite.objects.create(
        **data['worksite_information'],
        **data['contact_person'],
        show_dtails = data['show_dtails'],
        logo = convert_file_from_bse64_to_blob(data['logo']),
        instruction_video = convert_file_from_bse64_to_blob(data['instruction_video']),
        business = Business.objects.get(user=user),   
    )
    return worksite

def update_worksite(user, data, instance):
    worksite = WorkSite.objects.filter(id=instance.id)
    worksite.update(
        **data['worksite_information'],
        **data['contact_person'],
        show_dtails = data['show_dtails'],
        logo = convert_file_from_bse64_to_blob(data['logo']),
        instruction_video = convert_file_from_bse64_to_blob(data['instruction_video']),
        business = Business.objects.get(user=user)
    )

def create_task(validated_data):
    task = Task.objects.create(
        worksite=validated_data['worksite'],
        name=validated_data['name'],
        description=validated_data['description'],
        notes = validated_data['notes'],
        priority=validated_data['priority'],
        frequency_of_task=validated_data['frequency_of_task']
    )
    for key,val in validated_data['files'].items():
        TaskAttachments.objects.create(task=task, file=convert_file_from_bse64_to_blob(val))
    return task

def create_task_attachement(validated_data):
    task_attachement = TaskAttachments.objects.create(
        task=Task.objects.get(id=validated_data['id']),
        file=convert_file_from_bse64_to_blob(validated_data['file'])
    )
    return task_attachement