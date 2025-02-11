from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from push_notification.models import Notification
from push_notification.serializers import NotificationSerializer
from django_filters import rest_framework as filters
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response


class NotificationViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.filter()
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ['user', 'is_read']

    def get_queryset(self):
        queryset = self.queryset.filter(
            user=self.request.user
        ).order_by("-created_at")
        return queryset

    @action(detail=False, methods=['GET'])
    def read_notification(self, request):
        Notification.objects.filter(
            id=request.GET.get("id")
        ).update(is_read=True)
        return Response({"message": "Notification status updated"}, status=status.HTTP_201_CREATED)
