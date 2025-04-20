from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from note_manager.models import Meeting
from note_manager.models.meeting import MeetingSchema


class NewMeetingView(APIView):

    def post(self, request) -> Response:
        
        try:
            meeting_details = MeetingSchema.model_validate(request.data)
            meeting = Meeting.create_meeting(meeting_details)
            return Response(meeting.serialize().model_dump(), status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
