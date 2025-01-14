from push_notification.services import create_notification
from smart_workhorse_33965.celery import app
from workside import models
from django.core.mail import send_mail
from smart_workhorse_33965.settings import DEFAULT_FROM_EMAIL
from workside.models import *


@app.task(name="event_publishing_reminder_task")
def event_publishing_reminder_task(event_id, reminder_date):
    from workside.models import Event
    event = Event.objects.filter(id=event_id)
    if event.exists():
        event = event.first()
        if event.event_status == "DRAFT":
            create_notification({
                "name": "Event Publish Reminder",
                "description": f'your worksite {event.worksite.name} event is schedule to published on this date:{event.start_time}',
                "user": event.worksite.business.user
            }
            )
            send_mail(
                'Event Publish Reminder',
                f'your worksite {event.worksite.name} event is schedule to published on this date:{event.start_time}',
                DEFAULT_FROM_EMAIL,
                [event.worksite.business.user.email],
                fail_silently=False,
            )


@app.task(name="event_start_notification_task")
def event_start_notification_task(start_time, employees, worksite_id):
    from workside.models import WorkSite
    worksite = WorkSite.objects.get(id=worksite_id)
    employees = Employee.objects.filter(id__in=employees)
    for employee in employees:
        create_notification({
            "name": "Event Started",
            "description": f'{worksite.name} event is started plz ClockIn.',
            "user": employee.user
        }
        )