from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from home.models import TimeStampedModel
from cities_light.abstract_models import (AbstractCity, AbstractRegion,
                                          AbstractCountry, AbstractSubRegion)
from cities_light.receivers import connect_default_signals

from business.constants import BusinessPayFrequency, AttendanceStatus, RequestStatus, RequestType

User = get_user_model()


class Country(AbstractCountry):
    pass


class SubRegion(AbstractSubRegion):
    pass


class Region(AbstractRegion):
    pass


class City(AbstractCity):
    timezone = models.CharField(max_length=40)


connect_default_signals(Country)
connect_default_signals(Region)
connect_default_signals(City)
connect_default_signals(SubRegion)


def user_directory_path(instance, filename):
    return 'user/{0}/{1}'.format(instance.user.id, filename)


def business_directory_path(instance, filename):
    return 'business/{0}/{1}'.format(instance.id, filename)


def employee_directory_path(instance, filename):
    return 'employee/{0}/{1}'.format(instance.id, filename)


class Business(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(_("Business Name"), blank=True, null=True, max_length=255)
    profile_image = models.FileField(_('Profile Picture'), upload_to=business_directory_path, null=True, blank=True)
    pay_frequency = models.CharField(
        _('Business Pay Frequency'), max_length=255, blank=True, null=True,
        choices=[(type.value, type.value) for type in BusinessPayFrequency]
    )
    business_code = models.CharField(_('Business Code'), max_length=255, blank=True, null=True)
    employe_types = models.CharField(_('How do you refer to your employees'), max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Business"
        verbose_name_plural = "Business"

    def __str__(self):
        return f'{self.name}'


class BusinessAddress(TimeStampedModel):
    business = models.OneToOneField(Business, on_delete=models.CASCADE, related_name="business_address")
    address_line_one = models.TextField(null=True, blank=True)
    address_line_two = models.TextField(null=True, blank=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE, null=True, blank=True)
    state = models.ForeignKey(Region, on_delete=models.CASCADE, null=True, blank=True)
    zipcode = models.CharField(_("ZipCode"), blank=True, null=True, max_length=255)

    class Meta:
        verbose_name = "Business Address"
        verbose_name_plural = "Business Address"

    def __str__(self):
        return f'{self.business.name}'


class Employee(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, null=True, blank=True)
    profile_image = models.FileField(_('Profile Picture'), upload_to=employee_directory_path, null=True, blank=True)
    mobile = PhoneNumberField(null=True, blank=True)
    address_line_one = models.TextField(null=True, blank=True, )
    address_line_two = models.TextField(null=True, blank=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE, null=True, blank=True)
    position = models.CharField(max_length=20, null=True, blank=True)
    hourly_rate = models.IntegerField(default=0)
    is_owner = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

    def __str__(self):
        return f'{self.user.email}'


class EmergencyContact(TimeStampedModel):
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    phone = PhoneNumberField(null=True, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="emergency_contact")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "EmergencyContact"
        verbose_name_plural = "EmergencyContact"

    def __str__(self):
        return f'{self.employee.user.first_name} - {self.employee.user.last_name}'


class Attendance(TimeStampedModel):
    status = models.CharField(
        _("Attendance Status"),
        max_length=200,
        choices=AttendanceStatus.choices(),
        null=True, blank=True
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True)
    event = models.ForeignKey('workside.Event', on_delete=models.CASCADE, null=True, blank=True)
    completed_tasks = models.ManyToManyField('workside.Task', blank=True)
    notes = models.CharField(max_length=2000, null=True, blank=True)
    notes_media = models.FileField(_('Attendance Note Media'), upload_to=employee_directory_path, null=True, blank=True)
    feedback = models.CharField(max_length=2000, null=True, blank=True)
    feedback_media = models.FileField(_('Feedback Media'), upload_to=employee_directory_path, null=True, blank=True)
    urgent = models.BooleanField(default=False)
    clock_in_time = models.DateTimeField(null=True, blank=True)
    clock_out_time = models.DateTimeField(null=True, blank=True)
    total_hours = models.DecimalField(max_digits=200, decimal_places=1, null=True, blank=True)

    class Meta:
        verbose_name = "Attendance"
        verbose_name_plural = "Attendance"

    def __str__(self):
        return f'{self.employee.user.first_name} - {self.employee.user.last_name}'


class LeaveRequest(TimeStampedModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200, null=True, blank=True)
    request_type = models.CharField(
        _("Request Type"),
        max_length=200,
        choices=RequestType.choices(),
        null=True, blank=True
    )
    from_date = models.DateField(null=True, blank=True)
    to_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(
        _("Request Status"),
        max_length=200,
        choices=RequestStatus.choices(),
        default='PENDING'
    )
    admin_note = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = "Leave Request"
        verbose_name_plural = "Leave Requests"

    def __str__(self):
        return f'{self.employee.user.first_name} - {self.employee.user.last_name}'