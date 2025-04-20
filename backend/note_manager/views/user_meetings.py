from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from note_manager.models import Meeting
from note_manager.models.meeting import MeetingSchema


class UserMeetingsView(APIView):

    def get(self, request) -> Response:

        try:
            meetings = Meeting.objects.all().order_by('start_time')
            return Response([meeting.serialize().model_dump() for meeting in meetings], status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
