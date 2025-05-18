from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pydantic import BaseModel

from note_manager.models import Meeting 



class MeetingDetailsView(APIView):

    def get(self, request , meeting_id: int) -> Response:

        try:
            meeting = Meeting.get_meeting(meeting_id=meeting_id)
            return Response(meeting.serialize().model_dump(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
